import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import firebaseConfig from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar el mapa
var map = L.map('map').setView([51.505, -0.09], 13);

// Añadir una capa de mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Función para obtener fotos desde Firestore
async function getPhotos() {
    const photosCol = collection(db, 'images');
    const photoSnapshot = await getDocs(photosCol);
    const photoList = photoSnapshot.docs.map(doc => doc.data());
    return photoList;
}

// Añadir marcadores al mapa
getPhotos().then(photos => {
    photos.forEach(photo => {
        var marker = L.marker([photo.lat, photo.lng]).addTo(map);
        marker.bindPopup('<img src="' + photo.imageUrl + '" alt="Photo" width="100" height="100">');
    });
});
