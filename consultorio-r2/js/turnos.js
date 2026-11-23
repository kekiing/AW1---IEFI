const claveTurnos = "turnos";

export function obtenerTurnos() {
    try {
        const guardados = localStorage.getItem(claveTurnos);
        return guardados ? JSON.parse(guardados) : [];
    } catch (error) {
        console.error("No se pudieron leer los turnos:", error);
        return [];
    }
}

export function obtenerTurnosDeUsuario(correo) {
    return obtenerTurnos().filter((turno) => turno.correoPaciente === correo);
}

export function guardarTurno(turno) {
    const turnos = obtenerTurnos();
    turnos.push(turno);
    localStorage.setItem(claveTurnos, JSON.stringify(turnos));
}
