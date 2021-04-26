from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework import exceptions
from rest_framework_simplejwt.state import token_backend
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.contrib.auth.models import User
from .models import Profile, Playlist, Song

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        User.objects.filter(username=user).update(is_active=True)
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        #Credit to Joe for this code, he came up with it when I was having trouble
        # Add custom claims -- things that will be "in" the token
        #  Note: UserID is already in the token
        # token['fav_color'] = user.fav_color
        return token

    def validate(self,attrs):
       User.objects.filter(username=attrs['username']).update(is_active=True)
       data = super().validate(attrs)
       refresh = self.get_token(self.user)
       data['access'] = str(refresh.access_token)
       return data

class CustomTokenRefreshSerializer(TokenRefreshSerializer):

    error_msg = 'No known active account with these credentials'

    def validate(self, attrs):
        token_payload = token_backend.decode(attrs['refresh'])
        try:
            user = Profile.objects.get(user=token_payload['user_id'])
        except:
            raise exceptions.AuthenticationFailed(
                self.error_msg, 'no active account'
            )

        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField()
    password  = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    model = User
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)   

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = "__all__"

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'is_public', 'owner', 'songs']

class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"

class PlaylistImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = "__all__"
