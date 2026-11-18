"use client";

import React, { useEffect, useState } from "react";
import PantallaDashboard from "../components/PantallaDashboard";
import PantallaDatosEntrada, { AsignacionDetalle, DocenteDetalle, ItemSimple } from "../components/PantallaDatosEntrada";
import PantallaEjecucion, { ModoEjecucion } from "../components/PantallaEjecucion";
import PantallaHorario from "../components/PantallaHorario";
import PantallaComparativa from "../components/PantallaComparativa";
import { SesionCalendario } from "../components/CalendarioSemanal";
import { MetricasComparativa } from "../components/ComparativaAlgoritmos";
import {
  IconoDashboard,
  IconoDatosEntrada,
  IconoEjecucion,
  IconoCalendario,
  IconoComparativa,
} from "../components/Iconos";

type PantallaActiva = "dashboard" | "entrada" | "ejecucion" | "horario" | "comparativa";

export default function PaginaPrincipal() {
  const [pantallaActiva, setPantallaActiva] = useState<PantallaActiva>("dashboard");

  // Estado del período y datos de entrada
  const [periodo, setPeriodo] = useState<{ id: number; name: string; status: string } | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionDetalle[]>([]);
  const [docentes, setDocentes] = useState<DocenteDetalle[]>([]);
  const [materias, setMaterias] = useState<ItemSimple[]>([]);
  const [grupos, setGrupos] = useState<ItemSimple[]>([]);

  // Estado de las ejecuciones
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const [idGreedy, setIdGreedy] = useState<string | null>(null);
  const [idBacktracking, setIdBacktracking] = useState<string | null>(null);

  const [infoGreedy, setInfoGreedy] = useState<any | null>(null);
  const [infoBacktracking, setInfoBacktracking] = useState<any | null>(null);

  const [sesionesGreedy, setSesionesGreedy] = useState<SesionCalendario[]>([]);
  const [sesionesBacktracking, setSesionesBacktracking] = useState<SesionCalendario[]>([]);

  const [datosComparativa, setDatosComparativa] = useState<MetricasComparativa | null>(null);
  const [ultimoResumenEjecutado, setUltimoResumenEjecutado] = useState<any | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    async function inicializarDatos() {
      try {
        // 1. Cargar período activo
        const respPeriodos = await fetch("/api/periods");
        if (respPeriodos.ok) {
          const listaPeriodos = await respPeriodos.json();
          if (Array.isArray(listaPeriodos) && listaPeriodos.length > 0) {
            const activo = listaPeriodos.find((p) => p.status === "ACTIVE") ?? listaPeriodos[0];
            setPeriodo(activo);

            // 2. Cargar asignaciones del período
            const respAsig = await fetch(`/api/assignments?periodId=${activo.id}`);
            if (respAsig.ok) {
              const listaAsig = await respAsig.json();
              setAsignaciones(listaAsig);
            }

            // 2.1 Cargar ejecuciones previas del período para mostrar resultados de inmediato
            try {
              const respRuns = await fetch(`/api/scheduling/periods/${activo.id}/runs`);
              if (respRuns.ok) {
                const listaRuns = await respRuns.json();
                const ultGreedy = listaRuns.find((r: any) => r.algoritmo === "GREEDY");
                const ultBacktrack = listaRuns.find((r: any) => r.algoritmo === "BACKTRACKING");

                if (ultGreedy) {
                  setIdGreedy(ultGreedy.id);
                  setInfoGreedy(ultGreedy);
                  const sResp = await fetch(`/api/scheduling/runs/${ultGreedy.id}/sessions`);
                  if (sResp.ok) setSesionesGreedy(await sResp.json());
                }
                if (ultBacktrack) {
                  setIdBacktracking(ultBacktrack.id);
                  setInfoBacktracking(ultBacktrack);
                  const sResp = await fetch(`/api/scheduling/runs/${ultBacktrack.id}/sessions`);
                  if (sResp.ok) setSesionesBacktracking(await sResp.json());
                }

                if (ultGreedy && ultBacktrack) {
                  const compResp = await fetch(`/api/analytics/compare?runA=${ultGreedy.id}&runB=${ultBacktrack.id}`);
                  if (compResp.ok) {
                    setDatosComparativa(await compResp.json());
                  }
                }
              }
            } catch (errRuns) {
              console.warn("No se pudieron pre-cargar ejecuciones previas:", errRuns);
            }
          }
        }

        // 3. Cargar docentes con su disponibilidad
        const respDocentes = await fetch("/api/teachers");
        if (respDocentes.ok) {
          const listaDocentes = await respDocentes.json();
          const docentesConDisp = await Promise.all(
            listaDocentes.map(async (doc: any) => {
              const respDisp = await fetch(`/api/teachers/${doc.id}/availability`);
              const disp = respDisp.ok ? await respDisp.json() : [];
              return { ...doc, teacher_availability: disp };
            })
          );
          setDocentes(docentesConDisp);
        }

        // 4. Cargar materias y grupos para el formulario de asignación
        const [respMat, respGrp] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/groups"),
        ]);
        if (respMat.ok) setMaterias(await respMat.json());
        if (respGrp.ok) setGrupos(await respGrp.json());
      } catch (err: any) {
        console.error("Error al inicializar datos:", err);
      }
    }

    inicializarDatos();
  }, []);

  async function recargarAsignaciones() {
    if (!periodo) return;
    const respAsig = await fetch(`/api/assignments?periodId=${periodo.id}`);
    if (respAsig.ok) {
      setAsignaciones(await respAsig.json());
    }
  }

  // Total de sesiones requeridas
  const totalSesionesRequeridas = asignaciones.reduce((acc, asig) => {
    const sesPorAsig = asig.session_requirements.reduce((sub, r) => sub + r.quantity, 0);
    return acc + sesPorAsig;
  }, 0);

  // Función para ejecutar algoritmos
  async function manejarEjecucion(
    modo: ModoEjecucion,
    config: {
      pasoCuadriculaMinutos: number;
      jornadaInicioMinuto: number;
      jornadaFinMinuto: number;
    }
  ) {
    if (!periodo) {
      setMensajeEstado("No hay un período académico disponible.");
      return;
    }

    setCargando(true);
    const nombreModo =
      modo === "GREEDY"
        ? "Algoritmos voraces (Greedy)"
        : modo === "BACKTRACKING"
        ? "Algoritmo de Retroceso (Backtracking)"
        : "ambos algoritmos";
    setMensajeEstado(`Iniciando planificación con ${nombreModo}...`);

    try {
      let nuevoIdGreedy = idGreedy;
      let nuevoIdBacktracking = idBacktracking;

      if (modo === "GREEDY" || modo === "AMBOS") {
        setMensajeEstado("Ejecutando Algoritmos voraces (Greedy)...");
        const resp = await fetch("/api/scheduling/greedy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodoId: periodo.id, ...config }),
        });

        if (!resp.ok) throw new Error("Error en ejecución de Algoritmos voraces (Greedy)");
        const datos = await resp.json();
        nuevoIdGreedy = datos.ejecucionId;
        setIdGreedy(datos.ejecucionId);

        const [detResp, sesResp] = await Promise.all([
          fetch(`/api/scheduling/runs/${datos.ejecucionId}`),
          fetch(`/api/scheduling/runs/${datos.ejecucionId}/sessions`),
        ]);
        if (detResp.ok) {
          const det = await detResp.json();
          setInfoGreedy(det);
          setUltimoResumenEjecutado(det);
        }
        if (sesResp.ok) {
          setSesionesGreedy(await sesResp.json());
        }
      }

      if (modo === "BACKTRACKING" || modo === "AMBOS") {
        setMensajeEstado("Ejecutando Algoritmo de Retroceso (Backtracking)...");
        const resp = await fetch("/api/scheduling/backtracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodoId: periodo.id, ...config }),
        });

        if (!resp.ok) throw new Error("Error en ejecución de Algoritmo de Retroceso (Backtracking)");
        const datos = await resp.json();
        nuevoIdBacktracking = datos.ejecucionId;
        setIdBacktracking(datos.ejecucionId);

        const [detResp, sesResp] = await Promise.all([
          fetch(`/api/scheduling/runs/${datos.ejecucionId}`),
          fetch(`/api/scheduling/runs/${datos.ejecucionId}/sessions`),
        ]);
        if (detResp.ok) {
          const det = await detResp.json();
          setInfoBacktracking(det);
          setUltimoResumenEjecutado(det);
        }
        if (sesResp.ok) {
          setSesionesBacktracking(await sesResp.json());
        }
      }

      if (nuevoIdGreedy && nuevoIdBacktracking) {
        const compResp = await fetch(
          `/api/analytics/compare?runA=${nuevoIdGreedy}&runB=${nuevoIdBacktracking}`
        );
        if (compResp.ok) {
          setDatosComparativa(await compResp.json());
        }
      }

      setMensajeEstado("Planificación finalizada y registrada con éxito.");
    } catch (err: any) {
      setMensajeEstado(`Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }

  const opcionesPrincipales = [
    {
      id: "dashboard",
      nombre: "Panel General",
      descripcion: "Resumen ejecutivo del período académico, estado de los algoritmos y métricas principales.",
      icono: IconoDashboard,
    },
    {
      id: "horario",
      nombre: "Horario Semanal",
      descripcion: "Distribución semanal de asignaturas sin choques en Salón 101, Salón 102 y Salón 103.",
      icono: IconoCalendario,
      badge: sesionesBacktracking.length > 0 ? `${sesionesBacktracking.length}` : undefined,
    },
    {
      id: "comparativa",
      nombre: "Métricas & Análisis",
      descripcion: "Comparativa experimental entre Algoritmos voraces (Greedy) y Backtracking.",
      icono: IconoComparativa,
    },
  ];

  const opcionesGestion = [
    {
      id: "entrada",
      nombre: "Datos de Entrada",
      descripcion: "Catálogo de asignaturas, profesores asignados, cohortes por año y parámetros globales.",
      icono: IconoDatosEntrada,
    },
    {
      id: "ejecucion",
      nombre: "Ejecutar Algoritmos",
      descripcion: "Ejecución bajo demanda de los motores de planificación para evaluar su comportamiento.",
      icono: IconoEjecucion,
    },
  ];

  const todasOpciones = [...opcionesPrincipales, ...opcionesGestion];
  const opcionActivaInfo = todasOpciones.find((o) => o.id === pantallaActiva) ?? opcionesPrincipales[0];
  const IconoActivo = opcionActivaInfo.icono;

  return (
    <div className="min-h-screen bg-[#f1eff7] text-slate-900 flex p-3 md:p-4 gap-3 md:gap-4 font-sans">
      {/* Barra Lateral Izquierda (Dashboard Sidebar estilo SaaS en tono lavanda-gris tenue) */}
      <aside className="w-64 bg-[#f1eff7] flex flex-col justify-between shrink-0 h-[calc(100vh-2rem)] sticky top-4 z-20">
        <div>
          {/* Cabecera / Marca del Sistema */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <IconoCalendario className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Academic Scheduler</h1>
              <span className="text-[10px] text-slate-500 font-medium">Planificador Universitario</span>
            </div>
          </div>

          {/* Menú de Navegación con Pastillas Blancas Redondeadas */}
          <div className="px-2 py-3 space-y-5">
            <div>
              <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Vistas Principales
              </span>
              <nav className="space-y-1">
                {opcionesPrincipales.map((item) => {
                  const Icono = item.icono;
                  const estaActivo = pantallaActiva === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setPantallaActiva(item.id as PantallaActiva)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs transition-all ${
                        estaActivo
                          ? "bg-white text-slate-900 font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icono className={`w-4 h-4 ${estaActivo ? "text-slate-900" : "text-slate-400"}`} />
                        <span className="truncate">{item.nombre}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            estaActivo ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Gestión & Algoritmos
              </span>
              <nav className="space-y-1">
                {opcionesGestion.map((item) => {
                  const Icono = item.icono;
                  const estaActivo = pantallaActiva === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setPantallaActiva(item.id as PantallaActiva)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs transition-all ${
                        estaActivo
                          ? "bg-white text-slate-900 font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                      }`}
                    >
                      <Icono className={`w-4 h-4 ${estaActivo ? "text-slate-900" : "text-slate-400"}`} />
                      <span className="truncate">{item.nombre}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Ficha Inferior de Período y Estado */}
        <div className="p-4 m-2 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Período</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Activo
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {periodo ? periodo.name : "Cargando..."}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>Salones Físicos:</span>
            <span className="font-semibold text-slate-800">101, 102, 103</span>
          </div>
        </div>
      </aside>

      {/* Pantalla Principal (Card Blanco Puro con Bordes Suaves rounded-3xl) */}
      <main className="flex-1 bg-white rounded-3xl border border-slate-200/70 shadow-xs flex flex-col min-w-0 h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Cabecera con Breadcrumbs estilo SaaS Moderno */}
        <header className="p-6 md:p-8 pb-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
            <button
              onClick={() => setPantallaActiva("dashboard")}
              className="hover:text-slate-700 transition-colors"
            >
              Academic Scheduler
            </button>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-semibold flex items-center gap-1.5">
              <IconoActivo className="w-3.5 h-3.5 text-slate-600" />
              <span>{opcionActivaInfo.nombre}</span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {opcionActivaInfo.nombre}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {opcionActivaInfo.descripcion}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200/60">
                {totalSesionesRequeridas} sesiones planificadas
              </span>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200/60">
                Salones 101, 102 y 103
              </span>
            </div>
          </div>
        </header>

        {/* Notificación de Estado */}
        {mensajeEstado && (
          <div className="mx-6 md:mx-8 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-700 flex justify-between items-center shadow-xs">
            <span>{mensajeEstado}</span>
            <button
              onClick={() => setMensajeEstado(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Contenido Dinámico de la Pantalla Activa */}
        <div className="p-6 md:p-8 pt-0 flex-1">
          {pantallaActiva === "dashboard" && (
            <PantallaDashboard
              periodo={periodo}
              totalAsignaciones={asignaciones.length}
              totalSesiones={totalSesionesRequeridas}
              totalDocentes={docentes.length}
              ultimaEjecucionGreedy={infoGreedy}
              ultimaEjecucionBacktracking={infoBacktracking}
              onNavegar={(p) => setPantallaActiva(p as PantallaActiva)}
            />
          )}

          {pantallaActiva === "entrada" && (
            <PantallaDatosEntrada
              periodoId={periodo?.id ?? 1}
              asignaciones={asignaciones}
              docentes={docentes}
              materias={materias}
              grupos={grupos}
              onAsignacionCreada={recargarAsignaciones}
            />
          )}

          {pantallaActiva === "ejecucion" && (
            <PantallaEjecucion
              periodoId={periodo?.id ?? 1}
              alEjecutar={manejarEjecucion}
              cargando={cargando}
              resumenEjecucion={ultimoResumenEjecutado}
              onVerHorario={() => setPantallaActiva("horario")}
              onVerComparativa={() => setPantallaActiva("comparativa")}
            />
          )}

          {pantallaActiva === "horario" && (
            <PantallaHorario
              sesionesGreedy={sesionesGreedy}
              sesionesBacktracking={sesionesBacktracking}
              infoGreedy={infoGreedy}
              infoBacktracking={infoBacktracking}
              totalSesionesRequeridas={totalSesionesRequeridas}
            />
          )}

          {pantallaActiva === "comparativa" && (
            <PantallaComparativa datos={datosComparativa} totalSesiones={totalSesionesRequeridas} />
          )}
        </div>
      </main>
    </div>
  );
}
