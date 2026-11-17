import {
  CandidatoHorario,
  EntradaPlanificacion,
  EstadoPlanificacion,
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
  if (!intervalos || intervalos.length === 0) {
    return false;
  }

  for (const intervalo of intervalos) {
    contadorOps.total++;
    if (seSolapan(candidato, intervalo)) {
      return true;
    }
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
  const limiteTiempoMs = opciones?.limiteTiempoMs ?? 5_000;

  const contadorOps = { total: 0 };
  let nodosVisitados = 0;
  let retrocesos = 0;
  let limiteAlcanzado = false;

  const sesiones = generarSesionesProgramables(entrada.asignaciones);
  const mapaCandidatos = generarMapaCandidatos(sesiones, entrada);

  // Poda inicial segura: si alguna sesión no tiene candidatos posibles, no existe solución
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
        metricas: { tiempoMs, operaciones: 0, nodosVisitados: 0, retrocesos: 0 },
        validacion: validarHorario([], entrada, sesiones.length),
      };
    }
  }

  // Ordenar sesiones por menor cantidad de candidatos (heurística MRV)
  const sesionesOrdenadas = [...sesiones].sort((a, b) => {
    contadorOps.total++;
    const cantA = mapaCandidatos.get(a.id)?.length ?? 0;
    const cantB = mapaCandidatos.get(b.id)?.length ?? 0;
    return cantA - cantB;
  });

  const ocupacionDocentes = new Map<string, IntervaloTiempo[]>();
  const ocupacionGrupos = new Map<string, IntervaloTiempo[]>();
  const horarioActual: SesionAsignada[] = [];

  function resolver(indice: number): boolean {
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
  const tiempoMs = Number((finReloj - inicioReloj).toFixed(3));

  let estado: EstadoPlanificacion = "NO_SOLUTION";
  if (exito) {
    estado = "COMPLETED";
  } else if (limiteAlcanzado) {
    estado = "LIMIT_REACHED";
  }

  const idsAsignados = new Set(horarioActual.map((item) => item.sesion.id));
  const sesionesPendientes = sesiones.filter((s) => !idsAsignados.has(s.id));

  const validacion = validarHorario(horarioActual, entrada, sesiones.length);

  return {
    algoritmo: "BACKTRACKING",
    estado,
    completado: exito,
    sesionesAsignadas: horarioActual,
    sesionesPendientes,
    metricas: {
      tiempoMs,
      operaciones: contadorOps.total,
      nodosVisitados,
      retrocesos,
    },
    validacion,
  };
}
