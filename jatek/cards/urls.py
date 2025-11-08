from django.urls import path
from . import views

urlpatterns = [
    # Fő kártya készítő oldal
    path('card-creator/', views.card_creator, name='card_creator'),
    path('card-selector/', views.card_selector, name='card_selector'),


    path('create-world-card/', views.create_world_card, name='create_world_card'),
    path('create-leader-card/', views.create_leader_card, name='create_leader_card'),


    path('delete-world-card/<int:card_id>/', views.delete_world_card, name='delete_world_card'),
    path('delete-leader-card/<int:card_id>/', views.delete_leader_card, name='delete_leader_card'),


    path('dungeons/', views.dungeon_management, name='dungeon_management'),
    path('create-dungeon/', views.create_dungeon, name='create_dungeon'),

]