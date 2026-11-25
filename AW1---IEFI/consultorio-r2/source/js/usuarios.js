import { usuarioDemo } from "./datos/usuarioDemo.js";

const claveUsuarios = "usuarios";
const claveSesion = "usuarioActivo";

export function obtenerUsuarios() {
    try {
        const guardados = localStorage.getItem(claveUsuarios);
        return guardados ? JSON.parse(guardados) : [];
    } catch (error) {
        console.error("No se pudieron leer los usuarios:", error);
        return [];
    }
}

export function buscarUsuarioPorCorreo(correo) {
    const correoNormalizado = correo.trim().toLowerCase();
    return obtenerUsuarios().find((usuario) => usuario.correo === correoNormalizado);
}

export function guardarUsuario(usuario) {
    const usuarios = obtenerUsuarios();
    usuarios.push(usuario);
    localStorage.setItem(claveUsuarios, JSON.stringify(usuarios));
}

// Reemplaza el hash de la contraseña de un usuario existente. Devuelve false si el correo no esta registrado
export function actualizarPassword(correo, passwordHash) {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find((u) => u.correo === correoNormalizado);

    if (!usuario) {
        return false;
    }

    usuario.passwordHash = passwordHash;
    localStorage.setItem(claveUsuarios, JSON.stringify(usuarios));
    return true;
}

// Convierte la contraseña en un hash SHA-256 para no guardarla en texto plano
export async function generarHash(password, correo) {
    const texto = `${correo.trim().toLowerCase()}:${password}`;
    const bytes = new TextEncoder().encode(texto);
    const resumen = await crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(resumen))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Crea la cuenta de demostracion si todavia no existe en este navegador
export async function precargarUsuarioDemo() {
    if (buscarUsuarioPorCorreo(usuarioDemo.correo)) {
        return;
    }

    const passwordHash = await generarHash(usuarioDemo.password, usuarioDemo.correo);

    guardarUsuario({
        nombre: usuarioDemo.nombre,
        apellido: usuarioDemo.apellido,
        dni: usuarioDemo.dni,
        obraSocial: usuarioDemo.obraSocial,
        telefono: usuarioDemo.telefono,
        correo: usuarioDemo.correo,
        passwordHash: passwordHash,
    });
}

// Sesion activa: solo se guarda el correo, nunca la contraseña ni su hash
export function guardarSesion(correo) {
    sessionStorage.setItem(claveSesion, correo);
}

export function obtenerUsuarioActivo() {
    const correo = sessionStorage.getItem(claveSesion);
    return correo ? buscarUsuarioPorCorreo(correo) : null;
}

// Borra la sesion y tambien las elecciones de la reserva en curso
export function cerrarSesion() {
    sessionStorage.clear();
}
