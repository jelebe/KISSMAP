import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    try {
        await updateDoc(doc(db, 'users', user.uid), {
            birthdate: document.getElementById('birthdate').value,
            phone: document.getElementById('phone').value,
            phonePrefix: document.getElementById('phone-prefix').value,
            profileComplete: true
        });

        window.location.href = 'frontend/public/profile_page.html'; // Redirigir a la página principal
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Ocurrió un error al completar tu perfil.');
    }
});