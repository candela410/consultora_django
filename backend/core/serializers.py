from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Zona, Perfil, Grupo, Ruta, Cuestionario, Pregunta


class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zona
        fields = '__all__'


class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.ChoiceField(choices=Perfil.ROL_CHOICES, required=False, default='encuestador')
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'rol', 'password']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['rol'] = getattr(getattr(instance, 'perfil', None), 'rol', 'encuestador')
        return data

    def create(self, validated_data):
        rol = validated_data.pop('rol', 'encuestador')
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        Perfil.objects.update_or_create(user=user, defaults={'rol': rol})
        return user

    def update(self, instance, validated_data):
        rol = validated_data.pop('rol', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if rol:
            Perfil.objects.update_or_create(user=instance, defaults={'rol': rol})
        return instance


class GrupoSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')

    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'descripcion', 'zona', 'zona_nombre','activo']


class RutaSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')

    class Meta:
        model = Ruta
        fields = ['id', 'nombre', 'descripcion', 'zona', 'zona_nombre','activo']


class PreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = ['id', 'texto', 'tipo', 'orden','activo']


class CuestionarioSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True, required=False)

    class Meta:
        model = Cuestionario
        fields = ['id', 'titulo', 'descripcion', 'preguntas','activo' ]

    def create(self, validated_data):
        preguntas_data = validated_data.pop('preguntas', [])
        cuestionario = Cuestionario.objects.create(**validated_data)
        for i, p in enumerate(preguntas_data):
            Pregunta.objects.create(
                cuestionario=cuestionario,
                texto=p['texto'],
                tipo=p.get('tipo', 'texto'),
                orden=p.get('orden', i),
            )
        return cuestionario

    def update(self, instance, validated_data):
        preguntas_data = validated_data.pop('preguntas', None)
        instance.titulo = validated_data.get('titulo', instance.titulo)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.activo = validated_data.get('activo', instance.activo)
        instance.save()
        if preguntas_data is not None:
            instance.preguntas.all().delete()
            for i, p in enumerate(preguntas_data):
                Pregunta.objects.create(
                    cuestionario=instance,
                    texto=p['texto'],
                    tipo=p.get('tipo', 'texto'),
                    orden=p.get('orden', i),
                )
        return instance