import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import firebaseConfig from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos del DOM
const authToggle = document.getElementById('auth-toggle');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

// Toggle entre formularios
authToggle.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        authToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${e.target.dataset.form}-form`).classList.add('active');
        authMessage.textContent = '';
    });
});

// Manejar Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'frontend/public/profile_page.html';
    } catch (error) {
        handleAuthError(error);
    }
});

// Manejar Registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.querySelector('#register-email').value;
    const password = registerForm.querySelector('#register-password').value;
    const username = registerForm.querySelector('#username').value;
    const birthdate = registerForm.querySelector('#birthdate').value;

    if (!validateRegisterForm(email, password, username, birthdate)) return;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username,
            email,
            birthdate,
            created_at: new Date(),
            profile_picture: "default.jpg",
            kisses: []
        });
        
        window.location.href = 'frontend/public/profile_page.html';
    } catch (error) {
        handleAuthError(error);
    }
});

// Validación del formulario de registro
function validateRegisterForm(email, password, username, birthdate) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset errors
    document.querySelectorAll('#register-form .error-message').forEach(el => el.textContent = '');

    if (!emailRegex.test(email)) {
        document.getElementById('register-email-error').textContent = 'Email inválido';
        isValid = false;
    }
    if (password.length < 6) {
        document.getElementById('register-password-error').textContent = 'Mínimo 6 caracteres';
        isValid = false;
    }
    if (username.length < 3) {
        document.getElementById('username-error').textContent = 'Mínimo 3 caracteres';
        isValid = false;
    }
    if (!birthdate) {
        document.getElementById('birthdate-error').textContent = 'Fecha requerida';
        isValid = false;
    }

    return isValid;
}

// Manejo de errores
function handleAuthError(error) {
    authMessage.style.color = '#c62828';
    
    const errorMessages = {
        'auth/email-already-in-use': 'El email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'default': 'Error: ' + error.message
    };

    authMessage.textContent = errorMessages[error.code] || errorMessages['default'];
}