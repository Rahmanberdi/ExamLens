from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    def has_permission(self,request,view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )
class IsStudent(BasePermission):
    def has_permission(self,request,view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'student'
        )
class IsTeacher(BasePermission):
    def has_permission(self,request,view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'teacher'
        )
class IsAdminOrTeacher(BasePermission):
    def has_permission(self,request,view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or
             request.user.role == 'teacher')
        )

class IsAdminOrTeacherReadOnly(BasePermission):
    """Admin: full access. Teacher: safe methods only (GET/HEAD/OPTIONS)."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'admin':
            return True
        if request.user.role == 'teacher':
            return request.method in SAFE_METHODS
        return False
