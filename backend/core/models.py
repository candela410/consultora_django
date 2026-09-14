from django.db import models

# Create your models here.
class Zona(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.nombre