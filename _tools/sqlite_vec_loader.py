"""
sqlite_vec_loader.py — Tiny helper around `sqlite-vec` loading.

Wraps the cross-platform nuances of enabling extension loading on an sqlite3
connection so build and validate scripts stay readable.

`sqlite-vec` ships as a PyPI wheel (`pip install sqlite-vec`). On the build
machine (and CI) it's an optional dependency — if it's missing, callers get a
clear "skipped" signal instead of a traceback.
"""
from __future__ import annotations

import sqlite3


def try_load(conn: sqlite3.Connection) -> tuple[bool, str]:
    """Attempt to load sqlite-vec onto `conn`. Returns (loaded, message).

    - (True, 'loaded') on success
    - (False, '<reason>') on any failure — the caller decides whether to
      treat this as fatal or a skip.
    """
    try:
        import sqlite_vec  # type: ignore
    except ImportError:
        return False, (
            'sqlite-vec package not installed — '
            'run `pip install sqlite-vec` to enable vector search'
        )

    try:
        conn.enable_load_extension(True)
    except AttributeError:
        return False, 'sqlite3 build lacks enable_load_extension'
    except sqlite3.NotSupportedError as e:
        return False, f'enable_load_extension not supported: {e}'

    try:
        sqlite_vec.load(conn)
    except Exception as e:  # noqa: BLE001 — surface any loader error
        conn.enable_load_extension(False)
        return False, f'sqlite_vec.load failed: {e}'

    conn.enable_load_extension(False)
    return True, 'loaded'
