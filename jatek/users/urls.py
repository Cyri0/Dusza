from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.role_selection, name='role-selection'),
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('player/login/', views.player_login, name='player_login'),
    path('gamemaster/login/', views.gamemaster_login, name='gamemaster_login'),
    path('player/dashboard/', views.player_dashboard, name='player_dashboard'),
    path('gamemaster/dashboard/', views.gamemaster_dashboard, name='gamemaster_dashboard'),
    path('logout/', views.logout, name='logout'),
]