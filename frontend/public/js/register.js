import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import firebaseConfig from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Validaciones adicionales
function validateForm(email, password, username) {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email-error', 'Email inválido');
        isValid = false;
    }

    if (password.length < 6) {
        showError('password-error', 'Mínimo 6 caracteres');
        isValid = false;
    }

    if (username.length < 5) {
        showError('username-error', 'Mínimo 5 caracteres');
        isValid = false;
    }

    return isValid;
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    clearErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const username = document.getElementById('username').value.trim();

    if (!validateForm(email, password, username)) return;

    try {
        // Verificar si el username ya existe
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
            throw { code: 'auth/username-in-use' };
        }

        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Guardar datos básicos en Firestore
        await Promise.all([
            setDoc(doc(db, 'users', userCredential.user.uid), {
                username,
                email,
                created_at: new Date(),
                profileComplete: false
            }),
            setDoc(doc(db, 'usernames', username), {
                uid: userCredential.user.uid
            })
        ]);

        // Redirigir a la página de configuración de perfil
        window.location.href = 'frontend/public/profile_setup.html';
    } catch (error) {
        handleError(error);
    }
});

// Manejo de errores
function handleError(error) {
    const errorMap = {
        'auth/email-already-in-use': 'El email ya está registrado',
        'auth/username-in-use': 'El nombre de usuario ya existe',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres'
    };
    const message = errorMap[error.code] || 'Error al registrar: ' + error.message;
    showError('auth-message', message);
}

// Funciones auxiliares
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.color = '#c62828';
}