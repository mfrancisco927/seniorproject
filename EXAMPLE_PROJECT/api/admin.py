from django.contrib import admin

# Register your models here.

from .models import *

admin.site.register(Task)
admin.site.register(Profile)
admin.site.register(Playlist)
admin.site.register(Song)
admin.site.register(Radio)
admin.site.register(UserArtistSeed)
admin.site.register(UserGenreSeed)
admin.site.register(UserSongPlay)
admin.site.register(UserPlaylistPlay)