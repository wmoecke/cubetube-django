from django.db import models
from cube.models import CubeUser

class Viz(models.Model):
    name=models.TextField()
    description=models.TextField()
    creator=models.ForeignKey(CubeUser)
    created=models.DateTimeField(auto_now_add=True)
    sourceURL=models.TextField(blank=True)
    averageRating=models.FloatField(default=0)
    numberOfRatings=models.IntegerField(default=0)
    tags=models.TextField(blank=True)
    views=models.IntegerField(default=0)
    vizType=models.TextField(default="L3D")
    videoURL=models.TextField(blank=True)
    binaryPath=models.TextField(blank=True)
    interactive=models.BooleanField(default=False)
    published=models.BooleanField(default=False)
    featured=models.BooleanField(default=False)
    pageViews=models.IntegerField(default=0)
    parent=models.ForeignKey('self', null=True, blank=True, default = None)

    def __str__(self):
        return "%s, created by %s on %s" %(self.name, self.creator, self.created)

class Rating(models.Model):
    viz=models.ForeignKey(Viz)
    reviewer=models.ForeignKey(CubeUser)
    date=models.DateTimeField(auto_now_add=True)    
    
class SourceCode(models.Model):
    viz=models.ForeignKey(Viz)
    code=models.TextField(default="")
    created=models.DateTimeField(auto_now_add=True)
    updated=models.DateTimeField(auto_now=True)
    def __str__(self):
        return "%s code:  %s, created by %s on %s" %(self.viz.vizType, self.viz.name, self.viz.creator, self.created)

class Photo(models.Model):
    viz=models.ForeignKey(Viz)
    file=models.ImageField(upload_to='photos/%Y/%m/%d', null=True, blank=True)
    def __str__(self):
        return "%s:  %s" %(self.viz.name, self.file)

class Binary(models.Model):
    file=models.FileField(upload_to='binaries/%Y/%m/%d')
    viz=models.ForeignKey(Viz)
    created=models.DateTimeField(auto_now=True)
    def __str__(self):
        return "%s binary " % (self.file)
