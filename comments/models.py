from django.db import models
from cube.models import CubeUser
from viz.models import Viz

class Comment(models.Model):
    viz=models.ForeignKey(Viz)  #the viz that the comment is on
    comment=models.TextField()  #the text of the comment
    commenter=models.ForeignKey(CubeUser)  #the user making the comment
    posted=models.DateTimeField(auto_now_add=True)  #the time when the comment is posted
    def __str__(self):
        return "%s: comment by %s at %s -- %s" %(self.viz.name, self.commenter, self.posted, self.comment)


