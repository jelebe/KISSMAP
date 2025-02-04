
// frontend/public/js/firebaseConfig.js

// Importar Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDvCRxaQn27ElJUX9TP8bVZdICCTXpr0_w",
    authDomain: "kissmap-63e5c.firebaseapp.com",
    projectId: "kissmap-63e5c",
    storageBucket: "kissmap-63e5c.firebasestorage.app",
    messagingSenderId: "1019969866748",
    appId: "1:1019969866748:web:1b3ae170b1b11bfcf10079",
    measurementId: "G-B7Q73R8WX8"
};

//export default firebaseConfig;

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instancias de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
