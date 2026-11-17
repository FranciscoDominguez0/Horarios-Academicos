import { prisma } from "../src/config/database.js";

async function limpiarBaseDeDatos(): Promise<void> {
  console.log("-> Limpiando tablas de la base de datos...");
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
  console.log("-> Sembrando dataset con cuello de botella combinatorio real...");

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
  const docentesData = [
    { first_name: "Carlos", last_name: "Pérez (Sistemas)", email: "carlos.perez@uni.edu" },
    { first_name: "María", last_name: "Gómez (Matemática)", email: "maria.gomez@uni.edu" },
    { first_name: "Roberto", last_name: "Silva (Estructuras)", email: "roberto.silva@uni.edu" },
    { first_name: "Juan", last_name: "Rodríguez (Bases de Datos)", email: "juan.rodriguez@uni.edu" },
    { first_name: "Laura", last_name: "Torres (Redes)", email: "laura.torres@uni.edu" },
    { first_name: "Diana", last_name: "Morales (Gestión)", email: "diana.morales@uni.edu" },
  ];

  const docentes = [];
  for (const doc of docentesData) {
    const d = await prisma.teachers.create({
      data: { ...doc, phone: "555-0100", active: true },
    });
    docentes.push(d);
  }

  // 3. Disponibilidad docente diseñada para conflicto y retroceso:
  // Franjas: 08:00 a 10:00 (480-600) y 10:00 a 12:00 (600-720) = 4 horas matutinas (2 bloques de 120 min)

  // Carlos Pérez (Docente 0): Disponible de Lunes a Jueves de 08:00 a 12:00 (480 a 720) - 8 bloques posibles
  for (let dia = 1; dia <= 4; dia++) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[0].id, day_of_week: dia, start_minute: 480, end_minute: 720 },
    });
  }

  // María Gómez (Docente 1): ALTAMENTE RESTINGIDA -> SOLO Lunes y Miércoles de 08:00 a 12:00 (480 a 720) - 4 bloques exactos
  for (const dia of [1, 3]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[1].id, day_of_week: dia, start_minute: 480, end_minute: 720 },
    });
  }

  // Roberto Silva (Docente 2): ALTAMENTE RESTRINGIDO -> SOLO Martes y Jueves de 08:00 a 12:00 (480 a 720) - 4 bloques exactos
  for (const dia of [2, 4]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[2].id, day_of_week: dia, start_minute: 480, end_minute: 720 },
    });
  }

  // Juan Rodríguez (Docente 3): Lunes a Jueves de 12:00 a 16:00 (720 a 960)
  for (let dia = 1; dia <= 4; dia++) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[3].id, day_of_week: dia, start_minute: 720, end_minute: 960 },
    });
  }

  // Laura Torres (Docente 4): Martes, Miércoles y Viernes de 12:00 a 16:00 (720 a 960)
  for (const dia of [2, 3, 5]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[4].id, day_of_week: dia, start_minute: 720, end_minute: 960 },
    });
  }

  // Diana Morales (Docente 5): Lunes a Viernes de 14:00 a 18:00 (840 a 1080)
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[5].id, day_of_week: dia, start_minute: 840, end_minute: 1080 },
    });
  }

  // 4. Asignaturas
  const asignaturasData = [
    { code: "PROG-101", name: "Programación I", credits: 4 },
    { code: "PROG-201", name: "Programación II", credits: 4 },
    { code: "CALC-101", name: "Cálculo Diferencial", credits: 4 },
    { code: "CALC-201", name: "Cálculo Integral", credits: 4 },
    { code: "EST-101", name: "Estructuras de Datos I", credits: 4 },
    { code: "EST-201", name: "Estructuras de Datos II", credits: 4 },
    { code: "BD-101", name: "Bases de Datos I", credits: 3 },
    { code: "BD-201", name: "Bases de Datos II", credits: 3 },
    { code: "RED-101", name: "Redes y Telecomunicaciones", credits: 3 },
    { code: "GES-101", name: "Gestión de Proyectos", credits: 2 },
  ];

  const asignaturas = [];
  for (const asig of asignaturasData) {
    const a = await prisma.subjects.create({ data: { ...asig, active: true } });
    asignaturas.push(a);
  }

  // 5. Grupos de estudiantes
  const gruposData = [
    { code: "1INF-A", name: "Ingeniería Informática 1° Semestre", semester_number: 1, student_count: 35 },
    { code: "2INF-A", name: "Ingeniería Informática 2° Semestre", semester_number: 2, student_count: 30 },
    { code: "3INF-A", name: "Ingeniería Informática 3° Semestre", semester_number: 3, student_count: 28 },
  ];

  const grupos = [];
  for (const grp of gruposData) {
    const g = await prisma.student_groups.create({ data: { ...grp, active: true } });
    grupos.push(g);
  }

  // 6. Asignaciones académicas con competencia de horarios directa
  const asignacionesConfig = [
    // --- GRUPO 1INF-A ---
    // Prog I (Carlos Pérez - Doc 0): 2 sesiones de 120 min
    { asigIdx: 0, docIdx: 0, grpIdx: 0, min: 240, req: [{ dur: 120, cant: 2 }] },
    // Cálculo Dif (María Gómez - Doc 1): 2 sesiones de 120 min (SOLO Lun/Mié mañanas!)
    { asigIdx: 2, docIdx: 1, grpIdx: 0, min: 240, req: [{ dur: 120, cant: 2 }] },
    // Estructuras I (Roberto Silva - Doc 2): 2 sesiones de 120 min (SOLO Mar/Jue mañanas!)
    { asigIdx: 4, docIdx: 2, grpIdx: 0, min: 240, req: [{ dur: 120, cant: 2 }] },
    // BD I (Juan Rodríguez - Doc 3): 2 sesiones de 120 min (Tardes)
    { asigIdx: 6, docIdx: 3, grpIdx: 0, min: 240, req: [{ dur: 120, cant: 2 }] },

    // --- GRUPO 2INF-A ---
    // Prog II (Carlos Pérez - Doc 0): 2 sesiones de 120 min
    { asigIdx: 1, docIdx: 0, grpIdx: 1, min: 240, req: [{ dur: 120, cant: 2 }] },
    // Cálculo Int (María Gómez - Doc 1): 2 sesiones de 120 min (SOLO Lun/Mié mañanas!)
    { asigIdx: 3, docIdx: 1, grpIdx: 1, min: 240, req: [{ dur: 120, cant: 2 }] },
    // Estructuras II (Roberto Silva - Doc 2): 2 sesiones de 120 min (SOLO Mar/Jue mañanas!)
    { asigIdx: 5, docIdx: 2, grpIdx: 1, min: 240, req: [{ dur: 120, cant: 2 }] },
    // BD II (Juan Rodríguez - Doc 3): 2 sesiones de 120 min (Tardes)
    { asigIdx: 7, docIdx: 3, grpIdx: 1, min: 240, req: [{ dur: 120, cant: 2 }] },

    // --- GRUPO 3INF-A ---
    // Redes (Laura Torres - Doc 4): 2 sesiones de 120 min
    { asigIdx: 8, docIdx: 4, grpIdx: 2, min: 240, req: [{ dur: 120, cant: 2 }] },
    // Gestión (Diana Morales - Doc 5): 2 sesiones de 120 min
    { asigIdx: 9, docIdx: 5, grpIdx: 2, min: 240, req: [{ dur: 120, cant: 2 }] },
  ];

  let totalSesiones = 0;
  for (const item of asignacionesConfig) {
    const asig = await prisma.course_assignments.create({
      data: {
        period_id: periodo.id,
        subject_id: asignaturas[item.asigIdx].id,
        teacher_id: docentes[item.docIdx].id,
        group_id: grupos[item.grpIdx].id,
        weekly_minutes: item.min,
        active: true,
      },
    });

    for (const r of item.req) {
      await prisma.session_requirements.create({
        data: {
          assignment_id: asig.id,
          duration_minutes: r.dur,
          quantity: r.cant,
        },
      });
      totalSesiones += r.cant;
    }
  }

  console.log("-> Dataset sembrado con éxito:");
  console.log(`   - Período: ${periodo.name} (ID: ${periodo.id})`);
  console.log(`   - ${docentes.length} Docentes.`);
  console.log(`   - ${asignaturas.length} Asignaturas.`);
  console.log(`   - ${grupos.length} Grupos.`);
  console.log(`   - ${asignacionesConfig.length} Asignaciones académicas.`);
  console.log(`   - ${totalSesiones} Sesiones semanales a programar.`);
}

async function main() {
  try {
    await limpiarBaseDeDatos();
    await sembrarDatos();
  } catch (error) {
    console.error("Error durante el seeder:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
