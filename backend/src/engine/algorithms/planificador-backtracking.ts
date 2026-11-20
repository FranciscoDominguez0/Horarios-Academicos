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

export interface OpcionesBacktracking {
  limiteNodos?: number;
  limiteTiempoMs?: number;
}

function claveOcupacion(entidadId: number, diaSemana: number): string {
  return `${entidadId}-${diaSemana}`;
}

function hayConflicto(
  candidato: CandidatoHorario,
  intervalos: IntervaloTiempo[] | undefined,
  contadorOps: { total: number }
): boolean {
  if (!intervalos || intervalos.length === 0) return false;

  for (const intervalo of intervalos) {
    contadorOps.total++;
    if (seSolapan(candidato, intervalo)) return true;
  }

  return false;
}

function agregarOcupacion(
  mapa: Map<string, IntervaloTiempo[]>,
  clave: string,
  candidato: CandidatoHorario
): void {
  const lista = mapa.get(clave) ?? [];
  lista.push(candidato);
  mapa.set(clave, lista);
}

function removerOcupacion(
  mapa: Map<string, IntervaloTiempo[]>,
  clave: string
): void {
  const lista = mapa.get(clave);
  if (lista && lista.length > 0) {
    lista.pop();
  }
}

export function ejecutarPlanificacionBacktracking(
  entrada: EntradaPlanificacion,
  opciones?: OpcionesBacktracking
): ResultadoPlanificacion {
  const inicioReloj = performance.now();
  const limiteNodos = opciones?.limiteNodos ?? 500_000;
  const limiteTiempoMs = opciones?.limiteTiempoMs ?? 8_000;

  const contadorOps = { total: 0 };
  let nodosVisitados = 0;
  let retrocesos = 0;
  let limiteAlcanzado = false;

  const sesiones = generarSesionesProgramables(entrada.asignaciones);
  const mapaCandidatos = generarMapaCandidatos(sesiones, entrada);

  for (const sesion of sesiones) {
    const totalCandidatos = mapaCandidatos.get(sesion.id)?.length ?? 0;
    if (totalCandidatos === 0) {
      const tiempoMs = Number((performance.now() - inicioReloj).toFixed(3));
      return {
        algoritmo: "BACKTRACKING",
        estado: "NO_SOLUTION",
        completado: false,
        sesionesAsignadas: [],
        sesionesPendientes: sesiones,
        metricas: {
          tiempoMs,
          operaciones: 0,
          memoriaMb: Number((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)),
          nodosVisitados: 0,
          retrocesos: 0,
        },
        validacion: validarHorario([], entrada, sesiones.length),
      };
    }
  }

  // Ordenar por heurística MRV (menor cantidad de candidatos primero)
  // Con desempate por mayor duración (Degree Heuristic: bloques de 180 min primero para evitar fragmentación)
  const sesionesOrdenadas = [...sesiones].sort((a, b) => {
    contadorOps.total++;
    const cantA = mapaCandidatos.get(a.id)?.length ?? 0;
    const cantB = mapaCandidatos.get(b.id)?.length ?? 0;
    if (cantA !== cantB) return cantA - cantB;
    return b.duracionMinutos - a.duracionMinutos;
  });

  const ocupacionDocentes = new Map<string, IntervaloTiempo[]>();
  const ocupacionGrupos = new Map<string, IntervaloTiempo[]>();
  const horarioActual: SesionAsignada[] = [];
  let mejorHorario: SesionAsignada[] = [];

  function resolver(indice: number): boolean {
    if (horarioActual.length > mejorHorario.length) {
      mejorHorario = [...horarioActual];
    }

    if (indice === sesionesOrdenadas.length) {
      return true;
    }

    if (nodosVisitados >= limiteNodos || performance.now() - inicioReloj >= limiteTiempoMs) {
      limiteAlcanzado = true;
      return false;
    }

    const sesion = sesionesOrdenadas[indice];
    const candidatos = mapaCandidatos.get(sesion.id) ?? [];

    for (const candidato of candidatos) {
      nodosVisitados++;

      const claveDocente = claveOcupacion(sesion.docenteId, candidato.diaSemana);
      const claveGrupo = claveOcupacion(sesion.grupoId, candidato.diaSemana);

      const cruceDocente = hayConflicto(candidato, ocupacionDocentes.get(claveDocente), contadorOps);
      const cruceGrupo = hayConflicto(candidato, ocupacionGrupos.get(claveGrupo), contadorOps);

      if (!cruceDocente && !cruceGrupo) {
        agregarOcupacion(ocupacionDocentes, claveDocente, candidato);
        agregarOcupacion(ocupacionGrupos, claveGrupo, candidato);
        horarioActual.push({ sesion, candidato });

        if (resolver(indice + 1)) {
          return true;
        }

        removerOcupacion(ocupacionDocentes, claveDocente);
        removerOcupacion(ocupacionGrupos, claveGrupo);
        horarioActual.pop();
        retrocesos++;

        if (limiteAlcanzado) {
          return false;
        }
      }
    }

    return false;
  }

  const exito = resolver(0);
  const finReloj = performance.now();
  const duracionMs = Number((finReloj - inicioReloj).toFixed(3));

  let estado: "COMPLETED" | "NO_SOLUTION" | "LIMIT_REACHED";
  if (exito) {
    estado = "COMPLETED";
  } else if (limiteAlcanzado) {
    estado = "LIMIT_REACHED";
  } else {
    estado = "NO_SOLUTION";
  }

  const sesionesAsignadas = exito
    ? [...horarioActual]
    : (limiteAlcanzado && mejorHorario.length > 0 ? [...mejorHorario] : []);
  const sesionesPendientes = exito
    ? []
    : sesiones.filter((s) => !sesionesAsignadas.some((a) => a.sesion.id === s.id));

  const validacion = validarHorario(sesionesAsignadas, entrada, sesiones.length);
  const memoriaMb = Number((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2));

  return {
    algoritmo: "BACKTRACKING",
    estado,
    completado: exito,
    sesionesAsignadas,
    sesionesPendientes,
    metricas: {
      tiempoMs: duracionMs,
      operaciones: contadorOps.total,
      memoriaMb,
      nodosVisitados,
      retrocesos,
    },
    validacion,
  };
}
