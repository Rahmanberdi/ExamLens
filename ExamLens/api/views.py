from django.shortcuts import render
from .serializers import UserSerializer
from rest_framework import generics
from .models import User
from .permissions import IsAdmin,IsTeacher,IsStudent,IsAdminOrTeacher
from rest_framework.permissions import AllowAny,IsAuthenticated

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
