

import { Usuario } from './clases.js';

const BACKEND_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }

    if (window.location.hash === '#register' && registerForm && loginForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
});


async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    if (!usernameInput || !passwordInput) {
        console.error("Inputs de usuario o contraseña de login no encontrados.");
        alert("Error interno: Faltan elementos del formulario de login.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Por favor, ingresa tu usuario y contraseña.');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/usuarios`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const usuariosData = await response.json();
        const usuarios = usuariosData.map(data => Usuario.fromJSON(data));

        const usuarioAutenticado = usuarios.find(
            (u) => u.username === username && u.validarCredenciales(password)
        );

        if (usuarioAutenticado) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(usuarioAutenticado.toJSON()));
            alert('¡Login exitoso!');
            window.location.href = 'app.html';
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error('Error durante el login:', error);
        alert('Hubo un problema al intentar iniciar sesión. Asegúrate de que el servidor backend esté corriendo.');
    }
}

async function handleRegistration(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('register-username');
    const passwordInput = document.getElementById('register-password');

    if (!usernameInput || !passwordInput) {
        console.error("Inputs de usuario o contraseña de registro no encontrados.");
        alert("Error interno: Faltan elementos del formulario de registro.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Por favor, ingresa un usuario y contraseña para registrarte.');
        return;
    }

    const newUser = {
        username: username,
        password: password
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/usuarios/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al registrar: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        alert(`¡Registro exitoso! ${result.message}`);
        
        sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
        window.location.href = 'app.html';

    } catch (error) {
        console.error('Error durante el registro:', error);
        alert(error.message);
    }
}