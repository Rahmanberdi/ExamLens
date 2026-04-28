from rest_framework import generics, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Subject, Exam, Question, StudentAnswer
from .permissions import IsAdmin
from .serializers import (
    UserSerializer, CustomTokenObtainPairSerializer,
    SubjectSerializer, ExamSerializer, QuestionSerializer, StudentAnswerSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdmin]

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.select_related('subject')
    serializer_class = ExamSerializer
    permission_classes = [IsAdmin]

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related('exam__subject')
    serializer_class = QuestionSerializer
    permission_classes = [IsAdmin]

class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.select_related('question__exam__subject','student')
    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAdmin]

