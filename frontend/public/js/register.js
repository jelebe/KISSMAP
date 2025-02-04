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
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import firebaseConfig from './firebaseConfig.js';
import Compressor from 'compressorjs'; // Para optimizar imágenes

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const fullname = document.getElementById('fullname').value;
    const age = parseInt(document.getElementById('age').value, 10);
    const phonePrefix = document.getElementById('phone-prefix').value;
    const phone = document.getElementById('phone').value;
    const description = document.getElementById('description').value;
    const profilePictureInput = document.getElementById('profile-picture');
    let profilePictureUrl = 'frontend/public/images/usuario by  Aldo Cervantes.png'; // Valor por defecto si no se sube una imagen

    // Reset errores
    clearErrors();

    // Validación básica
    if (!validateForm(email, password, username, fullname, age, phone, profilePictureInput)) return;

    try {
        // Verificar si el username ya existe
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
            throw { code: 'auth/username-in-use' };
        }

        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Subir la imagen de perfil a Firebase Storage
        if (profilePictureInput.files[0]) {
            const file = profilePictureInput.files[0];
            new Compressor(file, {
                quality: 0.8, // Calidad de compresión (0-1)
                success(result) {
                    const storageRef = ref(storage, `profiles/${userCredential.user.uid}/${result.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, result);

                    // Esperar a que la carga termine
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            document.getElementById('upload-progress').textContent = `Cargando... ${progress.toFixed(0)}%`;
                        },
                        (error) => {
                            handleError(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            profilePictureUrl = downloadURL; // Actualizar URL de la imagen
                        }
                    );
                },
                error(err) {
                    console.error(err.message);
                }
            });
        }

        // Guardar datos en Firestore
        await Promise.all([
            setDoc(doc(db, 'users', userCredential.user.uid), {
                username,
                email,
                fullname,
                age,
                phonePrefix,
                phone,
                description,
                profile_picture: profilePictureUrl,
                created_at: new Date(),
                profileComplete: false,
                kisses: [] // Lista de besos localizados
            }),
            setDoc(doc(db, 'usernames', username), {
                uid: userCredential.user.uid
            })
        ]);

        // Redirección condicional
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.data().profileComplete) {
            window.location.href = 'frontend/public/profile_page.html';
        } else {
            window.location.href = 'frontend/public/profile_setup.html';
        }
    } catch (error) {
        handleError(error);
    }
});

function validateForm(email, password, username, fullname, age, phone, profilePictureInput) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

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
    if (!fullname.trim()) {
        showError('fullname-error', 'Nombre completo requerido');
        isValid = false;
    }
    if (age < 13 || age > 120) {
        showError('age-error', 'Edad no válida (13-120)');
        isValid = false;
    }
    if (!phone.match(phoneRegex)) {
        showError('phone-error', 'Teléfono inválido (formato: +XXYYYYYYYY)');
        isValid = false;
    }
    if (profilePictureInput.files.length === 0) {
        showError('profile-picture-error', 'Selecciona una foto de perfil');
        isValid = false;
    }

    return isValid;
}

function handleError(error) {
    const errorMap = {
        'auth/email-already-in-use': 'El email ya está registrado',
        'auth/username-in-use': 'El nombre de usuario ya existe',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'storage/unauthorized': 'No tienes permiso para cargar esta imagen',
        'storage/canceled': 'La carga de la imagen fue cancelada',
        'default': 'Error inesperado: ' + error.message
    };

    const message = errorMap[error.code] || errorMap['default'];
    showError('auth-message', message);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.color = '#c62828';
}