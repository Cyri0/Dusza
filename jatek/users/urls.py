from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.role_selection, name='role-selection'),
    path('player/login/', views.player_login, name='player-login'),
    path('gamemaster/login/', views.gamemaster_login, name='gamemaster-login'),
    path('logout/', views.logout, name='logout'),
]