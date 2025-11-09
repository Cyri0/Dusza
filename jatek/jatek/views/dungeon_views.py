# cards/dungeon_views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from cards.models import Dungeon, WorldCard, LeaderCard, DungeonCard

def is_game_master(user):
    """Ellenőrzi, hogy a felhasználó játékmester-e"""
    return user.is_authenticated and (user.is_staff or user.groups.filter(name='GameMaster').exists())

@login_required
@user_passes_test(is_game_master)
def dungeon_management(request):
    """Kazamata kezelő oldal"""
    dungeons = Dungeon.objects.all().prefetch_related('dungeon_cards__world_card', 'leader_card')
    world_cards = WorldCard.objects.all()
    leader_cards = LeaderCard.objects.all()
    
    # Maximális kártyaszámok kiszámolása
    max_cards_map = {
        'simple': 1,
        'small': 3,
        'large': 5
    }
    
    for dungeon in dungeons:
        dungeon.max_cards = max_cards_map.get(dungeon.dungeon_type, 0)
        dungeon.current_cards = dungeon.dungeon_cards.count()
        dungeon.is_full = dungeon.current_cards >= dungeon.max_cards
    
    context = {
        'dungeons': dungeons,
        'world_cards': world_cards,
        'leader_cards': leader_cards,
    }
    return render(request, 'cards/dungeon_management.html', context)

@login_required
@user_passes_test(is_game_master)
def create_dungeon(request):
    """Kazamata létrehozása"""
    if request.method == 'POST':
        name = request.POST.get('name')
        dungeon_type = request.POST.get('dungeon_type')
        leader_card_id = request.POST.get('leader_card')
        
        try:
            # Validációk
            if not name or not dungeon_type or not leader_card_id:
                messages.error(request, 'Minden mező kitöltése kötelező!')
                return redirect('dungeon_management')
            
            if Dungeon.objects.filter(name=name).exists():
                messages.error(request, 'Ez a kazamata név már foglalt!')
                return redirect('dungeon_management')
            
            leader_card = LeaderCard.objects.get(id=leader_card_id)
            
            # Kazamata létrehozása
            dungeon = Dungeon.objects.create(
                name=name,
                dungeon_type=dungeon_type,
                leader_card=leader_card
            )
            
            messages.success(request, f'Kazamata "{dungeon.name}" sikeresen létrehozva!')
            
        except LeaderCard.DoesNotExist:
            messages.error(request, 'A kiválasztott vezérkártya nem található!')
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('dungeon_management')

@login_required
@user_passes_test(is_game_master)
def add_card_to_dungeon(request, dungeon_id):
    """Kártya hozzáadása kazamatához"""
    if request.method == 'POST':
        dungeon = get_object_or_404(Dungeon, id=dungeon_id)
        card_id = request.POST.get('card_id')
        
        try:
            world_card = WorldCard.objects.get(id=card_id)
            
            # Ellenőrizzük, hogy ez a kártya már benne van-e a kazamatában
            if DungeonCard.objects.filter(dungeon=dungeon, world_card=world_card).exists():
                messages.warning(request, f'"{world_card.name}" már benne van a kazamatában!')
                return redirect('dungeon_management')
            
            # Kazamata típus szerinti maximális kártyaszám
            max_cards = {
                'simple': 1,
                'small': 3,
                'large': 5
            }
            
            current_card_count = dungeon.dungeon_cards.count()
            max_allowed = max_cards.get(dungeon.dungeon_type, 0)
            
            if current_card_count >= max_allowed:
                messages.error(request, f'"{dungeon.name}" kazamatában már elérted a maximális kártyaszámot ({max_allowed})!')
                return redirect('dungeon_management')
            
            # Kártya hozzáadása
            DungeonCard.objects.create(dungeon=dungeon, world_card=world_card)
            messages.success(request, f'"{world_card.name}" hozzáadva a "{dungeon.name}" kazamatához!')
            
        except WorldCard.DoesNotExist:
            messages.error(request, 'A kártya nem található!')
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('dungeon_management')

@login_required
@user_passes_test(is_game_master)
def remove_card_from_dungeon(request, dungeon_card_id):
    """Kártya eltávolítása kazamatából"""
    if request.method == 'POST':
        try:
            dungeon_card = get_object_or_404(DungeonCard, id=dungeon_card_id)
            card_name = dungeon_card.world_card.name
            dungeon_name = dungeon_card.dungeon.name
            
            dungeon_card.delete()
            messages.success(request, f'"{card_name}" eltávolítva a "{dungeon_name}" kazamatából!')
            
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('dungeon_management')

@login_required
@user_passes_test(is_game_master)
def delete_dungeon(request, dungeon_id):
    """Kazamata teljes törlése"""
    if request.method == 'POST':
        try:
            dungeon = get_object_or_404(Dungeon, id=dungeon_id)
            dungeon_name = dungeon.name
            
            dungeon.delete()
            messages.success(request, f'Kazamata "{dungeon_name}" sikeresen törölve!')
            
        except Exception as e:
            messages.error(request, f'Hiba történt: {str(e)}')
    
    return redirect('dungeon_management')