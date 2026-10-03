"""
urugwiro.middleware - project middleware.
"""

from django.http import JsonResponse


class HealthCheckMiddleware:
    """Return liveness checks before production security redirects run."""

    HEALTH_PATHS = {'/', '/api/', '/api/health', '/api/health/', '/health', '/health/'}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in self.HEALTH_PATHS:
            return JsonResponse({
                'status': 'ok',
                'service': 'urugwiro-backend',
                'healthy': True,
            })
        return self.get_response(request)


class SystemLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
