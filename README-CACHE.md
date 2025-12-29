# Solución de Problemas de Caché

## Problema: Se carga una versión antigua

Si siempre se carga una versión antigua de la aplicación, sigue estos pasos:

## Solución Rápida

### En el Navegador del Samsung Frame:

1. **Forzar recarga**:
   - Presiona `Ctrl + Shift + R` (si tienes teclado)
   - O cierra y vuelve a abrir el navegador

2. **Limpiar caché manualmente**:
   - Ve a Configuración del navegador
   - Busca "Limpiar datos de navegación" o "Borrar caché"
   - Selecciona "Caché" y "Datos de sitios"
   - Confirma la limpieza

## Cambios Implementados

### Service Worker Mejorado

El Service Worker ahora usa una estrategia **Network First**:
- ✅ Prioriza la red sobre el caché
- ✅ Actualiza automáticamente cuando hay cambios
- ✅ Elimina cachés antiguos automáticamente
- ✅ Detecta nuevas versiones y recarga automáticamente

### Actualización Automática

La aplicación ahora:
- Verifica actualizaciones cada minuto
- Recarga automáticamente cuando detecta una nueva versión
- Fuerza la actualización del Service Worker

## Si el Problema Persiste

### Opción 1: Actualizar Versión del Caché

Si haces cambios importantes y quieres forzar actualización:

1. Edita `sw.js`
2. Cambia `CACHE_VERSION` a un nuevo número:
   ```javascript
   const CACHE_VERSION = 'v3'; // Incrementar el número
   ```
3. Haz commit y push

### Opción 2: Desactivar Service Worker Temporalmente

Si necesitas desactivar el Service Worker:

1. En el navegador, abre las herramientas de desarrollador
2. Ve a "Application" → "Service Workers"
3. Haz clic en "Unregister" en el Service Worker activo

### Opción 3: Modo Incógnito/Privado

Prueba la aplicación en modo incógnito para verificar que funciona sin caché.

## Prevención Futura

Para evitar problemas de caché en el futuro:

1. **Incrementa CACHE_VERSION** en `sw.js` cuando hagas cambios importantes
2. **Usa meta tags** (ya agregados) para evitar caché del navegador
3. **La estrategia Network First** asegura que siempre se intente cargar desde la red primero

## Nota Técnica

El Service Worker ahora:
- Usa `skipWaiting()` para activarse inmediatamente
- Usa `clients.claim()` para tomar control de todas las páginas
- Prioriza la red sobre el caché (Network First)
- Actualiza el caché en segundo plano mientras sirve desde la red

Esto asegura que siempre se obtenga la versión más reciente cuando hay conexión a internet.

