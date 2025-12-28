// Lógica principal de la aplicación

// Estado de la aplicación
const AppState = {
    MENU: 'menu',
    TURN_START: 'turn_start',
    GAME: 'game',
    TURN_END: 'turn_end',
    WINNER: 'winner'
};

let currentState = AppState.MENU;
let currentConfig = {};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Error registrando Service Worker:', err));
    }

    initMenu();
    initEventListeners();
});

/**
 * Inicializa el menú de configuración
 */
function initMenu() {
    // Configuración por defecto
    currentConfig = {
        teams: 2,
        time: 30,
        rounds: 10,
        wordsMode: 'single',
        starsMode: 'no'
    };

    // Seleccionar opciones por defecto
    updateMenuSelection('teams', '2');
    updateMenuSelection('time', '30');
    updateMenuSelection('rounds', '10');
    updateMenuSelection('words-mode', 'single');
    updateMenuSelection('stars-mode', 'no');
}

/**
 * Inicializa los event listeners
 */
function initEventListeners() {
    // Botones de opciones del menú
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const option = btn.dataset.option;
            const value = btn.dataset.value;
            currentConfig[option] = value;
            updateMenuSelection(option, value);
        });
    });

    // Botón comenzar juego
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    // Botón comenzar turno
    document.getElementById('begin-turn-btn').addEventListener('click', beginTurn);

    // Botones de juego
    document.getElementById('next-word-btn').addEventListener('click', handleNextWord);
    document.getElementById('prev-word-btn').addEventListener('click', handlePreviousWord);

    // Botón continuar después del turno
    document.getElementById('continue-btn').addEventListener('click', continueToNextTurn);

    // Botón jugar otra vez
    document.getElementById('play-again-btn').addEventListener('click', playAgain);
}

/**
 * Actualiza la selección visual en el menú
 */
function updateMenuSelection(option, value) {
    document.querySelectorAll(`[data-option="${option}"]`).forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        }
    });
}

/**
 * Inicia el juego
 */
async function startGame() {
    // Preparar configuración
    const config = {
        teams: parseInt(currentConfig.teams),
        timePerTurn: parseInt(currentConfig.time),
        rounds: parseInt(currentConfig.rounds),
        wordsMode: currentConfig['words-mode'],
        starsMode: currentConfig['stars-mode']
    };

    // Inicializar juego
    await gameManager.init(config);
    
    // Cambiar a pantalla de inicio de turno
    showScreen(AppState.TURN_START);
    showTurnStart();
}

/**
 * Muestra la pantalla de inicio de turno
 */
function showTurnStart() {
    const turnData = gameManager.startTurn();
    if (!turnData) {
        console.error('Error iniciando turno');
        return;
    }

    const { team, category } = turnData;
    
    // Mostrar información del turno
    const teamNameEl = document.getElementById('team-turn-name');
    teamNameEl.textContent = `Comienza Equipo ${team.name}`;
    teamNameEl.className = `team-name ${team.class}`;
    
    document.getElementById('turn-category').textContent = `Categoría: ${category}`;
    
    // Enfocar botón comenzar
    navigationManager.focusElement('begin-turn-btn');
}

/**
 * Comienza el turno (muestra la pantalla de juego)
 */
function beginTurn() {
    showScreen(AppState.GAME);
    
    // Iniciar temporizador solo al comenzar el turno
    gameManager.startTimer((timeRemaining) => {
        updateTimer(timeRemaining);
        if (timeRemaining <= 0) {
            endTurn();
        }
    });
    
    showGameScreen();
}

/**
 * Muestra la pantalla de juego
 */
function showGameScreen() {
    const word = gameManager.getCurrentWord();
    if (!word) {
        console.error('No hay palabra actual');
        return;
    }

    const category = gameManager.currentCategory.nombre;
    const isMultipleWords = gameManager.config.wordsMode === 'multiple';
    const canGoBack = gameManager.currentWordIndex > 0;

    // Mostrar número de turno
    const currentTurn = gameManager.getCurrentTurnNumber();
    document.getElementById('turn-number').textContent = `Turno ${currentTurn}`;

    // Mostrar palabra
    document.getElementById('word-text').textContent = word;
    document.getElementById('category-text').textContent = category;

    // Mostrar/ocultar imagen
    const imageContainer = document.getElementById('word-image-container');
    const imageEl = document.getElementById('word-image');
    const imagePath = getImagePath(word);
    
    imageEl.src = imagePath;
    imageEl.alt = word;
    imageContainer.style.display = 'block';
    imageEl.style.display = 'block';
    
    // Manejar error de carga de imagen
    imageEl.onerror = function() {
        this.style.display = 'none';
        this.parentElement.style.display = 'none';
    };

    // Mostrar/ocultar botón anterior
    const prevBtn = document.getElementById('prev-word-btn');
    if (isMultipleWords && canGoBack) {
        prevBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
    }

    // Enfocar botón siguiente
    navigationManager.focusElement('next-word-btn');
}

/**
 * Actualiza el temporizador en pantalla
 */
function updateTimer(seconds) {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = formatTime(seconds);
    
    // Cambiar color cuando queda poco tiempo
    if (seconds <= 10) {
        timerEl.style.color = 'var(--danger-color)';
        timerEl.style.borderColor = 'var(--danger-color)';
    } else if (seconds <= 20) {
        timerEl.style.color = 'var(--warning-color)';
        timerEl.style.borderColor = 'var(--warning-color)';
    } else {
        timerEl.style.color = 'var(--warning-color)';
        timerEl.style.borderColor = 'var(--warning-color)';
    }
}

/**
 * Maneja el botón siguiente palabra
 */
function handleNextWord() {
    const hasMore = gameManager.nextWord();
    if (hasMore) {
        showGameScreen();
    } else {
        // No hay más palabras, finalizar turno
        endTurn();
    }
}

/**
 * Maneja el botón palabra anterior
 */
function handlePreviousWord() {
    gameManager.previousWord();
    showGameScreen();
}

/**
 * Finaliza el turno
 */
function endTurn() {
    gameManager.stopTimer();
    
    const turnResult = gameManager.endTurn();
    
    // Mostrar resultados del turno
    document.getElementById('turn-points').textContent = turnResult.turnPoints;
    
    // Calcular y mostrar turnos restantes
    const remainingTurns = gameManager.getRemainingTurns();
    const totalTurns = gameManager.getTotalTurns();
    const turnsRemainingEl = document.getElementById('turns-remaining');
    
    // Calcular tamaño dinámico: más grande cuando está cerca del final
    // El tamaño base es 2rem, y aumenta hasta 5rem cuando quedan 5 o menos turnos
    let fontSize = 2;
    if (remainingTurns <= 5) {
        fontSize = 2 + (6 - remainingTurns) * 0.6; // De 2rem a 5rem
    } else if (remainingTurns <= 10) {
        fontSize = 2 + (11 - remainingTurns) * 0.2; // De 2rem a 4rem
    }
    
    turnsRemainingEl.innerHTML = `
        <div class="turns-remaining-label">Turnos Restantes</div>
        <div class="turns-remaining-number" style="font-size: ${fontSize}rem;">${remainingTurns}</div>
    `;
    
    // Mostrar marcador
    const scoreboardEl = document.getElementById('scoreboard-teams');
    scoreboardEl.innerHTML = '';
    
    turnResult.teams.forEach(team => {
        const teamItem = document.createElement('div');
        teamItem.className = `team-score-item ${team.class}`;
        teamItem.innerHTML = `
            <span class="team-score-name">Equipo ${team.name}</span>
            <span class="team-score-points">${team.points}</span>
        `;
        scoreboardEl.appendChild(teamItem);
    });

    showScreen(AppState.TURN_END);
    navigationManager.focusElement('continue-btn');
}

/**
 * Continúa al siguiente turno
 */
function continueToNextTurn() {
    const nextTurnResult = gameManager.nextTurn();
    
    if (nextTurnResult.isGameOver) {
        // Mostrar pantalla de ganador
        showWinnerScreen();
    } else {
        // Mostrar siguiente turno
        showScreen(AppState.TURN_START);
        showTurnStart();
    }
}

/**
 * Muestra la pantalla de ganador
 */
function showWinnerScreen() {
    const winner = gameManager.getWinner();
    
    const winnerEl = document.getElementById('winner-team');
    if (Array.isArray(winner)) {
        // Empate
        winnerEl.innerHTML = '¡Empate!<br>' + winner.map(t => 
            `<div class="${t.class}">Equipo ${t.name} - ${t.points} puntos</div>`
        ).join('<br>');
        winnerEl.className = 'winner-team';
    } else {
        winnerEl.textContent = `Equipo ${winner.name}`;
        winnerEl.className = `winner-team ${winner.class}`;
    }

    showScreen(AppState.WINNER);
    navigationManager.focusElement('play-again-btn');
}

/**
 * Reinicia el juego
 */
function playAgain() {
    gameManager.reset();
    showScreen(AppState.MENU);
    initMenu();
    navigationManager.focusFirst();
}

/**
 * Cambia la pantalla visible
 */
function showScreen(state) {
    currentState = state;
    
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla correspondiente
    const screenMap = {
        [AppState.MENU]: 'menu-screen',
        [AppState.TURN_START]: 'turn-start-screen',
        [AppState.GAME]: 'game-screen',
        [AppState.TURN_END]: 'turn-end-screen',
        [AppState.WINNER]: 'winner-screen'
    };
    
    const screenId = screenMap[state];
    if (screenId) {
        document.getElementById(screenId).classList.add('active');
        // Actualizar elementos enfocables y enfocar el primero
        setTimeout(() => {
            navigationManager.updateFocusableElements();
            navigationManager.focusFirst();
        }, 150);
    }
}

