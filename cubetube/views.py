from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from cube.models import CubeUser
from viz.models import Binary
from django.views.decorators.csrf import csrf_exempt
from utils.strings import *
from django.conf import settings
import subprocess

@csrf_exempt
def login(request):
    email=request.POST['email']
    accessToken=request.POST['accessToken']
    try:
        user=CubeUser.objects.filter(email=email).get()
    except CubeUser.DoesNotExist:
        user = None
    if user:
        if accessToken==user.accessToken:
            response='{ "status":"ok", "nickname":"%s"}' % user.nickname
        else:
            user.accessToken=accessToken
            user.save()
            response='{ "status":"ok", "nickname":"%s"}' % user.nickname
    else:
        response='{"status":"newUser"}'

    return HttpResponse(response, content_type="application/json")


@csrf_exempt
def newUser(request):
    email = request.POST['email']
    accessToken = request.POST['accessToken']
    nickname = request.POST['nickname']

    user=CubeUser.objects.filter(email=email).exists()
    names=CubeUser.objects.filter(nickname__iexact=nickname)  #ignore case

    # No current user exists
    if not user:
        if not check(nickname):
            response='{ "success": False, "status":"error", "error", "nickname cannot contain spaces or funky characters"}'
        # Nickname is not being used.
        else:
            if names.count()==0:
                user=CubeUser()
                user.email=email
                user.accessToken=accessToken
                user.nickname=nickname
                user.save()
                response='{ "status":"ok" , "nickname": "%s"}' %nickname
            else:
                response='{ "success": False, "status":"error", "error":"nickname already exists in database"}'
    else:
        response='{ "success": False, status":"error", "error":"user already exists in database"}'

    return HttpResponse(response, content_type="application/json")

@csrf_exempt
def flash(request, id):
    accessToken=request.POST['accessToken']
    coreID=request.POST['coreID']
    binary=Binary.objects.get(pk=id)
    viz=binary.viz
    viz.views=viz.views+1
    viz.save()
    p = subprocess.Popen(['node', '%s/cubetube/utils/spark/flash.js' % settings.PROJECT_ROOT ,accessToken, coreID, "/media/%s" % binary.file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output=[]
    for line in p.stdout.readlines():
        print line,
        line.replace('"','\\"')
        line.replace("'","\\'")
        output.append(line)

    error=[]
    for line in p.stderr.readlines():
        print line,
        line.replace('"','\\"')
        line.replace("'","\\'")
        error.append(line)

    retval = p.wait()
    response='{ "status":"ok" , "output": "%s" , "error" : "%s", "filepath", "%s"}' % (output, error, binary.file.path)
    return HttpResponse(response, content_type="application/json")


def docs(request):
    return render(request, "cubetube/docs.html")    
#    return render(request, "cubetube/hackpad-docs.html")    


def forum(request):
    return render(request, "cubetube/forum.html")    
