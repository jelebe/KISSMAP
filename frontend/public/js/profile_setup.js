import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import firebaseConfig from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
function compressAndUploadImage(file) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.8,
            success(result) {
                const storageRef = ref(storage, `profiles/${auth.currentUser.uid}/${result.name}`);
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

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
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
        if (profilePictureInput?.files[0]) {
            profilePictureUrl = await compressAndUploadImage(profilePictureInput.files[0]);
        }

        // Crear usuario en Firebase Auth (usando datos del registro previo)
        const user = auth.currentUser;
        if (!user) {
            console.error('El usuario no está autenticado.');
            alert('Debes iniciar sesión para completar tu perfil.');
            return;
        }

        // Guardar datos completos en Firestore
        await setDoc(doc(db, 'users', user.uid), {
            fullname,
            birthdate,
            phone,
            description,
            profile_picture: profilePictureUrl,
            profileComplete: true
        });

        // Redirigir a la página principal del perfil
        window.location.href = 'index.html';//'frontend/public/profile_page.html';
    } catch (error) {
        console.error('Error al completar el perfil:', error);
        alert('Ocurrió un error al completar tu perfil.');
    }
});