from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Zona
from .serializers import ZonaSerializer

class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer
    permission_classes = [permissions.IsAuthenticated]