import { obtenerHorarios, obtenerProfesionales, obtenerOcupados } from "./cargarDatos.js";
import { habilitarBoton, guardarEleccion } from "./funciones.js";

const idProfesional = sessionStorage.getItem("profesional");

// Sin profesional elegido no se pueden consultar los horarios: se vuelve al paso anterior
if (!idProfesional) {
    window.location.replace("./profesional.html");
}

const lista = document.querySelector("#lista-horarios");
const aviso = document.querySelector("#aviso-disponibilidad");
const boton = document.querySelector(".formulario-seleccion button");

habilitarBoton(lista, boton);
guardarEleccion(lista, "horario");

// Un turno esta ocupado si se superpone con algun evento del profesional
// (las fechas "AAAA-MM-DDTHH:MM" se pueden comparar como texto)
function estaOcupado(turno, ocupados) {
    return ocupados.some((evento) => evento.inicio < turno.fin && evento.fin > turno.inicio);
}

async function mostrarHorarios() {
    try {
        const horarios = await obtenerHorarios();
        let ocupados = [];

        // Si no se puede consultar la disponibilidad, se muestran todos los horarios
        // y el servicio verifica el turno al confirmarlo
        try {
            const profesionales = await obtenerProfesionales();
            const profesional = profesionales.find((p) => p.id === idProfesional);

            if (profesional) {
                const primerDia = horarios[0].fecha;
                const ultimoDia = horarios[horarios.length - 1].fecha;

                ocupados = await obtenerOcupados(profesional, primerDia, ultimoDia);
            }
        } catch (error) {
            console.error("No se pudo verificar la disponibilidad:", error);
            aviso.textContent = "No se pudo verificar la disponibilidad. Se confirmara al reservar el turno.";
        }

        let horariosHTML = ``;

        horarios.forEach((dia) => {
            let turnosHTML = ``;

            dia.turnos.forEach((turno) => {
                const ocupado = estaOcupado(turno, ocupados);

                turnosHTML += `
                    <input type="radio" name="turno" id="id-${turno.id}" value="${turno.id}" ${ocupado ? "disabled" : ""}>
                    <label for="id-${turno.id}" ${ocupado ? 'title="Horario ocupado"' : ""}>${turno.hora}</label>
                `;
            });

            horariosHTML += `
                <li>
                    <span class="dia">${dia.dia}</span>
                    ${turnosHTML}
                </li>
            `;
        });

        lista.innerHTML = horariosHTML;
    } catch (error) {
        console.error("Error al cargar los horarios:", error);
        lista.innerHTML = `<li>No se pudieron cargar los horarios. Intente nuevamente.</li>`;
    }
}

mostrarHorarios();
