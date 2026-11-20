"use client";

import React, { useEffect, useState } from "react";
import PantallaDashboard from "../components/PantallaDashboard";
import PantallaDatosEntrada, { AsignacionDetalle, DocenteDetalle, ItemSimple } from "../components/PantallaDatosEntrada";
import PantallaHorario, { ModoEjecucion } from "../components/PantallaHorario";
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

type PantallaActiva = "dashboard" | "entrada" | "horario" | "comparativa";

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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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
    try {
      const respAsig = await fetch(`/api/assignments?periodId=${periodo.id}`);
      if (respAsig.ok) {
        setAsignaciones(await respAsig.json());
      }
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
      const respMat = await fetch("/api/subjects");
      if (respMat.ok) setMaterias(await respMat.json());
    } catch (e) {
      console.error("Error recargando datos del período:", e);
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
      setToast("No hay un período académico disponible.");
      return;
    }

    setCargando(true);
    setToast(
      modo === "GREEDY"
        ? "Ejecutando Greedy..."
        : modo === "BACKTRACKING"
        ? "Ejecutando Backtracking..."
        : "Ejecutando ambos algoritmos..."
    );

    try {
      let nuevoIdGreedy = idGreedy;
      let nuevoIdBacktracking = idBacktracking;

      if (modo === "GREEDY" || modo === "AMBOS") {
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

      setToast("Planificación finalizada con éxito.");
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }

  const [limpiandoResultados, setLimpiandoResultados] = useState(false);
  const [generandoEscenario, setGenerandoEscenario] = useState(false);
  const [escenarioInfo, setEscenarioInfo] = useState<{ nombre: string; descripcion: string } | null>(null);

  async function manejarGenerarEscenarioConIA() {
    if (!periodo) return;
    if (
      !window.confirm(
        "¿Deseas generar un nuevo escenario con IA? Se limpiarán los resultados y asignaciones actuales, y la IA estructurará un nuevo conjunto de disponibilidades y restricciones docentes para Ingeniería en Informática."
      )
    ) {
      return;
    }

    setGenerandoEscenario(true);
    setToast("Generando escenario con IA...");
    try {
      const resp = await fetch("/api/scenarios/generate-random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodoId: periodo.id }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.mensaje || "No se pudo generar el nuevo escenario con IA.");
      }

      const datos = await resp.json();

      // Guardar información del escenario activo
      setEscenarioInfo({
        nombre: datos.tema || "Escenario Académico",
        descripcion: datos.descripcion || "Disponibilidad de docentes configurada por la IA.",
      });

      // Limpiar estados de ejecuciones previas para que el horario quede limpio
      setIdGreedy(null);
      setIdBacktracking(null);
      setInfoGreedy(null);
      setInfoBacktracking(null);
      setSesionesGreedy([]);
      setSesionesBacktracking([]);
      setDatosComparativa(null);
      setUltimoResumenEjecutado(null);

      // Recargar catálogo de materias, docentes y asignaciones
      await recargarAsignaciones();

      setToast(datos.mensaje || "Escenario generado con éxito (15 materias).");
    } catch (err: any) {
      alert(err.message || "Error al generar nuevo escenario con IA.");
      setToast(`Error: ${err.message}`);
    } finally {
      setGenerandoEscenario(false);
    }
  }

  async function manejarLimpiarResultados() {
    if (!periodo) return;
    if (
      !window.confirm(
        "¿Deseas limpiar los resultados de planificación para iniciar una simulación limpia? Las materias, docentes y asignaciones permanecerán intactos."
      )
    ) {
      return;
    }

    setLimpiandoResultados(true);
    try {
      const resp = await fetch(`/api/scheduling/periods/${periodo.id}/runs`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("No se pudieron eliminar los resultados de planificación.");
      }

      setIdGreedy(null);
      setIdBacktracking(null);
      setInfoGreedy(null);
      setInfoBacktracking(null);
      setSesionesGreedy([]);
      setSesionesBacktracking([]);
      setDatosComparativa(null);
      setUltimoResumenEjecutado(null);
      setToast("Resultados limpiados con éxito.");
    } catch (err: any) {
      alert(err.message || "Error al limpiar resultados.");
      setToast(`Error: ${err.message}`);
    } finally {
      setLimpiandoResultados(false);
    }
  }

  const opcionesPrincipales = [
    {
      id: "dashboard",
      nombre: "Panel General",
      descripcion: "Resumen ejecutivo de asignaciones, estado de los algoritmos y métricas de resolución.",
      icono: IconoDashboard,
    },
    {
      id: "horario",
      nombre: "Horario Semanal",
      descripcion: "Distribución de clases por año académico y horario semanal.",
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
      descripcion: "Catálogo de asignaturas, docentes y años académicos.",
      icono: IconoDatosEntrada,
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
      </aside>

      {/* Pantalla Principal (Card Blanco Puro con Bordes Suaves rounded-3xl y Header Permanente) */}
      <main className="flex-1 bg-white rounded-3xl border border-slate-200/70 shadow-xs flex flex-col min-w-0 h-[calc(100vh-2rem)] overflow-hidden">
        {/* Cabecera Permanente: Solo Migas de Pan (Breadcrumbs) */}
        <header className="px-6 md:px-8 py-3.5 border-b border-slate-100 bg-white shrink-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button
              onClick={() => setPantallaActiva("dashboard")}
              className="hover:text-slate-800 transition-colors"
            >
              Academic Scheduler
            </button>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-semibold flex items-center gap-1.5">
              <IconoActivo className="w-3.5 h-3.5 text-slate-600" />
              <span>{opcionActivaInfo.nombre}</span>
            </span>
          </div>
        </header>

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[999999] flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 text-xs font-medium animate-in slide-in-from-bottom-3 duration-150">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5 transition-colors font-bold text-sm ml-1"
              title="Cerrar"
            >
              ×
            </button>
          </div>
        )}

        {/* Contenido Dinámico de la Pantalla Activa con Scroll Independiente */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {pantallaActiva === "dashboard" && (
            <PantallaDashboard
              periodo={periodo}
              totalAsignaciones={asignaciones.length}
              totalSesiones={totalSesionesRequeridas}
              totalDocentes={docentes.length}
              ultimaEjecucionGreedy={infoGreedy}
              ultimaEjecucionBacktracking={infoBacktracking}
              onNavegar={(p) => setPantallaActiva(p as PantallaActiva)}
              onLimpiarResultados={manejarLimpiarResultados}
              limpiandoResultados={limpiandoResultados}
              onGenerarEscenario={manejarGenerarEscenarioConIA}
              generandoEscenario={generandoEscenario}
              escenarioInfo={escenarioInfo}
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

          {pantallaActiva === "horario" && (
            <PantallaHorario
              sesionesGreedy={sesionesGreedy}
              sesionesBacktracking={sesionesBacktracking}
              infoGreedy={infoGreedy}
              infoBacktracking={infoBacktracking}
              totalSesionesRequeridas={totalSesionesRequeridas}
              alEjecutar={manejarEjecucion}
              cargando={cargando}
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
