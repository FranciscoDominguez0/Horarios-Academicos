import { prisma } from "../../config/database.js";
import {
  AsignacionAcademica,
  DisponibilidadDocente,
  EntradaPlanificacion,
  RequerimientoSesion,
} from "../../engine/types/dominio.js";

export interface OpcionesCargaPlanificacion {
  jornadaInicioMinuto?: number;
  jornadaFinMinuto?: number;
  diasPermitidos?: number[];
  pasoCuadriculaMinutos?: number;
}

export async function cargarEntradaDesdeBd(
  periodoId: number,
  opciones?: OpcionesCargaPlanificacion
): Promise<EntradaPlanificacion> {
  const periodo = await prisma.academic_periods.findUnique({
    where: { id: periodoId },
  });

  if (!periodo) {
    throw new Error(`El período académico ${periodoId} no existe.`);
  }

  const asignacionesBd = await prisma.course_assignments.findMany({
    where: {
      period_id: periodoId,
      active: true,
    },
    include: {
      session_requirements: true,
    },
  });

  if (asignacionesBd.length === 0) {
    throw new Error(`No hay asignaciones activas para el período ${periodoId}.`);
  }

  const asignacionesDominio: AsignacionAcademica[] = asignacionesBd.map((asig) => {
    const requerimientosDominio: RequerimientoSesion[] = asig.session_requirements.map((req) => ({
      id: req.id,
      asignacionId: req.assignment_id,
      duracionMinutos: req.duration_minutes,
      cantidad: req.quantity,
    }));

    return {
      id: asig.id,
      periodoId: asig.period_id,
      asignaturaId: asig.subject_id,
      docenteId: asig.teacher_id,
      grupoId: asig.group_id,
      minutosSemanales: asig.weekly_minutes,
      requerimientos: requerimientosDominio,
    };
  });

  const idsDocentes = Array.from(new Set(asignacionesDominio.map((a) => a.docenteId)));

  const disponibilidadesBd = await prisma.teacher_availability.findMany({
    where: { teacher_id: { in: idsDocentes } },
  });

  const disponibilidadesDominio: DisponibilidadDocente[] = disponibilidadesBd.map((disp) => ({
    id: disp.id,
    docenteId: disp.teacher_id,
    diaSemana: disp.day_of_week,
    inicioMinuto: disp.start_minute,
    finMinuto: disp.end_minute,
  }));

  return {
    periodoId,
    jornadaInicioMinuto: opciones?.jornadaInicioMinuto ?? 480, // 08:00
    jornadaFinMinuto: opciones?.jornadaFinMinuto ?? 900,   // 15:00 maximo
    diasPermitidos: opciones?.diasPermitidos ?? [1, 2, 3, 4, 5],
    pasoCuadriculaMinutos: opciones?.pasoCuadriculaMinutos ?? 60,
    asignaciones: asignacionesDominio,
    disponibilidades: disponibilidadesDominio,
  };
}
