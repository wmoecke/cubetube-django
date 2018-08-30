from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from comments.models import Comment
from cube.models import CubeUser
from viz.models import Viz
from viz.views import authenticate
from django.views.decorators.csrf import csrf_exempt
import logging
log = logging.getLogger(__name__)

@csrf_exempt
def newComment(request):
    nickname=request.COOKIES['nickname']
    accessToken=request.COOKIES['accessToken']
    if authenticate(nickname, accessToken):
        comment=Comment()
        commenter=CubeUser.objects.get(nickname=nickname)
        comment.commenter=commenter
        comment.comment=request.POST['comment']
        id=request.POST['viz']
        viz=Viz.objects.get(pk=id)
        comment.viz=viz
        comment.save()
        response='{ "status":"ok", "nickname":"%s"}' % nickname            
    else: 
       response='{ "status":"error", "error":"user is not authenticated"}'       
    return HttpResponse(response, content_type="application/json")

