from django.core.urlresolvers import reverse
from django.conf import settings # import the settings file

def listeners(request):
    flashWebsocketsListener=reverse('flashWebsocketsListener', args=["coreId", "processor"])
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'WEBSOCKETS_LISTENER': settings.WEBSOCKETS_LISTENER, 'WEBSOCKETS_PHOTON_LISTENER': settings.WEBSOCKETS_PHOTON_LISTENER, 'FLASH_WEBSOCKETS_LISTENER': flashWebsocketsListener, 'STATIC_ROOT': settings.STATIC_URL}
