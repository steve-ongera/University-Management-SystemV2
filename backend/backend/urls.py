"""
university_erp_system/urls.py  —  Root URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ── Django admin (superuser / internal debug) ──────────────────────────
    path('django-admin/', admin.site.urls),

    # ── REST API ────────────────────────────────────────────────────────────
    path('api/', include('core_application.urls')),
]

# Serve media & static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)