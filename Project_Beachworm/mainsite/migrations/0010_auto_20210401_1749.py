# Generated by Django 3.0.3 on 2021-04-01 17:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainsite', '0009_auto_20210401_0258'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='artist',
            name='song',
        ),
        migrations.AddField(
            model_name='song',
            name='artists',
            field=models.ManyToManyField(related_name='artists', to='mainsite.Artist'),
        ),
    ]
