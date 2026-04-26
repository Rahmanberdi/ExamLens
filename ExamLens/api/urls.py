from django.urls import path
from .views import CreateUserView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView, TokenBlacklistView

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='access_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
