/* ==========================================================================
   Selem Beauty - Application Logic
   Cero Ojeras VIP | Telegram WebApp + Plan Básico & Premium Flow
   ========================================================================== */

// Estado Global de la App
const state = {
    isVIP: false,
    currentView: 'welcome',
    currentPlanTab: 'basico',
    timerInterval: null,
    timerSeconds: 180,
    timerTotal: 180,
    currentModalTitle: ''
};

// SDK Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
    initTelegramApp();
    loadLocalProgress();
    updateUIState();
});

// ─────────────────────────────────────────────────────────────
// TELEGRAM SDK
// ─────────────────────────────────────────────────────────────
function initTelegramApp() {
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor("#FFFFFF");
        if (tg.setBackgroundColor) tg.setBackgroundColor("#FAF9F6");
    }
}

// ─────────────────────────────────────────────────────────────
// NAVEGACIÓN ENTRE VISTAS
// ─────────────────────────────────────────────────────────────
function goToAppView(tab) {
    triggerHaptic('impactMedium');
    state.currentView = 'app';
    document.getElementById("view-welcome").classList.remove("active");
    document.getElementById("view-app").classList.add("active");
    if (tab) switchPlanTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToWelcomeView() {
    triggerHaptic('impactLight');
    state.currentView = 'welcome';
    document.getElementById("view-app").classList.remove("active");
    document.getElementById("view-welcome").classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────────────────────────────
// PESTAÑAS DEL PLAN
// ─────────────────────────────────────────────────────────────
function switchPlanTab(tab) {
    triggerHaptic('selectionChanged');
    state.currentPlanTab = tab;

    // Botones de pestaña
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`tabBtn${capitalize(tab)}`).classList.add("active");

    // Contenido de pestaña
    document.querySelectorAll(".plan-tab-content").forEach(el => el.classList.remove("active"));
    document.getElementById(`planContent${capitalize(tab)}`).classList.add("active");
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─────────────────────────────────────────────────────────────
// PAYWALL / DESBLOQUEAR PLAN VIP
// ─────────────────────────────────────────────────────────────
function desbloquearPlanVIP() {
    triggerHaptic('impactHeavy');

    if (state.isVIP) {
        showUnlockedPremium();
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
        tg.sendData(JSON.stringify(payload));
    } else {
        document.getElementById("jsonPayloadCode").innerText = JSON.stringify(payload, null, 2);
        document.getElementById("telegramPayloadModal").classList.add("active");
    }
}

function simulateSuccessfulPayment() {
    closePayloadModal();
    state.isVIP = true;
    saveLocalProgress();
    updateUIState();
    triggerHaptic('notificationSuccess');
    showToast("🎉 ¡Acceso VIP activado! Disfruta tu ritual completo.");
}

// ─────────────────────────────────────────────────────────────
// UI STATE (BLOQUEADO / DESBLOQUEADO)
// ─────────────────────────────────────────────────────────────
function updateUIState() {
    const badge = document.getElementById("vipStatusBadge");
    const devText = document.getElementById("devStatusText");
    const paywall = document.getElementById("premiumPaywall");
    const premiumContent = document.getElementById("premiumContent");

    if (state.isVIP) {
        if (badge) { badge.innerText = "⭐ VIP ACTIVO"; badge.classList.add("vip-active"); }
        if (devText) devText.innerText = "Estado: 🔓 Desbloqueado (VIP Activo)";
        if (paywall) paywall.classList.add("hidden");
        if (premiumContent) premiumContent.classList.remove("hidden");
    } else {
        if (badge) { badge.innerText = "🔒 FREEMIUM"; badge.classList.remove("vip-active"); }
        if (devText) devText.innerText = "Estado: 🔒 Bloqueado (Pre-Pago)";
        if (paywall) paywall.classList.remove("hidden");
        if (premiumContent) premiumContent.classList.add("hidden");
    }
}

function showUnlockedPremium() {
    switchPlanTab('premium');
    updateUIState();
    showToast("✨ Ya tienes acceso VIP. ¡Disfruta tu ritual completo!");
}

// ─────────────────────────────────────────────────────────────
// MODAL DE RUTINA / CRONÓMETRO
// ─────────────────────────────────────────────────────────────
function openCustomTimerModal(title, durationSeconds, steps) {
    triggerHaptic('impactLight');

    state.currentModalTitle = title;
    state.timerSeconds = durationSeconds;
    state.timerTotal = durationSeconds;

    // Calcular texto del badge (min:seg)
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durationLabel = secs > 0 ? `${mins} min ${secs}s` : `${mins} min`;

    document.getElementById("modalBadge").innerText = `⏱ ${durationLabel}`;
    document.getElementById("modalTitle").innerText = title;

    const stepsOl = document.getElementById("modalSteps");
    stepsOl.innerHTML = steps.map(step => `<li>${step}</li>`).join("");

    resetTimerUI();
    document.getElementById("exerciseModal").classList.add("active");
}

function closeExerciseModal() {
    triggerHaptic('impactLight');
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    document.getElementById("exerciseModal").classList.remove("active");
}

function closePayloadModal() {
    document.getElementById("telegramPayloadModal").classList.remove("active");
}

// ─────────────────────────────────────────────────────────────
// CRONÓMETRO
// ─────────────────────────────────────────────────────────────
function toggleTimer() {
    triggerHaptic('selectionChanged');
    const btn = document.getElementById("btnTimerStart");

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        btn.innerText = "▶ Reanudar Rutina";
        btn.classList.remove("running");
    } else {
        btn.innerText = "⏸ Pausar Rutina";
        btn.classList.add("running");

        state.timerInterval = setInterval(() => {
            if (state.timerSeconds > 0) {
                state.timerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                btn.innerText = "✓ ¡Rutina Finalizada!";
                btn.classList.remove("running");
                triggerHaptic('notificationSuccess');
                showToast("✨ ¡Rutina completada! Tu piel lo agradece 💛");
            }
        }, 1000);
    }
}

function resetTimerUI() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    const btn = document.getElementById("btnTimerStart");
    btn.innerText = "▶ Iniciar Rutina";
    btn.classList.remove("running");
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    document.getElementById("timerDisplay").innerText =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const percentage = state.timerSeconds / state.timerTotal;
    const circumference = 2 * Math.PI * 45;
    const circle = document.getElementById("timerCircle");
    circle.style.strokeDashoffset = circumference * (1 - percentage);
}

function markExerciseComplete() {
    showToast("✅ ¡Rutina completada! Cuida tu piel cada día 💛");
    closeExerciseModal();
}

// ─────────────────────────────────────────────────────────────
// VIP TOGGLE (SIMULACIÓN PRUEBAS)
// ─────────────────────────────────────────────────────────────
function toggleVIPState() {
    state.isVIP = !state.isVIP;
    saveLocalProgress();
    updateUIState();
    triggerHaptic('impactLight');
    showToast(state.isVIP ? "⭐ VIP Activado (Modo Pruebas)" : "🔒 VIP Desactivado (Modo Pruebas)");
}

// ─────────────────────────────────────────────────────────────
// PERSISTENCIA LOCAL
// ─────────────────────────────────────────────────────────────
function saveLocalProgress() {
    localStorage.setItem("selem_beauty_state", JSON.stringify({
        isVIP: state.isVIP
    }));
}

function loadLocalProgress() {
    const saved = localStorage.getItem("selem_beauty_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.isVIP = parsed.isVIP || false;
        } catch (e) {
            console.error("Error cargando estado:", e);
        }
    }
}

// ─────────────────────────────────────────────────────────────
// FEEDBACK HÁPTICO (TELEGRAM)
// ─────────────────────────────────────────────────────────────
function triggerHaptic(type) {
    if (tg && tg.HapticFeedback) {
        if (type === 'impactLight') tg.HapticFeedback.impactOccurred('light');
        if (type === 'impactMedium') tg.HapticFeedback.impactOccurred('medium');
        if (type === 'impactHeavy') tg.HapticFeedback.impactOccurred('heavy');
        if (type === 'selectionChanged') tg.HapticFeedback.selectionChanged();
        if (type === 'notificationSuccess') tg.HapticFeedback.notificationOccurred('success');
    }
}

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function showToast(message) {
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
