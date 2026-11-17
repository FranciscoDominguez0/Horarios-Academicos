"use client";

import React, { useEffect, useState } from "react";
import PantallaDashboard from "../components/PantallaDashboard";
import PantallaDatosEntrada, { AsignacionDetalle, DocenteDetalle, ItemSimple } from "../components/PantallaDatosEntrada";
import PantallaEjecucion, { ModoEjecucion } from "../components/PantallaEjecucion";
import PantallaHorario from "../components/PantallaHorario";
import PantallaComparativa from "../components/PantallaComparativa";
import { SesionCalendario } from "../components/CalendarioSemanal";
import { MetricasComparativa } from "../components/ComparativaAlgoritmos";

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
        setMensajeEstado("Ejecutando Algoritmos voraces (Greedy) (decisiones locales)...");
        const resp = await fetch("/api/scheduling/greedy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodoId: periodo.id, ...config }),
        });

        if (!resp.ok) throw new Error("Error en ejecución de Algoritmos voraces (Greedy)");
        const datos = await resp.json();
        nuevoIdGreedy = datos.ejecucionId;
        setIdGreedy(datos.ejecucionId);

        // Cargar detalle y sesiones
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
        setMensajeEstado("Ejecutando Algoritmo de Retroceso (Backtracking) (búsqueda con poda)...");
        const resp = await fetch("/api/scheduling/backtracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodoId: periodo.id, ...config }),
        });

        if (!resp.ok) throw new Error("Error en ejecución de Algoritmo de Retroceso (Backtracking)");
        const datos = await resp.json();
        nuevoIdBacktracking = datos.ejecucionId;
        setIdBacktracking(datos.ejecucionId);

        // Cargar detalle y sesiones
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

      // Si ambos han sido ejecutados, actualizar comparativa automáticamente
      if (nuevoIdGreedy && nuevoIdBacktracking) {
        const compResp = await fetch(
          `/api/analytics/compare?runA=${nuevoIdGreedy}&runB=${nuevoIdBacktracking}`
        );
        if (compResp.ok) {
          setDatosComparativa(await compResp.json());
        }
      }

      setMensajeEstado("Planificación finalizada y resultados guardados en MySQL.");
    } catch (err: any) {
      setMensajeEstado(`Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }

  const pestañas = [
    { id: "dashboard", nombre: "1. Panel de Planificación", icono: "📋" },
    { id: "entrada", nombre: "2. Datos de Entrada", icono: "📥" },
    { id: "ejecucion", nombre: "3. Ejecución de Algoritmos", icono: "⚙️" },
    { id: "horario", nombre: "4. Horario Generado", icono: "📅" },
    { id: "comparativa", nombre: "5. Comparación y Complejidad", icono: "📊" },
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 pb-12">
      {/* Barra de Navegación Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Optimización y Complejidad Computacional
              </span>
              <h1 className="text-lg font-bold text-slate-900">
                Sistema de Asignación Automática de Horarios Académicos
              </h1>
            </div>
            {periodo && (
              <div className="text-right text-xs">
                <span className="text-slate-400">Período: </span>
                <span className="font-bold text-slate-800">{periodo.name}</span>
              </div>
            )}
          </div>

          {/* Menú de las 5 Pantallas Requeridas */}
          <nav className="flex space-x-1 overflow-x-auto py-2 text-xs">
            {pestañas.map((p) => (
              <button
                key={p.id}
                onClick={() => setPantallaActiva(p.id as PantallaActiva)}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  pantallaActiva === p.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{p.icono}</span>
                <span>{p.nombre}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {mensajeEstado && (
          <div className="mb-6 p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 flex justify-between items-center shadow-sm">
            <span>{mensajeEstado}</span>
            <button
              onClick={() => setMensajeEstado(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* 1. Panel de Planificación */}
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

        {/* 2. Datos de Entrada */}
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

        {/* 3. Ejecución de Algoritmos */}
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

        {/* 4. Horarios Generados */}
        {pantallaActiva === "horario" && (
          <PantallaHorario
            sesionesGreedy={sesionesGreedy}
            sesionesBacktracking={sesionesBacktracking}
            infoGreedy={infoGreedy}
            infoBacktracking={infoBacktracking}
            totalSesionesRequeridas={totalSesionesRequeridas}
          />
        )}

        {/* 5. Comparación y Complejidad */}
        {pantallaActiva === "comparativa" && (
          <PantallaComparativa datos={datosComparativa} totalSesiones={totalSesionesRequeridas} />
        )}
      </main>
    </div>
  );
}
