import { obtenerTratamientos } from "./cargarDatos.js";
import { habilitarBoton, guardarEleccion } from "./funciones.js";

const lista = document.querySelector("#lista-tratamientos");
const boton = document.querySelector(".formulario-seleccion button");

habilitarBoton(lista, boton);
guardarEleccion(lista, "tratamiento");

// Al cambiar de tratamiento se descartan el profesional y el horario elegidos antes,
// porque el profesional depende del tratamiento
lista.addEventListener("change", () => {
    sessionStorage.removeItem("profesional");
    sessionStorage.removeItem("horario");
});

async function mostrarTratamientos() {
    try {
        const tratamientos = await obtenerTratamientos();

        let tratamientosHTML = ``;

        // sumar por cada tratamiento
        tratamientos.forEach((tratamiento) => {
            tratamientosHTML += `
                <li>
                    <input type="radio" name="tratamiento" id="id-${tratamiento.id}" value="${tratamiento.id}">
                    <label for="id-${tratamiento.id}">${tratamiento.nombre}</label>
                </li>
            `;
        });

        lista.innerHTML = tratamientosHTML;
    } catch (error) {
        console.error("Error al cargar los tratamientos:", error);
        lista.innerHTML = `<li>No se pudieron cargar los tratamientos. Intente nuevamente.</li>`;
    }
}

mostrarTratamientos();
