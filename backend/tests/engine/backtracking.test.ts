import { describe, expect, it } from "vitest";
import { EntradaPlanificacion } from "../../src/engine/types/dominio.js";
import { ejecutarPlanificacionBacktracking } from "../../src/engine/algorithms/planificador-backtracking.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";

describe("Algoritmo Backtracking con poda segura", () => {
  it("debe encontrar una solución completa y válida en una instancia factible", () => {
    const entrada: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 420,
      jornadaFinMinuto: 1080,
      diasPermitidos: [1, 2],
      pasoCuadriculaMinutos: 60,
      asignaciones: [
        {
          id: 1,
          periodoId: 1,
          asignaturaId: 101,
          docenteId: 10,
          grupoId: 1,
          minutosSemanales: 120,
          requerimientos: [{ id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 1 }],
        },
        {
          id: 2,
          periodoId: 1,
          asignaturaId: 102,
          docenteId: 20,
          grupoId: 2,
          minutosSemanales: 120,
          requerimientos: [{ id: 2, asignacionId: 2, duracionMinutos: 120, cantidad: 1 }],
        },
      ],
      disponibilidades: [
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 },
        { id: 2, docenteId: 20, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 },
      ],
    };

    const resultado = ejecutarPlanificacionBacktracking(entrada);

    expect(resultado.algoritmo).toBe("BACKTRACKING");
    expect(resultado.estado).toBe("COMPLETED");
    expect(resultado.completado).toBe(true);
    expect(resultado.sesionesAsignadas).toHaveLength(2);
    expect(resultado.sesionesPendientes).toHaveLength(0);
    expect(resultado.validacion.esValido).toBe(true);
    expect(resultado.metricas.nodosVisitados).toBeGreaterThan(0);
  });

  it("debe determinar formalmente NO_SOLUTION cuando no existe horario posible", () => {
    const entradaSinSolucion: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 480,
      jornadaFinMinuto: 600, // Solo 1 franja de 2 horas (08:00 a 10:00)
      diasPermitidos: [1],
      pasoCuadriculaMinutos: 60,
      asignaciones: [
        {
          id: 1,
          periodoId: 1,
          asignaturaId: 101,
          docenteId: 10,
          grupoId: 1,
          minutosSemanales: 120,
          requerimientos: [{ id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 1 }],
        },
        {
          id: 2,
          periodoId: 1,
          asignaturaId: 102,
          docenteId: 10, // Mismo docente compitiendo por la misma franja
          grupoId: 2,
          minutosSemanales: 120,
          requerimientos: [{ id: 2, asignacionId: 2, duracionMinutos: 120, cantidad: 1 }],
        },
      ],
      disponibilidades: [
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 600 },
      ],
    };

    const resultado = ejecutarPlanificacionBacktracking(entradaSinSolucion);

    expect(resultado.estado).toBe("NO_SOLUTION");
    expect(resultado.completado).toBe(false);
    expect(resultado.sesionesAsignadas).toHaveLength(0);
    expect(resultado.metricas.retrocesos).toBeGreaterThanOrEqual(1);
  });

  it("debe resolver instancias mediante retroceso donde una decisión local voraz se bloquea", () => {
    // Sesión 1 puede colocarse en Franja A o Franja B
    // Sesión 2 SOLO puede colocarse en Franja A
    // Docente 10 tiene Franja A (08:00-10:00) y Franja B (10:00-12:00)
    // Docente 20 solo tiene Franja A (08:00-10:00)
    // Ambas asignaturas pertenecen al mismo Grupo 1 (no pueden solaparse)
    const entrada: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 480,
      jornadaFinMinuto: 720,
      diasPermitidos: [1],
      pasoCuadriculaMinutos: 120,
      asignaciones: [
        {
          id: 1,
          periodoId: 1,
          asignaturaId: 1,
          docenteId: 10, // Puede en 08:00 y en 10:00
          grupoId: 1,
          minutosSemanales: 120,
          requerimientos: [{ id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 1 }],
        },
        {
          id: 2,
          periodoId: 1,
          asignaturaId: 2,
          docenteId: 20, // Solo puede en 08:00
          grupoId: 1,
          minutosSemanales: 120,
          requerimientos: [{ id: 2, asignacionId: 2, duracionMinutos: 120, cantidad: 1 }],
        },
      ],
      disponibilidades: [
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 }, // 08:00 a 12:00
        { id: 2, docenteId: 20, diaSemana: 1, inicioMinuto: 480, finMinuto: 600 }, // 08:00 a 10:00
      ],
    };

    const resBacktracking = ejecutarPlanificacionBacktracking(entrada);

    expect(resBacktracking.estado).toBe("COMPLETED");
    expect(resBacktracking.completado).toBe(true);
    expect(resBacktracking.sesionesAsignadas).toHaveLength(2);
    expect(resBacktracking.validacion.esValido).toBe(true);
  });

  it("debe informar LIMIT_REACHED si se excede el límite máximo de nodos", () => {
    const entrada: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 420,
      jornadaFinMinuto: 1080,
      diasPermitidos: [1, 2, 3, 4, 5],
      pasoCuadriculaMinutos: 30,
      asignaciones: [
        {
          id: 1,
          periodoId: 1,
          asignaturaId: 101,
          docenteId: 10,
          grupoId: 1,
          minutosSemanales: 240,
          requerimientos: [{ id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 2 }],
        },
        {
          id: 2,
          periodoId: 1,
          asignaturaId: 102,
          docenteId: 20,
          grupoId: 2,
          minutosSemanales: 240,
          requerimientos: [{ id: 2, asignacionId: 2, duracionMinutos: 120, cantidad: 2 }],
        },
      ],
      disponibilidades: [
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 420, finMinuto: 1080 },
        { id: 2, docenteId: 20, diaSemana: 1, inicioMinuto: 420, finMinuto: 1080 },
      ],
    };

    // Forzamos un límite extremadamente restrictivo de 1 nodo
    const resultado = ejecutarPlanificacionBacktracking(entrada, { limiteNodos: 1 });

    expect(resultado.estado).toBe("LIMIT_REACHED");
    expect(resultado.completado).toBe(false);
  });
});
