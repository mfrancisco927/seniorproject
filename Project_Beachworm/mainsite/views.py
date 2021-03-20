from django.shortcuts import render, redirect
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions, status, generics
from rest_framework.views import APIView
from rest_framework_simplejwt import authentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .serializer import *
from .models import *
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import environ
import basicauth
import requests
import json
from random import randint
import random
import datetime
from datetime import timezone

env = environ.Env()
CLIENT_ID = env('CLIENT_ID')
SECRET = env('SECRET')

auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)


class ObtainTokenPairWithAdditionalInfo(TokenObtainPairView):
        permission_classes = (permissions.AllowAny,)
        serializer_class = MyTokenObtainPairSerializer

class UserCreate(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format='json'):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            if User.objects.filter(username=serializer.validated_data['username']).exists():
                return Response({'username': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=serializer.validated_data['email']):
                return Response({'email' : 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            if user:
                json = serializer.data
                # self.update_profile(user_id=user.id)
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_songs(request):
      
	songs = [
        {
            'img':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
            'name': 'Floral Green'
        },
        {
            'img':'https://media.pitchfork.com/photos/5a71df0d85ed77242d8f1252/1:1/w_320/jpegmafiaveteran.jpg',
            'name': 'Veteran'
        },
        {
            'img':'https://i.pinimg.com/originals/78/6e/a3/786ea3d49748ab17966e4301f0f73bb6.jpg',
            'name': "Don't Smile at Me"
        }
    ]

	return Response(songs)

def saveSong(results):
                track_ids = []
                for i in range(len(results['items'])):
                    track_ids.append(results['items'][i]['id'])
                track_features = sp.audio_features(tracks=track_ids)
                #print(track_features)
                for i in range(len(track_ids)):
                    db_track = Song.objects.filter(song_id = track_ids[i])
                    #add track to db if it's not there
                    if not db_track.exists():
                        trackEntry = Song(
                            song_id = results['items'][i]['id'],
                            title = results['items'][i]['name'],
                            artists = results['items'][i]['artists'][0]['name'],
                            danceability = float(track_features[i]['danceability']),
                            energy = float(track_features[i]['energy']),
                            key = float(track_features[i]['key']),
                            loudness = float(track_features[i]['loudness']),
                            mode = float(track_features[i]['mode']),
                            speechiness = float(track_features[i]['speechiness']),
                            acousticness = float(track_features[i]['acousticness']),
                            instrumentalness = float(track_features[i]['instrumentalness']),
                            liveness = float(track_features[i]['liveness']),
                            valence = float(track_features[i]['valence']),
                            tempo = float(track_features[i]['tempo']),
                            duration_ms = float(track_features[i]['duration_ms']),
                            time_signature = int(track_features[i]['time_signature']),
                            img_640 = results['items'][i]['album']['images'][0]['url']
                        )
                        
                        trackEntry.save()

def curateSongs(profile, recommendations) :
    # Curated_recommendations will be sent back to requestor
    curated_recommendations = {}
    curated_recommendations['items'] = []
    number_of_recommendations = 20

    # Go througuh recommendations removing any from user's disliked song list
    counter = 0
    for i in range(len(recommendations['items'])) :
        if not profile.disliked_songs.filter(song_id = recommendations['items'][i]['id']).exists() :
            curated_recommendations['items'].append(recommendations['items'][i])
            counter += 1
        if counter == number_of_recommendations :
            break

    saveSong(curated_recommendations)

    return curated_recommendations

def genreSeedsShuffled(profile) :
    # Get genre seeds for user from database
    genre_seeds_query = UserGenreSeed.objects.filter(user = profile)
    genre_seeds_total = []
    # Put genre seeds into a list
    if genre_seeds_query :
        for genre in genre_seeds_query :
            genre_seeds_total.append(genre.genre_id)
        random.shuffle(genre_seeds_total)

    return genre_seeds_total

def artistSeedsShuffled(profile) :
    # Get artist seeds for user from database
    artist_seeds_query = UserArtistSeed.objects.filter(user = profile)
    # Put artist seeds into a list
    artist_seeds_total = []
    if artist_seeds_query :
        for artist in artist_seeds_query :
            artist_seeds_total.append(artist.artist_id)
        # randomize order in list
        random.shuffle(artist_seeds_total)
    return artist_seeds_total

def songSeedsShuffled(profile) :
    # Get song seeds for user from database
    song_seeds_query = profile.liked_songs.all()
    # Put songs into a list
    song_seeds_total = []
    if song_seeds_query :
        for song in song_seeds_query :
            song_seeds_total.append(song.song_id)
        # randomize
        random.shuffle(song_seeds_total)
    return song_seeds_total

class HelloWorldView(APIView):
    def get(self, request):
        print(self.request.user.id)  # Shows you the ID of who is requesting
        print(self.request)
        return Response(data=self.request.query_params, status=status.HTTP_200_OK)

class ChangePasswordView(generics.UpdateAPIView):
    # Endpoint for changing a password
    serializer_class = ChangePasswordSerializer
    
    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SpotifyStore(APIView):
    # Must be set to all for redirect back from spotify
    def post(self, request, *args, **kwargs):        
        auth_code = request.data['code']      
        state = request.data['state']
        user_id = self.request.user.id
        encode = '%s' % basicauth.encode(CLIENT_ID, SECRET)
        decode = basicauth.decode(encode)

        headers = {'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization' : encode}
        payload = {'grant_type': 'authorization_code', 'code' : '%s' % auth_code, 
                    'redirect_uri':'http://localhost:3000/spotify-auth',}

        r = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=payload)
        response_dict = json.loads(r.text)

        # Save the refresh token to Profile
        try: 
            profile = Profile.objects.get(user=user_id)
            profile.refresh_token = response_dict['refresh_token']
            profile.save()
        except Profile.DoesNotExist:
            return Response({"access_token" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"access_token" : response_dict['access_token']}, status=status.HTTP_200_OK)

class SpotifyRefresh(APIView):

    def get(self, request, *args, **kwargs):
        user_id = self.request.user.id

        try:
            profile = Profile.objects.get(user=user_id)
            refresh_token = profile.refresh_token
        except Profile.DoesNotExist:
            return Response({"access_token" : "error: user does not exst"}, status=status.HTTP_404_NOT_FOUND)

        if refresh_token == "None":
            return Response({"access_token" : "error: no refresh token.  may need to sign in to spotify"}, status=status.HTTP_401_UNAUTHORIZED) 

        encode = '%s' % basicauth.encode(CLIENT_ID, SECRET)
        decode = basicauth.decode(encode)

        headers = {'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization' : '%s' % basicauth.encode(CLIENT_ID, SECRET)}
        payload = {'grant_type': 'refresh_token', 'refresh_token' : '%s' % refresh_token, 
                    'redirect_uri':'http://localhost:3000/spotify-auth',}
        r = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=payload)
        response_dict = json.loads(r.text)

        # Save the refresh token to Profile
        try: 
            profile = Profile.objects.get(user=user_id)
            # In case they send back a different refresh token
            if 'refresh_token' in response_dict.keys():
                profile.refresh_token = response_dict['refresh_token']
                profile.save()
        except Profile.DoesNotExist:
            return Response({"access_token" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)
        if 'access_token' in response_dict.keys():
            return Response({"access_token" : response_dict['access_token']}, status=status.HTTP_200_OK)
        return Response({"access_token" : "Error!  Spotify access may have been revoked"}, status=status.HTTP_401_UNAUTHORIZED)

class Search(APIView):
    # Guests will be allowed to search, so JWT not required
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        types = ['artist', 'track', 'album']
        query = self.request.query_params
        results = {}
        if query['q'] == '' or query['q'] == ';' or query['q'] == '*' or query['q'] == None:
            for type in types:
                results[type + 's'] = {"href" : query['q'], "items" : []}
            results['playlists'] = {"items" : []}
            return Response(data=results, status=status.HTTP_200_OK)
        else:
            for type in types:
                results[type + 's'] = sp.search(q=query['q'], type=type, market='US', limit=10)[type + 's']
                #get track IDs for results and query DB for those songs
                if type == 'track':
                    # Saves songs to database
                    saveSong(results['tracks'])

            #return public playlists whose name contains query
            playlists = list(Playlist.objects.filter(title__icontains=query['q'], is_public=True).values())
            results['playlists'] = {}
            results['playlists']['items'] = playlists

            return Response(data=results, status=status.HTTP_200_OK)

class GetUser(APIView):
    def get(self, request):
        results = {}
        user_id = self.request.user.id
        profile = Profile.objects.get(user=user_id)
        liked_songs = list(profile.liked_songs.values_list('song_id', flat=True))
        following = list(profile.following.values_list('user', flat=True))
        disliked_songs = list(profile.disliked_songs.values_list('song_id', flat=True))
        favorite_playlists = list(profile.favorite_playlists.values_list('id', flat=True))
        results= {'id' : user_id, 'username' : self.request.user.username, 'email' : self.request.user.email, 'liked_songs' : liked_songs,
                'disliked_songs' : disliked_songs, 'following' : following, 'favorite_playlists' : favorite_playlists}
        return Response(data=results, status=status.HTTP_200_OK)

class Genre(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        genre_response = sp.recommendation_genre_seeds()
        # print(json.dumps(genre_response, indent=4))

        return Response(data=genre_response, status=status.HTTP_200_OK)

class GenreSave(APIView):
    def post(self, request):
        # Find profile of request, to save the genre seeds
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except ProfileDoesNotExist :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        genre_formatted = request.POST.getlist("genres[]")

        if genre_formatted:
            for genre in genre_formatted :
                usergenreseed = UserGenreSeed(user = profile, genre_id = genre)
                # Check if this entry already exists, if not save it
                if not UserGenreSeed.objects.filter(user=profile, genre_id = genre).exists():
                    usergenreseed.save()

        return Response({'Status' : 'Genres saved successfully'}, status=status.HTTP_200_OK)

    

class ArtistsFromGenres(APIView):
    def get(self, request):
        # This requires genre seeds to already have been saved

        # Find profile of request, to save the genre seeds
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except ProfileDoesNotExist :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)



        queryGenres = UserGenreSeed.objects.filter(user = profile)
        queryString = ""
        if queryGenres:
            for query in queryGenres :
                queryString += "genre:" + query.genre_id + " OR "
            # Remove last OR
            queryString = queryString[:-3]
            
        else :
            # If no genres exist for user, use the pop genre
            queryString = "genre:pop"
        searchResults = sp.search(q=queryString, type="artist", limit=20)
        # print(json.dumps(searchResults, indent=4))

        return Response(data=searchResults, status=status.HTTP_200_OK)

class ArtistSave(APIView):
    def post(self,request):
        # Find profile of request, to save the genre seeds
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except ProfileDoesNotExist :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        artist_formatted = request.POST.getlist("artists[]")

        if artist_formatted:
            for artist in artist_formatted :
                userartistseed = UserArtistSeed(user = profile, artist_id = artist)
                # Check if entry already exists, if not save
                if not UserArtistSeed.objects.filter(user=profile, artist_id=artist).exists():
                    userartistseed.save()
        return Response({'Status' : 'Artists saved successfully'}, status=status.HTTP_200_OK)

class UserRecommendations(APIView):
    
    def get(self,request):
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except ProfileDoesNotExist :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # These will be passed into recommender function
        seed_tracks = []
        seed_artists = []
        seed_genres = []

        num_songs_liked = profile.liked_songs.all().count()

        
        ################################################################
        #---------------- Less than 10 songs liked ---------------------
        if num_songs_liked <= 10 :
            genre_seeds_total = genreSeedsShuffled(profile)
            artist_seeds_total = artistSeedsShuffled(profile)

            # Generate random number to determine how many genres to put in (at least 1)
            # Check to make sure there are genre seeds
            if genre_seeds_total:
                num_genres = randint(1, len(genre_seeds_total))
                for i in range(num_genres) :
                    seed_genres.append(genre_seeds_total[i])
            if artist_seeds_total:
                num_artists = min(len(artist_seeds_total), 5 - num_genres)
                for i in range(num_artists) :
                    seed_artists.append(artist_seeds_total[i])
                
            if not seed_artists and not seed_genres :
                seed_genres = ['pop']

            recommendations = sp.recommendations(
                                                seed_tracks=seed_tracks, 
                                                seed_artists=seed_artists, 
                                                seed_genres=seed_genres,
                                                country='US',
                                                limit=100
                                                )
         
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')

            curated_recommendations = curateSongs(profile, recommendations)
            
            return Response(data=curated_recommendations, status=status.HTTP_200_OK)


        # ---------------10-30 songs liked  --------------------------------------------
        elif num_songs_liked > 10 and num_songs_liked <= 30 :
            genre_seeds_total = genreSeedsShuffled(profile)
            artist_seeds_total = artistSeedsShuffled(profile)
            
            # Add 1 genre seed and 1 artist seed, if they exist
            if genre_seeds_total :
                seed_genres.append(genre_seeds_total[0])
            if artist_seeds_total :
                seed_artists.append(artist_seeds_total[0])

            song_seed_total = songSeedsShuffled(profile)

            for i in range(5 - len(seed_genres) - len(seed_artists)):
                seed_tracks.append(song_seed_total[i])

            recommendations = sp.recommendations(
                                                seed_tracks=seed_tracks, 
                                                seed_artists=seed_artists, 
                                                seed_genres=seed_genres,
                                                country='US',
                                                limit=100
                                                )
           
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')

            curated_recommendations = curateSongs(profile, recommendations)
            
            return Response(data=curated_recommendations, status=status.HTTP_200_OK)


        # -----------------30 + songs liked --------------------------------------------
        else:
            song_seed_total = songSeedsShuffled(profile)
            
            for i in range(5):
                seed_tracks.append(song_seed_total[i])

            recommendations = sp.recommendations(
                                                seed_tracks=seed_tracks, 
                                                country='US',
                                                limit=100
                                                )
            
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')

            curated_recommendations = curateSongs(profile, recommendations)
            
            return Response(data=curated_recommendations, status=status.HTTP_200_OK)



        return Response({'Error': 'Something went wrong'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

class GenreRecommendations(APIView):
    # This is an open endpoint meaning we can't compare this to a user's current likes/dislikes
    permission_classes = (permissions.AllowAny,)


    def get(self,request):
        query = self.request.query_params
       
        if query['genre'] :
            seed_genre = []
            
            query_cleaned = query['genre'].replace('\'','')
            query_cleaned = query_cleaned.replace('\"','')
            seed_genre.append(query_cleaned)
            recommendations = sp.recommendations(
                                                seed_genres=seed_genre, 
                                                country='US',
                                                limit=20
                                                )
            
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')
            recommendations.pop('seeds')

            saveSong(recommendations)
        
            return Response(data=recommendations, status=status.HTTP_200_OK)
        
        else :
            return Response({'error:', 'genre invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)

class ArtistRecommendations(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self,request):
        query = self.request.query_params
       
        if query['artist'] :
            seed_artist = []
            
            query_cleaned = query['artist'].replace('\'','')
            query_cleaned = query_cleaned.replace('\"','')
            seed_artist.append(query_cleaned)
            recommendations = sp.recommendations(
                                                seed_artists=seed_artist, 
                                                country='US',
                                                limit=20
                                                )
            
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')
            recommendations.pop('seeds')

            saveSong(recommendations)
        
            return Response(data=recommendations, status=status.HTTP_200_OK)
        
        else :
            return Response({'error:', 'artist invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)
      
class SongHistory(APIView):
    #get a user's song history
    def get(self, request):
        user_history = list(UserSongPlay.objects.filter(user=self.request.user.id).order_by('listened_at').values())
        results = {}
        results['history'] = user_history
        return Response(data = user_history , status=status.HTTP_200_OK)

    def post(self, request):
        HISTORY_MAX = 10 #set to 10 for testing purposes, change to 100 when deployed
        query = self.request.query_params
        user_history = UserSongPlay.objects.filter(user=self.request.user.id).order_by('listened_at')
        profile = Profile.objects.filter(user=self.request.user.id).first()
        last_song = Song.objects.filter(song_id=query['song_id']).first()
        #return error if no song or profile found
        if last_song == None:
            return Response({'error:', 'song_id invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)
        if profile == None:
            return Response({'error:', 'profile invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)
        #if at limit, delete oldest song in history, this should never exceed limit, using >= just in case
        if user_history.count() >= HISTORY_MAX:
            #in case it somehow gets to be more than the set limit, take off multiple songs to restore it to limit
            diff = user_history.count() - HISTORY_MAX
            for song in user_history[:diff+1]:
                song.delete()
        song_add = UserSongPlay(
            user = profile,
            song = last_song,
            listened_at = datetime.datetime.now(timezone.utc)
        )
        song_add.save()
        #re-run query to capture changes
        user_history = list(UserSongPlay.objects.filter(user=self.request.user.id).order_by('listened_at').values())
        results = {}
        results['history'] = user_history
        
        return Response(data = results , status=status.HTTP_200_OK)
        
class PlaylistSongs(APIView):
    def get(self, request, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"playlist_songs" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        songs= list(playlist.songs.all().values())
        result = {}
        for i in range((len(songs))):
            result[i]=songs[i] 
        return Response(data = result , status=status.HTTP_200_OK)

    def post(self, request, playlist_id):
        query = self.request.query_params
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"edit_playlist_songs" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        if playlist.owner.user.id == self.request.user.id:
            try:
                song= Song.objects.get(pk=query['id'])
            except:
                return Response({"edit_playlist_songs" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)

            playlist.songs.add(song)
            playlist.save()
            return Response(status=status.HTTP_200_OK)

        return Response({"edit_playlist_songs" : "error: user does not own this playlist"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, playlist_id, playlist_song_id):
        query = self.request.query_params
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"edit_playlist_songs" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        songs= list(playlist.songs.all().values())
    
        if playlist.owner.user.id == self.request.user.id:
            try:
                song= Song.objects.get(pk=songs[query['id']]['song_id'])
            except:
                return Response({"edit_playlist_songs" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)
                
            playlist.songs.remove(song)
            playlist.save()
            return Response(status=status.HTTP_200_OK)

        return Response({"edit_playlist_songs" : "error: user does not own this playlist"}, status=status.HTTP_404_NOT_FOUND)
   

class FollowPlaylist(APIView):
    def post(self, request, user_id, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"follow_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"follow_playlist" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        profile.favorite_playlists.add(playlist)
        profile.save()

        return Response(status=status.HTTP_200_OK)

    def delete(self, request, user_id, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
            return Response({"follow_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"follow_playlist" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        profile.favorite_playlists.remove(playlist)
        profile.save()

        return Response(status=status.HTTP_200_OK)

class ModifyPlaylist(APIView):
    def put(self, request, playlist_id):
        data=self.request.data
        print(data)
        new_name = data['name']
        public = bool(data['public'] == 'true')

        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"modify_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try:
            if new_name is not None:
                playlist.title = new_name
            if public is not None:
                playlist.is_public = public
        except:
             return Response({"modify_playlist" : "error: form data incorrect"}, status=status.HTTP_404_NOT_FOUND)

        playlist.save()
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"modify_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        playlist.delete()

        return Response(status=status.HTTP_200_OK)

class LikeSong(APIView):

    def post(self, request, user_id, song_id):
        print(user_id, song_id)

        try:
            song= Song.objects.get(pk=song_id)
        except:
            return Response({"like_song" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"like_song" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try:
            profile.disliked_songs.remove(song)
        except:
            print("song was not disliked")
        
        profile.liked_songs.add(song)
        profile.save()

        return Response(status=status.HTTP_200_OK)

    def delete(self, request, user_id, song_id):
        print(user_id, song_id)

        try:
            song= Song.objects.get(pk=song_id)
        except:
            return Response({"like_song" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"like_song" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        profile.liked_songs.remove(song)
        profile.save()

        return Response(status=status.HTTP_200_OK)
class DislikeSong(APIView):
    def post(self, request, user_id, song_id):
        print(user_id, song_id)

        try:
            song= Song.objects.get(pk=song_id)
        except:
            return Response({"like_song" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"like_song" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try:
            profile.liked_songs.remove(song)
        except:
            print("song was not liked")
        
        profile.disliked_songs.add(song)
        profile.save()

        return Response(status=status.HTTP_200_OK)

    def delete(self, request, user_id, song_id):
        print(user_id, song_id)

        try:
            song= Song.objects.get(pk=song_id)
        except:
            return Response({"dislike_song" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"dislike_song" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        profile.disliked_songs.remove(song)
        profile.save()

        return Response(status=status.HTTP_200_OK)


