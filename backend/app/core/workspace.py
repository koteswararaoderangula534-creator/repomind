"""Workspace lifecycle management for isolated repository analysis."""

import os
import shutil
import tempfile
import time
import uuid
from pathlib import Path
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("workspace")


class Workspace:
    """Represents an isolated filesystem workspace for an analyzed repository."""

    def __init__(self, workspace_id: str, path: Path, is_temp: bool = True):
        self.id = workspace_id
        self.path = path
        self.is_temp = is_temp
        self.created_at = time.time()
        self.last_accessed = time.time()

    def touch(self) -> None:
        """Update last accessed timestamp."""
        self.last_accessed = time.time()

    def cleanup(self) -> None:
        """Removes workspace files if temporary."""
        if self.is_temp and self.path.exists():
            try:
                shutil.rmtree(self.path, ignore_errors=True)
                logger.info(f"Cleaned up temporary workspace: {self.id} ({self.path})")
            except Exception as e:
                logger.warning(f"Error cleaning workspace {self.id}: {e}")


class WorkspaceManager:
    """In-memory workspace registry with lifecycle tracking."""

    def __init__(self):
        self._workspaces: dict[str, Workspace] = {}
        settings.WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)

    def create_workspace(self, prefix: str = "repo") -> Workspace:
        """Creates a new isolated temporary workspace directory."""
        ws_id = f"{prefix}-{uuid.uuid4().hex[:8]}"
        temp_dir = Path(tempfile.mkdtemp(prefix=f"repomind_{ws_id}_", dir=settings.WORKSPACE_DIR))
        workspace = Workspace(workspace_id=ws_id, path=temp_dir, is_temp=True)
        self._workspaces[ws_id] = workspace
        logger.info(f"Created workspace {ws_id} at {temp_dir}")
        return workspace

    def register_existing(self, path: Path, ws_id: str | None = None) -> Workspace:
        """Registers a local directory as a non-temporary workspace."""
        if not ws_id:
            ws_id = f"local-{path.name.lower()[:20]}"
        workspace = Workspace(workspace_id=ws_id, path=path.resolve(), is_temp=False)
        self._workspaces[ws_id] = workspace
        return workspace

    def get_workspace(self, workspace_id: str) -> Workspace | None:
        """Retrieves an active workspace by ID."""
        ws = self._workspaces.get(workspace_id)
        if ws:
            ws.touch()
        return ws

    def cleanup_workspace(self, workspace_id: str) -> bool:
        """Cleans up and deregisters a workspace."""
        ws = self._workspaces.pop(workspace_id, None)
        if ws:
            ws.cleanup()
            return True
        return False

    def cleanup_all(self) -> None:
        """Cleans up all tracked temporary workspaces."""
        for ws_id, ws in list(self._workspaces.items()):
            ws.cleanup()
        self._workspaces.clear()


workspace_manager = WorkspaceManager()
