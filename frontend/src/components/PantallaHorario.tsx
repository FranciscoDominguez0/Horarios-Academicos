"use client";

import React, { useState } from "react";
import CalendarioSemanal, { SesionCalendario, obtenerEstiloMateria } from "./CalendarioSemanal";
import { IconoCheck, IconoAlerta, IconoEstudiante, IconoProfesor, IconoUbicacion } from "./Iconos";

interface PropiedadesHorario {
  sesionesGreedy: SesionCalendario[];
  sesionesBacktracking: SesionCalendario[];
  infoGreedy: any | null;
  infoBacktracking: any | null;
  totalSesionesRequeridas: number;
}

const ANOS_ACADEMICOS = [
  { clave: "1° Año", codigo: "1ANO", nombre: "1° Año" },
  { clave: "2° Año", codigo: "2ANO", nombre: "2° Año" },
  { clave: "3° Año", codigo: "3ANO", nombre: "3° Año" },
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

  // Filtrar sesiones del año seleccionado
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
    <div className="space-y-5">
      {/* Barra de Filtros por Año y Algoritmo estilo Exam Calendar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Selector de Año Académico estilo < [1° Año] [2° Año] [3° Año] > */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-800">Cohorte:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ANOS_ACADEMICOS.map((ano) => {
              const activo = anoSeleccionado === ano.clave;
              const cant = sesionesActuales.filter(
                (s) => s.grupo.includes(ano.clave) || s.grupoCodigo === ano.codigo
              ).length;

              return (
                <button
                  key={ano.clave}
                  onClick={() => setAnoSeleccionado(ano.clave)}
                  className={`py-1.5 px-4 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                    activo
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <IconoEstudiante className="w-3.5 h-3.5" />
                  <span>{ano.nombre}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activo ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {cant}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conmutador de Algoritmo con Pastillas Redondeadas */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setAlgoritmoActivo("GREEDY")}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${
                algoritmoActivo === "GREEDY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Algoritmos voraces (Greedy) ({sesionesGreedy.length}/{totalSesionesRequeridas})
            </button>
            <button
              onClick={() => setAlgoritmoActivo("BACKTRACKING")}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${
                algoritmoActivo === "BACKTRACKING"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Backtracking ({sesionesBacktracking.length}/{totalSesionesRequeridas})
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de Estado Conciso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconoCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">Restricciones Validadas</span>
            <span className="text-slate-500 text-[11px]">
              {infoActual?.conflictos === 0
                ? "0 conflictos de docente, grupo o salón."
                : `${infoActual?.conflictos ?? 0} conflicto(s) detectados.`}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              pendientes === 0 ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {pendientes === 0 ? (
              <IconoCheck className="w-4 h-4" />
            ) : (
              <IconoAlerta className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">Cobertura de Clases</span>
            <span className="text-slate-500 text-[11px]">
              {pendientes === 0
                ? `100% asignado (${sesionesActuales.length} de ${totalSesionesRequeridas} sesiones).`
                : `${pendientes} sesión pendiente por óptimo local de Greedy.`}
            </span>
          </div>
        </div>
      </div>

      {/* Leyenda de Asignaturas del Año Activo (Mismos tonos pastel) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-800">
            Asignaturas de {anoSeleccionado} ({materiasDelAno.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Distribución en Salones 101, 102 y 103
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {materiasDelAno.map((item) => {
            const estilo = obtenerEstiloMateria(item.asignatura);

            return (
              <div
                key={item.asignatura}
                className={`p-3 rounded-2xl border ${estilo.bg} ${estilo.border} flex flex-col justify-between`}
              >
                <div className="flex items-start gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${estilo.dot}`} />
                  <span className="font-semibold text-slate-900 leading-snug line-clamp-2">
                    {item.asignatura}
                  </span>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 truncate max-w-[65%]">
                    <IconoProfesor className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{item.docente.split(" (")[0]}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-700 font-semibold bg-white/95 px-2 py-0.5 rounded-full border border-white/80 shadow-2xs">
                    <IconoUbicacion className="w-2.5 h-2.5 text-slate-400" />
                    <span>{item.salon}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendario Semanal */}
      <CalendarioSemanal sesiones={sesionesDelAno} />
    </div>
  );
}
