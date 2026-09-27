"""
Security Headers Middleware
Adds security headers to all responses.
"""


class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Prevent MIME type sniffing
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')

        # Prevent clickjacking
        response.headers.setdefault('X-Frame-Options', 'DENY')

        # XSS protection
        response.headers.setdefault('X-XSS-Protection', '1; mode=block')

        # Referrer policy
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')

        # Permissions policy
        response.headers.setdefault(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(self), payment=(self)'
        )

        # Content Security Policy (adjust as needed)
        response.headers.setdefault(
            'Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
            "img-src 'self' data: https: http:; "
            "connect-src 'self' ws: wss: http://localhost:8000 https://api.openai.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )

        return response
