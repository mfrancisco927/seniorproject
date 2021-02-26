from rest_framework import serializers
from .models import Task

'''
	A "Serializer", basically just puts the model to JSON
	as an intermediary before serving request.
	[Isaac]
'''


class TaskSerializer(serializers.ModelSerializer):
	class Meta:
		model = Task
		fields ='__all__'