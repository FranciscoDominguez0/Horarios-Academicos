"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CalendarioSemanal, { SesionCalendario, obtenerEstiloMateria } from "./CalendarioSemanal";
import {
  IconoCheck,
  IconoAlerta,
  IconoEstudiante,
  IconoProfesor,
  IconoUbicacion,
  IconoEjecucion,
} from "./Iconos";

export type ModoEjecucion = "GREEDY" | "BACKTRACKING" | "AMBOS";

interface PropiedadesHorario {
  sesionesGreedy: SesionCalendario[];
  sesionesBacktracking: SesionCalendario[];
  infoGreedy: any | null;
  infoBacktracking: any | null;
  totalSesionesRequeridas: number;
  alEjecutar?: (
    modo: ModoEjecucion,
    configuracion: {
      pasoCuadriculaMinutos: number;
      jornadaInicioMinuto: number;
      jornadaFinMinuto: number;
    }
  ) => Promise<void>;
  cargando?: boolean;
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
  alEjecutar,
  cargando = false,
}: PropiedadesHorario) {
  const [algoritmoActivo, setAlgoritmoActivo] = useState<"GREEDY" | "BACKTRACKING">("GREEDY");
  const [anoSeleccionado, setAnoSeleccionado] = useState<string>("1° Año");

  // Estado del Modal de Ejecución
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modo, setModo] = useState<ModoEjecucion>("AMBOS");
  const [pasoCuadricula, setPasoCuadricula] = useState<number>(60);
  const [montado, setMontado] = useState<boolean>(false);

  useEffect(() => {
    setMontado(true);
  }, []);

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
      {/* Barra de Filtros por Año, Conmutador y Botón Modal estilo SaaS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Selector de Cohorte */}
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

        {/* Grupo de Controles: Conmutador y Botón Modal */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Conmutador de Algoritmo */}
          <div className="flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setAlgoritmoActivo("GREEDY")}
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all ${
                algoritmoActivo === "GREEDY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Greedy ({sesionesGreedy.length}/{totalSesionesRequeridas})
            </button>
            <button
              onClick={() => setAlgoritmoActivo("BACKTRACKING")}
              className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all ${
                algoritmoActivo === "BACKTRACKING"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Backtracking ({sesionesBacktracking.length}/{totalSesionesRequeridas})
            </button>
          </div>

          {/* Botón para Abrir Modal de Ejecución */}
          {alEjecutar && (
            <button
              onClick={() => setModalAbierto(true)}
              className="py-2 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
            >
              <IconoEjecucion className="w-3.5 h-3.5" />
              <span>Ejecutar Algoritmos</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Sencillo de Ejecución de Algoritmos montado con createPortal en document.body */}
      {montado && modalAbierto && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Ejecutar Planificación
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configura y corre los motores de asignación
                </p>
              </div>
              <button
                onClick={() => !cargando && setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 leading-none transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selector de Estrategia */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Estrategia Algorítmica:
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setModo("AMBOS")}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    modo === "AMBOS"
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Ejecutar Ambos (Comparativa)</span>
                    <span className={`text-[11px] ${modo === "AMBOS" ? "text-slate-300" : "text-slate-400"}`}>
                      Calcula Greedy y Backtracking para contrastar
                    </span>
                  </div>
                  {modo === "AMBOS" && <IconoCheck className="w-4 h-4 text-white shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModo("BACKTRACKING")}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    modo === "BACKTRACKING"
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Algoritmo de Retroceso (Backtracking)</span>
                    <span className={`text-[11px] ${modo === "BACKTRACKING" ? "text-slate-300" : "text-slate-400"}`}>
                      Búsqueda con poda. Garantiza 100% de cobertura sin choques
                    </span>
                  </div>
                  {modo === "BACKTRACKING" && <IconoCheck className="w-4 h-4 text-white shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModo("GREEDY")}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    modo === "GREEDY"
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="font-semibold block">Algoritmo Voraz (Greedy)</span>
                    <span className={`text-[11px] ${modo === "GREEDY" ? "text-slate-300" : "text-slate-400"}`}>
                      Decisión local rápida mediante heurística MRV
                    </span>
                  </div>
                  {modo === "GREEDY" && <IconoCheck className="w-4 h-4 text-white shrink-0" />}
                </button>
              </div>
            </div>

            {/* Selector de Intervalo de Horarios */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Intervalo de Horarios:
              </label>
              <select
                value={pasoCuadricula}
                onChange={(e) => setPasoCuadricula(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 text-xs font-medium outline-hidden"
              >
                <option value={60}>Cada 60 minutos (Recomendado · Clases de 2h y 3h)</option>
                <option value={30}>Cada 30 minutos (Granular · Mayor espacio de búsqueda)</option>
              </select>
            </div>

            {/* Botones de Acción estilo Imagen 2 */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                disabled={cargando}
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border border-slate-300 transition-all text-xs shadow-2xs disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={async () => {
                  if (alEjecutar) {
                    await alEjecutar(modo, {
                      pasoCuadriculaMinutos: pasoCuadricula,
                      jornadaInicioMinuto: 480,
                      jornadaFinMinuto: 1080,
                    });
                    if (modo === "BACKTRACKING") setAlgoritmoActivo("BACKTRACKING");
                    if (modo === "GREEDY") setAlgoritmoActivo("GREEDY");
                    setModalAbierto(false);
                  }
                }}
                className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f172a] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 text-xs flex items-center gap-2"
              >
                {cargando ? (
                  <span>Calculando...</span>
                ) : (
                  <span>Iniciar Planificación</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
          <span className="text-[11px] text-slate-400 font-medium">
            5 materias por cohorte
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
