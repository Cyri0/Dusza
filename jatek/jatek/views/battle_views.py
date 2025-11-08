from django.shortcuts import render, redirect
from ...cards.services import CardService

def battle_start_view(request):

    player = request.user
    active_deck = CardService.get_player_active_deck(player)
    if not active_deck:
        return redirect('/cards/cardselector/')
    
    

    return render(request, 'battle_site/battle_start.html', {
        'deck': active_deck,})

def battle_round_view(request):
    return render(request, 'battle_site/battle_round.html')

def battle_result_view(request):
    return render(request, 'battle_site/battle_result.html')