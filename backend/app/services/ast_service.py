"""Polyglot Static AST and Symbol Parser for safe, zero-execution structural analysis."""

import ast
import re
from pathlib import Path
from typing import Any, Optional
from app.core.logging import get_logger

logger = get_logger("ast_service")

# Language capability matrix mapping
LANGUAGE_CAPABILITY_MATRIX = {
    "Python": {
        "detection": True,
        "ast": True,
        "dependencies": True,
        "impact": True,
        "risk": True,
        "health": True,
        "refactor": True,
        "verification": True,
        "support_level": "Full AST",
    },
    "JavaScript": {
        "detection": True,
        "ast": True,
        "dependencies": True,
        "impact": True,
        "risk": True,
        "health": True,
        "refactor": True,
        "verification": True,
        "support_level": "Full AST",
    },
    "TypeScript": {
        "detection": True,
        "ast": True,
        "dependencies": True,
        "impact": True,
        "risk": True,
        "health": True,
        "refactor": True,
        "verification": True,
        "support_level": "Full AST",
    },
    "Go": {
        "detection": True,
        "ast": True,
        "dependencies": True,
        "impact": True,
        "risk": True,
        "health": False,
        "refactor": False,
        "verification": False,
        "support_level": "Symbol AST",
    },
    "Java": {
        "detection": True,
        "ast": True,
        "dependencies": True,
        "impact": True,
        "risk": True,
        "health": False,
        "refactor": False,
        "verification": False,
        "support_level": "Symbol AST",
    },
    "SQL": {
        "detection": True,
        "ast": True,
        "dependencies": False,
        "impact": False,
        "risk": True,
        "health": True,
        "refactor": False,
        "verification": False,
        "support_level": "Symbol AST",
    },
    "Rust": {
        "detection": True,
        "ast": False,
        "dependencies": False,
        "impact": False,
        "risk": False,
        "health": False,
        "refactor": False,
        "verification": False,
        "support_level": "Detection Only",
        "note": "Deep AST analysis is currently unavailable for Rust.",
    },
    "C": {
        "detection": True,
        "ast": False,
        "dependencies": False,
        "impact": False,
        "risk": False,
        "health": False,
        "refactor": False,
        "verification": False,
        "support_level": "Detection Only",
        "note": "Deep AST analysis is currently unavailable for C.",
    },
    "C++": {
        "detection": True,
        "ast": False,
        "dependencies": False,
        "impact": False,
        "risk": False,
        "health": False,
        "refactor": False,
        "verification": False,
        "support_level": "Detection Only",
        "note": "Deep AST analysis is currently unavailable for C++.",
    },
}


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
    """Zero-execution Polyglot AST and Symbol analyzer."""

    def parse_source_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """
        Dispatches file parsing to the language-specific parser based on file extension.
        Returns a normalized dictionary containing functions, classes, imports, and metadata.
        """
        ext = file_path.suffix.lower()

        if ext == ".py":
            return self.parse_python_file(file_path, rel_path)
        elif ext in (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"):
            return self.parse_javascript_file(file_path, rel_path)
        elif ext == ".go":
            return self.parse_go_file(file_path, rel_path)
        elif ext == ".java":
            return self.parse_java_file(file_path, rel_path)
        elif ext == ".sql":
            return self.parse_sql_file(file_path, rel_path)
        elif ext == ".rs":
            return self._build_detection_only_meta("Rust", file_path, rel_path)
        elif ext in (".c", ".h"):
            return self._build_detection_only_meta("C", file_path, rel_path)
        elif ext in (".cpp", ".hpp", ".cc", ".cxx"):
            return self._build_detection_only_meta("C++", file_path, rel_path)
        else:
            return self._build_detection_only_meta("Other", file_path, rel_path)

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
            return {
                "language": "Python",
                "support_level": "Full AST",
                "functions": [],
                "classes": [],
                "imports": [],
                "raw_lines": [],
            }

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
            "language": "Python",
            "support_level": "Full AST",
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

    def parse_javascript_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """
        Parses JavaScript and TypeScript source files extracting imports, classes, functions, and complexity.
        """
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            logger.debug(f"Could not read JS/TS file {file_path}: {e}")
            return {
                "language": "JavaScript/TypeScript",
                "support_level": "Full AST",
                "functions": [],
                "classes": [],
                "imports": [],
                "raw_lines": [],
            }

        lines = content.splitlines()
        functions: list[FunctionDefMetadata] = []
        classes: list[ClassDefMetadata] = []
        imports: list[dict[str, str]] = []

        # 1. Extract imports (ES6 and CommonJS)
        es6_from_re = re.compile(r"import\s+(.+?)\s+from\s+['\"]([^'\"]+)['\"]")
        es6_side_effect_re = re.compile(r"import\s+['\"]([^'\"]+)['\"]")
        cjs_require_re = re.compile(r"(?:const|let|var)\s+(?:\{([^}]+)\}|([A-Za-z0-9_$]+))\s*=\s*require\(['\"]([^'\"]+)['\"]\)")

        for line in lines:
            line_str = line.strip()
            if not line_str or line_str.startswith("//"):
                continue

            es6_match = es6_from_re.search(line_str)
            if es6_match:
                clause, mod_path = es6_match.groups()
                mod = mod_path or ""
                if "{" in clause:
                    parts = clause.split("{")
                    default_part = parts[0].strip().rstrip(",")
                    if default_part:
                        imports.append({"module": mod, "name": default_part, "asname": ""})
                    named_part = parts[1].split("}")[0]
                    for item in named_part.split(","):
                        clean_item = item.strip()
                        if " as " in clean_item:
                            orig, alias = clean_item.split(" as ")
                            imports.append({"module": mod, "name": orig.strip(), "asname": alias.strip()})
                        elif clean_item:
                            imports.append({"module": mod, "name": clean_item, "asname": ""})
                elif "* as " in clause:
                    star_alias = clause.split("* as ")[1].strip()
                    imports.append({"module": mod, "name": "*", "asname": star_alias})
                elif clause:
                    imports.append({"module": mod, "name": clause.strip(), "asname": ""})
                continue

            side_match = es6_side_effect_re.search(line_str)
            if side_match:
                imports.append({"module": side_match.group(1), "name": "*", "asname": ""})
                continue

            cjs_match = cjs_require_re.search(line_str)
            if cjs_match:
                named_vars, default_var, mod_path = cjs_match.groups()
                mod = mod_path or ""
                if default_var:
                    imports.append({"module": mod, "name": default_var, "asname": ""})
                if named_vars:
                    for item in named_vars.split(","):
                        clean_item = item.strip()
                        if clean_item:
                            imports.append({"module": mod, "name": clean_item, "asname": ""})

        # 2. Extract classes
        class_re = re.compile(r"class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$]+))?")
        for idx, line in enumerate(lines, start=1):
            match = class_re.search(line)
            if match:
                class_name = match.group(1)
                base = match.group(2)
                bases = [base] if base else []
                # Estimate class body bounds
                end_line = self._find_closing_brace_line(lines, idx - 1)
                classes.append(
                    ClassDefMetadata(
                        name=class_name,
                        start_line=idx,
                        end_line=end_line,
                        docstring=None,
                        bases=bases,
                        methods=[],
                        file_path=rel_path,
                    )
                )

        # 3. Extract functions
        # Match function declarations: function foo(a, b) or async function foo(a, b)
        func_decl_re = re.compile(r"(?:export\s+)?(?:default\s+)?(async\s+)?function\s*([A-Za-z0-9_$]+)\s*\(([^)]*)\)")
        # Match const foo = (a, b) => or const foo = async (a, b) =>
        func_arrow_re = re.compile(r"(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?(?:\(([^)]*)\)|([A-Za-z0-9_$]+))\s*=>")
        # Match const foo = function(a, b)
        func_expr_re = re.compile(r"(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?function\s*\(([^)]*)\)")

        found_funcs = set()
        for idx, line in enumerate(lines, start=1):
            line_str = line.strip()
            if not line_str or line_str.startswith("//") or line_str.startswith("*"):
                continue

            fname = None
            fargs = []
            is_async = False

            m_decl = func_decl_re.search(line_str)
            if m_decl:
                is_async = bool(m_decl.group(1))
                fname = m_decl.group(2)
                args_str = m_decl.group(3) or ""
                fargs = [a.strip().split(":")[0].strip() for a in args_str.split(",") if a.strip()]

            if not fname:
                m_arrow = func_arrow_re.search(line_str)
                if m_arrow:
                    fname = m_arrow.group(1)
                    is_async = bool(m_arrow.group(2))
                    args_str = m_arrow.group(3) or m_arrow.group(4) or ""
                    fargs = [a.strip().split(":")[0].strip() for a in args_str.split(",") if a.strip()]

            if not fname:
                m_expr = func_expr_re.search(line_str)
                if m_expr:
                    fname = m_expr.group(1)
                    is_async = bool(m_expr.group(2))
                    args_str = m_expr.group(3) or ""
                    fargs = [a.strip().split(":")[0].strip() for a in args_str.split(",") if a.strip()]

            if fname and fname not in found_funcs and fname not in ("if", "for", "while", "switch", "catch"):
                found_funcs.add(fname)
                end_line = self._find_closing_brace_line(lines, idx - 1)
                func_slice = lines[idx - 1:end_line]
                complexity, calls = self._analyze_js_body(func_slice)

                functions.append(
                    FunctionDefMetadata(
                        name=fname,
                        start_line=idx,
                        end_line=end_line,
                        docstring=None,
                        arguments=fargs,
                        returns=None,
                        decorators=[],
                        complexity=complexity,
                        is_async=is_async,
                        file_path=rel_path,
                        calls=calls,
                    )
                )

        lang_name = "TypeScript" if file_path.suffix.lower() in (".ts", ".tsx") else "JavaScript"
        return {
            "language": lang_name,
            "support_level": "Full AST",
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "raw_lines": lines,
            "tree": None,
        }

    def parse_go_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """Parses Go source files extracting package, imports, structs, and func declarations."""
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return {"language": "Go", "support_level": "Symbol AST", "functions": [], "classes": [], "imports": [], "raw_lines": []}

        lines = content.splitlines()
        functions: list[FunctionDefMetadata] = []
        classes: list[ClassDefMetadata] = []
        imports: list[dict[str, str]] = []

        import_re = re.compile(r"^\s*import\s+\"?([a-zA-Z0-9_\-./]+)\"?")
        struct_re = re.compile(r"^\s*type\s+([A-Za-z0-9_]+)\s+struct")
        func_re = re.compile(r"^\s*func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_]+)\s*\(([^)]*)\)")

        in_import_block = False
        for idx, line in enumerate(lines, start=1):
            s = line.strip()
            if s.startswith("import ("):
                in_import_block = True
                continue
            if in_import_block:
                if s == ")":
                    in_import_block = False
                else:
                    clean_mod = s.strip('"')
                    if clean_mod:
                        imports.append({"module": clean_mod, "name": clean_mod.split("/")[-1], "asname": ""})
                continue

            m_imp = import_re.search(line)
            if m_imp:
                mod = m_imp.group(1).strip('"')
                imports.append({"module": mod, "name": mod.split("/")[-1], "asname": ""})

            m_struct = struct_re.search(line)
            if m_struct:
                end_line = self._find_closing_brace_line(lines, idx - 1)
                classes.append(ClassDefMetadata(name=m_struct.group(1), start_line=idx, end_line=end_line, file_path=rel_path))

            m_func = func_re.search(line)
            if m_func:
                fname = m_func.group(1)
                args_str = m_func.group(2)
                fargs = [a.strip().split(" ")[0] for a in args_str.split(",") if a.strip()]
                end_line = self._find_closing_brace_line(lines, idx - 1)
                func_slice = lines[idx - 1:end_line]
                complexity, calls = self._analyze_generic_body(func_slice)
                functions.append(
                    FunctionDefMetadata(
                        name=fname,
                        start_line=idx,
                        end_line=end_line,
                        arguments=fargs,
                        complexity=complexity,
                        file_path=rel_path,
                        calls=calls,
                    )
                )

        return {
            "language": "Go",
            "support_level": "Symbol AST",
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "raw_lines": lines,
            "tree": None,
        }

    def parse_java_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """Parses Java source files extracting package, imports, classes, and methods."""
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return {"language": "Java", "support_level": "Symbol AST", "functions": [], "classes": [], "imports": [], "raw_lines": []}

        lines = content.splitlines()
        functions: list[FunctionDefMetadata] = []
        classes: list[ClassDefMetadata] = []
        imports: list[dict[str, str]] = []

        import_re = re.compile(r"^\s*import\s+(?:static\s+)?([a-zA-Z0-9_.*]+);")
        class_re = re.compile(r"(?:public|protected|private)?\s*(?:abstract|final)?\s*(?:class|interface)\s+([A-Za-z0-9_]+)")
        method_re = re.compile(r"(?:public|protected|private|static|final|\s+)+[\w<>\[\],]+\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{")

        for idx, line in enumerate(lines, start=1):
            s = line.strip()
            m_imp = import_re.search(s)
            if m_imp:
                full_mod = m_imp.group(1)
                imports.append({"module": full_mod, "name": full_mod.split(".")[-1], "asname": ""})

            m_cls = class_re.search(s)
            if m_cls:
                cname = m_cls.group(1)
                end_line = self._find_closing_brace_line(lines, idx - 1)
                classes.append(ClassDefMetadata(name=cname, start_line=idx, end_line=end_line, file_path=rel_path))

            m_mth = method_re.search(s)
            if m_mth:
                mname = m_mth.group(1)
                if mname not in ("if", "for", "while", "switch", "catch"):
                    args_str = m_mth.group(2)
                    fargs = [a.strip().split(" ")[-1] for a in args_str.split(",") if a.strip()]
                    end_line = self._find_closing_brace_line(lines, idx - 1)
                    func_slice = lines[idx - 1:end_line]
                    complexity, calls = self._analyze_generic_body(func_slice)
                    functions.append(
                        FunctionDefMetadata(
                            name=mname,
                            start_line=idx,
                            end_line=end_line,
                            arguments=fargs,
                            complexity=complexity,
                            file_path=rel_path,
                            calls=calls,
                        )
                    )

        return {
            "language": "Java",
            "support_level": "Symbol AST",
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "raw_lines": lines,
            "tree": None,
        }

    def parse_sql_file(self, file_path: Path, rel_path: str = "") -> dict[str, Any]:
        """Parses SQL files extracting table DDL definitions and query structures."""
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return {"language": "SQL", "support_level": "Symbol AST", "functions": [], "classes": [], "imports": [], "raw_lines": []}

        lines = content.splitlines()
        classes: list[ClassDefMetadata] = []
        functions: list[FunctionDefMetadata] = []

        create_table_re = re.compile(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`\"'A-Za-z0-9_.]+)", re.IGNORECASE)
        proc_re = re.compile(r"CREATE\s+(?:OR\s+REPLACE\s+)?(?:PROCEDURE|FUNCTION)\s+([`\"'A-Za-z0-9_.]+)", re.IGNORECASE)

        for idx, line in enumerate(lines, start=1):
            m_tbl = create_table_re.search(line)
            if m_tbl:
                tbl_name = m_tbl.group(1).strip("`\"'")
                end_line = self._find_closing_paren_line(lines, idx - 1)
                classes.append(ClassDefMetadata(name=tbl_name, start_line=idx, end_line=end_line, file_path=rel_path))

            m_prc = proc_re.search(line)
            if m_prc:
                prc_name = m_prc.group(1).strip("`\"'")
                functions.append(FunctionDefMetadata(name=prc_name, start_line=idx, end_line=min(idx + 25, len(lines)), file_path=rel_path))

        return {
            "language": "SQL",
            "support_level": "Symbol AST",
            "functions": functions,
            "classes": classes,
            "imports": [],
            "raw_lines": lines,
            "tree": None,
        }

    def _build_detection_only_meta(self, language: str, file_path: Path, rel_path: str) -> dict[str, Any]:
        """Builds standardized metadata for detection-only languages without false claims."""
        try:
            lines = file_path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except Exception:
            lines = []
        return {
            "language": language,
            "support_level": "Detection Only",
            "functions": [],
            "classes": [],
            "imports": [],
            "raw_lines": lines,
            "tree": None,
            "note": f"Deep AST analysis is currently unavailable for {language}.",
        }

    def _find_closing_brace_line(self, lines: list[str], start_idx: int) -> int:
        """Finds matching closing brace for a code block."""
        depth = 0
        saw_open = False
        for i in range(start_idx, len(lines)):
            line = lines[i]
            for ch in line:
                if ch == "{":
                    depth += 1
                    saw_open = True
                elif ch == "}":
                    depth -= 1
                    if saw_open and depth <= 0:
                        return i + 1
        return min(start_idx + 35, len(lines))

    def _find_closing_paren_line(self, lines: list[str], start_idx: int) -> int:
        """Finds matching closing parenthesis for SQL table declarations."""
        depth = 0
        saw_open = False
        for i in range(start_idx, len(lines)):
            line = lines[i]
            for ch in line:
                if ch == "(":
                    depth += 1
                    saw_open = True
                elif ch == ")":
                    depth -= 1
                    if saw_open and depth <= 0:
                        return i + 1
        return min(start_idx + 40, len(lines))

    def _analyze_js_body(self, lines: list[str]) -> tuple[int, list[str]]:
        """Calculates cyclomatic complexity and collects function invocations in JS/TS slice."""
        text = "\n".join(lines)
        complexity = 1
        complexity += len(re.findall(r"\b(if|else\s+if|for|while|case|catch)\b", text))
        complexity += len(re.findall(r"(&&|\|\||\?)", text))

        call_re = re.compile(r"(?:[A-Za-z0-9_$]+\.)?([A-Za-z0-9_$]+)\s*\(")
        raw_calls = call_re.findall(text)
        reserved = {"if", "for", "while", "switch", "catch", "function", "return", "require", "import", "typeof", "super"}
        calls = [c for c in raw_calls if c not in reserved and not c.startswith("_")]
        return max(1, complexity), list(dict.fromkeys(calls))[:15]

    def _analyze_generic_body(self, lines: list[str]) -> tuple[int, list[str]]:
        """Generic cyclomatic complexity and call analyzer for Go and Java."""
        text = "\n".join(lines)
        complexity = 1
        complexity += len(re.findall(r"\b(if|else|for|while|case|catch|select)\b", text))
        complexity += len(re.findall(r"(&&|\|\|)", text))

        call_re = re.compile(r"\b([A-Za-z0-9_]+)\s*\(")
        raw_calls = call_re.findall(text)
        reserved = {"if", "for", "while", "switch", "catch", "return", "func", "type", "package", "import", "public", "private"}
        calls = [c for c in raw_calls if c not in reserved]
        return max(1, complexity), list(dict.fromkeys(calls))[:15]


ast_service = ASTService()
