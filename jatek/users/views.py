from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from users.service import UserService
from .models import  UserProfile
from .forms import PlayerRegistrationForm
from django.contrib.auth import login, authenticate, get_user_model, logout as auth_logout


User = get_user_model()

def role_selection(request):
  
    if request.method == 'POST':
        role = request.POST.get('role')
        if role == 'jatekos':
            return redirect('player_login')  
        elif role == 'jatekosmester':
            return redirect('gamemaster_login')  
    
    return render(request, 'users/role_selection.html', {
        "role":  request.POST.get('role'),
        "get_role_display": User.get_role_display(request.POST.get('role')) if request.method == 'POST' else None
    })
def register(request):
    """Egyszerű register view a register/ URL-hez"""
    if request.method == 'POST':
        form = PlayerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/users')  # Vagy ahova szeretnéd
    else:
        form = PlayerRegistrationForm()
    
    return render(request, 'users/register.html', {'form': form})

def logout(request):

    auth_logout(request)
    messages.info(request, 'Sikeresen kijelentkeztél.')
    return redirect('users:role-selection')



def player_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
       
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
           
            try:
                profile = user.userprofile
                if profile.role == 'jatekos':
                    login(request, user)
                    messages.success(request, 'Sikeres bejelentkezés játékosként!')
                    return redirect('/users/player/dungeons/') 
                else:
                    messages.error(request, 'Ez a felhasználó nem játékos!')
            except UserProfile.DoesNotExist:
                messages.error(request, 'A felhasználónak nincs profilja!')
        else:
            messages.error(request, 'Hibás felhasználónév vagy jelszó!')
    
    return render(request, 'users/player_login.html')

def gamemaster_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            try:
                profile = user.userprofile
                if profile.role == 'jatekosmester':  # 🔥 JAVÍTVA
                    login(request, user)
                    messages.success(request, 'Sikeres bejelentkezés játékosmesterként!')
                    return redirect('/users/gamemaster/dungeons/')  
                else:
                    messages.error(request, 'Ez a felhasználó nem játékosmester!')
            except UserProfile.DoesNotExist:
                messages.error(request, 'A felhasználónak nincs profilja!')
        else:
            messages.error(request, 'Hibás felhasználónév vagy jelszó!')
    
    return render(request, 'users/gamemaster_login.html')
def player_dungeons(request):
    return render(request, 'users/player_dungeons.html')
    
def gamemaster_dungeons(request):
    return render(request, 'users/gamemaster_dungeons.html')



