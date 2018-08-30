from django import template
register = template.Library()

@register.assignment_tag(takes_context=True)
def logged_in_status(context):
    request = context['request']
    return (('nickname' in request.COOKIES) and ('accessToken' in request.COOKIES))