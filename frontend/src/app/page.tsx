"use client";

import React, { useEffect, useState } from "react";
import CalendarioSemanal, { SesionCalendario } from "../components/CalendarioSemanal";
import ComparativaAlgoritmos, { MetricasComparativa } from "../components/ComparativaAlgoritmos";
import PanelPlanificacion from "../components/PanelPlanificacion";

export default function PaginaPrincipal() {
  const [periodoId, setPeriodoId] = useState<number | null>(null);
  const [periodos, setPeriodos] = useState<{ id: number; name: string; status: string }[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [sesiones, setSesiones] = useState<SesionCalendario[]>([]);
  const [ultimaEjecucionGreedy, setUltimaEjecucionGreedy] = useState<string | null>(null);
  const [ultimaEjecucionBacktracking, setUltimaEjecucionBacktracking] = useState<string | null>(null);
  const [datosComparativa, setDatosComparativa] = useState<MetricasComparativa | null>(null);
  const [tabActiva, setTabActiva] = useState<"calendario" | "comparativa">("calendario");
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/periods")
      .then((r) => r.json())
      .then((lista) => {
        if (Array.isArray(lista) && lista.length > 0) {
          setPeriodos(lista);
          setPeriodoId(lista[0].id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  async function ejecutarAlgoritmo(algoritmo: "GREEDY" | "BACKTRACKING") {
    if (!periodoId) {
      setMensajeEstado("No hay un período académico disponible para planificar.");
      return;
    }

    setCargando(true);
    setMensajeEstado(`Ejecutando algoritmo ${algoritmo}...`);

    try {
      const ruta = algoritmo === "GREEDY" ? "/api/scheduling/greedy" : "/api/scheduling/backtracking";
      const respuesta = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodoId }),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.mensaje || "Error al ejecutar el algoritmo.");
      }

      const datos = await respuesta.json();
      const ejecucionId = datos.ejecucionId;

      if (algoritmo === "GREEDY") {
        setUltimaEjecucionGreedy(ejecucionId);
      } else {
        setUltimaEjecucionBacktracking(ejecucionId);
      }

      // Cargar sesiones de la ejecución
      const respSesiones = await fetch(`/api/scheduling/runs/${ejecucionId}/sessions`);
      if (respSesiones.ok) {
        const listaSesiones = await respSesiones.json();
        setSesiones(listaSesiones);
      }

      // Si ya existen ejecuciones de ambos algoritmos, cargar comparativa
      const idA = algoritmo === "GREEDY" ? ejecucionId : ultimaEjecucionGreedy;
      const idB = algoritmo === "BACKTRACKING" ? ejecucionId : ultimaEjecucionBacktracking;

      if (idA && idB) {
        const respComp = await fetch(`/api/analytics/compare?runA=${idA}&runB=${idB}`);
        if (respComp.ok) {
          const compData = await respComp.json();
          setDatosComparativa(compData);
        }
      }

      setMensajeEstado(`Ejecución ${ejecucionId} finalizada con éxito.`);
    } catch (err: any) {
      setMensajeEstado(`Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Sistema de Asignación Automática de Horarios Académicos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Optimización combinatoria y análisis de complejidad computacional (Greedy vs Backtracking).
        </p>
      </header>

      {mensajeEstado && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 flex justify-between items-center">
          <span>{mensajeEstado}</span>
          <button
            onClick={() => setMensajeEstado(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <PanelPlanificacion
            periodoId={periodoId}
            alEjecutar={ejecutarAlgoritmo}
            cargando={cargando}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800">Historial de Ejecuciones</h4>
            <p>
              Greedy:{" "}
              <span className="font-mono font-medium">
                {ultimaEjecucionGreedy ? `#${ultimaEjecucionGreedy}` : "Sin ejecutar"}
              </span>
            </p>
            <p>
              Backtracking:{" "}
              <span className="font-mono font-medium">
                {ultimaEjecucionBacktracking ? `#${ultimaEjecucionBacktracking}` : "Sin ejecutar"}
              </span>
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setTabActiva("calendario")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                tabActiva === "calendario"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Calendario Semanal
            </button>
            <button
              onClick={() => setTabActiva("comparativa")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                tabActiva === "comparativa"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Comparativa Experimental
            </button>
          </div>

          {tabActiva === "calendario" ? (
            <CalendarioSemanal sesiones={sesiones} />
          ) : (
            <ComparativaAlgoritmos datos={datosComparativa} />
          )}
        </div>
      </div>
    </div>
  );
}
