/**
 * Generador determinista de candidatos horarios para sesiones programables.
 * Un candidato representa una combinación válida de día, hora de inicio y hora de fin
 * que respeta la jornada académica institucional y la disponibilidad horaria del docente.
 */

import {
  CandidatoHorario,
  DisponibilidadDocente,
  EntradaPlanificacion,
  SesionProgramable,
} from "../types/dominio.js";
import { estaContenido } from "../validation/intervalos.js";

/**
 * Obtiene los bloques de disponibilidad de un docente para un día específico.
 */
function obtenerDisponibilidadDocenteEnDia(
  docenteId: number,
  diaSemana: number,
  disponibilidades: DisponibilidadDocente[]
): DisponibilidadDocente[] {
  return disponibilidades.filter(
    (disp) => disp.docenteId === docenteId && disp.diaSemana === diaSemana
  );
}

/**
 * Genera todos los candidatos horarios teóricamente posibles para una sesión programable,
 * considerando la jornada institucional, la cuadrícula de inicio y la disponibilidad del docente.
 */
export function generarCandidatosParaSesion(
  sesion: SesionProgramable,
  entrada: EntradaPlanificacion
): CandidatoHorario[] {
  const candidatos: CandidatoHorario[] = [];
  const {
    jornadaInicioMinuto,
    jornadaFinMinuto,
    diasPermitidos,
    pasoCuadriculaMinutos,
    disponibilidades,
  } = entrada;

  // Recorrer cada día habilitado en orden determinista
  for (const diaSemana of diasPermitidos) {
    const bloquesDisponibles = obtenerDisponibilidadDocenteEnDia(
      sesion.docenteId,
      diaSemana,
      disponibilidades
    );

    // Si el docente no tiene disponibilidad en este día, no generamos candidatos
    if (bloquesDisponibles.length === 0) {
      continue;
    }

    // Iterar sobre los posibles minutos de inicio según el paso de la cuadrícula
    for (
      let minutoInicio = jornadaInicioMinuto;
      minutoInicio + sesion.duracionMinutos <= jornadaFinMinuto;
      minutoInicio += pasoCuadriculaMinutos
    ) {
      const candidato: CandidatoHorario = {
        diaSemana,
        inicioMinuto: minutoInicio,
        finMinuto: minutoInicio + sesion.duracionMinutos,
      };

      // Verificar que el candidato quede completamente cubierto por al menos un bloque de disponibilidad del docente
      const estaCubiertoPorDisponibilidad = bloquesDisponibles.some((bloque) =>
        estaContenido(candidato, bloque)
      );

      if (estaCubiertoPorDisponibilidad) {
        candidatos.push(candidato);
      }
    }
  }

  return candidatos;
}

/**
 * Genera un mapa completo que asocia el ID de cada sesión con su lista de candidatos disponibles.
 */
export function generarMapaCandidatos(
  sesiones: SesionProgramable[],
  entrada: EntradaPlanificacion
): Map<string, CandidatoHorario[]> {
  const mapa = new Map<string, CandidatoHorario[]>();

  for (const sesion of sesiones) {
    const candidatos = generarCandidatosParaSesion(sesion, entrada);
    mapa.set(sesion.id, candidatos);
  }

  return mapa;
}
