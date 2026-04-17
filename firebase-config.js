import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// Importamos Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhM-nWpwGnlEKxzuJ_gv6Tfp3FjXqJBG8",
  authDomain: "sise-utcj.firebaseapp.com",
  projectId: "sise-utcj",
  storageBucket: "sise-utcj.firebasestorage.app",
  messagingSenderId: "236383414711",
  appId: "1:236383414711:web:8ac6a0c26609d9dd73a032"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Exportamos la base de datos para usarla en otros archivos
export const db = getFirestore(app);