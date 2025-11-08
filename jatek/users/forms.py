from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile
class PlayerRegistrationForm(UserCreationForm):
  
    role = forms.MultipleChoiceField(
    choices=[
        ('jatekos', 'Játékos'),
        ('jatekosmester', 'Játékosmester')
    ],
    widget=forms.SelectMultiple(attrs={'class': 'form-control'})
)

    class Meta:
        model = User
        fields = ['username', 'password1', 'password2', 'role']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            # Most hozzuk létre a UserProfile-t a megadott szerepkörrel
            UserProfile.objects.create(user=user, role=self.cleaned_data['role'])
        return user


    
class PlayerLoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)