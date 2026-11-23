import { cerrarSesion } from "./usuarios.js";

const botonMisTurnos = document.querySelector("#boton-mis-turnos");
const botonCerrarSesion = document.querySelector("#boton-cerrar-sesion");

botonMisTurnos.addEventListener("click", () => {
    window.location.href = "./misTurnos.html";
});

botonCerrarSesion.addEventListener("click", () => {
    cerrarSesion();
    window.location.replace("./index.html");
});
