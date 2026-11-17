import { Request, Response, Router } from "express";
import { prisma } from "../../config/database.js";
import { obtenerParametroEntero } from "../../shared/http-utilidades.js";

export const enrutadorMaterias = Router();

enrutadorMaterias.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const materias = await prisma.subjects.findMany({
      orderBy: { name: "asc" },
    });
    res.json(materias);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener materias." });
  }
});

enrutadorMaterias.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const materia = await prisma.subjects.findUnique({ where: { id } });

    if (!materia) {
      res.status(404).json({ mensaje: `Materia con ID ${id} no encontrada.` });
      return;
    }

    res.json(materia);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorMaterias.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, description, credits } = req.body;

    if (!code || !name) {
      res.status(400).json({ mensaje: "Los campos 'code' y 'name' son obligatorios." });
      return;
    }

    const nueva = await prisma.subjects.create({
      data: {
        code,
        name,
        description: description || null,
        credits: credits ? parseInt(credits, 10) : null,
        active: true,
      },
    });

    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al crear materia." });
  }
});

enrutadorMaterias.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { code, name, description, credits } = req.body;

    const actualizada = await prisma.subjects.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        description: description !== undefined ? description : undefined,
        credits: credits !== undefined ? Number(credits) : undefined,
      },
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar materia." });
  }
});

enrutadorMaterias.patch("/:id/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({ mensaje: "El campo 'active' debe ser un booleano." });
      return;
    }

    const actualizada = await prisma.subjects.update({
      where: { id },
      data: { active },
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al cambiar estado." });
  }
});
