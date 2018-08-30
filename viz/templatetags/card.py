from django.core.exceptions import ObjectDoesNotExist
from django import template
from viz.models import *
from django.conf import settings
import logging

register = template.Library()
log = logging.getLogger(__name__)

@register.inclusion_tag('viz/card.html')
def card(viz, nextPage=None, filter=None):
    if nextPage is not None:
        return { 'viz' : viz, 'nextPage' : nextPage, 'filter': filter}
    else:
        return { 'viz' : viz }

@register.inclusion_tag('viz/jscard.html')
def jscard(viz, nextPage=None):
    try:
        source = SourceCode.objects.filter(viz=viz)[:1]
        source = source[0]
    except Exception,e:
        source=None
    return { 'viz': viz, 'source': source}
