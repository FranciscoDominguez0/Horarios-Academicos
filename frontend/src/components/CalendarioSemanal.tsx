"use client";

import React from "react";

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

function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export const COLORES_MATERIAS: Record<string, string> = {
  // 1° Año
  "Algoritmos y Programación I": "bg-blue-600 border-blue-700 text-white",
  "Cálculo Diferencial": "bg-emerald-600 border-emerald-700 text-white",
  "Álgebra Lineal": "bg-purple-600 border-purple-700 text-white",
  "Introducción a la Informática": "bg-rose-600 border-rose-700 text-white",

  // 2° Año
  "Estructuras de Datos y Algoritmos II": "bg-sky-600 border-sky-700 text-white",
  "Cálculo Integral y Vectorial": "bg-teal-600 border-teal-700 text-white",
  "Bases de Datos I": "bg-amber-600 border-amber-700 text-white",
  "Arquitectura de Computadores": "bg-indigo-600 border-indigo-700 text-white",

  // 3° Año
  "Sistemas Operativos": "bg-cyan-700 border-cyan-800 text-white",
  "Bases de Datos Avanzadas": "bg-orange-600 border-orange-700 text-white",
  "Redes y Telecomunicaciones": "bg-violet-600 border-violet-700 text-white",
  "Ingeniería de Software": "bg-fuchsia-600 border-fuchsia-700 text-white",
};

export function obtenerColorMateria(asignatura: string): string {
  if (COLORES_MATERIAS[asignatura]) {
    return COLORES_MATERIAS[asignatura];
  }
  const paleta = [
    "bg-sky-600 border-sky-700 text-white",
    "bg-violet-600 border-violet-700 text-white",
    "bg-pink-600 border-pink-700 text-white",
    "bg-teal-600 border-teal-700 text-white",
    "bg-orange-600 border-orange-700 text-white",
    "bg-lime-600 border-lime-700 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < asignatura.length; i++) {
    hash = (hash + asignatura.charCodeAt(i)) % paleta.length;
  }
  return paleta[hash];
}

interface EventoPosicionado extends SesionCalendario {
  columna: number;
  totalColumnas: number;
  tieneConflictoDocente: boolean;
  tieneConflictoGrupo: boolean;
  tieneConflictoSalon: boolean;
}

/**
 * Algoritmo de diseño de eventos simultáneos (sub-columnas dinámicas sin solapamiento).
 * Permite que todas las clases que ocurren a la misma hora en distintos grupos
 * se muestren una al lado de la otra de forma visible y legible.
 */
function calcularDisposicionEventos(sesiones: SesionCalendario[]): EventoPosicionado[] {
  if (sesiones.length === 0) return [];

  // Ordenar por hora de inicio y luego por duración
  const ordenadas = [...sesiones].sort((a, b) => {
    if (a.inicioMinuto !== b.inicioMinuto) return a.inicioMinuto - b.inicioMinuto;
    return (b.finMinuto - b.inicioMinuto) - (a.finMinuto - a.inicioMinuto);
  });

  // Agrupar en clusters de solapamiento
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
  jornadaInicioMinuto = 420, // 07:00
  jornadaFinMinuto = 1080, // 18:00
}: PropiedadesCalendario) {
  const duracionTotalJornada = jornadaFinMinuto - jornadaInicioMinuto;

  // Generar marcas de hora para la regla lateral (07:00, 08:00 ... 18:00)
  const horasGuia: number[] = [];
  for (let min = jornadaInicioMinuto; min <= jornadaFinMinuto; min += 60) {
    horasGuia.push(min);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Calendario Semanal — Distribución en 3 Salones y 3 Años</h3>
          <p className="text-xs text-slate-500">
            Cada clase se asigna a uno de los 3 salones libres (Salón 101, 102 y 103). Un profesor o grupo nunca está en dos salones simultáneos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
            {sesiones.length} sesiones visibles
          </span>
        </div>
      </div>

      {/* Cabecera de Días con columna para horas */}
      <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-slate-200 bg-slate-50 text-center font-medium text-xs text-slate-600">
        <div className="py-2.5 border-r border-slate-200 text-slate-400 font-mono text-[10px]">
          Hora
        </div>
        {DIAS.map((dia) => (
          <div key={dia.id} className="py-2.5 border-r last:border-r-0 border-slate-200">
            {dia.nombre}
          </div>
        ))}
      </div>

      {/* Cuerpo del Calendario con Cuadrícula */}
      <div className="grid grid-cols-[60px_repeat(5,1fr)] relative h-[650px] bg-slate-50/20 overflow-y-auto">
        {/* Columna Lateral de Horas */}
        <div className="relative border-r border-slate-200 select-none bg-slate-50/50">
          {horasGuia.map((min) => {
            const top = ((min - jornadaInicioMinuto) / duracionTotalJornada) * 100;
            return (
              <div
                key={min}
                style={{ top: `${top}%` }}
                className="absolute left-0 right-1 text-right text-[10px] font-mono text-slate-400 -translate-y-1/2 pr-1"
              >
                {formatearMinutos(min)}
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
              className="relative border-r last:border-r-0 border-slate-200 h-full"
            >
              {/* Líneas Guía Horizontales de Cada Hora */}
              {horasGuia.map((min) => {
                const top = ((min - jornadaInicioMinuto) / duracionTotalJornada) * 100;
                return (
                  <div
                    key={min}
                    style={{ top: `${top}%` }}
                    className="absolute left-0 right-0 border-b border-dashed border-slate-200/80 pointer-events-none"
                  />
                );
              })}

              {/* Tarjetas de Sesión Posicionadas Dinámicamente */}
              {eventosPosicionados.map((item) => {
                const topPorcentaje =
                  ((item.inicioMinuto - jornadaInicioMinuto) / duracionTotalJornada) * 100;
                const alturaPorcentaje =
                  ((item.finMinuto - item.inicioMinuto) / duracionTotalJornada) * 100;

                const anchoPorcentaje = 98 / item.totalColumnas;
                const leftPorcentaje = 1 + item.columna * anchoPorcentaje;

                const tieneConflicto = item.tieneConflictoDocente || item.tieneConflictoGrupo || item.tieneConflictoSalon;
                const colorClase = tieneConflicto
                  ? "bg-rose-700 border-rose-900 text-white shadow-md ring-2 ring-rose-400"
                  : obtenerColorMateria(item.asignatura);

                return (
                  <div
                    key={item.id}
                    style={{
                      top: `${Math.max(0, topPorcentaje)}%`,
                      height: `${Math.max(4, alturaPorcentaje)}%`,
                      left: `${leftPorcentaje}%`,
                      width: `${anchoPorcentaje}%`,
                    }}
                    className={`absolute rounded-xl p-2 shadow-sm border flex flex-col justify-between overflow-hidden text-xs transition-all hover:z-20 hover:scale-[1.01] hover:shadow-lg ${colorClase}`}
                  >
                    <div>
                      {tieneConflicto && (
                        <div className="bg-rose-950/90 text-rose-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded mb-1 truncate">
                          ⚠️ {item.tieneConflictoDocente ? "Choque Docente" : item.tieneConflictoSalon ? "Choque Salón" : "Choque Grupo"}
                        </div>
                      )}
                      <p className="font-extrabold truncate text-[11px] leading-tight">
                        {item.asignatura}
                      </p>
                      <p className="text-[10px] opacity-90 truncate mt-0.5 flex items-center gap-1">
                        <span>👨‍🏫</span> {item.docente}
                      </p>
                    </div>

                    <div className="space-y-0.5 pt-1 border-t border-white/20 text-[9px] opacity-95 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold bg-black/25 px-1 py-0.5 rounded truncate">
                          📍 {item.salon || "Salón"}
                        </span>
                        <span className="bg-black/25 px-1 py-0.5 rounded truncate">
                          🎓 {item.grupo?.split(" - ")[0] || item.grupo}
                        </span>
                      </div>
                      <div className="text-right font-bold">
                        🕒 {formatearMinutos(item.inicioMinuto)} - {formatearMinutos(item.finMinuto)}
                      </div>
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
