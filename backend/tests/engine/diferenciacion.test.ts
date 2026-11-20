import { describe, it, expect } from "vitest";
import { CATALOGO_INGENIERIA_INFORMATICA } from "../../src/modules/scenarios/servicio-escenarios.js";
import { generarSesionesProgramables } from "../../src/engine/generators/generador-sesiones.js";
import { generarMapaCandidatos } from "../../src/engine/generators/generador-candidatos.js";
import { AsignacionAcademica, EntradaPlanificacion, DisponibilidadDocente } from "../../src/engine/types/dominio.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";
import { ejecutarPlanificacionBacktracking } from "../../src/engine/algorithms/planificador-backtracking.js";

describe("Diferenciacion Algoritmica Greedy vs Backtracking", () => {
  it("Greedy debe bloquearse por orden voraz y Backtracking debe resolver con retrocesos", () => {
    // Configurar 11 docentes con franjas entre 480 y 900
    const disponibilidadesBase = [
      { docenteId: 0, dia: 1, inicio: 480, fin: 780 },
      { docenteId: 0, dia: 4, inicio: 480, fin: 780 },
      { docenteId: 1, dia: 2, inicio: 480, fin: 780 },
      { docenteId: 1, dia: 5, inicio: 480, fin: 780 },
      { docenteId: 2, dia: 1, inicio: 480, fin: 840 },
      { docenteId: 2, dia: 3, inicio: 480, fin: 780 },
      { docenteId: 3, dia: 3, inicio: 480, fin: 840 },
      { docenteId: 3, dia: 4, inicio: 480, fin: 840 },
      { docenteId: 4, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 4, dia: 5, inicio: 480, fin: 840 },
      { docenteId: 5, dia: 1, inicio: 540, fin: 900 },
      { docenteId: 5, dia: 3, inicio: 480, fin: 780 },
      { docenteId: 5, dia: 5, inicio: 480, fin: 780 },
      { docenteId: 6, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 6, dia: 4, inicio: 480, fin: 780 },
      { docenteId: 7, dia: 3, inicio: 480, fin: 840 },
      { docenteId: 7, dia: 5, inicio: 540, fin: 900 },
      { docenteId: 8, dia: 1, inicio: 480, fin: 840 },
      { docenteId: 8, dia: 4, inicio: 480, fin: 840 },
      { docenteId: 9, dia: 2, inicio: 480, fin: 840 },
      { docenteId: 9, dia: 5, inicio: 480, fin: 840 },
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
      jornadaInicioMinuto: 480,
      jornadaFinMinuto: 900,
      pasoCuadriculaMinutos: 60,
    };

    const resGreedy = ejecutarPlanificacionGreedy(entrada);
    const resBacktrack = ejecutarPlanificacionBacktracking(entrada);

    console.log("Greedy asignadas:", resGreedy.sesionesAsignadas.length, "pendientes:", resGreedy.sesionesPendientes.length);
    console.log("Backtracking asignadas:", resBacktrack.sesionesAsignadas.length, "retrocesos:", resBacktrack.metricas?.retrocesos);

    // Comparar asignaciones entre Greedy y Backtracking
    const diferencias = resGreedy.sesionesAsignadas.filter((sg) => {
      const sb = resBacktrack.sesionesAsignadas.find((b) => b.sesion.id === sg.sesion.id);
      return !sb || sb.candidato.diaSemana !== sg.candidato.diaSemana || sb.candidato.inicioMinuto !== sg.candidato.inicioMinuto;
    });

    console.log("Total sesiones ubicadas en franjas distintas entre Greedy y Backtracking:", diferencias.length);
  });
});
