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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/get-songs/', views.get_songs),
    path('api/user/create/', UserCreate.as_view(), name='create_user'),
    path('api/token/obtain/', ObtainTokenPairWithAdditionalInfo.as_view(), name='token_create'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/spotify/store-credential/', SpotifyStore.as_view(), name='spotify-store-initial'),
    path('api/spotify/refresh-token/', SpotifyRefresh.as_view(), name='spotify-refresh-token'),
    path('api/user/current/', GetUser.as_view(), name='get_current_user'),

    path('api/search/', Search.as_view(), name='search'),
    # Initial user creation recommendation seed endpoints
    path('api/recommendation/obtain-genres/', Genre.as_view(), name='genre-obtain'),
    path('api/user/profile/seed/genres/', GenreSave.as_view(), name='genre-save'),
    path('api/recommendation/obtain-artists/', ArtistsFromGenres.as_view(), name='artist-from-genres'),
    path('api/user/profile/seed/artists/', ArtistSave.as_view(), name='artist-save'),
    # Recommendation endpoints
    path('api/recommendation/user/', UserRecommendations.as_view(), name='recommendations-user'),
    path('api/recommendation/genre/', GenreRecommendations.as_view(), name='recommendations-genre'),
    path('api/recommendation/artist/', ArtistRecommendations.as_view(), name='recommendations-artist'),
    path('api/recommendation/home/', HomeRecommendations.as_view(), name='recommendations-home'),
    # This will be a little different TODO add api/recommendations/playlist
    #songhistory endpoint, to add song to history pass songID after ending '/' in a post request
    path('api/history/', SongHistory.as_view(), name='user-song-history'),
    # A testing path
    path('api/hello/', HelloWorldView.as_view(), name='hello_world'),

    #Playlist Endpoints
    path('api/playlists/<playlist_id>/songs/', PlaylistSongs.as_view(), name='playlist_songs'),
    path('api/users/<user_id>/followed-playlists/<playlist_id>/', FollowPlaylist.as_view(), name='follow_playlist'),
    path('api/playlists/<playlist_id>/', ModifyPlaylist.as_view(), name='modify_playlist'),
    #path('api/playlists/<playlist_id>/<playlist_song_id>/', DeletePlaylistSongs.as_view(), name='edit_playlist_songs'),

    #Song Endpoints
    path('api/history/<user_id>/likes/<song_id>/', LikeSong.as_view(), name='song_like'),
    path('api/history/<user_id>/dislikes/<song_id>/', DislikeSong.as_view(), name='song_dislike'),
    
]
