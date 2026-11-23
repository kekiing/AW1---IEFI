import { obtenerProfesionales, obtenerTratamientos } from "./cargarDatos.js";
import { habilitarBoton, guardarEleccion } from "./funciones.js";

const idTratamiento = sessionStorage.getItem("tratamiento");

// sin tratamiento elegido no hay profesionales para mostrar. Vuelve atras
if (!idTratamiento) {
    window.location.replace("./tratamiento.html");
}

const lista = document.querySelector("#lista-profesionales");
const filtro = document.querySelector("#filtro-tratamiento");
const cantidad = document.querySelector("#cantidad-profesionales");
const boton = document.querySelector(".formulario-seleccion button");

let profesionales = [];

habilitarBoton(lista, boton);
guardarEleccion(lista, "profesional");

// si cambia de profesional cambia el horario disponiblem
lista.addEventListener("change", () => {
    sessionStorage.removeItem("horario");
});

// filtra  los profesionales disponibles segun el tratamiento que se busca
function mostrarProfesionales(idTratamientoFiltrado) {
    const profesionalesDisponibles = profesionales.filter((profesional) =>
        profesional.tratamientos.includes(idTratamientoFiltrado)
    );

    let profesionalesHTML = ``;

    profesionalesDisponibles.forEach((profesional) => {
        profesionalesHTML += `
            <li>
                <input type="radio" name="profesional" id="id-${profesional.id}" value="${profesional.id}">
                <label for="id-${profesional.id}">${profesional.nombre}</label><span class="matricula">Mat. Profesional ${profesional.matricula}</span>
            </li>
        `;
    });

    if (profesionalesDisponibles.length === 0) {
        profesionalesHTML = `<li>No hay profesionales disponibles para este tratamiento.</li>`;
    }

    lista.innerHTML = profesionalesHTML;

    cantidad.textContent = profesionalesDisponibles.length === 1
        ? "1 profesional disponible"
        : `${profesionalesDisponibles.length} profesionales disponibles`;

    // al volver a dibujar la lista no queda ninguna opcion marcada
    boton.disabled = true;
}

// al cambiar el filtro se actualiza el tratamiento elegido y se descartan
// el profesional y el horario, porque dependen del tratamiento
filtro.addEventListener("change", () => {
    sessionStorage.setItem("tratamiento", filtro.value);
    sessionStorage.removeItem("profesional");
    sessionStorage.removeItem("horario");

    mostrarProfesionales(filtro.value);
});

async function iniciar() {
    try {
        const [tratamientos, listaProfesionales] = await Promise.all([
            obtenerTratamientos(),
            obtenerProfesionales(),
        ]);

        profesionales = listaProfesionales;

        // opciones del filtro: todos los tratamientos, con el elegido en el paso anterior seleccionado
        let opcionesHTML = ``;

        tratamientos.forEach((tratamiento) => {
            const seleccionado = tratamiento.id === idTratamiento ? "selected" : "";
            opcionesHTML += `<option value="${tratamiento.id}" ${seleccionado}>${tratamiento.nombre}</option>`;
        });

        filtro.innerHTML = opcionesHTML;

        mostrarProfesionales(idTratamiento);
    } catch (error) {
        console.error("Error al cargar los profesionales:", error);
        lista.innerHTML = `<li>No se pudieron cargar los profesionales. Intente nuevamente.</li>`;
        cantidad.textContent = "";
    }
}

iniciar();
