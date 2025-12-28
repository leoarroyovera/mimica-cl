# Guía de Migración a App Nativa Tizen para Samsung Frame

Esta guía te ayudará a convertir tu aplicación web en una app nativa Tizen para Samsung Frame.

## 📋 Requisitos Previos

1. **Tizen Studio** - Descargar desde: https://developer.tizen.org/development/tizen-studio/download
2. **Cuenta de Samsung Developer** (gratis) - Registrarse en: https://developer.samsung.com/
3. **Samsung Frame** conectado a la misma red que tu computadora

## 🚀 Paso 1: Instalar Tizen Studio

1. Descarga Tizen Studio para Windows
2. Ejecuta el instalador
3. Durante la instalación, asegúrate de seleccionar:
   - ✅ Tizen Studio Base
   - ✅ TV Extensions (CRÍTICO para Samsung Frame)
   - ✅ TV Emulator (opcional, para pruebas)

## 📦 Paso 2: Crear Proyecto en Tizen Studio

1. Abre Tizen Studio
2. **File → New → Tizen Project**
3. Selecciona:
   - **Template**: "TV Web Application"
   - **Profile**: "TV"
   - **Version**: "6.0" o la más reciente disponible
4. Configura el proyecto:
   - **Project name**: `MimicaApp`
   - **Package ID**: `com.mimica.app` (o el que prefieras)
   - **Display name**: "Mímica"
   - **Location**: Elige una carpeta para el proyecto

## 📁 Paso 3: Copiar Archivos al Proyecto Tizen

Una vez creado el proyecto, copia los siguientes archivos desde este proyecto:

### Estructura del Proyecto Tizen:
```
MimicaApp/
├── .tproject
├── config.xml          ← Reemplazar con tizen-config.xml (renombrar)
├── icon.png            ← Crear icono 117x117px
├── index.html          ← Copiar desde este proyecto
├── css/
│   └── styles.css      ← Copiar desde este proyecto
├── js/
│   ├── app.js          ← Copiar desde este proyecto
│   ├── game.js         ← Copiar desde este proyecto
│   ├── navigation.js   ← Copiar desde este proyecto
│   └── utils.js        ← Copiar desde este proyecto
├── data/
│   └── words.json      ← Copiar desde este proyecto
└── assets/
    └── images/         ← Copiar desde este proyecto
```

### Pasos:
1. **Reemplazar config.xml**:
   - Copia `tizen-config.xml` del proyecto actual
   - Pégalo en el proyecto Tizen como `config.xml`
   - Ajusta el `id` y `package` si es necesario

2. **Copiar archivos HTML/CSS/JS**:
   - Copia `index.html` a la raíz del proyecto Tizen
   - Copia toda la carpeta `css/`
   - Copia toda la carpeta `js/`
   - Copia toda la carpeta `data/`
   - Copia toda la carpeta `assets/`

3. **Crear icono**:
   - Crea un icono PNG de 117x117 píxeles
   - Nómbralo `icon.png`
   - Colócalo en la raíz del proyecto Tizen
   - Puedes usar `create-icons.html` para generar uno básico

## 🔧 Paso 4: Configurar Samsung Frame para Desarrollo

1. En tu **Samsung Frame**:
   - Ve a **Settings → General → External Device Manager → Device Connection Manager**
   - Activa **"Developer Mode"**
   - Anota la **IP address** que aparece (ej: 192.168.1.100)

2. Asegúrate de que el TV y tu PC estén en la **misma red WiFi**

## 🔌 Paso 5: Conectar Tizen Studio con Samsung Frame

1. En **Tizen Studio**:
   - Abre **Connection Explorer** (ventana lateral)
   - Clic derecho → **"Add Device"**
   - Ingresa la **IP address** del TV
   - Presiona **"Add"**

2. En el **Samsung Frame**:
   - Aparecerá un mensaje pidiendo permiso para conectar
   - Acepta la conexión

3. Verifica la conexión:
   - El dispositivo debería aparecer en Connection Explorer
   - Debe mostrar estado "Connected"

## 🎮 Paso 6: Instalar la App en Samsung Frame

1. En **Tizen Studio**:
   - Selecciona tu dispositivo en **Connection Explorer**
   - Clic derecho en tu proyecto → **Run As → Tizen Web Application**
   - O usa el botón **Run** (▶️) en la barra de herramientas

2. La aplicación se:
   - Compilará automáticamente
   - Instalará en el Samsung Frame
   - Ejecutará automáticamente

3. **¡Listo!** La app debería aparecer en pantalla completa con navegación funcional

## 📝 Paso 7: Crear Certificado (Para Instalación Permanente)

Para que la app se instale permanentemente (no solo en modo desarrollo):

1. En **Tizen Studio**:
   - **Tools → Certificate Manager**
   - Clic en **"+"** → **"Create a new certificate"**
   - Selecciona **"Author certificate"**
   - Completa el formulario:
     - **Author name**: Tu nombre
     - **Password**: Crea una contraseña (guárdala)
     - **Validity**: 10 años
   - Clic en **"Next"** y **"Finish"**

2. **Firmar la aplicación**:
   - **Project → Sign Certificate**
   - Selecciona tu certificado de autor
   - Ingresa la contraseña
   - Clic en **"OK"**

3. **Generar paquete firmado**:
   - **Build → Generate Signed Package**
   - Selecciona tu certificado
   - El paquete `.wgt` se generará en la carpeta del proyecto

## 🚀 Paso 8: Instalar Paquete Firmado

1. Copia el archivo `.wgt` generado a una USB
2. Conecta la USB al Samsung Frame
3. En el TV:
   - Ve a **Settings → Smart Hub → Apps**
   - Selecciona **"Install from USB"**
   - Selecciona tu archivo `.wgt`
   - La app se instalará permanentemente

## 🎯 Ventajas de la App Nativa

✅ **Navegación perfecta** con control remoto (rueda direccional funciona nativamente)  
✅ **Pantalla completa** automática sin necesidad de API  
✅ **Mejor rendimiento** que en navegador  
✅ **Instalación permanente** como app independiente  
✅ **Acceso a APIs de Tizen** si las necesitas en el futuro  

## 🐛 Solución de Problemas

### La app no se conecta al TV
- Verifica que ambos estén en la misma red WiFi
- Asegúrate de que Developer Mode esté activado
- Revisa el firewall de Windows

### La app no se instala
- Verifica que el certificado esté creado y firmado
- Asegúrate de que el Package ID sea único
- Revisa los logs en Tizen Studio (Window → Show View → Log)

### El control remoto no funciona
- Verifica que `pointing-device-support="disable"` esté en config.xml
- Asegúrate de que `hwkey-event="enable"` esté configurado
- Revisa que los privilegios de `tv.inputdevice` estén incluidos

### La app no entra en fullscreen
- Verifica que `viewmodes="maximized"` esté en config.xml
- Asegúrate de que `screen-orientation="landscape"` esté configurado

## 📚 Recursos Adicionales

- **Documentación Tizen**: https://developer.tizen.org/development
- **Foros Samsung Developer**: https://developer.samsung.com/forum
- **Guías de TV**: https://developer.samsung.com/tv

## ✅ Checklist Final

- [ ] Tizen Studio instalado con TV Extensions
- [ ] Proyecto Tizen creado
- [ ] Todos los archivos copiados
- [ ] config.xml configurado correctamente
- [ ] Icono creado (icon.png)
- [ ] Samsung Frame en Developer Mode
- [ ] Dispositivo conectado en Tizen Studio
- [ ] Certificado de autor creado
- [ ] App instalada y funcionando
- [ ] Control remoto funcionando correctamente

¡Buena suerte con tu app nativa! 🎉

