// sise_utcj.js — con Firebase Auth
import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
 
const btnLogin      = document.getElementById('btn-login');
const btnForgot     = document.getElementById('btn-forgot');
const loginError    = document.getElementById('login-error');
 
const overlayForgot = document.getElementById('modal-forgot');
const overlayVerify = document.getElementById('modal-verify');
const closeForgot   = document.getElementById('close-forgot');
const closeVerify   = document.getElementById('close-verify');
const btnContinuar  = document.getElementById('btn-continuar');
const btnVerificar  = document.getElementById('btn-verificar');
const recoverOptions = document.querySelectorAll('.recover-option');
const otpInputs      = document.querySelectorAll('.otp-input');
 
// ── INICIO DE SESIÓN CON FIREBASE ────────────────────────────
btnLogin.addEventListener('click', async function () {
  const usuario    = document.getElementById('login-user').value.trim();
  const contrasena = document.getElementById('login-pass').value;
  loginError.textContent = '';
 
  if (!usuario || !contrasena) {
    loginError.textContent = 'Por favor ingresa usuario y contraseña.';
    return;
  }
 
  // Construir correo completo si el usuario no incluyó el dominio
  const email = usuario.includes('@') ? usuario : usuario + '@utcj.edu.mx';
 
  try {
    await signInWithEmailAndPassword(auth, email, contrasena);
    window.location.href = 'dashboard.html';
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        loginError.textContent = 'Usuario o contraseña incorrectos.';
        break;
      case 'auth/too-many-requests':
        loginError.textContent = 'Demasiados intentos. Intenta más tarde.';
        break;
      default:
        loginError.textContent = 'Error al iniciar sesión. Intenta de nuevo.';
    }
  }
});
 
// ── OLVIDÉ CONTRASEÑA ────────────────────────────────────────
btnForgot.addEventListener('click', function (e) {
  e.preventDefault();
  overlayForgot.classList.add('active');
});
 
closeForgot.addEventListener('click', () => overlayForgot.classList.remove('active'));
closeVerify.addEventListener('click', () => overlayVerify.classList.remove('active'));
 
overlayForgot.addEventListener('click', e => {
  if (e.target === overlayForgot) overlayForgot.classList.remove('active');
});
overlayVerify.addEventListener('click', e => {
  if (e.target === overlayVerify) overlayVerify.classList.remove('active');
});
 
recoverOptions.forEach(function (option) {
  option.addEventListener('click', function () {
    recoverOptions.forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
  });
});
 
// ── CONTINUAR: enviar correo de restablecimiento ─────────────
btnContinuar.addEventListener('click', async function () {
  const usuario = document.getElementById('login-user').value.trim();
  const email   = usuario.includes('@') ? usuario : usuario + '@utcj.edu.mx';
 
  if (!usuario) {
    alert('Escribe tu usuario en el campo de inicio de sesión primero.');
    return;
  }
 
  try {
    await sendPasswordResetEmail(auth, email);
    overlayForgot.classList.remove('active');
    alert('Se envió un correo de restablecimiento a ' + email);
  } catch (error) {
    alert('No se pudo enviar el correo. Verifica tu usuario.');
  }
});
 
// ── OTP (flujo demo, no usado con Firebase directamente) ─────
otpInputs.forEach(function (input, index) {
  input.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 1);
    if (this.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !this.value && index > 0) otpInputs[index - 1].focus();
  });
});
 
btnVerificar.addEventListener('click', function () {
  const code = Array.from(otpInputs).map(i => i.value).join('');
  if (code.length < 6) { alert('Ingresa los 6 dígitos.'); return; }
  overlayVerify.classList.remove('active');
  window.location.href = 'dashboard.html';
});
