"""
university_erp_system/settings.py
Production-ready settings with environment variable support via python-decouple.
"""

import os
from pathlib import Path
from decouple import config, Csv

# ─────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent


# ─────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────

SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())


# ─────────────────────────────────────────────
# INSTALLED APPS
# ─────────────────────────────────────────────

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',

    # Project apps
    'core',
]


# ─────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Custom middleware (uncomment when implemented)
    # 'core.middleware.ActivityLogMiddleware',
    # 'core.middleware.WebhookIPWhitelistMiddleware',
]

ROOT_URLCONF = 'backend.urls'


# ─────────────────────────────────────────────
# TEMPLATES
# ─────────────────────────────────────────────

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'


# ─────────────────────────────────────────────
# DATABASE  (PostgreSQL)
# ─────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ─────────────────────────────────────────────
# CUSTOM USER MODEL
# ─────────────────────────────────────────────

AUTH_USER_MODEL = 'core.User'


# ─────────────────────────────────────────────
# PASSWORD VALIDATION
# ─────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─────────────────────────────────────────────
# INTERNATIONALISATION
# ─────────────────────────────────────────────

LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Nairobi'
USE_I18N      = True
USE_TZ        = True


# ─────────────────────────────────────────────
# STATIC & MEDIA FILES
# ─────────────────────────────────────────────

STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ─────────────────────────────────────────────
# DJANGO REST FRAMEWORK
# ─────────────────────────────────────────────

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # keeps Django admin working
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/minute',
        'user': '200/minute',
    },
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'NON_FIELD_ERRORS_KEY': 'detail',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S',
    'DATE_FORMAT': '%Y-%m-%d',
}


# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# ─────────────────────────────────────────────
# EMAIL
# ─────────────────────────────────────────────

EMAIL_BACKEND      = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST         = config('EMAIL_HOST',         default='smtp.gmail.com')
EMAIL_PORT         = config('EMAIL_PORT',         default=587, cast=int)
EMAIL_USE_TLS      = config('EMAIL_USE_TLS',      default=True, cast=bool)
EMAIL_HOST_USER    = config('EMAIL_HOST_USER',    default='')
EMAIL_HOST_PASSWORD= config('EMAIL_HOST_PASSWORD',default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)


# ─────────────────────────────────────────────
# CELERY
# ─────────────────────────────────────────────

CELERY_BROKER_URL         = config('CELERY_BROKER_URL',    default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND     = config('CELERY_RESULT_BACKEND',default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT     = ['json']
CELERY_TASK_SERIALIZER    = 'json'
CELERY_RESULT_SERIALIZER  = 'json'
CELERY_TIMEZONE           = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT    = 30 * 60   # 30 minutes hard limit
CELERY_BEAT_SCHEDULE      = {}        # add periodic tasks here


# ─────────────────────────────────────────────
# AFRICA'S TALKING (SMS)
# ─────────────────────────────────────────────

AT_USERNAME  = config('AT_USERNAME',  default='sandbox')
AT_API_KEY   = config('AT_API_KEY',   default='')
AT_SENDER_ID = config('AT_SENDER_ID', default='UNIV')


# ─────────────────────────────────────────────
# EQUITY BANK
# ─────────────────────────────────────────────

EQUITY_API_URL       = config('EQUITY_API_URL',       default='https://api.equitybank.co.ke/v1')
EQUITY_MERCHANT_CODE = config('EQUITY_MERCHANT_CODE', default='')
EQUITY_API_KEY       = config('EQUITY_API_KEY',       default='')
EQUITY_SECRET_KEY    = config('EQUITY_SECRET_KEY',    default='')


# ─────────────────────────────────────────────
# KCB BANK
# ─────────────────────────────────────────────

KCB_API_URL       = config('KCB_API_URL',       default='https://api.kcbgroup.com/v1')
KCB_CLIENT_ID     = config('KCB_CLIENT_ID',     default='')
KCB_CLIENT_SECRET = config('KCB_CLIENT_SECRET', default='')


# ─────────────────────────────────────────────
# M-PESA (Safaricom Daraja)
# ─────────────────────────────────────────────

MPESA_ENVIRONMENT    = config('MPESA_ENVIRONMENT',    default='sandbox')
MPESA_CONSUMER_KEY   = config('MPESA_CONSUMER_KEY',   default='')
MPESA_CONSUMER_SECRET= config('MPESA_CONSUMER_SECRET',default='')
MPESA_SHORTCODE      = config('MPESA_SHORTCODE',      default='174379')
MPESA_PASSKEY        = config('MPESA_PASSKEY',        default='')
MPESA_CALLBACK_URL   = config('MPESA_CALLBACK_URL',   default='https://yourdomain.com/api/webhooks/mpesa/')


# ─────────────────────────────────────────────
# FILE UPLOAD LIMITS
# ─────────────────────────────────────────────

DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024   # 20 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024   # 20 MB


# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 5,   # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': config('DJANGO_LOG_LEVEL', default='INFO'),
            'propagate': True,
        },
        'core': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
os.makedirs(BASE_DIR / 'logs', exist_ok=True)


# ─────────────────────────────────────────────
# SECURITY HEADERS  (production)
# ─────────────────────────────────────────────

if not DEBUG:
    SECURE_HSTS_SECONDS            = 31536000   # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD            = True
    SECURE_SSL_REDIRECT            = True
    SESSION_COOKIE_SECURE          = True
    CSRF_COOKIE_SECURE             = True
    SECURE_BROWSER_XSS_FILTER      = True
    SECURE_CONTENT_TYPE_NOSNIFF    = True
    X_FRAME_OPTIONS                = 'DENY'


# ─────────────────────────────────────────────
# SENTRY  (error tracking — production only)
# ─────────────────────────────────────────────

SENTRY_DSN = config('SENTRY_DSN', default='')

if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration()],
        traces_sample_rate=0.2,
        send_default_pii=False,
    )


# ─────────────────────────────────────────────
# QR CODE (for attendance)
# ─────────────────────────────────────────────

QR_CODE_BOX_SIZE  = 10
QR_CODE_BORDER    = 4
ATTENDANCE_SESSION_TIMEOUT_MINUTES = config(
    'ATTENDANCE_SESSION_TIMEOUT_MINUTES', default=15, cast=int
)