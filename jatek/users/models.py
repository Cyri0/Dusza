from django.db import models
from django.contrib.auth.models import User
from cards.models import Dungeon


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20,  choices=[
        ('jatekos', 'Játékos'),
        ('jatekosmester', 'Játékosmester'),
    ], default='jatekos')
    is_in_current_game = models.BooleanField(default=False)
    in_current_dungeon = models.ForeignKey(Dungeon, on_delete=models.SET_NULL, null=True, blank=True)
    upgrade_points = models.IntegerField(default=0)
    
    def add_upgrade_points(self, points):
        self.upgrade_points += points
        self.save()

    def __str__(self):
        return f"{self.user.username} ({self.role})"