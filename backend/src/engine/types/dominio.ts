/**
 * Definición de tipos y modelos de dominio puros para el motor de planificación.
 * Este archivo no debe importar ninguna librería externa ni tener dependencias
 * de bases de datos, ORM o frameworks web.
 */

/**
 * Representa un intervalo de tiempo continuo en minutos desde la medianoche (00:00).
 * Ejemplo: 08:00 = 480, 10:00 = 600.
 */
export interface IntervaloTiempo {
  inicioMinuto: number;
  finMinuto: number;
}

/**
 * Intervalo de disponibilidad horaria de un docente en un día específico.
 * Días de la semana: 1 = Lunes, 2 = Martes, ..., 7 = Domingo.
 */
export interface DisponibilidadDocente extends IntervaloTiempo {
  id: number;
  docenteId: number;
  diaSemana: number; // 1 a 7
}

/**
 * Requerimiento de sesiones para cubrir las horas semanales de una asignación.
 * Ejemplo: 240 minutos divididos en 2 sesiones de 120 minutos cada una.
 */
export interface RequerimientoSesion {
  id: number;
  asignacionId: number;
  duracionMinutos: number;
  cantidad: number;
}

/**
 * Asignación académica entre docente, asignatura, grupo y período.
 */
export interface AsignacionAcademica {
  id: number;
  periodoId: number;
  asignaturaId: number;
  docenteId: number;
  grupoId: number;
  minutosSemanales: number;
  requerimientos: RequerimientoSesion[];
}

/**
 * Representa una sesión individual que debe ubicarse en el calendario.
 * Se genera a partir de un RequerimientoSesion.
 */
export interface SesionProgramable {
  id: string; // Identificador único de sesión (ej. "asig-1-req-1-ses-1")
  asignacionId: number;
  requerimientoId: number;
  docenteId: number;
  grupoId: number;
  asignaturaId: number;
  numeroSesion: number; // Índice de la sesión dentro de su requerimiento (1..N)
  duracionMinutos: number;
}

/**
 * Propuesta de franja horaria para ubicar una sesión.
 */
export interface CandidatoHorario extends IntervaloTiempo {
  diaSemana: number; // 1 a 7
}

/**
 * Sesión programable que ya ha sido ubicada en un día y horario específico.
 */
export interface SesionAsignada {
  sesion: SesionProgramable;
  candidato: CandidatoHorario;
}

/**
 * Tipos de conflictos que puede detectar el validador independiente.
 */
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

/**
 * Representa un conflicto estructurado detectado en un horario.
 */
export interface ConflictoHorario {
  tipo: TipoConflicto;
  mensaje: string;
  sesionIds: string[];
  diaSemana?: number;
  docenteId?: number;
  grupoId?: number;
}

/**
 * Resultado de la validación independiente de un conjunto de sesiones asignadas.
 */
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

/**
 * Datos de entrada inmutables requeridos por el motor algorítmico.
 */
export interface EntradaPlanificacion {
  periodoId: number;
  jornadaInicioMinuto: number; // Ej. 420 (07:00)
  jornadaFinMinuto: number; // Ej. 1080 (18:00)
  diasPermitidos: number[]; // Ej. [1, 2, 3, 4, 5] (Lunes a Viernes)
  pasoCuadriculaMinutos: number; // Ej. 30 minutos
  asignaciones: AsignacionAcademica[];
  disponibilidades: DisponibilidadDocente[];
}
