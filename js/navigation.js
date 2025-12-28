// Sistema de navegación con teclado/control remoto

class NavigationManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.init();
    }

    init() {
        // Event listeners para teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Actualizar elementos enfocables cuando cambia la pantalla
        this.updateFocusableElements();
    }

    /**
     * Actualiza la lista de elementos enfocables en la pantalla actual
     */
    updateFocusableElements() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        // Obtener todos los elementos enfocables (botones, inputs, etc.)
        this.focusableElements = Array.from(
            activeScreen.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
        ).filter(el => {
            // Filtrar elementos ocultos
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        // Ordenar por tabindex
        this.focusableElements.sort((a, b) => {
            const aIndex = parseInt(a.getAttribute('tabindex') || '0');
            const bIndex = parseInt(b.getAttribute('tabindex') || '0');
            return aIndex - bIndex;
        });

        this.currentFocusIndex = 0;
    }

    /**
     * Maneja las pulsaciones de teclas
     */
    handleKeyPress(event) {
        const { key, code } = event;

        // Flechas direccionales
        if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            event.preventDefault();
            this.navigateWithArrows(key);
        }
        // Enter o Espacio para activar
        else if (key === 'Enter' || key === ' ') {
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'BUTTON' || focused.hasAttribute('tabindex'))) {
                event.preventDefault();
                focused.click();
            }
        }
        // Tab para navegación secuencial
        else if (key === 'Tab') {
            // Permitir comportamiento por defecto pero actualizar índice
            setTimeout(() => {
                this.updateCurrentFocusIndex();
            }, 0);
        }
    }

    /**
     * Navega con flechas direccionales
     */
    navigateWithArrows(direction) {
        if (this.focusableElements.length === 0) {
            this.updateFocusableElements();
            return;
        }

        // Determinar dirección de navegación
        let nextIndex = this.currentFocusIndex;
        
        if (direction === 'ArrowDown' || direction === 'ArrowRight') {
            nextIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
        } else if (direction === 'ArrowUp' || direction === 'ArrowLeft') {
            nextIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        }

        this.setFocus(nextIndex);
    }

    /**
     * Establece el foco en un elemento específico
     */
    setFocus(index) {
        if (index >= 0 && index < this.focusableElements.length) {
            this.currentFocusIndex = index;
            const element = this.focusableElements[index];
            element.focus();
        }
    }

    /**
     * Actualiza el índice de foco actual basado en el elemento activo
     */
    updateCurrentFocusIndex() {
        const activeElement = document.activeElement;
        const index = this.focusableElements.indexOf(activeElement);
        if (index !== -1) {
            this.currentFocusIndex = index;
        }
    }

    /**
     * Enfoca el primer elemento de la pantalla actual
     */
    focusFirst() {
        this.updateFocusableElements();
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    }

    /**
     * Enfoca un elemento específico por su ID
     */
    focusElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            this.updateCurrentFocusIndex();
        }
    }
}

// Instancia global del gestor de navegación
const navigationManager = new NavigationManager();

