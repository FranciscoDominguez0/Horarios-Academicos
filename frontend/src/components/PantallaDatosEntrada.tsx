"use client";

import React, { useState } from "react";
import { IconoLibro, IconoProfesor, IconoEstudiante, IconoCheck, IconoReloj } from "./Iconos";

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

function formatearNombreGrupo(nombre: string, codigo?: string): string {
  const texto = `${nombre} ${codigo || ""}`;
  if (texto.includes("1ANO") || texto.includes("1°") || texto.includes("Primer")) return "1° Año";
  if (texto.includes("2ANO") || texto.includes("2°") || texto.includes("Segundo")) return "2° Año";
  if (texto.includes("3ANO") || texto.includes("3°") || texto.includes("Tercer")) return "3° Año";
  return nombre.replace(/ANO/gi, "° Año");
}

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
  const [tipoDivision, setTipoDivision] = useState<string>("2x120");
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

      setMensajeForm("Asignación agregada con éxito al catálogo del período.");
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
      {mensajeForm && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <IconoCheck className="w-4 h-4 text-emerald-600" />
            <span>{mensajeForm}</span>
          </div>
          <button onClick={() => setMensajeForm(null)} className="font-bold text-emerald-500 hover:text-emerald-700">
            ×
          </button>
        </div>
      )}

      {/* Botón y Formulario para Agregar Asignación */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Catálogo de Asignaciones Académicas</h3>
            <p className="text-xs text-slate-500">
              Configuración de materias, docentes y distribución semanal para la planificación.
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full transition-all shadow-xs"
          >
            {mostrarFormulario ? "Cerrar" : "+ Nueva Asignación"}
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
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Docente</label>
              <select
                value={docenteId}
                onChange={(e) => setDocenteId(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Año Académico</label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {formatearNombreGrupo(g.name, g.code)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estructura de Clases</label>
              <select
                value={tipoDivision}
                onChange={(e) => setTipoDivision(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="2x120">4 horas (2 clases de 2h)</option>
                <option value="1x180">3 horas (1 clase de 3h)</option>
                <option value="1x120">2 horas (1 clase de 2h)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition-all disabled:opacity-50 shadow-xs"
              >
                {guardando ? "Guardando..." : "Guardar Asignación"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabla Limpia de Asignaciones Académicas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Asignaturas y Cargas del Período</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {asignaciones.length} materias activas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-5">Asignatura</th>
                <th className="py-3 px-5">Docente</th>
                <th className="py-3 px-5">Año Académico</th>
                <th className="py-3 px-5 text-center">Carga Semanal</th>
                <th className="py-3 px-5">Sesiones de Clase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {asignaciones.length > 0 ? (
                asignaciones.map((asig) => {
                  const horasSemanales = Math.round(asig.weekly_minutes / 60);
                  const nombreAno = formatearNombreGrupo(asig.student_groups.name, asig.student_groups.code);

                  return (
                    <tr key={asig.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5 font-semibold text-slate-900">
                        {asig.subjects.name}
                      </td>
                      <td className="py-3 px-5 text-slate-600">
                        {asig.teachers.first_name} {asig.teachers.last_name}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-semibold rounded-full text-xs">
                          <IconoEstudiante className="w-3.5 h-3.5 text-slate-500" />
                          <span>{nombreAno}</span>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center font-bold text-slate-800">
                        {horasSemanales} horas
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {asig.session_requirements.map((req, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200/60"
                            >
                              <IconoReloj className="w-3 h-3 text-slate-400" />
                              <span>
                                {req.quantity === 1
                                  ? `1 clase de ${req.duration_minutes / 60}h`
                                  : `${req.quantity} clases de ${req.duration_minutes / 60}h`}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No se encontraron asignaciones en el período actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Disponibilidad Docente y Jornada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disponibilidad Docente */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-sm">Disponibilidad de Profesores</h3>
            <span className="text-[11px] text-slate-500">{docentes.length} docentes</span>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {docentes.map((doc) => (
              <div key={doc.id} className="bg-slate-50/70 rounded-xl p-3 text-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    {doc.first_name} {doc.last_name}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {doc.teacher_availability && doc.teacher_availability.length > 0
                      ? doc.teacher_availability
                          .map((d) => `${NOMBRES_DIAS[d.day_of_week]} (${minutosAHora(d.start_minute)} - ${minutosAHora(d.end_minute)})`)
                          .join(" · ")
                      : "Disponibilidad completa (Lunes a Viernes)"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/40 shrink-0">
                  Activo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Parámetros de la Jornada */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-sm">Parámetros de Planificación</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-500">Horario de clases:</span>
              <span className="font-semibold text-slate-900">08:00 a 18:00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-500">Días lectivos:</span>
              <span className="font-semibold text-slate-900">Lunes a Viernes</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-500">Salones físicos disponibles:</span>
              <span className="font-semibold text-slate-900">Salón 101, Salón 102, Salón 103</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-medium text-slate-500">Duración de sesiones:</span>
              <span className="font-semibold text-slate-900">Bloques continuos de 2 y 3 horas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
