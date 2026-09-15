from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Zona(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.nombre


class Grupo(models.Model):
    nombre_grupo = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_grupo

class Permiso(models.Model):
    idPermiso = models.AutoField(primary_key=True)
    NombrePermiso = models.CharField(max_length=100)
    Descripcion = models.TextField()

    def __str__(self):
        return self.NombrePermiso

class Rol(models.Model): # Cambiado de Perfil a Rol
    idRol = models.AutoField(primary_key=True)
    NombreRol = models.CharField(max_length=100)
    Descripcion = models.TextField()
    permisos = models.ManyToManyField(Permiso, related_name='roles')

    def __str__(self):
        return self.NombreRol


class Usuario(AbstractUser):
    dni = models.PositiveIntegerField(unique=True)
    telefono_usuario = models.BigIntegerField(blank=True, null=True)

    id_grupo = models.ForeignKey(
        Grupo, on_delete=models.SET_NULL, null=True, blank=True, related_name="usuarios"
    )
    id_rol = models.ForeignKey(
        Rol, on_delete=models.SET_NULL, null=True, blank=True, related_name="usuarios"
    )

    debe_cambiar_clave = models.BooleanField(default=True)
    fecha_ultima_modificacion = models.DateTimeField(auto_now=True)
    fecha_baja = models.DateTimeField(blank=True, null=True)

    REQUIRED_FIELDS = ["email", "dni"]

    def __str__(self):
        return self.username






    def save(self, *args, **kwargs):
        # Generación automática del usuario según consigna (Apellido + 1ra letra Nombre)[cite: 3]
        # Usamos last_name y first_name porque son los campos nativos de AbstractUser
        if not self.username and self.last_name and self.first_name:
            primera_letra = self.first_name[0].lower()
            apellido_limpio = self.last_name.replace(' ', '').lower()
            self.username = f"{apellido_limpio}{primera_letra}"
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
