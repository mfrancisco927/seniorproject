from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import permissions, status, generics
from rest_framework.views import APIView
from rest_framework_simplejwt import authentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .serializer import MyTokenObtainPairSerializer, UserSerializer, ChangePasswordSerializer
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