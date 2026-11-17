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
  console.log("-> Sembrando dataset para Salón Único (Aula 101) con resolución de cuellos de botella...");

  // 1. Período Académico
  const periodo = await prisma.academic_periods.create({
    data: {
      name: "Período Académico 2026-I",
      start_date: new Date("2026-02-01"),
      end_date: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  // 2. Un Solo Salón / Grupo de Estudiantes (Aula 101)
  const grupo = await prisma.student_groups.create({
    data: {
      code: "AULA-101",
      name: "Aula 101 (Salón Único - Ingeniería Informática)",
      semester_number: 1,
      student_count: 35,
      active: true,
    },
  });

  // 3. 8 Docentes especialistas
  const docentesData = [
    { first_name: "Carlos", last_name: "Pérez (Algoritmos)", email: "carlos.perez@uni.edu" },
    { first_name: "María", last_name: "Gómez (Cálculo)", email: "maria.gomez@uni.edu" },
    { first_name: "Roberto", last_name: "Silva (Álgebra)", email: "roberto.silva@uni.edu" },
    { first_name: "Juan", last_name: "Rodríguez (Física)", email: "juan.rodriguez@uni.edu" },
    { first_name: "Laura", last_name: "Torres (Química)", email: "laura.torres@uni.edu" },
    { first_name: "Diana", last_name: "Morales (Bases de Datos)", email: "diana.morales@uni.edu" },
    { first_name: "Andrés", last_name: "Castro (Redes)", email: "andres.castro@uni.edu" },
    { first_name: "Sofía", last_name: "Mendoza (Ética)", email: "sofia.mendoza@uni.edu" },
  ];

  const docentes = [];
  for (const doc of docentesData) {
    const d = await prisma.teachers.create({
      data: { ...doc, phone: "555-0100", active: true },
    });
    docentes.push(d);
  }

  // 4. Disponibilidades docentes diseñadas para el Salón Único:
  // Franjas de 2 horas (08:00 a 16:00):
  // Bloque 1: 08:00-10:00 (480-600)
  // Bloque 2: 10:00-12:00 (600-720)
  // Bloque 3: 12:00-14:00 (720-840)
  // Bloque 4: 14:00-16:00 (840-960)

  // Docente 0 (Carlos Pérez - Prog): Lun 8-12, Mié 8-12, y Mié 12-14 (alternativa de tarde)
  for (const d of [
    { dia: 1, ini: 480, fin: 720 },
    { dia: 3, ini: 480, fin: 720 },
    { dia: 3, ini: 720, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[0].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 1 (María Gómez - Cálculo): Lun 8-12, Mar 8-12
  for (const d of [
    { dia: 1, ini: 480, fin: 720 },
    { dia: 2, ini: 480, fin: 720 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[1].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 2 (Roberto Silva - Álgebra): Mar 8-12, Jue 8-12
  for (const d of [
    { dia: 2, ini: 480, fin: 720 },
    { dia: 4, ini: 480, fin: 720 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[2].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 3 (Juan Rodríguez - Física): Mié 8-12, Jue 8-12
  for (const d of [
    { dia: 3, ini: 480, fin: 720 },
    { dia: 4, ini: 480, fin: 720 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[3].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 4 (Laura Torres - Química): SOLO a primera hora (08:00 a 10:00) de Lun a Vie
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[4].id, day_of_week: dia, start_minute: 480, end_minute: 600 },
    });
  }

  // Docente 5 (Diana Morales - Bases de Datos): Lun 12-16, Mié 14-16
  for (const d of [
    { dia: 1, ini: 720, fin: 960 },
    { dia: 3, ini: 840, fin: 960 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[5].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 6 (Andrés Castro - Redes): Mar 12-16, Jue 12-16
  for (const d of [
    { dia: 2, ini: 720, fin: 960 },
    { dia: 4, ini: 720, fin: 960 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[6].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Docente 7 (Sofía Mendoza - Ética): Vie 10-16
  await prisma.teacher_availability.create({
    data: { teacher_id: docentes[7].id, day_of_week: 5, start_minute: 600, end_minute: 960 },
  });

  // 5. 8 Asignaturas del Salón
  const asignaturasData = [
    { code: "ALG-101", name: "Algoritmos y Programación I", credits: 4 },
    { code: "MAT-101", name: "Cálculo Diferencial", credits: 4 },
    { code: "MAT-102", name: "Álgebra Lineal", credits: 4 },
    { code: "FIS-101", name: "Física Mecánica", credits: 4 },
    { code: "QUI-101", name: "Química General", credits: 4 },
    { code: "BD-101", name: "Bases de Datos I", credits: 4 },
    { code: "RED-101", name: "Redes y Telecomunicaciones", credits: 4 },
    { code: "ETI-101", name: "Ética y Deontología", credits: 4 },
  ];

  const asignaturas = [];
  for (const asig of asignaturasData) {
    const a = await prisma.subjects.create({ data: { ...asig, active: true } });
    asignaturas.push(a);
  }

  // 6. Asignaciones académicas para el Salón Único (16 sesiones de 120 min = 32 horas semanales)
  let totalSesiones = 0;
  for (let i = 0; i < asignaturas.length; i++) {
    const asig = await prisma.course_assignments.create({
      data: {
        period_id: periodo.id,
        subject_id: asignaturas[i].id,
        teacher_id: docentes[i].id,
        group_id: grupo.id,
        weekly_minutes: 240, // 4 horas por materia
        active: true,
      },
    });

    // 2 sesiones de 120 minutos cada una
    await prisma.session_requirements.create({
      data: {
        assignment_id: asig.id,
        duration_minutes: 120,
        quantity: 2,
      },
    });
    totalSesiones += 2;
  }

  console.log("-> Dataset para Salón Único sembrado con éxito:");
  console.log(`   - Período: ${periodo.name} (ID: ${periodo.id})`);
  console.log(`   - Salón: ${grupo.name} (ID: ${grupo.id})`);
  console.log(`   - ${docentes.length} Docentes con franjas entrelazadas.`);
  console.log(`   - ${asignaturas.length} Asignaturas.`);
  console.log(`   - ${asignaturas.length} Asignaciones académicas.`);
  console.log(`   - ${totalSesiones} Sesiones semanales (todas en el Salón Único).`);
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
