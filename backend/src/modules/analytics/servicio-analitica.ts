import { prisma } from "../../config/database.js";

export interface MetricasCorridaDto {
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
  calidad: number;
  creadoEn: Date | null;
}

export interface ResultadoComparacionDto {
  runA: MetricasCorridaDto;
  runB: MetricasCorridaDto;
  mismoPeriodo: boolean;
  mismaEntrada: boolean;
  diferenciaTiempoMs: number;
  algoritmoMasRapido: string;
  razonVelocidad: number;
  diferenciaOperaciones: number;
  resumen: {
    eficiencia: string;
    completitud: string;
    factibilidad: string;
  };
}

function mapearEjecucion(e: any): MetricasCorridaDto {
  return {
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
    calidad: Number(e.quality_score ?? 0),
    creadoEn: e.created_at,
  };
}

export function construirComparacion(
  datosA: any,
  datosB: any
): ResultadoComparacionDto {
  const runA = mapearEjecucion(datosA);
  const runB = mapearEjecucion(datosB);

  const mismoPeriodo = runA.periodoId === runB.periodoId;
  const snapshotA = JSON.stringify(datosA.input_snapshot ?? {});
  const snapshotB = JSON.stringify(datosB.input_snapshot ?? {});
  const mismaEntrada = snapshotA === snapshotB;

  const diferenciaTiempoMs = Number((runA.duracionMs - runB.duracionMs).toFixed(3));
  const algoritmoMasRapido =
    runA.duracionMs < runB.duracionMs
      ? runA.algoritmo
      : runB.duracionMs < runA.duracionMs
      ? runB.algoritmo
      : "EMPATE";

  const tiempoMinimo = Math.min(runA.duracionMs, runB.duracionMs);
  const tiempoMaximo = Math.max(runA.duracionMs, runB.duracionMs);
  const razonVelocidad =
    tiempoMinimo > 0 ? Number((tiempoMaximo / tiempoMinimo).toFixed(2)) : 1;

  const diferenciaOperaciones = runA.operaciones - runB.operaciones;

  return {
    runA,
    runB,
    mismoPeriodo,
    mismaEntrada,
    diferenciaTiempoMs,
    algoritmoMasRapido,
    razonVelocidad,
    diferenciaOperaciones,
    resumen: {
      eficiencia:
        algoritmoMasRapido === "EMPATE"
          ? "Ambos algoritmos registraron el mismo tiempo de respuesta."
          : `${algoritmoMasRapido} fue ${razonVelocidad}x más rápido en esta instancia.`,
      completitud: `${runA.algoritmo} asignó ${runA.sesionesAsignadas} sesiones (pendientes: ${runA.sesionesPendientes}). ${runB.algoritmo} asignó ${runB.sesionesAsignadas} sesiones (pendientes: ${runB.sesionesPendientes}).`,
      factibilidad: `Conflictos duros detectados: ${runA.algoritmo} = ${runA.conflictos}, ${runB.algoritmo} = ${runB.conflictos}.`,
    },
  };
}

export async function obtenerAnaliticaEjecucion(idTexto: string) {
  const id = BigInt(idTexto);
  const ejecucion = await prisma.schedule_runs.findUnique({
    where: { id },
  });

  if (!ejecucion) {
    return null;
  }

  return {
    resumen: mapearEjecucion(ejecucion),
    snapshotEntrada: ejecucion.input_snapshot,
    metricasDetalle: ejecucion.metrics_json,
  };
}

export async function compararDosEjecuciones(
  idATexto: string,
  idBTexto: string
): Promise<ResultadoComparacionDto> {
  const idA = BigInt(idATexto);
  const idB = BigInt(idBTexto);

  const [ejecucionA, ejecucionB] = await Promise.all([
    prisma.schedule_runs.findUnique({ where: { id: idA } }),
    prisma.schedule_runs.findUnique({ where: { id: idB } }),
  ]);

  if (!ejecucionA) {
    throw new Error(`La ejecución con ID ${idATexto} no existe.`);
  }

  if (!ejecucionB) {
    throw new Error(`La ejecución con ID ${idBTexto} no existe.`);
  }

  return construirComparacion(ejecucionA, ejecucionB);
}
