# cards/forms.py
from django import forms
from .models import Dungeon, LeaderCard, WorldCard, DungeonCard

class DungeonForm(forms.ModelForm):
    class Meta:
        model = Dungeon
        fields = ['name', 'dungeon_type', 'leader_card']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Kazamata neve',
                'maxlength': '100'
            }),
            'dungeon_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'leader_card': forms.Select(attrs={
                'class': 'form-control'
            }),
        }
        labels = {
            'name': 'Kazamata neve',
            'dungeon_type': 'Kazamata típusa',
            'leader_card': 'Vezérkártya',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Csak elérhető vezérkártyák jelenjenek meg
        self.fields['leader_card'].queryset = LeaderCard.objects.all()
        
        # Placeholder szövegek
        self.fields['name'].widget.attrs['placeholder'] = 'Pl.: Moria Barlangjai'
        
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name and len(name.strip()) == 0:
            raise forms.ValidationError('A kazamata neve nem lehet üres!')
        return name.strip()

    def clean(self):
        cleaned_data = super().clean()
        dungeon_type = cleaned_data.get('dungeon_type')
        leader_card = cleaned_data.get('leader_card')
        
        # További validációk itt, ha szükséges
        return cleaned_data


class AddCardToDungeonForm(forms.Form):
    card_id = forms.ModelChoiceField(
        queryset=WorldCard.objects.all(),
        widget=forms.Select(attrs={
            'class': 'form-control',
            'style': 'padding: 5px;'
        }),
        label="Válassz kártyát",
        empty_label="-- Válassz kártyát --"
    )
    
    def __init__(self, *args, **kwargs):
        dungeon = kwargs.pop('dungeon', None)
        super().__init__(*args, **kwargs)
        
        if dungeon:
            # Kizárjuk azokat a kártyákat, amelyek már benne vannak a kazamatában
            existing_card_ids = dungeon.dungeon_cards.values_list('world_card_id', flat=True)
            self.fields['card_id'].queryset = WorldCard.objects.exclude(id__in=existing_card_ids)


class DungeonCardForm(forms.ModelForm):
    class Meta:
        model = DungeonCard
        fields = ['world_card']
        widgets = {
            'world_card': forms.Select(attrs={'class': 'form-control'})
        }
        labels = {
            'world_card': 'Kártya'
        }


class DungeonDeleteForm(forms.Form):
    confirm = forms.BooleanField(
        required=True,
        label="Biztosan törlöd a kazamatát?",
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )