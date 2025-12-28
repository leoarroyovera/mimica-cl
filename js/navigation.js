// Sistema de navegación con teclado/control remoto

class NavigationManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.init();
    }

    init() {
        // Event listeners para teclado y control remoto
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Soporte para eventos de TV/control remoto
        window.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        
        // Auto-focus al cargar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.focusFirst(), 100);
            });
        } else {
            setTimeout(() => this.focusFirst(), 100);
        }
        
        // Actualizar elementos enfocables cuando cambia la pantalla
        this.updateFocusableElements();
        
        // Observar cambios en el DOM para actualizar elementos enfocables
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Actualiza la lista de elementos enfocables en la pantalla actual
     */
    updateFocusableElements() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        // Obtener todos los elementos enfocables
        this.focusableElements = Array.from(
            activeScreen.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
        ).filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   !el.disabled &&
                   el.offsetParent !== null;
        });

        // Ordenar por tabindex
        this.focusableElements.sort((a, b) => {
            const aIndex = parseInt(a.getAttribute('tabindex') || '999');
            const bIndex = parseInt(b.getAttribute('tabindex') || '999');
            return aIndex - bIndex;
        });

        // Si no hay elementos enfocables, resetear índice
        if (this.focusableElements.length === 0) {
            this.currentFocusIndex = 0;
            return;
        }

        // Asegurar que el índice esté dentro del rango
        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        }
    }

    /**
     * Maneja las pulsaciones de teclas
     */
    handleKeyPress(event) {
        const { key, code, keyCode } = event;
        
        // Mapear códigos de teclas comunes de control remoto
        const keyMap = {
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight',
            'Enter': 'Enter',
            ' ': 'Enter',
            'OK': 'Enter',
            'Select': 'Enter'
        };

        // Detectar códigos de teclas de control remoto (códigos numéricos comunes)
        let mappedKey = keyMap[key] || key;
        
        // Si es un código de tecla numérico, mapearlo
        if (keyCode === 13 || keyCode === 32) {
            mappedKey = 'Enter';
        } else if (keyCode >= 37 && keyCode <= 40) {
            const arrowMap = { 37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown' };
            mappedKey = arrowMap[keyCode];
        }

        // Flechas direccionales
        if (mappedKey === 'ArrowUp' || mappedKey === 'ArrowDown' || 
            mappedKey === 'ArrowLeft' || mappedKey === 'ArrowRight') {
            event.preventDefault();
            event.stopPropagation();
            this.navigateWithArrows(mappedKey);
            return false;
        }
        // Enter o Espacio para activar
        else if (mappedKey === 'Enter') {
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'BUTTON' || focused.hasAttribute('tabindex'))) {
                event.preventDefault();
                event.stopPropagation();
                // Pequeño delay para feedback visual
                setTimeout(() => {
                    focused.click();
                }, 50);
                return false;
            }
        }
        
        return true;
    }

    handleKeyUp(event) {
        // Prevenir comportamiento por defecto en keyup también
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
        }
    }

    /**
     * Navega con flechas direccionales
     */
    navigateWithArrows(direction) {
        if (this.focusableElements.length === 0) {
            this.updateFocusableElements();
            if (this.focusableElements.length === 0) return;
        }

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
            
            // Scroll al elemento si es necesario
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Enfocar el elemento
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
            this.updateFocusableElements();
            const index = this.focusableElements.indexOf(element);
            if (index !== -1) {
                this.setFocus(index);
            } else {
                element.focus();
            }
        }
    }
}

// Instancia global del gestor de navegación
const navigationManager = new NavigationManager();

