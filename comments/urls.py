from django.conf.urls import url
from comments import views

urlpatterns = [
    url(r'^newComment/', views.newComment, name='newComment'),
]
