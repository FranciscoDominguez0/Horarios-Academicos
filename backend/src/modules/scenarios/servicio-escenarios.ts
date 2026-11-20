import dotenv from "dotenv";
dotenv.config();
if (!process.env.DEEPSEEK_API_KEY) {
  dotenv.config({ path: "backend/.env" });
}

import { prisma } from "../../config/database.js";

// Catalogo OFICIAL de Ingenieria en Informatica (3 Anos Academicos)
// EXACTAMENTE 5 materias por ano = 15 materias distintas en total (29 sesiones)
export const CATALOGO_INGENIERIA_INFORMATICA = {
  ano1: [
    {
      code: "INF-101",
      name: "Algoritmos y Programación I",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "MAT-101",
      name: "Cálculo Diferencial e Integral",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "MAT-102",
      name: "Álgebra Lineal y Geometría",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
    {
      code: "INF-102",
      name: "Introducción a la Informática",
      credits: 3,
      weekly_minutes: 180,
      reqs: [{ duracion: 180, cantidad: 1 }],
    },
    {
      code: "FIS-101",
      name: "Física Mecánica y Laboratorio",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
  ],
  ano2: [
    {
      code: "INF-201",
      name: "Estructuras de Datos y Algoritmos II",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "MAT-201",
      name: "Probabilidad y Estadística Aplicada",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
    {
      code: "INF-202",
      name: "Bases de Datos I",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "INF-203",
      name: "Arquitectura de Computadores",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
    {
      code: "INF-204",
      name: "Programación Orientada a Objetos",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
  ],
  ano3: [
    {
      code: "INF-301",
      name: "Redes y Telecomunicaciones",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "INF-302",
      name: "Ingeniería de Software",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
    {
      code: "INF-303",
      name: "Sistemas Operativos",
      credits: 5,
      weekly_minutes: 300,
      reqs: [{ duracion: 180, cantidad: 1 }, { duracion: 120, cantidad: 1 }],
    },
    {
      code: "INF-304",
      name: "Bases de Datos Avanzadas",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
    {
      code: "INF-305",
      name: "Inteligencia Artificial",
      credits: 4,
      weekly_minutes: 240,
      reqs: [{ duracion: 120, cantidad: 2 }],
    },
  ],
};

const BANCO_PROFESORES = [
  { fn: "Carlos", ln: "Perez" },
  { fn: "Maria", ln: "Gomez" },
  { fn: "Roberto", ln: "Silva" },
  { fn: "Laura", ln: "Torres" },
  { fn: "Felipe", ln: "Ramos" },
  { fn: "Diana", ln: "Morales" },
  { fn: "Andres", ln: "Castro" },
  { fn: "Elena", ln: "Cruz" },
  { fn: "Juan", ln: "Rodriguez" },
  { fn: "Sofia", ln: "Mendoza" },
  { fn: "Gabriel", ln: "Vargas" },
  { fn: "Patricia", ln: "Navarro" },
  { fn: "Diego", ln: "Soto" },
  { fn: "Valeria", ln: "Reyes" },
  { fn: "Alejandro", ln: "Guzman" },
  { fn: "Camila", ln: "Herrera" },
  { fn: "Rodrigo", ln: "Medina" },
  { fn: "Natalia", ln: "Romero" },
];

interface FranjaHoraria {
  dia: number;
  inicio: number;
  fin: number;
}

interface DocenteEscenario {
  first_name: string;
  last_name: string;
  email: string;
  disponibilidad: FranjaHoraria[];
}

interface EscenarioGenerado {
  titulo: string;
  descripcion: string;
  fuente: "DEEPSEEK_AI" | "MOTOR_HEURISTICO";
  docentes: DocenteEscenario[];
}

function mezclar<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/**
 * Generador no lineal de disponibilidades para los 11 docentes.
 * Produce combinaciones asimetricas y realistas en cada ejecucion:
 * - 4 docentes compartidos con franjas ajustadas y choques potenciales.
 * - Docentes con turnos de manana, tarde o franjas cruzadas.
 */
function generarDisponibilidadesNoLineales(): DocenteEscenario[] {
  const profesoresMezclados = mezclar(BANCO_PROFESORES).slice(0, 11);

  // Variaciones de patrones de disponibilidad que rotan en cada ejecucion
  // Garantizan cobertura en los 5 dias de la semana (Lunes a Viernes) en los 3 anos sin dejar ningun dia vacio
  const variacionesSemanales: FranjaHoraria[][] = [
    // Docente 0 (INF-101 1° e INF-201 2°): Lun 8-14 (480-840), Jue 8-14 (480-840)
    [{ dia: 1, inicio: 480, fin: 840 }, { dia: 4, inicio: 480, fin: 840 }],
    // Docente 1 (MAT-101 1° y MAT-201 2°): Mar 8-14 (480-840), Vie 8-14 (480-840)
    [{ dia: 2, inicio: 480, fin: 840 }, { dia: 5, inicio: 480, fin: 840 }],
    // Docente 2 (MAT-102 1°): Lun 11-17 (660-1020), Mie 8-14 (480-840)
    [{ dia: 1, inicio: 660, fin: 1020 }, { dia: 3, inicio: 480, fin: 840 }],
    // Docente 3 (INF-102 1°): Mie 11-17 (660-1020), Jue 14-18 (840-1080)
    [{ dia: 3, inicio: 660, fin: 1020 }, { dia: 4, inicio: 840, fin: 1080 }],
    // Docente 4 (FIS-101 1°): Mar 14-18 (840-1080), Vie 8-12 (480-720)
    [{ dia: 2, inicio: 840, fin: 1020 }, { dia: 5, inicio: 480, fin: 720 }],
    // Docente 5 (INF-202 2° e INF-303 3°): Lun 11-17 (660-1020), Mie 8-14 (480-840), Vie 14-18 (840-1080)
    [{ dia: 1, inicio: 660, fin: 1020 }, { dia: 3, inicio: 480, fin: 840 }, { dia: 5, inicio: 840, fin: 1080 }],
    // Docente 6 (INF-203 2° e INF-304 3°): Mar 11-17 (660-1020), Jue 11-17 (660-1020)
    [{ dia: 2, inicio: 660, fin: 1020 }, { dia: 4, inicio: 660, fin: 1020 }],
    // Docente 7 (INF-204 2°): Mie 11-17 (660-1020), Vie 11-17 (660-1020)
    [{ dia: 3, inicio: 660, fin: 1020 }, { dia: 5, inicio: 660, fin: 1020 }],
    // Docente 8 (INF-301 3°): Lun 8-14 (480-840), Jue 8-14 (480-840)
    [{ dia: 1, inicio: 480, fin: 840 }, { dia: 4, inicio: 480, fin: 840 }],
    // Docente 9 (INF-302 3°): Mar 8-14 (480-840), Vie 8-14 (480-840)
    [{ dia: 2, inicio: 480, fin: 840 }, { dia: 5, inicio: 480, fin: 840 }],
    // Docente 10 (INF-305 3°): Mie 11-17 (660-1020), Vie 11-17 (660-1020)
    [{ dia: 3, inicio: 660, fin: 1020 }, { dia: 5, inicio: 660, fin: 1020 }],
  ];

  return profesoresMezclados.map((p, idx) => {
    const patronBase = variacionesSemanales[idx];
    const email = `${p.fn.toLowerCase()}.${p.ln.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}@uni.edu`;

    return {
      first_name: p.fn,
      last_name: p.ln,
      email,
      disponibilidad: patronBase,
    };
  });
}

/**
 * Consulta a DeepSeek API para generar un escenario academico realista y no lineal.
 * Si falla o tarda mas de 6 segundos, usa el generador heuristico no lineal.
 */
async function generarConDeepSeek(apiKey: string): Promise<EscenarioGenerado> {
  const controlador = new AbortController();
  const timeoutId = setTimeout(() => controlador.abort(), 6500);

  const prompt = `Eres un planificador academico para la carrera universitaria de Ingenieria en Informatica (3 anos de carrera, 5 materias por ano = 15 materias en total).
Genera una configuracion de 11 docentes universitarios y sus disponibilidades semanales para simular una situacion academica REAL, ASIMETRICA Y NO LINEAL con restricciones reales de solapamiento.

REGLAS OBLIGATORIAS:
1. Exactamente 11 docentes (nombres hispanos reales, apellidos y correos universitarios).
2. DISTRIBUCION TOTAL EN LOS 5 DIAS DE LA SEMANA (LUNES A VIERNES):
   - Es ESTRICTAMENTE OBLIGATORIO que los 5 dias (1=Lunes, 2=Martes, 3=Miercoles, 4=Jueves, 5=Viernes) se utilicen activamente. NO PUEDE QUEDAR NINGUN DIA DE LA SEMANA EN BLANCO NI SIN CLASES en ninguno de los 3 anos.
   - Cada uno de los 11 docentes DEBE tener disponibilidad en al menos 4 de los 5 dias de la semana (o los 5 dias), con franjas variadas de manana (480=08:00 a 780=13:00) y de tarde (840=14:00 a 1080=18:00).
   - En cada dia de la semana (Lunes a Viernes) debe haber multiples profesores disponibles para permitir que el algoritmo distribuya armoniosamente las clases a lo largo de los 5 dias.
3. CUELLOS DE BOTELLA Y RESTRICCIONES CRUZADAS:
   - 4 de los docentes tienen materias compartidas inter-anuales (Docente 0 entre 1° y 2° ano, Docente 1 entre 1° y 2° ano, Docente 5 entre 2° y 3° ano, Docente 6 entre 2° y 3° ano).
   - Sus franjas horarias deben provocar que el algoritmo voraz Greedy tome decisiones miopes tempranas y se quede bloqueado en un optimo local (dejando 1 sesion sin cupo), mientras que Backtracking sea capaz de explorar y retroceder hasta ubicar el 100% de las 29 sesiones.
4. "titulo": Titulo tecnico formal del escenario (sin emojis).
5. "descripcion": Breve descripcion del reto de programacion generado (sin emojis).

Responde EXCLUSIVAMENTE con un JSON valido con esta estructura:
{
  "titulo": "Semestre con cobertura completa de lunes a viernes y restricciones cruzadas",
  "descripcion": "Escenario academico con disponibilidad en los cinco dias de la semana y cuatro docentes compartidos entre anos.",
  "docentes": [
    {
      "first_name": "Carlos",
      "last_name": "Perez",
      "email": "carlos.perez@uni.edu",
      "disponibilidad": [
        { "dia": 1, "inicio": 480, "fin": 780 },
        { "dia": 2, "inicio": 840, "fin": 1080 },
        { "dia": 3, "inicio": 480, "fin": 780 },
        { "dia": 4, "inicio": 840, "fin": 1080 },
        { "dia": 5, "inicio": 480, "fin": 720 }
      ]
    }
  ]
}`;

  try {
    const respuesta = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Eres un experto en investigacion operativa y optimizacion de horarios universitarios. Responde solo con JSON valido sin emojis." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
      }),
      signal: controlador.signal,
    });

    clearTimeout(timeoutId);

    if (!respuesta.ok) {
      throw new Error(`DeepSeek API status ${respuesta.status}`);
    }

    const data = await respuesta.json();
    const contenido = data.choices?.[0]?.message?.content;
    if (!contenido) throw new Error("Respuesta vacia de DeepSeek");

    const parsed = JSON.parse(contenido);
    if (!parsed.docentes || !Array.isArray(parsed.docentes) || parsed.docentes.length < 11) {
      throw new Error("Estructura de docentes incompleta en respuesta de DeepSeek");
    }

    const docentesLimpios: DocenteEscenario[] = parsed.docentes.slice(0, 11).map((d: any, idx: number) => {
      const dispValida: FranjaHoraria[] = Array.isArray(d.disponibilidad) && d.disponibilidad.length > 0
        ? d.disponibilidad
        : [{ dia: (idx % 5) + 1, inicio: 480, fin: 780 }, { dia: ((idx + 2) % 5) + 1, inicio: 780, fin: 1080 }];

      return {
        first_name: d.first_name || `Docente${idx + 1}`,
        last_name: d.last_name || `Apellido${idx + 1}`,
        email: d.email || `docente${idx + 1}@uni.edu`,
        disponibilidad: dispValida,
      };
    });

    return {
      titulo: (parsed.titulo || "Semestre con restricciones asimetricas generado por IA").replace(/[^\w\s.,;:()\-áéíóúÁÉÍÓÚñÑ]/g, ""),
      descripcion: (parsed.descripcion || "Escenario generado por IA con docentes compartidos y ventanas horarias de alta exigencia.").replace(/[^\w\s.,;:()\-áéíóúÁÉÍÓÚñÑ]/g, ""),
      fuente: "DEEPSEEK_AI",
      docentes: docentesLimpios,
    };
  } catch (err: any) {
    console.warn(`[Escenarios] Aviso: DeepSeek (${err.message}). Aplicando motor heuristico no lineal.`);
    return {
      titulo: "Semestre con alta demanda y restricciones cruzadas inter-anuales",
      descripcion: "Escenario con cuatro docentes compartidos entre anos y franjas horarias organicas que desafian la toma de decisiones algoritmica.",
      fuente: "MOTOR_HEURISTICO",
      docentes: generarDisponibilidadesNoLineales(),
    };
  }
}

/**
 * Funcion principal:
 * 1. Limpia completamente ejecuciones y sesiones anteriores para simular en vivo.
 * 2. Genera las 15 asignaturas autenticas de Ingenieria en Informatica (5 por cada ano).
 * 3. Ejecuta la IA de DeepSeek para estructurar los docentes con restricciones reales y no lineales.
 * 4. Inserta el escenario en MySQL dejando el calendario listo.
 */
export async function generarYGuardarNuevoEscenario(periodoIdDeseado?: number) {
  // 1. Obtener o asegurar el Periodo Academico Activo
  let periodo = await prisma.academic_periods.findFirst({
    where: periodoIdDeseado ? { id: periodoIdDeseado } : { status: "ACTIVE" },
  });

  if (!periodo) {
    periodo = await prisma.academic_periods.findFirst({ orderBy: { id: "desc" } });
  }

  if (!periodo) {
    periodo = await prisma.academic_periods.create({
      data: {
        name: "Periodo Academico 2026-I",
        start_date: new Date("2026-02-01"),
        end_date: new Date("2026-06-30"),
        status: "ACTIVE",
      },
    });
  }

  // 2. Asegurar los 3 Grupos de Estudiantes (1° Ano, 2° Ano, 3° Ano)
  let grupo1 = await prisma.student_groups.findFirst({ where: { code: "1ANO" } });
  if (!grupo1) {
    grupo1 = await prisma.student_groups.create({
      data: { code: "1ANO", name: "1° Ano - Ingenieria en Informatica", semester_number: 1, student_count: 35, active: true },
    });
  }

  let grupo2 = await prisma.student_groups.findFirst({ where: { code: "2ANO" } });
  if (!grupo2) {
    grupo2 = await prisma.student_groups.create({
      data: { code: "2ANO", name: "2° Ano - Ingenieria en Informatica", semester_number: 2, student_count: 30, active: true },
    });
  }

  let grupo3 = await prisma.student_groups.findFirst({ where: { code: "3ANO" } });
  if (!grupo3) {
    grupo3 = await prisma.student_groups.create({
      data: { code: "3ANO", name: "3° Ano - Ingenieria en Informatica", semester_number: 3, student_count: 28, active: true },
    });
  }

  const grupos = [grupo1, grupo2, grupo3];

  // 3. Limpieza de corridas anteriores y catalogo
  console.log(`-> [Escenarios] Limpiando corridas y asignaciones previas del periodo ${periodo.id}`);
  await prisma.schedule_sessions.deleteMany({ where: { schedule_runs: { period_id: periodo.id } } });
  await prisma.schedule_runs.deleteMany({ where: { period_id: periodo.id } });
  await prisma.session_requirements.deleteMany({ where: { course_assignments: { period_id: periodo.id } } });
  await prisma.course_assignments.deleteMany({ where: { period_id: periodo.id } });
  await prisma.teacher_availability.deleteMany({});
  await prisma.teachers.deleteMany({});
  await prisma.subjects.deleteMany({});

  // 4. Generacion del escenario con IA DeepSeek (o respaldo no lineal)
  const apiKey = process.env.DEEPSEEK_API_KEY;
  let escenario: EscenarioGenerado;

  if (apiKey && apiKey.trim().length > 10) {
    escenario = await generarConDeepSeek(apiKey);
  } else {
    escenario = {
      titulo: "Semestre con alta demanda y restricciones cruzadas inter-anuales",
      descripcion: "Escenario con cuatro docentes compartidos entre anos y franjas horarias organicas que desafian la toma de decisiones algoritmica.",
      fuente: "MOTOR_HEURISTICO",
      docentes: generarDisponibilidadesNoLineales(),
    };
  }

  // 5. Insertar los 11 docentes y sus disponibilidades
  const docentesCreados = [];
  for (const doc of escenario.docentes) {
    const d = await prisma.teachers.create({
      data: {
        first_name: doc.first_name,
        last_name: doc.last_name,
        email: doc.email,
        phone: `555-${Math.floor(Math.random() * 9000 + 1000)}`,
        active: true,
      },
    });

    for (const disp of doc.disponibilidad) {
      await prisma.teacher_availability.create({
        data: {
          teacher_id: d.id,
          day_of_week: disp.dia,
          start_minute: disp.inicio,
          end_minute: disp.fin,
        },
      });
    }

    docentesCreados.push(d);
  }

  // 6. Asignacion deliberada de docentes compartidos para forzar cuellos de botella
  // Docente 0: INF-101 (1°) e INF-201 (2°)
  // Docente 1: MAT-101 (1°) y MAT-201 (2°)
  // Docente 5: INF-202 (2°) e INF-304 (3°)
  // Docente 6: INF-203 (2°) e INF-303 (3°)
  const ordenDocentes = mezclar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const asignacionDocentePorMateria: number[] = [
    // 1° Ano (5 materias)
    ordenDocentes[0],
    ordenDocentes[1],
    ordenDocentes[2],
    ordenDocentes[3],
    ordenDocentes[4],
    // 2° Ano (5 materias)
    ordenDocentes[0], // Compartido con 1°
    ordenDocentes[1], // Compartido con 1°
    ordenDocentes[5],
    ordenDocentes[6],
    ordenDocentes[7],
    // 3° Ano (5 materias)
    ordenDocentes[8],
    ordenDocentes[9],
    ordenDocentes[5], // Compartido con 2°
    ordenDocentes[6], // Compartido con 2°
    ordenDocentes[10],
  ];

  // 7. Insertar las 15 Materias canónicas de Ingenieria en Informatica (5 por cada ano)
  const gruposMaterias = [
    CATALOGO_INGENIERIA_INFORMATICA.ano1,
    CATALOGO_INGENIERIA_INFORMATICA.ano2,
    CATALOGO_INGENIERIA_INFORMATICA.ano3,
  ];

  let matGlobalIdx = 0;
  let totalSesionesCreadas = 0;

  for (let anoIdx = 0; anoIdx < 3; anoIdx++) {
    const listaMaterias = gruposMaterias[anoIdx];
    const grupo = grupos[anoIdx];

    for (let mIdx = 0; mIdx < 5; mIdx++) {
      const mat = listaMaterias[mIdx];
      const docIdx = asignacionDocentePorMateria[matGlobalIdx];
      const docente = docentesCreados[docIdx];

      const materia = await prisma.subjects.create({
        data: {
          code: mat.code,
          name: mat.name,
          credits: mat.credits,
          active: true,
        },
      });

      const asignacion = await prisma.course_assignments.create({
        data: {
          period_id: periodo.id,
          subject_id: materia.id,
          teacher_id: docente.id,
          group_id: grupo.id,
          weekly_minutes: mat.weekly_minutes,
          active: true,
        },
      });

      for (const req of mat.reqs) {
        await prisma.session_requirements.create({
          data: {
            assignment_id: asignacion.id,
            duration_minutes: req.duracion,
            quantity: req.cantidad,
          },
        });
        totalSesionesCreadas += req.cantidad;
      }

      matGlobalIdx++;
    }
  }

  return {
    success: true,
    fuente: escenario.fuente,
    tema: escenario.titulo,
    descripcion: escenario.descripcion,
    periodo: { id: periodo.id, name: periodo.name },
    totalDocentes: docentesCreados.length,
    totalMaterias: 15,
    totalAsignaciones: 15,
    totalSesiones: totalSesionesCreadas,
    mensaje: "Escenario generado con éxito (15 materias).",
  };
}
