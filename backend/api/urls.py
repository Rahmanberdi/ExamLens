from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework.routers import DefaultRouter

from .views import (
    CreateUserView, CustomTokenObtainPairView,
    SubjectViewSet, ExamViewSet, QuestionViewSet, StudentAnswerViewSet,
    TeacherQuestionsView, TeacherQuestionDetailView,
    StudentExamListView, StudentExamQuestionsView, StudentWrongQuestionsView,
)
from .import_views import ImportQuestionsView, ImportAnswersView
from .ai_views import ExamAiSummaryView

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
    path('admin/import/questions/', ImportQuestionsView.as_view(), name='import-questions'),
    path('admin/import/answers/', ImportAnswersView.as_view(), name='import-answers'),
    path('admin/exams/<int:exam_id>/ai-summary/', ExamAiSummaryView.as_view(), name='admin-exam-ai-summary'),
    path('teacher/exams/<int:exam_id>/ai-summary/', ExamAiSummaryView.as_view(), name='teacher-exam-ai-summary'),

    path('teacher/questions/', TeacherQuestionsView.as_view(), name='teacher-questions'),
    path('teacher/questions/<int:pk>/', TeacherQuestionDetailView.as_view(), name='teacher-question-detail'),

    path('student/exams/', StudentExamListView.as_view(), name='student-exams'),
    path('student/exams/<int:exam_id>/questions/', StudentExamQuestionsView.as_view(), name='student-exam-questions'),
    path('student/wrong-questions/', StudentWrongQuestionsView.as_view(), name='student-wrong-questions'),
] + router.urls
