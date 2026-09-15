from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import Zona
from .serializers import (
    LoginSerializer,
    ZonaSerializer,
    AltaUsuarioSerializer,
    ModificacionUsuarioSerializer,
    RestablecerClaveSerializer,
    UsuarioSerializer
)

Usuario = get_user_model()

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    # Dependiendo de tu lógica, podrías querer que solo los administradores gestionen usuarios.
    # Por ahora, requiere que el usuario esté autenticado.
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Selecciona el serializador según la acción que se esté realizando
        if self.action in ['update', 'partial_update']:
            # Solo permite edición del correo[cite: 3]
            return ModificacionUsuarioSerializer
        elif self.action == 'create':
            # Maneja la creación con la generación de username y contraseña
            return AltaUsuarioSerializer
        # Para listar (GET /usuarios/) o recuperar (GET /usuarios/<id>/) usa el serializador general
        return UsuarioSerializer 

    def perform_destroy(self, instance):
        # La baja cambia el campo Activo a (no) y carga la fecha de baja[cite: 3]
        instance.is_active = False
        instance.fecha_baja = timezone.now()
        instance.save()

    # Formulario/endpoint independiente para restablecer la clave[cite: 3]
    @action(detail=True, methods=['post'], url_path='restablecer-clave')
    def restablecer_clave(self, request, pk=None):
        usuario = self.get_object()
        serializer = RestablecerClaveSerializer(usuario, data=request.data)
        
        if serializer.is_valid():
            nueva_clave_plana = serializer.validated_data['nueva_clave']
            # Guarda la nueva clave hasheada y exige el cambio en el próximo login[cite: 3]
            serializer.save() 
            
            asunto = 'Restablecimiento de clave'
            mensaje = (
                f'Hola {usuario.first_name} {usuario.last_name},\n\n'
                f'Tu clave de acceso ha sido restablecida exitosamente.\n\n'
                f'Usuario: {usuario.username}\n'
                f'Nueva clave temporal: {nueva_clave_plana}\n\n'
                f'Por motivos de seguridad, el sistema te exigirá que cambies esta contraseña '
                f'durante tu próximo inicio de sesión.\n\n'
                f'Saludos.'
            )
            
            try:
                # Envía el correo usando la configuración de settings.py
                send_mail(asunto, mensaje, settings.EMAIL_HOST_USER, [usuario.email], fail_silently=False)
                return Response(
                    {'mensaje': 'Clave restablecida. Se envió un correo al usuario con la nueva contraseña.'}, 
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {'mensaje': 'Clave restablecida, pero hubo un error al enviar el correo.', 'error': str(e)}, 
                    status=status.HTTP_207_MULTI_STATUS
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)