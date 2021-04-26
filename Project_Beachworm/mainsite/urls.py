"""mainsite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
from .views import *
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/get-songs/', views.get_songs),
    path('api/user/create/', UserCreate.as_view(), name='create_user'),
    path('api/token/obtain/', ObtainTokenPairWithAdditionalInfo.as_view(), name='token_create'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/spotify/store-credential/', SpotifyStore.as_view(), name='spotify-store-initial'),
    path('api/spotify/refresh-token/', SpotifyRefresh.as_view(), name='spotify-refresh-token'),
    path('api/user/current/', GetUser.as_view(), name='get_current_user'),
    path('api/user/deactivate/', Deactivate.as_view(), name='deactivate'),
    path('api/user/reactivate/<user_id>/', Reactivate.as_view(), name='reactivate'),
    path('api/user/image/', UserImage.as_view(), name='user-image'),
    path('api/search/', Search.as_view(), name='search'),
    # Initial user creation recommendation seed endpoints
    path('api/recommendation/obtain-genres/', Genre.as_view(), name='genre-obtain'),
    path('api/user/profile/seed/genres/', GenreSave.as_view(), name='genre-save'),
    path('api/recommendation/obtain-artists/', ArtistsFromGenres.as_view(), name='artist-from-genres'),
    path('api/user/profile/seed/artists/', ArtistSave.as_view(), name='artist-save'),
    path('api/user/profile/get-seeds/', GetUserSeeds.as_view(), name='user-seeds'),
    # Recommendation endpoints
    path('api/recommendation/user/', UserRecommendations.as_view(), name='recommendations-user'),
    path('api/recommendation/genre/', GenreRecommendations.as_view(), name='recommendations-genre'),
    path('api/recommendation/artist/', ArtistRecommendations.as_view(), name='recommendations-artist'),
    path('api/recommendation/home/', HomeRecommendations.as_view(), name='recommendations-home'),
    path('api/recommendation/song/', SongRecommendations.as_view(), name='recommendations-song'),
    path('api/recommendation/album/', AlbumRecommendations.as_view(), name='recomendations-album'),
    # This will be a little different TODO add api/recommendations/playlist
    #songhistory endpoint, to add song to history pass songID after ending '/' in a post request
    path('api/history/', SongHistory.as_view(), name='user-song-history'),
    path('api/users/<user_id>/profile/', Getprofile.as_view(), name='profile'),
    #post request to follow, delete request to unfollow
    path('api/users/profile/following/<profile>/', FollowToggle.as_view(), name='follow-unfollow'),
    #get request to retrieve user's fav playlists, post to add to user's fav playlists
    path('api/user/<user_id>/playlists/', UserPlaylists.as_view(), name='follow-unfollow'),
    # A testing path
    path('api/hello/', HelloWorldView.as_view(), name='hello_world'),

    #Playlist Endpoints
    path('api/playlists/<playlist_id>/songs/', PlaylistSongs.as_view(), name='playlist_songs'),
    path('api/users/<user_id>/followed-playlists/<playlist_id>/', FollowPlaylist.as_view(), name='follow_playlist'),
    path('api/playlists/<playlist_id>/', ModifyPlaylist.as_view(), name='modify_playlist'),
    path('api/playlists/<playlist_id>/image/', PlaylistImage.as_view(), name='playlist-image'),
    #returns users listening history formatted as a playlist, use GET
    path('api/playlists/history/songs/', SongHistory.as_view(), name='user_history_playlist'),
    #path('api/playlists/<playlist_id>/<playlist_song_id>/', DeletePlaylistSongs.as_view(), name='edit_playlist_songs'),
    path('api/playlists/copy/<playlist_id>/', PlaylistCopy.as_view(), name='playlist-copy'),

    #Song Endpoints
    path('api/history/<user_id>/likes/<song_id>/', LikeSong.as_view(), name='song_like'),
    path('api/history/<user_id>/dislikes/<song_id>/', DislikeSong.as_view(), name='song_dislike'),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)