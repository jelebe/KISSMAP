// frontend/public/js/profile_setup.js

// Importar Firebase desde firebaseConfig.js
import { auth, db, storage } from '../js/firebaseConfig.js';
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Importar configuración
import { CONFIG } from '../js/config.js';

// Mostrar email y username en la interfaz
document.addEventListener('DOMContentLoaded', () => {
    const displayEmailElement = document.getElementById('display-email');
    const displayUsernameElement = document.getElementById('display-username');
    const email = localStorage.getItem('email') || 'No disponible';
    const username = localStorage.getItem('username') || 'No disponible';
    displayEmailElement.textContent = email;
    displayUsernameElement.textContent = username;
});

// Validaciones adicionales
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
}

function validateBirthdate(birthdate) {
    const today = new Date();
    const selectedDate = new Date(birthdate);
    return selectedDate < today && selectedDate.getFullYear() >= 1900;
}

// Función para comprimir y cargar imágenes
function compressAndUploadImage(file, user) {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject(new Error('El usuario no está autenticado.'));
            return;
        }
        new Compressor(file, {
            quality: 0.8,
            success(result) {
                const storageRef = ref(storage, `profiles/${user.uid}/${result.name}`);
                const uploadTask = uploadBytesResumable(storageRef, result);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Carga de imagen: ${progress}%`);
                    },
                    (error) => {
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            },
            error(err) {
                reject(err);
            }
        });
    });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const email = localStorage.getItem('email');
        const password = localStorage.getItem('password');
        const username = localStorage.getItem('username');
        const fullname = document.getElementById('fullname')?.value?.trim() || '';
        const birthdate = document.getElementById('birthdate')?.value || '';
        const phone = document.getElementById('phone')?.value?.trim() || '';
        const description = document.getElementById('description')?.value?.trim() || '';
        const profilePictureInput = document.getElementById('profile-picture');

        // Validación de campos
        if (!fullname) {
            alert('El nombre completo es obligatorio.');
            return;
        }
        if (!validateBirthdate(birthdate)) {
            alert('La fecha de nacimiento debe ser válida y no puede ser futura.');
            return;
        }
        if (!validatePhone(phone)) {
            alert('El teléfono debe tener exactamente 9 dígitos.');
            return;
        }

        let profilePictureUrl = 'default.jpg';

        try {
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Subir la foto de perfil
            if (profilePictureInput?.files[0]) {
                profilePictureUrl = await compressAndUploadImage(profilePictureInput.files[0], user);
            }

            // Guardar datos completos en Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username,
                email,
                created_at: new Date(),
                profileComplete: true,
                fullname,
                birthdate,
                phone,
                description,
                profile_picture: profilePictureUrl
            });

            // Guardar el nombre de usuario en la colección 'usernames'
            await setDoc(doc(db, 'usernames', username), {
                uid: user.uid
            });

            // Redirigir a la página principal del perfil
            window.location.href = `${CONFIG.BASE_URL}/profile_page.html`;
        } catch (error) {
            console.error('Error al completar el perfil:', error);
            alert('Ocurrió un error al completar tu perfil.');
        }
    });
});