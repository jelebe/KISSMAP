import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import firebaseConfig from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    clearErrors();

    // Obtener valores del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const username = document.getElementById('username').value.trim();

    // Validar campos
    if (!validateForm(email, password, username)) return;

    try {
        // Verificar si el correo ya existe
        const emailQuery = await fetchEmailQuery(email);
        if (emailQuery.exists) {
            throw { code: 'auth/email-already-in-use' };
        }

        // Verificar si el nombre de usuario ya existe
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
            throw { code: 'auth/username-in-use' };
        }

        // Si todo está bien, almacenar datos en localStorage y redirigir
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        localStorage.setItem('username', username);

        window.location.href = 'kissmap/frontend/public/profile_setup.html';
    } catch (error) {
        handleError(error);
    }
});

// Función para validar el formulario
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

    if (username.length < 3) {
        showError('username-error', 'Mínimo 3 caracteres');
        isValid = false;
    }

    return isValid;
}

// Función para verificar si un correo ya existe
async function fetchEmailQuery(email) {
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("email", "==", email)); // Consulta filtrada
        const querySnapshot = await getDocs(q);

        return { exists: !querySnapshot.empty }; // Si hay resultados, el correo existe
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        return { exists: false }; // En caso de error, asumimos que no existe
    }
}

// Manejo de errores
function handleError(error) {
    const errorMap = {
        'auth/email-already-in-use': 'El email ya está registrado',
        'auth/username-in-use': 'El nombre de usuario ya existe'
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