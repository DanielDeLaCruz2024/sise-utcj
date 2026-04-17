import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── CLAVES DE API ────────────────────────────────────────────
const WEATHER_KEY = "ffdfa5594e4eed6b93cd0ae283fa68d9";
const NASA_KEY = "vDsh0EUNriBONQQ8HRqyEZCgviYObVgwdKiXG9vx";
const GIPHY_KEY   = "jGyxnXLwqD1V4LqmJsno2lN3RkVdawxl";

// ── VERIFICAR SESIÓN Y CARGAR DATOS ──────────────────────────
onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = 'sise_utcj.html';
    return;
  }

  // 1. Mostrar nombre y correo
  const nameEl  = document.getElementById('student-name');
  const emailEl = document.getElementById('student-email');
  if (nameEl)  nameEl.textContent  = user.displayName || user.email;
  if (emailEl) emailEl.textContent = 'Correo: ' + user.email;

  // 2. Cargar calificaciones desde Firestore
  try {
    const docRef  = doc(db, "calificaciones", user.uid);
    const docSnap = await getDoc(docRef);
    const tbody   = document.getElementById('grades-body');

    if (docSnap.exists()) {
      const data = docSnap.data();
      tbody.innerHTML = '';
      data.lista.forEach(item => {
        const row = `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">${item.nombre}</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">${item.docente}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;
                       color: ${item.nota >= 8 ? '#27ae60' : '#c0392b'};">
              ${item.nota}
            </td>
          </tr>`;
        tbody.innerHTML += row;
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;">No se encontraron calificaciones registradas.</td></tr>';
    }
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    document.getElementById('grades-body').innerHTML =
      '<tr><td colspan="3" style="text-align:center;color:red;">Error al conectar con la base de datos.</td></tr>';
  }
});

// ── CERRAR SESIÓN ────────────────────────────────────────────
document.getElementById('btn-cerrar').addEventListener('click', async function (e) {
  e.preventDefault();
  await signOut(auth);
  window.location.href = 'sise_utcj.html';
});

// ── TABS DE NOTIFICACIONES ───────────────────────────────────
window.showTab = function(tab) {
  const panelNuevas = document.getElementById('panel-nuevas');
  const panelLeidas = document.getElementById('panel-leidas');
  const tabs        = document.querySelectorAll('.notif-tab');

  tabs.forEach(t => t.classList.remove('active'));

  if (tab === 'nuevas') {
    panelNuevas.classList.add('active');
    panelLeidas.classList.remove('active');
    tabs[0].classList.add('active');
  } else {
    panelNuevas.classList.remove('active');
    panelLeidas.classList.add('active');
    tabs[1].classList.add('active');
  }
};

// Eliminar notificaciones
document.querySelectorAll('.btn-delete').forEach(btn => {
  btn.addEventListener('click', function () {
    const item = this.closest('.notif-item');
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.3s';
    setTimeout(() => item.remove(), 300);
  });
});

// ── MODAL 2FA ────────────────────────────────────────────────
const btn2fa    = document.getElementById('btn-2fa');
const modal2fa  = document.getElementById('modal-2fa');
const close2fa  = document.getElementById('close-2fa');
const otpInputs = document.querySelectorAll('.twofa-otp .otp-input');

if (btn2fa) {
  btn2fa.addEventListener('click', () => {
    modal2fa.classList.add('active');
    if (otpInputs[0]) otpInputs[0].focus();
  });
}
if (close2fa) {
  close2fa.addEventListener('click', () => modal2fa.classList.remove('active'));
}

otpInputs.forEach((input, index) => {
  input.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 1);
    if (this.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !this.value && index > 0) otpInputs[index - 1].focus();
  });
});

// ── API 1: OPENWEATHERMAP — CLIMA ────────────────────────────
function loadClima() {
  // Siempre cargar Ciudad Juárez, Chihuahua
  fetchClimaByCity("Ciudad Juárez, Chihuahua");
}

async function fetchClimaByCity(city) {
  const climaBody = document.getElementById('clima-body');

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_KEY}&units=metric&lang=es`
    );

    const data = await res.json();
    if (data.cod !== 200) throw new Error(data.message);

    const temp    = Math.round(data.main.temp);
    const feels   = Math.round(data.main.feels_like);
    const hum     = data.main.humidity;
    const desc    = data.weather[0].description;
    const icon    = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    climaBody.innerHTML = `
      <div class="clima-main">
        <img src="${iconUrl}" alt="${desc}" width="60" height="60">
        <div>
          <p class="clima-city">Ciudad Juárez, Chihuahua</p>
          <p class="clima-temp">${temp}°C</p>
          <p class="clima-desc">${desc}</p>
        </div>
      </div>
      <div class="clima-details" style="margin-top:10px;">
        <div>Sensación térmica: <strong>${feels}°C</strong></div>
        <div>Humedad: <strong>${hum}%</strong></div>
        <div>Viento: <strong>${Math.round(data.wind.speed * 3.6)} km/h</strong></div>
      </div>`;

  } catch (err) {
    console.error("Clima error:", err);
    climaBody.innerHTML = '<p class="clima-loading">No se pudo obtener el clima.</p>';
  }
}

// ── API 2: NASA — IMAGEN DEL ESPACIO (ALEATORIA SEGURA) ─────

// Generar fecha aleatoria
function getRandomDate() {
  const start = new Date(2015, 0, 1);
  const end   = new Date();
  const date  = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

async function loadNASA() {
  const container = document.getElementById('nasa-container');

  // Intentar hasta 5 veces
  for (let i = 0; i < 5; i++) {
    try {
      const randomDate = getRandomDate();

      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${randomDate}`
      );

      const data = await res.json();

      // Validar que tenga contenido real
      if (!data.url || !data.explanation) continue;

      const texto = data.explanation.length > 120
        ? data.explanation.slice(0, 120) + '...'
        : data.explanation;

      container.innerHTML = data.media_type === "image"
        ? `
          <img src="${data.url}" style="width:100%; border-radius:8px;">
          <h4>${data.title}</h4>
          <p style="font-size:12px;">${texto}</p>
        `
        : `
          <iframe 
            src="${data.url}" 
            frameborder="0" 
            allowfullscreen 
            style="width:100%; height:200px; border-radius:8px;">
          </iframe>
          <h4>${data.title}</h4>
        `;

      return; // ✅ salir si funcionó

    } catch (err) {
      console.warn("Intento fallido NASA:", err);
    }
  }

  // ❌ si todos fallan
  container.innerHTML = '<p class="clima-loading">No se pudo cargar NASA.</p>';
}
// ── API 3: GIPHY — GIF MOTIVACIONAL ─────────────────────────
async function loadGif() {
  const gifBody = document.getElementById('gif-body');
  const queries = ['estudiante universitario', 'motivacion estudio', 'success graduation', 'coding developer'];
  const query   = queries[Math.floor(Math.random() * queries.length)];

  try {
    const res  = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=${encodeURIComponent(query)}&rating=g`
    );
    const data = await res.json();
    const gif  = data.data;

    if (!gif || !gif.images) throw new Error("Sin datos");

    const url   = gif.images.fixed_height.url;
    const title = gif.title || 'GIF del día';

    gifBody.innerHTML = `
      <img src="${url}" alt="${title}" loading="lazy">
      <p class="gif-title">${title.length > 50 ? title.slice(0, 50) + '…' : title}</p>`;
  } catch (err) {
    console.error("Giphy error:", err);
    gifBody.innerHTML = '<p class="clima-loading">No se pudo cargar el GIF.</p>';
  }
}

// ── BOTÓN REFRESH GIF ────────────────────────────────────────
const btnRefreshGif = document.getElementById('btn-refresh-gif');
if (btnRefreshGif) {
  btnRefreshGif.addEventListener('click', () => {
    document.getElementById('gif-body').innerHTML = '<p class="clima-loading">Cargando...</p>';
    loadGif();
  });
}

// ── INICIALIZAR LAS 3 APIS AL CARGAR ────────────────────────
loadClima();
loadNASA();
loadGif();