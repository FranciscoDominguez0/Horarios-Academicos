"use client";

import React from "react";
import { MetricasComparativa } from "./ComparativaAlgoritmos";

interface PropiedadesComparativa {
  datos: MetricasComparativa | null;
  totalSesiones: number;
}

export default function PantallaComparativa({
  datos,
  totalSesiones,
}: PropiedadesComparativa) {
  if (!datos) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
        <span className="text-4xl block">📊</span>
        <h3 className="text-lg font-bold text-slate-800">No hay datos de comparación disponibles</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Ejecuta ambos algoritmos (Greedy y Backtracking) en la pantalla de{" "}
          <span className="font-semibold text-slate-700">Ejecución de Algoritmos</span> para contrastar
          sus métricas empíricas y complejidad computacional.
        </p>
      </div>
    );
  }

  const { runA, runB, resumen, algoritmoMasRapido, razonVelocidad } = datos;

  // Cálculos para las barras gráficas comparativas
  const maxTiempo = Math.max(runA.duracionMs, runB.duracionMs, 1);
  const porcentajeTiempoA = Math.max(8, (runA.duracionMs / maxTiempo) * 100);
  const porcentajeTiempoB = Math.max(8, (runB.duracionMs / maxTiempo) * 100);

  const maxOperaciones = Math.max(runA.operaciones, runB.operaciones, 1);
  const porcentajeOpsA = Math.max(8, (runA.operaciones / maxOperaciones) * 100);
  const porcentajeOpsB = Math.max(8, (runB.operaciones / maxOperaciones) * 100);

  return (
    <div className="space-y-6">
      {/* Cabecera del Análisis */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded">
          Propósito Académico Central
        </span>
        <h2 className="text-xl font-bold mt-2">Comparativa y Análisis de Complejidad Computacional</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Medición rigurosa de tiempo, operaciones y calidad de solución obtenidas mediante ejecuciones reales
          con idénticas entradas y restricciones obligatorias.
        </p>
      </div>

      {/* Tabla Comparativa Formal Requerida */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Tabla Comparativa Experimental</h3>
          <span className="text-xs text-slate-400 font-mono">Snapshot idéntico</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Indicador</th>
              <th className="py-3 px-4 font-bold text-amber-900 bg-amber-50/50">Greedy (Voraz)</th>
              <th className="py-3 px-4 font-bold text-indigo-900 bg-indigo-50/50">Backtracking (Poda)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Tiempo de ejecución</td>
              <td className="py-3 px-4 font-mono font-bold text-amber-700">{runA.duracionMs} ms</td>
              <td className="py-3 px-4 font-mono font-bold text-indigo-700">{runB.duracionMs} ms</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Operaciones realizadas</td>
              <td className="py-3 px-4 font-mono font-bold">{runA.operaciones.toLocaleString()}</td>
              <td className="py-3 px-4 font-mono font-bold">{runB.operaciones.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Sesiones asignadas</td>
              <td className="py-3 px-4 font-bold text-emerald-600">
                {runA.sesionesAsignadas} / {totalSesiones}
              </td>
              <td className="py-3 px-4 font-bold text-emerald-600">
                {runB.sesionesAsignadas} / {totalSesiones}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Sesiones pendientes</td>
              <td className="py-3 px-4 font-bold text-amber-600">{runA.sesionesPendientes}</td>
              <td className="py-3 px-4 font-bold text-amber-600">{runB.sesionesPendientes}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Conflictos detectados</td>
              <td className="py-3 px-4 font-semibold text-slate-800">{runA.conflictos}</td>
              <td className="py-3 px-4 font-semibold text-slate-800">{runB.conflictos}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Nodos visitados</td>
              <td className="py-3 px-4 text-slate-400 italic">No aplica</td>
              <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                {runB.nodosVisitados.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-800">Retrocesos (Backtracks)</td>
              <td className="py-3 px-4 text-slate-400 italic">No aplica</td>
              <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                {runB.retrocesos.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráficos Comparativos Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico 1: Tiempo de Ejecución */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Tiempo de Ejecución (ms)</h4>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              {algoritmoMasRapido} es {razonVelocidad}x más rápido
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Greedy</span>
                <span className="font-mono font-bold text-amber-700">{runA.duracionMs} ms</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div
                  style={{ width: `${porcentajeTiempoA}%` }}
                  className="bg-amber-500 h-full rounded-lg transition-all flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                >
                  {runA.duracionMs} ms
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Backtracking</span>
                <span className="font-mono font-bold text-indigo-700">{runB.duracionMs} ms</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div
                  style={{ width: `${porcentajeTiempoB}%` }}
                  className="bg-indigo-600 h-full rounded-lg transition-all flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                >
                  {runB.duracionMs} ms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Operaciones Evaluadas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm">Operaciones Evaluadas</h4>
            <span className="text-xs text-slate-400">Verificaciones de conflicto</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Greedy</span>
                <span className="font-mono font-bold text-amber-700">{runA.operaciones.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div
                  style={{ width: `${porcentajeOpsA}%` }}
                  className="bg-amber-500 h-full rounded-lg transition-all flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                >
                  {runA.operaciones}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Backtracking</span>
                <span className="font-mono font-bold text-indigo-700">{runB.operaciones.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden">
                <div
                  style={{ width: `${porcentajeOpsB}%` }}
                  className="bg-indigo-600 h-full rounded-lg transition-all flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                >
                  {runB.operaciones}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complejidad Teórica e Interpretación Experimental */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ficha Teórica */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm border-b pb-2">Complejidad Teórica</h4>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="font-bold text-amber-950 block">Algoritmo Greedy</span>
              <p className="mt-1">
                <span className="font-semibold">Temporal:</span>{" "}
                <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-800">
                  O(N log N + NK)
                </code>
              </p>
              <p className="mt-1">
                <span className="font-semibold">Espacial:</span>{" "}
                <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-800">
                  O(NK)
                </code>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                N = número de sesiones, K = candidatos por sesión. Muy rápido pero no garantiza completitud ni optimalidad.
              </p>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="font-bold text-indigo-950 block">Algoritmo Backtracking</span>
              <p className="mt-1">
                <span className="font-semibold">Temporal:</span>{" "}
                <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-800">
                  O(K^N)
                </code>{" "}
                (peor caso)
              </p>
              <p className="mt-1">
                <span className="font-semibold">Espacial:</span>{" "}
                <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-800">
                  O(N)
                </code>{" "}
                (pila recursiva)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Búsqueda exhaustiva con poda. Garantiza hallar solución si existe o demostrar ausencia de solución.
              </p>
            </div>
          </div>
        </div>

        {/* Interpretación Experimental Real */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm border-b pb-2">Interpretación Experimental</h4>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-800">Eficiencia:</strong> {resumen.eficiencia}
            </p>
            <p>
              <strong className="text-slate-800">Completitud:</strong> {resumen.completitud}
            </p>
            <p>
              <strong className="text-slate-800">Factibilidad:</strong> {resumen.factibilidad}
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] mt-2">
              <strong className="block text-slate-800 mb-1">Conclusión Académica:</strong>
              En instancias con suficiente holgura, Greedy encuentra una solución factible en una fracción de tiempo.
              Sin embargo, en instancias altamente restringidas con cuello de botella en docentes o aulas,
              Backtracking demuestra su superioridad al explorar caminos alternativos mediante retroceso seguro.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
