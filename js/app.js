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

// Función para entrar en fullscreen
function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log('Error al entrar en fullscreen:', err);
        });
    } else if (elem.webkitRequestFullscreen) { // Safari/WebKit
        elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    } else if (elem.webkitEnterFullscreen) { // iOS Safari
        elem.webkitEnterFullscreen();
    }
}

// Función para salir de fullscreen
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Verificar si está en fullscreen
function isFullscreen() {
    return !!(document.fullscreenElement || 
              document.webkitFullscreenElement || 
              document.mozFullScreenElement || 
              document.msFullscreenElement);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Registrar Service Worker con estrategia de actualización
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker registrado');
                
                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    reg.update();
                }, 60000); // Cada minuto
                
                // Escuchar actualizaciones del Service Worker
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Hay una nueva versión disponible
                            console.log('Nueva versión disponible, recargando...');
                            // Forzar recarga después de un breve delay
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    });
                });
            })
            .catch(err => console.log('Error registrando Service Worker:', err));
        
        // Forzar actualización al cargar
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    initMenu();
    initEventListeners();
    
    // Intentar entrar en fullscreen al cargar
    setTimeout(() => {
        if (!isFullscreen()) {
            requestFullscreen();
        }
    }, 500);
    
    // Intentar fullscreen cuando el usuario interactúe (algunos navegadores requieren interacción)
    const tryFullscreenOnInteraction = () => {
        if (!isFullscreen()) {
            requestFullscreen();
        }
    };
    
    // Intentar en el primer clic
    document.addEventListener('click', tryFullscreenOnInteraction, { once: true });
    
    // Intentar en el primer uso del teclado/control remoto
    document.addEventListener('keydown', tryFullscreenOnInteraction, { once: true });
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
        wordsMode: 'single'
    };

    // Seleccionar opciones por defecto
    updateMenuSelection('teams', '2');
    updateMenuSelection('time', '30');
    updateMenuSelection('rounds', '10');
    updateMenuSelection('words-mode', 'single');
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
        wordsMode: currentConfig['words-mode']
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
    
    // Cambiar fondo según el equipo
    changeBackgroundColor(team.bgColor);
    
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
    // Obtener el equipo actual para mantener el color de fondo
    const teamIndex = gameManager.teamOrder[gameManager.currentTeamIndex % gameManager.teamOrder.length];
    const team = gameManager.teams[teamIndex];
    
    // Mantener el color de fondo del equipo
    changeBackgroundColor(team.bgColor);
    
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

    // Mostrar número de ronda en formato X/Total
    const currentRound = gameManager.currentRound + 1;
    const totalRounds = gameManager.config.rounds;
    document.getElementById('round-number').textContent = `Ronda ${currentRound}/${totalRounds}`;

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
    
    // Restaurar fondo por defecto
    resetBackgroundColor();
    
    const turnResult = gameManager.endTurn();
    
    // Obtener el equipo que ganó puntos en este turno (desde el resultado)
    const scoringTeamIndex = turnResult.scoringTeamIndex;
    const scoringTeam = gameManager.teams[scoringTeamIndex];
    
    // Debug: verificar valores
    console.log(`[DEBUG] scoringTeamIndex=${scoringTeamIndex}, turnPoints=${turnResult.turnPoints}`);
    console.log(`[DEBUG] scoringTeam name=${scoringTeam.name}, color=${scoringTeam.color}`);
    
    // Mostrar marcador con animación
    const scoreboardEl = document.getElementById('scoreboard-teams');
    scoreboardEl.innerHTML = '';
    
    turnResult.teams.forEach((team, index) => {
        const teamItem = document.createElement('div');
        teamItem.className = `team-score-item ${team.class}`;
        
        // Si es el equipo que ganó puntos, mostrar badge animado
        // Comparar por índice del equipo en el array teams
        const isScoringTeam = (index === scoringTeamIndex) && (turnResult.turnPoints > 0);
        console.log(`[DEBUG] Team ${index} (${team.name}): isScoringTeam=${isScoringTeam}, index=${index}, scoringTeamIndex=${scoringTeamIndex}, turnPoints=${turnResult.turnPoints}`);
        
        if (isScoringTeam) {
            teamItem.innerHTML = `
                <div class="team-score-left">
                    <span class="team-score-name">Equipo ${team.name}</span>
                    <span class="points-badge">+${turnResult.turnPoints}</span>
                </div>
                <span class="team-score-points">${team.points}</span>
            `;
            teamItem.classList.add('scoring-team');
            console.log(`[DEBUG] Badge creado para equipo ${team.name} con +${turnResult.turnPoints}`);
        } else {
            teamItem.innerHTML = `
                <div class="team-score-left">
                    <span class="team-score-name">Equipo ${team.name}</span>
                </div>
                <span class="team-score-points">${team.points}</span>
            `;
        }
        
        scoreboardEl.appendChild(teamItem);
        
        // Forzar reflow para activar la animación del badge
        if (isScoringTeam) {
            // Pequeño delay para asegurar que el DOM se actualice
            requestAnimationFrame(() => {
                const badge = teamItem.querySelector('.points-badge');
                console.log(`[DEBUG] Badge encontrado:`, badge);
                if (badge) {
                    console.log(`[DEBUG] Badge encontrado, forzando animación`);
                    // Asegurar que el badge sea visible antes de animar
                    badge.style.opacity = '1';
                    badge.style.transform = 'translateY(0) scale(1) rotate(0deg)';
                    // Forzar reflow
                    void badge.offsetWidth;
                    // Reiniciar animación
                    badge.style.animation = 'none';
                    requestAnimationFrame(() => {
                        badge.style.animation = '';
                        console.log(`[DEBUG] Animación reiniciada`);
                    });
                } else {
                    console.error(`[DEBUG] ERROR: Badge no encontrado en el DOM!`);
                }
            });
        }
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
        // Fondo por defecto para empate
        resetBackgroundColor();
    } else {
        winnerEl.textContent = `Equipo ${winner.name}`;
        winnerEl.className = `winner-team ${winner.class}`;
        // Fondo del equipo ganador
        changeBackgroundColor(winner.bgColor);
    }

    showScreen(AppState.WINNER);
    navigationManager.focusElement('play-again-btn');
}

/**
 * Cambia el color de fondo según el equipo
 */
function changeBackgroundColor(color) {
    document.body.style.background = color;
    document.body.style.backgroundImage = 'none';
}

/**
 * Restaura el fondo por defecto
 */
function resetBackgroundColor() {
    document.body.style.background = '';
    document.body.style.backgroundImage = '';
}

/**
 * Reinicia el juego
 */
function playAgain() {
    // Restaurar fondo por defecto
    resetBackgroundColor();
    
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

