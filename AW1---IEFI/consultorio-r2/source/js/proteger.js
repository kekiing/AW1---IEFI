import { obtenerUsuarioActivo } from "./usuarios.js";

if (!obtenerUsuarioActivo()) {
    window.location.replace("./index.html");
}
