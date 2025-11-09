from django.shortcuts import redirect, render

def index(request):

    return redirect('users:role-selection')
