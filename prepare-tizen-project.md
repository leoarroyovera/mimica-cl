# Script de Preparación para Proyecto Tizen

Este documento lista los pasos exactos para preparar tu proyecto para Tizen.

## Archivos a Copiar

Cuando crees el proyecto en Tizen Studio, copia estos archivos:

### Desde este proyecto → Al proyecto Tizen

```
frame-mimica/
├── index.html          → MimicaApp/index.html
├── css/                → MimicaApp/css/
├── js/                 → MimicaApp/js/
├── data/               → MimicaApp/data/
├── assets/             → MimicaApp/assets/
└── tizen-config.xml    → MimicaApp/config.xml (renombrar)
```

## Comandos Rápidos (PowerShell)

Si quieres automatizar la copia, usa estos comandos (ajusta las rutas):

```powershell
# Asumiendo que el proyecto Tizen está en C:\TizenProjects\MimicaApp
$tizenPath = "C:\TizenProjects\MimicaApp"
$currentPath = Get-Location

# Copiar archivos
Copy-Item "$currentPath\index.html" "$tizenPath\index.html" -Force
Copy-Item "$currentPath\css" "$tizenPath\" -Recurse -Force
Copy-Item "$currentPath\js" "$tizenPath\" -Recurse -Force
Copy-Item "$currentPath\data" "$tizenPath\" -Recurse -Force
Copy-Item "$currentPath\assets" "$tizenPath\" -Recurse -Force
Copy-Item "$currentPath\tizen-config.xml" "$tizenPath\config.xml" -Force

Write-Host "Archivos copiados exitosamente!"
```

## Crear Icono

1. Abre `create-icons.html` en tu navegador
2. Genera un icono de 192x192
3. Redimensiona a 117x117 usando un editor de imágenes
4. Guarda como `icon.png` en la raíz del proyecto Tizen

O usa este código para crear un icono básico:

```html
<!-- Abre en navegador y descarga -->
<canvas id="canvas" width="117" height="117"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#2d5aa0';
ctx.fillRect(0, 0, 117, 117);
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 5;
ctx.strokeRect(10, 10, 97, 97);
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('M', 58.5, 58.5);
canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon.png';
    a.click();
});
</script>
```

## Verificación

Después de copiar, verifica que el proyecto Tizen tenga:

- ✅ `config.xml` (renombrado desde tizen-config.xml)
- ✅ `icon.png` (117x117px)
- ✅ `index.html`
- ✅ Carpeta `css/` con `styles.css`
- ✅ Carpeta `js/` con todos los archivos JS
- ✅ Carpeta `data/` con `words.json`
- ✅ Carpeta `assets/images/`

## Siguiente Paso

Una vez copiados los archivos, sigue las instrucciones en `README-TIZEN.md` para:
1. Configurar el Samsung Frame
2. Conectar Tizen Studio
3. Instalar la app

