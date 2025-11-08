from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class WorldCard(models.Model):
    CARD_TYPES = [
        ('fire', 'Tűz'),
        ('water', 'Víz'),
        ('earth', 'Föld'),
        ('air', 'Levegő'),
    ]
    
    name = models.CharField(max_length=16, unique=True)
    base_damage = models.IntegerField()
    base_health = models.IntegerField()
    card_type = models.CharField(max_length=10, choices=CARD_TYPES)
    
    def __str__(self):
        return self.name

class LeaderCard(models.Model):
    name = models.CharField(max_length=16, unique=True)
    base_card = models.ForeignKey(WorldCard, on_delete=models.CASCADE)
    is_damage_doubled = models.BooleanField(default=False)
    is_health_doubled = models.BooleanField(default=False)
    
    @property
    def damage(self):
        if self.is_damage_doubled:
            return self.base_card.base_damage * 2
        return self.base_card.base_damage
    
    @property
    def health(self):
        if self.is_health_doubled:
            return self.base_card.base_health * 2
        return self.base_card.base_health
    
    @property
    def card_type(self):
        return self.base_card.card_type
    
    def __str__(self):
        return self.name

class Dungeon(models.Model):
    DUNGEON_TYPES = [
        ('simple', 'Egyszerű találkozás'),
        ('small', 'Kis kazamata'),
        ('large', 'Nagy kazamata'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    dungeon_type = models.CharField(max_length=10, choices=DUNGEON_TYPES)
    leader_card = models.ForeignKey(LeaderCard, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name

class DungeonCard(models.Model):
    dungeon = models.ForeignKey(Dungeon, on_delete=models.CASCADE, related_name='dungeon_cards')
    world_card = models.ForeignKey(WorldCard, on_delete=models.CASCADE)
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']
        unique_together = ['dungeon', 'order']

class PlayerCardStats(models.Model):

    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='card_stats')
    world_card = models.ForeignKey(WorldCard, on_delete=models.CASCADE)
    extra_damage = models.IntegerField(default=0)
    extra_health = models.IntegerField(default=0)
    
    @property
    def total_damage(self):
        return self.world_card.base_damage + self.extra_damage
    
    @property
    def total_health(self):
        return self.world_card.base_health + self.extra_health
    
    @property
    def card_type(self):
        return self.world_card.card_type
    
    @property
    def card_name(self):
        return self.world_card.name
    
    def __str__(self):
        return f"{self.world_card.name} ({self.player.email})"
    
    class Meta:
        unique_together = ['player', 'world_card']

class PlayerCollection(models.Model):

    player = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collection')
    
    def __str__(self):
        return f"{self.player.email} gyűjteménye"

class CollectionEntry(models.Model):
    collection = models.ForeignKey(PlayerCollection, on_delete=models.CASCADE, related_name='entries')
    card_stats = models.ForeignKey(PlayerCardStats, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['collection', 'card_stats']

class PlayerDeck(models.Model):

    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='decks')
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if self.is_active:
            PlayerDeck.objects.filter(player=self.player, is_active=True).update(is_active=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.player.email})"

class DeckCard(models.Model):
    deck = models.ForeignKey(PlayerDeck, on_delete=models.CASCADE, related_name='deck_cards')
    card_stats = models.ForeignKey(PlayerCardStats, on_delete=models.CASCADE)
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']
        unique_together = ['deck', 'order']

class Battle(models.Model):

    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='battles')
    dungeon = models.ForeignKey(Dungeon, on_delete=models.CASCADE)
    player_deck = models.ForeignKey(PlayerDeck, on_delete=models.CASCADE)
    won = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.player.email} vs {self.dungeon.name}"

class BattleLog(models.Model):
    WIN_REASONS = [
        ('damage', 'Sebzés'),
        ('type', 'Típus'),
        ('dungeon', 'Kazamata előny'),
    ]
    
    battle = models.ForeignKey(Battle, on_delete=models.CASCADE, related_name='logs')
    round_number = models.IntegerField()
    player_card = models.ForeignKey(PlayerCardStats, on_delete=models.CASCADE)
    dungeon_card = models.ForeignKey(WorldCard, on_delete=models.CASCADE)
    player_won = models.BooleanField()
    reason = models.CharField(max_length=20, choices=WIN_REASONS)
    
    class Meta:
        ordering = ['round_number']

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_player_collection(sender, instance, created, **kwargs):
    if created:
        PlayerCollection.objects.create(player=instance)