from rest_framework import permissions


def _role_perm(*allowed_types):
    """Factory: create a BasePermission class that allows the given user_types."""
    class _P(permissions.BasePermission):
        def has_permission(self, request, view):
            return (
                bool(request.user and request.user.is_authenticated) and
                request.user.user_type in allowed_types
            )
    _P.__name__ = 'RolePerm_' + '_'.join(allowed_types)
    return _P


# Single-role permission classes
IsAdmin           = _role_perm('admin', 'registrar', 'staff')
IsLecturer        = _role_perm('lecturer', 'professor')
IsStudent         = _role_perm('student')
IsFinance         = _role_perm('finance')
IsCOD             = _role_perm('cod')
IsDean            = _role_perm('dean')
IsHostelWarden    = _role_perm('hostel_warden')

# Combined permission classes
IsAdminOrRegistrar    = _role_perm('admin', 'registrar', 'staff')
IsAdminOrLecturer     = _role_perm('admin', 'registrar', 'staff', 'lecturer', 'professor')
IsAdminOrCOD          = _role_perm('admin', 'registrar', 'staff', 'cod')
IsAdminOrDean         = _role_perm('admin', 'registrar', 'staff', 'dean')
IsAdminOrFinance      = _role_perm('admin', 'registrar', 'staff', 'finance')
IsAdminOrHostelWarden = _role_perm('admin', 'registrar', 'staff', 'hostel_warden')


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: allow access only if the requesting user owns
    the object (obj.user == request.user) or is an admin.
    The view must call self.check_object_permissions(request, obj).
    """
    ADMIN_TYPES = {'admin', 'registrar', 'staff'}

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.user_type in self.ADMIN_TYPES:
            return True
        # Support objects that have a .user FK directly
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # Support objects that have a .student.user path
        if hasattr(obj, 'student') and hasattr(obj.student, 'user'):
            return obj.student.user == request.user
        # Support objects that have a .sender / .recipient
        if hasattr(obj, 'sender'):
            return obj.sender == request.user
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Full access for admin/registrar/staff; read-only for everyone else.
    """
    ADMIN_TYPES = {'admin', 'registrar', 'staff'}

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.user_type in self.ADMIN_TYPES