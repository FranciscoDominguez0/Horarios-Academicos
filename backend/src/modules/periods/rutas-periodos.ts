import { Request, Response, Router } from "express";
import { prisma } from "../../config/database.js";
import { obtenerParametroEntero } from "../../shared/http-utilidades.js";

export const enrutadorPeriodos = Router();

enrutadorPeriodos.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const periodos = await prisma.academic_periods.findMany({
      orderBy: { id: "desc" },
    });
    res.json(periodos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener períodos." });
  }
});

enrutadorPeriodos.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const periodo = await prisma.academic_periods.findUnique({
      where: { id },
    });

    if (!periodo) {
      res.status(404).json({ mensaje: `Período con ID ${id} no encontrado.` });
      return;
    }

    res.json(periodo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorPeriodos.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, start_date, end_date, status } = req.body;

    if (!name || !start_date || !end_date) {
      res.status(400).json({ mensaje: "Los campos 'name', 'start_date' y 'end_date' son requeridos." });
      return;
    }

    const fechaInicio = new Date(start_date);
    const fechaFin = new Date(end_date);

    if (fechaFin < fechaInicio) {
      res.status(400).json({ mensaje: "La fecha final debe ser igual o posterior a la inicial." });
      return;
    }

    const nuevo = await prisma.academic_periods.create({
      data: {
        name,
        start_date: fechaInicio,
        end_date: fechaFin,
        status: status ?? "INACTIVE",
      },
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al crear período." });
  }
});

enrutadorPeriodos.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { name, start_date, end_date, status } = req.body;

    const actualizado = await prisma.academic_periods.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(status && { status }),
      },
    });

    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar período." });
  }
});
