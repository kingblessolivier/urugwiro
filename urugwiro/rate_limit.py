"""
Rate limiting decorator for API views.
Uses Django's cache framework to track request counts.
"""

from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse


def rate_limit(key_func=None, rate='10/m', block=True):
    """
    Decorator to limit the rate of API requests.

    Args:
        key_func: Function that takes a request and returns a cache key string
        rate: Rate limit string (e.g., '10/m', '100/h', '1000/d')
        block: Whether to block the request if rate is exceeded

    Usage:
        @rate_limit(rate='5/m')
        def my_view(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Parse rate
            count_str, period = rate.split('/')
            count = int(count_str)
            if period == 's':
                duration = 1
            elif period == 'm':
                duration = 60
            elif period == 'h':
                duration = 3600
            elif period == 'd':
                duration = 86400
            else:
                duration = 60

            # Generate cache key
            if key_func:
                key = key_func(request)
            else:
                key = f"rate_limit:{request.META.get('REMOTE_ADDR', 'unknown')}:{request.path}"

            # Check cache
            current = cache.get(key, 0)
            if current >= count and block:
                return JsonResponse(
                    {'error': 'Rate limit exceeded. Please try again later.'},
                    status=429,
                )

            # Increment counter
            cache.set(key, current + 1, duration)

            return func(request, *args, **kwargs)
        return wrapper
    return decorator


def auth_rate_limit(func):
    """Rate limit for authentication endpoints: 5 requests per minute per IP."""
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        key = f"auth_rate_limit:{request.META.get('REMOTE_ADDR', 'unknown')}"
        current = cache.get(key, 0)

        if current >= 5:
            return JsonResponse(
                {'error': 'Too many attempts. Please try again in 1 minute.'},
                status=429,
            )

        cache.set(key, current + 1, 60)
        return func(request, *args, **kwargs)
    return wrapper
