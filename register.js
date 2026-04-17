import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const btnRegister = document.getElementById('btn-register');
const regError    = document.getElementById('reg-error');
const regSuccess  = document.getElementById('reg-success');

// Lista de materias y docentes según tus capturas
const materiasBase = [
  { nombre: "Desarrollo de Aplicaciones I", docente: "ZACARIAS PEREZ DAVID" },
  { nombre: "Estructura de Datos", docente: "MARTINEZ NAVARRETE GABRIEL" },
  { nombre: "Inglés V", docente: "SALAS ORNELAS VERONICA" },
  { nombre: "Interconexión de Redes", docente: "DE LA ROSA TORRES ROBERTO" },
  { nombre: "Probabilidad y Estadística", docente: "ROMERO DIAZ CARLOS" },
  { nombre: "Formación Sociocultural IV", docente: "ARREOLA ALVARADO LETICIA" }
];

btnRegister.addEventListener('click', async function () {
  regError.textContent = '';
  regSuccess.textContent = '';

  const matricula = document.getElementById('reg-matricula').value.trim();
  const nombre = document.getElementById('reg-nombre').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!matricula || !nombre || !pass || !pass2) {
    regError.textContent = 'Por favor completa todos los campos.';
    return;
  }
  if (pass !== pass2) {
    regError.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  const email = matricula + '@utcj.edu.mx';

  try {
    // 1. Crear el usuario en Auth
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // 2. Guardar el nombre en el perfil
    await updateProfile(credential.user, { displayName: nombre.toUpperCase() });

    // 3. Generar calificaciones al azar (del 7 al 10)
    const calificacionesFinales = materiasBase.map(m => ({
      ...m,
      nota: Math.floor(Math.random() * (11 - 7) + 7)
    }));

    // 4. GUARDAR EN FIRESTORE
    // Usamos el UID del usuario como ID del documento para que sea único
    await setDoc(doc(db, "calificaciones", credential.user.uid), {
      lista: calificacionesFinales,
      fechaRegistro: new Date()
    });

    regSuccess.textContent = 'Registro exitoso. Generando calificaciones...';
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

  } catch (error) {
    regError.textContent = 'Error: ' + error.message;
  }
});