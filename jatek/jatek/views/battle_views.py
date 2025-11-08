from urllib import request
from django.shortcuts import render, redirect
import cards
from cards.services import CardService
from users.service import UserService

def battle_start_view(request):
    player = request.user
    active_deck = CardService.get_player_active_deck(player)
    enemy_deck = UserService.get_dungeon_cards_for_user(player)
    
    if not active_deck or not enemy_deck:
        return redirect('/cards/cardselector/')
    
    if request.method == 'POST':
        # Támadás gomb
        if request.POST.get('attack'):
            battle_round_view(request)
            return redirect('/battle/start/')
        
        # Balra mozgatás
        if request.POST.get('move_left'):
            current_position = int(request.POST.get('move_left'))
            active_deck = CardService.move_card_left(active_deck, current_position)
            return redirect('/battle/start/')
        
        # Jobbra mozgatás  
        elif request.POST.get('move_right'):
            current_position = int(request.POST.get('move_right'))
            active_deck = CardService.move_card_right(active_deck, current_position)
            return redirect('/battle/start/')
    
    return render(request, 'battle_site/battle.html', {
        'deck': active_deck,
        'enemy_deck': enemy_deck,
    })

def battle_round_view(request):

    player = request.user
    active_deck = CardService.get_player_active_deck(player)
    enemy_deck = UserService.get_dungeon_cards_for_user(player)

    if not active_deck or not enemy_deck:
        return redirect('/cards/cardselector/')
    





