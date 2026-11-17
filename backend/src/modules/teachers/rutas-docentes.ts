import { Request, Response, Router } from "express";
import { prisma } from "../../config/database.js";
import { obtenerParametroEntero } from "../../shared/http-utilidades.js";

export const enrutadorDocentes = Router();

enrutadorDocentes.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const docentes = await prisma.teachers.findMany({
      orderBy: { last_name: "asc" },
    });
    res.json(docentes);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener docentes." });
  }
});

enrutadorDocentes.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const docente = await prisma.teachers.findUnique({
      where: { id },
      include: { teacher_availability: true },
    });

    if (!docente) {
      res.status(404).json({ mensaje: `Docente con ID ${id} no encontrado.` });
      return;
    }

    res.json(docente);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorDocentes.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!first_name || !last_name) {
      res.status(400).json({ mensaje: "Los campos 'first_name' y 'last_name' son requeridos." });
      return;
    }

    const nuevo = await prisma.teachers.create({
      data: {
        first_name,
        last_name,
        email: email || null,
        phone: phone || null,
        active: true,
      },
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al crear docente." });
  }
});

enrutadorDocentes.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { first_name, last_name, email, phone } = req.body;

    const actualizado = await prisma.teachers.update({
      where: { id },
      data: {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
      },
    });

    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar docente." });
  }
});

enrutadorDocentes.patch("/:id/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({ mensaje: "El campo 'active' debe ser un booleano." });
      return;
    }

    const actualizado = await prisma.teachers.update({
      where: { id },
      data: { active },
    });

    res.json(actualizado);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al cambiar estado del docente." });
  }
});

enrutadorDocentes.get("/:id/availability", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = obtenerParametroEntero(req.params.id);
    const disponibilidades = await prisma.teacher_availability.findMany({
      where: { teacher_id: teacherId },
      orderBy: [{ day_of_week: "asc" }, { start_minute: "asc" }],
    });

    res.json(disponibilidades);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorDocentes.post("/:id/availability", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = obtenerParametroEntero(req.params.id);
    const { day_of_week, start_minute, end_minute } = req.body;

    if (
      typeof day_of_week !== "number" ||
      typeof start_minute !== "number" ||
      typeof end_minute !== "number"
    ) {
      res.status(400).json({
        mensaje: "Los campos 'day_of_week', 'start_minute' y 'end_minute' deben ser números.",
      });
      return;
    }

    if (day_of_week < 1 || day_of_week > 7) {
      res.status(400).json({ mensaje: "El día de la semana debe ser entre 1 (Lunes) y 7 (Domingo)." });
      return;
    }

    if (start_minute < 0 || end_minute > 1440 || start_minute >= end_minute) {
      res.status(400).json({ mensaje: "El rango de minutos es inválido (debe cumplir 0 <= inicio < fin <= 1440)." });
      return;
    }

    const nuevaDisp = await prisma.teacher_availability.create({
      data: {
        teacher_id: teacherId,
        day_of_week,
        start_minute,
        end_minute,
      },
    });

    res.status(201).json(nuevaDisp);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al registrar disponibilidad." });
  }
});

enrutadorDocentes.delete("/availability/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    await prisma.teacher_availability.delete({
      where: { id },
    });
    res.json({ mensaje: `Disponibilidad ${id} eliminada exitosamente.` });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al eliminar disponibilidad." });
  }
});
