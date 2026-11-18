export interface IntervaloTiempo {
  inicioMinuto: number;
  finMinuto: number;
}

export interface DisponibilidadDocente extends IntervaloTiempo {
  id: number;
  docenteId: number;
  diaSemana: number;
}

export interface RequerimientoSesion {
  id: number;
  asignacionId: number;
  duracionMinutos: number;
  cantidad: number;
}

export interface AsignacionAcademica {
  id: number;
  periodoId: number;
  asignaturaId: number;
  docenteId: number;
  grupoId: number;
  minutosSemanales: number;
  requerimientos: RequerimientoSesion[];
}

export interface SesionProgramable {
  id: string;
  asignacionId: number;
  requerimientoId: number;
  docenteId: number;
  grupoId: number;
  asignaturaId: number;
  numeroSesion: number;
  duracionMinutos: number;
}

export interface CandidatoHorario extends IntervaloTiempo {
  diaSemana: number;
}

export interface SesionAsignada {
  sesion: SesionProgramable;
  candidato: CandidatoHorario;
}

export enum TipoConflicto {
  CRUCE_DOCENTE = "CRUCE_DOCENTE",
  CRUCE_GRUPO = "CRUCE_GRUPO",
  DOCENTE_NO_DISPONIBLE = "DOCENTE_NO_DISPONIBLE",
  FUERA_DE_JORNADA = "FUERA_DE_JORNADA",
  DURACION_INVALIDA = "DURACION_INVALIDA",
  SESION_DUPLICADA = "SESION_DUPLICADA",
  SESION_FALTANTE = "SESION_FALTANTE",
  MINUTOS_SEMANALES_INCORRECTOS = "MINUTOS_SEMANALES_INCORRECTOS",
}

export interface ConflictoHorario {
  tipo: TipoConflicto;
  mensaje: string;
  sesionIds: string[];
  diaSemana?: number;
  docenteId?: number;
  grupoId?: number;
}

export interface ResultadoValidacion {
  esValido: boolean;
  conflictos: ConflictoHorario[];
  totalSesionesRequeridas: number;
  totalSesionesAsignadas: number;
}

export type EstadoPlanificacion = "COMPLETED" | "NO_SOLUTION" | "LIMIT_REACHED";

export interface MetricasEjecucion {
  tiempoMs: number;
  operaciones: number;
  nodosVisitados?: number;
  retrocesos?: number;
}

export interface ResultadoPlanificacion {
  algoritmo: "GREEDY" | "BACKTRACKING";
  estado: EstadoPlanificacion;
  completado: boolean;
  sesionesAsignadas: SesionAsignada[];
  sesionesPendientes: SesionProgramable[];
  metricas: MetricasEjecucion;
  validacion: ResultadoValidacion;
}

export interface EntradaPlanificacion {
  periodoId: number;
  jornadaInicioMinuto: number;
  jornadaFinMinuto: number;
  diasPermitidos: number[];
  pasoCuadriculaMinutos: number;
  asignaciones: AsignacionAcademica[];
  disponibilidades: DisponibilidadDocente[];
}
