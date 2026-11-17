"use client";

import React from "react";

interface PropiedadesDashboard {
  periodo: { id: number; name: string; status: string } | null;
  totalAsignaciones: number;
  totalSesiones: number;
  totalDocentes: number;
  ultimaEjecucionGreedy: any | null;
  ultimaEjecucionBacktracking: any | null;
  onNavegar: (pantalla: string) => void;
}

export default function PantallaDashboard({
  periodo,
  totalAsignaciones,
  totalSesiones,
  totalDocentes,
  ultimaEjecucionGreedy,
  ultimaEjecucionBacktracking,
  onNavegar,
}: PropiedadesDashboard) {
  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Orientación */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-7 text-white shadow-sm border border-slate-800">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-wider font-bold bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20">
            Panel de Planificación y Optimización
          </span>
          <h2 className="text-2xl font-bold mt-3">
            Sistema de Asignación Automática de Horarios
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Entorno de resolución para el problema de optimización combinatoria y satisfacción de restricciones (CSP).
            Modela variables de asignación con dominios de franjas horarias y compara el desempeño empírico y asintótico de{" "}
            <span className="font-semibold text-white">Algoritmos voraces (Greedy)</span> frente al{" "}
            <span className="font-semibold text-white">Algoritmo de Retroceso (Backtracking)</span> bajo análisis riguroso de complejidad computacional.
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => onNavegar("ejecucion")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Generar Horarios
            </button>
            <button
              onClick={() => onNavegar("entrada")}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all"
            >
              Consultar Datos de Entrada
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas del Problema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Período Activo</span>
          <div className="text-xl font-bold text-slate-900 mt-1 truncate">
            {periodo ? periodo.name : "Cargando..."}
          </div>
          <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {periodo?.status === "ACTIVE" ? "Activo" : periodo?.status ?? "Lectivo"}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Asignaciones</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {totalAsignaciones}
          </div>
          <p className="text-xs text-slate-500 mt-1">Materias con docente y grupo</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Sesiones Requeridas</span>
          <div className="text-3xl font-black text-indigo-600 mt-1">
            {totalSesiones}
          </div>
          <p className="text-xs text-slate-500 mt-1">Bloques a ubicar en la semana</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Docentes Registrados</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {totalDocentes}
          </div>
          <p className="text-xs text-slate-500 mt-1">Con disponibilidad horaria</p>
        </div>
      </div>

      {/* Últimos Resultados de los Algoritmos */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3">Últimas Ejecuciones Registradas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Greedy */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-800">Algoritmos voraces (Greedy)</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                  Decisiones Locales
                </span>
              </div>
              {ultimaEjecucionGreedy ? (
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-bold text-slate-800">{ultimaEjecucionGreedy.estado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo:</span>
                    <span className="font-mono font-bold text-slate-800">{ultimaEjecucionGreedy.duracionMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sesiones Asignadas:</span>
                    <span className="font-bold text-emerald-600">
                      {ultimaEjecucionGreedy.sesionesAsignadas} / {totalSesiones}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operaciones:</span>
                    <span className="font-mono text-slate-700">{ultimaEjecucionGreedy.operaciones}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4 italic">No se ha ejecutado aún en este período.</p>
              )}
            </div>
            <button
              onClick={() => onNavegar("ejecucion")}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            >
              Ejecutar Algoritmos voraces (Greedy)
            </button>
          </div>

          {/* Backtracking */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-800">Algoritmo de Retroceso (Backtracking)</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                  Búsqueda con Poda
                </span>
              </div>
              {ultimaEjecucionBacktracking ? (
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-bold text-slate-800">{ultimaEjecucionBacktracking.estado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo:</span>
                    <span className="font-mono font-bold text-slate-800">{ultimaEjecucionBacktracking.duracionMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nodos Visitados:</span>
                    <span className="font-mono text-slate-800">{ultimaEjecucionBacktracking.nodosVisitados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retrocesos:</span>
                    <span className="font-mono text-slate-800">{ultimaEjecucionBacktracking.retrocesos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sesiones Asignadas:</span>
                    <span className="font-bold text-emerald-600">
                      {ultimaEjecucionBacktracking.sesionesAsignadas} / {totalSesiones}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4 italic">No se ha ejecutado aún en este período.</p>
              )}
            </div>
            <button
              onClick={() => onNavegar("ejecucion")}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            >
              Ejecutar Algoritmo de Retroceso (Backtracking)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
