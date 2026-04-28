from django.urls import path
from .views import CreateUserView,CustomTokenObtainPairView,SubjectViewSet,ExamViewSet,QuestionViewSet,StudentAnswerViewSet
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('admin/subjects',SubjectViewSet,basename='subject')
router.register('admin/exams',ExamViewSet,basename='exam')
router.register('admin/questions',QuestionViewSet,basename='question')
router.register('admin/answers',StudentAnswerViewSet,basename='student')

urlpatterns = [
    path('admin/students/', CreateUserView.as_view(), name='create-student'),
    path('token/', CustomTokenObtainPairView.as_view(), name='access_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
] + router.urls
