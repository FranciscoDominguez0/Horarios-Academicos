"use client";

import React from "react";

export interface MetricasComparativa {
  runA: {
    algoritmo: string;
    duracionMs: number;
    operaciones: number;
    memoriaMb: number;
    nodosVisitados: number;
    retrocesos: number;
    sesionesAsignadas: number;
    sesionesPendientes: number;
    sesionesPendientesDetalle?: any[];
    conflictos: number;
  };
  runB: {
    algoritmo: string;
    duracionMs: number;
    operaciones: number;
    memoriaMb: number;
    nodosVisitados: number;
    retrocesos: number;
    sesionesAsignadas: number;
    sesionesPendientes: number;
    sesionesPendientesDetalle?: any[];
    conflictos: number;
  };
  algoritmoMasRapido: string;
  razonVelocidad: number;
  resumen: {
    eficiencia: string;
    completitud: string;
    factibilidad: string;
  };
}

interface PropiedadesComparativa {
  datos: MetricasComparativa | null;
}

export default function ComparativaAlgoritmos({ datos }: PropiedadesComparativa) {
  if (!datos) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
        Ejecuta ambos algoritmos para visualizar la comparativa de complejidad y rendimiento.
      </div>
    );
  }

  const { runA, runB, resumen } = datos;

  const formatearNombre = (alg: string) => {
    if (alg === "GREEDY") return "Algoritmos voraces (Greedy)";
    if (alg === "BACKTRACKING") return "Algoritmo de Retroceso (Backtracking)";
    return alg;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold mb-2">Análisis Comparativo Experimental</h3>
        <p className="text-indigo-200 text-sm">{resumen.eficiencia}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <p className="text-slate-400">Completitud:</p>
            <p className="text-slate-100 font-medium">{resumen.completitud}</p>
          </div>
          <div>
            <p className="text-slate-400">Factibilidad:</p>
            <p className="text-slate-100 font-medium">{resumen.factibilidad}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tarjeta Algoritmo A */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-lg">{formatearNombre(runA.algoritmo)}</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md">
              Heurístico Voraz
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiempo de ejecución:</span>
              <span className="font-mono font-bold text-slate-800">{runA.duracionMs} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Operaciones evaluadas:</span>
              <span className="font-mono text-slate-700">{runA.operaciones.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sesiones asignadas:</span>
              <span className="font-semibold text-emerald-600">{runA.sesionesAsignadas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sesiones pendientes:</span>
              <span className="font-semibold text-amber-600">{runA.sesionesPendientes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Conflictos duros:</span>
              <span className="font-semibold text-slate-700">{runA.conflictos}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Algoritmo B */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-lg">{formatearNombre(runB.algoritmo)}</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
              Búsqueda Exhaustiva
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiempo de ejecución:</span>
              <span className="font-mono font-bold text-slate-800">{runB.duracionMs} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nodos visitados:</span>
              <span className="font-mono text-slate-700">{runB.nodosVisitados.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Retrocesos (Backtracks):</span>
              <span className="font-mono text-slate-700">{runB.retrocesos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sesiones asignadas:</span>
              <span className="font-semibold text-emerald-600">{runB.sesionesAsignadas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Conflictos duros:</span>
              <span className="font-semibold text-slate-700">{runB.conflictos}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
