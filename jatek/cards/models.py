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
    

#enemy cards in dungeon
class DungeonCard(models.Model):
    dungeon = models.ForeignKey(Dungeon, on_delete=models.CASCADE, related_name='dungeon_cards')
    world_card = models.ForeignKey(WorldCard, on_delete=models.CASCADE)


     
class DungeonDeck(models.Model):
    dungeon = models.ForeignKey(Dungeon, on_delete=models.CASCADE, related_name='decks')
    name = models.CharField(max_length=100)
    cards = models.ManyToManyField(DungeonCard)
    leader_card = models.ForeignKey(LeaderCard, on_delete=models.CASCADE)

    

class PlayerCards(models.Model):

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


class PlayerDeck(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='decks')
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)
    # 🎯 CSERÉLD KI EZT A SORT:
    card_ids = models.JSONField(default=list)  # [1, 3, 2] - kártya ID-k sorrendben
    
    def save(self, *args, **kwargs):
        if self.is_active:
            PlayerDeck.objects.filter(player=self.player, is_active=True).update(is_active=False)
        super().save(*args, **kwargs)
    
    # 🎯 ADD HOZZÁ EZEKET A METÓDUSOKAT:
    @property
    def cards(self):
        """Visszaadja a kártyákat a card_ids sorrendjében"""
        if not self.card_ids:
            return PlayerCards.objects.none()
        
        card_dict = {card.id: card for card in PlayerCards.objects.filter(id__in=self.card_ids)}
        ordered_cards = []
        for card_id in self.card_ids:
            if card_id in card_dict:
                ordered_cards.append(card_dict[card_id])
        return ordered_cards
    
    def add_card(self, player_card):
        """Kártya hozzáadása a paklihoz"""
        if player_card.id not in self.card_ids:
            self.card_ids.append(player_card.id)
            self.save()
    
    def remove_card(self, player_card):
        """Kártya eltávolítása a pakliból"""
        if player_card.id in self.card_ids:
            self.card_ids.remove(player_card.id)
            self.save()
    
    def __str__(self):
        return f"{self.name} ({self.player.email})"


class Battle(models.Model):

    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='battles')
    dungeon = models.ForeignKey(Dungeon, on_delete=models.CASCADE)
    player_deck = models.ForeignKey(PlayerDeck, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.player.email} vs {self.dungeon.name}"
