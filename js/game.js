// Lógica del juego

class GameManager {
    constructor() {
        this.config = {
            teams: 2,
            timePerTurn: 30,
            rounds: 10,
            wordsMode: 'single', // 'single' o 'multiple'
            starsMode: 'no' // 'no', 'a', 'b'
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
            this.wordsData = await response.json();
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
            { color: 'red', name: 'Manzana', class: 'team-red' },
            { color: 'blue', name: 'Arándano', class: 'team-blue' },
            { color: 'yellow', name: 'Plátano', class: 'team-yellow' },
            { color: 'green', name: 'Limón', class: 'team-green' }
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
     * Obtiene las categorías disponibles según el modo estrellas
     */
    getAvailableCategories() {
        if (!this.wordsData || !this.wordsData.categorias) {
            return [];
        }

        let categories = [...this.wordsData.categorias];

        // Filtrar según modo estrellas
        if (this.config.starsMode === 'no') {
            categories = categories.filter(cat => 
                !cat.nombre.includes('Estrellas')
            );
        } else if (this.config.starsMode === 'a') {
            categories = categories.filter(cat => 
                !cat.nombre.includes('Estrellas Grupo B')
            );
        }
        // Si es modo 'b', incluir todas las categorías

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
            // Seleccionar múltiples palabras aleatorias
            const shuffledWords = shuffleArray([...this.currentCategory.palabras]);
            this.currentWords = shuffledWords.slice(0, Math.min(5, shuffledWords.length));
        } else {
            // Una sola palabra
            this.currentWords = [getRandomElement(this.currentCategory.palabras)];
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
        if (this.currentWordIndex < this.currentWords.length - 1) {
            this.currentWordIndex++;
            this.turnPoints++;
            return true;
        }
        return false;
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
        this.teams[teamIndex].points += this.turnPoints;

        return {
            turnPoints: this.turnPoints,
            teams: [...this.teams]
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

