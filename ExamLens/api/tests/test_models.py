from django.test import TestCase
from api.models import User

class UserModelTest(TestCase):
    def test_create_user_with_default_role(self):
        user = User.objects.create_user(username='student1', password='password123')
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertEqual(user.username, 'student1')

    def test_create_user_with_teacher_role(self):
        user = User.objects.create_user(username='teacher1', password='password123', role=User.Role.TEACHER)
        self.assertEqual(user.role, User.Role.TEACHER)

    def test_create_user_with_admin_role(self):
        user = User.objects.create_user(username='admin1', password='password123', role=User.Role.ADMIN)
        self.assertEqual(user.role, User.Role.ADMIN)

    def test_create_superuser(self):
        user = User.objects.create_superuser(username='superadmin', password='password123', email='admin@test.com')
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        # Note: In Django, create_superuser doesn't automatically set our custom 'role' field
        # unless we override the manager. Let's see if it should.
        # Based on models.py, it's just a CharField with a default.
        self.assertEqual(user.role, User.Role.STUDENT) # Default if not specified
