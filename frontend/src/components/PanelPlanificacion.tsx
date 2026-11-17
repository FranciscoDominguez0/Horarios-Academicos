"use client";

import React, { useState } from "react";

interface PropiedadesPanel {
  periodoId: number | null;
  alEjecutar: (algoritmo: "GREEDY" | "BACKTRACKING") => Promise<void>;
  cargando: boolean;
}

export default function PanelPlanificacion({
  periodoId,
  alEjecutar,
  cargando,
}: PropiedadesPanel) {
  const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState<
    "GREEDY" | "BACKTRACKING"
  >("GREEDY");

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Panel de Generación de Horarios</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Período lectivo activo: <span className="font-semibold text-slate-700">{periodoId ? `#${periodoId}` : "Cargando..."}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setAlgoritmoSeleccionado("GREEDY")}
          className={`flex-1 py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
            algoritmoSeleccionado === "GREEDY"
              ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm"
              : "border-slate-200 hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="font-bold">Greedy (Voraz)</div>
          <div className="text-xs opacity-75 mt-0.5">Rápido · Heurística local (MRV)</div>
        </button>

        <button
          type="button"
          onClick={() => setAlgoritmoSeleccionado("BACKTRACKING")}
          className={`flex-1 py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
            algoritmoSeleccionado === "BACKTRACKING"
              ? "border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm"
              : "border-slate-200 hover:bg-slate-50 text-slate-600"
          }`}
        >
          <div className="font-bold">Backtracking</div>
          <div className="text-xs opacity-75 mt-0.5">Exhaustivo · Poda y retroceso</div>
        </button>
      </div>

      <button
        type="button"
        disabled={cargando}
        onClick={() => alEjecutar(algoritmoSeleccionado)}
        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
      >
        {cargando ? "Generando horario..." : `Ejecutar con ${algoritmoSeleccionado}`}
      </button>
    </div>
  );
}
