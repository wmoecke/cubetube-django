from django.core.exceptions import ObjectDoesNotExist
from django import template
from viz.models import Viz, Photo
from django.conf import settings
register = template.Library()
import logging
log = logging.getLogger(__name__)

@register.inclusion_tag('viz/thumbnail.html')
def thumbnail(viz, nextPage=None, vizType=None, filter=None):
    try:
        photo=Photo.objects.filter(viz=viz)[:1]  #get the main image associated with this viz, and use it as the photo                                                              
        photo=photo[0]
        log.debug("photo is %s, url is %s" %(photo, photo.file.url))
        thumbnailPhotoURL=photo.file.url
        log.debug("fixed photo url is %s" % thumbnailPhotoURL)
    except Exception,e:
        photo=None
        thumbnailPhotoURL=None
        log.debug(e)
    if nextPage is not None:
            return { 'viz' : viz, 'thumbnailPhoto' : photo, 'nextPage' : nextPage, 'vizType' : vizType, 'thumbnailPhotoURL' :thumbnailPhotoURL, 'filter': filter}
    else:
        return { 'viz' : viz, 'thumbnailPhoto' : photo , 'thumbnailPhotoURL' :thumbnailPhotoURL}


@register.inclusion_tag('viz/jsthumbnail.html')
def jsthumbnail(viz, nextPage=None, vizType=None, filter=None):
    try:
        source=SourceCode.objects.filter(viz=viz)[:1]  #get the main image associated with this viz, and use it as the photo                                                              
        source=source[0]
    except Exception,e:
        source=None
    if nextPage is not None:
            return { 'viz' : viz, 'nextPage' : nextPage, 'source':source, 'filter': filter}
    else:
        return { 'viz' : viz, 'source', source}

