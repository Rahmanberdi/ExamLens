from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework.routers import DefaultRouter

from .views import (
    CreateUserView, CustomTokenObtainPairView,
    SubjectViewSet, ExamViewSet, QuestionViewSet, StudentAnswerViewSet,
    TeacherWrongQuestionsView, TeacherQuestionDetailView,
    StudentExamListView, StudentExamQuestionsView, StudentWrongQuestionsView,
)

router = DefaultRouter()
router.register('admin/subjects', SubjectViewSet, basename='subject')
router.register('admin/exams', ExamViewSet, basename='exam')
router.register('admin/questions', QuestionViewSet, basename='question')
router.register('admin/answers', StudentAnswerViewSet, basename='student')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='access_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    path('admin/students/', CreateUserView.as_view(), name='create-student'),

    path('teacher/wrong-questions/', TeacherWrongQuestionsView.as_view(), name='teacher-wrong-questions'),
    path('teacher/questions/<int:pk>/', TeacherQuestionDetailView.as_view(), name='teacher-question-detail'),

    path('student/exams/', StudentExamListView.as_view(), name='student-exams'),
    path('student/exams/<int:exam_id>/questions/', StudentExamQuestionsView.as_view(), name='student-exam-questions'),
    path('student/wrong-questions/', StudentWrongQuestionsView.as_view(), name='student-wrong-questions'),
] + router.urls
