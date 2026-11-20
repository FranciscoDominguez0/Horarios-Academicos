"use client";

import React from "react";
import {
  IconoEjecucion,
  IconoCalendario,
  IconoCheck,
  IconoAlerta,
  IconoLibro,
  IconoProfesor,
  IconoEstudiante,
  IconoBasura,
  IconoVarita,
} from "./Iconos";

interface PropiedadesDashboard {
  periodo: { id: number; name: string; status: string } | null;
  totalAsignaciones: number;
  totalSesiones: number;
  totalDocentes: number;
  ultimaEjecucionGreedy: any | null;
  ultimaEjecucionBacktracking: any | null;
  onNavegar: (pantalla: string) => void;
  onLimpiarResultados?: () => Promise<void>;
  limpiandoResultados?: boolean;
  onGenerarEscenario?: () => Promise<void>;
  generandoEscenario?: boolean;
  escenarioInfo?: { nombre: string; descripcion: string } | null;
}

export default function PantallaDashboard({
  periodo,
  totalAsignaciones,
  totalSesiones,
  totalDocentes,
  ultimaEjecucionGreedy,
  ultimaEjecucionBacktracking,
  onNavegar,
  onLimpiarResultados,
  limpiandoResultados = false,
  onGenerarEscenario,
  generandoEscenario = false,
  escenarioInfo,
}: PropiedadesDashboard) {
  return (
    <div className="space-y-6">
      {/* Barra de Acciones Rápidas */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-800">
            Resumen General de Planificación
          </span>
          <p className="text-xs text-slate-500">
            Ingeniería en Informática · 1° Año, 2° Año y 3° Año.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onGenerarEscenario && (
            <button
              onClick={onGenerarEscenario}
              disabled={generandoEscenario || limpiandoResultados}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              title="Genera un nuevo escenario con IA para Ingenieria en Informatica, limpiando resultados previos"
            >
              <IconoVarita className="w-3.5 h-3.5" />
              <span>{generandoEscenario ? "Generando con IA..." : "Generar Escenario con IA"}</span>
            </button>
          )}

          {onLimpiarResultados && (
            <button
              onClick={onLimpiarResultados}
              disabled={limpiandoResultados || generandoEscenario}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              title="Limpia solo los resultados calculados, manteniendo asignaturas y profesores"
            >
              <IconoBasura className="w-3.5 h-3.5 text-rose-600" />
              <span>{limpiandoResultados ? "Limpiando..." : "Limpiar Resultados"}</span>
            </button>
          )}

          <button
            onClick={() => onNavegar("horario")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <IconoCalendario className="w-3.5 h-3.5" />
            <span>Ver Horario</span>
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Asignaturas</span>
            <IconoLibro className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalAsignaciones}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">3 años académicos (1°, 2° y 3°)</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sesiones Semanales</span>
            <IconoCalendario className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {totalSesiones}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Horario semanal optimizado</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Docentes</span>
            <IconoProfesor className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalDocentes}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Con disponibilidad registrada</p>
        </div>
      </div>

      {/* Últimos Resultados de Algoritmos */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Últimos Resultados de Ejecución</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Greedy */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs">Algoritmos voraces (Greedy)</span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full">
                  Decisión Local
                </span>
              </div>
              {ultimaEjecucionGreedy ? (
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-semibold text-slate-900">{ultimaEjecucionGreedy.estado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo de ejecución:</span>
                    <span className="font-mono font-semibold text-slate-900">{ultimaEjecucionGreedy.duracionMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sesiones asignadas:</span>
                    <span className="font-semibold text-slate-900">
                      {ultimaEjecucionGreedy.sesionesAsignadas} / {totalSesiones}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operaciones evaluadas:</span>
                    <span className="font-mono text-slate-700">{ultimaEjecucionGreedy.operaciones}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-3 italic">Sin ejecución registrada.</p>
              )}
            </div>
            <button
              onClick={() => onNavegar("horario")}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-full text-xs font-semibold border border-slate-200 transition-all"
            >
              Configurar y Ejecutar Horario
            </button>
          </div>

          {/* Backtracking */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs">Algoritmo de Retroceso (Backtracking)</span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                  Búsqueda con Poda
                </span>
              </div>
              {ultimaEjecucionBacktracking ? (
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-semibold text-slate-900">{ultimaEjecucionBacktracking.estado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo de ejecución:</span>
                    <span className="font-mono font-semibold text-slate-900">{ultimaEjecucionBacktracking.duracionMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retrocesos (backtracks):</span>
                    <span className="font-mono font-semibold text-indigo-700">{ultimaEjecucionBacktracking.retrocesos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sesiones asignadas:</span>
                    <span className="font-semibold text-emerald-700">
                      {ultimaEjecucionBacktracking.sesionesAsignadas} / {totalSesiones} (100%)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-3 italic">Sin ejecución registrada.</p>
              )}
            </div>
            <button
              onClick={() => onNavegar("horario")}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-full text-xs font-semibold border border-slate-200 transition-all"
            >
              Configurar y Ejecutar Horario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
