from django.contrib import admin
from .models import Zona, Perfil, Grupo, Ruta, Cuestionario, Pregunta


@admin.register(Zona)
class ZonaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'activo')
    list_filter = ('activo',)


@admin.register(Grupo)
class GrupoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'zona', 'activo')
    list_filter = ('activo', 'zona')


@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'zona', 'activo')
    list_filter = ('activo', 'zona')


@admin.register(Cuestionario)
class CuestionarioAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'activo')
    list_filter = ('activo',)


admin.site.register(Perfil)
admin.site.register(Pregunta)