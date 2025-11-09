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
    
    return render(request, 'battle/battle.html', {
        'deck': active_deck,
        'enemy_deck': enemy_deck,
    })

def battle_round_view(request):

    player = request.user
    active_deck = list(CardService.get_player_active_deck(player))
    enemy_deck = list(UserService.get_dungeon_cards_for_user(player))

    if not active_deck or not enemy_deck:
        return redirect('/cards/cardselector/')
    

    enemy_num = enemy_deck.__len__()
    win_counter = 0

    for i in range(enemy_num):

        temp_player_dmg = CardService.get_card_damage(active_deck[i])
        temp_enemy_dmg = CardService.get_card_damage(enemy_deck[i])

        temp_player_hp = CardService.get_card_hp(active_deck[i])
        temp_enemy_hp = CardService.get_card_hp(enemy_deck[i])

        temp_player_element = CardService.get_card_element(active_deck[i])
        temp_enemy_element = CardService.get_card_element(enemy_deck[i])

        after_enemy_hp = temp_enemy_hp - temp_player_dmg
        after_player_hp = temp_player_hp - temp_enemy_dmg

        if after_enemy_hp < 0 and after_player_hp > 0:
            win_counter += 1
        elif after_enemy_hp <= 0 and after_player_hp < 0:
            if temp_player_element == 'Fire' and temp_enemy_element == 'Earth':
                win_counter += 1
            elif temp_player_element == 'Earth' and temp_enemy_element == 'Water':
                win_counter += 1
            elif temp_player_element == 'Water' and temp_enemy_element == 'Wind':
                win_counter += 1
            elif temp_player_element == 'Wind' and temp_enemy_element == 'Fire':
                win_counter += 1
            elif temp_player_element == 'Water' and temp_enemy_element == 'Wind':
                win_counter += 1
        else:
            win_counter -= 1

    if win_counter > 0:
        pass
