import { prisma } from "../../config/database.js";
import { EntradaPlanificacion, ResultadoPlanificacion } from "../../engine/types/dominio.js";
import { ejecutarPlanificacionGreedy } from "../../engine/algorithms/planificador-greedy.js";
import {
  ejecutarPlanificacionBacktracking,
  OpcionesBacktracking,
} from "../../engine/algorithms/planificador-backtracking.js";
import { cargarEntradaDesdeBd, OpcionesCargaPlanificacion } from "./adaptador-datos.js";

export interface PeticionPlanificacion extends OpcionesCargaPlanificacion, OpcionesBacktracking {
  periodoId: number;
}

export interface ResumenEjecucionDto {
  id: string;
  periodoId: number;
  algoritmo: string;
  estado: string;
  duracionMs: number;
  operaciones: number;
  nodosVisitados: number;
  retrocesos: number;
  sesionesAsignadas: number;
  sesionesPendientes: number;
  conflictos: number;
  esValido: boolean;
}

export async function guardarResultadoEnBd(
  entrada: EntradaPlanificacion,
  resultado: ResultadoPlanificacion,
  inicioFecha: Date,
  finFecha: Date
): Promise<string> {
  const guardado = await prisma.$transaction(async (tx) => {
    const ejecucion = await tx.schedule_runs.create({
      data: {
        period_id: entrada.periodoId,
        algorithm: resultado.algoritmo,
        status: resultado.estado,
        started_at: inicioFecha,
        finished_at: finFecha,
        duration_ms: resultado.metricas.tiempoMs,
        operations: BigInt(resultado.metricas.operaciones),
        nodes_visited: BigInt(resultado.metricas.nodosVisitados ?? 0),
        backtracks: BigInt(resultado.metricas.retrocesos ?? 0),
        assigned_sessions: resultado.sesionesAsignadas.length,
        unassigned_sessions: resultado.sesionesPendientes.length,
        conflicts_found: resultado.validacion.conflictos.length,
        quality_score: resultado.validacion.esValido && resultado.completado ? 100 : 50,
        input_snapshot: JSON.parse(JSON.stringify(entrada)),
        metrics_json: JSON.parse(
          JSON.stringify({
            metricas: resultado.metricas,
            conflictos: resultado.validacion.conflictos,
            sesionesPendientes: resultado.sesionesPendientes,
          })
        ),
      },
    });

    if (resultado.sesionesAsignadas.length > 0) {
      await tx.schedule_sessions.createMany({
        data: resultado.sesionesAsignadas.map((item) => ({
          run_id: ejecucion.id,
          requirement_id: item.sesion.requerimientoId,
          session_number: item.sesion.numeroSesion,
          day_of_week: item.candidato.diaSemana,
          start_minute: item.candidato.inicioMinuto,
          end_minute: item.candidato.finMinuto,
        })),
      });
    }

    return ejecucion.id.toString();
  });

  return guardado;
}

export async function ejecutarYGuardarPlanificacion(
  tipo: "GREEDY" | "BACKTRACKING",
  params: PeticionPlanificacion
): Promise<{ ejecucionId: string; resultado: ResultadoPlanificacion }> {
  const inicioFecha = new Date();

  const entrada = await cargarEntradaDesdeBd(params.periodoId, {
    jornadaInicioMinuto: params.jornadaInicioMinuto,
    jornadaFinMinuto: params.jornadaFinMinuto,
    diasPermitidos: params.diasPermitidos,
    pasoCuadriculaMinutos: params.pasoCuadriculaMinutos,
  });

  let resultado: ResultadoPlanificacion;

  if (tipo === "GREEDY") {
    resultado = ejecutarPlanificacionGreedy(entrada);
  } else {
    resultado = ejecutarPlanificacionBacktracking(entrada, {
      limiteNodos: params.limiteNodos,
      limiteTiempoMs: params.limiteTiempoMs,
    });
  }

  const finFecha = new Date();
  const ejecucionId = await guardarResultadoEnBd(entrada, resultado, inicioFecha, finFecha);

  return { ejecucionId, resultado };
}

export async function obtenerEjecucionPorId(idTexto: string) {
  const id = BigInt(idTexto);
  const ejecucion = await prisma.schedule_runs.findUnique({
    where: { id },
  });

  if (!ejecucion) {
    return null;
  }

  return {
    id: ejecucion.id.toString(),
    periodoId: ejecucion.period_id,
    algoritmo: ejecucion.algorithm,
    estado: ejecucion.status,
    duracionMs: Number(ejecucion.duration_ms ?? 0),
    operaciones: Number(ejecucion.operations ?? 0),
    nodosVisitados: Number(ejecucion.nodes_visited ?? 0),
    retrocesos: Number(ejecucion.backtracks ?? 0),
    sesionesAsignadas: ejecucion.assigned_sessions ?? 0,
    sesionesPendientes: ejecucion.unassigned_sessions ?? 0,
    conflictos: ejecucion.conflicts_found ?? 0,
    calidad: Number(ejecucion.quality_score ?? 0),
    iniciadoEn: ejecucion.started_at,
    finalizadoEn: ejecucion.finished_at,
    creadoEn: ejecucion.created_at,
    snapshotEntrada: ejecucion.input_snapshot,
    metricasJson: ejecucion.metrics_json,
  };
}

const SALONES_DISPONIBLES = ["Salón 101", "Salón 102", "Salón 103"];
const PREFERENCIA_SALON: Record<string, string> = {
  "1ANO": "Salón 101",
  "2ANO": "Salón 102",
  "3ANO": "Salón 103",
};

export async function obtenerSesionesDeEjecucion(idTexto: string) {
  const runId = BigInt(idTexto);
  const sesiones = await prisma.schedule_sessions.findMany({
    where: { run_id: runId },
    include: {
      session_requirements: {
        include: {
          course_assignments: {
            include: {
              teachers: true,
              subjects: true,
              student_groups: true,
            },
          },
        },
      },
    },
    orderBy: [{ day_of_week: "asc" }, { start_minute: "asc" }],
  });

  // Estructura para registrar ocupación de cada salón por día
  const ocupacionSalones = new Map<string, Array<{ dia: number; inicio: number; fin: number }>>();
  SALONES_DISPONIBLES.forEach((salon) => ocupacionSalones.set(salon, []));

  return sesiones.map((s) => {
    const dia = s.day_of_week;
    const inicio = s.start_minute;
    const fin = s.end_minute;
    const grupoCodigo = s.session_requirements.course_assignments.student_groups.code;
    const salonPreferido = PREFERENCIA_SALON[grupoCodigo] || "Salón 101";

    // Intentar asignar salón preferido si está libre
    let salonAsignado = "";
    const ocupacionPref = ocupacionSalones.get(salonPreferido) ?? [];
    const solapaPref = ocupacionPref.some(
      (o) => o.dia === dia && Math.max(inicio, o.inicio) < Math.min(fin, o.fin)
    );

    if (!solapaPref) {
      salonAsignado = salonPreferido;
    } else {
      // Buscar el primer salón libre entre los 3
      for (const salon of SALONES_DISPONIBLES) {
        const ocup = ocupacionSalones.get(salon) ?? [];
        const solapa = ocup.some(
          (o) => o.dia === dia && Math.max(inicio, o.inicio) < Math.min(fin, o.fin)
        );
        if (!solapa) {
          salonAsignado = salon;
          break;
        }
      }
      if (!salonAsignado) {
        salonAsignado = SALONES_DISPONIBLES[0];
      }
    }

    // Registrar ocupación
    const listaOcupacion = ocupacionSalones.get(salonAsignado) ?? [];
    listaOcupacion.push({ dia, inicio, fin });
    ocupacionSalones.set(salonAsignado, listaOcupacion);

    return {
      id: s.id.toString(),
      runId: s.run_id.toString(),
      diaSemana: s.day_of_week,
      inicioMinuto: s.start_minute,
      finMinuto: s.end_minute,
      numeroSesion: s.session_number,
      duracionMinutos: s.session_requirements.duration_minutes,
      asignatura: s.session_requirements.course_assignments.subjects.name,
      grupo: s.session_requirements.course_assignments.student_groups.name,
      grupoCodigo,
      salon: salonAsignado,
      docente: `${s.session_requirements.course_assignments.teachers.first_name} ${s.session_requirements.course_assignments.teachers.last_name}`,
    };
  });
}

export async function listarEjecucionesDePeriodo(periodoId: number) {
  const ejecuciones = await prisma.schedule_runs.findMany({
    where: { period_id: periodoId },
    orderBy: { created_at: "desc" },
  });

  return ejecuciones.map((e) => ({
    id: e.id.toString(),
    periodoId: e.period_id,
    algoritmo: e.algorithm,
    estado: e.status,
    duracionMs: Number(e.duration_ms ?? 0),
    operaciones: Number(e.operations ?? 0),
    nodosVisitados: Number(e.nodes_visited ?? 0),
    retrocesos: Number(e.backtracks ?? 0),
    sesionesAsignadas: e.assigned_sessions ?? 0,
    sesionesPendientes: e.unassigned_sessions ?? 0,
    conflictos: e.conflicts_found ?? 0,
    creadoEn: e.created_at,
  }));
}

export async function limpiarEjecucionesDePeriodo(periodoId: number): Promise<number> {
  const runs = await prisma.schedule_runs.findMany({
    where: { period_id: periodoId },
    select: { id: true },
  });

  if (runs.length === 0) return 0;

  const runIds = runs.map((r) => r.id);

  await prisma.$transaction([
    prisma.schedule_sessions.deleteMany({
      where: { run_id: { in: runIds } },
    }),
    prisma.schedule_runs.deleteMany({
      where: { id: { in: runIds } },
    }),
  ]);

  return runIds.length;
}
