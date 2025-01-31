import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import firebaseConfig from './firebaseConfig.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

const registerForm = document.getElementById('register-form');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const regEmailError = document.getElementById('reg-email-error');
const regPasswordError = document.getElementById('reg-password-error');

// Función para manejar el registro
registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    let valid = true;

    if (!regEmailInput.checkValidity()) {
        regEmailError.textContent = 'Por favor, introduce un correo electrónico válido.';
        regEmailError.style.display = 'block';
        valid = false;
    } else {
        regEmailError.style.display = 'none';
    }

    if (!regPasswordInput.checkValidity()) {
        regPasswordError.textContent = 'Por favor, introduce una contraseña válida.';
        regPasswordError.style.display = 'block';
        valid = false;
    } else {
        regPasswordError.style.display = 'none';
    }

    if (!valid) {
        return;
    }

    const email = regEmailInput.value;
    const password = regPasswordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario registrado:', user);
            document.getElementById('auth-message').textContent = 'Registro exitoso';
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('auth-message').textContent = `Error: ${errorMessage}`;
        });
});

// Función para manejar el inicio de sesión
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    let valid = true;

    if (!emailInput.checkValidity()) {
        emailError.textContent = 'Por favor, introduce un correo electrónico válido.';
        emailError.style.display = 'block';
        valid = false;
    } else {
        emailError.style.display = 'none';
    }

    if (!passwordInput.checkValidity()) {
        passwordError.textContent = 'Por favor, introduce una contraseña válida.';
        passwordError.style.display = 'block';
        valid = false;
    } else {
        passwordError.style.display = 'none';
    }

    if (!valid) {
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuario autenticado:', user);
            window.location.href = 'frontend/public/profile_page.html';
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('auth-message').textContent = `Error: ${errorMessage}`;
        });
});
