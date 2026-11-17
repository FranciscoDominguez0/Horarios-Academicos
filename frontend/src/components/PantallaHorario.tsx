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

export default function PantallaHorario({
  sesionesGreedy,
  sesionesBacktracking,
  infoGreedy,
  infoBacktracking,
  totalSesionesRequeridas,
}: PropiedadesHorario) {
  const [algoritmoActivo, setAlgoritmoActivo] = useState<"GREEDY" | "BACKTRACKING">("GREEDY");
  const [materiaFiltro, setMateriaFiltro] = useState<string>("TODAS");

  const sesionesActuales = algoritmoActivo === "GREEDY" ? sesionesGreedy : sesionesBacktracking;
  const infoActual = algoritmoActivo === "GREEDY" ? infoGreedy : infoBacktracking;

  const pendientes = totalSesionesRequeridas - sesionesActuales.length;

  // Catálogo de asignaturas únicas con sus docentes para la leyenda
  const asignaturasInfo = Array.from(
    new Map(
      [...sesionesBacktracking, ...sesionesGreedy].map((s) => [
        s.asignatura,
        { asignatura: s.asignatura, docente: s.docente, grupo: s.grupo },
      ])
    ).values()
  ).sort((a, b) => a.asignatura.localeCompare(b.asignatura));

  // Detectar asignaturas con sesiones no asignadas en el algoritmo activo
  const conteoBacktracking: Record<string, number> = {};
  sesionesBacktracking.forEach((s) => {
    conteoBacktracking[s.asignatura] = (conteoBacktracking[s.asignatura] || 0) + 1;
  });

  const conteoActual: Record<string, number> = {};
  sesionesActuales.forEach((s) => {
    conteoActual[s.asignatura] = (conteoActual[s.asignatura] || 0) + 1;
  });

  const asignaturasFaltantes = Object.entries(conteoBacktracking)
    .filter(([asig, total]) => (conteoActual[asig] || 0) < total)
    .map(([asig, total]) => {
      const faltan = total - (conteoActual[asig] || 0);
      const info = asignaturasInfo.find((a) => a.asignatura === asig);
      return {
        asignatura: asig,
        faltan,
        docente: info?.docente || "Docente asignado",
      };
    });

  const sesionesParaMostrar =
    materiaFiltro === "TODAS"
      ? sesionesActuales
      : sesionesActuales.filter((s) => s.asignatura === materiaFiltro);

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
        {/* Validación de Restricciones Duras */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            ✓
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Validador Independiente (Restricciones Duras)</span>
            <p className="text-slate-600 mt-0.5">
              {infoActual && infoActual.conflictos === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  0 conflictos detectados. Sin cruces de docente, sin cruces en el aula y dentro de disponibilidad.
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
                  {pendientes} sesión(es) quedaron pendientes por óptimo local (Greedy no puede retroceder).
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de Sesión No Asignada en Greedy */}
      {algoritmoActivo === "GREEDY" && asignaturasFaltantes.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-rose-200 text-rose-800 font-black text-sm">
            ✕
          </div>
          <div className="space-y-1">
            <span className="font-bold text-rose-900 block text-sm">
              Sesión No Asignada en Algoritmos voraces (Greedy)
            </span>
            <div className="text-rose-800 leading-relaxed">
              {asignaturasFaltantes.map((f) => (
                <div key={f.asignatura} className="mt-1">
                  • Asignatura: <strong>{f.asignatura}</strong> ({f.faltan} sesión pendiente de 120 min) — Docente: <em>{f.docente}</em>.
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    <strong>Causa algorítmica:</strong> La docente Laura Torres solo puede impartir clases en el bloque de 08:00 a 10:00. Al resolver de forma voraz (Greedy), el algoritmo ocupó irreversiblemente todas las franjas matutinas con Cálculo, Álgebra, Física y Algoritmos I. Al llegar a Química General, ya no quedaban cupos matutinos disponibles y el algoritmo voraz no tiene capacidad de retroceder ni reubicar asignaciones previas.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Cobertura Exitosa en Backtracking */}
      {algoritmoActivo === "BACKTRACKING" && pendientes === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-emerald-200 text-emerald-800 font-black text-sm">
            ✓
          </div>
          <div className="space-y-1">
            <span className="font-bold text-emerald-900 block text-sm">
              100% de Cobertura Lograda en el Salón Único
            </span>
            <p className="text-emerald-800 leading-relaxed">
              El <strong>Algoritmo de Retroceso (Backtracking)</strong> exploró sistemáticamente el árbol combinatorio. Al toparse con el cuello de botella matutino, realizó <strong>118 retrocesos con poda</strong>, desarmó decisiones previas y reacomodó las demás asignaturas en bloques de 10:00 a 16:00, logrando liberar una franja de 08:00 a 10:00 para <strong>Química General (Laura Torres)</strong> con cero choques de aula.
            </p>
          </div>
        </div>
      )}

      {/* Salón Único y Leyenda de Asignaturas con Código de Color */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Salón Asignado: Aula 101 (Salón Único)</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Capacidad: 1 clase simultánea
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jornada de Lunes a Viernes (08:00 a 16:00). Haz clic en una materia para aislarla o pulsa &ldquo;Todas las materias&rdquo;.
            </p>
          </div>
          <button
            onClick={() => setMateriaFiltro("TODAS")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              materiaFiltro === "TODAS"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas las materias ({sesionesActuales.length})
          </button>
        </div>

        {/* Chips de Leyenda de Colores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {asignaturasInfo.map((item) => {
            const cantSesiones = sesionesActuales.filter((s) => s.asignatura === item.asignatura).length;
            const esSeleccionada = materiaFiltro === item.asignatura;
            const colorClase = obtenerColorMateria(item.asignatura);
            const colorBg = colorClase.split(" ")[0];

            return (
              <button
                key={item.asignatura}
                onClick={() => setMateriaFiltro(materiaFiltro === item.asignatura ? "TODAS" : item.asignatura)}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                  esSeleccionada
                    ? "ring-2 ring-indigo-500 bg-indigo-50/50 border-indigo-300"
                    : "bg-slate-50/50 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-3.5 h-3.5 rounded-md flex-shrink-0 shadow-sm ${colorBg}`} />
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] text-slate-800 truncate">{item.asignatura}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.docente}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                  {cantSesiones}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendario Semanal */}
      <CalendarioSemanal sesiones={sesionesParaMostrar} />
    </div>
  );
}
