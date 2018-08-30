from django.db import models

class CubeUser(models.Model):
    email=models.TextField()
    accessToken=models.TextField()
    nickname=models.TextField()
    def __str__(self):
        return "%s" % (self.nickname)

class Cube(models.Model):
    coreName=models.TextField()
    coreID=models.TextField()
    firmware=models.TextField()
    def __str__(self):
        return "%s, ID %s, running $s" % (self.coreName, self.coreID, self.firmware)
