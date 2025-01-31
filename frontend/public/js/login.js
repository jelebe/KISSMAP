import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvCRxaQn27ElJUX9TP8bVZdICCTXpr0_w",
    authDomain: "kissmap-63e5c.firebaseapp.com",
    projectId: "kissmap-63e5c",
    storageBucket: "kissmap-63e5c.firebasestorage.app",
    messagingSenderId: "1019969866748",
    appId: "1:1019969866748:web:1b3ae170b1b11bfcf10079",
    measurementId: "G-B7Q73R8WX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');

    console.log('Email element:', emailElement);
    console.log('Password element:', passwordElement);

    if (!emailElement || !passwordElement) {
        console.error('Elemento(s) no encontrado(s)');
        return;
    }

    const email = emailElement.value;
    const password = passwordElement.value;

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
