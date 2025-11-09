from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from .models import WorldCard, LeaderCard, Dungeon, PlayerCards
from users.models import User
from .forms import WorldCardForm, LeaderCardForm, DungeonForm
from .services import CardService

def is_game_master(user):
    """Ellenőrzi, hogy a felhasználó játékmester-e"""
    return user.is_authenticated and (user.is_staff or user.groups.filter(name='GameMaster').exists())

@login_required
@user_passes_test(is_game_master)
def card_creator(request):
    """Fő kártya készítő oldal"""
    world_cards = WorldCard.objects.all()
    leader_cards = LeaderCard.objects.all()
    
  
    world_form = WorldCardForm()
    leader_form = LeaderCardForm()
 
    leader_form.fields['base_card'].queryset = WorldCard.objects.all()
    

    player_cards = []
    if not is_game_master(request.user):
        try:
            player_cards = PlayerCards.objects.filter(player=request.user)
        except PlayerCards.DoesNotExist:
            player_cards = []
    
    context = {
        'world_cards': world_cards,
        'leader_cards': leader_cards,
        'player_cards': player_cards,
        'world_form': world_form,
        'leader_form': leader_form,
        'is_game_master': is_game_master(request.user),
    }
    
    return render(request, 'card_creator.html', context)

@login_required
@user_passes_test(is_game_master)
def create_world_card(request):
    """Világkártya létrehozása - Játékmester csak"""
    if request.method == 'POST':
        form = WorldCardForm(request.POST)
        if form.is_valid():
            try:
                name = form.cleaned_data['name']
                damage = form.cleaned_data['base_damage']
                health = form.cleaned_data['base_health']
                
                if len(name) > 16:
                    messages.error(request, 'A név maximum 16 karakter hosszú lehet!')
                    return redirect('card_creator')
                
                if damage < 2 or damage > 100:
                    messages.error(request, 'A sebzés értéke 2 és 100 között kell legyen!')
                    return redirect('card_creator')
                
                if health < 1 or health > 100:
                    messages.error(request, 'Az életerő értéke 1 és 100 között kell legyen!')
                    return redirect('card_creator')
           
                form.save()
                messages.success(request, f'Világkártya "{name}" sikeresen létrehozva!')
                
            except Exception as e:
                messages.error(request, f'Hiba történt: {str(e)}')
        else:
        
            for error in form.errors.values():
                messages.error(request, f'Hiba: {error}')
    
    return redirect('card_creator')

@login_required
@user_passes_test(is_game_master)
def create_leader_card(request):
    """Vezérkártya létrehozása - Játékmester csak"""
    if request.method == 'POST':
        form = LeaderCardForm(request.POST)
        if form.is_valid():
            try:
                name = form.cleaned_data['name']
                base_card = form.cleaned_data['base_card']
                is_damage_doubled = form.cleaned_data.get('is_damage_doubled', False)
                is_health_doubled = form.cleaned_data.get('is_health_doubled', False)
                
                if len(name) > 16:
                    messages.error(request, 'A név maximum 16 karakter hosszú lehet!')
                    return redirect('card_creator')
                
  
                if not is_damage_doubled and not is_health_doubled:
                    messages.error(request, 'Legalább egy tulajdonságot duplázni kell (sebzés vagy életerő)!')
                    return redirect('card_creator')
                
      
                form.save()
                messages.success(request, f'Vezérkártya "{name}" sikeresen létrehozva!')
                
            except Exception as e:
                messages.error(request, f'Hiba történt: {str(e)}')
        else:
            for error in form.errors.values():
                messages.error(request, f'Hiba: {error}')
    
    return redirect('card_creator')

@login_required
@user_passes_test(is_game_master)
def delete_world_card(request, card_id):
    """Világkártya törlése"""
    if request.method == 'POST':
        try:
            card = get_object_or_404(WorldCard, id=card_id)
            card_name = card.name
            

            if LeaderCard.objects.filter(base_card=card).exists():
                messages.error(request, f'"{card_name}" nem törölhető, mert vezérkártyák alapjául szolgál!')
                return redirect('card_creator')
            
            card.delete()
            messages.success(request, f'Világkártya "{card_name}" sikeresen törölve!')
            
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('card_creator')

@login_required
@user_passes_test(is_game_master)
def delete_leader_card(request, card_id):
    """Vezérkártya törlése"""
    if request.method == 'POST':
        try:
            card = get_object_or_404(LeaderCard, id=card_id)
            card_name = card.name

            if Dungeon.objects.filter(leader_card=card).exists():
                messages.error(request, f'"{card_name}" nem törölhető, mert kazamatákban használatban van!')
                return redirect('card_creator')
            
            card.delete()
            messages.success(request, f'Vezérkártya "{card_name}" sikeresen törölve!')
            
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('card_creator')


@login_required
@user_passes_test(is_game_master)
def dungeon_management(request):
    """Kazamata kezelő oldal"""
    dungeons = Dungeon.objects.all()
    dungeon_form = DungeonForm()
    
    context = {
        'dungeons': dungeons,
        'dungeon_form': dungeon_form,
    }
    return render(request, 'cards/dungeon_management.html', context)

@login_required
@user_passes_test(is_game_master)
def create_dungeon(request):
    """Kazamata létrehozása"""
    if request.method == 'POST':
        form = DungeonForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Kazamata sikeresen létrehozva!')
            except Exception as e:
                messages.error(request, f'Hiba történt: {str(e)}')
        else:
            for error in form.errors.values():
                messages.error(request, f'Hiba: {error}')
    
    return redirect('dungeon_management')


@login_required
def card_selector(request):
    """Kártyaválasztó oldal a játékosok számára"""
    player = request.user
    
    all_world_cards = WorldCard.objects.all()
    
    return render(request, 'cards/card_selector.html', {
        'all_cards': all_world_cards,
    })

def save_selected_cards(request):
    if request.method == 'POST':
        selected_card_ids = request.POST.getlist('selected_cards')
        
        selected_card_ids = [int(card_id) for card_id in selected_card_ids]

        for card_id in selected_card_ids:
            world_card = CardService.get_card_by_id(card_id)
            PlayerCards.objects.get_or_create(
                player=request.user,
                world_card=world_card,
            )

        return redirect('dashboard') 

    return redirect('select_cards')
