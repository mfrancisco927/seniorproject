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

env = environ.Env()
CLIENT_ID = env('CLIENT_ID')
SECRET = env('SECRET')


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
    def get(self, request):
        auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=SECRET)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        types = ['artist', 'track', 'album']
        query = self.request.query_params
        results = {}
        for type in types:
            results[type + 's'] = sp.search(q=query['q'], type=type, market='US', limit=10)[type + 's']
            #get track IDs for results and query DB for those songs
            if type == 'track':
                track_ids = []
                for i in range(len(results['tracks']['items'])):
                    track_ids.append(results['tracks']['items'][i]['id'])
                track_features = sp.audio_features(tracks=track_ids)
                #print(track_features)
                for i in range(len(track_ids)):
                    db_track = Song.objects.filter(song_id = track_ids[i])
                    #add track to db if it's not there
                    if not db_track.exists():
                        trackEntry = Song(
                            song_id = results['tracks']['items'][i]['id'],
                            title = results['tracks']['items'][i]['name'],
                            artists = results['tracks']['items'][i]['artists'][0]['name'],
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
                            img_640 = results['tracks']['items'][i]['album']['images'][0]['url']
                        )
                        
                        trackEntry.save()
        #return public playlists whose name contains query
        playlists = list(Playlist.objects.filter(title__icontains=query['q'], is_public=True).values())
        results['playlists'] = {}
        results['playlists']['items'] = playlists

        return Response(data=results, status=status.HTTP_200_OK)

