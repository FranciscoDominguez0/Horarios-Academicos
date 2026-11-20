import { describe, it, expect } from "vitest";
import { CATALOGO_INGENIERIA_INFORMATICA } from "../../src/modules/scenarios/servicio-escenarios.js";
import { generarSesionesProgramables } from "../../src/engine/generators/generador-sesiones.js";
import { generarMapaCandidatos } from "../../src/engine/generators/generador-candidatos.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";
import { ejecutarPlanificacionBacktracking } from "../../src/engine/algorithms/planificador-backtracking.js";
import { AsignacionAcademica, EntradaPlanificacion, DisponibilidadDocente } from "../../src/engine/types/dominio.js";

describe("Simulacion Realista 08:00 - 15:00 (Ingenieria en Informatica)", () => {
  it("debe distribuir clases de Lunes a Viernes sin dias en blanco y hacer trabajar a Backtracking", () => {
    const disponibilidadesBase = [
      // Docente 0 (INF-101 1° e INF-201 2°): Lun 8-13 (480-780), Jue 8-13 (480-780) -> Muy ajustado (300m + 300m)
      { docenteId: 0, dia: 1, inicio: 480, fin: 780 },
      { docenteId: 0, dia: 4, inicio: 480, fin: 780 },

      // Docente 1 (MAT-101 1° y MAT-201 2°): Mar 8-13 (480-780), Vie 8-13 (480-780) -> Muy ajustado
      { docenteId: 1, dia: 2, inicio: 480, fin: 780 },
      { docenteId: 1, dia: 5, inicio: 480, fin: 780 },

      // Docente 2 (MAT-102 1°): Lun 8-14 (480-840), Mie 8-13 (480-780)
      { docenteId: 2, dia: 1, inicio: 480, fin: 840 },
      { docenteId: 2, dia: 3, inicio: 480, fin: 780 },

      // Docente 3 (INF-102 1°): Mie 8-14 (480-840), Jue 8-14 (480-840)
      { docenteId: 3, dia: 3, inicio: 480, fin: 840 },
      { docenteId: 3, dia: 4, inicio: 480, fin: 840 },

      // Docente 4 (FIS-101 1°): Mar 8-14 (480-840), Vie 8-14 (480-840)
      { docenteId: 4, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 4, dia: 5, inicio: 480, fin: 840 },

      // Docente 5 (INF-202 2° e INF-304 3°): Lun 9-15 (540-900), Mie 8-13 (480-780), Vie 8-13 (480-780)
      { docenteId: 5, dia: 1, inicio: 540, fin: 900 },
      { docenteId: 5, dia: 3, inicio: 480, fin: 780 },
      { docenteId: 5, dia: 5, inicio: 480, fin: 780 },

      // Docente 6 (INF-203 2° e INF-303 3°): Mar 8-14 (480-840), Jue 8-13 (480-780)
      { docenteId: 6, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 6, dia: 4, inicio: 480, fin: 780 },

      // Docente 7 (INF-204 2°): Mie 8-14 (480-840), Vie 9-15 (540-900)
      { docenteId: 7, dia: 3, inicio: 480, fin: 840 },
      { docenteId: 7, dia: 5, inicio: 540, fin: 900 },

      // Docente 8 (INF-301 3°): Lun 8-14 (480-840), Jue 8-14 (480-840)
      { docenteId: 8, dia: 1, inicio: 480, fin: 840 },
      { docenteId: 8, dia: 4, inicio: 480, fin: 840 },

      // Docente 9 (INF-302 3°): Mar 8-14 (480-840), Vie 8-14 (480-840)
      { docenteId: 9, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 9, dia: 5, inicio: 480, fin: 840 },

      // Docente 10 (INF-305 3°): Mie 8-14 (480-840), Vie 8-14 (480-840)
      { docenteId: 10, dia: 3, inicio: 480, fin: 840 },
      { docenteId: 10, dia: 5, inicio: 480, fin: 840 },
    ];

    const disponibilidades: DisponibilidadDocente[] = disponibilidadesBase.map((d) => ({
      docenteId: d.docenteId,
      diaSemana: d.dia,
      inicioMinuto: d.inicio,
      finMinuto: d.fin,
    }));

    const asignaciones: AsignacionAcademica[] = [];
    let asigId = 1;
    let reqId = 1;

    // Grupo 1: Docentes 0, 1, 2, 3, 4
    const docMap1 = [0, 1, 2, 3, 4];
    CATALOGO_INGENIERIA_INFORMATICA.ano1.forEach((m, idx) => {
      asignaciones.push({
        id: asigId++,
        periodoId: 1,
        asignaturaId: asigId * 10,
        docenteId: docMap1[idx],
        grupoId: 1,
        minutosSemanales: m.weekly_minutes,
        requerimientos: m.reqs.map((r) => ({
          id: reqId++,
          asignacionId: asigId - 1,
          duracionMinutos: r.duracion,
          cantidad: r.cantidad,
        })),
      });
    });

    // Grupo 2: Docentes 0, 1, 5, 6, 7
    const docMap2 = [0, 1, 5, 6, 7];
    CATALOGO_INGENIERIA_INFORMATICA.ano2.forEach((m, idx) => {
      asignaciones.push({
        id: asigId++,
        periodoId: 1,
        asignaturaId: asigId * 10,
        docenteId: docMap2[idx],
        grupoId: 2,
        minutosSemanales: m.weekly_minutes,
        requerimientos: m.reqs.map((r) => ({
          id: reqId++,
          asignacionId: asigId - 1,
          duracionMinutos: r.duracion,
          cantidad: r.cantidad,
        })),
      });
    });

    // Grupo 3: Docentes 8, 9, 6, 5, 10
    const docMap3 = [8, 9, 6, 5, 10];
    CATALOGO_INGENIERIA_INFORMATICA.ano3.forEach((m, idx) => {
      asignaciones.push({
        id: asigId++,
        periodoId: 1,
        asignaturaId: asigId * 10,
        docenteId: docMap3[idx],
        grupoId: 3,
        minutosSemanales: m.weekly_minutes,
        requerimientos: m.reqs.map((r) => ({
          id: reqId++,
          asignacionId: asigId - 1,
          duracionMinutos: r.duracion,
          cantidad: r.cantidad,
        })),
      });
    });

    const entrada: EntradaPlanificacion = {
      asignaciones,
      disponibilidades,
      diasPermitidos: [1, 2, 3, 4, 5],
      jornadaInicioMinuto: 480, // 08:00
      jornadaFinMinuto: 900,   // 15:00
      pasoCuadriculaMinutos: 60,
    };

    const sesiones = generarSesionesProgramables(asignaciones);
    expect(sesiones.length).toBe(29);

    // Ejecutar Greedy y comprobar que se bloquea por decisiones miopes
    const resGreedy = ejecutarPlanificacionGreedy(entrada);
    expect(resGreedy.sesionesPendientes.length).toBe(1);
    expect(resGreedy.sesionesAsignadas.length).toBe(28);
    expect(resGreedy.estado).toBe("NO_SOLUTION");

    // Ejecutar Backtracking y comprobar que resuelve el 100%
    const resBacktrack = ejecutarPlanificacionBacktracking(entrada);
    expect(resBacktrack.estado).toBe("COMPLETED");
    expect(resBacktrack.sesionesAsignadas.length).toBe(29);

    // Verificar que todas las clases terminan a las 15:00 (900) o antes
    for (const sa of resBacktrack.sesionesAsignadas) {
      expect(sa.candidato.inicioMinuto).toBeGreaterThanOrEqual(480);
      expect(sa.candidato.finMinuto).toBeLessThanOrEqual(900);
    }

    // Verificar que los 3 grupos tienen clases en los 5 dias de la semana (1 a 5) sin dias en blanco
    for (const grupoId of [1, 2, 3]) {
      const sesGrupo = resBacktrack.sesionesAsignadas.filter((s) => s.sesion.grupoId === grupoId);
      const diasOcupados = new Set(sesGrupo.map((s) => s.candidato.diaSemana));
      expect(Array.from(diasOcupados).sort()).toEqual([1, 2, 3, 4, 5]);
    }
  });
});
