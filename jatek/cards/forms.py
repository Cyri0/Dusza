from django import forms
from .models import PlayerCards, WorldCard, LeaderCard, Dungeon, PlayerDeck

class WorldCardForm(forms.ModelForm):
    class Meta:
        model = WorldCard
        fields = ['name', 'base_damage', 'base_health', 'card_type']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'base_damage': forms.NumberInput(attrs={'class': 'form-control'}),
            'base_health': forms.NumberInput(attrs={'class': 'form-control'}),
            'card_type': forms.Select(attrs={'class': 'form-control'}),
        }

class LeaderCardForm(forms.ModelForm):
    class Meta:
        model = LeaderCard
        fields = ['name', 'base_card', 'is_damage_doubled', 'is_health_doubled']

class DungeonForm(forms.ModelForm):
    class Meta:
        model = Dungeon
        fields = ['name', 'dungeon_type', 'leader_card']

class DeckForm(forms.ModelForm):
    class Meta:
        model = PlayerDeck
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Pakli neve'
            })
        }

class DeckCardForm(forms.Form):
    card = forms.ModelChoiceField(
        queryset=None,
        empty_label="Válassz kártyát",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    def init(self, args, **kwargs):
        user = kwargs.pop('user', None)
        super().init(args, **kwargs)
        if user:
            self.fields['card'].queryset = PlayerCards.objects.filter(player=user)

class BattleForm(forms.Form):
    dungeon = forms.ModelChoiceField(
        queryset=Dungeon.objects.all(),
        empty_label="Válassz kazamatát",
        widget=forms.Select(attrs={'class': 'form-control'})
    )