import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Generar UUIDs
    const userId = uuidv4();
    const urlId = uuidv4();
    
    // Obtener valores del formulario
    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        username: document.getElementById('username').value,
        fullname: document.getElementById('fullname').value,
        age: parseInt(document.getElementById('age').value),
        phone_prefix: document.getElementById('phone-prefix').value,
        phone: document.getElementById('phone').value,
        description: document.getElementById('description').value,
        profile_picture: null
    };

    // Validación
    if (!validateForm(userData)) return;

    try {
        // Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        
        // Subir imagen de perfil si existe
        const profileFile = document.getElementById('profile-picture').files[0];
        if (profileFile) {
            const storageRef = ref(storage, `profile_images/${urlId}`);
            await uploadBytes(storageRef, profileFile);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Guardar en DM_USERPROFILEURL
            await setDoc(doc(db, "DM_USERPROFILEURL", urlId), {
                urlId: urlId,
                userId: userId,
                userProfileUrlId: downloadURL,
                created_at: new Date()
            });
            
            userData.profile_picture = urlId;
        }

        // Guardar en DM_CUSTOMER
        await setDoc(doc(db, "DM_CUSTOMER", userId), {
            userId: userId,
            nameProfile: userData.username,
            nameUser: userData.fullname,
            ageUser: userData.age,
            phone_number_prefix: userData.phone_prefix,
            phone_number: userData.phone,
            email: userData.email,
            description: userData.description,
            profile_picture: userData.profile_picture,
            created_at: new Date()
        });

        window.location.href = 'profile_page.html';

    } catch (error) {
        handleError(error);
    }
});

function validateForm(data) {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9}$/;

    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (!emailRegex.test(data.email)) {
        document.getElementById('email-error').textContent = 'Email inválido';
        isValid = false;
    }
    if (data.password.length < 6) {
        document.getElementById('password-error').textContent = 'Mínimo 6 caracteres';
        isValid = false;
    }
    if (data.username.length < 3) {
        document.getElementById('username-error').textContent = 'Mínimo 3 caracteres';
        isValid = false;
    }
    if (data.fullname.length < 5) {
        document.getElementById('fullname-error').textContent = 'Nombre completo requerido';
        isValid = false;
    }
    if (data.age < 13 || data.age > 120) {
        document.getElementById('age-error').textContent = 'Edad inválida (13-120)';
        isValid = false;
    }
    if (!phoneRegex.test(data.phone)) {
        document.getElementById('phone-error').textContent = 'Teléfono inválido (9 dígitos)';
        isValid = false;
    }

    return isValid;
}

function handleError(error) {
    const authMessage = document.getElementById('auth-message');
    authMessage.style.color = '#c62828';
    
    const errorMessages = {
        'auth/email-already-in-use': 'El email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'Contraseña débil (mínimo 6 caracteres)',
        'default': 'Error: ' + error.message
    };

    authMessage.textContent = errorMessages[error.code] || errorMessages['default'];
    window.scrollTo(0, 0);
}