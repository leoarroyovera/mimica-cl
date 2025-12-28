// Sistema de navegación con teclado/control remoto

class NavigationManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.init();
    }

    init() {
        // Event listeners para teclado y control remoto
        // Usar capture phase para capturar eventos antes de que otros los manejen
        document.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        document.addEventListener('keyup', (e) => this.handleKeyUp(e), true);
        window.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        
        // También escuchar eventos en el body
        document.body.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        
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
     * Maneja las pulsaciones de teclas - Versión mejorada para controles remotos de TV
     */
    handleKeyPress(event) {
        const { key, code, keyCode, which } = event;
        
        // Log para depuración (comentar en producción)
        console.log('Key event:', { key, code, keyCode, which });
        
        // Mapeo completo de códigos de teclas para controles remotos de TV
        let direction = null;
        let shouldActivate = false;
        
        // Detectar flechas direccionales por key
        if (key === 'ArrowUp' || key === 'Up') {
            direction = 'ArrowUp';
        } else if (key === 'ArrowDown' || key === 'Down') {
            direction = 'ArrowDown';
        } else if (key === 'ArrowLeft' || key === 'Left') {
            direction = 'ArrowLeft';
        } else if (key === 'ArrowRight' || key === 'Right') {
            direction = 'ArrowRight';
        }
        // Detectar por keyCode (códigos numéricos)
        else if (keyCode === 38 || which === 38) {
            direction = 'ArrowUp';
        } else if (keyCode === 40 || which === 40) {
            direction = 'ArrowDown';
        } else if (keyCode === 37 || which === 37) {
            direction = 'ArrowLeft';
        } else if (keyCode === 39 || which === 39) {
            direction = 'ArrowRight';
        }
        // Detectar por code (códigos de teclas físicas)
        else if (code === 'ArrowUp' || code === 'KeyW') {
            direction = 'ArrowUp';
        } else if (code === 'ArrowDown' || code === 'KeyS') {
            direction = 'ArrowDown';
        } else if (code === 'ArrowLeft' || code === 'KeyA') {
            direction = 'ArrowLeft';
        } else if (code === 'ArrowRight' || code === 'KeyD') {
            direction = 'ArrowRight';
        }
        // Detectar media keys comunes en controles remotos
        else if (code === 'MediaTrackPrevious' || keyCode === 177) {
            direction = 'ArrowLeft';
        } else if (code === 'MediaTrackNext' || keyCode === 176) {
            direction = 'ArrowRight';
        } else if (code === 'MediaPlayPause' || keyCode === 179) {
            // Play/Pause puede ser Enter
            shouldActivate = true;
        }
        // Detectar Enter/OK
        else if (key === 'Enter' || key === 'OK' || key === 'Select' || 
                 keyCode === 13 || which === 13 || 
                 code === 'Enter' || code === 'NumpadEnter') {
            shouldActivate = true;
        }
        // Detectar Espacio
        else if (key === ' ' || keyCode === 32 || which === 32 || code === 'Space') {
            shouldActivate = true;
        }
        
        // Manejar navegación direccional
        if (direction) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this.navigateWithArrows(direction);
            return false;
        }
        
        // Manejar activación (Enter/OK)
        if (shouldActivate) {
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'BUTTON' || focused.hasAttribute('tabindex'))) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
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
        const { key, keyCode, which } = event;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key) ||
            (keyCode >= 37 && keyCode <= 40) || keyCode === 13 || keyCode === 32 ||
            (which >= 37 && which <= 40) || which === 13 || which === 32) {
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
            
            // Forzar el focus visual
            element.style.outline = '4px solid var(--focus-color)';
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
