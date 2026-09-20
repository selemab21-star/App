/* ==========================================================================
   Selem Beauty - Application Logic
   Telegram WebApp Integration + Dynamic Plan Recomendado & Splash Flow
   ========================================================================== */

// Estado Global de la App
const state = {
    isVIP: false,
    completedExercises: [],
    timerInterval: null,
    timerSeconds: 300,
    currentExerciseId: 1,
    currentView: 'welcome' // 'welcome' | 'plan'
};

// SDK Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Datos completos de los 8 Módulos de Plan Recomendado (Coinciden exactamente con Imagen 1)
const exercisesData = {
    1: {
        id: 1,
        title: "5- Min Ejercicios Faciales",
        level: "Intermedio",
        durationText: "5 min",
        duration: 300,
        img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Aplica 3 gotas de sérum o aceite facial en manos limpias.",
            "Realiza suave presión alisando la frente desde las cejas hacia el cuero cabelludo.",
            "Desliza las yemas desde el centro del rostro hacia las sienes para esculpir los pómulos.",
            "Termina con suaves toques alrededor de la mandíbula y el cuello durante 5 minutos."
        ]
    },
    2: {
        id: 2,
        title: "Rellenador de Labios",
        level: "Intermedio",
        durationText: "5 min 50s",
        duration: 350,
        img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Humecta tus labios con bálsamo o aceite de argán.",
            "Forma una 'O' suave con tus labios sin arrugar la piel alrededor.",
            "Da pequeños pellizcos suaves en el contorno del labio superior e inferior para activar la microcirculación.",
            "Pulsiona suavemente las esquinas de los labios hacia arriba durante 5 minutos y 50 segundos."
        ]
    },
    3: {
        id: 3,
        title: "Efecto Bótox Facial",
        level: "Principiante",
        durationText: "6 min 40s",
        duration: 400,
        img: "https://images.unsplash.com/photo-1512290900673-030635e07661?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Coloca las palmas de tus manos sobre las sienes y estira ligeramente hacia arriba.",
            "Relaja la frente mientras abres y cierras los ojos lentamente.",
            "Masajea en círculos el músculo procero entre las cejas para prevenir líneas de expresión.",
            "Sostén la elevación durante 6 minutos y 40 segundos manteniendo respiración profunda."
        ]
    },
    4: {
        id: 4,
        title: "Lifting Antienvejecimiento",
        level: "Intermedio",
        durationText: "4 min 30s",
        duration: 270,
        img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Coloca tus nudillos justo debajo de los pómulos.",
            "Realiza un movimiento de barrido ascendente hacia las orejas ejerciendo presión moderada.",
            "Repite el movimiento desde el mentón hasta los lóbulos de las orejas.",
            "Drena el exceso de líquido bajando por los laterales del cuello."
        ]
    },
    5: {
        id: 5,
        title: "Reduce las Ojeras",
        level: "Principiante",
        durationText: "3 min 30s",
        duration: 210,
        img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Usa el dedo anular para aplicar contorno de ojos o frío (cucharas o rodillo crio).",
            "Puntea suavemente alrededor del hueso orbicular desde el lagrimal hacia afuera.",
            "Realiza suave drenaje linfático sin estirar la piel delicada de las ojeras.",
            "Continúa durante 3 minutos y 30 segundos para desinflamar la mirada."
        ]
    },
    6: {
        id: 6,
        title: "Cuello de Cisne",
        level: "Principiante",
        durationText: "4 min 30s",
        duration: 270,
        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Siéntate erguida con los hombros relajados hacia atrás.",
            "Eleva la barbilla hacia el techo sintiendo el estiramiento en la parte frontal del cuello.",
            "Toca el paladar con la punta de la lengua para activar el platisma.",
            "Mantén la posición y realiza rotaciones suaves hacia la izquierda y derecha."
        ]
    },
    7: {
        id: 7,
        title: "Piel Brillante",
        level: "Principiante",
        durationText: "4 min",
        duration: 240,
        img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Activa la circulación dando palmaditas suaves por todo el rostro con las yemas.",
            "Realiza movimientos circulares ascendentes alrededor de mejillas y frente.",
            "Aplica tu hidratante sellando con el calor de la palma de tus manos.",
            "Respira profundamente durante 4 minutos para oxigenar los tejidos faciales."
        ]
    },
    8: {
        id: 8,
        title: "Deshazte de la Papada",
        level: "Intermedio",
        durationText: "4 min 30s",
        duration: 270,
        img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        steps: [
            "Forma una 'V' con tus dedos índice y medio y deslízala a lo largo del hueso mandibular.",
            "Presiona firmemente desde el mentón hacia la parte posterior de la mandíbula.",
            "Inclina la cabeza ligeramente hacia atrás y pronuncia la letra 'X' y 'O' exagerando el movimiento.",
            "Repite durante 4 minutos y 30 segundos para tonificar la zona submentoniana."
        ]
    }
};

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
    initTelegramApp();
    renderPlanList();
    loadLocalProgress();
    updateUIState();
});

// Inicialización SDK Telegram
function initTelegramApp() {
    if (tg) {
        console.log("SDK Telegram WebApp disponible");
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor("#FFFFFF");
        if (tg.setBackgroundColor) tg.setBackgroundColor("#F8F8F8");
    }
}

// Navegación entre Vistas
function goToPlanView() {
    triggerHaptic('impactMedium');
    state.currentView = 'plan';
    document.getElementById("view-welcome").classList.remove("active");
    document.getElementById("view-plan").classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToWelcomeView() {
    triggerHaptic('impactLight');
    state.currentView = 'welcome';
    document.getElementById("view-plan").classList.remove("active");
    document.getElementById("view-welcome").classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Renderizado de Lista de Módulos (Plan Recomendado)
function renderPlanList() {
    const container = document.getElementById("planList");
    if (!container) return;

    let html = "";
    Object.values(exercisesData).forEach(item => {
        const isCompleted = state.completedExercises.includes(item.id);
        html += `
            <div class="plan-card ${isCompleted ? 'completed' : ''}" onclick="openExerciseModal(${item.id})">
                <div class="plan-card-img-wrap">
                    <img src="${item.img}" alt="${item.title}" class="plan-card-img">
                </div>
                <div class="plan-card-info">
                    <h3 class="plan-card-title">${item.title}</h3>
                    <span class="plan-card-meta">${item.level} | ${item.durationText}</span>
                </div>
                <div class="plan-card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Abrir Modal de Ejercicio
function openExerciseModal(id) {
    triggerHaptic('impactLight');
    const data = exercisesData[id];
    if (!data) return;

    state.currentExerciseId = id;
    state.timerSeconds = data.duration;

    document.getElementById("modalBadge").innerText = `${data.level} • ${data.durationText}`;
    document.getElementById("modalTitle").innerText = data.title;

    // Pasos
    const stepsOl = document.getElementById("modalSteps");
    stepsOl.innerHTML = data.steps.map(step => `<li>${step}</li>`).join("");

    // Resetear Cronómetro
    resetTimerUI();
    document.getElementById("exerciseModal").classList.add("active");
}

function closeExerciseModal() {
    triggerHaptic('impactLight');
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    document.getElementById("exerciseModal").classList.remove("active");
}

// Lógica de Cronómetro
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
                btn.innerText = "✓ Rutina Finalizada";
                btn.classList.remove("running");
                triggerHaptic('notificationSuccess');
                markExerciseComplete();
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
    const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById("timerDisplay").innerText = display;

    // Progreso Circular SVG
    const total = exercisesData[state.currentExerciseId].duration;
    const percentage = state.timerSeconds / total;
    const circle = document.getElementById("timerCircle");
    const circumference = 2 * Math.PI * 45; // r=45 -> 282.74
    circle.style.strokeDashoffset = circumference * (1 - percentage);
}

// Marcar Completado
function markExerciseComplete() {
    if (!state.completedExercises.includes(state.currentExerciseId)) {
        state.completedExercises.push(state.currentExerciseId);
        saveLocalProgress();
        renderPlanList();
    }
    showToast("✨ ¡Rutina completada con éxito!");
    closeExerciseModal();
}

// Alternar Estado VIP (Simulación)
function toggleVIPState() {
    state.isVIP = !state.isVIP;
    saveLocalProgress();
    updateUIState();
    triggerHaptic('impactLight');
}

function updateUIState() {
    const badge = document.getElementById("vipStatusBadge");
    const devStatusText = document.getElementById("devStatusText");

    if (badge) {
        if (state.isVIP) {
            badge.innerText = "⭐ VIP ACTIVO";
            badge.classList.add("vip-active");
            if (devStatusText) devStatusText.innerText = "Estado: 🔓 Desbloqueado (VIP)";
        } else {
            badge.innerText = "🔒 FREEMIUM";
            badge.classList.remove("vip-active");
            if (devStatusText) devStatusText.innerText = "Estado: 🔒 Bloqueado (Pre-Pago)";
        }
    }
}

// Persistencia en LocalStorage
function saveLocalProgress() {
    localStorage.setItem("selem_beauty_state", JSON.stringify({
        isVIP: state.isVIP,
        completedExercises: state.completedExercises
    }));
}

function loadLocalProgress() {
    const saved = localStorage.getItem("selem_beauty_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.isVIP = parsed.isVIP || false;
            state.completedExercises = parsed.completedExercises || [];
        } catch (e) {
            console.error(e);
        }
    }
}

// Feedback Háptico (Telegram)
function triggerHaptic(type) {
    if (tg && tg.HapticFeedback) {
        if (type === 'impactLight') tg.HapticFeedback.impactOccurred('light');
        if (type === 'impactMedium') tg.HapticFeedback.impactOccurred('medium');
        if (type === 'selectionChanged') tg.HapticFeedback.selectionChanged();
        if (type === 'notificationSuccess') tg.HapticFeedback.notificationOccurred('success');
    }
}

// Notificaciones Toast
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
