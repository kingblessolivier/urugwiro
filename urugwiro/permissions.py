from rest_framework.permissions import BasePermission


CAPABILITIES = {
    'operations': {'admin', 'owner', 'staff'},
    'finance': {'admin', 'owner', 'finance'},
    'accounts': {'admin', 'owner'},
    'settings': {'admin', 'owner'},
}


def has_capability(user, capability='operations'):
    return bool(
        user and user.is_authenticated and user.is_active
        and (user.is_superuser or user.role in CAPABILITIES[capability])
    )


class CanManagePlatform(BasePermission):
    def has_permission(self, request, view):
        return has_capability(request.user, 'settings')
