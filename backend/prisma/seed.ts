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
  console.log("-> Sembrando Plan de Estudios de Ingeniería en Informática variado y dinámico (mañana y tarde, 2h y 3h)...");

  // 1. Período Académico
  const periodo = await prisma.academic_periods.create({
    data: {
      name: "Período Académico 2026-I",
      start_date: new Date("2026-02-01"),
      end_date: new Date("2026-06-30"),
      status: "ACTIVE",
    },
  });

  // 2. 3 Años Académicos
  const grupo1 = await prisma.student_groups.create({
    data: {
      code: "1ANO",
      name: "1° Año - Ingeniería en Informática",
      semester_number: 1,
      student_count: 35,
      active: true,
    },
  });

  const grupo2 = await prisma.student_groups.create({
    data: {
      code: "2ANO",
      name: "2° Año - Ingeniería en Informática",
      semester_number: 2,
      student_count: 30,
      active: true,
    },
  });

  const grupo3 = await prisma.student_groups.create({
    data: {
      code: "3ANO",
      name: "3° Año - Ingeniería en Informática",
      semester_number: 3,
      student_count: 28,
      active: true,
    },
  });

  // 3. 11 Docentes universitarios especializados
  const docentesData = [
    { first_name: "Carlos", last_name: "Pérez", email: "carlos.perez@uni.edu" }, // Doc 0: Algoritmos I (1°) y Estructuras II (2°)
    { first_name: "María", last_name: "Gómez", email: "maria.gomez@uni.edu" }, // Doc 1: Cálculo I (1°) y Probabilidad (2°)
    { first_name: "Roberto", last_name: "Silva", email: "roberto.silva@uni.edu" }, // Doc 2: Álgebra Lineal (1°)
    { first_name: "Laura", last_name: "Torres", email: "laura.torres@uni.edu" }, // Doc 3: Intro. a la Informática (1°)
    { first_name: "Felipe", last_name: "Ramos", email: "felipe.ramos@uni.edu" }, // Doc 4: Física Mecánica y Lab (1°)
    { first_name: "Diana", last_name: "Morales", email: "diana.morales@uni.edu" }, // Doc 5: Bases de Datos I (2°) y BD Avanzadas (3°)
    { first_name: "Andrés", last_name: "Castro", email: "andres.castro@uni.edu" }, // Doc 6: Arquitectura (2°) y Sistemas Operativos (3°)
    { first_name: "Elena", last_name: "Cruz", email: "elena.cruz@uni.edu" }, // Doc 7: Programación Orientada a Objetos (2°)
    { first_name: "Juan", last_name: "Rodríguez", email: "juan.rodriguez@uni.edu" }, // Doc 8: Redes y Telecomunicaciones (3°)
    { first_name: "Sofía", last_name: "Mendoza", email: "sofia.mendoza@uni.edu" }, // Doc 9: Ingeniería de Software (3°)
    { first_name: "Gabriel", last_name: "Vargas", email: "gabriel.vargas@uni.edu" }, // Doc 10: Inteligencia Artificial (3°)
  ];

  const docentes = [];
  for (const doc of docentesData) {
    const d = await prisma.teachers.create({
      data: { ...doc, phone: "555-0100", active: true },
    });
    docentes.push(d);
  }

  // 4. Disponibilidades Docentes Orgánicas (Horario Real Universitario 08:00 a 15:00 maximo)
  // 480 = 08:00, 540 = 09:00, 600 = 10:00, 660 = 11:00, 720 = 12:00, 780 = 13:00, 840 = 14:00, 900 = 15:00

  // Carlos Pérez (1° y 2°): Lun 8-13 (480-780), Jue 8-13 (480-780) -> Ajustado (300m + 300m)
  for (const d of [
    { dia: 1, ini: 480, fin: 780 },
    { dia: 4, ini: 480, fin: 780 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[0].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // María Gómez (1° y 2°): Mar 8-13 (480-780), Vie 8-13 (480-780) -> Ajustado
  for (const d of [
    { dia: 2, ini: 480, fin: 780 },
    { dia: 5, ini: 480, fin: 780 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[1].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Roberto Silva (1°): Lun 8-14 (480-840), Mié 8-13 (480-780)
  for (const d of [
    { dia: 1, ini: 480, fin: 840 },
    { dia: 3, ini: 480, fin: 780 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[2].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Laura Torres (1°): Mié 8-14 (480-840), Jue 8-14 (480-840)
  for (const d of [
    { dia: 3, ini: 480, fin: 840 },
    { dia: 4, ini: 480, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[3].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Felipe Ramos (1°): Mar 8-14 (480-840), Vie 8-14 (480-840)
  for (const d of [
    { dia: 2, ini: 480, fin: 840 },
    { dia: 5, ini: 480, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[4].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Diana Morales (2° y 3°): Lun 9-15 (540-900), Mié 8-13 (480-780), Vie 8-13 (480-780)
  for (const d of [
    { dia: 1, ini: 540, fin: 900 },
    { dia: 3, ini: 480, fin: 780 },
    { dia: 5, ini: 480, fin: 780 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[5].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Andrés Castro (2° y 3°): Mar 8-14 (480-840), Jue 8-13 (480-780)
  for (const d of [
    { dia: 2, ini: 480, fin: 840 },
    { dia: 4, ini: 480, fin: 780 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[6].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Elena Cruz (2°): Mié 8-14 (480-840), Vie 9-15 (540-900)
  for (const d of [
    { dia: 3, ini: 480, fin: 840 },
    { dia: 5, ini: 540, fin: 900 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[7].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Juan Rodríguez (3°): Lun 8-14 (480-840), Jue 8-14 (480-840)
  for (const d of [
    { dia: 1, ini: 480, fin: 840 },
    { dia: 4, ini: 480, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[8].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Sofía Mendoza (3°): Mar 8-14 (480-840), Vie 8-14 (480-840)
  for (const d of [
    { dia: 2, ini: 480, fin: 840 },
    { dia: 5, ini: 480, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[9].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // Gabriel Vargas (3°): Mié 8-14 (480-840), Vie 8-14 (480-840)
  for (const d of [
    { dia: 3, ini: 480, fin: 840 },
    { dia: 5, ini: 480, fin: 840 },
  ]) {
    await prisma.teacher_availability.create({
      data: { teacher_id: docentes[10].id, day_of_week: d.dia, start_minute: d.ini, end_minute: d.fin },
    });
  }

  // 5. Asignaturas de Ingeniería en Informática con Sesiones Variadas (2h y 3h)
  const asignacionesConfig = [
    // === 1° Año (5 materias: mezcla de 3h y 2h) ===
    {
      code: "INF-101",
      name: "Algoritmos y Programación I",
      credits: 5,
      grupo: grupo1,
      docente: docentes[0],
      weekly_minutes: 300, // 5 horas
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }], // 3h Lab + 2h Teoría
    },
    {
      code: "MAT-101",
      name: "Cálculo Diferencial e Integral",
      credits: 5,
      grupo: grupo1,
      docente: docentes[1],
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }],
    },
    {
      code: "MAT-102",
      name: "Álgebra Lineal y Geometría",
      credits: 4,
      grupo: grupo1,
      docente: docentes[2],
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }], // 2x 2h
    },
    {
      code: "INF-102",
      name: "Introducción a la Informática",
      credits: 3,
      grupo: grupo1,
      docente: docentes[3],
      weekly_minutes: 180,
      reqs: [{ duracion: 180, cant: 1 }], // 1x 3h Taller
    },
    {
      code: "FIS-101",
      name: "Física Mecánica y Laboratorio",
      credits: 4,
      grupo: grupo1,
      docente: docentes[4],
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },

    // === 2° Año (5 materias) ===
    {
      code: "INF-201",
      name: "Estructuras de Datos y Algoritmos II",
      credits: 5,
      grupo: grupo2,
      docente: docentes[0], // Carlos Pérez compartido
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }],
    },
    {
      code: "MAT-201",
      name: "Probabilidad y Estadística Aplicada",
      credits: 4,
      grupo: grupo2,
      docente: docentes[1], // María Gómez compartida
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },
    {
      code: "INF-202",
      name: "Bases de Datos I",
      credits: 5,
      grupo: grupo2,
      docente: docentes[5], // Diana Morales
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }],
    },
    {
      code: "INF-203",
      name: "Arquitectura de Computadores",
      credits: 4,
      grupo: grupo2,
      docente: docentes[6], // Andrés Castro
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },
    {
      code: "INF-204",
      name: "Programación Orientada a Objetos",
      credits: 4,
      grupo: grupo2,
      docente: docentes[7], // Elena Cruz
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },

    // === 3° Año (5 materias) ===
    {
      code: "INF-301",
      name: "Redes y Telecomunicaciones",
      credits: 5,
      grupo: grupo3,
      docente: docentes[8], // Juan Rodríguez
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }],
    },
    {
      code: "INF-302",
      name: "Ingeniería de Software",
      credits: 4,
      grupo: grupo3,
      docente: docentes[9], // Sofía Mendoza
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },
    {
      code: "INF-303",
      name: "Sistemas Operativos",
      credits: 5,
      grupo: grupo3,
      docente: docentes[6], // Andrés Castro compartido
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cant: 1 }, { duracion: 120, cant: 1 }],
    },
    {
      code: "INF-304",
      name: "Bases de Datos Avanzadas",
      credits: 4,
      grupo: grupo3,
      docente: docentes[5], // Diana Morales compartida
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },
    {
      code: "INF-305",
      name: "Inteligencia Artificial",
      credits: 4,
      grupo: grupo3,
      docente: docentes[10], // Gabriel Vargas
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cant: 2 }],
    },
  ];

  let totalSesiones = 0;
  for (const item of asignacionesConfig) {
    const sub = await prisma.subjects.create({
      data: {
        code: item.code,
        name: item.name,
        credits: item.credits,
        active: true,
      },
    });

    const asig = await prisma.course_assignments.create({
      data: {
        period_id: periodo.id,
        subject_id: sub.id,
        teacher_id: item.docente.id,
        group_id: item.grupo.id,
        weekly_minutes: item.weekly_minutes,
        active: true,
      },
    });

    for (const req of item.reqs) {
      await prisma.session_requirements.create({
        data: {
          assignment_id: asig.id,
          duration_minutes: req.duracion,
          quantity: req.cant,
        },
      });
      totalSesiones += req.cant;
    }
  }

  console.log("-> Seeder completado exitosamente:");
  console.log(`   - Período: ${periodo.name}`);
  console.log(`   - 3 Años: 1° Año, 2° Año, 3° Año (Ingeniería en Informática)`);
  console.log(`   - Capacidad: 3 Salones simultáneos (Salón 101, Salón 102, Salón 103)`);
  console.log(`   - ${docentes.length} Docentes universitarios con asignaciones compartidas`);
  console.log(`   - ${asignacionesConfig.length} Asignaturas de Ingeniería en Informática (5 por año)`);
  console.log(`   - ${totalSesiones} Sesiones semanales variadas (sesiones de 2h y 3h en mañana y tarde)`);
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
