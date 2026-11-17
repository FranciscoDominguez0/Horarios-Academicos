/**
 * Validador independiente de restricciones duras para horarios académicos.
 * 
 * Este componente es completamente agnóstico al algoritmo utilizado (Greedy, Backtracking o manual).
 * Su responsabilidad única es inspeccionar una solución propuesta y generar una lista estructurada
 * de todos los conflictos o incumplimientos encontrados frente a las reglas obligatorias.
 */

import {
  ConflictoHorario,
  EntradaPlanificacion,
  ResultadoValidacion,
  SesionAsignada,
  TipoConflicto,
} from "../types/dominio.js";
import { estaContenido, minutosAHoraTexto, seSolapan } from "./intervalos.js";

/**
 * Valida un conjunto de sesiones asignadas frente a todas las restricciones duras del sistema.
 * 
 * Reglas evaluadas:
 * 1. Sin cruces de docente: un docente no puede impartir dos sesiones solapadas.
 * 2. Sin cruces de grupo: un grupo de estudiantes no puede tener dos sesiones solapadas.
 * 3. Disponibilidad docente: la sesión debe estar completamente dentro de una franja disponible del docente.
 * 4. Límites de jornada: la sesión debe iniciar y terminar dentro del horario institucional y en días permitidos.
 * 5. Duración correcta: la duración del candidato debe coincidir exactamente con los minutos de la sesión.
 * 6. Sin duplicidad: ninguna sesión lógica puede estar asignada más de una vez.
 */
export function validarHorario(
  sesionesAsignadas: SesionAsignada[],
  entrada: EntradaPlanificacion,
  totalSesionesRequeridas: number
): ResultadoValidacion {
  const conflictos: ConflictoHorario[] = [];
  const idsVistos = new Set<string>();

  // 1. Validar no duplicidad y restricciones individuales por sesión
  for (const { sesion, candidato } of sesionesAsignadas) {
    // 1.1 Duplicidad
    if (idsVistos.has(sesion.id)) {
      conflictos.push({
        tipo: TipoConflicto.SESION_DUPLICADA,
        mensaje: `La sesión con ID "${sesion.id}" fue asignada más de una vez en el horario.`,
        sesionIds: [sesion.id],
      });
    }
    idsVistos.add(sesion.id);

    // 1.2 Duración correcta
    const duracionCandidato = candidato.finMinuto - candidato.inicioMinuto;
    if (duracionCandidato !== sesion.duracionMinutos) {
      conflictos.push({
        tipo: TipoConflicto.DURACION_INVALIDA,
        mensaje: `La sesión "${sesion.id}" requiere ${sesion.duracionMinutos} minutos pero el horario tiene ${duracionCandidato} minutos.`,
        sesionIds: [sesion.id],
      });
    }

    // 1.3 Límites de jornada y días permitidos
    const enDiaPermitido = entrada.diasPermitidos.includes(candidato.diaSemana);
    const dentroDeJornada =
      candidato.inicioMinuto >= entrada.jornadaInicioMinuto &&
      candidato.finMinuto <= entrada.jornadaFinMinuto;

    if (!enDiaPermitido || !dentroDeJornada) {
      conflictos.push({
        tipo: TipoConflicto.FUERA_DE_JORNADA,
        mensaje:
          `La sesión "${sesion.id}" (${minutosAHoraTexto(candidato.inicioMinuto)}-${minutosAHoraTexto(candidato.finMinuto)}) ` +
          `está fuera de la jornada institucional permitida.`,
        sesionIds: [sesion.id],
        diaSemana: candidato.diaSemana,
      });
    }

    // 1.4 Disponibilidad docente
    const disponibilidadesDocente = entrada.disponibilidades.filter(
      (disp) => disp.docenteId === sesion.docenteId && disp.diaSemana === candidato.diaSemana
    );

    const estaEnDisponibilidad = disponibilidadesDocente.some((disp) =>
      estaContenido(candidato, disp)
    );

    if (!estaEnDisponibilidad) {
      conflictos.push({
        tipo: TipoConflicto.DOCENTE_NO_DISPONIBLE,
        mensaje:
          `El docente ${sesion.docenteId} no tiene disponibilidad el día ${candidato.diaSemana} ` +
          `en el intervalo ${minutosAHoraTexto(candidato.inicioMinuto)}-${minutosAHoraTexto(candidato.finMinuto)} para la sesión "${sesion.id}".`,
        sesionIds: [sesion.id],
        diaSemana: candidato.diaSemana,
        docenteId: sesion.docenteId,
      });
    }
  }

  // 2. Validar cruces mutuos (docentes y grupos)
  const total = sesionesAsignadas.length;
  for (let i = 0; i < total; i++) {
    const actual = sesionesAsignadas[i];

    for (let j = i + 1; j < total; j++) {
      const otra = sesionesAsignadas[j];

      // Solo pueden cruzar si ocurren el mismo día de la semana
      if (actual.candidato.diaSemana !== otra.candidato.diaSemana) {
        continue;
      }

      // Si se solapan en tiempo
      if (seSolapan(actual.candidato, otra.candidato)) {
        // Cruce de docente
        if (actual.sesion.docenteId === otra.sesion.docenteId) {
          conflictos.push({
            tipo: TipoConflicto.CRUCE_DOCENTE,
            mensaje:
              `Cruce del docente ${actual.sesion.docenteId}: imparte simultáneamente las sesiones ` +
              `"${actual.sesion.id}" y "${otra.sesion.id}" el día ${actual.candidato.diaSemana} ` +
              `entre ${minutosAHoraTexto(Math.max(actual.candidato.inicioMinuto, otra.candidato.inicioMinuto))} ` +
              `y ${minutosAHoraTexto(Math.min(actual.candidato.finMinuto, otra.candidato.finMinuto))}.`,
            sesionIds: [actual.sesion.id, otra.sesion.id],
            diaSemana: actual.candidato.diaSemana,
            docenteId: actual.sesion.docenteId,
          });
        }

        // Cruce de grupo
        if (actual.sesion.grupoId === otra.sesion.grupoId) {
          conflictos.push({
            tipo: TipoConflicto.CRUCE_GRUPO,
            mensaje:
              `Cruce del grupo ${actual.sesion.grupoId}: tiene simultáneamente las sesiones ` +
              `"${actual.sesion.id}" y "${otra.sesion.id}" el día ${actual.candidato.diaSemana} ` +
              `entre ${minutosAHoraTexto(Math.max(actual.candidato.inicioMinuto, otra.candidato.inicioMinuto))} ` +
              `y ${minutosAHoraTexto(Math.min(actual.candidato.finMinuto, otra.candidato.finMinuto))}.`,
            sesionIds: [actual.sesion.id, otra.sesion.id],
            diaSemana: actual.candidato.diaSemana,
            grupoId: actual.sesion.grupoId,
          });
        }
      }
    }
  }

  return {
    esValido: conflictos.length === 0,
    conflictos,
    totalSesionesRequeridas,
    totalSesionesAsignadas: sesionesAsignadas.length,
  };
}
