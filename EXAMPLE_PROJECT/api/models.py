from django.db import models
from django.contrib.auth.models import User

'''
    The models in the DB
    [Isaac]
'''

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

class Playlist(BaseModel):
  title = models.TextField()
  is_public = models.BooleanField(default=True)
  owner = models.ForeignKey(User, on_delete=models.CASCADE)
  songs = models.ManyToManyField(Song)
  
class Profile(BaseModel):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  following = models.ManyToManyField(User, related_name='profile_following')
  liked_songs = models.ManyToManyField(Song, related_name='profile_liked')
  disliked_songs = models.ManyToManyField(Song, related_name='profile_disliked')
  favorite_playlists = models.ManyToManyField(Playlist, related_name='profile_favorite_playlists')

class Radio(BaseModel):
  name = models.TextField()
  artist_id = models.TextField()
  genre_id = models.TextField()

class UserArtistSeed(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  artist_id = models.TextField()
  
class UserGenreSeed(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  genre_id = models.TextField()

class UserSongPlay(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  song = models.ForeignKey(Song, on_delete=models.CASCADE)
  listened_at = models.DateTimeField(auto_now_add=True)
  
class UserPlaylistPlay(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
  radio = models.ForeignKey(Radio, on_delete=models.CASCADE)
  listened_at = models.DateTimeField(auto_now_add=True)

# extra from initial example project; remove soon
class Task(models.Model):
  title = models.CharField(max_length=200)
  completed = models.BooleanField(default=False, blank=True, null=True)
      
  def __str__(self):
    return self.title