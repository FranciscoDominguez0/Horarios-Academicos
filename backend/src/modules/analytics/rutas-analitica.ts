import { Request, Response, Router } from "express";
import {
  compararDosEjecuciones,
  obtenerAnaliticaEjecucion,
} from "./servicio-analitica.js";

export const enrutadorAnalitica = Router();

function obtenerParametro(valor: any): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return typeof valor === "string" ? valor : "";
}

enrutadorAnalitica.get("/compare", async (req: Request, res: Response): Promise<void> => {
  try {
    const runA = obtenerParametro(req.query.runA);
    const runB = obtenerParametro(req.query.runB);

    if (!runA || !runB) {
      res.status(400).json({
        mensaje: "Debes proporcionar los parámetros 'runA' y 'runB' en la consulta.",
      });
      return;
    }

    const comparativa = await compararDosEjecuciones(runA, runB);
    res.json(comparativa);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al comparar ejecuciones." });
  }
});

enrutadorAnalitica.get("/runs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametro(req.params.id);
    const analitica = await obtenerAnaliticaEjecucion(id);

    if (!analitica) {
      res.status(404).json({ mensaje: `Ejecución con ID ${id} no encontrada.` });
      return;
    }

    res.json(analitica);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener analítica de la ejecución." });
  }
});
