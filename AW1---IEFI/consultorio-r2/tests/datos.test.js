import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function leerJSON(nombre) {
    const ruta = new URL(`../source/js/datos/${nombre}`, import.meta.url);
    return JSON.parse(await readFile(ruta, "utf8"));
}

describe("datos JSON del catalogo", () => {
    test("los identificadores de tratamientos y profesionales no se repiten", async () => {
        const tratamientos = await leerJSON("tratamientos.json");
        const profesionales = await leerJSON("profesionales.json");

        assert.equal(new Set(tratamientos.map((t) => t.id)).size, tratamientos.length);
        assert.equal(new Set(profesionales.map((p) => p.id)).size, profesionales.length);
    });

    test("cada profesional atiende solo tratamientos que existen", async () => {
        const tratamientos = await leerJSON("tratamientos.json");
        const profesionales = await leerJSON("profesionales.json");
        const idsValidos = new Set(tratamientos.map((t) => t.id));

        for (const profesional of profesionales) {
            assert.ok(profesional.tratamientos.length > 0, `${profesional.nombre} no tiene tratamientos`);

            for (const idTratamiento of profesional.tratamientos) {
                assert.ok(idsValidos.has(idTratamiento), `${profesional.nombre}: tratamiento inexistente "${idTratamiento}"`);
            }
        }
    });

    test("todo tratamiento tiene al menos un profesional que lo realiza", async () => {
        const tratamientos = await leerJSON("tratamientos.json");
        const profesionales = await leerJSON("profesionales.json");

        for (const tratamiento of tratamientos) {
            const atienden = profesionales.filter((p) => p.tratamientos.includes(tratamiento.id));
            assert.ok(atienden.length > 0, `Nadie realiza ${tratamiento.nombre}`);
        }
    });

    test("la configuracion de horarios es coherente", async () => {
        const configuracion = await leerJSON("horarios.json");

        assert.ok(configuracion.duracionMinutos > 0);
        assert.ok(configuracion.diasAMostrar > 0);
        assert.ok(configuracion.inicioJornada < configuracion.finJornada);
        assert.ok(configuracion.diasLaborables.every((dia) => dia >= 0 && dia <= 6));
    });
});
