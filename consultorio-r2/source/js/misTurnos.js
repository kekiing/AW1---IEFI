import { obtenerUsuarioActivo } from "./usuarios.js";
import { obtenerTurnosDeUsuario } from "./turnos.js";

const contenedor = document.querySelector("#lista-turnos");
const mensaje = document.querySelector("#mensaje-turnos");

const usuario = obtenerUsuarioActivo();
const turnos = usuario ? obtenerTurnosDeUsuario(usuario.correo) : [];

if (turnos.length === 0) {
    mensaje.textContent = "Todavia no tenes turnos registrados.";
} else {
    const ahora = new Date();

    // ordenados del mas cercano al mas lejano
    turnos.sort((a, b) => a.inicio.localeCompare(b.inicio));

    let turnosHTML = ``;

    turnos.forEach((turno) => {
        const estado = new Date(turno.inicio) < ahora ? "Realizado" : "Proximo";

        turnosHTML += `
            <dl class="resumen-turno">
                <dt>Estado</dt>
                <dd>${estado}</dd>

                <dt>Fecha</dt>
                <dd>${turno.dia} - ${turno.hora}</dd>

                <dt>Tratamiento</dt>
                <dd>${turno.tratamiento}</dd>

                <dt>Profesional</dt>
                <dd>${turno.profesional}</dd>
            </dl>
        `;
    });

    contenedor.innerHTML = turnosHTML;
}
