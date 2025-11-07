from django.db import models

class Player(models.Model):
    ROLE_CHOICES = [
        ('player', 'Játékos'),
        ('gamemaster', 'Játékmester'),
    ]
    
    name = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    
    @property
    def win_rate(self):
        if self.games_played == 0:
            return 0
        return round((self.games_won / self.games_played) * 100, 1)
    
    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"