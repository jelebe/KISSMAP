// src/components/Login.js

import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importa Firebase desde firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState({ text: '', color: '' });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthMessage({ text: 'Por favor, completa todos los campos.', color: '#c62828' });
      return;
    }

    try {
      // Iniciar sesión con correo y contraseña
      await signInWithEmailAndPassword(auth, email, password);

      // Obtener los datos del usuario desde Firestore
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verificar si el perfil está completo
        if (userData.profileComplete) {
          // Redirigir a la página de perfil si el perfil está completo
          window.location.href = '/profile_page.html'; // Ajusta según tu estructura
        } else {
          // Redirigir a la página de configuración de perfil si no está completo
          window.location.href = '/profile_setup.html'; // Ajusta según tu estructura
        }
      } else {
        console.error('No se encontraron datos de usuario.');
        setAuthMessage({ text: 'Ocurrió un error al iniciar sesión.', color: '#c62828' });
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Manejo de errores
  const handleAuthError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'default': 'Error: ' + error.message,
    };

    setAuthMessage({
      text: errorMessages[error.code] || errorMessages['default'],
      color: '#c62828',
    });
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Iniciar Sesión</button>
      </form>

      {/* Mensaje de autenticación */}
      {authMessage.text && (
        <p style={{ color: authMessage.color }}>{authMessage.text}</p>
      )}

      {/* Enlace a registro */}
      <div className="auth-links">
        <p>
          ¿No tienes cuenta?{' '}
          <a href="/register.html">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}

export default Login;