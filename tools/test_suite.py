"""Aggregate tests from non-package tool directories for root discovery.

``unittest discover -s tools`` already descends into package directories such
as ``item`` and ``rig``.  It deliberately ignores directories without an
``__init__.py``.  This module is discovered at the tools root and supplies the
missing suites through ``load_tests`` without changing those directories into
packages.
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path


TOOLS_ROOT = Path(__file__).resolve().parent
TEST_PATTERN = "test_*.py"


def _owned_by_package(test_file: Path) -> bool:
    """Return whether normal root discovery already owns this test."""
    if test_file.parent == TOOLS_ROOT:
        return True
    parents = []
    for parent in test_file.parents:
        if parent == TOOLS_ROOT:
            break
        parents.append(parent)
    return bool(parents) and all((parent / "__init__.py").is_file() for parent in parents)


def _flat_test_directories() -> tuple[Path, ...]:
    """Find non-package directories containing tests, once per directory."""
    this_file = Path(__file__).resolve()
    directories = {
        test_file.parent
        for test_file in TOOLS_ROOT.rglob(TEST_PATTERN)
        if test_file.resolve() != this_file and not _owned_by_package(test_file)
    }
    return tuple(sorted(directories, key=lambda path: path.relative_to(TOOLS_ROOT).as_posix()))


def load_tests(
    loader: unittest.TestLoader,
    tests: unittest.TestSuite,
    pattern: str | None,
) -> unittest.TestSuite:
    """Add each otherwise-invisible directory as its own discovery root."""
    tools_path = str(TOOLS_ROOT)
    if tools_path not in sys.path:
        # Needed by imports such as ``balance.meridian_flow_sim``.
        sys.path.insert(0, tools_path)

    combined = loader.suiteClass()
    combined.addTests(tests)
    for directory in _flat_test_directories():
        directory_loader = unittest.TestLoader()
        combined.addTests(directory_loader.discover(
            start_dir=str(directory),
            pattern=pattern or TEST_PATTERN,
            top_level_dir=str(directory),
        ))
    return combined
