"""
urugwiro.middleware — SystemLogMiddleware (passive passthrough).
Actual system logging is done via syslog() calls in views and signals.
"""


class SystemLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
