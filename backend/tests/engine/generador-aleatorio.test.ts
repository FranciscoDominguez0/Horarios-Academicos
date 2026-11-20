import { describe, it, expect } from "vitest";
import { CATALOGO_INGENIERIA_INFORMATICA } from "../../src/modules/scenarios/servicio-escenarios.js";
import { generarSesionesProgramables } from "../../src/engine/generators/generador-sesiones.js";
import { AsignacionAcademica, EntradaPlanificacion, DisponibilidadDocente } from "../../src/engine/types/dominio.js";
import { ejecutarPlanificacionGreedy } from "../../src/engine/algorithms/planificador-greedy.js";
import { ejecutarPlanificacionBacktracking } from "../../src/engine/algorithms/planificador-backtracking.js";

// Multiples plantillas realistas de distribucion semanal que rotan aleatoriamente
export function crearDisponibilidadesAleatorias(semilla: number = Math.random()): DisponibilidadDocente[] {
  const patronId = Math.floor(semilla * 4); // 4 patrones semanales distintos

  // Desplazamiento horario aleatorio (0 min o 60 min de retraso)
  const shift = (docIdx: number) => ((docIdx + Math.floor(semilla * 10)) % 2 === 0 ? 0 : 60);

  let matrizBase: { doc: number; dia: number; ini: number; fin: number }[] = [];

  if (patronId === 0) {
    // Patron A: Docente 0 (Lun/Jue), Docente 1 (Mar/Vie), Docente 5 (Lun/Mie/Vie), Docente 6 (Mar/Jue)
    matrizBase = [
      { doc: 0, dia: 1, ini: 480, fin: 780 },
      { doc: 0, dia: 4, ini: 480, fin: 780 },
      { doc: 1, dia: 2, ini: 480, fin: 780 },
      { doc: 1, dia: 5, ini: 480, fin: 780 },
      { doc: 2, dia: 1, ini: 480 + shift(2), fin: 840 + shift(2) },
      { doc: 2, dia: 3, ini: 480, fin: 780 },
      { doc: 3, dia: 3, ini: 480, fin: 840 },
      { doc: 3, dia: 4, ini: 480 + shift(3), fin: 840 + shift(3) },
      { doc: 4, dia: 2, ini: 480 + shift(4), fin: 840 + shift(4) },
      { doc: 4, dia: 5, ini: 480, fin: 840 },
      { doc: 5, dia: 1, ini: 540, fin: 900 },
      { doc: 5, dia: 3, ini: 480, fin: 780 },
      { doc: 5, dia: 5, ini: 480, fin: 780 },
      { doc: 6, dia: 2, ini: 480, fin: 840 },
      { doc: 6, dia: 4, ini: 480, fin: 780 },
      { doc: 7, dia: 3, ini: 480 + shift(7), fin: 840 + shift(7) },
      { doc: 7, dia: 5, ini: 540, fin: 900 },
      { doc: 8, dia: 1, ini: 480, fin: 840 },
      { doc: 8, dia: 4, ini: 480, fin: 840 },
      { doc: 9, dia: 2, ini: 480, fin: 840 },
      { doc: 9, dia: 5, ini: 480, fin: 840 },
      { doc: 10, dia: 3, ini: 480, fin: 840 },
      { doc: 10, dia: 5, ini: 480, fin: 840 },
    ];
  } else if (patronId === 1) {
    // Patron B: Docente 0 (Mar/Vie), Docente 1 (Lun/Jue), Docente 5 (Mar/Mie/Jue), Docente 6 (Lun/Vie)
    matrizBase = [
      { doc: 0, dia: 2, ini: 480, fin: 780 },
      { doc: 0, dia: 5, ini: 480, fin: 780 },
      { doc: 1, dia: 1, ini: 480, fin: 780 },
      { doc: 1, dia: 4, ini: 480, fin: 780 },
      { doc: 2, dia: 2, ini: 480 + shift(2), fin: 840 + shift(2) },
      { doc: 2, dia: 4, ini: 480, fin: 780 },
      { doc: 3, dia: 1, ini: 480, fin: 840 },
      { doc: 3, dia: 3, ini: 480 + shift(3), fin: 840 + shift(3) },
      { doc: 4, dia: 3, ini: 480 + shift(4), fin: 840 + shift(4) },
      { doc: 4, dia: 5, ini: 480, fin: 840 },
      { doc: 5, dia: 2, ini: 540, fin: 900 },
      { doc: 5, dia: 3, ini: 480, fin: 780 },
      { doc: 5, dia: 4, ini: 480, fin: 780 },
      { doc: 6, dia: 1, ini: 480, fin: 840 },
      { doc: 6, dia: 5, ini: 480, fin: 780 },
      { doc: 7, dia: 1, ini: 480 + shift(7), fin: 840 + shift(7) },
      { doc: 7, dia: 4, ini: 540, fin: 900 },
      { doc: 8, dia: 2, ini: 480, fin: 840 },
      { doc: 8, dia: 5, ini: 480, fin: 840 },
      { doc: 9, dia: 1, ini: 480, fin: 840 },
      { doc: 9, dia: 4, ini: 480, fin: 840 },
      { doc: 10, dia: 3, ini: 480, fin: 840 },
      { doc: 10, dia: 5, ini: 480, fin: 840 },
    ];
  } else if (patronId === 2) {
    // Patron C: Permutacion armonica de Patron A con cobertura completa
    matrizBase = [
      { doc: 0, dia: 3, ini: 480, fin: 780 },
      { doc: 0, dia: 5, ini: 480, fin: 780 },
      { doc: 1, dia: 1, ini: 480, fin: 780 },
      { doc: 1, dia: 2, ini: 480, fin: 780 },
      { doc: 2, dia: 3, ini: 480 + shift(2), fin: 840 + shift(2) },
      { doc: 2, dia: 4, ini: 480, fin: 780 },
      { doc: 3, dia: 4, ini: 480, fin: 840 },
      { doc: 3, dia: 5, ini: 480 + shift(3), fin: 840 + shift(3) },
      { doc: 4, dia: 1, ini: 480 + shift(4), fin: 840 + shift(4) },
      { doc: 4, dia: 2, ini: 480, fin: 840 },
      { doc: 5, dia: 3, ini: 540, fin: 900 },
      { doc: 5, dia: 4, ini: 480, fin: 780 },
      { doc: 5, dia: 2, ini: 480, fin: 780 },
      { doc: 6, dia: 1, ini: 480, fin: 840 },
      { doc: 6, dia: 5, ini: 480, fin: 780 },
      { doc: 7, dia: 4, ini: 480 + shift(7), fin: 840 + shift(7) },
      { doc: 7, dia: 2, ini: 540, fin: 900 },
      { doc: 8, dia: 3, ini: 480, fin: 840 },
      { doc: 8, dia: 5, ini: 480, fin: 840 },
      { doc: 9, dia: 1, ini: 480, fin: 840 },
      { doc: 9, dia: 2, ini: 480, fin: 840 },
      { doc: 10, dia: 4, ini: 480, fin: 840 },
      { doc: 10, dia: 2, ini: 480, fin: 840 },
    ];
  } else {
    // Patron D: Docente 0 (Mie/Vie), Docente 1 (Mar/Jue), Docente 5 (Mie/Jue/Vie), Docente 6 (Lun/Mar)
    matrizBase = [
      { doc: 0, dia: 3, ini: 480, fin: 780 },
      { doc: 0, dia: 5, ini: 480, fin: 780 },
      { doc: 1, dia: 2, ini: 480, fin: 780 },
      { doc: 1, dia: 4, ini: 480, fin: 780 },
      { doc: 2, dia: 1, ini: 480 + shift(2), fin: 840 + shift(2) },
      { doc: 2, dia: 4, ini: 480, fin: 780 },
      { doc: 3, dia: 1, ini: 480, fin: 840 },
      { doc: 3, dia: 5, ini: 480 + shift(3), fin: 840 + shift(3) },
      { doc: 4, dia: 2, ini: 480 + shift(4), fin: 840 + shift(4) },
      { doc: 4, dia: 3, ini: 480, fin: 840 },
      { doc: 5, dia: 3, ini: 540, fin: 900 },
      { doc: 5, dia: 4, ini: 480, fin: 780 },
      { doc: 5, dia: 5, ini: 480, fin: 780 },
      { doc: 6, dia: 1, ini: 480, fin: 840 },
      { doc: 6, dia: 2, ini: 480, fin: 780 },
      { doc: 7, dia: 3, ini: 480 + shift(7), fin: 840 + shift(7) },
      { doc: 7, dia: 5, ini: 540, fin: 900 },
      { doc: 8, dia: 3, ini: 480, fin: 840 },
      { doc: 8, dia: 5, ini: 480, fin: 840 },
      { doc: 9, dia: 2, ini: 480, fin: 840 },
      { doc: 9, dia: 4, ini: 480, fin: 840 },
      { doc: 10, dia: 1, ini: 480, fin: 840 },
      { doc: 10, dia: 4, ini: 480, fin: 840 },
    ];
  }

  return matrizBase.map((m) => ({
    docenteId: m.doc,
    diaSemana: m.dia,
    inicioMinuto: Math.max(480, Math.min(m.ini, 780)),
    finMinuto: Math.min(900, Math.max(m.fin, m.ini + 120)),
  }));
}

describe("Generacion Aleatoria Dinamica", () => {
  it("todos los patrones aleatorios deben provocar diferencias visibles entre Greedy y Backtracking", () => {
    for (const semilla of [0.1, 0.35, 0.65, 0.88]) {
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

      console.log(`Semilla ${semilla} -> Greedy asignadas: ${resGreedy.sesionesAsignadas.length}/29, Backtracking: ${resBacktrack.sesionesAsignadas.length}/29`);

      // Verificar que Greedy no es identico a Backtracking
      expect(resGreedy.sesionesPendientes.length).toBeGreaterThan(0);
      expect(resBacktrack.sesionesAsignadas.length).toBe(29);
      expect(resBacktrack.estado).toBe("COMPLETED");

      // Verificar que Backtracking cubre los 5 dias en todos los grupos
      for (const grupoId of [1, 2, 3]) {
        const sesGrupo = resBacktrack.sesionesAsignadas.filter((s) => s.sesion.grupoId === grupoId);
        const diasOcupados = new Set(sesGrupo.map((s) => s.candidato.diaSemana));
        expect(Array.from(diasOcupados).sort()).toEqual([1, 2, 3, 4, 5]);
      }
    }
  });
});
