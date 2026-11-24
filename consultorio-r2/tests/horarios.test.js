import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
    convertirAMinutos,
    formatearFecha,
    formatearHora,
    generarHorarios,
    generarTurnos,
} from "../source/js/horarios.js";

const configuracion = {
    inicioJornada: "08:00",
    finJornada: "18:00",
    duracionMinutos: 90,
    diasAMostrar: 5,
    diasLaborables: [1, 2, 3, 4, 5],
};

describe("formatearHora", () => {
    test("convierte minutos en texto HH:MM con ceros a la izquierda", () => {
        assert.equal(formatearHora(480), "08:00");
        assert.equal(formatearHora(570), "09:30");
        assert.equal(formatearHora(1050), "17:30");
    });

    test("es la operacion inversa de convertirAMinutos", () => {
        assert.equal(formatearHora(convertirAMinutos("15:30")), "15:30");
    });
});

describe("convertirAMinutos", () => {
    test("convierte HH:MM en minutos desde la medianoche", () => {
        assert.equal(convertirAMinutos("00:00"), 0);
        assert.equal(convertirAMinutos("08:00"), 480);
        assert.equal(convertirAMinutos("15:30"), 930);
    });
});

describe("formatearFecha", () => {
    test("devuelve AAAA-MM-DD con la fecha local y ceros a la izquierda", () => {
        assert.equal(formatearFecha(new Date(2026, 10, 5)), "2026-11-05");
        assert.equal(formatearFecha(new Date(2026, 0, 31)), "2026-01-31");
    });
});

describe("generarTurnos", () => {
    test("genera 6 turnos de 90 minutos entre las 08:00 y las 18:00", () => {
        const turnos = generarTurnos("2026-11-24", configuracion);

        assert.deepEqual(
            turnos.map((turno) => turno.hora),
            ["08:00h", "09:30h", "11:00h", "12:30h", "14:00h", "15:30h"]
        );
    });

    test("cada turno tiene identificador unico, inicio y fin con la fecha", () => {
        const turnos = generarTurnos("2026-11-24", configuracion);

        assert.deepEqual(turnos[0], {
            id: "2026-11-24-0800",
            hora: "08:00h",
            inicio: "2026-11-24T08:00",
            fin: "2026-11-24T09:30",
        });
        assert.equal(new Set(turnos.map((turno) => turno.id)).size, turnos.length);
    });

    test("ningun turno termina despues del fin de la jornada", () => {
        const turnos = generarTurnos("2026-11-24", configuracion);
        const ultimo = turnos[turnos.length - 1];

        assert.equal(ultimo.fin, "2026-11-24T17:00");

        for (const turno of turnos) {
            assert.ok(turno.fin.slice(11) <= "18:00");
        }
    });

    test("respeta otra duracion configurada", () => {
        const turnos = generarTurnos("2026-11-24", { ...configuracion, duracionMinutos: 60 });
        assert.equal(turnos.length, 10);
    });

    test("devuelve una lista vacia si la duracion no es valida", () => {
        assert.deepEqual(generarTurnos("2026-11-24", { ...configuracion, duracionMinutos: 0 }), []);
    });
});

describe("generarHorarios", () => {
    test("desde un viernes ofrece de lunes a viernes de la semana siguiente", () => {
        const dias = generarHorarios(configuracion, new Date(2026, 10, 20)); // viernes 20/11/2026

        assert.deepEqual(
            dias.map((dia) => dia.dia),
            ["Lunes 23/11", "Martes 24/11", "Miercoles 25/11", "Jueves 26/11", "Viernes 27/11"]
        );
        assert.equal(dias[0].fecha, "2026-11-23");
    });

    test("no incluye sabados ni domingos y salta el fin de semana", () => {
        const dias = generarHorarios(configuracion, new Date(2026, 10, 23)); // lunes 23/11/2026

        assert.equal(dias[dias.length - 1].dia, "Lunes 30/11");

        for (const dia of dias) {
            const diaSemana = new Date(`${dia.fecha}T00:00:00`).getDay();
            assert.ok(diaSemana >= 1 && diaSemana <= 5);
        }
    });

    test("nunca ofrece el dia de la fecha base: empieza al dia siguiente", () => {
        const dias = generarHorarios(configuracion, new Date(2026, 10, 23));
        assert.equal(dias[0].fecha, "2026-11-24");
    });

    test("cada dia trae sus 6 turnos con fecha real", () => {
        const dias = generarHorarios(configuracion, new Date(2026, 10, 20));

        for (const dia of dias) {
            assert.equal(dia.turnos.length, 6);
            assert.ok(dia.turnos.every((turno) => turno.inicio.startsWith(dia.fecha)));
        }
    });

    test("no modifica la fecha base recibida", () => {
        const base = new Date(2026, 10, 20);
        const copia = base.getTime();

        generarHorarios(configuracion, base);
        assert.equal(base.getTime(), copia);
    });

    test("devuelve una lista vacia si no hay dias laborables", () => {
        const dias = generarHorarios({ ...configuracion, diasLaborables: [] }, new Date(2026, 10, 20));
        assert.deepEqual(dias, []);
    });
});
