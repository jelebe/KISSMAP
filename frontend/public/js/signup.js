import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import firebaseConfig from './firebaseConfig.js';


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validación básica
    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = "Las contraseñas no coinciden";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Usuario registrado con éxito
            window.location.href = 'profile_page.html'; // Redirige al perfil
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "El correo ya está registrado";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Correo electrónico inválido";
                    break;
                case 'auth/weak-password':
                    errorMessage = "La contraseña debe tener al menos 6 caracteres";
                    break;
                default:
                    errorMessage = "Error al registrar usuario";
            }
            document.getElementById('auth-message').textContent = errorMessage;
        });
});

// Limpiar mensajes de error al escribir
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('auth-message').textContent = '';
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    });
});