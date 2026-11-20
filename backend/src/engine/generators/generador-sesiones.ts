import { AsignacionAcademica, SesionProgramable } from "../types/dominio.js";

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
      `Discrepancia en la asignación ${asignacion.id}: requeridos ${asignacion.minutosSemanales}m, calculados ${minutosCalculados}m.`
    );
  }
}

export function generarSesionesProgramables(asignaciones: AsignacionAcademica[]): SesionProgramable[] {
  const sesiones: SesionProgramable[] = [];

  for (const asignacion of asignaciones) {
    validarConsistenciaMinutos(asignacion);

    let sesionIndex = 1;
    for (const requerimiento of asignacion.requerimientos) {
      for (let indice = 1; indice <= requerimiento.cantidad; indice++) {
        sesiones.push({
          id: `asig-${asignacion.id}-req-${requerimiento.id}-ses-${indice}`,
          asignacionId: asignacion.id,
          requerimientoId: requerimiento.id,
          docenteId: asignacion.docenteId,
          grupoId: asignacion.grupoId,
          asignaturaId: asignacion.asignaturaId,
          numeroSesion: sesionIndex++,
          duracionMinutos: requerimiento.duracionMinutos,
        });
      }
    }
  }

  return sesiones;
}
