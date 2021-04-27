from django.shortcuts import render, redirect
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
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
from random import randrange
import random
import datetime
from datetime import timezone
from django.db.models import Q
from rest_framework.parsers import FileUploadParser

env = environ.Env()
CLIENT_ID = env('CLIENT_ID')
SECRET = env('SECRET')


auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

# Number of recommendations that the default recommendation endpoints return
RECOMMENDATION_NUMBER = 20
HOME_RECOMMENDATION_NUMBER = 7

class ObtainTokenPairWithAdditionalInfo(TokenObtainPairView):
        permission_classes = (permissions.AllowAny,)
        serializer_class = MyTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

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

        # check if it has an image, if it does make it img_640
        if results['items'][i]['album']['images']:
            track_image = results['items'][i]['album']['images'][0]['url']
        else:
            track_image = 'https://imgur.com/a/RMIhpXF'

        if not db_track.exists():
            try: 
                trackEntry = Song(
                    song_id = results['items'][i]['id'],
                    title = results['items'][i]['name'],
                    album = results['items'][i]['album']['name'],
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
                    img_640 = track_image,
                )
                trackEntry.save()

                for artist in results['items'][i]['artists']:
                    # print(artist['name'])
                    artist_query = Artist.objects.filter(artist_name = artist['name'])
                    #add the artist if not already there
                    if not artist_query.exists():
                        new_artist = Artist(artist_name = artist['name'])
                        new_artist.save()
                    #use existing artist if in db already
                    else:
                        new_artist = artist_query.first()
                    # print(new_artist)
                    trackEntry.artists.add(new_artist)
            except:
                pass

def curateSongs(profile, recommendations, recommendation_number) :
    # Curated_recommendations will be sent back to requestor
    curated_recommendations = {}
    curated_recommendations['items'] = []
    number_of_recommendations = recommendation_number

    # Go througuh recommendations removing any from user's disliked song list
    counter = 0
    for i in range(len(recommendations['items'])) :
        # if a profile exists
        if profile:
            if not profile.disliked_songs.filter(song_id = recommendations['items'][i]['id']).exists() :
                curated_recommendations['items'].append(recommendations['items'][i])
                counter += 1
        else:
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


def artistsFromSongs(spotifyRecs):
    artist_ids = []
    for i in range(len(spotifyRecs['items'])):
        for artist in spotifyRecs['items'][i]['artists']:
            if artist['id'] not in artist_ids:
                artist_ids.append(artist['id'])
                # Artists cannot exceed 50
                if len(artist_ids) > 48:
                    break
            if len(artist_ids) > 48:
                break
        if len(artist_ids) > 48:
            break
    
    random.shuffle(artist_ids)
    artist_info = sp.artists(artist_ids)
    
    return artist_info

def genresFromArtists(artist_info, number_of_genres):
    genre_ids_raw = []
    sp_genre_json = sp.recommendation_genre_seeds()
    acceptable_genres = sp_genre_json['genres']
    # Add ALL genres listed in artist_info (including duplicates)
    for i in range(len(artist_info['artists'])):
        for genre in artist_info['artists'][i]['genres']:
            # Not all genres listed for an artist are seeds able to be used
            # in recommendations
            if genre in acceptable_genres:
                genre_ids_raw.append(genre)

    # Select unique IDs, since we are selecting from a duplicate array
    # preference is given to most commonly found genres from artists
    genre_ids = []
    
    for genre in genre_ids_raw:
        if genre not in genre_ids:
            genre_ids.append(genre)
        if len(genre_ids) >= 10:
            break

    return genre_ids



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

            #return public playlists whose name, description or creator's name contains query
            #search by owner's username - get list of user ids whose usernames match qstring, then filter for playlists owned by users in that set
            query_no_whitespace = str(query['q']).replace(' ', '')
            print(query_no_whitespace)
            pl_users = list(User.objects.filter(username__icontains=query_no_whitespace, is_active=True).values_list('id', flat=True))
            playlists1 = Playlist.objects.filter(owner__in=pl_users, is_public=True)
            #search by playlist name or description
            params = Q(title__icontains=query['q']) | Q(description__icontains=query['q'])
            playlists2 = Playlist.objects.filter(params, is_public=True)
            playlists = playlists1 | playlists2
            playlists = list(playlists.values())           
            results['playlists'] = {}
            results['playlists']['items'] = playlists
            #add users to results
            users = list(User.objects.filter(username__icontains=query_no_whitespace, is_active=True).values())
            
            users = clean_users(users)
            for user in users:
                try : 
                    profile = Profile.objects.get(user=user['id'])
                except :
                    user['image'] = None
                    continue
                if profile.image:
                    user['image'] = str(profile.image)
                else:
                    user['image'] = None

            results['users'] =  users
            print(users)
            


            return Response(data=results, status=status.HTTP_200_OK)

def clean_users(users):
    for i in range(0, len(users)):
        #clean unnecessary keys and refresh token
        del users[i]['password']
        del users[i]['last_login']
        del users[i]['is_superuser']
        del users[i]['first_name']
        del users[i]['last_name']
        del users[i]['email']
        del users[i]['is_staff']
        del users[i]['is_active']
        del users[i]['date_joined']

    return users

class GetUser(APIView):
    def get(self, request):
        results = {}
        user_id = self.request.user.id
        profile = Profile.objects.get(user=user_id)
        followers = list(Profile.objects.filter(following=user_id).values())
        followers = clean_profiles(followers)
        following = list(profile.following.values())
        following = clean_profiles(following)
        liked_songs = list(profile.liked_songs.values('song_id', 'title', 'duration_ms'))
        for i in range(len(liked_songs)):
            song = Song.objects.get(song_id = liked_songs[i]['song_id'])
            liked_songs[i]['artists'] = list(song.artists.values_list('artist_name', flat=True))
        disliked_songs = list(profile.disliked_songs.values_list('song_id', flat=True))
        #playlists that a user follows but does not own
        favorite_playlists = list(profile.favorite_playlists.filter(~Q(owner=profile)).values())
        #playlists that a user owns, private and public
        users_playlists = list(Playlist.objects.filter(Q(owner=profile)).values())
        if profile.image:
            imagepath = str(profile.image)
        else:
            imagepath = None 
        results = {'user_id' : int(user_id), 'username' : self.request.user.username, 'following' : following, 'followers' : followers, 
                'favorite_playlists' : favorite_playlists, 'users_playlists' : users_playlists, 'liked_songs' : liked_songs,
                'disliked_songs' : disliked_songs, 'image' : imagepath}
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
        except :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        genre_formatted = self.request.POST.getlist('genres[]')

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
        except :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)



        queryGenres = UserGenreSeed.objects.filter(user = profile)
        searchResults = {"artists": {"items" : []}}
        arrayArtists = []
        counter = 0
        if queryGenres:
            for query in queryGenres :
                if counter <= 4 :
                    searchq = "genre:" + query.genre_id
                    tempQuery = sp.search(q=searchq, type="artist", limit=25)
                    if len(tempQuery["artists"]['items']) > 1:
                        for artist in tempQuery["artists"]["items"] :
                            arrayArtists.append(artist)
                    counter += 1
                else: 
                    break

        else :
            # If no genres exist for user, use the pop genre
            searchResults = sp.search(q="genre:pop", type="artist", limit=20)
        random.shuffle(arrayArtists)
        i = 0
        searchResultsID = []
        while i < min(len(arrayArtists), 20):
            if arrayArtists[i]['id'] not in searchResultsID:
                searchResults["artists"]["items"].append(arrayArtists[i])
                searchResultsID.append(arrayArtists[i]['id'])
        # searchResults = sp.search(q=queryString, type="artist", limit=20)
            i += 1

        return Response(data=searchResults, status=status.HTTP_200_OK)

class ArtistSave(APIView):
    def post(self,request):
        # Find profile of request, to save the genre seeds
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except :
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
        except:
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
                num_genres = randint(1, min(4,len(genre_seeds_total)))
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

            curated_recommendations = curateSongs(profile, recommendations, RECOMMENDATION_NUMBER)
            
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

            curated_recommendations = curateSongs(profile, recommendations, RECOMMENDATION_NUMBER)
            
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

            curated_recommendations = curateSongs(profile, recommendations, RECOMMENDATION_NUMBER)
            
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
            return Response({'error:': 'genre invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)

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
            
            # get songs from that artist
            artist_info = sp.artist(seed_artist[0])
            search_string = "artist:" + artist_info['name']
            artist_tracks = sp.search(search_string, type='track', market='US', limit=50)

            # Some artists have NO recommendations returned
            if not recommendations['items']:
                just_artist_tracks = {}
                just_artist_tracks['items'] = artist_tracks['tracks']['items']
                return Response(data=just_artist_tracks, status=status.HTTP_200_OK)

            # randomly pick one and add to recommendations
            len_artist_track = len(artist_tracks['tracks']['items'])
            rand_track = artist_tracks['tracks']['items'][randrange(0,len_artist_track)]
            # make sure selected track isn't already in Recommendations
            no_dups = True
            for rec in recommendations['items']:
                if rec['id'] == rand_track['id']:
                    recommendations['items'].remove(rec)
                    no_dups = False
                    break
            # if none were taken off, remove first one
            if no_dups:
                recommendations['items'].pop()

            # Add random recommendation to the front of the list     
            recommendations['items'].insert(0, rand_track)

            

            saveSong(recommendations)
        
            return Response(data=recommendations, status=status.HTTP_200_OK)
        
        else :
            return Response({'error:': 'artist invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)
      
class SongHistory(APIView):
    #get a user's song history formatted as a playlist
    def get(self, request):
        user_history = list(UserSongPlay.objects.filter(user=self.request.user.id).order_by('listened_at').values_list('song_id', flat=True))
        #get a list of song objects with duplicates, and add artists
        songs = {}
        for i in range (len(user_history)):
            song = list(Song.objects.filter(song_id=user_history[i]).values())
            songs[i] = song[0]
            song = Song.objects.get(song_id = songs[i]['song_id'])
            songs[i]['artists'] = list(song.artists.values_list('artist_name', flat=True))
        return Response(data = songs , status=status.HTTP_200_OK)

    def post(self, request):
        HISTORY_MAX = 100 #track last 100 songs a user played
        query = self.request.query_params
        user_history = UserSongPlay.objects.filter(user=self.request.user.id).order_by('listened_at')
        profile = Profile.objects.filter(user=self.request.user.id).first()
        last_song = Song.objects.filter(song_id=query['song_id']).first()
        #return error if no song or profile found
        if last_song == None:
            return Response({'error:', 'song_id invalid or missing'}, status=status.HTTP_404_NOT_FOUND)
        if profile == None:
            return Response({'error:', 'profile invalid or missing'}, status=status.HTTP_404_NOT_FOUND)
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
        if playlist_id != 'liked' and playlist_id != 'disliked':
            try:
                playlist = Playlist.objects.get(pk=playlist_id)
            except:
                return Response({"playlist_songs" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)
            
            playlist_songs = SongPlaylist.objects.filter(Playlist__id=playlist_id).values()
            
            for i in range(len(playlist_songs)):
                song = Song.objects.get(song_id=playlist_songs[i]['song_id'])
                song_data = SongSerializer(song).data
                song_data['artists'] = list(song.artists.values_list('artist_name', flat=True))
                playlist_songs[i]['song'] = song_data

            return Response(data=playlist_songs, status=status.HTTP_200_OK)

        else:
            # Get requestor's profile
            try : 
                profile = Profile.objects.get(user=self.request.user.id)
            except:
                return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

            # Return liked or disliked songs
            if playlist_id == 'liked' or playlist_id == 'disliked':
                try:
                    relevant_song_cursor = profile.liked_songs if playlist_id == 'liked' else profile.disliked_songs
                    relevant_songs = list(relevant_song_cursor.all().values())
                except:
                    return Response({'error': 'error retrieving songs'}, status=status.HTTP_404_NOT_FOUND)

                for i in range(len(relevant_songs)):
                    song = Song.objects.get(song_id=relevant_songs[i]['song_id'])
                    song_data = SongSerializer(song).data
                    song_data['artists'] = list(song.artists.values_list('artist_name', flat=True))
                    relevant_songs[i]['song'] = song_data
                return Response(data=relevant_songs, status=status.HTTP_200_OK)

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

            SongPlaylist.objects.create(Playlist=playlist, song=song)
            return Response(status=status.HTTP_200_OK)

        return Response({"edit_playlist_songs" : "error: user does not own this playlist"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, playlist_id):
        query = self.request.query_params
        try:
            playlist = Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"edit_playlist_songs" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        songs= list(playlist.songs.all().values())
        if playlist.owner.user.id == self.request.user.id:
            try:
                SongPlaylist.objects.get(pk=query['id']).delete()
            except:
                return Response({"edit_playlist_songs" : "error: song does not exist"}, status=status.HTTP_404_NOT_FOUND)
                
            return Response(status=status.HTTP_200_OK)

        return Response({"edit_playlist_songs" : "error: user does not own this playlist"}, status=status.HTTP_404_NOT_FOUND)
   

class FollowPlaylist(APIView):
    def post(self, request, user_id, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"follow_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try: 
            if int(self.request.user.id) != int(user_id):
                return Response({"error" : "cannot add to someone else's followed playlists"}, status=status.HTTP_403_FORBIDDEN) 
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
            if int(self.request.user.id) != int(user_id):
                return Response({"error" : "cannot delete from someone else's followed playlists"}, status=status.HTTP_403_FORBIDDEN) 
            profile = Profile.objects.get(user=user_id)
        except Profile.DoesNotExist:
            return Response({"follow_playlist" : "error: user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        profile.favorite_playlists.remove(playlist)
        profile.save()

        return Response(status=status.HTTP_200_OK)

class ModifyPlaylist(APIView):
    def put(self, request, playlist_id):
        data=self.request.data

        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"modify_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try:
            new_name = data['title']
            playlist.title = new_name
            
            public = bool(data['public'])
            playlist.is_public = public
            
            new_desc = data['description']
            playlist.description = new_desc
        except:
             return Response({"modify_playlist" : "error: form data incorrect"}, status=status.HTTP_404_NOT_FOUND)

        playlist.save()
        serializer = PlaylistSerializer(playlist)
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    def delete(self, request, playlist_id):
        try:
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
           return Response({"modify_playlist" : "error: playlist does not exist"}, status=status.HTTP_404_NOT_FOUND)

        playlist.delete()

        return Response(status=status.HTTP_200_OK)

class LikeSong(APIView):

    def post(self, request, user_id, song_id):
        # print(user_id, song_id)

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
        # print(user_id, song_id)

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
        # print(user_id, song_id)

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
        # print(user_id, song_id)

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

def clean_profiles(profiles):
    for i in range(0, len(profiles)):
        #clean unnecessary keys and refresh token
        del profiles[i]['refresh_token']
        del profiles[i]['created_at']
        del profiles[i]['updated_at']
        id = profiles[i]['user_id']
        username = str(User.objects.get(id=id))
        profiles[i]['username'] = username

    return profiles

class Getprofile(APIView):
    #permission_classes = (permissions.AllowAny,)
    #for viewing profiles of other users
    def get(self, request, user_id):
        user = User.objects.filter(id=user_id, is_active=True).first()
        if user == None:
            return Response({'error:', 'user not found'}, status=status.HTTP_404_NOT_FOUND)
        username = str(User.objects.get(id=user_id))
        profile = Profile.objects.get(user=user_id)
        followers = list(Profile.objects.filter(following=user_id, user__is_active=True).values())
        followers = clean_profiles(followers)
        print(followers)
        following = list(profile.following.filter(user__is_active=True).values())
        following = clean_profiles(following)
        #playlists that this user follows but does not own
        favorite_playlists = list(profile.favorite_playlists.filter(~Q(owner=profile), owner__user__is_active=True, is_public=True).values())
        #public playlists owned by this user
        public_playlists = list(Playlist.objects.filter(owner=profile, is_public=True).values()) 
        # get image if exists:
        if profile.image:
            imagepath = str(profile.image)
        else:
            imagepath = None 
        results = {'user_id' : int(user_id), 'username' : str(username), 'following' : following, 'followers' : followers, 
                'favorite_playlists' : favorite_playlists, 'public_playlists' : public_playlists, 'image' : imagepath}
        return Response(data=results, status=status.HTTP_200_OK)

class FollowToggle(APIView):
    #follow another user
    def post(self, request, profile):
        sending_user = self.request.user.id
        target_user = User.objects.filter(id=profile, is_active=True).first()
        sending_user_profile = Profile.objects.get(user=sending_user)
        following = list(sending_user_profile.following.values_list('user', flat=True))
        #if sending_user already follows target user, return error
        if target_user.id in following:
            msg = 'user ' + str(sending_user) + ' already follows user ' + str(target_user.id)
            #not sure what status to return here, just using 400 for now
            return Response({'error:', msg }, status=status.HTTP_400_BAD_REQUEST)
        sending_user_profile.following.add(target_user.id)
        sending_user_profile.save()
        msg = 'user ' + str(sending_user) + ' followed user ' + str(target_user.id)

        return Response(data={'success' : msg}, status=status.HTTP_200_OK)

    #unfollow another user
    def delete(self, request, profile):
        sending_user = self.request.user.id
        target_user = User.objects.filter(id=profile).first()
        sending_user_profile = Profile.objects.get(user=sending_user)
        following = list(sending_user_profile.following.values_list('user', flat=True))
        #if sending_user does not follow target user, return error
        if target_user.id not in following:
            msg = 'user ' + str(sending_user) + ' does not follow user ' + str(target_user.id)
            return Response({'error:', msg }, status=status.HTTP_400_BAD_REQUEST)
        sending_user_profile.following.remove(target_user.id)
        sending_user_profile.save()
        msg = 'user ' + str(sending_user) + ' unfollowed user ' + str(target_user.id)
        
        return Response(data={'success' : msg}, status=status.HTTP_200_OK)

class UserPlaylists(APIView):
    #get a user's favorite playlists
    def get(self, request, user_id):
        #if requesting user is looking at another user, return only public playlists
        profile = Profile.objects.get(user=user_id)
        if int(self.request.user.id) != int(user_id):
            favorite_playlists = list(profile.favorite_playlists.filter(is_public=True).values_list('id', flat=True))
            results = {'user' : user_id, 'favorite_playlists' : favorite_playlists}
        else:
            favorite_playlists = list(profile.favorite_playlists.values_list('id', flat=True))
            results = {'user' : user_id, 'favorite_playlists' : favorite_playlists}
        return Response(data=results, status=status.HTTP_200_OK)
    
        #create a new playlist
    def post(self, request, user_id):
        #requesting user must be same as user id (users cannot make playlists for other users)
        if int(self.request.user.id) != int(user_id):
            return Response(data={'error' : 'user_id must be the same as requesting user'}, status=status.HTTP_403_FORBIDDEN)
        profile = Profile.objects.get(user=user_id)
        title = self.request.query_params['title']
        is_public = self.request.query_params['is_public'] == 'true'
        description = self.request.query_params['desc']
        new_playlist = Playlist(title=title, is_public=is_public, description=description, owner=profile)
        new_playlist.save()
        added_playlist = list(Playlist.objects.filter(id=new_playlist.id).values())
        results={'new_playlist' : added_playlist}
        return Response(data=results, status=status.HTTP_201_CREATED)

class HomeRecommendations(APIView):
    permission_classes = (permissions.AllowAny,)

    # Home Recommendations come from 1 genre seed, 1 artist seed, and 3 song seeds if they exist
    def get(self, request):
        user_id = self.request.user.id
        print(user_id)
        # profile is null unless JWT request
        profile = None
        try : 
            profile = Profile.objects.get(user=user_id)
        except :
            pass
        
        # These will be passed into recommender function
        seed_tracks = []
        seed_artists = []
        seed_genres = []

        # If the user exists (JWT), popualte with user info
        if user_id:
            genre_seeds_total = genreSeedsShuffled(profile)
            artist_seeds_total = artistSeedsShuffled(profile)
            
            # Add 1 artist seed, if they exist
            if genre_seeds_total :
                seed_genres.append(genre_seeds_total[0])
            if artist_seeds_total :
                seed_artists.append(artist_seeds_total[0])

            song_seed_total = songSeedsShuffled(profile)

            for i in range(min(len(song_seed_total), 5 - len(seed_genres) - len(seed_artists))):
                seed_tracks.append(song_seed_total[i])

        # If no seeds exist, seed with genre pop only
        if (not seed_artists) and (not seed_tracks) and (not seed_genres):
            seed_genres = ['rock', 'rap', 'alternative', 'pop', 'electronic']

        recommendations = sp.recommendations(
                                            seed_tracks=seed_tracks, 
                                            seed_artists=seed_artists, 
                                            seed_genres=seed_genres,
                                            country='US',
                                            limit=100
                                            )
        
        # must turn tracks into items to make dict same as search dict
        recommendations['items'] = recommendations.pop('tracks')

        
        # Use songs -> rec artists -> rec genres
        # if profile exists, curate songs against profile
        if profile:
            curated_recommendations = curateSongs(profile, recommendations,35)
        # if profile does not exist (guest), just curate songs 
        else:
            curated_recommendations = curateSongs(None, recommendations,35)
        curated_artists = artistsFromSongs(curated_recommendations)
        curated_genres = genresFromArtists(curated_artists, HOME_RECOMMENDATION_NUMBER)

        home_recommendations = {}
        home_recommendations['tracks'] = []
        home_recommendations['artists'] = []
        # Genres number limit already enforced
        home_recommendations['genres'] = curated_genres

        for rec in curated_recommendations['items']:
            if len(home_recommendations['tracks']) >= RECOMMENDATION_NUMBER:
                break
            home_recommendations['tracks'].append(rec)
            
        for rec in curated_artists['artists']:
            if len(home_recommendations['artists']) >= RECOMMENDATION_NUMBER:
                break
            home_recommendations['artists'].append(rec)
 
        
        return Response(data=home_recommendations, status=status.HTTP_200_OK)

class SongRecommendations(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self,request):
        query = self.request.query_params
       
        if query['song'] :
            seed_song = []
            
            query_cleaned = query['song'].replace('\'','')
            query_cleaned = query_cleaned.replace('\"','')
            seed_song.append(query_cleaned)
            recommendations = sp.recommendations(
                                                seed_tracks=seed_song, 
                                                country='US',
                                                limit=20
                                                )
            
            # must turn tracks into items to make dict same as search dict
            recommendations['items'] = recommendations.pop('tracks')
            recommendations.pop('seeds')

            saveSong(recommendations)

            # In the case the seed song does not return any recommendations
            if not recommendations['items']:
                track_info = sp.track(seed_song[0])
                track_info_formatted = {'items': [track_info]}
                artists = artistsFromSongs(track_info_formatted)['artists']
                search_string = "artist:" + artists[0]['name']
                artist_tracks = sp.search(search_string, type='track', market='US', limit=50)
                just_artist_tracks = {}
                just_artist_tracks['items'] = artist_tracks['tracks']['items']
        
                return Response(data=just_artist_tracks, status=status.HTTP_200_OK)

            return Response(data=recommendations, status=status.HTTP_200_OK)
        
        else :
            return Response({'error:': 'song invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)

class AlbumRecommendations(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self,request):
        query = self.request.query_params

        if query['album'] :
            query_cleaned = query['album'].replace('\'','')
            query_cleaned = query_cleaned.replace('\"','')
            album_id = query_cleaned
            
            response_recs = { 'items': [] }

            # Album_tracks are in the format of spotify album tracks, which are NOT
            # the same as for what is returned with other songs, must then
            # use Spotify id to get the standard track format
            album_tracks_filtered = []
            album_search = sp.album_tracks(album_id, limit=10, market='US')
            for song in album_search['items']:
                # Make sure the songs we're returning are playable on Spotify
                if song['is_playable'] == True:
                    album_tracks_filtered.append(song['id'])
            album_tracks = sp.tracks(album_tracks_filtered, market='US')['tracks']

            random.shuffle(album_tracks)

            # Pull out some song_ids from album to put in recommender
            song_ids = []
            for i in range(min(4, len(album_tracks))):
                song_ids.append(album_tracks[i]['id'])
            if song_ids:
                recommendations = sp.recommendations(
                                                    seed_tracks=song_ids, 
                                                    country='US',
                                                    limit=30
                                                    )
            # Ensures that all elements are in an ['items'] array
            recommendations['items'] = recommendations.pop('tracks')
            
            # Key of ids will make it easy to make sure no duplicates are added
            response_ids = []
            # Add three random album_tracks to response_recs
            for i in range(min(3, len(album_tracks))):
                next_track = album_tracks.pop()
                response_recs['items'].append(next_track)
                response_ids.append(next_track['id'])

            for i in range(20-len(response_recs['items'])):
                # Do a 1-to-1 intersperse of recommendations an albums
                if i%2 == 0:
                    # Try to add a recommendation song, if there are more left
                    if recommendations['items']:
                        if recommendations['items'][0]['id'] not in response_ids:
                            next_track = recommendations['items'].pop()
                            response_recs['items'].append(next_track)
                            response_ids.append(next_track['id'])
                        else:
                            recommendations['items'].pop()
                else:
                    # Try to add an album song, if there are more left
                    if album_tracks:
                        if album_tracks[0]['id'] not in response_ids:
                            next_track = album_tracks.pop()
                            response_recs['items'].append(next_track)
                            response_ids.append(next_track['id'])
                        else:
                            album_tracks.pop()
            
            # Save the recommended songs to the database
            saveSong(response_recs)

            # Will show you artist and track being returned - DEBUGGING purposes
            # for rec in response_recs['items']:
            #     print(str(rec['artists'][0]['name']) + " -- " + str(rec['name'])) 

            return Response(data=response_recs, status=status.HTTP_200_OK)

        else :
            return Response({'error:': 'album invalid or missing'}, status=status.HTTP_400_BAD_REQUEST)

class GetUserSeeds(APIView):
    def get(self, request):
        user_id = self.request.user.id
        try : 
            profile = Profile.objects.get(user=user_id)
        except :
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the genre seeds from database then make an array with just the ids
        genre_seeds_query = UserGenreSeed.objects.filter(user = profile)
        genre_seeds = []

        if genre_seeds_query:
            for genre in genre_seeds_query:
                genre_seeds.append(genre.genre_id)

        # Get the artist seeds from database then make an arrray with just the ids
        artist_seeds_query = UserArtistSeed.objects.filter(user = profile)
        artist_seeds = []

        if artist_seeds_query:
            for artist in artist_seeds_query:
                artist_seeds.append(artist.artist_id)

        # Get the song ids from the profile and then make an array with just the ids        
        try:
            song_seeds_query = profile.liked_songs.all()
        except:
            song_seeds_query = []
        song_seeds = []

        if song_seeds_query:
            for song in song_seeds_query:
                song_seeds.append(song.song_id)
        
        response_json = {   
                        'genres': genre_seeds,
                        'artists': artist_seeds,
                        'songs' : song_seeds,    
                        }
    
        return Response(data=response_json, status=status.HTTP_200_OK)
        
class Deactivate(APIView):
    def post(self, request):
        user_id = self.request.user.id
        user = User.objects.get(id=user_id)
        print(user)
        print(user.is_active)
        if user.is_active == True:
            user.is_active = False
            msg = 'deactivated user ' + str(user)
        else:
            msg = str(user_id) + ' is already deactivated'
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
        user.save()
        return Response({'success': msg}, status=status.HTTP_200_OK)

class Reactivate(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, user_id):
        user = User.objects.filter(id=user_id).update(is_active=True)
        return Response({'user_id': user_id}, status=status.HTTP_200_OK)
        

class PlaylistCopy(APIView):
    def post(self, request, playlist_id):
        user_id = self.request.user.id
        profile = Profile.objects.get(user=user_id)
        playlist= Playlist.objects.get(pk=playlist_id)
        
        requested_title = self.request.query_params['title']
        is_public = self.request.query_params['is_public'] == 'true'
        description = self.request.query_params['desc']

        new_title = requested_title if requested_title else str(playlist.title) + ' (Copy)'
        new_playlist = Playlist(title=new_title, is_public=is_public, description=description, owner=profile)
        new_playlist.save()

        playlist_songs = SongPlaylist.objects.filter(Playlist__id=playlist_id).values()
            
        for i in range(len(playlist_songs)):
            song = Song.objects.get(song_id=playlist_songs[i]['song_id'])
            SongPlaylist.objects.create(Playlist=new_playlist, song=song)

        serializer = PlaylistSerializer(new_playlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserImage(APIView):
    parser_class = (FileUploadParser,)

    def post(self, request, *args, **kwargs):
        try: 
            user_id = self.request.user.id
            profile = Profile.objects.get(user=user_id)
        except:
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        image_serializer = ProfileImageSerializer(profile, data=request.data, partial=True)

        if image_serializer.is_valid():
            image_serializer.save()
            return Response(image_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaylistImage(APIView):
    parser_class = (FileUploadParser,)

    def post(self, request, playlist_id):
        try: 
            user_id = self.request.user.id
            profile = Profile.objects.get(user=user_id)
            playlist= Playlist.objects.get(pk=playlist_id)
        except:
            return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)


        if profile != playlist.owner:
            return Response({'error': 'requestor is not playlist owner'}, status=status.HTTP_400_BAD_REQUEST)  

        image_serializer = PlaylistImageSerializer(playlist, data=request.data, partial=True)

        if image_serializer.is_valid():
            image_serializer.save()
            return Response(image_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, playlist_id):
        try: 
            playlist = Playlist.objects.get(pk=playlist_id)
        except:
            return Response({'error': 'playlist does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        
        if playlist.image:
            return Response({'image': str(playlist.image)}, status=status.HTTP_200_OK)
        else:
            return Response({'image' : None}, status=status.HTTP_200_OK)

        

        


