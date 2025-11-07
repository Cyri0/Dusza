from django.shortcuts import render
from django.http import HttpResponse

def card_list(request):
    """Ideiglenes view - később cseréld ki"""
    return HttpResponse("""
    <h1>Kártya kezelés</h1>
    <p>Ez a kártya kezelő felület lesz.</p>
    <a href="/">Vissza a főoldalra</a>
    """)