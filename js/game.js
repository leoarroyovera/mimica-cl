// Lógica del juego

class GameManager {
    constructor() {
        this.config = {
            teams: 2,
            timePerTurn: 30,
            rounds: 10,
            wordsMode: 'multiple' // 'single' o 'multiple'
        };
        
        this.teams = [];
        this.currentRound = 0;
        this.currentTeamIndex = 0;
        this.currentCategory = null;
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.turnPoints = 0;
        this.timer = null;
        this.timeRemaining = 0;
        this.wordsData = null;
        this.teamOrder = [];
    }

    /**
     * Inicializa el juego con la configuración
     */
    async init(config) {
        this.config = { ...this.config, ...config };
        
        // Cargar datos de palabras
        try {
            const response = await fetch('data/words.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.wordsData = await response.json();
            console.log('Palabras cargadas:', this.wordsData.categorias.length, 'categorías');
        } catch (error) {
            console.error('Error cargando palabras:', error);
            // Datos por defecto si falla la carga
            this.wordsData = {
                categorias: [
                    { nombre: "Animales", palabras: ["perro", "gato", "elefante"] },
                    { nombre: "Objetos", palabras: ["mesa", "silla", "ventana"] }
                ]
            };
        }

        // Crear equipos
        this.createTeams();
        
        // Mezclar orden de equipos
        this.teamOrder = shuffleArray([...Array(this.teams.length).keys()]);
        this.currentTeamIndex = 0;
        this.currentRound = 0;
    }

    /**
     * Crea los equipos según la configuración
     */
    createTeams() {
        const teamConfigs = [
            { color: 'red', name: 'Rojo', class: 'team-red', bgColor: '#e74c3c' },
            { color: 'blue', name: 'Azul', class: 'team-blue', bgColor: '#3498db' },
            { color: 'yellow', name: 'Amarillo', class: 'team-yellow', bgColor: '#f1c40f' },
            { color: 'green', name: 'Verde', class: 'team-green', bgColor: '#2ecc71' }
        ];

        this.teams = [];
        for (let i = 0; i < this.config.teams; i++) {
            this.teams.push({
                ...teamConfigs[i],
                points: 0
            });
        }
    }

    /**
     * Obtiene las categorías disponibles
     */
    getAvailableCategories() {
        if (!this.wordsData || !this.wordsData.categorias) {
            console.error('No hay datos de palabras cargados');
            return [];
        }

        // Excluir categorías de estrellas
        const categories = this.wordsData.categorias.filter(cat => 
            !cat.nombre.includes('Estrellas')
        );
        
        console.log('Total de categorías disponibles:', categories.length);
        return categories;
    }

    /**
     * Inicia un nuevo turno
     */
    startTurn() {
        // Seleccionar equipo aleatorio del orden mezclado
        const teamIndex = this.teamOrder[this.currentTeamIndex % this.teamOrder.length];
        const team = this.teams[teamIndex];

        // Seleccionar categoría aleatoria
        const availableCategories = this.getAvailableCategories();
        if (availableCategories.length === 0) {
            console.error('No hay categorías disponibles');
            return null;
        }
        
        this.currentCategory = getRandomElement(availableCategories);
        
        // Seleccionar palabras
        if (this.config.wordsMode === 'multiple') {
            // En modo múltiples palabras, empezamos con una palabra aleatoria
            // y seguiremos agregando más cuando se presione "Siguiente"
            this.currentWords = [getRandomElement(this.currentCategory.palabras)];
            this.usedWords = new Set([this.currentWords[0]]); // Rastrear palabras usadas
        } else {
            // Una sola palabra
            this.currentWords = [getRandomElement(this.currentCategory.palabras)];
            this.usedWords = null;
        }

        this.currentWordIndex = 0;
        this.turnPoints = 0;
        this.timeRemaining = this.config.timePerTurn;

        return {
            team,
            category: this.currentCategory.nombre,
            words: this.currentWords
        };
    }

    /**
     * Obtiene la palabra actual
     */
    getCurrentWord() {
        if (this.currentWordIndex >= 0 && this.currentWordIndex < this.currentWords.length) {
            return this.currentWords[this.currentWordIndex];
        }
        return null;
    }

    /**
     * Avanza a la siguiente palabra y suma un punto
     */
    nextWord() {
        // Si es modo múltiples palabras, seleccionar nueva palabra aleatoria
        if (this.config.wordsMode === 'multiple') {
            // Obtener palabras disponibles (que no se hayan usado)
            const availableWords = this.currentCategory.palabras.filter(
                word => !this.usedWords.has(word)
            );
            
            // Si no hay más palabras disponibles, usar todas de nuevo
            if (availableWords.length === 0) {
                this.usedWords.clear();
                availableWords.push(...this.currentCategory.palabras);
            }
            
            // Seleccionar nueva palabra aleatoria
            const newWord = getRandomElement(availableWords);
            this.usedWords.add(newWord);
            this.currentWords.push(newWord);
            this.currentWordIndex++;
            this.turnPoints++;
            return true;
        } else {
            // Modo una palabra: marcar que se adivinó (se suma 1 punto al final del turno)
            // No sumar aquí, solo marcar que se adivinó
            this.turnPoints = 1; // Marcar que adivinaron la palabra
            return false;
        }
    }

    /**
     * Retrocede a la palabra anterior y resta un punto
     */
    previousWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.turnPoints = Math.max(0, this.turnPoints - 1);
            return true;
        }
        return false;
    }

    /**
     * Inicia el temporizador del turno
     */
    startTimer(callback) {
        this.stopTimer();
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            if (callback) {
                callback(this.timeRemaining);
            }
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                if (callback) {
                    callback(0);
                }
            }
        }, 1000);
    }

    /**
     * Detiene el temporizador
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Finaliza el turno y actualiza puntos
     */
    endTurn() {
        this.stopTimer();
        
        // Actualizar puntos del equipo actual
        const teamIndex = this.teamOrder[this.currentTeamIndex % this.teamOrder.length];
        
        // Guardar los puntos ganados en este turno antes de resetear
        const pointsEarned = this.turnPoints;
        
        // Sumar puntos al equipo
        this.teams[teamIndex].points += pointsEarned;

        return {
            turnPoints: pointsEarned,
            teams: [...this.teams],
            scoringTeamIndex: teamIndex  // Retornar el índice del equipo que ganó puntos
        };
    }

    /**
     * Avanza al siguiente turno
     */
    nextTurn() {
        this.currentTeamIndex++;
        
        // Si se completaron todos los equipos, avanzar ronda
        if (this.currentTeamIndex >= this.teamOrder.length) {
            this.currentRound++;
            this.currentTeamIndex = 0;
            // Mezclar orden de equipos para la nueva ronda
            this.teamOrder = shuffleArray([...Array(this.teams.length).keys()]);
        }

        return {
            round: this.currentRound,
            totalRounds: this.config.rounds,
            isGameOver: this.currentRound >= this.config.rounds
        };
    }

    /**
     * Obtiene el equipo ganador
     */
    getWinner() {
        if (this.teams.length === 0) return null;

        let maxPoints = -1;
        let winners = [];

        this.teams.forEach(team => {
            if (team.points > maxPoints) {
                maxPoints = team.points;
                winners = [team];
            } else if (team.points === maxPoints) {
                winners.push(team);
            }
        });

        // Si hay empate, retornar todos los ganadores
        return winners.length === 1 ? winners[0] : winners;
    }

    /**
     * Obtiene el número de turno actual (1-indexed)
     */
    getCurrentTurnNumber() {
        return (this.currentRound * this.teams.length) + this.currentTeamIndex + 1;
    }

    /**
     * Obtiene el total de turnos del juego
     */
    getTotalTurns() {
        return this.config.rounds * this.teams.length;
    }

    /**
     * Obtiene los turnos restantes
     */
    getRemainingTurns() {
        const totalTurns = this.getTotalTurns();
        const currentTurn = this.getCurrentTurnNumber();
        return Math.max(0, totalTurns - currentTurn);
    }

    /**
     * Reinicia el juego
     */
    reset() {
        this.currentRound = 0;
        this.currentTeamIndex = 0;
        this.teams.forEach(team => team.points = 0);
        this.teamOrder = shuffleArray([...Array(this.teams.length).keys()]);
    }
}

// Instancia global del gestor de juego
const gameManager = new GameManager();

