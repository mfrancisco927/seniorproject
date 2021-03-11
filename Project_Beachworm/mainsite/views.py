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
    
    # def update_profile(self, user_id):
    #     user = User.objects.get(pk=user_id)
    #     #above method works to add a user but fails here, something with the signal
    #     user.profile.following = []
    #     user.profile.liked_songs = []
    #     user.profile.disliked_songs = []
    #     user.profile.favorite_playlists = []
    #     user.save()

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
        print(self.request.user.email)
        return Response(data=self.request.user.id, status=status.HTTP_200_OK)

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

class SpotifyAuthorize(APIView):
    def get(self, request, *args, **kwargs):
        
        user_id = self.request.user.id
        url = "https://accounts.spotify.com/authorize"
        url = url + "?client_id=" + CLIENT_ID
        url = url + "&response_type=code"
        url = url + "&redirect_uri=http://127.0.0.1:8000/api/spotify/redirect/"
        url = url + "&state=" + str(user_id)
        return redirect(url)

class SpotifyRedirect(APIView):
    # Must be set to all for redirect back from spotify
    permission_classes = (permissions.AllowAny,)
    def get(self, request, *args, **kwargs):        
        auth_code = request.GET.get('code')
        user_id = request.GET.get('state')
        encode = '%s' % basicauth.encode(CLIENT_ID, SECRET)
        decode = basicauth.decode(encode)

        headers = {'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization' : '%s' % basicauth.encode(CLIENT_ID, SECRET)}
        payload = {'grant_type': 'authorization_code', 'code' : '%s' % auth_code, 
                    'redirect_uri':'http://127.0.0.1:8000/api/spotify/redirect/',}
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
                    'redirect_uri':'http://127.0.0.1:8000/api/spotify/redirect/',}
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


        
