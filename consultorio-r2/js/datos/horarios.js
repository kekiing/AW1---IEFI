const nombresDias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

const inicioJornada = 8 * 60;   // 08:00, en minutos
const finJornada = 18 * 60;     // 18:00, en minutos
const duracionTurno = 90;       // minutos por turno
const diasAMostrar = 5;         // cantidad de dias habiles ofrecidos

function dosDigitos(numero) {
    return String(numero).padStart(2, "0");
}

function formatearHora(minutos) {
    return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
}

// Devuelve "AAAA-MM-DD" usando la fecha local (no UTC)
function formatearFecha(fecha) {
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

function generarTurnos(fecha) {
    const turnos = [];

    for (let inicio = inicioJornada; inicio + duracionTurno <= finJornada; inicio += duracionTurno) {
        const horaInicio = formatearHora(inicio);
        const horaFin = formatearHora(inicio + duracionTurno);

        turnos.push({
            id: `${fecha}-${horaInicio.replace(":", "")}`,
            hora: `${horaInicio}h`,
            inicio: `${fecha}T${horaInicio}`,
            fin: `${fecha}T${horaFin}`,
        });
    }

    return turnos;
}

function generarHorarios() {
    const dias = [];
    const actual = new Date();

    while (dias.length < diasAMostrar) {
        actual.setDate(actual.getDate() + 1);

        const diaSemana = actual.getDay(); // 0 = domingo ... 6 = sabado
        if (diaSemana === 0 || diaSemana === 6) continue;

        const fecha = formatearFecha(actual);

        dias.push({
            dia: `${nombresDias[diaSemana]} ${dosDigitos(actual.getDate())}/${dosDigitos(actual.getMonth() + 1)}`,
            fecha: fecha,
            turnos: generarTurnos(fecha),
        });
    }

    return dias;
}

export const horarios = generarHorarios();
