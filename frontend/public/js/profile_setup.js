import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        console.error('El usuario no está autenticado.');
        alert('Debes iniciar sesión para completar tu perfil.');
        window.location.href = '/login.html';
        return;
    }

    const fullname = document.getElementById('fullname').value;
    const birthdate = document.getElementById('birthdate').value;
    const phone = document.getElementById('phone').value;
    const description = document.getElementById('description').value;
    const profilePictureInput = document.getElementById('profile-picture');
    let profilePictureUrl = 'default.jpg';

    try {
        if (profilePictureInput.files[0]) {
            const file = profilePictureInput.files[0];

            // Usar CompressorJS para optimizar la imagen
            new Compressor(file, {
                quality: 0.8, // Calidad de compresión (0-1)
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
                            console.error('Error al cargar la imagen:', error);
                            alert('Ocurrió un error al cargar tu foto de perfil.');
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            profilePictureUrl = downloadURL;
                        }
                    );
                },
                error(err) {
                    console.error('Error al comprimir la imagen:', err.message);
                    alert('Ocurrió un error al procesar tu foto de perfil.');
                }
            });
        }

        // Esperar a que la imagen se cargue completamente
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulación de espera (opcional)

        // Actualizar los datos del usuario en Firestore
        await updateDoc(doc(db, 'users', user.uid), {
            fullname,
            birthdate,
            phone,
            description,
            profile_picture: profilePictureUrl,
            profileComplete: true
        });

        // Redirigir a la página principal del perfil
        window.location.href = 'frontend/public/profile_page.html';
    } catch (error) {
        console.error('Error al completar el perfil:', error);
        alert('Ocurrió un error al completar tu perfil.');
    }
});