from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework_simplejwt import authentication

from .serializer import MyTokenObtainPairSerializer, UserSerializer
class ObtainTokenPairWithAdditionalInfo(TokenObtainPairView):
        permission_classes = (permissions.AllowAny,)
        serializer_class = MyTokenObtainPairSerializer

class UserCreate(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format='json'):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                json = serializer.data
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
        header = authentication.JWTAuthentication.get_header(self, request)
        raw_token = authentication.JWTAuthentication.get_raw_token(self, header)
        validated_token = authentication.JWTAuthentication.get_validated_token(self, raw_token)
        user = authentication.JWTAuthentication.get_user(self, validated_token)
        print(user.id)  # Shows you the ID of who is requesting

        return Response(data=user.id, status=status.HTTP_200_OK)