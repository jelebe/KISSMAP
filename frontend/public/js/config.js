//la intención es poner aquí todas las rutas base para tenerlo centralizado.

// frontend/public/js/config.js
// Detectar el entorno actual
const isGitHubPages = window.location.hostname.includes('github.io');
const isFirebaseHosting = window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com');

// Configurar las rutas según el entorno
const ROOT_URL = isGitHubPages ? '/kissmap/' : '/';
const PUBLIC_URL = isGitHubPages ? '/kissmap/frontend/public/' : '/';

// Exportar la configuración
export const CONFIG = {
    ROOT_URL,
    PUBLIC_URL,
};