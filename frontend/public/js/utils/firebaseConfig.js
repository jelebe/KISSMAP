// frontend/public/js/firebaseConfig.js

// Importar dotenv para cargar variables de entorno
import * as dotenv from 'dotenv';
dotenv.config();

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
const app = initializeApp(firebaseConfig);

// Exportar instancias de Firebase
export const auth = app.auth();
export const db = app.firestore();
export const storage = app.storage();