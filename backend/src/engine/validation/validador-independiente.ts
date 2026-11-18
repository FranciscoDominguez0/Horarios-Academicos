import {
  ConflictoHorario,
  EntradaPlanificacion,
  ResultadoValidacion,
  SesionAsignada,
  TipoConflicto,
} from "../types/dominio.js";
import { estaContenido, minutosAHoraTexto, seSolapan } from "./intervalos.js";

export function validarHorario(
  sesionesAsignadas: SesionAsignada[],
  entrada: EntradaPlanificacion,
  totalSesionesRequeridas: number
): ResultadoValidacion {
  const conflictos: ConflictoHorario[] = [];
  const idsVistos = new Set<string>();

  for (const { sesion, candidato } of sesionesAsignadas) {
    if (idsVistos.has(sesion.id)) {
      conflictos.push({
        tipo: TipoConflicto.SESION_DUPLICADA,
        mensaje: `La sesión "${sesion.id}" fue asignada más de una vez.`,
        sesionIds: [sesion.id],
      });
    }
    idsVistos.add(sesion.id);

    const duracionCandidato = candidato.finMinuto - candidato.inicioMinuto;
    if (duracionCandidato !== sesion.duracionMinutos) {
      conflictos.push({
        tipo: TipoConflicto.DURACION_INVALIDA,
        mensaje: `La sesión "${sesion.id}" requiere ${sesion.duracionMinutos}m pero tiene ${duracionCandidato}m.`,
        sesionIds: [sesion.id],
      });
    }

    const enDiaPermitido = entrada.diasPermitidos.includes(candidato.diaSemana);
    const dentroDeJornada =
      candidato.inicioMinuto >= entrada.jornadaInicioMinuto &&
      candidato.finMinuto <= entrada.jornadaFinMinuto;

    if (!enDiaPermitido || !dentroDeJornada) {
      conflictos.push({
        tipo: TipoConflicto.FUERA_DE_JORNADA,
        mensaje: `La sesión "${sesion.id}" (${minutosAHoraTexto(candidato.inicioMinuto)}-${minutosAHoraTexto(candidato.finMinuto)}) está fuera de la jornada institucional.`,
        sesionIds: [sesion.id],
        diaSemana: candidato.diaSemana,
      });
    }

    const disponibilidadesDocente = entrada.disponibilidades.filter(
      (disp) => disp.docenteId === sesion.docenteId && disp.diaSemana === candidato.diaSemana
    );

    const estaEnDisponibilidad = disponibilidadesDocente.some((disp) =>
      estaContenido(candidato, disp)
    );

    if (!estaEnDisponibilidad) {
      conflictos.push({
        tipo: TipoConflicto.DOCENTE_NO_DISPONIBLE,
        mensaje: `El docente ${sesion.docenteId} no tiene disponibilidad el día ${candidato.diaSemana} en el intervalo ${minutosAHoraTexto(candidato.inicioMinuto)}-${minutosAHoraTexto(candidato.finMinuto)}.`,
        sesionIds: [sesion.id],
        diaSemana: candidato.diaSemana,
        docenteId: sesion.docenteId,
      });
    }
  }

  const total = sesionesAsignadas.length;
  for (let i = 0; i < total; i++) {
    for (let j = i + 1; j < total; j++) {
      const actual = sesionesAsignadas[i];
      const otra = sesionesAsignadas[j];

      if (actual.candidato.diaSemana !== otra.candidato.diaSemana) continue;

      const seCruzan = seSolapan(actual.candidato, otra.candidato);
      if (!seCruzan) continue;

      if (actual.sesion.docenteId === otra.sesion.docenteId) {
        conflictos.push({
          tipo: TipoConflicto.CRUCE_DOCENTE,
          mensaje: `Cruce horario para el docente ${actual.sesion.docenteId} entre "${actual.sesion.id}" y "${otra.sesion.id}" el día ${actual.candidato.diaSemana}.`,
          sesionIds: [actual.sesion.id, otra.sesion.id],
          diaSemana: actual.candidato.diaSemana,
          docenteId: actual.sesion.docenteId,
        });
      }

      if (actual.sesion.grupoId === otra.sesion.grupoId) {
        conflictos.push({
          tipo: TipoConflicto.CRUCE_GRUPO,
          mensaje: `Cruce horario para el grupo ${actual.sesion.grupoId} entre "${actual.sesion.id}" y "${otra.sesion.id}" el día ${actual.candidato.diaSemana}.`,
          sesionIds: [actual.sesion.id, otra.sesion.id],
          diaSemana: actual.candidato.diaSemana,
          grupoId: actual.sesion.grupoId,
        });
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
