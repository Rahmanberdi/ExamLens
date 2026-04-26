from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import User

class UserRegistrationTest(APITestCase):
    def setUp(self):
        self.url = reverse('register')
        self.admin_user = User.objects.create_user(username='admin', password='password123', role='admin')
        self.teacher_user = User.objects.create_user(username='teacher', password='password123', role='teacher')
        self.student_user = User.objects.create_user(username='student', password='password123', role='student')

    def test_admin_can_register_user(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'new@test.com',
            'role': 'teacher'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(username='newuser').count(), 1)

    def test_teacher_cannot_register_user(self):
        self.client.force_authenticate(user=self.teacher_user)
        data = {
            'username': 'newuser2',
            'password': 'newpassword123',
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_register_user(self):
        data = {
            'username': 'newuser3',
            'password': 'newpassword123',
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
