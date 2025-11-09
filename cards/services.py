from django.db import models
from .models import DungeonDeck, WorldCard, Dungeon, PlayerDeck, PlayerCards
from users.service import UserService

class CardService:
    @staticmethod
    def get_player_collection(user):
        return PlayerCards.objects.filter(player=user).select_related('world_card')
    
    @staticmethod
    def get_available_dungeons_for_deck(deck):
        card_count = deck.cards.count()  
        return Dungeon.objects.annotate(
            card_count=models.Count('dungeon_cards')
        ).filter(card_count=card_count).select_related('leader_card')
    
    @staticmethod
    def get_player_active_deck(user):
        try:
            return PlayerDeck.objects.get(player=user, is_active=True)
        except PlayerDeck.DoesNotExist:
            return None
        
    @staticmethod 
    def get_card_by_id(card_id):
        try:
            return WorldCard.objects.get(id=card_id)
        except WorldCard.DoesNotExist:
            return None
        
    @staticmethod
    def get_dungeon_deck_cards(dungeon):
        try:
            dungeon_deck = DungeonDeck.objects.get(dungeon=dungeon)
            return dungeon_deck.cards.all()
        except DungeonDeck.DoesNotExist:
            return None
    
    @staticmethod
    def card_player_pos_change(deck, from_pos, to_pos):

        if (from_pos < 0 or from_pos >= len(deck.card_ids) or 
            to_pos < 0 or to_pos >= len(deck.card_ids)):
            return deck
        
        deck.card_ids[from_pos], deck.card_ids[to_pos] = deck.card_ids[to_pos], deck.card_ids[from_pos]
        deck.save()
        
        return deck


    
    @staticmethod
    def move_card_left(deck, current_position):

        if current_position > 0:
            return CardService.card_player_pos_change(deck, current_position, current_position - 1)
        return deck

    @staticmethod
    def move_card_right(deck, current_position):
   
        if current_position < len(deck.card_ids) - 1:
            return CardService.card_player_pos_change(deck, current_position, current_position + 1)
        return deck
    
    @staticmethod
    def upgrade_card(deck, upgrade_type, deck_position):
      
        player_card = PlayerCards.objects.get(world_card=deck.card_ids[deck_position])
        
        if upgrade_type == 'health':
            player_card.extra_health += 1
        elif upgrade_type == 'damage':
            player_card.extra_damage += 1

        player_card.save()
        return player_card
    
    @staticmethod
    def get_dungeon_by_id(dungeon_id):
        try:
            return Dungeon.objects.get(id=dungeon_id)
        except Dungeon.DoesNotExist:
            return None
        
    @staticmethod
    def get_dungeon_by_user(user):
        try:
            return UserService.get_dungeon_by_user(user)
        except Dungeon.DoesNotExist:
            return None
        
    @staticmethod
    def get_card_hp(card, is_player=True):
        return PlayerCards.objects.get(world_card=card).total_health if is_player else card.base_health

    @staticmethod
    def get_card_damage(card, is_player=True):
        return PlayerCards.objects.get(world_card=card).total_damage  if is_player else card.base_damage

    @staticmethod
    def get_card_element(card):
        return card.card_type
