from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def get_songs(request):

	songs = {
            'img-0':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
            'img-1':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
            'img-2':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg',
            'img-3':'https://upload.wikimedia.org/wikipedia/en/c/c4/Floral_Green.jpg'
      }

	return Response(songs)