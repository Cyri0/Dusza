from django.shortcuts import render, redirect
from django.contrib import messages
from .models import  UserProfile
from .forms import PlayerRegistrationForm
from django.contrib.auth import login, authenticate, get_user_model, logout as auth_logout


User = get_user_model()

def role_selection(request):
    """Szerepkör választás"""
    if request.method == 'POST':
        role = request.POST.get('role')
        if role == 'jatekos':
            return redirect('player_login')  # Játékos bejelentkezési oldalra
        elif role == 'jatekosmester':
            return redirect('gamemaster_login')  # Játékosmester bejelentkezési oldalra
    
    return render(request, 'users/role_selection.html')
def register(request):
    """Regisztráció"""
    if request.method == 'POST':
        form = PlayerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Sikeres regisztráció! Üdvözöllek, {user.email}!')

            if user.role == 'gamemaster':
                return redirect('cards:card-list')
            else:
                return redirect('game:game-home')
    else:
        form = PlayerRegistrationForm()
    
    return render(request, 'users/register.html', {'form': form})


def logout(request):
    """Kijelentkezés"""
    auth_logout(request)
    messages.info(request, 'Sikeresen kijelentkeztél.')
    return redirect('users:role-selection')



def player_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Hitelesítés
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Szerepkör ellenőrzése - itt feltételezem, hogy van PlayerProfile modell
            try:
                profile = user.userprofile
                if profile.role == 'player':
                    login(request, user)
                    messages.success(request, 'Sikeres bejelentkezés játékosként!')
                    return redirect('player_dashboard')  # Írd át a te útvonaladra
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
        
        # Hitelesítés
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Szerepkör ellenőrzése
            try:
                profile = user.userprofile
                if profile.role == 'jatekosmester':
                    login(request, user)
                    messages.success(request, 'Sikeres bejelentkezés játékosmesterként!')
                    return redirect('gamemaster_dashboard')  # Írd át a te útvonaladra
                else:
                    messages.error(request, 'Ez a felhasználó nem játékosmester!')
            except UserProfile.DoesNotExist:
                messages.error(request, 'A felhasználónak nincs profilja!')
        else:
            messages.error(request, 'Hibás felhasználónév vagy jelszó!')
    
    return render(request, 'users/gamemaster_login.html')

def player_dashboard(request):
    return render(request, 'users/player_dashboard.html')

def gamemaster_dashboard(request):
    return render(request, 'users/gamemaster_dashboard.html')


def user_login(request):
    """Bejelentkezés"""
    if request.method == 'POST':
        form = UserProfile(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            role = form.cleaned_data['role']
            
            # Felhasználó hitelesítése
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                # Szerepkör ellenőrzése
                if user.role != role:
                    messages.error(request, 'Hibás szerepkör!')
                    return render(request, 'users/login.html', {'form': form})
                
                login(request, user)
                messages.success(request, f'Sikeres bejelentkezés! Üdvözöllek, {user.email}!')
                
                # Szerepkörtől függő átirányítás
                if user.role == 'gamemaster':
                    return redirect('cards:card-list')
                else:
                    return redirect('game:game-home')
            else:
                messages.error(request, 'Hibás email vagy jelszó!')
    else:
        form = UserProfile()
    
    return render(request, 'users/login.html', {'form': form})
