import { Request, Response, Router } from "express";
import { prisma } from "../../config/database.js";
import { obtenerParametroEntero, obtenerParametroTexto } from "../../shared/http-utilidades.js";

export const enrutadorAsignaciones = Router();

interface RequerimientoInput {
  duration_minutes: number;
  quantity: number;
}

function validarSumaMinutos(minutosSemanales: number, requerimientos: RequerimientoInput[]): void {
  if (!requerimientos || requerimientos.length === 0) {
    throw new Error("Debe proporcionar al menos un requerimiento de sesión.");
  }

  const suma = requerimientos.reduce((acc, r) => {
    if (r.duration_minutes <= 0 || r.quantity <= 0) {
      throw new Error("La duración y la cantidad de cada requerimiento deben ser mayores a cero.");
    }
    return acc + r.duration_minutes * r.quantity;
  }, 0);

  if (suma !== minutosSemanales) {
    throw new Error(
      `Discrepancia de minutos: los minutos semanales requeridos son ${minutosSemanales}, pero la suma de sesiones es ${suma}.`
    );
  }
}

enrutadorAsignaciones.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const periodIdStr = obtenerParametroTexto(req.query.periodId);
    const where: any = {};

    if (periodIdStr) {
      where.period_id = parseInt(periodIdStr, 10);
    }

    const asignaciones = await prisma.course_assignments.findMany({
      where,
      include: {
        subjects: true,
        teachers: true,
        student_groups: true,
        academic_periods: true,
        session_requirements: true,
      },
      orderBy: { id: "asc" },
    });

    res.json(asignaciones);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al obtener asignaciones." });
  }
});

enrutadorAsignaciones.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const asignacion = await prisma.course_assignments.findUnique({
      where: { id },
      include: {
        subjects: true,
        teachers: true,
        student_groups: true,
        academic_periods: true,
        session_requirements: true,
      },
    });

    if (!asignacion) {
      res.status(404).json({ mensaje: `Asignación con ID ${id} no encontrada.` });
      return;
    }

    res.json(asignacion);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message });
  }
});

enrutadorAsignaciones.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject_id, teacher_id, group_id, period_id, weekly_minutes, requirements } = req.body;

    if (!subject_id || !teacher_id || !group_id || !period_id || !weekly_minutes) {
      res.status(400).json({
        mensaje: "Los campos 'subject_id', 'teacher_id', 'group_id', 'period_id' y 'weekly_minutes' son obligatorios.",
      });
      return;
    }

    validarSumaMinutos(Number(weekly_minutes), requirements);

    const nuevaAsignacion = await prisma.$transaction(async (tx) => {
      const creada = await tx.course_assignments.create({
        data: {
          subject_id: Number(subject_id),
          teacher_id: Number(teacher_id),
          group_id: Number(group_id),
          period_id: Number(period_id),
          weekly_minutes: Number(weekly_minutes),
          active: true,
        },
      });

      await tx.session_requirements.createMany({
        data: requirements.map((r: RequerimientoInput) => ({
          assignment_id: creada.id,
          duration_minutes: Number(r.duration_minutes),
          quantity: Number(r.quantity),
        })),
      });

      return await tx.course_assignments.findUnique({
        where: { id: creada.id },
        include: { session_requirements: true },
      });
    });

    res.status(201).json(nuevaAsignacion);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al crear la asignación." });
  }
});

enrutadorAsignaciones.patch("/:id/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = obtenerParametroEntero(req.params.id);
    const { active } = req.body;

    if (typeof active !== "boolean") {
      res.status(400).json({ mensaje: "El campo 'active' debe ser booleano." });
      return;
    }

    const actualizada = await prisma.course_assignments.update({
      where: { id },
      data: { active },
    });

    res.json(actualizada);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar estado." });
  }
});
