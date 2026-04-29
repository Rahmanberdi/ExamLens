from rest_framework import generics, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Subject, Exam, Question, StudentAnswer
from .permissions import IsAdmin, IsTeacher, IsStudent
from .serializers import (
    UserSerializer, CustomTokenObtainPairSerializer,
    SubjectSerializer, ExamSerializer, QuestionSerializer, StudentAnswerSerializer,
    TeacherQuestionSerializer, StudentExamSerializer, StudentAnswerWithQuestionSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CreateUserView(generics.ListCreateAPIView):
    queryset = User.objects.exclude(role=User.Role.ADMIN).order_by('id')
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


# --- Teacher views ---

class TeacherWrongQuestionsView(generics.ListAPIView):
    permission_classes = [IsTeacher]
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = Question.objects.filter(
            answers__is_correct=False
        ).distinct().select_related('exam__subject')
        keyword = self.request.query_params.get('keyword')
        if keyword:
            qs = qs.filter(content__icontains=keyword)
        return qs


class TeacherQuestionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsTeacher]
    serializer_class = TeacherQuestionSerializer
    queryset = Question.objects.select_related('exam__subject').prefetch_related('answers__student')


# --- Student views ---

class StudentExamListView(generics.ListAPIView):
    permission_classes = [IsStudent]
    serializer_class = StudentExamSerializer

    def get_queryset(self):
        return Exam.objects.filter(
            questions__answers__student=self.request.user
        ).distinct().select_related('subject')


class StudentExamQuestionsView(generics.ListAPIView):
    permission_classes = [IsStudent]
    serializer_class = StudentAnswerWithQuestionSerializer

    def get_queryset(self):
        return StudentAnswer.objects.filter(
            student=self.request.user,
            question__exam_id=self.kwargs['exam_id'],
        ).select_related('question__exam__subject')


class StudentWrongQuestionsView(generics.ListAPIView):
    permission_classes = [IsStudent]
    serializer_class = StudentAnswerWithQuestionSerializer

    def get_queryset(self):
        return StudentAnswer.objects.filter(
            student=self.request.user,
            is_correct=False,
        ).select_related('question__exam__subject')

