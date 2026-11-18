import {
  CandidatoHorario,
  DisponibilidadDocente,
  EntradaPlanificacion,
  SesionProgramable,
} from "../types/dominio.js";
import { estaContenido } from "../validation/intervalos.js";

function obtenerDisponibilidadDocenteEnDia(
  docenteId: number,
  diaSemana: number,
  disponibilidades: DisponibilidadDocente[]
): DisponibilidadDocente[] {
  return disponibilidades.filter(
    (disp) => disp.docenteId === docenteId && disp.diaSemana === diaSemana
  );
}

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

  for (const diaSemana of diasPermitidos) {
    const bloquesDisponibles = obtenerDisponibilidadDocenteEnDia(
      sesion.docenteId,
      diaSemana,
      disponibilidades
    );

    if (bloquesDisponibles.length === 0) continue;

    for (
      let inicio = jornadaInicioMinuto;
      inicio + sesion.duracionMinutos <= jornadaFinMinuto;
      inicio += pasoCuadriculaMinutos
    ) {
      const candidato: CandidatoHorario = {
        diaSemana,
        inicioMinuto: inicio,
        finMinuto: inicio + sesion.duracionMinutos,
      };

      const cubierto = bloquesDisponibles.some((bloque) => estaContenido(candidato, bloque));
      if (cubierto) {
        candidatos.push(candidato);
      }
    }
  }

  return candidatos;
}

export function generarMapaCandidatos(
  sesiones: SesionProgramable[],
  entrada: EntradaPlanificacion
): Map<string, CandidatoHorario[]> {
  const mapa = new Map<string, CandidatoHorario[]>();

  for (const sesion of sesiones) {
    mapa.set(sesion.id, generarCandidatosParaSesion(sesion, entrada));
  }

  return mapa;
}
