from rest_framework import serializers
from .models import Zona

class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zona
        fields = '__all__'