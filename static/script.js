let currentDungeon = null;
let selectedNormalCards = [];
let selectedLeaderCards = [];
let customCards = [];
let nextCardId = 100;
let nextDungeonId = 16;
let currentPlayer = null;
let playerCollection = [];

const availableCards = [

];

// Kazamaták tömbje - most már globálisan elérhető és megosztott
window.allDungeons = [
   ];

// Betöltjük a mentett kazamatákat és egyedi kártyákat, ha vannak
function loadFromLocalStorage() {
    const savedDungeons = localStorage.getItem('allDungeons');
    if (savedDungeons) {
        window.allDungeons = JSON.parse(savedDungeons);
    }
    const savedCustomCards = localStorage.getItem('customCards');
    if (savedCustomCards) {
        customCards = JSON.parse(savedCustomCards);
    }
    
    // Betöltjük a következő ID-kat is
    const savedNextCardId = localStorage.getItem('nextCardId');
    if (savedNextCardId) {
        nextCardId = parseInt(savedNextCardId);
    }
    const savedNextDungeonId = localStorage.getItem('nextDungeonId');
    if (savedNextDungeonId) {
        nextDungeonId = parseInt(savedNextDungeonId);
    }
    
    // // Betöltjük a játékos gyűjteményét
    // const savedPlayerCollection = localStorage.getItem('playerCollection');
    // if (savedPlayerCollection) {
    //     playerCollection = JSON.parse(savedPlayerCollection);
    // } else {
    //     // Alapértelmezett gyűjtemény - csak sima kártyák, nincsenek vezérkártyák
    //     playerCollection = [...availableCards];
    //     savePlayerCollection();
    // }
}

// Elmentjük a kazamatákat és egyedi kártyákat a localStorage-ba
function saveToLocalStorage() {
    localStorage.setItem('allDungeons', JSON.stringify(window.allDungeons));
    localStorage.setItem('customCards', JSON.stringify(customCards));
    localStorage.setItem('nextCardId', nextCardId.toString());
    localStorage.setItem('nextDungeonId', nextDungeonId.toString());
}

// Játékos gyűjtemény mentése
// function savePlayerCollection() {
//     localStorage.setItem('playerCollection', JSON.stringify(playerCollection));
// }

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    if (!username) {
        alert('Kérlek add meg a felhasználónevet!');
        return;
    }
    if (!password) {
        alert('Kérlek add meg a jelszót!');
        return;
    }

    console.log('Login:', { username, role });

    if (role === 'gamemaster') {
        renderGMDungeons();
        showScreen('gamemasterDungeonsScreen');
    } else {
        renderPlayerCards();
        renderPlayerDungeons();
        showScreen('playerDungeonsScreen');
    }
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regConfirm').value;
    const role = document.getElementById('regRole').value;

    if (!username) {
        alert('Kérlek add meg a felhasználónevet!');
        return;
    }
    if (!email) {
        alert('Kérlek add meg az email címet!');
        return;
    }
    if (!password || password.length < 6) {
        alert('A jelszónak legalább 6 karakternek kell lennie!');
        return;
    }
    if (password !== passwordConfirm) {
        alert('A két jelszó nem egyezik!');
        return;
    }

    console.log('Register:', { username, email, role });
    alert('Regisztráció sikeres! Most jelentkezz be.');
    showLogin();
}

function logout() {
    window.location.href = '/users';
}

function renderPlayerDungeons() {
    const grid = document.getElementById('playerDungeonsGrid');
    grid.innerHTML = '';

    // Csak a látható kazamatákat jelenítjük meg a játékosnak
    const playerDungeons = window.allDungeons.filter(dungeon => dungeon.visibleToPlayer);

    if (playerDungeons.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="font-size: 1.2rem; color: #493628;">
                    ❌ Nincsenek elérhető kazamaták.<br>
                    A játékmesternek be kell kapcsolnia a láthatóságot néhány kazamatánál.
                </p>
            </div>
        `;
        return;
    }

    playerDungeons.forEach(dungeon => {
        const card = document.createElement('div');
        card.className = 'dungeon-card';
        
        // Ellenőrizzük, hogy a kazamata elérhető-e a kiválasztott kártyák alapján
        let isEnabled = false;
        let requirementText = '';
        
        if (selectedNormalCards.length >= dungeon.minCards && selectedNormalCards.length <= dungeon.maxCards) {
            isEnabled = true;
            requirementText = `✅ ${selectedNormalCards.length}/${dungeon.maxCards} kártya`;
        } else {
            requirementText = `❌ ${selectedNormalCards.length}/${dungeon.maxCards} kártya`;
        }

        // Hozzáadunk egy állapotjelzőt a kazamata kártyához
        const statusInfo = dungeon.cardCount > 0 ? 
            `<p style="color: #28a745;">✅ ${dungeon.cardCount} kártya beállítva</p>` : 
            '<p style="color: #dc3545;">❌ Nincs beállítva</p>';

        card.innerHTML = `
            <h3>${dungeon.name}</h3>
            <div class="dungeon-tags">
                <span class="tag">${dungeon.type}</span>
                <span class="tag variant">${dungeon.variant}</span>
            </div>
            ${statusInfo}
            <p style="font-weight: bold;">${requirementText}</p>
            <p><strong>Kártya követelmény:</strong> ${dungeon.maxCards} kártya</p>
            <button class="btn ${isEnabled ? '' : 'disabled'}" ${isEnabled ? `onclick="enterDungeon(${dungeon.id})"` : 'disabled'}>
                ${isEnabled ? 'Belépés' : 'Nem elérhető'}
            </button>
        `;
        grid.appendChild(card);
    });
}

function enterDungeon(dungeonId) {
    currentDungeon = window.allDungeons.find(d => d.id === dungeonId);
    
    // Ellenőrizzük, hogy a kazamatában vannak-e kártyák
    if (currentDungeon.cardCount === 0) {
        alert('❌ Ez a kazamata még nincs beállítva!\n\nA játékmesternek először be kell állítania a kártyákat ehhez a kazamatához.');
        return;
    }
    
    // Ellenőrizzük, hogy a kiválasztott kártyák száma megfelel-e a kazamata típusának
    if (selectedNormalCards.length < currentDungeon.minCards || selectedNormalCards.length > currentDungeon.maxCards) {
        alert(`❌ Nem megfelelő számú kártya van kiválasztva ehhez a kazamatához!\n\nSzükséges: ${currentDungeon.maxCards} kártya\nKiválasztva: ${selectedNormalCards.length} kártya`);
        return;
    }
    
    // Kis és Nagy kazamaták esetén ellenőrizzük, hogy van-e vezérkártya
    if ((currentDungeon.type === "Kis" || currentDungeon.type === "Nagy") && currentDungeon.leaderCards.length === 0) {
        alert(`❌ A ${currentDungeon.type} kazamata esetén kötelező vezérkártya! A játékmesternek be kell állítania egy vezérkártyát.`);
        return;
    }
    
    startBattle();
}

function renderPlayerCards() {
    const grid = document.getElementById('playerCardsGrid');
    grid.innerHTML = '';

    // Csak a sima kártyákat jelenítjük meg (nincsenek vezérkártyák)
    const normalPlayerCards = playerCollection.filter(card => !card.isLeaderCard);

    normalPlayerCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `card-item ${card.element} ${selectedNormalCards.includes(card.id) ? 'selected' : ''}`;
        cardEl.setAttribute('data-card-id', card.id);
        
        // // Emoji kiválasztása a kártya típusa alapján
        // let emoji = '⚔️'; // alapértelmezett
        // if (card.name.includes('Varázsló')) emoji = '🔮';
        // if (card.name.includes('Íjász')) emoji = '🏹';
        // if (card.name.includes('Lovag')) emoji = '🛡️';
        // if (card.name.includes('Óriás')) emoji = '👹';
        // if (card.name.includes('Sárkány')) emoji = '🐉';
        // if (card.name.includes('Pap')) emoji = '🙏';
        // if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        // if (card.isCustom) {
        //     // Egyedi kártyákhoz speciális emojik
        //     if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
        //     if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
        //     if (card.name.includes('Villám')) emoji = '⚡';
        //     if (card.name.includes('Szellem')) emoji = '👻';
        // }
        
        // cardEl.innerHTML = `
        //     <div class="card-image">${emoji}</div>
        //     <h4>${card.name}</h4>
        //     <div class="card-element">${getElementEmoji(card.element)} ${getElementName(card.element)}</div>
        //     <div class="card-stats">
        //         <div class="stat">
        //             <div class="stat-label">⚔️ Támadás</div>
        //             <div class="stat-value">${card.attack}</div>
        //         </div>
        //         <div class="stat">
        //             <div class="stat-label">❤️ Életerő</div>
        //             <div class="stat-value">${card.health}</div>
        //         </div>
        //     </div>
        // `;
        
        cardEl.onclick = () => togglePlayerCard(card.id);
        grid.appendChild(cardEl);
    });

    updatePlayerCardCount();
}

function togglePlayerCard(cardId) {
    const cardEl = document.querySelector(`#playerCardsGrid .card-item[data-card-id="${cardId}"]`);
    
    if (selectedNormalCards.includes(cardId)) {
        selectedNormalCards = selectedNormalCards.filter(id => id !== cardId);
        cardEl.classList.remove('selected');
    } else {
        // Ellenőrizzük, hogy nem lépi-e túl a maximális kártyaszámot
        if (selectedNormalCards.length >= 6) {
            alert('Maximum 6 kártyát választhatsz ki a paklidhoz!');
            return;
        }
        selectedNormalCards.push(cardId);
        cardEl.classList.add('selected');
    }

    updatePlayerCardCount();
}

function updatePlayerCardCount() {
    document.getElementById('playerCardCount').textContent = selectedNormalCards.length;
    // Frissítjük a kazamatákat is, hogy a gombok állapota megváltozzon
    if (typeof renderPlayerDungeons === 'function') {
        renderPlayerDungeons();
    }
}

function backToPlayerDungeons() {
    selectedNormalCards = [];
    showScreen('playerDungeonsScreen');
}

function startBattle() {
    if (selectedNormalCards.length === 0) {
        alert('Válassz ki legalább egy kártyát a harchoz!');
        return;
    }

    // Ellenőrizzük, hogy a kiválasztott kártyák száma megfelel-e a kazamata típusának
    if (selectedNormalCards.length < currentDungeon.minCards || selectedNormalCards.length > currentDungeon.maxCards) {
        alert(`❌ Nem megfelelő számú kártya van kiválasztva ehhez a kazamatához!\n\nSzükséges: ${currentDungeon.maxCards} kártya\nKiválasztva: ${selectedNormalCards.length} kártya`);
        return;
    }

    // Összegyűjtjük a játékos kártyáinak teljes adatait
    const playerCardsData = selectedNormalCards.map(cardId => playerCollection.find(card => card.id === cardId));

    // Elmentjük a localStorage-ba
    localStorage.setItem('playerBattleCards', JSON.stringify(playerCardsData));
    localStorage.setItem('currentDungeon', JSON.stringify(currentDungeon));

    // Átirányítjuk a battle.html-re
    window.location.href = 'battle.html';
}

function renderGMDungeons() {
    const grid = document.getElementById('gmDungeonsGrid');
    grid.innerHTML = '';

    window.allDungeons.forEach(dungeon => {
        const card = document.createElement('div');
        card.className = 'dungeon-card';
        
        const cardCountInfo = dungeon.cardCount > 0 ? 
            `<p style="color: #667eea;">📦 ${dungeon.cardCount} kártya beállítva</p>` : 
            '<p style="color: #999;">Még nincs beállítva</p>';

        const visibilityStatus = dungeon.visibleToPlayer ? 
            '<p style="color: #28a745;">👁️ Látható a játékosoknak</p>' : 
            '<p style="color: #dc3545;">👁️‍🗨️ Rejtve a játékosok elől</p>';

        card.innerHTML = `
            <h3>${dungeon.name}</h3>
            <div class="dungeon-tags">
                <span class="tag">${dungeon.type}</span>
                <span class="tag variant">${dungeon.variant}</span>
            </div>
            ${cardCountInfo}
            ${visibilityStatus}
            <p><strong>Kártya követelmény:</strong> ${dungeon.maxCards} kártya</p>
            <div class="visibility-toggle">
                <input type="checkbox" id="visibility-${dungeon.id}" 
                    ${dungeon.visibleToPlayer ? 'checked' : ''} 
                    onchange="toggleDungeonVisibility(${dungeon.id}, this.checked)">
                <label for="visibility-${dungeon.id}">Megjelenítés a játékosoknál</label>
            </div>
            <button class="btn" onclick="editDungeon(${dungeon.id})">Szerkesztés</button>
        `;
        grid.appendChild(card);
    });
}

function toggleDungeonVisibility(dungeonId, isVisible) {
    const dungeon = window.allDungeons.find(d => d.id === dungeonId);
    if (dungeon) {
        dungeon.visibleToPlayer = isVisible;
        saveToLocalStorage();
        
        // Frissítjük a státuszt is
        const statusElement = document.querySelector(`#visibility-${dungeonId}`).closest('.dungeon-card').querySelector('p:nth-child(4)');
        if (statusElement) {
            statusElement.textContent = isVisible ? '👁️ Látható a játékosoknak' : '👁️‍🗨️ Rejtve a játékosok elől';
            statusElement.style.color = isVisible ? '#28a745' : '#dc3545';
        }
    }
}

function editDungeon(dungeonId) {
    currentDungeon = window.allDungeons.find(d => d.id === dungeonId);
    
    // Betöltjük a kazamata specifikus kártyákat
    selectedNormalCards = currentDungeon.enemyCards || [];
    selectedLeaderCards = currentDungeon.leaderCards || [];
    
    document.getElementById('gmDeckTitle').textContent = currentDungeon.name + ' - Szerkesztés';
    document.getElementById('dungeonCardRequirement').textContent = `${currentDungeon.minCards}-${currentDungeon.maxCards}`;
    
    renderGMCards();
    showScreen('gmDeckScreen');
}

function renderGMCards() {
    const normalGrid = document.getElementById('gmNormalCardsGrid');
    const leaderGrid = document.getElementById('gmLeaderCardsGrid');
    normalGrid.innerHTML = '';
    leaderGrid.innerHTML = '';

    const allCards = [...availableCards, ...customCards];
    
    // Szeparáljuk a sima és vezér kártyákat
    const normalCards = allCards.filter(card => !card.isLeaderCard);
    const leaderCards = allCards.filter(card => card.isLeaderCard);

    // Rendereljük a sima kártyákat
    normalCards.forEach(card => {
        const cardEl = createGMCardElement(card, 'normal');
        normalGrid.appendChild(cardEl);
    });

    // Rendereljük a vezér kártyákat
    leaderCards.forEach(card => {
        const cardEl = createGMCardElement(card, 'leader');
        leaderGrid.appendChild(cardEl);
    });

    updateGMCardCount();
}

function createGMCardElement(card, type) {
    const cardEl = document.createElement('div');
    const isSelected = type === 'normal' ? 
        selectedNormalCards.includes(card.id) : 
        selectedLeaderCards.includes(card.id);
    
    cardEl.className = `card-item ${card.element} ${isSelected ? 'selected' : ''} ${type === 'leader' ? 'leader' : ''}`;
    cardEl.id = `gm-card-${card.id}`;

    // Emoji kiválasztása a kártya típusa alapján
    let emoji = '⚔️'; // alapértelmezett
    if (card.name.includes('Varázsló')) emoji = '🔮';
    if (card.name.includes('Íjász')) emoji = '🏹';
    if (card.name.includes('Lovag')) emoji = '🛡️';
    if (card.name.includes('Óriás')) emoji = '👹';
    if (card.name.includes('Sárkány')) emoji = '🐉';
    if (card.name.includes('Pap')) emoji = '🙏';
    if (card.name.includes('Orgyilkos')) emoji = '🗡️';
    if (card.isCustom) {
        // Egyedi kártyákhoz speciális emojik
        if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
        if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
        if (card.name.includes('Villám')) emoji = '⚡';
        if (card.name.includes('Szellem')) emoji = '👻';
    }
    
    cardEl.innerHTML = `
        ${type === 'leader' ? '<div class="leader-badge">👑 Vezér</div>' : ''}
        ${card.isCustom ? `<button class="delete-card-btn" onclick="deleteCustomCard(event, ${card.id})">×</button>` : ''}
        <div class="card-image">${emoji}</div>
        <h4>${card.name}</h4>
        <div class="card-element">${getElementEmoji(card.element)} ${getElementName(card.element)}</div>
        <div class="card-stats">
            <div class="stat">
                <div class="stat-label">⚔️ Támadás</div>
                <div class="stat-value">${card.attack}</div>
            </div>
            <div class="stat">
                <div class="stat-label">❤️ Életerő</div>
                <div class="stat-value">${card.health}</div>
            </div>
        </div>
    `;
    
    cardEl.onclick = () => toggleGMCard(card.id, type);
    return cardEl;
}

function toggleGMCard(cardId, type) {
    const cardEl = document.getElementById(`gm-card-${cardId}`);
    
    if (type === 'normal') {
        if (selectedNormalCards.includes(cardId)) {
            selectedNormalCards = selectedNormalCards.filter(id => id !== cardId);
            cardEl.classList.remove('selected');
        } else {
            if (selectedNormalCards.length >= getMaxNormalCards()) {
                alert(`Maximum ${getMaxNormalCards()} sima kártyát választhatsz ki ehhez a kazamatához!`);
                return;
            }
            selectedNormalCards.push(cardId);
            cardEl.classList.add('selected');
        }
    } else {
        if (selectedLeaderCards.includes(cardId)) {
            selectedLeaderCards = selectedLeaderCards.filter(id => id !== cardId);
            cardEl.classList.remove('selected');
        } else {
            if (selectedLeaderCards.length >= 1) {
                alert('Maximum 1 vezérkártyát választhatsz ki!');
                return;
            }
            selectedLeaderCards.push(cardId);
            cardEl.classList.add('selected');
        }
    }

    updateGMCardCount();
}

function getMaxNormalCards() {
    if (!currentDungeon) return 0;
    return currentDungeon.type === "Egyszerű" ? 1 : 
           currentDungeon.type === "Kis" ? 3 : 5;
}

function updateGMCardCount() {
    const totalCards = selectedNormalCards.length + selectedLeaderCards.length;
    document.getElementById('gmCardCount').textContent = totalCards;
}

function backToGMDungeons() {
    selectedNormalCards = [];
    selectedLeaderCards = [];
    renderGMDungeons();
    showScreen('gamemasterDungeonsScreen');
}

function saveDungeon() {
    const totalCards = selectedNormalCards.length + selectedLeaderCards.length;
    
    // Ellenőrizzük, hogy a kiválasztott kártyák száma megfelel-e a kazamata követelményeinek
    if (totalCards < currentDungeon.minCards || totalCards > currentDungeon.maxCards) {
        alert(`❌ A kazamatához ${currentDungeon.minCards}-${currentDungeon.maxCards} kártya szükséges!\n\nJelenleg ${totalCards} kártya van kiválasztva.`);
        return;
    }

    if (selectedNormalCards.length === 0) {
        alert('Válassz ki legalább egy sima kártyát!');
        return;
    }

    // Kis és Nagy kazamaták esetén kötelező vezérkártya
    if ((currentDungeon.type === "Kis" || currentDungeon.type === "Nagy") && selectedLeaderCards.length === 0) {
        alert(`❌ ${currentDungeon.type} kazamata esetén kötelező vezérkártyát kijelölni!`);
        return;
    }

    // Egyszerű kazamaták esetén nem lehet vezérkártya
    if (currentDungeon.type === "Egyszerű" && selectedLeaderCards.length > 0) {
        alert(`❌ Egyszerű kazamata esetén nem lehet vezérkártya!`);
        return;
    }

    // Frissítjük a kazamata adatait
    currentDungeon.enemyCards = [...selectedNormalCards];
    currentDungeon.leaderCards = [...selectedLeaderCards];
    currentDungeon.cardCount = totalCards;

    // Elmentjük a kazamaták tömbjét
    saveToLocalStorage();

    console.log('=== SAVE DUNGEON ===');
    console.log('Dungeon:', currentDungeon);
    console.log('Selected normal cards:', selectedNormalCards);
    console.log('Selected leader cards:', selectedLeaderCards);

    alert(`✅ Kazamata "${currentDungeon.name}" sikeresen mentve!\n\n` +
          `📦 Kártyák száma: ${totalCards}\n` +
          `👑 Vezérkártyák: ${selectedLeaderCards.length}\n\n` +
          `A kazamata mostantól elérhető a játékosok számára!`);
    
    backToGMDungeons();
}

function showCreateDungeonModal() {
    document.getElementById('createDungeonModal').classList.add('active');
}

function closeCreateDungeonModal() {
    document.getElementById('createDungeonModal').classList.remove('active');
    document.getElementById('newDungeonName').value = '';
    document.getElementById('newDungeonType').value = '';
    document.getElementById('newDungeonVariant').value = '';
}

function createDungeon() {
    const name = document.getElementById('newDungeonName').value.trim();
    const type = document.getElementById('newDungeonType').value;
    const variant = document.getElementById('newDungeonVariant').value;

    if (!name) {
        alert('Add meg a kazamata nevét!');
        return;
    }
    if (!type) {
        alert('Válassz típust!');
        return;
    }
    if (!variant) {
        alert('Válassz változatot!');
        return;
    }

    // Meghatározzuk a kártya követelményeket a típus alapján
    let minCards = 1;
    let maxCards = 1;
    if (type === "Kis") {
        minCards = 4;
        maxCards = 4;
    } else if (type === "Nagy") {
        minCards = 6;
        maxCards = 6;
    }

    const newDungeon = {
        id: nextDungeonId++,
        name: name,
        type: type,
        variant: variant,
        minCards: minCards,
        maxCards: maxCards,
        cardCount: 0,
        enemyCards: [],
        leaderCards: [],
        visibleToPlayer: true // Alapértelmezetten látható
    };

    window.allDungeons.push(newDungeon);
    saveToLocalStorage(); // Új kazamata hozzáadása után mentés

    console.log('=== CREATE DUNGEON ===');
    console.log('New dungeon:', newDungeon);

    alert(`✅ Kazamata "${name}" létrehozva!`);
    closeCreateDungeonModal();
    renderGMDungeons();
}

function showCreateCardModal() {
    if (!currentDungeon) {
        alert('Hiba: Nincs kazamata kiválasztva!');
        return;
    }
    document.getElementById('createCardModal').classList.add('active');
}

function closeCreateCardModal() {
    document.getElementById('createCardModal').classList.remove('active');
    document.getElementById('newCardName').value = '';
    document.getElementById('newCardElement').value = 'earth';
    document.getElementById('newCardAttack').value = 5;
    document.getElementById('newCardHealth').value = 3;
}

function createCard() {
    const name = document.getElementById('newCardName').value.trim();
    const element = document.getElementById('newCardElement').value;
    const attack = parseInt(document.getElementById('newCardAttack').value) || 0;
    const health = parseInt(document.getElementById('newCardHealth').value) || 0;

    if (!name) {
        alert('Add meg a kártya nevét!');
        return;
    }
    if (attack < 2 || attack > 100) {
        alert('A támadás értéke 2 és 100 között kell legyen!');
        return;
    }
    if (health < 1 || health > 100) {
        alert('Az életerő értéke 1 és 100 között kell legyen!');
        return;
    }

    const newCard = {
        id: nextCardId++,
        name: name,
        element: element,
        attack: attack,
        health: health,
        isCustom: true,
        isLeaderCard: false // Ez egy sima kártya
    };

    customCards.push(newCard);
    saveToLocalStorage(); // Új kártya hozzáadása után mentés

    console.log('=== CREATE CARD ===');
    console.log('New card:', newCard);
    console.log('For dungeon:', currentDungeon);

    alert(`✅ Kártya "${name}" létrehozva!`);
    closeCreateCardModal();
    renderGMCards();
}

// Vezérkártya létrehozása
function showCreateLeaderCardModal() {
    if (!currentDungeon) {
        alert('Hiba: Nincs kazamata kiválasztva!');
        return;
    }
    
    const allCards = [...availableCards, ...customCards];
    const baseCardSelect = document.getElementById('baseCardForLeader');
    baseCardSelect.innerHTML = '<option value="">Válassz alap kártyát...</option>';
    
    // Csak sima kártyákat jelenítünk meg alapként
    const normalCards = allCards.filter(card => !card.isLeaderCard);
    
    normalCards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.name} (${getElementName(card.element)}) - ⚔️${card.attack} ❤️${card.health}`;
        baseCardSelect.appendChild(option);
    });
    
    document.getElementById('leaderCardName').value = '';
    document.getElementById('doubleAttack').checked = true;
    document.getElementById('doubleHealth').checked = false;
    
    updateLeaderCardPreview();
    
    document.getElementById('createLeaderCardModal').classList.add('active');
}

function closeCreateLeaderCardModal() {
    document.getElementById('createLeaderCardModal').classList.remove('active');
}

function updateLeaderCardPreview() {
    const baseCardId = document.getElementById('baseCardForLeader').value;
    const allCards = [...availableCards, ...customCards];
    const baseCard = allCards.find(card => card.id == baseCardId);
    
    const previewElement = document.getElementById('leaderCardPreview');
    
    if (!baseCard) {
        previewElement.innerHTML = '<p>Válassz egy alap kártyát az előnézethez.</p>';
        return;
    }
    
    const doubleAttack = document.getElementById('doubleAttack').checked;
    const leaderName = document.getElementById('leaderCardName').value || `${baseCard.name} Vezér`;
    
    const attack = doubleAttack ? baseCard.attack * 2 : baseCard.attack;
    const health = doubleAttack ? baseCard.health : baseCard.health * 2;
    
    previewElement.innerHTML = `
        <h4>${leaderName}</h4>
        <div class="leader-preview-stats">
            <div class="stat">
                <div class="stat-label">⚔️ Támadás</div>
                <div class="stat-value">${attack}</div>
            </div>
            <div class="stat">
                <div class="stat-label">❤️ Életerő</div>
                <div class="stat-value">${health}</div>
            </div>
        </div>
        <p><strong>Alap kártya:</strong> ${baseCard.name}</p>
        <p><strong>Módosítás:</strong> ${doubleAttack ? 'Támadás duplázva' : 'Életerő duplázva'}</p>
    `;
}

function createLeaderCard() {
    const baseCardId = document.getElementById('baseCardForLeader').value;
    const leaderName = document.getElementById('leaderCardName').value.trim();
    const doubleAttack = document.getElementById('doubleAttack').checked;
    
    if (!baseCardId) {
        alert('Válassz egy alap kártyát!');
        return;
    }
    
    if (!leaderName) {
        alert('Add meg a vezérkártya nevét!');
        return;
    }
    
    const allCards = [...availableCards, ...customCards];
    const baseCard = allCards.find(card => card.id == baseCardId);
    
    if (!baseCard) {
        alert('Hiba: Nem található a kiválasztott alap kártya!');
        return;
    }
    
    const attack = doubleAttack ? baseCard.attack * 2 : baseCard.attack;
    const health = doubleAttack ? baseCard.health : baseCard.health * 2;
    
    const leaderCard = {
        id: nextCardId++,
        name: leaderName,
        element: baseCard.element,
        attack: attack,
        health: health,
        isCustom: true,
        isLeaderCard: true,
        baseCardId: baseCard.id
    };
    
    customCards.push(leaderCard);
    saveToLocalStorage();
    
    console.log('=== CREATE LEADER CARD ===');
    console.log('Leader card:', leaderCard);
    console.log('Base card:', baseCard);
    
    alert(`✅ Vezérkártya "${leaderName}" létrehozva!\n\n` +
          `⚔️ Támadás: ${attack}\n` +
          `❤️ Életerő: ${health}\n` +
          `${doubleAttack ? 'Támadás duplázva' : 'Életerő duplázva'}`);
    
    closeCreateLeaderCardModal();
    renderGMCards();
}

function deleteCustomCard(event, cardId) {
    event.stopPropagation();
    
    if (!confirm('Biztosan törölni szeretnéd ezt a kártyát?')) {
        return;
    }

    selectedNormalCards = selectedNormalCards.filter(id => id !== cardId);
    selectedLeaderCards = selectedLeaderCards.filter(id => id !== cardId);

    customCards = customCards.filter(card => card.id !== cardId);
    saveToLocalStorage(); // Kártya törlése után mentés

    console.log('=== DELETE CARD ===');
    console.log('Deleted card ID:', cardId);

    renderGMCards();
}

// Segédfüggvények az elemekhez
function getElementEmoji(element) {
    switch(element) {
        case 'earth': return '🌍';
        case 'air': return '💨';
        case 'fire': return '🔥';
        case 'water': return '💧';
        default: return '❓';
    }
}

function getElementName(element) {
    switch(element) {
        case 'earth': return 'Föld';
        case 'air': return 'Levegő';
        case 'fire': return 'Tűz';
        case 'water': return 'Víz';
        default: return 'Ismeretlen';
    }
}

// Kártyatípusok hatásainak implementálása
function getTypeAdvantage(playerType, enemyType) {
    const advantages = {
        'fire': 'earth',
        'earth': 'water', 
        'water': 'air',
        'air': 'fire'
    };
    
    if (advantages[playerType] === enemyType) {
        return 1; // Játékos előnye
    } else if (advantages[enemyType] === playerType) {
        return -1; // Ellenség előnye
    }
    return 0; // Semleges
}

window.onclick = function(event) {
    const dungeonModal = document.getElementById('createDungeonModal');
    const cardModal = document.getElementById('createCardModal');
    const leaderCardModal = document.getElementById('createLeaderCardModal');
    
    if (event.target === dungeonModal) {
        closeCreateDungeonModal();
    }
    if (event.target === cardModal) {
        closeCreateCardModal();
    }
    if (event.target === leaderCardModal) {
        closeCreateLeaderCardModal();
    }
}

function goToPlayerLogin() {
    window.location.href = 'player/login';
}

function goToGamemasterLogin() {
    window.location.href = 'gamemaster/login';
}

function playerLogin() {
    const username = document.getElementById('playerUsername').value.trim();
    const password = document.getElementById('playerPassword').value;
    if (!username || !password) {
        alert('Töltsd ki az összes mezőt!');
        return;
    }
    console.log('Player login:', username);
    currentPlayer = username;
    window.location.href = 'player_dungeons.html';
}

function gamemasterLogin() {
    const username = document.getElementById('gmUsername').value.trim();
    const password = document.getElementById('gmPassword').value;
    if (!username || !password) {
        alert('Töltsd ki az összes mezőt!');
        return;
    }
    console.log('Gamemaster login:', username);
    window.location.href = 'gamemaster_dungeons.html';
}

function endBattle() {
    window.location.href = 'player_dungeons.html';
}

// Battle simulation functions
function loadBattleCards() {
    const currentDungeon = JSON.parse(localStorage.getItem('currentDungeon')) || {};
    
    // Ellenfél kártyák betöltése a kazamata adataiból
    const enemyCards = [];
    if (currentDungeon.enemyCards && currentDungeon.enemyCards.length > 0) {
        const allCards = [...availableCards, ...customCards];
        enemyCards.push(...currentDungeon.enemyCards.map(cardId => allCards.find(card => card.id === cardId)));
    }
    
    // Vezérkártyák hozzáadása
    if (currentDungeon.leaderCards && currentDungeon.leaderCards.length > 0) {
        const allCards = [...availableCards, ...customCards];
        enemyCards.push(...currentDungeon.leaderCards.map(cardId => allCards.find(card => card.id === cardId)));
    }
    
    const playerCards = JSON.parse(localStorage.getItem('playerBattleCards')) || [];

    // Ha nincsenek kártyák, visszatérünk
    if (enemyCards.length === 0 || playerCards.length === 0) {
        console.warn('Nincsenek kártyák a harchoz');
        return { enemyCards: [], playerCards: [], currentDungeon };
    }

    return { enemyCards, playerCards, currentDungeon };
}

function simulateBattle() {
    const { enemyCards, playerCards, currentDungeon } = loadBattleCards();

    // Ha nincsenek kártyák, alapértelmezett értékeket használunk
    const finalEnemyCards = enemyCards.length > 0 ? enemyCards : [
        { name: "Sötét Varázsló", attack: 8, health: 3, element: "fire" },
        { name: "Éjjeli Árnyék", attack: 6, health: 2, element: "air" }
    ];

    const finalPlayerCards = playerCards.length > 0 ? playerCards : [
        { name: "Harcos", attack: 5, health: 4, element: "earth" },
        { name: "Íjász", attack: 4, health: 2, element: "air" }
    ];

    displayCards(finalEnemyCards, 'enemyCards', currentDungeon.leaderCards);
    displayCards(finalPlayerCards, 'playerCards');
    const battleResult = simulateBattleRounds(finalEnemyCards, finalPlayerCards, currentDungeon);
    
    // Ha a játékos nyert, megjelenítjük a nyeremény modált
    if (battleResult.playerWins) {
        setTimeout(() => {
            showRewardModal(currentDungeon.type, battleResult.playerWins);
        }, 1000);
    }
}

function displayCards(cards, containerId, leaderCardIds = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        const isLeader = leaderCardIds.includes(card.id);
        cardElement.className = `battle-card ${card.element} ${isLeader ? 'leader' : ''}`;
        
        // Emoji kiválasztása
        let emoji = '⚔️';
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
        if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
        if (card.name.includes('Villám')) emoji = '⚡';
        if (card.name.includes('Szellem')) emoji = '👻';
        
        cardElement.innerHTML = `
            ${isLeader ? '<div class="battle-leader-badge">👑</div>' : ''}
            <div class="card-image">${emoji}</div>
            <h4>${card.name}</h4>
            <div class="card-element">${getElementEmoji(card.element)} ${getElementName(card.element)}</div>
            <div class="card-stats">
                <div class="stat">
                    <div class="stat-label">⚔️ Támadás</div>
                    <div class="stat-value">${card.attack}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">❤️ Életerő</div>
                    <div class="stat-value">${card.health}</div>
                </div>
            </div>
        `;
        
        container.appendChild(cardElement);
    });
}

function simulateBattleRounds(enemyCards, playerCards, currentDungeon) {
    const battleLog = document.getElementById('battleLog');
    battleLog.innerHTML = '<h3>Harc napló:</h3>';
    
    let playerWins = 0;
    let enemyWins = 0;
    
    for (let i = 0; i < Math.min(enemyCards.length, playerCards.length); i++) {
        const enemyCard = enemyCards[i];
        const playerCard = playerCards[i];
        
        const roundResult = calculateRoundResult(playerCard, enemyCard);
        
        if (roundResult.playerWins) {
            playerWins++;
        } else {
            enemyWins++;
        }
        
        const roundElement = document.createElement('div');
        roundElement.className = 'battle-round';
        roundElement.innerHTML = `
            <strong>${i + 1}. kör:</strong> ${playerCard.name} vs ${enemyCard.name} - 
            <span class="${roundResult.playerWins ? 'victory' : 'defeat'}">
                ${roundResult.playerWins ? 'Győzelem' : 'Vereség'}
            </span>
            ${roundResult.details ? ` (${roundResult.details})` : ''}
        `;
        
        battleLog.appendChild(roundElement);
    }
    
    // Összesített eredmény
    const totalRounds = Math.min(enemyCards.length, playerCards.length);
    const resultElement = document.createElement('div');
    resultElement.className = 'battle-result';
    
    const playerWon = playerWins >= enemyWins;
    
    if (playerWon) {
        resultElement.innerHTML = `
            <h3 class="victory">🎉 Győzelem!</h3>
            <p>${playerWins}/${totalRounds} kört nyertél meg!</p>
            ${currentDungeon.name ? `<p>Kazamata: ${currentDungeon.name}</p>` : ''}
        `;
    } else {
        resultElement.innerHTML = `
            <h3 class="defeat">💀 Vereség</h3>
            <p>Csak ${playerWins}/${totalRounds} kört nyertél meg.</p>
            ${currentDungeon.name ? `<p>Kazamata: ${currentDungeon.name}</p>` : ''}
        `;
    }
    
    battleLog.appendChild(resultElement);
    
    return { playerWins: playerWon, rounds: totalRounds, playerScore: playerWins, enemyScore: enemyWins };
}

function calculateRoundResult(playerCard, enemyCard) {
    // 1. Szabály: sebzés > ellenfél életereje
    if (playerCard.attack > enemyCard.health) {
        return { playerWins: true, details: `${playerCard.attack} > ${enemyCard.health}` };
    } else if (enemyCard.attack > playerCard.health) {
        return { playerWins: false, details: `${playerCard.attack} < ${enemyCard.health}` };
    }

    // 2. Szabály: típusok összehasonlítása
    const typeAdvantage = getTypeAdvantage(playerCard.element, enemyCard.element);
    
    if (typeAdvantage === 1) {
        return { playerWins: true, details: `${getElementName(playerCard.element)} legyőzi ${getElementName(enemyCard.element)}` };
    } else if (typeAdvantage === -1) {
        return { playerWins: false, details: `${getElementName(enemyCard.element)} legyőzi ${getElementName(playerCard.element)}` };
    }

    // 3. Szabály: ha még mindig döntetlen, akkor a kazamata kártyája nyer
    return { playerWins: false, details: "Döntetlen - a kazamata kártyája nyer" };
}

// Nyeremény modál
function showRewardModal(dungeonType, playerWon) {
    if (!playerWon) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🎉 Nyeremény!</h2>
            <p>A ${dungeonType} kazamata legyőzése után válassz egy kártyát a gyűjteményedből, amit fejleszteni szeretnél.</p>
            <div class="form-group">
                <label for="rewardCardSelect">Kártya kiválasztása</label>
                <select id="rewardCardSelect" class="dungeon-select">
                    ${playerCollection.filter(card => !card.isLeaderCard).map(card => `
                        <option value="${card.id}">${card.name} (${getElementName(card.element)}) - ⚔️${card.attack} ❤️${card.health}</option>
                    `).join('')}
                </select>
            </div>
            <div id="rewardPreview"></div>
            <div class="modal-buttons">
                <button class="btn btn-success" onclick="applyReward('${dungeonType}')">Nyeremény alkalmazása</button>
                <button class="btn btn-secondary" onclick="closeRewardModal()">Később</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Előnézet frissítése
    document.getElementById('rewardCardSelect').addEventListener('change', function() {
        updateRewardPreview(dungeonType);
    });
    updateRewardPreview(dungeonType);
}

function updateRewardPreview(dungeonType) {
    const select = document.getElementById('rewardCardSelect');
    const cardId = parseInt(select.value);
    const card = playerCollection.find(c => c.id === cardId);
    
    let rewardText = '';
    if (dungeonType === 'Egyszerű') {
        rewardText = `⚔️ Támadás: ${card.attack} → ${card.attack + 1}`;
    } else if (dungeonType === 'Kis') {
        rewardText = `❤️ Életerő: ${card.health} → ${card.health + 2}`;
    } else if (dungeonType === 'Nagy') {
        rewardText = `⚔️ Támadás: ${card.attack} → ${card.attack + 3}`;
    }
    
    document.getElementById('rewardPreview').innerHTML = `<p><strong>Fejlesztés:</strong> ${rewardText}</p>`;
}

function applyReward(dungeonType) {
    const select = document.getElementById('rewardCardSelect');
    const cardId = parseInt(select.value);
    const cardIndex = playerCollection.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) return;
    
    // Alkalmazzuk a nyereményt
    if (dungeonType === 'Egyszerű') {
        playerCollection[cardIndex].attack += 1;
    } else if (dungeonType === 'Kis') {
        playerCollection[cardIndex].health += 2;
    } else if (dungeonType === 'Nagy') {
        playerCollection[cardIndex].attack += 3;
    }
    
    // Mentés
    savePlayerCollection();
    
    closeRewardModal();
    alert('✅ A kártyád fejlődött!');
}

function closeRewardModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

window.onload = () => {
    loadFromLocalStorage(); // Betöltjük a mentett kazamatákat és egyedi kártyákat

    const path = window.location.pathname;
    if (path.includes('player_dungeons.html')) {
        renderPlayerCards();
        renderPlayerDungeons();
    }
    if (path.includes('gamemaster_dungeons.html')) renderGMDungeons();
    
    // Battle oldal betöltésekor automatikusan indítsuk a harcot
    if (path.includes('battle.html') && typeof simulateBattle === 'function') {
        simulateBattle();
    }
};