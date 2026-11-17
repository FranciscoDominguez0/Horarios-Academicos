"use client";

import React, { useState } from "react";
import CalendarioSemanal, { SesionCalendario } from "./CalendarioSemanal";

interface PropiedadesHorario {
  sesionesGreedy: SesionCalendario[];
  sesionesBacktracking: SesionCalendario[];
  infoGreedy: any | null;
  infoBacktracking: any | null;
  totalSesionesRequeridas: number;
}

export default function PantallaHorario({
  sesionesGreedy,
  sesionesBacktracking,
  infoGreedy,
  infoBacktracking,
  totalSesionesRequeridas,
}: PropiedadesHorario) {
  const [algoritmoActivo, setAlgoritmoActivo] = useState<"GREEDY" | "BACKTRACKING">("GREEDY");

  const sesionesActuales = algoritmoActivo === "GREEDY" ? sesionesGreedy : sesionesBacktracking;
  const infoActual = algoritmoActivo === "GREEDY" ? infoGreedy : infoBacktracking;

  const pendientes = totalSesionesRequeridas - sesionesActuales.length;

  return (
    <div className="space-y-6">
      {/* Selector de Horario: Greedy vs Backtracking */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Resultado: Horario Semanal Generado</h2>
          <p className="text-xs text-slate-500">Alterna entre los horarios generados por cada algoritmo</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAlgoritmoActivo("GREEDY")}
            className={`py-2 px-5 rounded-lg text-xs font-bold transition-all ${
              algoritmoActivo === "GREEDY"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Horario Greedy ({sesionesGreedy.length} asignadas)
          </button>
          <button
            onClick={() => setAlgoritmoActivo("BACKTRACKING")}
            className={`py-2 px-5 rounded-lg text-xs font-bold transition-all ${
              algoritmoActivo === "BACKTRACKING"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Horario Backtracking ({sesionesBacktracking.length} asignadas)
          </button>
        </div>
      </div>

      {/* Alertas de Validación y Sesiones Pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Validación de Restricciones Duras */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            ✓
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Validador Independiente</span>
            <p className="text-slate-600 mt-0.5">
              {infoActual && infoActual.conflictos === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  0 conflictos detectados. Sin cruces de docente, sin cruces de grupo y dentro de disponibilidad.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {infoActual?.conflictos ?? 0} conflictos duros detectados.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sesiones Pendientes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 text-xs">
          <div
            className={`p-2 rounded-lg font-bold ${
              pendientes === 0
                ? "bg-indigo-100 text-indigo-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {pendientes === 0 ? "★" : "!"}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Cobertura de Sesiones</span>
            <p className="text-slate-600 mt-0.5">
              {pendientes === 0 ? (
                <span className="text-indigo-700 font-semibold">
                  100% de las sesiones semanales asignadas exitosamente ({sesionesActuales.length} de {totalSesionesRequeridas}).
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {pendientes} sesión(es) quedaron pendientes de ubicación por falta de espacio o disponibilidad.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Calendario Semanal */}
      <CalendarioSemanal sesiones={sesionesActuales} />
    </div>
  );
}
