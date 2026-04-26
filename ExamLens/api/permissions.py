from rest_framework.permissions import BasePermission

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

