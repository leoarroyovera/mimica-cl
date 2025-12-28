// Utilidades generales

/**
 * Obtiene un elemento aleatorio de un array
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Mezcla un array aleatoriamente (Fisher-Yates)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Formatea el tiempo en formato MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Normaliza el nombre de una palabra para buscar su imagen
 * (elimina acentos, convierte a minúsculas, reemplaza espacios)
 */
function normalizeWordForImage(word) {
    return word
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
        .replace(/\s+/g, '-') // Reemplaza espacios con guiones
        .replace(/[^a-z0-9-]/g, ''); // Elimina caracteres especiales
}

/**
 * Obtiene la ruta de la imagen para una palabra
 */
function getImagePath(word) {
    const normalized = normalizeWordForImage(word);
    return `assets/images/${normalized}.png`;
}

/**
 * Carga una imagen y retorna una promesa
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
        img.src = src;
    });
}

