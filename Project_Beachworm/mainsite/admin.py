from django.contrib import admin
from .models import *

admin.site.register(Profile)
admin.site.register(Playlist)
admin.site.register(Radio)
admin.site.register(UserArtistSeed)
admin.site.register(UserGenreSeed)
admin.site.register(UserSongPlay)
admin.site.register(UserPlaylistPlay)
admin.site.register(Song)