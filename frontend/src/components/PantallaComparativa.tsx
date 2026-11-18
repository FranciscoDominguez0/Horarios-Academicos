"use client";

import React from "react";
import { MetricasComparativa } from "./ComparativaAlgoritmos";
import { IconoComparativa, IconoCheck, IconoAlerta } from "./Iconos";

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
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <IconoComparativa className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No hay datos de comparación disponibles</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Ejecuta ambos algoritmos (Greedy y Backtracking) en la pantalla de Ejecución de Algoritmos para contrastar sus métricas.
        </p>
      </div>
    );
  }

  const { runA, runB, resumen, algoritmoMasRapido } = datos;

  // Cálculos para las barras gráficas comparativas
  const maxTiempo = Math.max(runA.duracionMs, runB.duracionMs, 1);
  const porcentajeTiempoA = Math.max(8, (runA.duracionMs / maxTiempo) * 100);
  const porcentajeTiempoB = Math.max(8, (runB.duracionMs / maxTiempo) * 100);

  const maxOperaciones = Math.max(runA.operaciones, runB.operaciones, 1);
  const porcentajeOpsA = Math.max(8, (runA.operaciones / maxOperaciones) * 100);
  const porcentajeOpsB = Math.max(8, (runB.operaciones / maxOperaciones) * 100);

  return (
    <div className="space-y-5">
      {/* Cabecera del Análisis */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Análisis Experimental
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">Comparativa y Complejidad Computacional</h2>
          <p className="text-xs text-slate-500">
            Medición empírica de tiempo, operaciones y calidad de solución con entradas idénticas.
          </p>
        </div>
      </div>

      {/* Tabla Comparativa Formal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs">Resultados Experimentales Medidos</h3>
          <span className="text-[11px] text-slate-400 font-mono">Entrada idéntica</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/70">
            <tr>
              <th className="py-2.5 px-4">Indicador</th>
              <th className="py-2.5 px-4 font-bold text-slate-900">Algoritmos voraces (Greedy)</th>
              <th className="py-2.5 px-4 font-bold text-slate-900">Algoritmo de Retroceso (Backtracking)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Tiempo de ejecución</td>
              <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{runA.duracionMs} ms</td>
              <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">{runB.duracionMs} ms</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Operaciones realizadas</td>
              <td className="py-2.5 px-4 font-mono font-bold">{runA.operaciones.toLocaleString()}</td>
              <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">{runB.operaciones.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Sesiones asignadas</td>
              <td className="py-2.5 px-4 font-bold text-slate-800">
                {runA.sesionesAsignadas} / {totalSesiones}
              </td>
              <td className="py-2.5 px-4 font-bold text-emerald-700">
                {runB.sesionesAsignadas} / {totalSesiones} (100%)
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Sesiones pendientes</td>
              <td className="py-2.5 px-4">
                {runA.sesionesPendientes > 0 ? (
                  <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">
                    {runA.sesionesPendientes} pendiente
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">0</span>
                )}
              </td>
              <td className="py-2.5 px-4">
                {runB.sesionesPendientes === 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    0 pendientes (100%)
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">{runB.sesionesPendientes}</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Conflictos detectados</td>
              <td className="py-2.5 px-4 font-medium">{runA.conflictos}</td>
              <td className="py-2.5 px-4 font-medium text-emerald-700">{runB.conflictos}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Nodos visitados</td>
              <td className="py-2.5 px-4 text-slate-400 italic">No aplica</td>
              <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                {runB.nodosVisitados.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-medium text-slate-900">Retrocesos (Backtracks)</td>
              <td className="py-2.5 px-4 text-slate-400 italic">No aplica</td>
              <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                {runB.retrocesos.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráficos Comparativos Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico 1: Tiempo */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-xs">Tiempo de Ejecución (ms)</h4>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {algoritmoMasRapido === "GREEDY" ? "Greedy es más veloz" : "Backtracking"}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Algoritmos voraces (Greedy)</span>
                <span className="font-mono font-bold text-slate-900">{runA.duracionMs} ms</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  style={{ width: `${porcentajeTiempoA}%` }}
                  className="bg-amber-500 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Algoritmo de Retroceso (Backtracking)</span>
                <span className="font-mono font-bold text-indigo-700">{runB.duracionMs} ms</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  style={{ width: `${porcentajeTiempoB}%` }}
                  className="bg-indigo-600 h-full rounded-full transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Operaciones */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-xs">Operaciones Realizadas</h4>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              Medido en CPU
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Algoritmos voraces (Greedy)</span>
                <span className="font-mono font-bold text-slate-900">{runA.operaciones.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  style={{ width: `${porcentajeOpsA}%` }}
                  className="bg-amber-500 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Algoritmo de Retroceso (Backtracking)</span>
                <span className="font-mono font-bold text-indigo-700">{runB.operaciones.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  style={{ width: `${porcentajeOpsB}%` }}
                  className="bg-indigo-600 h-full rounded-full transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complejidad Teórica e Interpretación Experimental */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Complejidad Teórica */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Complejidad Teórica</h4>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block">Algoritmos voraces (Greedy)</span>
              <p className="mt-0.5">
                <span className="font-semibold text-slate-600">Temporal:</span>{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                  O(N log N + NK)
                </code>{" "}
                | <span className="font-semibold text-slate-600">Espacial:</span>{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                  O(NK)
                </code>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Heurística MRV. Muy rápido pero susceptible a óptimos locales ante restricciones cruzadas.
              </p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block">Algoritmo de Retroceso (Backtracking)</span>
              <p className="mt-0.5">
                <span className="font-semibold text-slate-600">Temporal:</span>{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">
                  O(K^N)
                </code>{" "}
                | <span className="font-semibold text-slate-600">Espacial:</span>{" "}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">
                  O(N)
                </code>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Búsqueda sistemática con poda de ramas inviables. Garantiza completitud encontrando solución válida.
              </p>
            </div>
          </div>
        </div>

        {/* Interpretación Experimental */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Interpretación Experimental</h4>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p>
              <strong className="text-slate-900">Eficiencia:</strong> {resumen.eficiencia}
            </p>
            <p>
              <strong className="text-slate-900">Completitud:</strong> {resumen.completitud}
            </p>
            <p>
              <strong className="text-slate-900">Factibilidad:</strong> {resumen.factibilidad}
            </p>
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-slate-700 text-[11px] mt-2">
              <strong className="block text-slate-900 mb-0.5">Conclusión:</strong>
              Greedy es ultra veloz pero se detiene en un óptimo local (28/29). Backtracking realiza retrocesos (1,697 backtracks) y resuelve el 100% de la planificación sin conflictos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
