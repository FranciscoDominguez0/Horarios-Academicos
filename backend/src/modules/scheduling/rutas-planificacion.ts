import { Request, Response, Router } from "express";
import {
  ejecutarYGuardarPlanificacion,
  listarEjecucionesDePeriodo,
  obtenerEjecucionPorId,
  obtenerSesionesDeEjecucion,
} from "./servicio-planificacion.js";

export const enrutadorPlanificacion = Router();

enrutadorPlanificacion.post("/greedy", async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodoId, jornadaInicioMinuto, jornadaFinMinuto, diasPermitidos, pasoCuadriculaMinutos } = req.body;

    if (!periodoId || typeof periodoId !== "number") {
      res.status(400).json({ mensaje: "El campo 'periodoId' es obligatorio y debe ser numérico." });
      return;
    }

    const respuesta = await ejecutarYGuardarPlanificacion("GREEDY", {
      periodoId,
      jornadaInicioMinuto,
      jornadaFinMinuto,
      diasPermitidos,
      pasoCuadriculaMinutos,
    });

    res.status(201).json(respuesta);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al ejecutar Greedy." });
  }
});

enrutadorPlanificacion.post("/backtracking", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      periodoId,
      jornadaInicioMinuto,
      jornadaFinMinuto,
      diasPermitidos,
      pasoCuadriculaMinutos,
      limiteNodos,
      limiteTiempoMs,
    } = req.body;

    if (!periodoId || typeof periodoId !== "number") {
      res.status(400).json({ mensaje: "El campo 'periodoId' es obligatorio y debe ser numérico." });
      return;
    }

    const respuesta = await ejecutarYGuardarPlanificacion("BACKTRACKING", {
      periodoId,
      jornadaInicioMinuto,
      jornadaFinMinuto,
      diasPermitidos,
      pasoCuadriculaMinutos,
      limiteNodos,
      limiteTiempoMs,
    });

    res.status(201).json(respuesta);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al ejecutar Backtracking." });
  }
});

function obtenerParametroString(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? "";
  }
  return valor ?? "";
}

enrutadorPlanificacion.get("/runs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroString(req.params.id);
    const ejecucion = await obtenerEjecucionPorId(id);

    if (!ejecucion) {
      res.status(404).json({ mensaje: `Ejecución con ID ${id} no encontrada.` });
      return;
    }

    res.json(ejecucion);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener ejecución." });
  }
});

enrutadorPlanificacion.get("/runs/:id/sessions", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroString(req.params.id);
    const sesiones = await obtenerSesionesDeEjecucion(id);
    res.json(sesiones);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener sesiones de ejecución." });
  }
});

enrutadorPlanificacion.get("/periods/:periodId/runs", async (req: Request, res: Response): Promise<void> => {
  try {
    const periodoIdStr = obtenerParametroString(req.params.periodId);
    const periodoId = parseInt(periodoIdStr, 10);
    if (isNaN(periodoId)) {
      res.status(400).json({ mensaje: "El parámetro 'periodId' debe ser un número entero." });
      return;
    }

    const lista = await listarEjecucionesDePeriodo(periodoId);
    res.json(lista);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al listar ejecuciones del período." });
  }
});
