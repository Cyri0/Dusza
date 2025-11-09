from django.shortcuts import render, redirect
from django.contrib import messages 
from django.db.models import F 
from cards.models import PlayerCards
from cards.services import CardService
from users.service import UserService
from users.models import UserProfile

def battle_start_view(request):
    player = request.user
    active_deck = CardService.get_player_active_deck(player.id)
    enemy_deck = UserService.get_dungeon_cards_for_user(player.id)
    
    if not active_deck or not enemy_deck:
        return redirect('/cards/cardselector/')
    
    if request.method == 'POST':
        match request.POST.get('action'):
            # Támadás gomb
            case 'attack':
                battle_round_view(request)
                return redirect('/battle')

            # Balra mozgatás
            case 'move_left':  
                current_position = int(request.POST.get('move_left'))
                active_deck = CardService.move_card_left(active_deck, current_position)
                return redirect('/battle/')
            
            # Jobbra mozgatás  
            case 'move_right': 
                current_position = int(request.POST.get('move_right'))
                active_deck = CardService.move_card_right(active_deck, current_position)
                return redirect('/battle/')
            
            case 'upgrade_health':
                if UserProfile.objects.get(user=player).upgrade_points > 0:
                    card_position = int(request.POST.get('upgrade_health'))
                    CardService.upgrade_card(active_deck, 'health', card_position)  # 🎯 JAVÍTVA: nem kell active_deck-nek értékül adni
                    UserProfile.objects.filter(user=player).update(upgrade_points=F('upgrade_points') - 1)  # 🎯 JAVÍTVA
                return redirect('/battle/')

            case 'upgrade_damage':
                if UserProfile.objects.get(user=player).upgrade_points > 0:
                    card_position = int(request.POST.get('upgrade_damage'))
                    CardService.upgrade_card(active_deck, 'damage', card_position)  # 🎯 JAVÍTVA
                    UserProfile.objects.filter(user=player).update(upgrade_points=F('upgrade_points') - 1)  # 🎯 JAVÍTVA
                return redirect('/battle/')

    return render(request, 'battle.html', {
        'deck': active_deck,
        'enemy_deck': enemy_deck,
    })

def battle_round_view(request):
    player = request.user
    active_deck = CardService.get_player_active_deck(player)
    enemy_deck = UserService.get_dungeon_cards_for_user(player)

    if not active_deck or not enemy_deck:
        return redirect('/cards/cardselector/')
    

    active_cards = []
    for card_id in active_deck.card_ids:
        try:
            player_card = PlayerCards.objects.get(id=card_id)
            active_cards.append(player_card.world_card)
        except PlayerCards.DoesNotExist:
            continue

    enemy_num = len(enemy_deck)
    win_counter = 0

    for i in range(enemy_num):
        if i >= len(active_cards):  
            break

        temp_player_dmg = CardService.get_card_damage(active_cards[i])
        temp_enemy_dmg = CardService.get_card_damage(enemy_deck[i], is_player=False)

        temp_player_hp = CardService.get_card_hp(active_cards[i])
        temp_enemy_hp = CardService.get_card_hp(enemy_deck[i], is_player=False)

        temp_player_element = CardService.get_card_element(active_cards[i])
        temp_enemy_element = CardService.get_card_element(enemy_deck[i])

        after_enemy_hp = temp_enemy_hp - temp_player_dmg
        after_player_hp = temp_player_hp - temp_enemy_dmg


        if after_enemy_hp < 0 and after_player_hp > 0:
            win_counter += 1
        elif after_enemy_hp <= 0 and after_player_hp < 0:

            if (temp_player_element == 'fire' and temp_enemy_element == 'earth') or \
               (temp_player_element == 'earth' and temp_enemy_element == 'water') or \
               (temp_player_element == 'water' and temp_enemy_element == 'air') or \
               (temp_player_element == 'air' and temp_enemy_element == 'fire'):
                win_counter += 1
        else:
            win_counter -= 1

    if win_counter > 0:
        bonus_points = 0
        deck_size = len(active_cards)
        if deck_size == 1:
            bonus_points = 1
        elif deck_size == 4:
            bonus_points = 2
        elif deck_size == 6:
            bonus_points = 3

        UserProfile.objects.filter(user=player).update(upgrade_points=F('upgrade_points') + bonus_points)
        message = f'Gratulálok! Nyertél a küzdelemben! Szerzett fejlesztési pontok: {bonus_points}'
        messages.success(request, message)
    
    return redirect('/battle/start/')  # 🎯 JAVÍTVA: hiányzott