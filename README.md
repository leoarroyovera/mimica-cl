# Aplicación de Mímica PWA

Aplicación web progresiva (PWA) para jugar a la mímica en Samsung Frame y Firestick 4K.

## Características

- Compatible con navegadores web de Samsung Frame (Tizen) y Firestick 4K
- Navegación optimizada para control remoto
- Configuración personalizable de equipos, tiempo, rondas y modos de juego
- Modo estrellas con categorías especiales
- Diseño optimizado para TV (1920x1080)

## Estructura del Proyecto

```
frame-mimica/
├── index.html              # Punto de entrada principal
├── manifest.json           # Manifest PWA
├── sw.js                   # Service Worker para PWA
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── app.js              # Lógica principal de la aplicación
│   ├── game.js             # Lógica del juego
│   ├── navigation.js       # Sistema de navegación con teclado/control remoto
│   └── utils.js            # Utilidades
├── data/
│   └── words.json          # Base de datos de palabras por categoría
└── assets/
    └── images/             # Imágenes para las palabras (200x200px)
```

## Configuración

### Equipos
- Selecciona entre 2 y 4 equipos
- Cada equipo tiene un color y nombre representativo:
  - Rojo → "Equipo Manzana"
  - Azul → "Equipo Arándano"
  - Amarillo → "Equipo Plátano"
  - Verde → "Equipo Limón"

### Tiempo por Turno
- Opciones: 15, 30, 45 o 60 segundos

### Rondas
- Opciones: 10, 20 o 30 rondas

### Modo de Palabras
- **Una palabra**: Solo una palabra por turno
- **Múltiples palabras**: Varias palabras por turno (botón "Siguiente" disponible)

### Modo Estrellas
- **NO**: No se incluyen categorías de estrellas
- **A**: Se incluye la categoría "Estrellas Grupo A"
- **B**: Se incluyen las categorías "Estrellas Grupo A" y "Estrellas Grupo B"

## Imágenes

Las imágenes deben tener el mismo nombre que la palabra con extensión `.png` (con transparencia) y ubicarse en `assets/images/`.

Ejemplo:
- Palabra: "perro" → Imagen: `assets/images/perro.png`
- Palabra: "gato" → Imagen: `assets/images/gato.png`

Si una imagen no se encuentra, la aplicación mostrará solo la palabra y la categoría.

## Despliegue en GitHub Pages

1. Sube todos los archivos a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama principal y la carpeta raíz
4. La aplicación estará disponible en `https://tu-usuario.github.io/frame-mimica/`

## Navegación

La aplicación está optimizada para control remoto:
- **Flechas direccionales**: Navegar entre opciones
- **Enter/Espacio**: Seleccionar/Activar
- **Tab**: Navegación secuencial

## Licencia

Uso personal

