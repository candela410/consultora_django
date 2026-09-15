from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Zona, Rol # Asegurate de importar los modelos correctos

Usuario = get_user_model()

class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zona
        fields = '__all__'

class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        exclude = ["password"]

def generar_username(apellido, nombre):
    base = f"{apellido.strip().lower()}{nombre.strip()[0].lower()}".replace(" ", "")
    username = base
    contador = 1
    while Usuario.objects.filter(username=username).exists():
        contador += 1
        username = f"{base}{contador}"
    return username

class AltaUsuarioSerializer(serializers.ModelSerializer):
    clave = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        # Se agrega 'idRol' a los fields para cumplir con la asignación de perfiles
        fields = ["id", "dni", "last_name", "first_name", "email", "clave", "is_active", "username", "id_rol"]
        read_only_fields = ["id", "username"]

    def validate_dni(self, value):
        if Usuario.objects.filter(dni=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese DNI.")
        return value

    def create(self, validated_data):
        clave = validated_data.pop("clave")
        apellido = validated_data.get("last_name", "")
        nombre = validated_data.get("first_name", "")
        username = generar_username(apellido, nombre)
        
        # Extraemos el idRol si viene en la petición
        id_rol = validated_data.pop("idRol", None)

        # Se asigna debe_cambiar_clave=True para obligar al usuario en el próximo login[cite: 3]
        usuario = Usuario(
            username=username, 
            debe_cambiar_clave=True, 
            idRol=id_rol,
            **validated_data
        )
        usuario.set_password(clave)
        usuario.save()
        return usuario

class ModificacionUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        # La modificación de usuario solo deberá permitir la edición del correo[cite: 3]
        fields = ["email"] 

class RestablecerClaveSerializer(serializers.Serializer):
    nueva_clave = serializers.CharField(write_only=True, required=True, min_length=8)

    def update(self, instance, validated_data):
        # Se genera la nueva contraseña con cifrado y se exige el cambio[cite: 3]
        instance.set_password(validated_data['nueva_clave'])
        instance.debe_cambiar_clave = True
        instance.save()
        return instance