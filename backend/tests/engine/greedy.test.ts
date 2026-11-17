import { describe, expect, it } from "vitest";
import { EntradaPlanificacion } from "../../src/engine/types/dominio.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";

describe("Algoritmo Greedy (Voraz)", () => {
  it("debe generar un horario completo y válido cuando existe disponibilidad suficiente", () => {
    const entrada: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 420, // 07:00
      jornadaFinMinuto: 1080, // 18:00
      diasPermitidos: [1, 2], // Lunes y Martes
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
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 }, // Lun 08:00-12:00
        { id: 2, docenteId: 20, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 }, // Lun 08:00-12:00
      ],
    };

    const resultado = ejecutarPlanificacionGreedy(entrada);

    expect(resultado.algoritmo).toBe("GREEDY");
    expect(resultado.completado).toBe(true);
    expect(resultado.sesionesAsignadas).toHaveLength(2);
    expect(resultado.sesionesPendientes).toHaveLength(0);
    expect(resultado.validacion.esValido).toBe(true);
    expect(resultado.validacion.conflictos).toHaveLength(0);
    expect(resultado.metricas.operaciones).toBeGreaterThan(0);
  });

  it("debe dejar en pendientes las sesiones que no tienen espacio sin crear cruces", () => {
    const entradaSaturada: EntradaPlanificacion = {
      periodoId: 1,
      jornadaInicioMinuto: 480,
      jornadaFinMinuto: 600, // Solo 2 horas disponibles: 08:00 a 10:00
      diasPermitidos: [1], // Solo Lunes
      pasoCuadriculaMinutos: 60,
      asignaciones: [
        {
          id: 1,
          periodoId: 1,
          asignaturaId: 101,
          docenteId: 10,
          grupoId: 1,
          minutosSemanales: 120, // Requiere 120 min
          requerimientos: [{ id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 1 }],
        },
        {
          id: 2,
          periodoId: 1,
          asignaturaId: 102,
          docenteId: 10, // Mismo docente compitiendo por la misma única franja
          grupoId: 2,
          minutosSemanales: 120, // Requiere 120 min
          requerimientos: [{ id: 2, asignacionId: 2, duracionMinutos: 120, cantidad: 1 }],
        },
      ],
      disponibilidades: [
        { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 600 },
      ],
    };

    const resultado = ejecutarPlanificacionGreedy(entradaSaturada);

    expect(resultado.completado).toBe(false);
    expect(resultado.sesionesAsignadas).toHaveLength(1);
    expect(resultado.sesionesPendientes).toHaveLength(1);
    expect(resultado.validacion.esValido).toBe(true);
    expect(resultado.validacion.conflictos).toHaveLength(0);
  });
});
