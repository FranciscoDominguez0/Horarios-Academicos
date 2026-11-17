"use client";

import React, { useState } from "react";

export type ModoEjecucion = "GREEDY" | "BACKTRACKING" | "AMBOS";

interface PropiedadesEjecucion {
  periodoId: number;
  alEjecutar: (
    modo: ModoEjecucion,
    configuracion: {
      pasoCuadriculaMinutos: number;
      jornadaInicioMinuto: number;
      jornadaFinMinuto: number;
    }
  ) => Promise<void>;
  cargando: boolean;
  resumenEjecucion: {
    algoritmo: string;
    estado: string;
    duracionMs: number;
    operaciones: number;
    nodosVisitados?: number;
    retrocesos?: number;
    sesionesAsignadas: number;
    sesionesPendientes: number;
    conflictos: number;
  } | null;
  onVerHorario: () => void;
  onVerComparativa: () => void;
}

export default function PantallaEjecucion({
  periodoId,
  alEjecutar,
  cargando,
  resumenEjecucion,
  onVerHorario,
  onVerComparativa,
}: PropiedadesEjecucion) {
  const [modo, setModo] = useState<ModoEjecucion>("AMBOS");
  const [pasoCuadricula, setPasoCuadricula] = useState<number>(30);
  const [jornadaInicio, setJornadaInicio] = useState<number>(420); // 07:00
  const [jornadaFin, setJornadaFin] = useState<number>(1080); // 18:00

  async function manejarEjecucion() {
    await alEjecutar(modo, {
      pasoCuadriculaMinutos: pasoCuadricula,
      jornadaInicioMinuto: jornadaInicio,
      jornadaFinMinuto: jornadaFin,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario de Configuración y Disparo */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configuración y Ejecución</h2>
          <p className="text-xs text-slate-500 mt-1">
            Selecciona el algoritmo y los parámetros de búsqueda para el Período #{periodoId}
          </p>
        </div>

        {/* 1. Selección de Algoritmo */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
            Seleccionar Estrategia
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Opción Greedy */}
            <div
              onClick={() => setModo("GREEDY")}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                modo === "GREEDY"
                  ? "border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-400/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
              }`}
            >
              <div className="font-bold text-sm">Greedy</div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Construye solución rápida mediante decisiones locales deterministas (MRV).
              </p>
            </div>

            {/* Opción Backtracking */}
            <div
              onClick={() => setModo("BACKTRACKING")}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                modo === "BACKTRACKING"
                  ? "border-indigo-500 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-400/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
              }`}
            >
              <div className="font-bold text-sm">Backtracking</div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Búsqueda exhaustiva con poda. Explora alternativas y retrocede al fallar.
              </p>
            </div>

            {/* Opción Ambos */}
            <div
              onClick={() => setModo("AMBOS")}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                modo === "AMBOS"
                  ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-400/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span>Ejecutar Ambos</span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Ejecuta ambos algoritmos sobre la misma entrada para habilitar la comparativa directa.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Parámetros de la Cuadrícula y Jornada */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Intervalo de Candidatos
            </label>
            <select
              value={pasoCuadricula}
              onChange={(e) => setPasoCuadricula(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value={15}>Cada 15 minutos</option>
              <option value={30}>Cada 30 minutos (Estándar)</option>
              <option value={60}>Cada 60 minutos</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jornada Institucional
            </label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono">
              07:00 – 18:00
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Días Permitidos
            </label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
              Lunes a Viernes (1 a 5)
            </div>
          </div>
        </div>

        {/* 3. Botón de Disparo */}
        <button
          type="button"
          disabled={cargando}
          onClick={manejarEjecucion}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <span>Calculando planificación y resolviendo restricciones...</span>
          ) : (
            <span>Iniciar Planificación: {modo}</span>
          )}
        </button>
      </div>

      {/* Columna Derecha: Monitor y Resumen en Vivo */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Resumen de la Última Ejecución
          </h3>

          {resumenEjecucion ? (
            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Algoritmo:</span>
                <span className="font-bold text-slate-800 text-sm">{resumenEjecucion.algoritmo}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Estado:</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                    resumenEjecucion.estado === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {resumenEjecucion.estado}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500 font-medium">Tiempo transcurrido:</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {resumenEjecucion.duracionMs} ms
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Operaciones evaluadas:</span>
                <span className="font-mono font-bold text-slate-800">
                  {resumenEjecucion.operaciones.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-500 font-medium">Sesiones asignadas:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {resumenEjecucion.sesionesAsignadas}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Sesiones pendientes:</span>
                <span className="font-bold text-amber-600">
                  {resumenEjecucion.sesionesPendientes}
                </span>
              </div>

              {resumenEjecucion.nodosVisitados !== undefined && resumenEjecucion.nodosVisitados > 0 && (
                <>
                  <div className="flex justify-between items-center py-1 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Nodos visitados (BT):</span>
                    <span className="font-mono text-slate-700">{resumenEjecucion.nodosVisitados}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Retrocesos (Backtracks):</span>
                    <span className="font-mono text-slate-700">{resumenEjecucion.retrocesos ?? 0}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              Configura los parámetros a la izquierda y presiona el botón de ejecución.
            </div>
          )}
        </div>

        {resumenEjecucion && (
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              onClick={onVerHorario}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-all"
            >
              Ver Horario en Calendario →
            </button>
            <button
              onClick={onVerComparativa}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-all"
            >
              Ver Comparativa Experimental →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
