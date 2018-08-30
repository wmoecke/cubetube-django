from django.conf.urls import url
from django.views.generic import RedirectView
from viz import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^gallery/(?P<filter>\w+)/(?P<featuredViz>\d+)/$', views.jsgallery, name='gallery'),
    url(r'^gallery/(?P<filter>\w+)/$', views.jsgallery, name='gallery'),
    url(r'^gallery/', views.jsgallery, name='gallery'),
    url(r'^jsgallery/', views.jsgallery, name='jsgallery'),    
    url(r'^viz/(?P<id>\d+)/$', views.viz, name='viz'),
    url(r'^vizText/(?P<id>\d+)/$', views.vizText, name='vizText'),
    url(r'^scroll/(?P<page>\d+)/(?P<filter>\w+)/(?P<cardsPerPage>\d+)/$', views.scroll, name='scroll'),
    url(r'^scroll/(?P<page>\d+)/(?P<filter>\w+)/$', views.scroll, name='scroll'),
    url(r'^scroll/(?P<page>\d+)/$', views.scroll, name='scroll'), 
    url(r'^fork/(?P<vizId>\d+)/$', views.fork, name='fork'),
    url(r'^compile/', views.compile, name='compile'),
    url(r'^cloudFlash/', views.cloudFlash, name='cloudFlash'),
    url(r'^filter/', views.filter, name='filter'),
    url(r'^appInfo/', views.appInfo, name='appInfo'),
    url(r'^justCompile/', views.justCompile, name='justCompile'),
    url(r'^listener/(?P<coreId>\w+)/(?P<processor>\w+)/$', views.flashWebsocketsListener, name='flashWebsocketsListener'),
    url(r'^save/', views.save, name='save'),
    url(r'^code/(?P<id>\d+)/$', views.code, name='code'),
    url(r'^create/', views.create, name='create'),
    url(r'^upload/', views.upload, name='upload'),
    url(r'^edit/(?P<id>\d+)/$', views.edit, name='edit'),
    url(r'^delete/', views.delete, name='delete'),
]
