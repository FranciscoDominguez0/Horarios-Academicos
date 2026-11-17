/**
 * Adaptador de datos para el motor de planificación.
 * 
 * Actúa como puente entre la capa de persistencia (Prisma / MySQL)
 * y el motor algorítmico puro (Engine).
 * 
 * Este módulo extrae las asignaciones activas, sus requerimientos de sesión
 * y la disponibilidad de los docentes involucrados, transformándolos
 * en una estructura inmutable `EntradaPlanificacion`.
 */

import { prisma } from "../../config/database.js";
import {
  AsignacionAcademica,
  DisponibilidadDocente,
  EntradaPlanificacion,
  RequerimientoSesion,
} from "../../engine/types/dominio.js";

/**
 * Parámetros opcionales para personalizar la jornada de planificación.
 */
export interface OpcionesCargaPlanificacion {
  jornadaInicioMinuto?: number; // Por defecto 420 (07:00)
  jornadaFinMinuto?: number; // Por defecto 1080 (18:00)
  diasPermitidos?: number[]; // Por defecto [1, 2, 3, 4, 5] (Lunes a Viernes)
  pasoCuadriculaMinutos?: number; // Por defecto 30 minutos
}

/**
 * Carga desde la base de datos MySQL toda la información académica necesaria
 * para un período lectivo específico y construye la `EntradaPlanificacion` requerida por el motor.
 */
export async function cargarEntradaDesdeBd(
  periodoId: number,
  opciones?: OpcionesCargaPlanificacion
): Promise<EntradaPlanificacion> {
  // 1. Verificar existencia y estado del período académico
  const periodo = await prisma.academic_periods.findUnique({
    where: { id: periodoId },
  });

  if (!periodo) {
    throw new Error(`El período académico con ID ${periodoId} no existe en la base de datos.`);
  }

  // 2. Obtener las asignaciones académicas activas del período con sus requerimientos
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
    throw new Error(`No se encontraron asignaciones académicas activas para el período ID ${periodoId}.`);
  }

  // 3. Mapear asignaciones y requerimientos a los tipos de dominio puro
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

  // 4. Identificar docentes únicos involucrados en las asignaciones
  const idsDocentesUnicos = Array.from(
    new Set(asignacionesDominio.map((asig) => asig.docenteId))
  );

  // 5. Cargar disponibilidad horaria de los docentes involucrados
  const disponibilidadesBd = await prisma.teacher_availability.findMany({
    where: {
      teacher_id: { in: idsDocentesUnicos },
    },
  });

  const disponibilidadesDominio: DisponibilidadDocente[] = disponibilidadesBd.map((disp) => ({
    id: disp.id,
    docenteId: disp.teacher_id,
    diaSemana: disp.day_of_week,
    inicioMinuto: disp.start_minute,
    finMinuto: disp.end_minute,
  }));

  // 6. Construir y retornar la entrada inmutable para el motor
  return {
    periodoId,
    jornadaInicioMinuto: opciones?.jornadaInicioMinuto ?? 420, // 07:00
    jornadaFinMinuto: opciones?.jornadaFinMinuto ?? 1080, // 18:00
    diasPermitidos: opciones?.diasPermitidos ?? [1, 2, 3, 4, 5], // Lunes a Viernes
    pasoCuadriculaMinutos: opciones?.pasoCuadriculaMinutos ?? 30, // Grilla cada 30 min
    asignaciones: asignacionesDominio,
    disponibilidades: disponibilidadesDominio,
  };
}
