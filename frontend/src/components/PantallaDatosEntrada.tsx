"use client";

import React, { useState } from "react";

export interface AsignacionDetalle {
  id: number;
  subject_id: number;
  teacher_id: number;
  group_id: number;
  period_id: number;
  weekly_minutes: number;
  subjects: { code: string; name: string };
  teachers: { first_name: string; last_name: string };
  student_groups: { code: string; name: string };
  session_requirements: Array<{ id: number; duration_minutes: number; quantity: number }>;
}

export interface DocenteDetalle {
  id: number;
  first_name: string;
  last_name: string;
  teacher_availability?: Array<{
    id: number;
    day_of_week: number;
    start_minute: number;
    end_minute: number;
  }>;
}

export interface ItemSimple {
  id: number;
  name: string;
  code?: string;
}

interface PropiedadesDatosEntrada {
  periodoId: number;
  asignaciones: AsignacionDetalle[];
  docentes: DocenteDetalle[];
  materias: ItemSimple[];
  grupos: ItemSimple[];
  onAsignacionCreada: () => Promise<void>;
}

const NOMBRES_DIAS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function PantallaDatosEntrada({
  periodoId,
  asignaciones,
  docentes,
  materias,
  grupos,
  onAsignacionCreada,
}: PropiedadesDatosEntrada) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [materiaId, setMateriaId] = useState<number>(materias[0]?.id ?? 1);
  const [docenteId, setDocenteId] = useState<number>(docentes[0]?.id ?? 1);
  const [grupoId, setGrupoId] = useState<number>(grupos[0]?.id ?? 1);
  const [tipoDivision, setTipoDivision] = useState<string>("2x120"); // 4h = 240min
  const [guardando, setGuardando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState<string | null>(null);

  async function manejarGuardarAsignacion(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensajeForm(null);

    let weekly_minutes = 240;
    let requirements = [{ duration_minutes: 120, quantity: 2 }];

    if (tipoDivision === "1x120") {
      weekly_minutes = 120;
      requirements = [{ duration_minutes: 120, quantity: 1 }];
    } else if (tipoDivision === "1x180") {
      weekly_minutes = 180;
      requirements = [{ duration_minutes: 180, quantity: 1 }];
    } else if (tipoDivision === "2x120") {
      weekly_minutes = 240;
      requirements = [{ duration_minutes: 120, quantity: 2 }];
    }

    try {
      const resp = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_id: periodoId,
          subject_id: Number(materiaId),
          teacher_id: Number(docenteId),
          group_id: Number(grupoId),
          weekly_minutes,
          requirements,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.mensaje || "Error al crear asignación");
      }

      setMensajeForm("¡Asignación agregada con éxito! Ahora puedes ir a la pantalla 3 para ejecutar los algoritmos y ver dónde la ubican.");
      await onAsignacionCreada();
      setMostrarFormulario(false);
    } catch (err: any) {
      setMensajeForm(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Informativo */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
        <span className="text-base">📌</span>
        <div>
          <span className="font-bold">Definición de Instancia de Optimización (CSP):</span> Esta pantalla define
          las variables a planificar (sesiones académicas), sus dominios de tiempo y las restricciones duras
          (evitar cruces de docente, grupos y respetar disponibilidad). Ambos algoritmos (<strong className="font-semibold">Algoritmos voraces (Greedy)</strong> y <strong className="font-semibold">Algoritmo de Retroceso (Backtracking)</strong>)
          reciben una captura idéntica e inmutable para garantizar la validez científica de la comparación de complejidad.
        </div>
      </div>

      {mensajeForm && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex justify-between items-center">
          <span>{mensajeForm}</span>
          <button onClick={() => setMensajeForm(null)} className="font-bold text-emerald-500">
            ×
          </button>
        </div>
      )}

      {/* Botón y Formulario para Agregar Asignación */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Gestión de Asignaciones del Período</h3>
            <p className="text-xs text-slate-500">Agrega asignaciones para probar el comportamiento de los algoritmos</p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
          >
            {mostrarFormulario ? "Cancelar" : "+ Agregar Asignación"}
          </button>
        </div>

        {mostrarFormulario && (
          <form
            onSubmit={manejarGuardarAsignacion}
            className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asignatura</label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Docente</label>
              <select
                value={docenteId}
                onChange={(e) => setDocenteId(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grupo</label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Horas / Sesiones</label>
              <select
                value={tipoDivision}
                onChange={(e) => setTipoDivision(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="2x120">4 horas (2 sesiones de 120 min)</option>
                <option value="1x180">3 horas (1 sesión de 180 min)</option>
                <option value="1x120">2 horas (1 sesión de 120 min)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar Asignación en BD"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabla de Asignaciones Académicas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Asignaciones Académicas Registradas</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            {asignaciones.length} asignaciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asignatura</th>
                <th className="py-3 px-4">Docente</th>
                <th className="py-3 px-4">Grupo</th>
                <th className="py-3 px-4 text-center">Horas Semanales</th>
                <th className="py-3 px-4">División en Sesiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {asignaciones.length > 0 ? (
                asignaciones.map((asig) => {
                  const horasSemanales = (asig.weekly_minutes / 60).toFixed(0);
                  const divisionTexto = asig.session_requirements
                    .map((r) => `${r.quantity} × ${r.duration_minutes / 60}h (${r.duration_minutes}m)`)
                    .join(", ");

                  return (
                    <tr key={asig.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {asig.subjects.name}
                        <span className="block text-[11px] font-normal text-slate-400 font-mono">
                          {asig.subjects.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {asig.teachers.first_name} {asig.teachers.last_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {asig.student_groups.code}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">
                        {horasSemanales}h ({asig.weekly_minutes} min)
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {divisionTexto || "Sin requerimientos"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No se encontraron asignaciones en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Disponibilidad Docente y Jornada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disponibilidad Docente */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2">
            Disponibilidad Horaria Docente
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {docentes.map((doc) => (
              <div key={doc.id} className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                <span className="font-bold text-slate-800 block">
                  {doc.first_name} {doc.last_name}
                </span>
                <div className="mt-1 space-y-1">
                  {doc.teacher_availability && doc.teacher_availability.length > 0 ? (
                    doc.teacher_availability.map((disp) => (
                      <div key={disp.id} className="flex justify-between text-slate-600">
                        <span className="font-medium">{NOMBRES_DIAS[disp.day_of_week]}:</span>
                        <span className="font-mono text-slate-700">
                          {minutosAHora(disp.start_minute)} – {minutosAHora(disp.end_minute)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Disponibilidad completa (07:00 a 18:00)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parámetros de la Jornada */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2">
            Parámetros Globales de la Jornada
          </h3>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Jornada institucional:</span>
              <span className="font-bold text-slate-800">07:00 – 18:00 (420 a 1080 min)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Días permitidos:</span>
              <span className="font-bold text-slate-800">Lunes a Viernes (Días 1 a 5)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Paso de cuadrícula (inicio candidatos):</span>
              <span className="font-mono font-bold text-indigo-700">Cada 30 minutos</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Representación del tiempo:</span>
              <span className="font-mono text-slate-700">Minutos continuos desde medianoche</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
