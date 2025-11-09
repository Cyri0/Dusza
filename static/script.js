let currentDungeon = null;
let selectedCards = [];
let leaderCard = null;
let customCards = [];
let nextCardId = 100;
let nextDungeonId = 16;

 const availableCards = [
     { id: 1, name: "Harcos", element: "earth", attack: 5, health: 3, isCustom: false },
     { id: 2, name: "Varázsló", element: "fire", attack: 7, health: 2, isCustom: false },
     { id: 3, name: "Íjász", element: "air", attack: 4, health: 2, isCustom: false },
     { id: 4, name: "Lovag", element: "earth", attack: 6, health: 5, isCustom: false },
     { id: 7, name: "Óriás", element: "earth", attack: 10, health: 8, isCustom: false },
     { id: 8, name: "Sárkány", element: "fire", attack: 12, health: 10, isCustom: false },
     { id: 9, name: "Pap", element: "water", attack: 2, health: 4, isCustom: false },
     { id: 10, name: "Orgyilkos", element: "air", attack: 9, health: 1, isCustom: false }
 ];


window.allDungeons = [
    { id: 1, name: "Hegy Egyszerű", type: "Egyszerű", variant: "Hegy", minCards: 1, maxCards: 1, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 2, name: "Sivatag Egyszerű", type: "Egyszerű", variant: "Sivatag", minCards: 1, maxCards: 1, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 3, name: "Mocsár Egyszerű", type: "Egyszerű", variant: "Mocsár", minCards: 1, maxCards: 1, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 4, name: "Barlang Egyszerű", type: "Egyszerű", variant: "Barlang", minCards: 1, maxCards: 1, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 5, name: "Dzsungel Egyszerű", type: "Egyszerű", variant: "Dzsungel", minCards: 1, maxCards: 1, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 6, name: "Hegy Kis", type: "Kis", variant: "Hegy", minCards: 4, maxCards: 4, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 7, name: "Sivatag Kis", type: "Kis", variant: "Sivatag", minCards: 4, maxCards: 4, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 8, name: "Mocsár Kis", type: "Kis", variant: "Mocsár", minCards: 4, maxCards: 4, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 9, name: "Barlang Kis", type: "Kis", variant: "Barlang", minCards: 4, maxCards: 4, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 10, name: "Dzsungel Kis", type: "Kis", variant: "Dzsungel", minCards: 4, maxCards: 4, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 11, name: "Hegy Nagy", type: "Nagy", variant: "Hegy", minCards: 6, maxCards: 6, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 12, name: "Sivatag Nagy", type: "Nagy", variant: "Sivatag", minCards: 6, maxCards: 6, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 13, name: "Mocsár Nagy", type: "Nagy", variant: "Mocsár", minCards: 6, maxCards: 6, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 14, name: "Barlang Nagy", type: "Nagy", variant: "Barlang", minCards: 6, maxCards: 6, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true },
    { id: 15, name: "Dzsungel Nagy", type: "Nagy", variant: "Dzsungel", minCards: 6, maxCards: 6, cardCount: 0, enemyCards: [], leaderCard: null, visibleToPlayer: true }
];

function loadFromLocalStorage() {
    const savedDungeons = localStorage.getItem('allDungeons');
    if (savedDungeons) {
        window.allDungeons = JSON.parse(savedDungeons);
    }
    const savedCustomCards = localStorage.getItem('customCards');
    if (savedCustomCards) {
        customCards = JSON.parse(savedCustomCards);
    }
    
    const savedNextCardId = localStorage.getItem('nextCardId');
    if (savedNextCardId) {
        nextCardId = parseInt(savedNextCardId);
    }
    const savedNextDungeonId = localStorage.getItem('nextDungeonId');
    if (savedNextDungeonId) {
        nextDungeonId = parseInt(savedNextDungeonId);
    }
}


function saveToLocalStorage() {
    localStorage.setItem('allDungeons', JSON.stringify(window.allDungeons));
    localStorage.setItem('customCards', JSON.stringify(customCards));
    localStorage.setItem('nextCardId', nextCardId.toString());
    localStorage.setItem('nextDungeonId', nextDungeonId.toString());
}

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
        

        let isEnabled = false;
        let requirementText = '';
        
        if (selectedCards.length >= dungeon.minCards && selectedCards.length <= dungeon.maxCards) {
            isEnabled = true;
            requirementText = `✅ ${selectedCards.length}/${dungeon.maxCards} kártya`;
        } else {
            requirementText = `❌ ${selectedCards.length}/${dungeon.maxCards} kártya`;
        }
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
    

    if (currentDungeon.cardCount === 0) {
        alert('❌ Ez a kazamata még nincs beállítva!\n\nA játékmesternek először be kell állítania a kártyákat ehhez a kazamatához.');
        return;
    }
    

    if (selectedCards.length < currentDungeon.minCards || selectedCards.length > currentDungeon.maxCards) {
        alert(`❌ Nem megfelelő számú kártya van kiválasztva ehhez a kazamatához!\n\nSzükséges: ${currentDungeon.maxCards} kártya\nKiválasztva: ${selectedCards.length} kártya`);
        return;
    }
    
    startBattle();
}

function renderPlayerCards() {
    const grid = document.getElementById('playerCardsGrid');
    grid.innerHTML = '';

    const allCards = [...availableCards, ...customCards];

    allCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `card-item ${card.element} ${selectedCards.includes(card.id) ? 'selected' : ''}`;
        cardEl.setAttribute('data-card-id', card.id);
        

        let emoji = '⚔️'; 
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        if (card.isCustom) {
       
            if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
            if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
            if (card.name.includes('Villám')) emoji = '⚡';
            if (card.name.includes('Szellem')) emoji = '👻';
        }
        
        cardEl.innerHTML = `
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
        
        cardEl.onclick = () => togglePlayerCard(card.id);
        grid.appendChild(cardEl);
    });

    updatePlayerCardCount();
}

function togglePlayerCard(cardId) {
    const cardEl = document.querySelector(`#playerCardsGrid .card-item[data-card-id="${cardId}"]`);
    
    if (selectedCards.includes(cardId)) {
        selectedCards = selectedCards.filter(id => id !== cardId);
        cardEl.classList.remove('selected');
    } else {
        selectedCards.push(cardId);
        cardEl.classList.add('selected');
    }

    updatePlayerCardCount();
}

function updatePlayerCardCount() {
    document.getElementById('playerCardCount').textContent = selectedCards.length;

    if (typeof renderPlayerDungeons === 'function') {
        renderPlayerDungeons();
    }
}

function backToPlayerDungeons() {
    selectedCards = [];
    showScreen('playerDungeonsScreen');
}

function startBattle() {
    if (selectedCards.length === 0) {
        alert('Válassz ki legalább egy kártyát a harchoz!');
        return;
    }


    if (selectedCards.length < currentDungeon.minCards || selectedCards.length > currentDungeon.maxCards) {
        alert(`❌ Nem megfelelő számú kártya van kiválasztva ehhez a kazamatához!\n\nSzükséges: ${currentDungeon.maxCards} kártya\nKiválasztva: ${selectedCards.length} kártya`);
        return;
    }


    const allCards = [...availableCards, ...customCards];
    const playerCardsData = selectedCards.map(cardId => allCards.find(card => card.id === cardId));


    localStorage.setItem('playerBattleCards', JSON.stringify(playerCardsData));
    localStorage.setItem('currentDungeon', JSON.stringify(currentDungeon));


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
        
 
        const statusElement = document.querySelector(`#visibility-${dungeonId}`).closest('.dungeon-card').querySelector('p:nth-child(4)');
        if (statusElement) {
            statusElement.textContent = isVisible ? '👁️ Látható a játékosoknak' : '👁️‍🗨️ Rejtve a játékosok elől';
            statusElement.style.color = isVisible ? '#28a745' : '#dc3545';
        }
    }
}

function editDungeon(dungeonId) {
    currentDungeon = window.allDungeons.find(d => d.id === dungeonId);

    selectedCards = currentDungeon.enemyCards || [];
    leaderCard = currentDungeon.leaderCard || null;
    
    document.getElementById('gmDeckTitle').textContent = currentDungeon.name + ' - Szerkesztés';
    
    renderGMCards();
    showScreen('gmDeckScreen');
}

function renderGMCards() {
    const grid = document.getElementById('gmCardsGrid');
    grid.innerHTML = '';

    const allCards = [...availableCards, ...customCards];

    allCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `card-item ${card.element} ${leaderCard === card.id ? 'leader' : ''}`;
        cardEl.id = `gm-card-${card.id}`;
        
        const isSelected = selectedCards.includes(card.id);
        const isLeader = leaderCard === card.id;
        
        if (isSelected) cardEl.classList.add('selected');


        let emoji = '⚔️'; 
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        if (card.isCustom) {

            if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
            if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
            if (card.name.includes('Villám')) emoji = '⚡';
            if (card.name.includes('Szellem')) emoji = '👻';
        }
        
        cardEl.innerHTML = `
            ${isLeader ? '<div class="leader-badge">👑 Vezér</div>' : ''}
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
            <div class="leader-checkbox">
                <input type="checkbox" id="leader-${card.id}" 
                    ${isLeader ? 'checked' : ''}>
                <label for="leader-${card.id}">Vezér</label>
            </div>
        `;
        
        cardEl.onclick = (e) => {
            if (!e.target.matches('input, label, button')) {
                toggleGMCard(card.id);
            }
        };

        const checkbox = cardEl.querySelector(`#leader-${card.id}`);
        checkbox.onclick = (e) => {
            e.stopPropagation();
            setLeader(card.id, checkbox.checked);
        };

        grid.appendChild(cardEl);
    });

    updateGMCardCount();
}

function toggleGMCard(cardId) {
    const cardEl = document.getElementById(`gm-card-${cardId}`);
    
    if (selectedCards.includes(cardId)) {
        selectedCards = selectedCards.filter(id => id !== cardId);
        cardEl.classList.remove('selected');
        
        if (leaderCard === cardId) {
            leaderCard = null;
            const checkbox = document.getElementById(`leader-${cardId}`);
            if (checkbox) checkbox.checked = false;
        }
    } else {
        selectedCards.push(cardId);
        cardEl.classList.add('selected');
    }

    updateGMCardCount();
}

function setLeader(cardId, isChecked) {
    if (isChecked) {
        if (leaderCard && leaderCard !== cardId) {
            const oldCheckbox = document.getElementById(`leader-${leaderCard}`);
            if (oldCheckbox) oldCheckbox.checked = false;
        }
        
        leaderCard = cardId;
        
        if (!selectedCards.includes(cardId)) {
            toggleGMCard(cardId);
        }
        
        renderGMCards();
    } else {
        if (leaderCard === cardId) {
            leaderCard = null;
            renderGMCards();
        }
    }
}

function updateGMCardCount() {
    document.getElementById('gmCardCount').textContent = selectedCards.length;
}

function backToGMDungeons() {
    selectedCards = [];
    leaderCard = null;
    renderGMDungeons();
    showScreen('gamemasterDungeonsScreen');
}

function saveDungeon() {

    if (selectedCards.length < currentDungeon.minCards || selectedCards.length > currentDungeon.maxCards) {
        alert(`❌ A kazamatához ${currentDungeon.minCards}-${currentDungeon.maxCards} kártya szükséges!\n\nJelenleg ${selectedCards.length} kártya van kiválasztva.`);
        return;
    }

    if (selectedCards.length === 0) {
        alert('Válassz ki legalább egy kártyát!');
        return;
    }

    if (!leaderCard) {
        alert('Jelölj meg egy kártyát vezérként!');
        return;
    }

    currentDungeon.enemyCards = [...selectedCards];
    currentDungeon.leaderCard = leaderCard;
    currentDungeon.cardCount = selectedCards.length;


    saveToLocalStorage();

    console.log('=== SAVE DUNGEON ===');
    console.log('Dungeon:', currentDungeon);
    console.log('Selected cards:', selectedCards);

    alert(`✅ Kazamata "${currentDungeon.name}" sikeresen mentve!\n\n` +
          `📦 Kártyák száma: ${selectedCards.length}\n` +
          `👑 Vezér: ${currentDungeon.leaderCard}\n\n` +
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
        leaderCard: null,
        visibleToPlayer: true 
    };

    window.allDungeons.push(newDungeon);
    saveToLocalStorage();

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

    const newCard = {
        id: nextCardId++,
        name: name,
        element: element,
        attack: attack,
        health: health,
        isCustom: true
    };

    customCards.push(newCard);
    saveToLocalStorage(); 

    console.log('=== CREATE CARD ===');
    console.log('New card:', newCard);
    console.log('For dungeon:', currentDungeon);

    alert(`✅ Kártya "${name}" létrehozva!`);
    closeCreateCardModal();
    renderGMCards();
}


function showCreateLeaderCardModal() {
    if (!currentDungeon) {
        alert('Hiba: Nincs kazamata kiválasztva!');
        return;
    }
    
    const allCards = [...availableCards, ...customCards];
    const baseCardSelect = document.getElementById('baseCardForLeader');
    baseCardSelect.innerHTML = '<option value="">Válassz alap kártyát...</option>';
    
    allCards.forEach(card => {
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

    selectedCards = selectedCards.filter(id => id !== cardId);
    if (leaderCard === cardId) {
        leaderCard = null;
    }

    customCards = customCards.filter(card => card.id !== cardId);
    saveToLocalStorage(); 

    console.log('=== DELETE CARD ===');
    console.log('Deleted card ID:', cardId);

    renderGMCards();
}


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
    window.location.href = 'player/dungeons';
}

function gamemasterLogin() {
    const username = document.getElementById('gmUsername').value.trim();
    const password = document.getElementById('gmPassword').value;
    if (!username || !password) {
        alert('Töltsd ki az összes mezőt!');
        return;
    }
    console.log('Gamemaster login:', username);
    window.location.href = 'gamemaster/dungeons';
}

function endBattle() {
    window.location.href = 'player/dungeons';
}


function loadBattleCards() {
    const currentDungeon = JSON.parse(localStorage.getItem('currentDungeon')) || {};
    

    const enemyCards = [];
    if (currentDungeon.enemyCards && currentDungeon.enemyCards.length > 0) {
        const allCards = [...availableCards, ...customCards];
        enemyCards.push(...currentDungeon.enemyCards.map(cardId => allCards.find(card => card.id === cardId)));
    }
    
    const playerCards = JSON.parse(localStorage.getItem('playerBattleCards')) || [];


    if (enemyCards.length === 0 || playerCards.length === 0) {
        console.warn('Nincsenek kártyák a harchoz');
        return { enemyCards: [], playerCards: [], currentDungeon };
    }

    return { enemyCards, playerCards, currentDungeon };
}

function simulateBattle() {
    const { enemyCards, playerCards, currentDungeon } = loadBattleCards();


    const finalEnemyCards = enemyCards.length > 0 ? enemyCards : [
        { name: "Sötét Varázsló", attack: 8, health: 3, element: "fire" },
        { name: "Éjjeli Árnyék", attack: 6, health: 2, element: "air" }
    ];

    const finalPlayerCards = playerCards.length > 0 ? playerCards : [
        { name: "Harcos", attack: 5, health: 4, element: "earth" },
        { name: "Íjász", attack: 4, health: 2, element: "air" }
    ];

    displayCards(finalEnemyCards, 'enemyCards', currentDungeon.leaderCard);
    displayCards(finalPlayerCards, 'playerCards');
    simulateBattleRounds(finalEnemyCards, finalPlayerCards, currentDungeon);
}

function displayCards(cards, containerId, leaderCardId = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        const isLeader = leaderCardId !== null && card.id === leaderCardId;
        cardElement.className = `battle-card ${card.element} ${isLeader ? 'leader' : ''}`;

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
    

    const totalRounds = Math.min(enemyCards.length, playerCards.length);
    const resultElement = document.createElement('div');
    resultElement.className = 'battle-result';
    
    if (playerWins >= enemyWins) {
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
}

function calculateRoundResult(playerCard, enemyCard) {
    if (playerCard.attack > enemyCard.health) {
        return { playerWins: true, details: `${playerCard.attack} > ${enemyCard.health}` };
    } else if (playerCard.attack < enemyCard.health) {
        return { playerWins: false, details: `${playerCard.attack} < ${enemyCard.health}` };
    } else {
        return { playerWins: false, details: "Egyenlő erő" };
    }
}

window.onload = () => {
    loadFromLocalStorage(); 

    const path = window.location.pathname;
    if (path.includes('player/dungeons')) {
        renderPlayerCards();
        renderPlayerDungeons();
    }
    if (path.includes('gamemaster/dungeons')) renderGMDungeons();
    

    if (path.includes('battle.html') && typeof simulateBattle === 'function') {
        simulateBattle();
    }
};