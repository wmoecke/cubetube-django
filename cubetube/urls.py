from django.conf.urls import patterns, include, url
from cubetube import views
from fileupload.views import PictureCreateView
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^login/', views.login, name='login'),
                       url(r'^newUser/', views.newUser, name='newUser'),
                       url(r'^docs/', views.docs, name='docs'),
                       url(r'^forum/', views.forum, name='forum'),
                       url(r'^flash/(?P<id>\d+)/$', views.flash, name='flash'),
                       (r'^', include('viz.urls')),
                       (r'^', include('comments.urls')),
                      )+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
