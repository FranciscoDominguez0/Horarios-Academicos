"use client";

import React, { useState } from "react";
import CalendarioSemanal, { SesionCalendario, obtenerColorMateria } from "./CalendarioSemanal";

interface PropiedadesHorario {
  sesionesGreedy: SesionCalendario[];
  sesionesBacktracking: SesionCalendario[];
  infoGreedy: any | null;
  infoBacktracking: any | null;
  totalSesionesRequeridas: number;
}

const ANOS_ACADEMICOS = [
  { clave: "1° Año", codigo: "1ANO", nombre: "1° Año (Ingeniería en Informática)" },
  { clave: "2° Año", codigo: "2ANO", nombre: "2° Año (Ingeniería en Informática)" },
  { clave: "3° Año", codigo: "3ANO", nombre: "3° Año (Ingeniería en Informática)" },
];

export default function PantallaHorario({
  sesionesGreedy,
  sesionesBacktracking,
  infoGreedy,
  infoBacktracking,
  totalSesionesRequeridas,
}: PropiedadesHorario) {
  const [algoritmoActivo, setAlgoritmoActivo] = useState<"GREEDY" | "BACKTRACKING">("GREEDY");
  const [anoSeleccionado, setAnoSeleccionado] = useState<string>("1° Año");

  const sesionesActuales = algoritmoActivo === "GREEDY" ? sesionesGreedy : sesionesBacktracking;
  const infoActual = algoritmoActivo === "GREEDY" ? infoGreedy : infoBacktracking;

  const pendientes = totalSesionesRequeridas - sesionesActuales.length;

  // Filtrar sesiones estrictamente por el Año seleccionado
  const sesionesDelAno = sesionesActuales.filter((s) => {
    const anoObj = ANOS_ACADEMICOS.find((a) => a.clave === anoSeleccionado);
    return (
      s.grupo.includes(anoSeleccionado) ||
      (anoObj && s.grupoCodigo === anoObj.codigo)
    );
  });

  // Catálogo de asignaturas exclusivas del año seleccionado
  const materiasDelAno = Array.from(
    new Map(
      sesionesDelAno.map((s) => [
        s.asignatura,
        {
          asignatura: s.asignatura,
          docente: s.docente,
          salon: s.salon || "Salón 101",
          totalSesiones: sesionesDelAno.filter((x) => x.asignatura === s.asignatura).length,
        },
      ])
    ).values()
  ).sort((a, b) => a.asignatura.localeCompare(b.asignatura));

  return (
    <div className="space-y-6">
      {/* Selector de Horario: Greedy vs Backtracking */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Resultado: Horario Semanal Generado</h2>
          <p className="text-xs text-slate-500">
            Alterna entre las soluciones generadas por Algoritmos voraces (Greedy) y el Algoritmo de Retroceso (Backtracking)
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAlgoritmoActivo("GREEDY")}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              algoritmoActivo === "GREEDY"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Horario: Algoritmos voraces (Greedy) ({sesionesGreedy.length}/{totalSesionesRequeridas})
          </button>
          <button
            onClick={() => setAlgoritmoActivo("BACKTRACKING")}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              algoritmoActivo === "BACKTRACKING"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Horario: Backtracking ({sesionesBacktracking.length}/{totalSesionesRequeridas})
          </button>
        </div>
      </div>

      {/* Alertas de Validación y Sesiones Pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            ✓
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Validador Independiente</span>
            <p className="text-slate-600 mt-0.5">
              {infoActual && infoActual.conflictos === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  0 conflictos detectados. Sin solapamientos de docente, de grupo ni de salón.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {infoActual?.conflictos ?? 0} conflictos duros detectados.
                </span>
              )}
            </p>
          </div>
        </div>

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
            <span className="font-bold text-slate-800 block">Cobertura Institucional</span>
            <p className="text-slate-600 mt-0.5">
              {pendientes === 0 ? (
                <span className="text-indigo-700 font-semibold">
                  100% de las sesiones académicas ubicadas exitosamente ({sesionesActuales.length} de {totalSesionesRequeridas}).
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {pendientes} sesión(es) pendientes por decisiones locales irrevocables en Greedy.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Selección de Año Académico */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 text-sm">Selecciona el Año Académico:</span>
            <p className="text-xs text-slate-500">
              Visualiza el horario semanal y la distribución de materias y salones de cada año.
            </p>
          </div>

          <div className="flex gap-2">
            {ANOS_ACADEMICOS.map((ano) => {
              const estaActivo = anoSeleccionado === ano.clave;
              const cantidad = sesionesActuales.filter(
                (s) => s.grupo.includes(ano.clave) || s.grupoCodigo === ano.codigo
              ).length;

              return (
                <button
                  key={ano.clave}
                  onClick={() => setAnoSeleccionado(ano.clave)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                    estaActivo
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-400"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>🎓</span>
                  <span>{ano.clave}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      estaActivo ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {cantidad} clases
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda de Asignaturas Exclusiva del Año Seleccionado */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Materias de {anoSeleccionado}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {materiasDelAno.map((item) => {
              const colorClase = obtenerColorMateria(item.asignatura);
              const colorBg = colorClase.split(" ")[0];

              return (
                <div
                  key={item.asignatura}
                  className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-3 h-3 rounded-md mt-0.5 flex-shrink-0 ${colorBg}`} />
                    <span className="font-bold text-slate-800 leading-tight text-[11px]">
                      {item.asignatura}
                    </span>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">👨‍🏫 {item.docente}</span>
                    <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                      📍 {item.salon}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calendario Semanal del Año Seleccionado */}
      <CalendarioSemanal sesiones={sesionesDelAno} />
    </div>
  );
}
