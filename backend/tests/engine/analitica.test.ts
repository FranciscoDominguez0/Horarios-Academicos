import { describe, expect, it } from "vitest";
import { construirComparacion } from "../../src/modules/analytics/servicio-analitica.js";
import { enrutadorAnalitica } from "../../src/modules/analytics/rutas-analitica.js";

describe("Módulo de Analítica y Comparación Experimental", () => {
  it("debe contrastar métricas correctamente entre Greedy y Backtracking con misma entrada", () => {
    const corridaGreedy = {
      id: 101n,
      period_id: 1,
      algorithm: "GREEDY",
      status: "COMPLETED",
      duration_ms: 12.5,
      operations: 150n,
      nodes_visited: 0n,
      backtracks: 0n,
      assigned_sessions: 8,
      unassigned_sessions: 2,
      conflicts_found: 0,
      quality_score: 80.0,
      input_snapshot: { periodoId: 1, asignaciones: [1, 2] },
      metrics_json: {},
      created_at: new Date(),
    };

    const corridaBacktracking = {
      id: 102n,
      period_id: 1,
      algorithm: "BACKTRACKING",
      status: "COMPLETED",
      duration_ms: 50.0,
      operations: 600n,
      nodes_visited: 45n,
      backtracks: 5n,
      assigned_sessions: 10,
      unassigned_sessions: 0,
      conflicts_found: 0,
      quality_score: 100.0,
      input_snapshot: { periodoId: 1, asignaciones: [1, 2] },
      metrics_json: {},
      created_at: new Date(),
    };

    const comparacion = construirComparacion(corridaGreedy, corridaBacktracking);

    expect(comparacion.mismoPeriodo).toBe(true);
    expect(comparacion.mismaEntrada).toBe(true);
    expect(comparacion.algoritmoMasRapido).toBe("GREEDY");
    expect(comparacion.razonVelocidad).toBe(4); // 50 / 12.5 = 4x
    expect(comparacion.diferenciaTiempoMs).toBe(-37.5); // 12.5 - 50 = -37.5
    expect(comparacion.diferenciaOperaciones).toBe(-450); // 150 - 600 = -450
    expect(comparacion.runA.sesionesAsignadas).toBe(8);
    expect(comparacion.runB.sesionesAsignadas).toBe(10);
  });

  it("debe tener registradas las rutas de analítica", () => {
    expect(enrutadorAnalitica).toBeDefined();

    const rutas = enrutadorAnalitica.stack
      .map((capa: any) => ({
        ruta: capa.route?.path,
        metodos: capa.route?.methods,
      }))
      .filter((r) => r.ruta !== undefined);

    expect(rutas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruta: "/compare", metodos: expect.objectContaining({ get: true }) }),
        expect.objectContaining({ ruta: "/runs/:id", metodos: expect.objectContaining({ get: true }) }),
      ])
    );
  });
});
