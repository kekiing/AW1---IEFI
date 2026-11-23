import { tratamientos } from "./datos/tratamientos.js";
import { profesionales } from "./datos/profesionales.js";
import { horarios } from "./datos/horarios.js";
import { urlServicioTurnos } from "./datos/configuracion.js";
import { obtenerUsuarioActivo } from "./usuarios.js";
import { guardarTurno } from "./turnos.js";

const idTratamiento = sessionStorage.getItem("tratamiento");
const idProfesional = sessionStorage.getItem("profesional");
const idHorario = sessionStorage.getItem("horario");

const tratamiento = tratamientos.find((t) => t.id === idTratamiento);
const profesional = profesionales.find((p) => p.id === idProfesional);
const usuario = obtenerUsuarioActivo();

let diaElegido = null;
let turnoElegido = null;

horarios.forEach((dia) => {
    const turno = dia.turnos.find((t) => t.id === idHorario);
    if (turno) {
        diaElegido = dia;
        turnoElegido = turno;
    }
});

const textoHorario = turnoElegido
    ? `${diaElegido.dia} - ${turnoElegido.hora}`
    : "No seleccionado";

// --- Resumen en pantalla ---
document.querySelector("#resumen-paciente").textContent =
    usuario ? `${usuario.nombre} ${usuario.apellido}` : "No identificado";

document.querySelector("#resumen-telefono").textContent =
    usuario ? usuario.telefono : "No disponible";

document.querySelector("#resumen-correo").textContent =
    usuario ? usuario.correo : "No disponible";

document.querySelector("#resumen-tratamiento").textContent =
    tratamiento ? tratamiento.nombre : "No seleccionado";

document.querySelector("#resumen-profesional").textContent =
    profesional ? profesional.nombre : "No seleccionado";

document.querySelector("#resumen-horario").textContent = textoHorario;

// --- Confirmacion del turno ---
const botonConfirmar = document.querySelector("#boton-confirmar");
const mensaje = document.querySelector("#mensaje-confirmacion");
const textoBotonOriginal = botonConfirmar.textContent;

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? "mensaje-estado mensaje-error" : "mensaje-estado mensaje-exito";
}

function restaurarBoton() {
    botonConfirmar.disabled = false;
    botonConfirmar.textContent = textoBotonOriginal;
}

botonConfirmar.addEventListener("click", async () => {
    if (!usuario || !tratamiento || !profesional || !turnoElegido) {
        mostrarMensaje("Faltan datos del turno. Vuelva al inicio y seleccionelos nuevamente.", true);
        return;
    }

    if (!urlServicioTurnos.startsWith("https://script.google.com/macros/s/")) {
        mostrarMensaje("El servicio de turnos no esta configurado.", true);
        return;
    }

    botonConfirmar.disabled = true;
    botonConfirmar.textContent = "ENVIANDO...";
    mostrarMensaje("", false);

    const datos = {
        paciente: `${usuario.nombre} ${usuario.apellido}`,
        correo: usuario.correo,
        telefono: usuario.telefono,
        tratamiento: tratamiento.nombre,
        profesional: profesional.nombre,
        profesionalId: profesional.id,
        inicio: turnoElegido.inicio,
        fin: turnoElegido.fin,
    };

    try {
        // text/plain evita la solicitud previa (preflight) de CORS que Apps Script no admite
        const respuesta = await fetch(urlServicioTurnos, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(datos),
        });

        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        if (!resultado.ok) {
            mostrarMensaje(resultado.mensaje, true);
            restaurarBoton();
            return;
        }

        guardarTurno({
            id: `${profesional.id}-${turnoElegido.id}`,
            correoPaciente: usuario.correo,
            dia: diaElegido.dia,
            hora: turnoElegido.hora,
            inicio: turnoElegido.inicio,
            fin: turnoElegido.fin,
            tratamiento: tratamiento.nombre,
            profesional: profesional.nombre,
        });

        sessionStorage.removeItem("tratamiento");
        sessionStorage.removeItem("profesional");
        sessionStorage.removeItem("horario");

        mostrarMensaje("Turno confirmado. Recibira una invitacion en su correo electronico.", false);

        setTimeout(() => {
            window.location.href = "./misTurnos.html";
        }, 2500);
    } catch (error) {
        console.error("Error al confirmar el turno:", error);
        mostrarMensaje("No se pudo confirmar el turno. Intente nuevamente.", true);
        restaurarBoton();
    }
});
