#!/usr/bin/env python
"""Start the production ASGI server without relying on shell expansion."""

import os
import sys


def get_port() -> str:
    raw_port = os.getenv('PORT', '8000').strip()
    try:
        port = int(raw_port)
    except ValueError as exc:
        raise SystemExit(f'PORT must be a number, received {raw_port!r}.') from exc
    if not 1 <= port <= 65535:
        raise SystemExit(f'PORT must be between 1 and 65535, received {port}.')
    return str(port)


def main() -> None:
    os.execv(
        sys.executable,
        [sys.executable, '-m', 'daphne', '-b', '0.0.0.0', '-p', get_port(), 'config.asgi:application'],
    )


if __name__ == '__main__':
    main()
