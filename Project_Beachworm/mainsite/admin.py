from django.contrib import admin
from .models import *

class IDAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(Profile)
admin.site.register(Playlist, IDAdmin)
admin.site.register(Radio, IDAdmin)
admin.site.register(UserArtistSeed, IDAdmin)
admin.site.register(UserGenreSeed, IDAdmin)
admin.site.register(UserSongPlay, IDAdmin)
admin.site.register(UserPlaylistPlay, )
admin.site.register(Song)