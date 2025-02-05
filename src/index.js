// src/index.js

// Importa React y ReactDOM para renderizar la aplicación
import React from 'react';
import ReactDOM from 'react-dom';

// Importa el componente principal App
import App from './components/App';

// Importa los estilos globales (opcional)
import './assets/styles.css';

// Renderiza el componente App en el elemento con id "root"
ReactDOM.render(<App />, document.getElementById('root'));