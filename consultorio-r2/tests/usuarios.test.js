import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { generarHash } from "../source/js/usuarios.js";

describe("generarHash", () => {
    test("produce un SHA-256 conocido de 64 caracteres hexadecimales", async () => {
        const hash = await generarHash("Demo1234", "demo@consultorior2.com");

        assert.equal(hash, "357b5c1c9461ab66a010c6c8b88632c70e34caaa3e929aa3edcfd3f690cb7dc0");
        assert.match(hash, /^[0-9a-f]{64}$/);
    });

    test("es determinista: los mismos datos dan el mismo hash", async () => {
        const primero = await generarHash("Clave1234", "paciente@ejemplo.com");
        const segundo = await generarHash("Clave1234", "paciente@ejemplo.com");

        assert.equal(primero, segundo);
    });

    test("ignora mayusculas y espacios en el correo", async () => {
        const normal = await generarHash("Clave1234", "paciente@ejemplo.com");
        const variante = await generarHash("Clave1234", "  Paciente@Ejemplo.COM ");

        assert.equal(normal, variante);
    });

    test("una contraseña distinta produce un hash distinto", async () => {
        const uno = await generarHash("Clave1234", "paciente@ejemplo.com");
        const otro = await generarHash("Clave1235", "paciente@ejemplo.com");

        assert.notEqual(uno, otro);
    });

    test("la contraseña no queda visible dentro del hash", async () => {
        const hash = await generarHash("Clave1234", "paciente@ejemplo.com");
        assert.ok(!hash.includes("Clave1234"));
    });
});
