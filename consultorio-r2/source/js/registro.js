import { buscarUsuarioPorCorreo, guardarUsuario, generarHash } from "./usuarios.js";

const formulario = document.querySelector(".formulario-datos");
const mensaje = document.querySelector("#mensaje-registro");

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? "mensaje-estado mensaje-error" : "mensaje-estado mensaje-exito";
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);

    const nombre = datos.get("nombre").trim();
    const apellido = datos.get("apellido").trim();
    const dni = datos.get("dni").trim();
    const obraSocial = datos.get("obra_social").trim();
    const telefono = datos.get("telefono").trim();
    const correo = datos.get("correo").trim().toLowerCase();
    const password = datos.get("password");
    const passwordConfirmar = datos.get("password_confirmar");

    if (nombre.length < 2 || apellido.length < 2) {
        mostrarMensaje("El nombre y el apellido deben tener al menos 2 letras.", true);
        return;
    }

    if (password !== passwordConfirmar) {
        mostrarMensaje("Las contraseñas no coinciden.", true);
        return;
    }

    if (buscarUsuarioPorCorreo(correo)) {
        mostrarMensaje("Ya existe una cuenta con ese correo electronico.", true);
        return;
    }

    try {
        const passwordHash = await generarHash(password, correo);

        guardarUsuario({
            nombre: nombre,
            apellido: apellido,
            dni: dni,
            obraSocial: obraSocial,
            telefono: telefono,
            correo: correo,
            passwordHash: passwordHash,
        });

        mostrarMensaje("Cuenta creada correctamente. Redirigiendo al inicio de sesion...", false);
        formulario.reset();

        setTimeout(() => {
            window.location.href = "./index.html";
        }, 1500);
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        mostrarMensaje("No se pudo crear la cuenta. Intente nuevamente.", true);
    }
});
