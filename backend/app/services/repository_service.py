"""Repository cloning, archive fetching, and workspace initialization."""

import io
import os
import shutil
import subprocess
import zipfile
from pathlib import Path
from typing import Optional

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import assert_safe_path, validate_repository_source
from app.core.workspace import Workspace, workspace_manager

logger = get_logger("repository_service")


class RepositoryService:
    """Handles secure fetching and staging of repositories into workspaces."""

    def clone_or_fetch(self, source: str, branch: Optional[str] = "main") -> tuple[Workspace, dict[str, str]]:
        """
        Ingests a repository from GitHub URL or local directory.
        Returns the Workspace instance and metadata dict.
        """
        meta = validate_repository_source(source)
        target_branch = branch or meta.get("default_branch", "main")

        # 1. Local directory source
        if meta["type"] == "local":
            local_path = Path(meta["clean_url"])
            ws = workspace_manager.create_workspace(prefix=f"local_{meta['repo']}")
            self._copy_local_repo(local_path, ws.path)
            meta["branch"] = "local"
            meta["commit"] = "local-working-tree"
            return ws, meta

        # 2. GitHub repository source
        ws = workspace_manager.create_workspace(prefix=f"gh_{meta['repo']}")
        success = False

        # Attempt A: Try git clone if git CLI is available
        if self._is_git_available():
            try:
                self._git_clone(meta["clean_url"], target_branch, ws.path)
                success = True
                meta["branch"] = target_branch
                meta["commit"] = self._get_git_commit(ws.path)
            except Exception as e:
                logger.warning(f"Git clone failed for {meta['clean_url']}: {e}. Falling back to zip download.")

        # Attempt B: Fallback to GitHub zip archive download
        if not success:
            try:
                self._download_github_zip(meta["owner"], meta["repo"], target_branch, ws.path)
                success = True
                meta["branch"] = target_branch
                meta["commit"] = f"zip-{target_branch[:7]}"
            except Exception as e:
                # Cleanup workspace if download fails
                ws.cleanup()
                raise RuntimeError(f"Failed to fetch repository '{source}': {e}")

        return ws, meta

    def _is_git_available(self) -> bool:
        """Checks if git CLI executable is available in PATH."""
        try:
            res = subprocess.run(["git", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=3)
            return res.returncode == 0
        except Exception:
            return False

    def _git_clone(self, url: str, branch: str, target_dir: Path) -> None:
        """Executes safe git clone with depth 1."""
        cmd = ["git", "clone", "--depth", "1", "--single-branch", "-b", branch, url, str(target_dir)]
        logger.info(f"Running git clone: {' '.join(cmd)}")
        git_env = {
            **os.environ,
            "GIT_TERMINAL_PROMPT": "0",
            "GCM_INTERACTIVE": "never",
        }
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15, env=git_env)
        if res.returncode != 0:
            err = res.stderr.decode("utf-8", errors="ignore").strip()
            raise RuntimeError(f"git clone failed with code {res.returncode}: {err}")

    def _get_git_commit(self, repo_dir: Path) -> str:
        """Retrieves short commit SHA."""
        try:
            git_env = {
                **os.environ,
                "GIT_TERMINAL_PROMPT": "0",
                "GCM_INTERACTIVE": "never",
            }
            res = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                cwd=str(repo_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5,
                env=git_env,
            )
            if res.returncode == 0:
                return res.stdout.decode().strip()
        except Exception:
            pass
        return "HEAD"

    def _download_github_zip(self, owner: str, repo: str, branch: str, target_dir: Path) -> None:
        """Downloads GitHub zip archive and extracts securely."""
        zip_urls = [
            f"https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip",
            f"https://github.com/{owner}/{repo}/archive/refs/heads/master.zip",
            f"https://codeload.github.com/{owner}/{repo}/zip/refs/heads/{branch}",
        ]

        client = httpx.Client(timeout=30.0, follow_redirects=True)
        resp = None
        for u in zip_urls:
            try:
                r = client.get(u)
                if r.status_code == 200:
                    resp = r
                    break
            except Exception as e:
                logger.warning(f"Error querying {u}: {e}")

        if not resp or resp.status_code != 200:
            raise RuntimeError(f"Could not download repository archive from GitHub. Status: {resp.status_code if resp else 'No response'}")

        # Extract zip safely preventing zip-slip
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            namelist = zf.namelist()
            if not namelist:
                raise ValueError("Zip archive is empty.")

            # Usually GitHub zips have a root directory like `repo-main/`
            root_prefix = namelist[0].split("/")[0] + "/"

            for member in zf.infolist():
                # Remove top-level archive directory
                rel_path = member.filename
                if rel_path.startswith(root_prefix):
                    rel_path = rel_path[len(root_prefix):]

                if not rel_path or rel_path.endswith("/"):
                    continue

                dest_file = assert_safe_path(target_dir, rel_path)
                dest_file.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member) as source_file, open(dest_file, "wb") as target_file:
                    shutil.copyfileobj(source_file, target_file)

        logger.info(f"Successfully extracted zip archive for {owner}/{repo} into {target_dir}")

    def _copy_local_repo(self, src: Path, dest: Path) -> None:
        """Copies source files from a local directory into workspace safely."""
        from app.core.security import is_safe_source_file

        for root, dirs, files in os.walk(src):
            rel_root = Path(root).relative_to(src)
            # Filter directories
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", "__pycache__", ".git")]

            for file in files:
                file_src = Path(root) / file
                if is_safe_source_file(file_src):
                    file_dest = dest / rel_root / file
                    file_dest.parent.mkdir(parents=True, exist_ok=True)
                    try:
                        shutil.copy2(file_src, file_dest)
                    except Exception as e:
                        logger.warning(f"Skipping file {file_src}: {e}")


repository_service = RepositoryService()
