/**
 * Pruebas unitarias para el motor de planificación base:
 * - Intervalos de tiempo y conversiones
 * - Generador de sesiones programables
 * - Generador de candidatos horarios
 * - Validador independiente de restricciones duras
 */

import { describe, expect, it } from "vitest";
import {
  AsignacionAcademica,
  CandidatoHorario,
  DisponibilidadDocente,
  EntradaPlanificacion,
  SesionAsignada,
  TipoConflicto,
} from "../../src/engine/types/dominio.js";
import {
  estaContenido,
  horaTextoAMinutos,
  minutosAHoraTexto,
  seSolapan,
} from "../../src/engine/validation/intervalos.js";
import { generarSesionesProgramables } from "../../src/engine/generators/generador-sesiones.js";
import {
  generarCandidatosParaSesion,
  generarMapaCandidatos,
} from "../../src/engine/generators/generador-candidatos.js";
import { validarHorario } from "../../src/engine/validation/validador-independiente.js";

describe("1. Intervalos de tiempo y conversiones", () => {
  it("debe convertir minutos desde medianoche a formato HH:mm y viceversa", () => {
    expect(minutosAHoraTexto(420)).toBe("07:00");
    expect(minutosAHoraTexto(510)).toBe("08:30");
    expect(minutosAHoraTexto(1080)).toBe("18:00");

    expect(horaTextoAMinutos("07:00")).toBe(420);
    expect(horaTextoAMinutos("08:30")).toBe(510);
    expect(horaTextoAMinutos("18:00")).toBe(1080);
  });

  it("debe detectar solapamiento de intervalos correctamente", () => {
    // 08:00–10:00 (480-600) y 09:00–11:00 (540-660): Solapamiento real
    expect(seSolapan({ inicioMinuto: 480, finMinuto: 600 }, { inicioMinuto: 540, finMinuto: 660 })).toBe(true);

    // 08:00–10:00 (480-600) y 10:00–12:00 (600-720): Intervalos adyacentes NO se solapan
    expect(seSolapan({ inicioMinuto: 480, finMinuto: 600 }, { inicioMinuto: 600, finMinuto: 720 })).toBe(false);

    // Invertidos: 10:00–12:00 y 08:00–10:00 NO se solapan
    expect(seSolapan({ inicioMinuto: 600, finMinuto: 720 }, { inicioMinuto: 480, finMinuto: 600 })).toBe(false);

    // Intervalo totalmente contenido
    expect(seSolapan({ inicioMinuto: 480, finMinuto: 600 }, { inicioMinuto: 510, finMinuto: 570 })).toBe(true);
  });

  it("debe verificar si un intervalo está contenido dentro de otro", () => {
    const jornada = { inicioMinuto: 420, finMinuto: 1080 }; // 07:00 - 18:00
    const claseValida = { inicioMinuto: 480, finMinuto: 600 }; // 08:00 - 10:00
    const claseFuera = { inicioMinuto: 360, finMinuto: 480 }; // 06:00 - 08:00

    expect(estaContenido(claseValida, jornada)).toBe(true);
    expect(estaContenido(claseFuera, jornada)).toBe(false);
  });
});

describe("2. Generador de sesiones programables", () => {
  it("debe generar sesiones individuales a partir de asignaciones académicas", () => {
    const asignaciones: AsignacionAcademica[] = [
      {
        id: 1,
        periodoId: 10,
        asignaturaId: 101,
        docenteId: 5,
        grupoId: 2,
        minutosSemanales: 240,
        requerimientos: [
          { id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 2 },
        ],
      },
    ];

    const sesiones = generarSesionesProgramables(asignaciones);

    expect(sesiones).toHaveLength(2);
    expect(sesiones[0]).toEqual({
      id: "asig-1-req-1-ses-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 5,
      grupoId: 2,
      asignaturaId: 101,
      numeroSesion: 1,
      duracionMinutos: 120,
    });
    expect(sesiones[1].id).toBe("asig-1-req-1-ses-2");
    expect(sesiones[1].numeroSesion).toBe(2);
  });

  it("debe lanzar error si la suma de sesiones no coincide con los minutos semanales requeridos", () => {
    const asignacionInvalida: AsignacionAcademica[] = [
      {
        id: 1,
        periodoId: 10,
        asignaturaId: 101,
        docenteId: 5,
        grupoId: 2,
        minutosSemanales: 240, // Requiere 240
        requerimientos: [
          { id: 1, asignacionId: 1, duracionMinutos: 120, cantidad: 1 }, // Solo suma 120!
        ],
      },
    ];

    expect(() => generarSesionesProgramables(asignacionInvalida)).toThrow(
      /Discrepancia en la asignación 1/
    );
  });
});

describe("3. Generador de candidatos horarios", () => {
  const entradaBase: EntradaPlanificacion = {
    periodoId: 1,
    jornadaInicioMinuto: 420, // 07:00
    jornadaFinMinuto: 1080, // 18:00
    diasPermitidos: [1, 2], // Solo Lunes y Martes para la prueba
    pasoCuadriculaMinutos: 60, // Cada 60 minutos para simplificar el test
    asignaciones: [],
    disponibilidades: [
      // Docente 1 disponible el Lunes de 08:00 a 12:00 (480 a 720)
      { id: 1, docenteId: 1, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 },
    ],
  };

  it("debe generar solo candidatos dentro de la disponibilidad docente", () => {
    const sesion = {
      id: "ses-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 1,
      grupoId: 1,
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120, // 2 horas
    };

    const candidatos = generarCandidatosParaSesion(sesion, entradaBase);

    // Intervalo disponible 480..720 (08:00 a 12:00) con duración 120:
    // Inicios posibles con paso 60:
    // 480 -> 480 a 600 (08:00 a 10:00)
    // 540 -> 540 a 660 (09:00 a 11:00)
    // 600 -> 600 a 720 (10:00 a 12:00)
    expect(candidatos).toHaveLength(3);
    expect(candidatos[0]).toEqual({ diaSemana: 1, inicioMinuto: 480, finMinuto: 600 });
    expect(candidatos[1]).toEqual({ diaSemana: 1, inicioMinuto: 540, finMinuto: 660 });
    expect(candidatos[2]).toEqual({ diaSemana: 1, inicioMinuto: 600, finMinuto: 720 });
  });

  it("no debe generar candidatos en días donde el docente no tiene disponibilidad", () => {
    const sesionDocenteSinDisponibilidad = {
      id: "ses-2",
      asignacionId: 2,
      requerimientoId: 2,
      docenteId: 99, // No existe disponibilidad para docente 99
      grupoId: 1,
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 60,
    };

    const candidatos = generarCandidatosParaSesion(sesionDocenteSinDisponibilidad, entradaBase);
    expect(candidatos).toHaveLength(0);
  });
});

describe("4. Validador independiente de restricciones duras", () => {
  const entradaBase: EntradaPlanificacion = {
    periodoId: 1,
    jornadaInicioMinuto: 420, // 07:00
    jornadaFinMinuto: 1080, // 18:00
    diasPermitidos: [1, 2, 3, 4, 5],
    pasoCuadriculaMinutos: 30,
    asignaciones: [],
    disponibilidades: [
      { id: 1, docenteId: 10, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 }, // Docente 10: Lun 08:00-12:00
      { id: 2, docenteId: 20, diaSemana: 1, inicioMinuto: 480, finMinuto: 720 }, // Docente 20: Lun 08:00-12:00
    ],
  };

  it("debe validar como exitoso un horario factible y sin cruces", () => {
    const sesion1 = {
      id: "ses-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 10,
      grupoId: 1,
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120,
    };
    const sesion2 = {
      id: "ses-2",
      asignacionId: 2,
      requerimientoId: 2,
      docenteId: 20,
      grupoId: 2,
      asignaturaId: 2,
      numeroSesion: 1,
      duracionMinutos: 120,
    };

    const horarioValido: SesionAsignada[] = [
      { sesion: sesion1, candidato: { diaSemana: 1, inicioMinuto: 480, finMinuto: 600 } }, // Lun 08:00-10:00
      { sesion: sesion2, candidato: { diaSemana: 1, inicioMinuto: 600, finMinuto: 720 } }, // Lun 10:00-12:00
    ];

    const resultado = validarHorario(horarioValido, entradaBase, 2);

    expect(resultado.esValido).toBe(true);
    expect(resultado.conflictos).toHaveLength(0);
    expect(resultado.totalSesionesAsignadas).toBe(2);
  });

  it("debe detectar cruce cuando el mismo docente tiene dos clases simultáneas", () => {
    const sesion1 = {
      id: "ses-doc-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 10, // Mismo docente
      grupoId: 1, // Distinto grupo
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120,
    };
    const sesion2 = {
      id: "ses-doc-2",
      asignacionId: 2,
      requerimientoId: 2,
      docenteId: 10, // Mismo docente
      grupoId: 2, // Distinto grupo
      asignaturaId: 2,
      numeroSesion: 1,
      duracionMinutos: 120,
    };

    const horarioConCruceDocente: SesionAsignada[] = [
      { sesion: sesion1, candidato: { diaSemana: 1, inicioMinuto: 480, finMinuto: 600 } }, // 08:00-10:00
      { sesion: sesion2, candidato: { diaSemana: 1, inicioMinuto: 540, finMinuto: 660 } }, // 09:00-11:00 (Cruce!)
    ];

    const resultado = validarHorario(horarioConCruceDocente, entradaBase, 2);

    expect(resultado.esValido).toBe(false);
    expect(resultado.conflictos.some((c) => c.tipo === TipoConflicto.CRUCE_DOCENTE)).toBe(true);
  });

  it("debe detectar cruce cuando el mismo grupo tiene dos clases simultáneas", () => {
    const sesion1 = {
      id: "ses-grp-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 10, // Docente A
      grupoId: 1, // Mismo grupo
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120,
    };
    const sesion2 = {
      id: "ses-grp-2",
      asignacionId: 2,
      requerimientoId: 2,
      docenteId: 20, // Docente B
      grupoId: 1, // Mismo grupo
      asignaturaId: 2,
      numeroSesion: 1,
      duracionMinutos: 120,
    };

    const horarioConCruceGrupo: SesionAsignada[] = [
      { sesion: sesion1, candidato: { diaSemana: 1, inicioMinuto: 480, finMinuto: 600 } },
      { sesion: sesion2, candidato: { diaSemana: 1, inicioMinuto: 540, finMinuto: 660 } },
    ];

    const resultado = validarHorario(horarioConCruceGrupo, entradaBase, 2);

    expect(resultado.esValido).toBe(false);
    expect(resultado.conflictos.some((c) => c.tipo === TipoConflicto.CRUCE_GRUPO)).toBe(true);
  });

  it("debe rechazar una sesión asignada fuera de la disponibilidad del docente", () => {
    const sesion = {
      id: "ses-fuera-disp",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 10, // Disponible Lun 08:00-12:00
      grupoId: 1,
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120,
    };

    // Asignada de 14:00 a 16:00 (840 a 960) donde el docente NO está disponible
    const horarioInvalido: SesionAsignada[] = [
      { sesion, candidato: { diaSemana: 1, inicioMinuto: 840, finMinuto: 960 } },
    ];

    const resultado = validarHorario(horarioInvalido, entradaBase, 1);

    expect(resultado.esValido).toBe(false);
    expect(resultado.conflictos.some((c) => c.tipo === TipoConflicto.DOCENTE_NO_DISPONIBLE)).toBe(true);
  });

  it("debe permitir sesiones consecutivas del mismo grupo o docente sin marcarlas como cruce", () => {
    const sesion1 = {
      id: "ses-cons-1",
      asignacionId: 1,
      requerimientoId: 1,
      docenteId: 10,
      grupoId: 1,
      asignaturaId: 1,
      numeroSesion: 1,
      duracionMinutos: 120,
    };
    const sesion2 = {
      id: "ses-cons-2",
      asignacionId: 2,
      requerimientoId: 2,
      docenteId: 10,
      grupoId: 1,
      asignaturaId: 2,
      numeroSesion: 1,
      duracionMinutos: 120,
    };

    // 08:00-10:00 (480-600) y 10:00-12:00 (600-720) -> Se tocan exactamente en 600
    const horarioConsecutivo: SesionAsignada[] = [
      { sesion: sesion1, candidato: { diaSemana: 1, inicioMinuto: 480, finMinuto: 600 } },
      { sesion: sesion2, candidato: { diaSemana: 1, inicioMinuto: 600, finMinuto: 720 } },
    ];

    const resultado = validarHorario(horarioConsecutivo, entradaBase, 2);

    expect(resultado.esValido).toBe(true);
    expect(resultado.conflictos).toHaveLength(0);
  });
});
