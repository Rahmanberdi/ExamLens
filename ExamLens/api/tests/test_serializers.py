from django.test import TestCase
from api.serializers import UserSerializer
from api.models import User

class UserSerializerTest(TestCase):
    def test_serializer_with_valid_data(self):
        data = {
            'username': 'serializer_user',
            'password': 'password123',
            'email': 'serializer@test.com',
            'role': 'teacher',
            'first_name': 'Test',
            'last_name': 'User'
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        self.assertEqual(user.username, 'serializer_user')
        self.assertEqual(user.role, 'teacher')
        self.assertTrue(user.check_password('password123'))

    def test_serializer_default_role(self):
        data = {
            'username': 'default_role_user',
            'password': 'password123',
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.role, User.Role.STUDENT)
