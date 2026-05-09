from django.test import TestCase
from django.contrib.auth import get_user_model
from api.permissions import IsAdmin, IsTeacher, IsStudent, IsAdminOrTeacher
from unittest.mock import Mock

User = get_user_model()

class PermissionsTest(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(username='admin', password='password', role='admin')
        self.teacher_user = User.objects.create_user(username='teacher', password='password', role='teacher')
        self.student_user = User.objects.create_user(username='student', password='password', role='student')
        self.anon_user = Mock(is_authenticated=False)
        self.request = Mock()

    def test_is_admin_permission(self):
        permission = IsAdmin()
        self.request.user = self.admin_user
        self.assertTrue(permission.has_permission(self.request, None))
        
        self.request.user = self.teacher_user
        self.assertFalse(permission.has_permission(self.request, None))
        
        self.request.user = self.student_user
        self.assertFalse(permission.has_permission(self.request, None))

    def test_is_teacher_permission(self):
        permission = IsTeacher()
        self.request.user = self.teacher_user
        self.assertTrue(permission.has_permission(self.request, None))
        
        self.request.user = self.admin_user
        self.assertFalse(permission.has_permission(self.request, None))

    def test_is_student_permission(self):
        permission = IsStudent()
        self.request.user = self.student_user
        self.assertTrue(permission.has_permission(self.request, None))
        
        self.request.user = self.admin_user
        self.assertFalse(permission.has_permission(self.request, None))

    def test_is_admin_or_teacher_permission(self):
        permission = IsAdminOrTeacher()
        
        self.request.user = self.teacher_user
        self.assertTrue(permission.has_permission(self.request, None))
        
        # This is expected to FAIL until we fix the bug in permissions.py
        self.request.user = self.admin_user
        self.assertTrue(permission.has_permission(self.request, None), "Admin should have permission in IsAdminOrTeacher")
        
        self.request.user = self.student_user
        self.assertFalse(permission.has_permission(self.request, None))
