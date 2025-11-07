from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Player

def role_selection(request):
    return render(request, 'users/role_selection.html')

def player_login(request):
    if request.method == 'POST':
        player_name = request.POST.get('player_name', '').strip()
        
        if not player_name:
            messages.error(request, 'Add meg a neved!')
            return render(request, 'users/player_login.html')
        
        # Játékos létrehozása vagy lekérése
        player, created = Player.objects.get_or_create(
            name=player_name,
            defaults={'role': 'player'}
        )
        
        # Session beállítása
        request.session['player_id'] = player.id
        request.session['player_name'] = player.name
        request.session['player_role'] = player.role
        request.session['is_authenticated'] = True
        
        messages.success(request, f'Üdvözöllek, {player_name}!')
        return redirect('users:role-selection')
    
    return render(request, 'users/player_login.html')

def gamemaster_login(request):
    if request.method == 'POST':
        player_name = request.POST.get('player_name', '').strip()
        
        if not player_name:
            messages.error(request, 'Add meg a neved!')
            return render(request, 'users/gamemaster_login.html')
        
        # Játékmester létrehozása vagy frissítése
        player, created = Player.objects.get_or_create(
            name=player_name,
            defaults={'role': 'gamemaster'}
        )
        
        if not created and player.role != 'gamemaster':
            player.role = 'gamemaster'
            player.save()
        
        # Session beállítása
        request.session['player_id'] = player.id
        request.session['player_name'] = player.name
        request.session['player_role'] = 'gamemaster'
        request.session['is_authenticated'] = True
        
        messages.success(request, f'Üdvözöllek, {player_name} (Játékmester)!')
        return redirect('users:role-selection')
    
    return render(request, 'users/gamemaster_login.html'),
 
def logout(request):
    request.session.flush()
    messages.info(request, 'Sikeresen kijelentkeztél.')
    return redirect('users:role-selection')