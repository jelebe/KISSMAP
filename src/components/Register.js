// src/components/Register.js

import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importa Firebase desde firebase.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    const newErrors = {};
    if (!email) newErrors.email = 'El correo electrónico es obligatorio';
    if (!password) newErrors.password = 'La contraseña es obligatoria';
    if (!username) newErrors.username = 'El nombre de usuario es obligatorio';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      // Registrar el usuario con correo y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar información adicional del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        profileComplete: false, // El perfil no está completo por defecto
      });

      alert('Registro exitoso! Por favor, completa tu perfil.');
      // Redirigir al usuario a la página de configuración del perfil
      window.location.href = '/profile_setup.html'; // Ajusta según tu estructura
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Manejo de errores de autenticación
  const handleAuthError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'default': 'Error: ' + error.message,
    };

    alert(errorMessages[error.code] || errorMessages['default']);
  };

  return (
    <div className="login-container">
      <img
        src="%PUBLIC_URL%/images/KISSMAP_BLANK.png"
        alt="KissMap Logo"
        className="login-logo"
      />
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo de correo electrónico */}
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {errors.email && <span className="error-message">{errors.email}</span>}

        {/* Campo de contraseña */}
        <label htmlFor="password">Contraseña (mínimo 6 caracteres)</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && <span className="error-message">{errors.password}</span>}

        {/* Campo de nombre de usuario */}
        <label htmlFor="username">Nombre de Usuario</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {errors.username && <span className="error-message">{errors.username}</span>}

        {/* Botón de registro */}
        <button type="submit">Registrarse</button>
      </form>

      {/* Enlace a inicio de sesión */}
      <div className="auth-links">
        <p>
          ¿Ya tienes cuenta?{' '}
          <a href="/login.html">Inicia Sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register;