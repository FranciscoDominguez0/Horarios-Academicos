import { Request, Response, Router } from "express";
import { generarYGuardarNuevoEscenario } from "./servicio-escenarios.js";

export const enrutadorEscenarios = Router();

enrutadorEscenarios.post("/generate-random", async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodoId } = req.body;
    const resultado = await generarYGuardarNuevoEscenario(
      typeof periodoId === "number" ? periodoId : undefined
    );

    res.status(201).json(resultado);
  } catch (error: any) {
    console.error("[Escenarios] Error al generar escenario aleatorio:", error);
    res.status(500).json({
      success: false,
      mensaje: error.message || "Error al generar el nuevo escenario aleatorio.",
    });
  }
});
