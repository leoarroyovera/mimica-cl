# Cómo ejecutar el servidor local

Para evitar errores de CORS, necesitas ejecutar la aplicación desde un servidor HTTP local en lugar de abrir el archivo HTML directamente.

## Opción 1: Usar Python (Recomendado - más simple)

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   python server.py
   ```
3. Abre tu navegador en: `http://localhost:8000`

**Nota:** Si tienes Python 3, usa `python3` en lugar de `python`

## Opción 2: Usar Node.js

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   node server.js
   ```
3. Abre tu navegador en: `http://localhost:8000`

## Opción 3: Usar el script de Windows

1. Haz doble clic en `start-server.bat`
2. El script detectará automáticamente si tienes Python o Node.js instalado
3. Abre tu navegador en: `http://localhost:8000`

## Opción 4: Usar http-server (Node.js)

Si tienes Node.js instalado:

1. Instala http-server globalmente:
   ```bash
   npm install -g http-server
   ```

2. En la carpeta del proyecto, ejecuta:
   ```bash
   http-server -p 8000 -c-1
   ```

3. Abre tu navegador en: `http://localhost:8000`

## Opción 5: Usar Live Server (VS Code)

Si usas Visual Studio Code:

1. Instala la extensión "Live Server"
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## Opción 6: Usar Python simple (una línea)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego abre: `http://localhost:8000`

## Verificar que funciona

Una vez que el servidor esté corriendo, deberías ver en la consola del navegador:
- "Palabras cargadas: X categorías" (sin errores de CORS)
- Todas las categorías disponibles en el juego

## Detener el servidor

Presiona `Ctrl+C` en la terminal donde está corriendo el servidor.

