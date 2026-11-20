import { describe, it, expect } from "vitest";
import { CATALOGO_INGENIERIA_INFORMATICA } from "../../src/modules/scenarios/servicio-escenarios.js";
import { generarSesionesProgramables } from "../../src/engine/generators/generador-sesiones.js";
import { generarMapaCandidatos } from "../../src/engine/generators/generador-candidatos.js";
import { AsignacionAcademica, EntradaPlanificacion, DisponibilidadDocente } from "../../src/engine/types/dominio.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";
import { ejecutarPlanificacionBacktracking } from "../../src/engine/algorithms/planificador-backtracking.js";
import { crearDisponibilidadesAleatorias } from "./generador-aleatorio.test.js";

describe("Calibracion Exacta de Greedy: 1 Sola Sesion Pendiente (28/29)", () => {
  it("Greedy debe tener exactamente 1 sesion pendiente (28/29) en todas las semillas", () => {
    for (let s = 0; s < 1; s += 0.05) {
      const semilla = Number(s.toFixed(2));
      const disponibilidades = crearDisponibilidadesAleatorias(semilla);

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

      expect(resGreedy.sesionesAsignadas.length).toBe(28);
      expect(resGreedy.sesionesPendientes.length).toBe(1);
      expect(resBacktrack.sesionesAsignadas.length).toBe(29);
      expect(resBacktrack.sesionesPendientes.length).toBe(0);
    }
  });
});
