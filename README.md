# ✨ Cero Ojeras VIP - Telegram Mini App

Mini Aplicación de Telegram con interfaz estilo **Face Yoga & Facial Exercises**, lista para desplegar en **Netlify**, subir a **GitHub** y conectar con tu **Bot de Telegram**.

---

## 🎨 Características de la Interfaz

- **Estética Luxury Cosmética**: Diseñada con una paleta cálida (terracota `#D48872`, dorado cosmético `#E0A96D` y alabastro `#FAF9F6`).
- **Integración Nativa Telegram WebApp (`Telegram.WebApp`)**:
  - Ajuste de pantalla completa (`expand()`).
  - Colores de tema sincronizados con Telegram.
  - Vibración Háptica (`HapticFeedback`).
  - Envío de datos de compra nativo vía `tg.sendData()`.
- **Efecto Vista Previa Bloqueada (Paywall Blur)**: Muestra un difuminado elegante del contenido con candado flotante para incentivar el desbloqueo/pago VIP.
- **Barra de Pruebas Locales (Dev Toggle)**: Permite probar la interfaz tanto en estado **Bloqueado (Pre-pago)** como **Desbloqueado (VIP)** directamente en tu navegador sin requerir un Bot real en la fase de diseño.
- **Reproductor de Rutina con Cronómetro**: Widget circular interactivo de 3-5 minutos para guiarse en cada ejercicio.
- **Pestañas Interactivas**: Protocolo 14 Días, Rutinas Express, Resultados/Testimonios y FAQ.

---

## 🚀 Paso 1: Pruebas en Servidor Local

Tu servidor local ya está ejecutándose. Puedes abrir en tu navegador:

```bash
http://localhost:3000
```

Si deseas reiniciar el servidor local en cualquier momento:
```bash
python -m http.server 3000
```

---

## 📦 Paso 2: Subir tu Código a GitHub

1. Abre la terminal en el directorio del proyecto (`E:\Panel Net`).
2. Inicializa el repositorio Git y sube el código:

```bash
git init
git add .
git commit -m "Initial commit - Telegram Mini App Cero Ojeras VIP"
```

3. Crea un repositorio nuevo en GitHub (ejemplo: `cero-ojeras-miniapp`) y vincúlalo:

```bash
git remote add origin https://github.com/TU_USUARIO/cero-ojeras-miniapp.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 3: Desplegar Gratis en Netlify

1. Inicia sesión en [Netlify.com](https://www.netlify.com/).
2. Haz clic en **"Add new site"** ➔ **"Import from an existing project"**.
3. Selecciona **GitHub** y elige tu repositorio (`cero-ojeras-miniapp`).
4. Deja la configuración por defecto:
   - **Publish directory**: `.` (o déjalo en blanco)
5. Presiona **"Deploy site"**.
6. En segundos obtendrás tu URL HTTPS segura (ejemplo: `https://cero-ojeras-vip.netlify.app`).

> 💡 **Nota Importante:** Telegram exige que las Mini Apps funcionen obligatoriamente bajo **HTTPS**. Netlify genera el certificado SSL/HTTPS automáticamente.

---

## 🤖 Paso 4: Vincular la Mini App a tu Bot en Telegram (@BotFather)

### Opción A: Agregar como Menú Principal del Bot (Menu Button)
1. Abre Telegram y busca a **[@BotFather](https://t.me/BotFather)**.
2. Envía el comando `/mybots` y selecciona tu Bot.
3. Selecciona **Bot Settings** ➔ **Menu Button** ➔ **Configure menu button**.
4. Envía la URL de tu app en Netlify: `https://cero-ojeras-vip.netlify.app`.
5. Asigna el título del botón, por ejemplo: `✨ Cero Ojeras VIP`.

### Opción B: Crear una Mini App Dedicada (Short Link)
1. En @BotFather envía el comando `/newapp`.
2. Selecciona tu Bot.
3. Ingresa el título: `Cero Ojeras VIP`.
4. Ingresa una breve descripción e imagen de portada (opcional).
5. Cuando solicite la WebApp URL, pega la URL de Netlify: `https://cero-ojeras-vip.netlify.app`.
6. Asigna un nombre corto (ej: `app`). Tu Mini App estará lista en `https://t.me/TU_BOT/app`.

---

## 💳 Paso 5: ¿Cómo recibe tu Bot la orden de pago (`tg.sendData`)?

Cuando el usuario presiona el botón **🔓 DESBLOQUEAR POR $9.99 USD**, la Mini App ejecuta:

```javascript
tg.sendData(JSON.stringify({
    action: "buy_premium_plan",
    item: "cero_ojeras_vip",
    price: 9.99,
    currency: "USD"
}));
```

En el backend de tu Bot de Telegram (Python `python-telegram-bot`, `aiogram`, o Node.js `telegraf`), puedes recibir este evento así:

### Ejemplo en Python (`python-telegram-bot` v20+):

```python
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes
import json

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Recibir los datos enviados por la Mini App
    raw_data = update.message.web_app_data.data
    data = json.loads(raw_data)
    
    user_id = update.effective_user.id
    print(f"Orden recibida de {user_id}: {data}")

    if data.get("action") == "buy_premium_plan":
        # Aquí envías una Factura de Telegram (Telegram Invoice) o un link de pago
        await update.message.reply_text(
            f"🎉 ¡Gracias por solicitar el {data['item']}!\n\n"
            f"Monto a pagar: ${data['price']} USD.\n"
            f"Procesando tu acceso VIP..."
        )

app = ApplicationBuilder().token("TU_BOT_TOKEN").build()
app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
app.run_polling()
```

---

## 📁 Estructura del Proyecto

```
Panel Net/
├── assets/
│   ├── hero_banner.png      # Imagen principal de skincare/face yoga
│   ├── routine_crio.png     # Miniatura masaje crio
│   └── routine_oil.png      # Miniatura fórmula rosa mosqueta
├── index.html               # Estructura HTML con Telegram SDK
├── style.css                # Sistema de diseño luxury cosmetics
├── app.js                   # Lógica de Telegram SDK, cronómetro y local storage
├── netlify.toml             # Configuración de cabeceras iframe para Telegram
└── README.md                # Guía completa de uso y despliegue
```
