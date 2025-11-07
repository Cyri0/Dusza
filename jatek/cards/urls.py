# cards/urls.py
from django.urls import path
from . import views

app_name = 'cards'

urlpatterns = [
    # Ideiglenes üres URL minta
    path('', views.card_list, name='card-list'),
]