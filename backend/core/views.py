from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from .models import Zona, Grupo, Ruta, Cuestionario
from .serializers import (
    ZonaSerializer, UsuarioSerializer, GrupoSerializer,
    RutaSerializer, CuestionarioSerializer,
)


class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer
    permission_classes = [permissions.IsAuthenticated]


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]


class GrupoViewSet(viewsets.ModelViewSet):
    queryset = Grupo.objects.select_related('zona').all()
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]


class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.select_related('zona').all()
    serializer_class = RutaSerializer
    permission_classes = [permissions.IsAuthenticated]


class CuestionarioViewSet(viewsets.ModelViewSet):
    queryset = Cuestionario.objects.prefetch_related('preguntas').all()
    serializer_class = CuestionarioSerializer
    permission_classes = [permissions.IsAuthenticated]