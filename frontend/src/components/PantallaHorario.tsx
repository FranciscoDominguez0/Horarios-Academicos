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

  // Solo se computan pendientes si hay una ejecucion activa con sesiones asignadas
  const hayEjecucion = Boolean(infoActual && sesionesActuales.length > 0);
  const pendientes = hayEjecucion ? Math.max(0, totalSesionesRequeridas - sesionesActuales.length) : 0;
  const listaPendientes = (hayEjecucion && pendientes > 0 && Array.isArray(infoActual?.sesionesPendientesDetalle))
    ? infoActual.sesionesPendientesDetalle
    : [];

  // Filtrar sesiones del año seleccionado
  const anoObj = ANOS_ACADEMICOS.find((a) => a.clave === anoSeleccionado);
  const sesionesDelAno = sesionesActuales.filter((s) => {
    return (
      s.grupo.includes(anoSeleccionado) ||
      (anoObj && s.grupoCodigo === anoObj.codigo)
    );
  });

  // Filtrar sesiones pendientes exclusivas del año seleccionado (solo mostrar en el año del fallo)
  const pendientesDelAno = listaPendientes.filter((p: any) => {
    return (
      (p.grupo && p.grupo.includes(anoSeleccionado)) ||
      (anoObj && (p.grupoCodigo === anoObj.codigo || p.grupo?.includes(anoObj.nombre)))
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
        {/* Selector de Año Académico */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-800">Año Académico:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ANOS_ACADEMICOS.map((ano) => {
              const activo = anoSeleccionado === ano.clave;
              const cant = sesionesActuales.filter(
                (s) => s.grupo.includes(ano.clave) || s.grupoCodigo === ano.codigo
              ).length;
              const tieneFallo = listaPendientes.some(
                (p: any) => (p.grupo && p.grupo.includes(ano.clave)) || p.grupoCodigo === ano.codigo
              );

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
                      activo
                        ? tieneFallo ? "bg-amber-400 text-slate-950 font-bold" : "bg-white/20 text-white"
                        : tieneFallo ? "bg-amber-100 text-amber-900 font-bold border border-amber-200" : "bg-white text-slate-600"
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
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Ejecutar Planificación
              </h3>
              <button
                type="button"
                onClick={() => !cargando && setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selector de Algoritmo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Algoritmo
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "AMBOS", label: "Comparativa (Ambos)" },
                  { id: "BACKTRACKING", label: "Backtracking" },
                  { id: "GREEDY", label: "Greedy" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModo(opt.id as ModoEjecucion)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      modo === opt.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {modo === opt.id && <IconoCheck className="w-4 h-4 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Intervalo de Horarios */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Intervalo de Horarios
              </label>
              <select
                value={pasoCuadricula}
                onChange={(e) => setPasoCuadricula(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 text-xs font-medium outline-hidden"
              >
                <option value={60}>Cada 60 minutos</option>
                <option value={30}>Cada 30 minutos</option>
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
                      jornadaFinMinuto: 900,
                    });
                    if (modo === "BACKTRACKING") setAlgoritmoActivo("BACKTRACKING");
                    if (modo === "GREEDY") setAlgoritmoActivo("GREEDY");
                    setModalAbierto(false);
                  }
                }}
                className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f172a] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 text-xs flex items-center gap-2"
              >
                {cargando ? <span>Calculando...</span> : <span>Ejecutar</span>}
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
              {!hayEjecucion
                ? "Sin simulación activa. Esperando ejecución de algoritmo."
                : infoActual?.conflictos === 0
                ? "0 conflictos de docente, grupo o salón."
                : `${infoActual?.conflictos ?? 0} conflicto(s) detectados.`}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              !hayEjecucion
                ? "bg-slate-100 text-slate-500"
                : pendientes === 0
                ? "bg-indigo-50 text-indigo-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {!hayEjecucion ? (
              <IconoEjecucion className="w-4 h-4" />
            ) : pendientes === 0 ? (
              <IconoCheck className="w-4 h-4" />
            ) : (
              <IconoAlerta className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">Cobertura de Clases</span>
            <span className="text-slate-500 text-[11px]">
              {!hayEjecucion
                ? `Horario listo para planificar (${totalSesionesRequeridas} sesiones requeridas).`
                : pendientes === 0
                ? `100% asignado (${sesionesActuales.length} de ${totalSesionesRequeridas} sesiones).`
                : `${pendientes} ${pendientes === 1 ? "sesión pendiente" : "sesiones pendientes"} en Greedy.`}
            </span>
            {hayEjecucion && pendientesDelAno.length > 0 && (
              <span className="text-[11px] font-bold text-amber-700 block mt-0.5">
                Falta en {anoSeleccionado}: {pendientesDelAno.map((p: any) => p.asignatura).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aviso Sencillo de Sesión no Asignada (Sólo visible en el año del fallo) */}
      {hayEjecucion && pendientesDelAno.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <IconoAlerta className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {pendientesDelAno.length === 1
                    ? `1 sesión no asignada en ${anoSeleccionado}`
                    : `${pendientesDelAno.length} sesiones no asignadas en ${anoSeleccionado}`}
                </span>
                <span className="text-[11px] text-slate-500">
                  Greedy alcanzó un óptimo local por cuellos de botella con docentes compartidos.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-white text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Heurística Ávida
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pendientesDelAno.map((p: any, idx: number) => {
              const estilo = obtenerEstiloMateria(p.asignatura);
              return (
                <div
                  key={p.id || idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${estilo.dot}`} />
                      <span className="font-bold text-slate-900 truncate">{p.asignatura}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                      {p.codigoMateria}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-700 font-medium truncate">{p.docente}</span>
                    <span className="text-slate-500 font-mono text-[10px] shrink-0">
                      Sesión {p.numeroSesion ?? 2} ({p.duracionMinutos}m)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-500 text-[10px]">Resultado Greedy:</span>
                    <span className="font-semibold text-amber-700 text-[10px]">Sin espacio libre</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leyenda de Asignaturas del Año Activo (Mismos tonos pastel) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-800">
            Asignaturas de {anoSeleccionado} ({materiasDelAno.length})
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            5 materias por año académico
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
      <CalendarioSemanal
        sesiones={sesionesDelAno}
        jornadaInicioMinuto={480}
        jornadaFinMinuto={900}
      />
    </div>
  );
}
