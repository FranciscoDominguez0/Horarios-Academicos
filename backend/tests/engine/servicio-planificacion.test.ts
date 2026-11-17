import { describe, expect, it } from "vitest";
import { enrutadorPlanificacion } from "../../src/modules/scheduling/rutas-planificacion.js";

describe("Capa de rutas y servicios de planificación", () => {
  it("el enrutador debe estar definido con los endpoints principales", () => {
    expect(enrutadorPlanificacion).toBeDefined();
    expect(enrutadorPlanificacion.stack).toBeDefined();

    const rutasRegistradas = enrutadorPlanificacion.stack
      .map((capa: any) => ({
        ruta: capa.route?.path,
        metodos: capa.route?.methods,
      }))
      .filter((r) => r.ruta !== undefined);

    expect(rutasRegistradas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruta: "/greedy", metodos: expect.objectContaining({ post: true }) }),
        expect.objectContaining({ ruta: "/backtracking", metodos: expect.objectContaining({ post: true }) }),
        expect.objectContaining({ ruta: "/runs/:id", metodos: expect.objectContaining({ get: true }) }),
        expect.objectContaining({ ruta: "/runs/:id/sessions", metodos: expect.objectContaining({ get: true }) }),
        expect.objectContaining({ ruta: "/periods/:periodId/runs", metodos: expect.objectContaining({ get: true }) }),
      ])
    );
  });
});
