"""Static Python AST Parser for safe, zero-execution structural analysis."""

import ast
from pathlib import Path
from typing import Any, Optional
from app.core.logging import get_logger

logger = get_logger("ast_service")


class FunctionDefMetadata:
    """Metadata describing a parsed function or method definition."""

    def __init__(
        self,
        name: str,
        start_line: int,
        end_line: int,
        docstring: Optional[str] = None,
        arguments: list[str] = None,
        returns: Optional[str] = None,
        decorators: list[str] = None,
        complexity: int = 1,
        is_async: bool = False,
        file_path: str = "",
        calls: list[str] = None,
    ):
        self.name = name
        self.start_line = start_line
        self.end_line = end_line
        self.docstring = docstring
        self.arguments = arguments or []
        self.returns = returns
        self.decorators = decorators or []
        self.complexity = complexity
        self.is_async = is_async
        self.file_path = file_path
        self.calls = calls or []

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "docstring": self.docstring,
            "arguments": self.arguments,
            "returns": self.returns,
            "decorators": self.decorators,
            "complexity": self.complexity,
            "is_async": self.is_async,
            "file_path": self.file_path,
            "calls": self.calls,
        }


class ClassDefMetadata:
    """Metadata describing a parsed class definition."""

    def __init__(
        self,
        name: str,
        start_line: int,
        end_line: int,
        docstring: Optional[str] = None,
        bases: list[str] = None,
        methods: list[str] = None,
        file_path: str = "",
    ):
        self.name = name
        self.start_line = start_line
        self.end_line = end_line
        self.docstring = docstring
        self.bases = bases or []
        self.methods = methods or []
        self.file_path = file_path

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "docstring": self.docstring,
            "bases": self.bases,
            "methods": self.methods,
            "file_path": self.file_path,
        }


class ASTService:
    """Zero-execution Python AST analyzer."""

    def parse_python_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """
        Parses a single Python file into AST metadata.
        Returns dict containing functions, classes, imports, and calls.
        """
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            tree = ast.parse(content, filename=str(file_path))
        except Exception as e:
            logger.debug(f"Could not parse AST for {file_path}: {e}")
            return {"functions": [], "classes": [], "imports": [], "raw_lines": []}

        lines = content.splitlines()
        functions: list[FunctionDefMetadata] = []
        classes: list[ClassDefMetadata] = []
        imports: list[dict[str, str]] = []

        for node in ast.walk(tree):
            # Parse imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append({"module": alias.name, "name": alias.name, "asname": alias.asname or ""})
            elif isinstance(node, ast.ImportFrom):
                mod = node.module or ""
                for alias in node.names:
                    imports.append({"module": mod, "name": alias.name, "asname": alias.asname or ""})

            # Parse classes
            elif isinstance(node, ast.ClassDef):
                bases = []
                for b in node.bases:
                    if isinstance(b, ast.Name):
                        bases.append(b.id)
                    elif isinstance(b, ast.Attribute):
                        bases.append(b.attr)

                methods = [m.name for m in node.body if isinstance(m, (ast.FunctionDef, ast.AsyncFunctionDef))]
                doc = ast.get_docstring(node)
                end_line = getattr(node, "end_lineno", node.lineno)
                classes.append(
                    ClassDefMetadata(
                        name=node.name,
                        start_line=node.lineno,
                        end_line=end_line,
                        docstring=doc,
                        bases=bases,
                        methods=methods,
                        file_path=rel_path,
                    )
                )

            # Parse functions
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                func_doc = ast.get_docstring(node)
                end_line = getattr(node, "end_lineno", node.lineno)
                args = [a.arg for a in node.args.args]
                ret_ann = None
                if node.returns:
                    if isinstance(node.returns, ast.Name):
                        ret_ann = node.returns.id
                    elif isinstance(node.returns, ast.Constant):
                        ret_ann = str(node.returns.value)

                decorators = []
                for d in node.decorator_list:
                    if isinstance(d, ast.Name):
                        decorators.append(d.id)
                    elif isinstance(d, ast.Attribute):
                        decorators.append(d.attr)
                    elif isinstance(d, ast.Call) and isinstance(d.func, (ast.Name, ast.Attribute)):
                        name = d.func.id if isinstance(d.func, ast.Name) else d.func.attr
                        decorators.append(name)

                # Measure cyclomatic complexity & extracted function calls
                complexity, calls = self._analyze_function_body(node)

                functions.append(
                    FunctionDefMetadata(
                        name=node.name,
                        start_line=node.lineno,
                        end_line=end_line,
                        docstring=func_doc,
                        arguments=args,
                        returns=ret_ann,
                        decorators=decorators,
                        complexity=complexity,
                        is_async=isinstance(node, ast.AsyncFunctionDef),
                        file_path=rel_path,
                        calls=calls,
                    )
                )

        return {
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "raw_lines": lines,
            "tree": tree,
        }

    def _analyze_function_body(self, func_node: ast.FunctionDef | ast.AsyncFunctionDef) -> tuple[int, list[str]]:
        """Calculates cyclomatic complexity and collects function invocations."""
        complexity = 1
        calls = []

        for subnode in ast.walk(func_node):
            if isinstance(subnode, (ast.If, ast.While, ast.For, ast.AsyncFor, ast.ExceptHandler, ast.With, ast.AsyncWith)):
                complexity += 1
            elif isinstance(subnode, ast.BoolOp):
                complexity += len(subnode.values) - 1
            elif isinstance(subnode, ast.Call):
                if isinstance(subnode.func, ast.Name):
                    calls.append(subnode.func.id)
                elif isinstance(subnode.func, ast.Attribute):
                    calls.append(subnode.func.attr)

        return complexity, calls


ast_service = ASTService()
