from django.db import models
from .models import DungeonDeck, WorldCard, Dungeon, PlayerDeck, PlayerCards, Battle

class CardService:
    @staticmethod
    def get_player_collection(user):
        return PlayerCards.objects.filter(player=user).select_related('world_card')
    
    @staticmethod
    def get_available_dungeons_for_deck(deck):
        card_count = deck.cards.count()  # 🎯 JAVÍTVA: deck.cards.count()
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
        """
        Kártya pozíciójának megváltoztatása a pakliban - JSON sorrenddel
        """
        if (from_pos < 0 or from_pos >= len(deck.card_ids) or 
            to_pos < 0 or to_pos >= len(deck.card_ids)):
            return deck
        
        deck.card_ids[from_pos], deck.card_ids[to_pos] = deck.card_ids[to_pos], deck.card_ids[from_pos]
        deck.save()
        
        return deck


    
    @staticmethod
    def move_card_left(deck, current_position):
        """Kártya balra mozgatása"""
        if current_position > 0:
            return CardService.card_player_pos_change(deck, current_position, current_position - 1)
        return deck

    @staticmethod
    def move_card_right(deck, current_position):
        """Kártya jobbra mozgatása"""
        if current_position < len(deck.card_ids) - 1:
            return CardService.card_player_pos_change(deck, current_position, current_position + 1)
        return deck