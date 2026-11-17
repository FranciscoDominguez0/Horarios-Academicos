import { prisma } from "../src/config/database.js";

async function limpiarBaseDeDatos(): Promise<void> {
  console.log("-> Limpiando tablas de la base de datos...");

  // Orden de borrado respetando las restricciones de clave foránea
  await prisma.schedule_sessions.deleteMany();
  await prisma.schedule_runs.deleteMany();
  await prisma.session_requirements.deleteMany();
  await prisma.course_assignments.deleteMany();
  await prisma.teacher_availability.deleteMany();
  await prisma.student_groups.deleteMany();
  await prisma.subjects.deleteMany();
  await prisma.teachers.deleteMany();
  await prisma.academic_periods.deleteMany();

  console.log("-> Base de datos limpiada con éxito.");
}

async function sembrarDatos(): Promise<void> {
  console.log("-> Insertando datos académicos de demostración...");

  // 1. Período Académico
  const periodo = await prisma.academic_periods.create({
    data: {
      name: "Período Académico 2026-I",
      start_date: new Date("2026-02-01"),
      end_date: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  // 2. Docentes
  const docenteA = await prisma.teachers.create({
    data: {
      first_name: "Carlos",
      last_name: "Pérez (Docente A)",
      email: "carlos.perez@universidad.edu",
      phone: "555-0101",
      active: true,
    },
  });

  const docenteB = await prisma.teachers.create({
    data: {
      first_name: "María",
      last_name: "Gómez (Docente B)",
      email: "maria.gomez@universidad.edu",
      phone: "555-0102",
      active: true,
    },
  });

  const docenteC = await prisma.teachers.create({
    data: {
      first_name: "Juan",
      last_name: "Rodríguez (Docente C)",
      email: "juan.rodriguez@universidad.edu",
      phone: "555-0103",
      active: true,
    },
  });

  // 3. Disponibilidad Docente (Minutos desde medianoche: 07:00=420, 14:00=840, 16:00=960, 18:00=1080)
  // Docente A: Lunes a Viernes de 07:00 a 14:00 (420 a 840)
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.teacher_availability.create({
      data: {
        teacher_id: docenteA.id,
        day_of_week: dia,
        start_minute: 420,
        end_minute: 840,
      },
    });
  }

  // Docente B: Lunes, Miércoles y Viernes de 08:00 a 16:00 (480 a 960)
  for (const dia of [1, 3, 5]) {
    await prisma.teacher_availability.create({
      data: {
        teacher_id: docenteB.id,
        day_of_week: dia,
        start_minute: 480,
        end_minute: 960,
      },
    });
  }

  // Docente C: Martes y Jueves de 08:00 a 14:00 (480 a 840)
  for (const dia of [2, 4]) {
    await prisma.teacher_availability.create({
      data: {
        teacher_id: docenteC.id,
        day_of_week: dia,
        start_minute: 480,
        end_minute: 840,
      },
    });
  }

  // 4. Asignaturas
  const prog1 = await prisma.subjects.create({
    data: { code: "PROG-101", name: "Programación I", credits: 4, active: true },
  });

  const prog2 = await prisma.subjects.create({
    data: { code: "PROG-201", name: "Programación II", credits: 4, active: true },
  });

  const mate1 = await prisma.subjects.create({
    data: { code: "MAT-101", name: "Matemática", credits: 3, active: true },
  });

  const bd1 = await prisma.subjects.create({
    data: { code: "BD-101", name: "Base de Datos", credits: 3, active: true },
  });

  // 5. Grupos de Estudiantes
  const grupo1 = await prisma.student_groups.create({
    data: { code: "1INF-A", name: "Ingeniería Informática 1A", semester_number: 1, student_count: 30, active: true },
  });

  const grupo2 = await prisma.student_groups.create({
    data: { code: "2INF-A", name: "Ingeniería Informática 2A", semester_number: 2, student_count: 25, active: true },
  });

  // 6. Asignaciones Académicas y Requerimientos de Sesión (Sección 21 del documento)
  // 6.1 Programación I | Docente A | 1INF-A | 240 minutos | 2 sesiones x 120 min
  const asig1 = await prisma.course_assignments.create({
    data: {
      period_id: periodo.id,
      subject_id: prog1.id,
      teacher_id: docenteA.id,
      group_id: grupo1.id,
      weekly_minutes: 240,
      active: true,
    },
  });
  await prisma.session_requirements.create({
    data: { assignment_id: asig1.id, duration_minutes: 120, quantity: 2 },
  });

  // 6.2 Matemática | Docente B | 1INF-A | 180 minutos | 1 sesión x 180 min
  const asig2 = await prisma.course_assignments.create({
    data: {
      period_id: periodo.id,
      subject_id: mate1.id,
      teacher_id: docenteB.id,
      group_id: grupo1.id,
      weekly_minutes: 180,
      active: true,
    },
  });
  await prisma.session_requirements.create({
    data: { assignment_id: asig2.id, duration_minutes: 180, quantity: 1 },
  });

  // 6.3 Base de Datos | Docente C | 1INF-A | 120 minutos | 1 sesión x 120 min
  const asig3 = await prisma.course_assignments.create({
    data: {
      period_id: periodo.id,
      subject_id: bd1.id,
      teacher_id: docenteC.id,
      group_id: grupo1.id,
      weekly_minutes: 120,
      active: true,
    },
  });
  await prisma.session_requirements.create({
    data: { assignment_id: asig3.id, duration_minutes: 120, quantity: 1 },
  });

  // 6.4 Programación II | Docente A | 2INF-A | 240 minutos | 2 sesiones x 120 min
  const asig4 = await prisma.course_assignments.create({
    data: {
      period_id: periodo.id,
      subject_id: prog2.id,
      teacher_id: docenteA.id,
      group_id: grupo2.id,
      weekly_minutes: 240,
      active: true,
    },
  });
  await prisma.session_requirements.create({
    data: { assignment_id: asig4.id, duration_minutes: 120, quantity: 2 },
  });

  console.log("-> Seeder completado con éxito:");
  console.log(`   - Período ID: ${periodo.id} ("${periodo.name}")`);
  console.log(`   - 3 Docentes creados.`);
  console.log(`   - 4 Asignaturas creadas.`);
  console.log(`   - 2 Grupos de estudiantes creados.`);
  console.log(`   - 4 Asignaciones académicas creadas con 6 sesiones semanales en total.`);
}

async function main() {
  try {
    await limpiarBaseDeDatos();
    await sembrarDatos();
  } catch (error) {
    console.error("Error durante la ejecución del seeder:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
