import { Request, Response, Router } from "express";
import { prisma } from "../../config/database.js";
import { obtenerParametroEntero } from "../../shared/http-utilidades.js";

export const enrutadorGrupos = Router();

enrutadorGrupos.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const grupos = await prisma.student_groups.findMany({
      orderBy: { code: "asc" },
    });
    res.json(grupos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener grupos." });
  }
});

enrutadorGrupos.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const grupo = await prisma.student_groups.findUnique({ where: { id } });

    if (!grupo) {
      res.status(404).json({ mensaje: `Grupo con ID ${id} no encontrado.` });
      return;
    }

    res.json(grupo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorGrupos.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, semester_number, student_count } = req.body;

    if (!code || !name) {
      res.status(400).json({ mensaje: "Los campos 'code' y 'name' son obligatorios." });
      return;
    }

    const nuevo = await prisma.student_groups.create({
      data: {
        code,
        name,
        semester_number: semester_number !== undefined ? Number(semester_number) : null,
        student_count: student_count !== undefined ? Number(student_count) : 0,
        active: true,
      },
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al crear grupo." });
  }
});

enrutadorGrupos.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { code, name, semester_number, student_count } = req.body;

    const actualizado = await prisma.student_groups.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        semester_number: semester_number !== undefined ? Number(semester_number) : undefined,
        student_count: student_count !== undefined ? Number(student_count) : undefined,
      },
    });

    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar grupo." });
  }
});

enrutadorGrupos.patch("/:id/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({ mensaje: "El campo 'active' debe ser booleano." });
      return;
    }

    const actualizado = await prisma.student_groups.update({
      where: { id },
      data: { active },
    });

    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al cambiar estado." });
  }
});
