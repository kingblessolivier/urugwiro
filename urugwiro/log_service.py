"""
urugwiro.log_service
────────────────────────────────────────────────────────────────
Central helper for writing high-level system log entries.

Usage anywhere in the project:
    from urugwiro.log_service import syslog

    syslog('AUTH', 'User logged in', user=request.user, request=request)
    syslog('PAYMENT', 'Payment failed', level='ERROR', amount=200)
"""

import logging

_file_logger = logging.getLogger('propertyhub.system')


# ── Public helper ──────────────────────────────────────────────────────────────

def syslog(
    category: str,
    message: str,
    *,
    level: str = 'INFO',
    user=None,
    request=None,
    status_code: int | None = None,
    **details,
) -> None:
    """
    Write a system log entry to the database AND the rotating log file.

    Args:
        category  : one of AUTH, USER, PROPERTY, LEASE, PAYMENT, MAINTENANCE,
                    MARKETPLACE, MESSAGING, SECURITY, API, CHAT, SYSTEM
        message   : human-readable description of the event
        level     : DEBUG | INFO | WARNING | ERROR | CRITICAL  (default INFO)
        user      : User instance (optional – falls back to request.user)
        request   : HttpRequest (optional – used to extract IP, path, method)
        status_code: HTTP status code to attach (optional)
        **details : arbitrary extra key/value pairs stored in the JSON field
    """
    level = level.upper()

    # ── Resolve request metadata ──────────────────────────────────────────────
    ip_address = None
    path       = ''
    method     = ''

    if request is not None:
        ip_address = _get_client_ip(request)
        path       = getattr(request, 'path', '')
        method     = getattr(request, 'method', '')
        if user is None and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user

    # ── Write to database (non-fatal) ─────────────────────────────────────────
    try:
        from urugwiro.models import SystemLog  # lazy import avoids circular deps
        SystemLog.objects.create(
            level=level,
            category=category,
            message=message,
            user=user,
            ip_address=ip_address,
            path=path,
            method=method,
            status_code=status_code,
            details=details or {},
        )
    except Exception as exc:
        _file_logger.error("DB write failed for system log: %s", exc)

    # ── Mirror to rotating log file ───────────────────────────────────────────
    log_fn = getattr(_file_logger, level.lower(), _file_logger.info)
    log_fn(
        "[%s] %s | user=%s | ip=%s | path=%s %s",
        category,
        message,
        getattr(user, 'username', 'anonymous'),
        ip_address or '-',
        method,
        path,
    )


# ── Convenience wrappers ───────────────────────────────────────────────────────

def log_auth(message, **kw):
    syslog('AUTH', message, **kw)

def log_property(message, **kw):
    syslog('PROPERTY', message, **kw)

def log_payment(message, **kw):
    syslog('PAYMENT', message, **kw)

def log_lease(message, **kw):
    syslog('LEASE', message, **kw)

def log_maintenance(message, **kw):
    syslog('MAINTENANCE', message, **kw)

def log_marketplace(message, **kw):
    syslog('MARKETPLACE', message, **kw)

def log_security(message, **kw):
    syslog('SECURITY', message, level='WARNING', **kw)

def log_error(category, message, **kw):
    syslog(category, message, level='ERROR', **kw)

def log_critical(category, message, **kw):
    syslog(category, message, level='CRITICAL', **kw)


# ── Internal ───────────────────────────────────────────────────────────────────

def _get_client_ip(request) -> str | None:
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
