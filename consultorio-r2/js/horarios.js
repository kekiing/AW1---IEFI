const nombresDias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export function dosDigitos(numero) {
    return String(numero).padStart(2, "0");
}

// "08:30" -> 510 (minutos desde la medianoche)
export function convertirAMinutos(hora) {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
}

// 510 -> "08:30"
export function formatearHora(minutos) {
    return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
}

// devuelve "AAAA-MM-DD" usando la fecha local
export function formatearFecha(fecha) {
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

// turnos de un dia segun la configuracion (inicioJornada, finJornada, duracionMinutos)
export function generarTurnos(fecha, configuracion) {
    const inicioJornada = convertirAMinutos(configuracion.inicioJornada);
    const finJornada = convertirAMinutos(configuracion.finJornada);
    const duracion = configuracion.duracionMinutos;
    const turnos = [];

    if (duracion <= 0) {
        return turnos;
    }

    for (let inicio = inicioJornada; inicio + duracion <= finJornada; inicio += duracion) {
        const horaInicio = formatearHora(inicio);
        const horaFin = formatearHora(inicio + duracion);

        turnos.push({
            id: `${fecha}-${horaInicio.replace(":", "")}`,
            hora: `${horaInicio}h`,
            inicio: `${fecha}T${horaInicio}`,
            fin: `${fecha}T${horaFin}`,
        });
    }

    return turnos;
}

// proximos dias laborables a partir de manana, cada uno con sus turnos
export function generarHorarios(configuracion, fechaBase = new Date()) {
    const dias = [];

    if (configuracion.diasLaborables.length === 0) {
        return dias;
    }

    const actual = new Date(fechaBase);

    while (dias.length < configuracion.diasAMostrar) {
        actual.setDate(actual.getDate() + 1);

        const diaSemana = actual.getDay(); // 0 = domingo ... 6 = sabado
        if (!configuracion.diasLaborables.includes(diaSemana)) continue;

        const fecha = formatearFecha(actual);

        dias.push({
            dia: `${nombresDias[diaSemana]} ${dosDigitos(actual.getDate())}/${dosDigitos(actual.getMonth() + 1)}`,
            fecha: fecha,
            turnos: generarTurnos(fecha, configuracion),
        });
    }

    return dias;
}
