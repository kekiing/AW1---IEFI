import { buscarUsuarioPorCorreo, generarHash, guardarSesion, precargarUsuarioDemo } from "./usuarios.js";

const formulario = document.querySelector(".formulario-datos");
const mensaje = document.querySelector("#mensaje-login");

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje-estado mensaje-error";
}

// Se crea la cuenta de demostracion al abrir la pagina; el envio del formulario espera a que termine
const preparacion = precargarUsuarioDemo().catch((error) => {
    console.error("No se pudo precargar la cuenta de demostracion:", error);
});

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const correo = datos.get("correo").trim().toLowerCase();
    const password = datos.get("password");

    try {
        await preparacion;

        const usuario = buscarUsuarioPorCorreo(correo);
        const passwordHash = await generarHash(password, correo);

        if (!usuario || usuario.passwordHash !== passwordHash) {
            mostrarError("Correo o contraseña incorrectos.");
            return;
        }

        guardarSesion(usuario.correo);
        window.location.href = "./tratamiento.html";
    } catch (error) {
        console.error("Error al iniciar sesion:", error);
        mostrarError("No se pudo iniciar sesion. Intente nuevamente.");
    }
});
