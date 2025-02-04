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
        window.location.href = '/index.html';
        return;
    }

    const fullname = document.getElementById('fullname').value;
    const birthdate = document.getElementById('birthdate').value;
    const phone = document.getElementById('phone').value;
    const description = document.getElementById('description').value;
    const profilePictureInput = document.getElementById('profile-picture');
    let profilePictureUrl = 'frontend/public/images/usuario by  Aldo Cervantes.png';

    try {
        if (profilePictureInput.files[0]) {
            const file = profilePictureInput.files[0];
            const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Carga de imagen: ${progress}%`);
                    },
                    (error) => {
                        reject(error);
                    },
                    () => {
                        resolve(getDownloadURL(uploadTask.snapshot.ref));
                    }
                );
            }).then((downloadURL) => {
                profilePictureUrl = downloadURL;
            });
        }

        await updateDoc(doc(db, 'users', user.uid), {
            fullname,
            birthdate,
            phone,
            description,
            profile_picture: profilePictureUrl,
            profileComplete: true
        });

        window.location.href = 'frontend/public/profile_page.html';
    } catch (error) {
        console.error('Error al completar el perfil:', error);
        alert('Ocurrió un error al completar tu perfil.');
    }
});