/* ==========================================================================
   Cero Ojeras VIP - Telegram Mini App Logic
   Telegram.WebApp Integration + Local Testing Simulation
   ========================================================================== */

// Configuración de Estado App
const state = {
    isVIP: false,
    completedDays: [],
    timerInterval: null,
    timerSeconds: 180, // 3 min por defecto
    currentExerciseId: 1
};

// Referencia Telegram SDK
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Ejercicios Configurados
const exercisesData = {
    1: {
        title: "Técnica Crio-Drenante de Mañana",
        day: "Día 1 • 5 min",
        duration: 180, // 3 min
        steps: [
            "Limpia suavemente el rostro y aplica 2 gotas de sérum o hidratante liviano.",
            "Usa 2 cucharas frías de tu refrigerador o rodillo crio.",
            "Realiza suave presión desde el lagrimal hacia las sienes sin estirar la piel (15 repeticiones).",
            "Drena hacia el lateral del cuello para liberar el exceso de líquidos retenidos."
        ]
    },
    2: {
        title: "Fórmula Aclarante con Rosa Mosqueta",
        day: "Día 2 • 7 min",
        duration: 240, // 4 min
        steps: [
            "Aplica 1-2 gotas de aceite puro de rosa mosqueta en el dedo anular.",
            "Realiza suaves pulsaciones de acupresión alrededor del hueso orbital.",
            "Mantén la presión leve durante 3 segundos en 5 puntos clave bajo la pupila.",
            "Puntea suavemente para estimular la circulación y regeneración nocturna."
        ]
    },
    3: {
        title: "Levantamiento de Párpados y Mirada Cansada",
        day: "Día 3 • 6 min",
        duration: 210, // 3.5 min
        steps: [
            "Coloca tus dedos índices en los extremos de tus cejas.",
            "Intenta cerrar los ojos ejerciendo ligera resistencia hacia arriba.",
            "Sostén la tensión isométrica durante 5 segundos y relaja. Repite 10 veces.",
            "Parpadea suavemente para lubricar el globo ocular."
        ]
    }
};

// Inicialización de la App
document.addEventListener("DOMContentLoaded", () => {
    initTelegramApp();
    loadLocalProgress();
    updateUIState();
});

// Inicialización SDK Telegram
function initTelegramApp() {
    if (tg) {
        console.log("SDK de Telegram WebApp Detectado:", tg);
        tg.ready();
        tg.expand(); // Expande a pantalla completa

        // Aplicar colores del tema de Telegram si están disponibles
        if (tg.setHeaderColor) tg.setHeaderColor("#FAF9F6");
        if (tg.setBackgroundColor) tg.setBackgroundColor("#FAF9F6");

        // Obtener nombre y foto del usuario si está dentro de Telegram
        const user = tg.initDataUnsafe?.user;
        if (user) {
            document.getElementById("userName").innerText = `Hola, ${user.first_name} ✨`;
            if (user.photo_url) {
                document.getElementById("userAvatar").src = user.photo_url;
            }
        }
    } else {
        console.log("Navegador Estándar: Ejecutando en modo simulación local.");
    }
}

// Alternar entre Pestañas
function switchTab(tabId) {
    triggerHaptic('selectionChanged');
    
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

    const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add("active");

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add("active");
}

// Acción Principal: Desbloquear / Comprar Plan VIP
function desbloquearPlan() {
    triggerHaptic('impactHeavy');

    if (state.isVIP) {
        // Si ya es VIP, al presionar el botón nos lleva a la pestaña de protocolo
        switchTab('protocolo');
        showToast("✨ Ya tienes acceso VIP activado. ¡Disfruta tus rutinas!");
        return;
    }

    const payload = {
        action: "buy_premium_plan",
        item: "cero_ojeras_vip",
        price: 9.99,
        currency: "USD",
        user_id: tg?.initDataUnsafe?.user?.id || "user_demo_123",
        timestamp: new Date().toISOString()
    };

    if (tg && tg.sendData) {
        // Si se ejecuta dentro de Telegram, envía los datos al Bot nativamente
        tg.sendData(JSON.stringify(payload));
    } else {
        // Si se ejecuta en navegador web / local, despliega el modal de inspección
        document.getElementById("jsonPayloadCode").innerText = JSON.stringify(payload, null, 2);
        document.getElementById("telegramPayloadModal").classList.add("active");
    }
}

// Simular Respuesta de Pago Exitoso desde el Bot
function simulateSuccessfulPayment() {
    closePayloadModal();
    state.isVIP = true;
    saveLocalProgress();
    updateUIState();
    triggerHaptic('notificationSuccess');
    showToast("🎉 ¡Pago recibido! Has desbloqueado el Protocolo VIP.");
}

// Toggle Estado VIP para pruebas rápidas
function toggleVIPState() {
    state.isVIP = !state.isVIP;
    saveLocalProgress();
    updateUIState();
    triggerHaptic('impactLight');
}

// Actualizar Interfaz (Bloqueado vs Desbloqueado)
function updateUIState() {
    const previewCard = document.getElementById("previewCard");
    const lockOverlay = document.getElementById("lockOverlay");
    const bannerBadge = document.getElementById("bannerBadge");
    const vipStatusBadge = document.getElementById("vipStatusBadge");
    const btnUnlock = document.getElementById("btnUnlock");
    const devStatusText = document.getElementById("devStatusText");
    const progressCard = document.getElementById("progressCard");

    if (state.isVIP) {
        // MODO DESBLOQUEADO (VIP)
        previewCard.classList.remove("locked");
        previewCard.classList.add("unlocked");
        lockOverlay.style.display = "none";
        
        bannerBadge.innerText = "⭐ MIEMBRO VIP";
        bannerBadge.style.background = "rgba(56, 161, 105, 0.9)";
        
        vipStatusBadge.innerText = "⭐ ACCESO VIP COMPLETO";
        vipStatusBadge.classList.add("vip-active");

        btnUnlock.classList.add("unlocked-btn");
        btnUnlock.querySelector(".btn-icon").innerText = "✨";
        btnUnlock.querySelector(".btn-text").innerText = "VER MI PROTOCOLO VIP";

        devStatusText.innerText = "Estado: 🔓 Desbloqueado (VIP Activo)";
        progressCard.classList.remove("hidden");
        updateProgressWidget();
    } else {
        // MODO BLOQUEADO (PAYWALL)
        previewCard.classList.add("locked");
        previewCard.classList.remove("unlocked");
        lockOverlay.style.display = "flex";

        bannerBadge.innerText = "🔒 Exclusivo 14 Días";
        bannerBadge.style.background = "rgba(0, 0, 0, 0.65)";

        vipStatusBadge.innerText = "🔒 PLAN FREEMIUM";
        vipStatusBadge.classList.remove("vip-active");

        btnUnlock.classList.remove("unlocked-btn");
        btnUnlock.querySelector(".btn-icon").innerText = "🔓";
        btnUnlock.querySelector(".btn-text").innerText = "DESBLOQUEAR PLAN VIP • $9.99 USD";

        devStatusText.innerText = "Estado: 🔒 Bloqueado (Pre-Pago)";
        progressCard.classList.add("hidden");
    }
}

// Abrir Modal de Ejercicio
function openExerciseModal(exerciseId) {
    triggerHaptic('impactLight');
    
    if (!state.isVIP) {
        desbloquearPlan();
        return;
    }

    state.currentExerciseId = exerciseId;
    const data = exercisesData[exerciseId] || exercisesData[1];

    document.getElementById("modalBadge").innerText = data.day;
    document.getElementById("modalTitle").innerText = data.title;
    
    const stepsList = document.getElementById("modalSteps");
    stepsList.innerHTML = data.steps.map(step => `<li>${step}</li>`).join("");

    state.timerSeconds = data.duration;
    updateTimerDisplay();

    document.getElementById("exerciseModal").classList.add("active");
}

function closeExerciseModal() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    document.getElementById("btnTimerStart").innerText = "▶ Iniciar Ejercicio";
    document.getElementById("exerciseModal").classList.remove("active");
}

function closePayloadModal() {
    document.getElementById("telegramPayloadModal").classList.remove("active");
}

// Timer Logic
function toggleTimer() {
    const btn = document.getElementById("btnTimerStart");
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        btn.innerText = "▶ Reanudar Ejercicio";
    } else {
        btn.innerText = "⏸ Pausar";
        state.timerInterval = setInterval(() => {
            if (state.timerSeconds > 0) {
                state.timerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                btn.innerText = "🎉 ¡Completado!";
                triggerHaptic('notificationSuccess');
                markExerciseComplete();
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById("timerDisplay").innerText = formatted;

    // Actualizar anillo SVG
    const maxDuration = exercisesData[state.currentExerciseId]?.duration || 180;
    const offset = 283 - (state.timerSeconds / maxDuration) * 283;
    document.getElementById("timerCircle").style.strokeDashoffset = offset;
}

// Marcar Ejercicio Completado
function markExerciseComplete() {
    if (!state.completedDays.includes(state.currentExerciseId)) {
        state.completedDays.push(state.currentExerciseId);
        saveLocalProgress();
        updateProgressWidget();
    }
    showToast("🎉 ¡Excelente! Has completado la rutina de hoy.");
    closeExerciseModal();
}

function updateProgressWidget() {
    const count = state.completedDays.length;
    document.getElementById("progressText").innerText = `${count} de 14 Días Completados`;
    const percent = Math.min(100, Math.max(7, (count / 14) * 100));
    document.getElementById("progressBarFill").style.width = `${percent}%`;
}

// Guardar y Cargar en LocalStorage
function saveLocalProgress() {
    localStorage.setItem("cero_ojeras_vip_state", JSON.stringify({
        isVIP: state.isVIP,
        completedDays: state.completedDays
    }));
}

function loadLocalProgress() {
    const saved = localStorage.getItem("cero_ojeras_vip_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.isVIP = parsed.isVIP || false;
            state.completedDays = parsed.completedDays || [];
        } catch(e) {
            console.error("Error al cargar estado local", e);
        }
    }
}

// Haptic feedback helper
function triggerHaptic(type) {
    if (tg && tg.HapticFeedback) {
        switch(type) {
            case 'impactLight': tg.HapticFeedback.impactOccurred('light'); break;
            case 'impactHeavy': tg.HapticFeedback.impactOccurred('heavy'); break;
            case 'selectionChanged': tg.HapticFeedback.selectionChanged(); break;
            case 'notificationSuccess': tg.HapticFeedback.notificationOccurred('success'); break;
        }
    }
}

// Toast Notificación Breve
function showToast(message) {
    const existing = document.querySelector(".toast-popup");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-popup";
    toast.innerText = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(45, 55, 72, 0.95);
        color: #FFF;
        padding: 10px 18px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 300;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: toastIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
