from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZonaViewSet, LoginView, UsuarioViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'zonas', ZonaViewSet)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),          # rutas del router (zonas/, usuarios/, etc)
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]