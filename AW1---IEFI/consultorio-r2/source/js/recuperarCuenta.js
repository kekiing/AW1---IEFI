import { actualizarPassword, buscarUsuarioPorCorreo, generarHash } from "./usuarios.js";

const formularioVerificacion = document.querySelector("#formulario-verificacion");
const formularioPassword = document.querySelector("#formulario-nueva-password");
const textoIntroduccion = document.querySelector("#texto-introduccion");
const mensaje = document.querySelector("#mensaje-recuperacion");

// Correo cuya identidad ya fue verificada. Vive solo en memoria: al recargar la pagina se pierde
let correoVerificado = null;

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? "mensaje-estado mensaje-error" : "mensaje-estado mensaje-exito";
}

// Paso 1: se verifica la identidad con el correo y el DNI registrados
formularioVerificacion.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const datos = new FormData(formularioVerificacion);
    const correo = datos.get("correo").trim().toLowerCase();
    const dni = datos.get("dni").trim();

    try {
        const usuario = buscarUsuarioPorCorreo(correo);

        // El mismo aviso para correo inexistente o DNI incorrecto, para no revelar que cuentas existen
        if (!usuario || usuario.dni !== dni) {
            mostrarMensaje("Los datos ingresados no coinciden con ninguna cuenta.", true);
            return;
        }

        correoVerificado = usuario.correo;

        formularioVerificacion.hidden = true;
        formularioPassword.hidden = false;
        textoIntroduccion.textContent = "Identidad verificada. Ingresa tu nueva contraseña.";
        mostrarMensaje("", false);
    } catch (error) {
        console.error("Error al verificar la identidad:", error);
        mostrarMensaje("No se pudo verificar la identidad. Intente nuevamente.", true);
    }
});

// Paso 2: se guarda la nueva contraseña
formularioPassword.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!correoVerificado) {
        mostrarMensaje("Primero debe verificar su identidad.", true);
        return;
    }

    const datos = new FormData(formularioPassword);
    const password = datos.get("password");
    const passwordConfirmar = datos.get("password_confirmar");

    if (password !== passwordConfirmar) {
        mostrarMensaje("Las contraseñas no coinciden.", true);
        return;
    }

    try {
        const passwordHash = await generarHash(password, correoVerificado);

        if (!actualizarPassword(correoVerificado, passwordHash)) {
            mostrarMensaje("No se encontro la cuenta. Intente nuevamente.", true);
            return;
        }

        correoVerificado = null;
        formularioPassword.reset();
        formularioPassword.hidden = true;
        mostrarMensaje("Contraseña actualizada correctamente. Redirigiendo al inicio de sesion...", false);

        setTimeout(() => {
            window.location.href = "./index.html";
        }, 2000);
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        mostrarMensaje("No se pudo actualizar la contraseña. Intente nuevamente.", true);
    }
});
