from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.role_selection, name='role-selection'),
    path('register/', views.register, name='register'),
   
    path('player/login/', views.player_login, name='player_login'),
    path('gamemaster/login/', views.gamemaster_login, name='gamemaster_login'),
    path('player/dungeons/', views.player_dungeons, name='player_dungeons'),
     path('gamemaster/dungeons/', views.gamemaster_dungeons, name='gamemaster_dungeons'),
    path('logout/', views.logout, name='logout'),
]