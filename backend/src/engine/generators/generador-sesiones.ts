/**
 * Generador de sesiones programables individuales.
 * Transforma los requerimientos semanales de cada asignación académica
 * en unidades de sesión atómicas listas para ser planificadas por los algoritmos.
 */

import { AsignacionAcademica, SesionProgramable } from "../types/dominio.js";

/**
 * Valida la consistencia de los minutos semanales frente a sus requerimientos de sesión.
 * Lanza un error detallado si la suma no coincide exactamente.
 */
export function validarConsistenciaMinutos(asignacion: AsignacionAcademica): void {
  const minutosCalculados = asignacion.requerimientos.reduce((acumulado, req) => {
    if (req.duracionMinutos <= 0 || req.cantidad <= 0) {
      throw new Error(
        `El requerimiento con ID ${req.id} en la asignación ${asignacion.id} tiene duración o cantidad inválida.`
      );
    }
    return acumulado + req.duracionMinutos * req.cantidad;
  }, 0);

  if (minutosCalculados !== asignacion.minutosSemanales) {
    throw new Error(
      `Discrepancia en la asignación ${asignacion.id}: los minutos semanales requeridos son ${asignacion.minutosSemanales}, ` +
      `pero la suma de sus requerimientos es ${minutosCalculados} minutos.`
    );
  }
}

/**
 * Genera la lista completa de sesiones programables individuales a partir de las asignaciones académicas.
 * Cada sesión recibe un identificador único y determinista.
 */
export function generarSesionesProgramables(asignaciones: AsignacionAcademica[]): SesionProgramable[] {
  const sesiones: SesionProgramable[] = [];

  for (const asignacion of asignaciones) {
    // 1. Validar la regla de negocio crítica: suma de requerimientos == minutos semanales
    validarConsistenciaMinutos(asignacion);

    // 2. Desglosar cada requerimiento en sus sesiones individuales
    for (const requerimiento of asignacion.requerimientos) {
      for (let indice = 1; indice <= requerimiento.cantidad; indice++) {
        const sesion: SesionProgramable = {
          id: `asig-${asignacion.id}-req-${requerimiento.id}-ses-${indice}`,
          asignacionId: asignacion.id,
          requerimientoId: requerimiento.id,
          docenteId: asignacion.docenteId,
          grupoId: asignacion.grupoId,
          asignaturaId: asignacion.asignaturaId,
          numeroSesion: indice,
          duracionMinutos: requerimiento.duracionMinutos,
        };

        sesiones.push(sesion);
      }
    }
  }

  return sesiones;
}
