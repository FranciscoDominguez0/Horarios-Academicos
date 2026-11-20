"use client";

import React from "react";
import { IconoProfesor, IconoUbicacion, IconoReloj, IconoAlerta, IconoCheck, IconoPuntos } from "./Iconos";

export interface SesionCalendario {
  id: string;
  diaSemana: number; // 1 = Lunes .. 5 = Viernes
  inicioMinuto: number;
  finMinuto: number;
  asignatura: string;
  docente: string;
  grupo: string;
  salon?: string;
  grupoCodigo?: string;
}

interface PropiedadesCalendario {
  sesiones: SesionCalendario[];
  jornadaInicioMinuto?: number;
  jornadaFinMinuto?: number;
}

const DIAS = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
];

function formatearHora12(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatearHoraCorta(minutos: number): string {
  return formatearHora12(minutos);
}

export const ESTILOS_MATERIAS: Record<
  string,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  // 1° Año
  "Algoritmos y Programación I": {
    bg: "bg-[#ece8fd]",
    border: "border-[#ded5f8]",
    text: "text-purple-950",
    badge: "bg-white/90 text-purple-900",
    dot: "bg-purple-500",
  },
  "Cálculo Diferencial e Integral": {
    bg: "bg-[#ddf7e5]",
    border: "border-[#c2ecd0]",
    text: "text-emerald-950",
    badge: "bg-white/90 text-emerald-900",
    dot: "bg-emerald-500",
  },
  "Álgebra Lineal y Geometría": {
    bg: "bg-[#e0f4fc]",
    border: "border-[#c6e7f7]",
    text: "text-sky-950",
    badge: "bg-white/90 text-sky-900",
    dot: "bg-sky-500",
  },
  "Introducción a la Informática": {
    bg: "bg-[#fde7df]",
    border: "border-[#f6d0c0]",
    text: "text-orange-950",
    badge: "bg-white/90 text-orange-900",
    dot: "bg-orange-500",
  },
  "Física Mecánica y Laboratorio": {
    bg: "bg-[#fef3d6]",
    border: "border-[#f7e3ad]",
    text: "text-amber-950",
    badge: "bg-white/90 text-amber-900",
    dot: "bg-amber-500",
  },

  // 2° Año
  "Estructuras de Datos y Algoritmos II": {
    bg: "bg-[#e2ecfe]",
    border: "border-[#ccdeff]",
    text: "text-blue-950",
    badge: "bg-white/90 text-blue-900",
    dot: "bg-blue-600",
  },
  "Probabilidad y Estadística Aplicada": {
    bg: "bg-[#dcfce7]",
    border: "border-[#bbf7d0]",
    text: "text-teal-950",
    badge: "bg-white/90 text-teal-900",
    dot: "bg-teal-500",
  },
  "Bases de Datos I": {
    bg: "bg-[#ffedd5]",
    border: "border-[#fed7aa]",
    text: "text-orange-950",
    badge: "bg-white/90 text-orange-900",
    dot: "bg-orange-500",
  },
  "Arquitectura de Computadores": {
    bg: "bg-[#ede9fe]",
    border: "border-[#ddd6fe]",
    text: "text-violet-950",
    badge: "bg-white/90 text-violet-900",
    dot: "bg-violet-500",
  },
  "Programación Orientada a Objetos": {
    bg: "bg-[#fce7f3]",
    border: "border-[#fbcfe8]",
    text: "text-pink-950",
    badge: "bg-white/90 text-pink-900",
    dot: "bg-pink-500",
  },

  // 3° Año
  "Redes y Telecomunicaciones": {
    bg: "bg-[#ece8fd]",
    border: "border-[#ded5f8]",
    text: "text-purple-950",
    badge: "bg-white/90 text-purple-900",
    dot: "bg-purple-500",
  },
  "Ingeniería de Software": {
    bg: "bg-[#fce7f3]",
    border: "border-[#fbcfe8]",
    text: "text-pink-950",
    badge: "bg-white/90 text-pink-900",
    dot: "bg-pink-500",
  },
  "Sistemas Operativos": {
    bg: "bg-[#e0f4fc]",
    border: "border-[#c6e7f7]",
    text: "text-sky-950",
    badge: "bg-white/90 text-sky-900",
    dot: "bg-sky-500",
  },
  "Bases de Datos Avanzadas": {
    bg: "bg-[#fef3d6]",
    border: "border-[#f7e3ad]",
    text: "text-amber-950",
    badge: "bg-white/90 text-amber-900",
    dot: "bg-amber-500",
  },
  "Inteligencia Artificial": {
    bg: "bg-[#ddf7e5]",
    border: "border-[#c2ecd0]",
    text: "text-emerald-950",
    badge: "bg-white/90 text-emerald-900",
    dot: "bg-emerald-500",
  },
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const ESTILOS_NORMALIZADOS: Record<
  string,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {};

for (const [clave, estilo] of Object.entries(ESTILOS_MATERIAS)) {
  ESTILOS_NORMALIZADOS[normalizarTexto(clave)] = estilo;
}

// Paleta pastel armónica de respaldo para garantizar que NINGUNA materia quede en gris
const PALETA_FALLBACK = [
  { bg: "bg-[#ece8fd]", border: "border-[#ded5f8]", text: "text-purple-950", badge: "bg-white/90 text-purple-900", dot: "bg-purple-500" },
  { bg: "bg-[#ddf7e5]", border: "border-[#c2ecd0]", text: "text-emerald-950", badge: "bg-white/90 text-emerald-900", dot: "bg-emerald-500" },
  { bg: "bg-[#e0f4fc]", border: "border-[#c6e7f7]", text: "text-sky-950", badge: "bg-white/90 text-sky-900", dot: "bg-sky-500" },
  { bg: "bg-[#fde7df]", border: "border-[#f6d0c0]", text: "text-orange-950", badge: "bg-white/90 text-orange-900", dot: "bg-orange-500" },
  { bg: "bg-[#fef3d6]", border: "border-[#f7e3ad]", text: "text-amber-950", badge: "bg-white/90 text-amber-900", dot: "bg-amber-500" },
  { bg: "bg-[#e2ecfe]", border: "border-[#ccdeff]", text: "text-blue-950", badge: "bg-white/90 text-blue-900", dot: "bg-blue-600" },
  { bg: "bg-[#dcfce7]", border: "border-[#bbf7d0]", text: "text-teal-950", badge: "bg-white/90 text-teal-900", dot: "bg-teal-500" },
  { bg: "bg-[#ffedd5]", border: "border-[#fed7aa]", text: "text-orange-950", badge: "bg-white/90 text-orange-900", dot: "bg-orange-500" },
  { bg: "bg-[#ede9fe]", border: "border-[#ddd6fe]", text: "text-violet-950", badge: "bg-white/90 text-violet-900", dot: "bg-violet-500" },
  { bg: "bg-[#fce7f3]", border: "border-[#fbcfe8]", text: "text-pink-950", badge: "bg-white/90 text-pink-900", dot: "bg-pink-500" },
];

export function obtenerEstiloMateria(asignatura: string) {
  if (!asignatura) return PALETA_FALLBACK[0];

  // 1. Coincidencia directa exacta
  if (ESTILOS_MATERIAS[asignatura]) {
    return ESTILOS_MATERIAS[asignatura];
  }

  // 2. Coincidencia normalizada (ignora tildes, mayúsculas y símbolos)
  const norm = normalizarTexto(asignatura);
  if (ESTILOS_NORMALIZADOS[norm]) {
    return ESTILOS_NORMALIZADOS[norm];
  }

  // 3. Coincidencia parcial por prefijo o contenido
  for (const [clave, estilo] of Object.entries(ESTILOS_NORMALIZADOS)) {
    if (norm.includes(clave) || clave.includes(norm)) {
      return estilo;
    }
  }

  // 4. Fallback determinista pastel (nunca gris plano)
  let hash = 0;
  for (let i = 0; i < asignatura.length; i++) {
    hash = (hash << 5) - hash + asignatura.charCodeAt(i);
    hash |= 0;
  }
  return PALETA_FALLBACK[Math.abs(hash) % PALETA_FALLBACK.length];
}

// Compatibilidad
export function obtenerColorMateria(asignatura: string): string {
  const estilo = obtenerEstiloMateria(asignatura);
  return `${estilo.bg} ${estilo.border} ${estilo.text}`;
}

interface EventoPosicionado extends SesionCalendario {
  columna: number;
  totalColumnas: number;
  tieneConflictoDocente: boolean;
  tieneConflictoGrupo: boolean;
  tieneConflictoSalon: boolean;
}

function calcularDisposicionEventos(sesiones: SesionCalendario[]): EventoPosicionado[] {
  if (sesiones.length === 0) return [];

  const ordenadas = [...sesiones].sort((a, b) => {
    if (a.inicioMinuto !== b.inicioMinuto) return a.inicioMinuto - b.inicioMinuto;
    return (b.finMinuto - b.inicioMinuto) - (a.finMinuto - a.inicioMinuto);
  });

  const clusters: SesionCalendario[][] = [];
  let clusterActual: SesionCalendario[] = [];
  let clusterFinMinuto = -1;

  for (const sesion of ordenadas) {
    if (clusterActual.length === 0) {
      clusterActual.push(sesion);
      clusterFinMinuto = sesion.finMinuto;
    } else if (sesion.inicioMinuto < clusterFinMinuto) {
      clusterActual.push(sesion);
      clusterFinMinuto = Math.max(clusterFinMinuto, sesion.finMinuto);
    } else {
      clusters.push(clusterActual);
      clusterActual = [sesion];
      clusterFinMinuto = sesion.finMinuto;
    }
  }
  if (clusterActual.length > 0) {
    clusters.push(clusterActual);
  }

  const resultado: EventoPosicionado[] = [];

  for (const cluster of clusters) {
    const columnasFin: number[] = [];
    const eventosCluster: Array<{ sesion: SesionCalendario; col: number }> = [];

    for (const sesion of cluster) {
      let asignada = false;
      for (let c = 0; c < columnasFin.length; c++) {
        if (sesion.inicioMinuto >= columnasFin[c]) {
          columnasFin[c] = sesion.finMinuto;
          eventosCluster.push({ sesion, col: c });
          asignada = true;
          break;
        }
      }
      if (!asignada) {
        columnasFin.push(sesion.finMinuto);
        eventosCluster.push({ sesion, col: columnasFin.length - 1 });
      }
    }

    const totalCols = columnasFin.length;

    for (const { sesion, col } of eventosCluster) {
      let tieneConflictoDocente = false;
      let tieneConflictoGrupo = false;
      let tieneConflictoSalon = false;

      for (const otro of cluster) {
        if (
          otro.id !== sesion.id &&
          sesion.inicioMinuto < otro.finMinuto &&
          otro.inicioMinuto < sesion.finMinuto
        ) {
          if (otro.docente === sesion.docente) tieneConflictoDocente = true;
          if (otro.grupo === sesion.grupo) tieneConflictoGrupo = true;
          if (otro.salon && sesion.salon && otro.salon === sesion.salon) tieneConflictoSalon = true;
        }
      }

      resultado.push({
        ...sesion,
        columna: col,
        totalColumnas: totalCols,
        tieneConflictoDocente,
        tieneConflictoGrupo,
        tieneConflictoSalon,
      });
    }
  }

  return resultado;
}

export default function CalendarioSemanal({
  sesiones,
  jornadaInicioMinuto = 480, // 08:00
  jornadaFinMinuto = 1080, // 18:00
}: PropiedadesCalendario) {
  const duracionTotalJornada = jornadaFinMinuto - jornadaInicioMinuto;

  const horasGuia: number[] = [];
  for (let min = jornadaInicioMinuto; min <= jornadaFinMinuto; min += 60) {
    horasGuia.push(min);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      {/* Cabecera del Calendario */}
      <div className="grid grid-cols-[82px_repeat(5,1fr)] border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="py-3 border-r border-slate-100 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Hora
        </div>
        {DIAS.map((dia) => (
          <div
            key={dia.id}
            className="py-3 border-r last:border-r-0 border-slate-100 text-center text-xs font-bold text-slate-700"
          >
            {dia.nombre}
          </div>
        ))}
      </div>

      {/* Contenedor Cuadrícula de Tiempo */}
      <div className="grid grid-cols-[82px_repeat(5,1fr)] relative h-[680px] bg-white overflow-y-auto">
        {/* Regla de Horas Lateral */}
        <div className="relative border-r border-slate-100 select-none bg-slate-50/30">
          {horasGuia.map((min) => {
            const top = ((min - jornadaInicioMinuto) / duracionTotalJornada) * 100;
            const esPrimeraHora = min === jornadaInicioMinuto;
            const esUltimaHora = min === jornadaFinMinuto;
            const translateClase = esPrimeraHora
              ? "translate-y-1.5"
              : esUltimaHora
              ? "-translate-y-full pb-1"
              : "-translate-y-1/2";

            return (
              <div
                key={min}
                style={{ top: `${top}%` }}
                className={`absolute left-0 right-2 text-right text-[11px] font-semibold text-slate-400 pr-1 ${translateClase}`}
              >
                {formatearHora12(min)}
              </div>
            );
          })}
        </div>

        {/* 5 Columnas de Días */}
        {DIAS.map((dia) => {
          const sesionesDelDia = sesiones.filter((s) => s.diaSemana === dia.id);
          const eventosPosicionados = calcularDisposicionEventos(sesionesDelDia);

          return (
            <div
              key={dia.id}
              className="relative border-r last:border-r-0 border-slate-100 h-full"
            >
              {/* Líneas Horizontales Discretas para Cada Hora */}
              {horasGuia.map((min) => {
                const top = ((min - jornadaInicioMinuto) / duracionTotalJornada) * 100;
                return (
                  <div
                    key={min}
                    style={{ top: `${top}%` }}
                    className="absolute left-0 right-0 border-b border-slate-100/90 pointer-events-none"
                  />
                );
              })}

              {/* Tarjetas de Clases */}
              {eventosPosicionados.map((item) => {
                const topPorcentaje =
                  ((item.inicioMinuto - jornadaInicioMinuto) / duracionTotalJornada) * 100;
                const alturaPorcentaje =
                  ((item.finMinuto - item.inicioMinuto) / duracionTotalJornada) * 100;

                const anchoPorcentaje = 97 / item.totalColumnas;
                const leftPorcentaje = 1.5 + item.columna * anchoPorcentaje;

                const tieneConflicto =
                  item.tieneConflictoDocente ||
                  item.tieneConflictoGrupo ||
                  item.tieneConflictoSalon;

                const estilo = obtenerEstiloMateria(item.asignatura);

                return (
                  <div
                    key={item.id}
                    style={{
                      top: `calc(${Math.max(0, topPorcentaje)}% + 3px)`,
                      height: `calc(${Math.max(4, alturaPorcentaje)}% - 6px)`,
                      left: `${leftPorcentaje}%`,
                      width: `${anchoPorcentaje}%`,
                    }}
                    className={`absolute rounded-2xl p-2.5 shadow-xs border transition-all hover:shadow-md hover:z-20 flex flex-col justify-between overflow-hidden text-xs ${
                      tieneConflicto
                        ? "bg-rose-50 border-rose-300 text-rose-950"
                        : `${estilo.bg} ${estilo.border} ${estilo.text}`
                    }`}
                  >
                    <div>
                      {tieneConflicto ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 mb-1">
                          <IconoAlerta className="w-3 h-3 shrink-0" />
                          <span className="truncate">Conflicto detectado</span>
                        </div>
                      ) : null}

                      {/* Fila Superior: Título y Menú 3 puntos */}
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-semibold text-slate-900 text-xs leading-snug line-clamp-2">
                          {item.asignatura}
                        </h4>
                        <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded shrink-0">
                          <IconoPuntos className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Fila Horario y Profesor */}
                      <div className="text-[11px] text-slate-600 font-medium space-y-0.5">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                          <IconoReloj className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>
                            {formatearHora12(item.inicioMinuto)} – {formatearHora12(item.finMinuto)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 truncate text-slate-700">
                          <IconoProfesor className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.docente.split(" (")[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fila Inferior: Badges Blancos estilo Dashboard */}
                    <div className="pt-1.5 flex items-center justify-between gap-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-white/95 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs border border-white/80">
                        <IconoCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Confirmado</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-white/95 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
                        <IconoUbicacion className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.salon || "Salón"}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
