from rest_framework.throttling import SimpleRateThrottle


class EndpointThrottle(SimpleRateThrottle):
    scope = 'public_read'

    def allow_request(self, request, view):
        if request.path in {'/api/health/', '/api/ready/', '/health/', '/', '/api/'}:
            return True
        if request.path.startswith(('/api/auth/login', '/api/auth/register', '/api/token/')):
            self.scope = 'authentication'
        elif request.method not in {'GET', 'HEAD', 'OPTIONS'}:
            self.scope = 'authenticated_write' if request.user.is_authenticated else 'public_write'
        else:
            self.scope = 'authenticated_read' if request.user.is_authenticated else 'public_read'
        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        identity = f'user:{request.user.pk}' if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': identity}
