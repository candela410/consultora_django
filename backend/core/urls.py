from rest_framework.routers import DefaultRouter
from .views import (
    ZonaViewSet, UsuarioViewSet, GrupoViewSet,
    RutaViewSet, CuestionarioViewSet,
)

router = DefaultRouter()
router.register(r'zonas', ZonaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'grupos', GrupoViewSet)
router.register(r'rutas', RutaViewSet)
router.register(r'cuestionarios', CuestionarioViewSet)
urlpatterns = router.urls