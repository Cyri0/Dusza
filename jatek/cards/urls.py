# cards/urls.py
from django.urls import path
from . import views
from jatek.views import dungeon_views  # 🎯 JAVÍTVA: relatív import

urlpatterns = [
    # Fő kártya készítő oldal
    path('cardcreator/', views.card_creator, name='card_creator'),
    path('cardselector/', views.card_selector, name='card_selector'),

    # 🎯 JAVÍTVA: Duplikált sorok eltávolítva, csak dungeon_views-ek maradnak
    # Dungeon management URLs
    path('dungeons/', dungeon_views.dungeon_management, name='dungeon_management'),
    path('dungeons/create/', dungeon_views.create_dungeon, name='create_dungeon'),
    path('dungeons/<int:dungeon_id>/add-card/', dungeon_views.add_card_to_dungeon, name='add_card_to_dungeon'),
    path('dungeons/remove-card/<int:dungeon_card_id>/', dungeon_views.remove_card_from_dungeon, name='remove_card_from_dungeon'),
    path('dungeons/delete/<int:dungeon_id>/', dungeon_views.delete_dungeon, name='delete_dungeon'),
]