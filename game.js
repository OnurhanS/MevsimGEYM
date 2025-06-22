// MevsimGEYM - Eğitici Eşleştirme Oyunu
// Tüm metinler ve kartlar sadece Türkçe olacak.

// --- Oyun Verileri ---
const categories = {
    mevsimler: [
        { text: 'İlkbahar', emoji: '🌸' },
        { text: 'Yaz', emoji: '☀️' },
        { text: 'Sonbahar', emoji: '🍂' },
        { text: 'Kış', emoji: '❄️' }
    ],
    renkler: [
        { text: 'Kırmızı', color: '#ff0000' },
        { text: 'Mavi', color: '#0000ff' },
        { text: 'Yeşil', color: '#00ff00' },
        { text: 'Sarı', color: '#ffff00' }
    ],
    hayvanlar: [
        { text: 'Kedi', emoji: '🐱' },
        { text: 'Köpek', emoji: '🐶' },
        { text: 'Kuş', emoji: '🐦' },
        { text: 'Balık', emoji: '🐟' }
    ],
    meyveler: [
        { text: 'Elma', emoji: '🍎' },
        { text: 'Muz', emoji: '🍌' },
        { text: 'Portakal', emoji: '🍊' },
        { text: 'Çilek', emoji: '🍓' }
    ]
};

// --- Oyun Durumu ---
let currentScreen = 'login';
let currentLevel = 1;
let currentCategory = 'mevsimler';
let playerName = '';
let score = 0;
let matchedPairs = 0;
let totalPairs = 4;
let leaderboard = [];

// Sürükle-bırak değişkenleri
let draggedCard = null;
let dropZones = [];
let matchedCards = [];

// --- Ekranlar ve Oyun Fonksiyonları ---
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screen + 'Screen').classList.remove('hidden');
}

function renderLogin() {
    const el = document.getElementById('loginScreen');
    el.innerHTML = `
        <h1>MevsimGEYM</h1>
        <p>Oyuncu Adı:</p>
        <input id="playerNameInput" maxlength="20" autofocus>
        <button class="btn" id="startBtn">Başla</button>
    `;
    document.getElementById('startBtn').onclick = () => {
        const val = document.getElementById('playerNameInput').value.trim();
        if (val.length < 2) return alert('Lütfen adınızı girin!');
        playerName = val;
        savePlayerData();
        showMenu();
    };
}

function showMenu() {
    showScreen('menu');
    renderMenu();
}

function renderMenu() {
    const el = document.getElementById('menuScreen');
    el.innerHTML = `
        <h2>Hoş geldin, <b>${playerName}</b></h2>
        <p>Toplam Puan: <b>${score}</b></p>
        <button class="btn" id="playBtn">Oyuna Başla</button>
    `;
    document.getElementById('playBtn').onclick = () => startGame();
}

function startGame() {
    matchedPairs = 0;
    matchedCards = [];
    showScreen('game');
    renderGame();
}

function renderGame() {
    const el = document.getElementById('gameScreen');
    const pairs = categories[currentCategory];
    
    el.innerHTML = `
        <h2>Seviye ${currentLevel}: Mevsimler</h2>
        <div class="game-container">
            <div class="left-panel">
                <h3>Kelimeler</h3>
                <div id="wordCards" class="card-container"></div>
            </div>
            <div class="right-panel">
                <h3>Görseller</h3>
                <div id="imageCards" class="card-container"></div>
            </div>
        </div>
        <p>Puan: <span id="scoreVal">${score}</span></p>
        <button class="btn" id="backMenuBtn">Ana Menü</button>
    `;
    
    document.getElementById('backMenuBtn').onclick = () => showMenu();
    
    // Sol panel - Kelime kartları
    const wordContainer = document.getElementById('wordCards');
    pairs.forEach((pair, index) => {
        const card = document.createElement('div');
        card.className = 'card word-card';
        card.draggable = true;
        card.dataset.pairId = index;
        card.dataset.type = 'word';
        card.textContent = pair.text;
        card.onclick = () => handleCardClick(card);
        setupDragEvents(card);
        wordContainer.appendChild(card);
    });
    
    // Sağ panel - Görsel kartları (drop zone'lar)
    const imageContainer = document.getElementById('imageCards');
    pairs.forEach((pair, index) => {
        const card = document.createElement('div');
        card.className = 'card image-card drop-zone';
        card.dataset.pairId = index;
        card.dataset.type = 'image';
        card.innerHTML = pair.emoji || `<div style='width:32px;height:32px;border-radius:8px;background:${pair.color}'></div>`;
        card.onclick = () => handleCardClick(card);
        setupDropZone(card);
        imageContainer.appendChild(card);
    });
    
    dropZones = document.querySelectorAll('.drop-zone');
}

function setupDragEvents(card) {
    card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', card.outerHTML);
    });
    
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
    });
}

function setupDropZone(dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (draggedCard && draggedCard.dataset.pairId === dropZone.dataset.pairId) {
            // Doğru eşleşme
            handleCorrectMatch(draggedCard, dropZone);
        } else if (draggedCard) {
            // Yanlış eşleşme
            handleWrongMatch(draggedCard, dropZone);
        }
    });
}

function handleCorrectMatch(wordCard, imageCard) {
    wordCard.classList.add('correct');
    imageCard.classList.add('correct');
    wordCard.draggable = false;
    imageCard.classList.remove('drop-zone');
    
    matchedCards.push(wordCard.dataset.pairId);
    score += 10;
    matchedPairs++;
    updateScore();
    
    // Konfeti efekti
    createConfetti();
    
    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            alert('Tebrikler! Tüm eşleşmeleri buldun!');
            showMenu();
        }, 1000);
    }
}

function handleWrongMatch(wordCard, imageCard) {
    wordCard.classList.add('wrong');
    imageCard.classList.add('wrong');
    
    setTimeout(() => {
        wordCard.classList.remove('wrong');
        imageCard.classList.remove('wrong');
    }, 800);
}

function handleCardClick(card) {
    // Tıklama ile de eşleştirme yapılabilir
    if (card.classList.contains('correct')) return;
    
    if (card.dataset.type === 'word') {
        // Kelime kartına tıklandığında, eşleşen görsel kartını bul
        const targetCard = document.querySelector(`.image-card[data-pair-id="${card.dataset.pairId}"]`);
        if (targetCard && !targetCard.classList.contains('correct')) {
            handleCorrectMatch(card, targetCard);
        }
    } else if (card.dataset.type === 'image') {
        // Görsel kartına tıklandığında, eşleşen kelime kartını bul
        const targetCard = document.querySelector(`.word-card[data-pair-id="${card.dataset.pairId}"]`);
        if (targetCard && !targetCard.classList.contains('correct')) {
            handleCorrectMatch(targetCard, card);
        }
    }
}

function createConfetti() {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function updateScore() {
    const el = document.getElementById('scoreVal');
    if (el) el.textContent = score;
    savePlayerData();
}

function savePlayerData() {
    localStorage.setItem('mevsimgeym_player', JSON.stringify({ playerName, score }));
}

function loadPlayerData() {
    const d = localStorage.getItem('mevsimgeym_player');
    if (d) {
        const obj = JSON.parse(d);
        playerName = obj.playerName || '';
        score = obj.score || 0;
    }
}

// --- Oyun Başlatıcı ---
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    renderLogin();
    showScreen('login');
}); 