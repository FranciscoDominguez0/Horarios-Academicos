import { describe, expect, it } from "vitest";
import { enrutadorPeriodos } from "../../src/modules/periods/rutas-periodos.js";
import { enrutadorDocentes } from "../../src/modules/teachers/rutas-docentes.js";
import { enrutadorMaterias } from "../../src/modules/subjects/rutas-materias.js";
import { enrutadorGrupos } from "../../src/modules/groups/rutas-grupos.js";
import { enrutadorAsignaciones } from "../../src/modules/assignments/rutas-asignaciones.js";
import { enrutadorEscenarios } from "../../src/modules/scenarios/rutas-escenarios.js";

function agruparRutasPorPath(enrutador: any): Map<string, Record<string, boolean>> {
  const mapa = new Map<string, Record<string, boolean>>();
  for (const capa of enrutador.stack) {
    if (capa.route?.path) {
      const ruta = capa.route.path;
      const metodosExistentes = mapa.get(ruta) ?? {};
      mapa.set(ruta, { ...metodosExistentes, ...capa.route.methods });
    }
  }
  return mapa;
}

describe("Capa CRUD de datos académicos", () => {
  it("debe registrar rutas para períodos académicos", () => {
    const rutas = agruparRutasPorPath(enrutadorPeriodos);
    expect(rutas.get("/")?.get).toBe(true);
    expect(rutas.get("/")?.post).toBe(true);
    expect(rutas.get("/:id")?.get).toBe(true);
    expect(rutas.get("/:id")?.put).toBe(true);
  });

  it("debe registrar rutas para docentes y disponibilidad", () => {
    const rutas = agruparRutasPorPath(enrutadorDocentes);
    expect(rutas.get("/")?.get).toBe(true);
    expect(rutas.get("/")?.post).toBe(true);
    expect(rutas.get("/:id/availability")?.get).toBe(true);
    expect(rutas.get("/:id/availability")?.post).toBe(true);
    expect(rutas.get("/availability/:id")?.delete).toBe(true);
  });

  it("debe registrar rutas para asignaturas y grupos", () => {
    const rutasMaterias = agruparRutasPorPath(enrutadorMaterias);
    const rutasGrupos = agruparRutasPorPath(enrutadorGrupos);

    expect(rutasMaterias.get("/")?.get).toBe(true);
    expect(rutasMaterias.get("/")?.post).toBe(true);
    expect(rutasGrupos.get("/")?.get).toBe(true);
    expect(rutasGrupos.get("/")?.post).toBe(true);
  });

  it("debe registrar rutas para asignaciones académicas", () => {
    const rutas = agruparRutasPorPath(enrutadorAsignaciones);
    expect(rutas.get("/")?.get).toBe(true);
    expect(rutas.get("/")?.post).toBe(true);
    expect(rutas.get("/:id")?.get).toBe(true);
    expect(rutas.get("/:id/status")?.patch).toBe(true);
  });

  it("debe registrar ruta para generación de escenarios aleatorios con IA", () => {
    const rutas = agruparRutasPorPath(enrutadorEscenarios);
    expect(rutas.get("/generate-random")?.post).toBe(true);
  });
});
