import {
  CandidatoHorario,
  EntradaPlanificacion,
  IntervaloTiempo,
  ResultadoPlanificacion,
  SesionAsignada,
  SesionProgramable,
} from "../types/dominio.js";
import { generarSesionesProgramables } from "../generators/generador-sesiones.js";
import { generarMapaCandidatos } from "../generators/generador-candidatos.js";
import { seSolapan } from "../validation/intervalos.js";
import { validarHorario } from "../validation/validador-independiente.js";

function claveOcupacion(entidadId: number, diaSemana: number): string {
  return `${entidadId}-${diaSemana}`;
}

function hayConflicto(
  candidato: CandidatoHorario,
  intervalosExistentes: IntervaloTiempo[] | undefined,
  contadorOps: { total: number }
): boolean {
  if (!intervalosExistentes || intervalosExistentes.length === 0) return false;

  for (const intervalo of intervalosExistentes) {
    contadorOps.total++;
    if (seSolapan(candidato, intervalo)) return true;
  }

  return false;
}

export function ejecutarPlanificacionGreedy(
  entrada: EntradaPlanificacion
): ResultadoPlanificacion {
  const inicioReloj = performance.now();
  const contadorOps = { total: 0 };

  const sesiones = generarSesionesProgramables(entrada.asignaciones);
  const mapaCandidatos = generarMapaCandidatos(sesiones, entrada);

  // Heurística MRV: ordenar primero las sesiones con menor cantidad de candidatos
  const sesionesOrdenadas = [...sesiones].sort((a, b) => {
    contadorOps.total++;
    const cantA = mapaCandidatos.get(a.id)?.length ?? 0;
    const cantB = mapaCandidatos.get(b.id)?.length ?? 0;
    return cantA - cantB;
  });

  const ocupacionDocentes = new Map<string, IntervaloTiempo[]>();
  const ocupacionGrupos = new Map<string, IntervaloTiempo[]>();

  const sesionesAsignadas: SesionAsignada[] = [];
  const sesionesPendientes: SesionProgramable[] = [];

  for (const sesion of sesionesOrdenadas) {
    const candidatos = mapaCandidatos.get(sesion.id) ?? [];
    let candidatoAsignado: CandidatoHorario | null = null;

    for (const candidato of candidatos) {
      const claveDocente = claveOcupacion(sesion.docenteId, candidato.diaSemana);
      const claveGrupo = claveOcupacion(sesion.grupoId, candidato.diaSemana);

      const cruceDocente = hayConflicto(candidato, ocupacionDocentes.get(claveDocente), contadorOps);
      const cruceGrupo = hayConflicto(candidato, ocupacionGrupos.get(claveGrupo), contadorOps);

      if (!cruceDocente && !cruceGrupo) {
        candidatoAsignado = candidato;

        const intervalosDoc = ocupacionDocentes.get(claveDocente) ?? [];
        intervalosDoc.push(candidato);
        ocupacionDocentes.set(claveDocente, intervalosDoc);

        const intervalosGrp = ocupacionGrupos.get(claveGrupo) ?? [];
        intervalosGrp.push(candidato);
        ocupacionGrupos.set(claveGrupo, intervalosGrp);

        break;
      }
    }

    if (candidatoAsignado) {
      sesionesAsignadas.push({ sesion, candidato: candidatoAsignado });
    } else {
      sesionesPendientes.push(sesion);
    }
  }

  const finReloj = performance.now();
  const duracionMs = Number((finReloj - inicioReloj).toFixed(3));
  const completado = sesionesPendientes.length === 0;
  const validacion = validarHorario(sesionesAsignadas, entrada, sesiones.length);

  return {
    algoritmo: "GREEDY",
    estado: completado ? "COMPLETED" : "NO_SOLUTION",
    completado,
    sesionesAsignadas,
    sesionesPendientes,
    metricas: {
      tiempoMs: duracionMs,
      operaciones: contadorOps.total,
    },
    validacion,
  };
}
