// frontend/public/js/login.js

// Importar Firebase desde firebaseConfig.js
import { auth, db } from '../js/firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Manejar inicio de sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const authMessage = document.getElementById('auth-message');

    if (!email || !password) {
        authMessage.textContent = 'Por favor, completa todos los campos.';
        authMessage.style.color = '#c62828';
        return;
    }

    try {
        // Iniciar sesión con correo y contraseña
        await signInWithEmailAndPassword(auth, email, password);

        // Obtener los datos del usuario desde Firestore
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Verificar si el perfil está completo
            if (userData.profileComplete) {
                // Redirigir a profile_page.html si el perfil está completo
                window.location.href = 'profile_page.html';
            } else {
                // Redirigir a profile_setup.html si el perfil no está completo
                window.location.href = 'profile_setup.html';
            }
        } else {
            console.error('No se encontraron datos de usuario.');
            alert('Ocurrió un error al iniciar sesión.');
        }
    } catch (error) {
        handleAuthError(error);
    }
});

// Manejo de errores
function handleAuthError(error) {
    const authMessage = document.getElementById('auth-message');
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