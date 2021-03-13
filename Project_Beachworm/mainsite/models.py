from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class BaseModel(models.Model):
  created_at = models.DateTimeField('created_time', auto_now_add=True, db_index=True, null=True)
  updated_at = models.DateTimeField('modified_time', auto_now=True)

  class Meta:
    abstract = True

class Song(BaseModel):
  song_id = models.TextField(primary_key=True)
  title = models.TextField()
  artists = models.TextField()
  danceability = models.TextField()
  energy = models.FloatField()
  key = models.IntegerField()
  loudness = models.FloatField()
  mode = models.IntegerField()
  speechiness = models.FloatField()
  acousticness = models.FloatField()
  instrumentalness = models.FloatField()
  liveness = models.FloatField()
  valence = models.FloatField()
  tempo = models.FloatField()
  duration_ms = models.IntegerField()
  time_signature = models.IntegerField()
  
class Profile(BaseModel):
  user = models.OneToOneField(User,primary_key=True, on_delete=models.CASCADE)
  following = models.ManyToManyField("self", related_name='profile_following', symmetrical=False)
  liked_songs = models.ManyToManyField(Song, related_name='profile_liked')
  disliked_songs = models.ManyToManyField(Song, related_name='profile_disliked')
  favorite_playlists = models.ManyToManyField("Playlist", related_name='profile_favorite_playlists')
  refresh_token = models.TextField(default="None")


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
  if created:
    Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
  instance.profile.save()
  
class Playlist(BaseModel):
  id = models.IntegerField(primary_key=True)
  title = models.TextField()
  is_public = models.BooleanField(default=True)
  owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
  songs = models.ManyToManyField(Song)

class Radio(BaseModel):
  name = models.TextField()
  artist_id = models.TextField()
  genre_id = models.TextField()

class UserArtistSeed(BaseModel):
  user = models.ForeignKey(Profile, on_delete=models.CASCADE)
  artist_id = models.TextField()
  
class UserGenreSeed(BaseModel):
  user = models.ForeignKey(Profile, on_delete=models.CASCADE)
  genre_id = models.TextField()

class UserSongPlay(BaseModel):
  user = models.ForeignKey(Profile, on_delete=models.CASCADE)
  song = models.ForeignKey(Song, on_delete=models.CASCADE)
  listened_at = models.DateTimeField(auto_now_add=True)
  
class UserPlaylistPlay(BaseModel):
  user = models.ForeignKey(Profile, on_delete=models.CASCADE)
  playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
  radio = models.ForeignKey(Radio, on_delete=models.CASCADE)
  listened_at = models.DateTimeField(auto_now_add=True)

