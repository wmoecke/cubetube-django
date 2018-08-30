# Django settings for cubetube project.
import os
PROJECT_ROOT = os.path.abspath(os.path.dirname(__name__))
CUBE_LIBRARY="beta-cube-library"
DEBUG = True
DEVELOPMENT = True
TEMPLATE_DEBUG = DEBUG

LISTENER_PK=12
SPARK_LIBRARY="#include \"beta-cube-library/beta-cube-library.h\"\n#include \"application.h\"\n\n"

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'grandmastacube@gmail.com'
EMAIL_HOST_PASSWORD = "$5!58U28X8SX,q'"
EMAIL_PORT = 587

ADMINS = (
     ('Alex Hornstein', 'alex@lookingglassfactory.com')
)


MANAGERS = ADMINS

if DEVELOPMENT:
    DATABASES = {
    'default': {
    'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    'NAME':     'cubetube-dev',
    # The following settings are not used with sqlite3:
    'USER': '',
        'PASSWORD': '',  
      'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
        }
        }

else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
            'NAME':    'XXXXXXXXXXX',   # Or path to database file if using sqlite3.
            # The following settings are not used with sqlite3:
                'USER': 'XXXXXXXXXXXX',
            'PASSWORD': 'XXXXXXXXXXXXXXXXXXX',
            'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
            'PORT': '',                      # Set to empty string for default.
            }
        }


# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/New_York'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT =  os.path.join(PROJECT_ROOT, 'media/')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'

WEBSOCKETS_LISTENER=os.path.join(MEDIA_ROOT,"listeners/websocketListener.bin")

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT =  os.path.join(PROJECT_ROOT, 'static')

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_ROOT, 'cubetube/static').replace('\\','/'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '4_4=s8o^+mfikbxf$5%(-w0^^v*=yp5z4$578)2pcd)vfq&*j_'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'cubetube.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'cubetube.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.

    #this absolute path needs to be changed for your local install.I don't know why, but the relative path below doesn't resolve.  TO BE FIXED
    '/home/glass/cubetube-production/cubetube/templates',
#    os.path.join(PROJECT_ROOT, 'cubetube/templates'),
)

from django.conf import global_settings
TEMPLATE_CONTEXT_PROCESSORS = global_settings.TEMPLATE_CONTEXT_PROCESSORS + (
                             "django.core.context_processors.request",
                             "viz.context_processors.listeners",
)

INSTALLED_APPS = (
    'django.contrib.auth',

    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'cube',
    'viz',
    'comments',
    'fileupload',
)

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.

#you have to specify your logfile path and make sure that django can write to it.
if not DEVELOPMENT:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': True,
        'formatters': {
            'standard': {
                'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
                'datefmt' : "%d/%b/%Y %H:%M:%S"
                },
            },
        'handlers': {
            'null': {
                'level':'DEBUG',
                'class':'django.utils.log.NullHandler',
                },
            'logfile': {
                'level':'DEBUG',
                'class':'logging.handlers.RotatingFileHandler',
                'filename': "/path/to/your/logfile",
                'maxBytes': 50000,
                'backupCount': 2,
                'formatter': 'standard',
                },
            'console':{
                'level':'INFO',
                'class':'logging.StreamHandler',
                'formatter': 'standard'
                },
            },
        'loggers': {
            'django': {
                'handlers':['console'],
                'propagate': True,
                'level':'WARN',
                },
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
                'propagate': False,
                },
            'viz': {
                'handlers': ['console', 'logfile'],
                'level': 'DEBUG',
                },
            }
        }
