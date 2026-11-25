import { beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
    actualizarPassword,
    buscarUsuarioPorCorreo,
    generarHash,
    guardarUsuario,
    obtenerUsuarios,
} from "../source/js/usuarios.js";

// Simula el localStorage del navegador, que no existe en Node
function crearAlmacenamiento() {
    const datos = new Map();

    return {
        getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
        setItem: (clave, valor) => datos.set(clave, String(valor)),
        removeItem: (clave) => datos.delete(clave),
    };
}

const usuarioAna = {
    nombre: "Ana",
    apellido: "Perez",
    dni: "30111222",
    obraSocial: "",
    telefono: "3511111111",
    correo: "ana@ejemplo.com",
    passwordHash: "hash-anterior-de-ana",
};

const usuarioLuis = {
    nombre: "Luis",
    apellido: "Gomez",
    dni: "28999888",
    obraSocial: "",
    telefono: "3512222222",
    correo: "luis@ejemplo.com",
    passwordHash: "hash-de-luis",
};

beforeEach(() => {
    globalThis.localStorage = crearAlmacenamiento();
    guardarUsuario(usuarioAna);
    guardarUsuario(usuarioLuis);
});

describe("actualizarPassword", () => {
    test("reemplaza el hash del usuario indicado y conserva sus demas datos", () => {
        const resultado = actualizarPassword("ana@ejemplo.com", "hash-nuevo");
        const ana = buscarUsuarioPorCorreo("ana@ejemplo.com");

        assert.equal(resultado, true);
        assert.equal(ana.passwordHash, "hash-nuevo");
        assert.equal(ana.dni, "30111222");
        assert.equal(ana.telefono, "3511111111");
    });

    test("no modifica a los demas usuarios", () => {
        actualizarPassword("ana@ejemplo.com", "hash-nuevo");

        assert.equal(buscarUsuarioPorCorreo("luis@ejemplo.com").passwordHash, "hash-de-luis");
        assert.equal(obtenerUsuarios().length, 2);
    });

    test("devuelve false y no altera la lista si el correo no esta registrado", () => {
        const antes = JSON.stringify(obtenerUsuarios());

        assert.equal(actualizarPassword("nadie@ejemplo.com", "hash-nuevo"), false);
        assert.equal(JSON.stringify(obtenerUsuarios()), antes);
    });

    test("ignora mayusculas y espacios en el correo", () => {
        assert.equal(actualizarPassword("  ANA@Ejemplo.COM ", "hash-nuevo"), true);
        assert.equal(buscarUsuarioPorCorreo("ana@ejemplo.com").passwordHash, "hash-nuevo");
    });

    test("tras recuperar la cuenta, solo la contraseña nueva produce el hash guardado", async () => {
        const hashNuevo = await generarHash("ClaveNueva99", "ana@ejemplo.com");
        const hashViejo = await generarHash("ClaveVieja11", "ana@ejemplo.com");

        actualizarPassword("ana@ejemplo.com", hashNuevo);
        const ana = buscarUsuarioPorCorreo("ana@ejemplo.com");

        assert.equal(ana.passwordHash, await generarHash("ClaveNueva99", "ana@ejemplo.com"));
        assert.notEqual(ana.passwordHash, hashViejo);
    });
});
