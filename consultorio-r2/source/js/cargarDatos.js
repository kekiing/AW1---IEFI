import { generarHorarios } from "./horarios.js";
import { urlServicioTurnos } from "./datos/configuracion.js";

// Las rutas locales son relativas a la pagina HTML que ejecuta el script
async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${ruta} (estado ${respuesta.status})`);
    }

    return respuesta.json();
}

export function obtenerTratamientos() {
    return cargarJSON("./js/datos/tratamientos.json");
}

export function obtenerProfesionales() {
    return cargarJSON("./js/datos/profesionales.json");
}

// El JSON define las reglas de la agenda; los turnos con fecha real se generan a partir de ellas
export async function obtenerHorarios() {
    const configuracion = await cargarJSON("./js/datos/horarios.json");
    return generarHorarios(configuracion);
}

// Consulta al servicio de Google los horarios ya reservados de un profesional (fechas AAAA-MM-DD)
export async function obtenerOcupados(profesional, desde, hasta) {
    const parametros = new URLSearchParams({
        accion: "ocupados",
        profesionalId: profesional.id,
        profesional: profesional.nombre,
        desde: desde,
        hasta: hasta,
    });

    const resultado = await cargarJSON(`${urlServicioTurnos}?${parametros}`);

    if (!resultado.ok) {
        throw new Error(resultado.mensaje);
    }

    return resultado.ocupados;
}
