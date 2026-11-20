"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  IconoLibro,
  IconoProfesor,
  IconoEstudiante,
  IconoCheck,
  IconoReloj,
  IconoAlerta,
  IconoBasura,
  IconoPlus,
  IconoUbicacion,
} from "./Iconos";

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
  email?: string | null;
  phone?: string | null;
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

const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes", corto: "Lun" },
  { id: 2, nombre: "Martes", corto: "Mar" },
  { id: 3, nombre: "Miércoles", corto: "Mié" },
  { id: 4, nombre: "Jueves", corto: "Jue" },
  { id: 5, nombre: "Viernes", corto: "Vie" },
];

const NOMBRES_DIAS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
};

function formatearNombreGrupo(nombre: string, codigo?: string): string {
  const texto = `${nombre} ${codigo || ""}`;
  if (texto.includes("1ANO") || texto.includes("1°") || texto.includes("Primer")) return "1° Año";
  if (texto.includes("2ANO") || texto.includes("2°") || texto.includes("Segundo")) return "2° Año";
  if (texto.includes("3ANO") || texto.includes("3°") || texto.includes("Tercer")) return "3° Año";
  return nombre.replace(/ANO/gi, "° Año");
}

function formatearHora12(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Selector Buscable con la estética exacta de la referencia (Imagen 1):
 * - Input con placeholder "Escribe para buscar..." y botón '✕' de limpiar.
 * - Desplegable con opciones limpias y botón "+ [Nuevo Elemento]" al final.
 */
interface PropiedadesSelectorBuscable {
  etiqueta: string;
  placeholder?: string;
  items: Array<{ id: number; titulo: string; subtitulo?: string }>;
  valorSeleccionadoId: number | null;
  alSeleccionar: (id: number | null) => void;
  textoCrearNuevo: string;
  alCrearNuevo: () => void;
  requerido?: boolean;
}

function SelectorBuscable({
  etiqueta,
  placeholder = "Escribe para buscar...",
  items,
  valorSeleccionadoId,
  alSeleccionar,
  textoCrearNuevo,
  alCrearNuevo,
  requerido = false,
}: PropiedadesSelectorBuscable) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);

  const itemSeleccionado = items.find((it) => it.id === valorSeleccionadoId);

  useEffect(() => {
    function manejarClicFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  const itemsFiltrados = useMemo(() => {
    if (!busqueda.trim()) return items;
    const q = busqueda.toLowerCase();
    return items.filter(
      (it) => it.titulo.toLowerCase().includes(q) || (it.subtitulo && it.subtitulo.toLowerCase().includes(q))
    );
  }, [items, busqueda]);

  return (
    <div className="relative text-left" ref={contenedorRef}>
      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
        {etiqueta} {requerido && <span className="text-rose-500">*</span>}
      </label>

      {/* Input de Búsqueda estilo Imagen 1 */}
      <div
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl transition-all ${
          abierto
            ? "border-slate-800 ring-1 ring-slate-800"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <input
          type="text"
          value={abierto ? busqueda : itemSeleccionado?.titulo || ""}
          onChange={(e) => {
            setBusqueda(e.target.value);
            if (!abierto) setAbierto(true);
          }}
          onFocus={() => {
            setAbierto(true);
            setBusqueda("");
          }}
          placeholder={itemSeleccionado?.titulo || placeholder}
          className="w-full bg-transparent text-xs text-slate-800 font-medium placeholder:text-slate-400 outline-hidden"
        />

        {(itemSeleccionado || busqueda) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              alSeleccionar(null);
              setBusqueda("");
              setAbierto(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 ml-1 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista Desplegable estilo Imagen 1 */}
      {abierto && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95">
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {itemsFiltrados.length > 0 ? (
              itemsFiltrados.map((it) => {
                const seleccionado = it.id === valorSeleccionadoId;
                return (
                  <div
                    key={it.id}
                    onClick={() => {
                      alSeleccionar(it.id);
                      setAbierto(false);
                      setBusqueda("");
                    }}
                    className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      seleccionado
                        ? "bg-slate-50 font-semibold text-slate-900"
                        : "text-slate-700 hover:bg-slate-50/80"
                    }`}
                  >
                    <div>
                      <div className="text-slate-900 font-medium">{it.titulo}</div>
                      {it.subtitulo && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{it.subtitulo}</div>
                      )}
                    </div>
                    {seleccionado && <IconoCheck className="w-4 h-4 text-slate-900 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 italic">No se encontraron resultados</div>
            )}
          </div>

          {/* Opción "+ Crear Nuevo" al final idéntica a la Imagen 1 */}
          <div className="border-t border-slate-100 p-1.5 bg-white">
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                alCrearNuevo();
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="text-base font-bold text-slate-700 leading-none">+</span>
              <span>{textoCrearNuevo}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PantallaDatosEntrada({
  periodoId,
  asignaciones,
  docentes,
  materias,
  grupos,
  onAsignacionCreada,
}: PropiedadesDatosEntrada) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Listas locales sincronizadas para permitir creación instantánea
  const [listaMaterias, setListaMaterias] = useState<ItemSimple[]>(materias);
  const [listaDocentes, setListaDocentes] = useState<DocenteDetalle[]>(docentes);

  useEffect(() => {
    setListaMaterias(materias);
  }, [materias]);

  useEffect(() => {
    setListaDocentes(docentes);
  }, [docentes]);

  // Selección del formulario de Asignación
  const [materiaId, setMateriaId] = useState<number | null>(materias[0]?.id ?? null);
  const [docenteId, setDocenteId] = useState<number | null>(docentes[0]?.id ?? null);
  const [grupoId, setGrupoId] = useState<number>(grupos[0]?.id ?? 1);
  const [tipoEstructura, setTipoEstructura] = useState<string>("2x120");

  // Control de Modales (Estilo Imagen 2)
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [modalMateriaAbierto, setModalMateriaAbierto] = useState(false);
  const [modalDocenteAbierto, setModalDocenteAbierto] = useState(false);

  // Formulario: Nueva Materia
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState("");
  const [nuevaMateriaCodigo, setNuevaMateriaCodigo] = useState("");
  const [nuevaMateriaCreditos, setNuevaMateriaCreditos] = useState("4");
  const [guardandoMateria, setGuardandoMateria] = useState(false);

  // Formulario: Nuevo Docente (sin correo ni teléfono según requerimiento)
  const [nuevoDocenteNombre, setNuevoDocenteNombre] = useState("");
  const [nuevoDocenteApellido, setNuevoDocenteApellido] = useState("");
  const [diasDisponibles, setDiasDisponibles] = useState<number[]>([1, 2, 3, 4, 5]);
  const [franjaHoraria, setFranjaHoraria] = useState<"manana" | "tarde" | "completo">("manana");
  const [guardandoDocente, setGuardandoDocente] = useState(false);

  // Estado general de feedback y carga
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const materiaActiva = useMemo(
    () => listaMaterias.find((m) => m.id === materiaId) || null,
    [listaMaterias, materiaId]
  );
  const docenteActivo = useMemo(
    () => listaDocentes.find((d) => d.id === docenteId) || null,
    [listaDocentes, docenteId]
  );
  const grupoActivo = useMemo(
    () => grupos.find((g) => g.id === grupoId) || grupos[0],
    [grupos, grupoId]
  );

  const configuracionSesiones = useMemo(() => {
    switch (tipoEstructura) {
      case "1x120":
        return { minutos: 120, horas: 2, reqs: [{ duration_minutes: 120, quantity: 1 }], desc: "1 clase de 2 horas" };
      case "1x180":
        return { minutos: 180, horas: 3, reqs: [{ duration_minutes: 180, quantity: 1 }], desc: "1 clase de 3 horas" };
      case "1x180_1x120":
        return {
          minutos: 300,
          horas: 5,
          reqs: [
            { duration_minutes: 180, quantity: 1 },
            { duration_minutes: 120, quantity: 1 },
          ],
          desc: "1 clase de 3h + 1 clase de 2h",
        };
      case "2x120":
      default:
        return { minutos: 240, horas: 4, reqs: [{ duration_minutes: 120, quantity: 2 }], desc: "2 clases de 2 horas" };
    }
  }, [tipoEstructura]);

  const salonSugerido = useMemo(() => {
    const nombre = formatearNombreGrupo(grupoActivo?.name || "", grupoActivo?.code);
    if (nombre.includes("1°")) return "Salón 101";
    if (nombre.includes("2°")) return "Salón 102";
    return "Salón 103";
  }, [grupoActivo]);

  // Guardar Nueva Materia
  async function manejarGuardarMateria(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaMateriaNombre.trim() || !nuevaMateriaCodigo.trim()) {
      alert("Por favor complete el nombre y código de la asignatura.");
      return;
    }
    setGuardandoMateria(true);

    try {
      const resp = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nuevaMateriaNombre.trim(),
          code: nuevaMateriaCodigo.trim().toUpperCase(),
          credits: parseInt(nuevaMateriaCreditos, 10) || 4,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.mensaje || "Error al crear la materia");
      }

      const creada = await resp.json();
      setListaMaterias((prev) => [...prev, creada]);
      setMateriaId(creada.id);
      setModalMateriaAbierto(false);
      setNuevaMateriaNombre("");
      setNuevaMateriaCodigo("");
      setNotificacion({
        tipo: "exito",
        texto: `Asignatura "${creada.name}" creada y seleccionada correctamente.`,
      });
      await onAsignacionCreada();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGuardandoMateria(false);
    }
  }

  // Guardar Nuevo Docente con disponibilidad
  async function manejarGuardarDocente(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoDocenteNombre.trim() || !nuevoDocenteApellido.trim()) {
      alert("Por favor ingrese el nombre y apellido del profesor.");
      return;
    }
    if (diasDisponibles.length === 0) {
      alert("Debe seleccionar al menos un día de disponibilidad para el profesor.");
      return;
    }

    setGuardandoDocente(true);

    try {
      const respDoc = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: nuevoDocenteNombre.trim(),
          last_name: nuevoDocenteApellido.trim(),
          email: null,
          phone: null,
        }),
      });

      if (!respDoc.ok) {
        const err = await respDoc.json();
        throw new Error(err.mensaje || "Error al crear el docente");
      }

      const docenteCreado = await respDoc.json();

      let start_minute = 480;
      let end_minute = 780;
      if (franjaHoraria === "tarde") {
        start_minute = 660; // 11:00
        end_minute = 900;   // 15:00
      } else if (franjaHoraria === "completo") {
        start_minute = 480; // 08:00
        end_minute = 900;   // 15:00
      }

      const disponibilidadesCreadas = await Promise.all(
        diasDisponibles.map(async (dia) => {
          const r = await fetch(`/api/teachers/${docenteCreado.id}/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              day_of_week: dia,
              start_minute,
              end_minute,
            }),
          });
          return r.ok ? await r.json() : null;
        })
      );

      const docenteCompleto: DocenteDetalle = {
        ...docenteCreado,
        teacher_availability: disponibilidadesCreadas.filter(Boolean),
      };

      setListaDocentes((prev) => [...prev, docenteCompleto]);
      setDocenteId(docenteCompleto.id);
      setModalDocenteAbierto(false);

      setNuevoDocenteNombre("");
      setNuevoDocenteApellido("");
      setNotificacion({
        tipo: "exito",
        texto: `Profesor ${docenteCompleto.first_name} ${docenteCompleto.last_name} creado con éxito.`,
      });
      await onAsignacionCreada();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGuardandoDocente(false);
    }
  }

  // Guardar Asignación Académica
  async function manejarGuardarAsignacion(e: React.FormEvent) {
    e.preventDefault();
    if (!materiaId || !docenteId) {
      alert("Por favor seleccione la materia y el profesor.");
      return;
    }

    setGuardandoAsignacion(true);
    setNotificacion(null);

    try {
      const resp = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_id: periodoId,
          subject_id: Number(materiaId),
          teacher_id: Number(docenteId),
          group_id: Number(grupoId),
          weekly_minutes: configuracionSesiones.minutos,
          requirements: configuracionSesiones.reqs,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.mensaje || "Error al crear la asignación académica.");
      }

      setNotificacion({
        tipo: "exito",
        texto: `Asignación de "${materiaActiva?.name}" (${configuracionSesiones.horas}h semanales) agregada correctamente.`,
      });

      await onAsignacionCreada();
      setModalAsignacionAbierto(false);
    } catch (err: any) {
      setNotificacion({ tipo: "error", texto: err.message });
    } finally {
      setGuardandoAsignacion(false);
    }
  }

  // Eliminar Asignación
  async function manejarEliminarAsignacion(id: number, nombreMateria: string) {
    if (!window.confirm(`¿Desea eliminar la asignación de "${nombreMateria}" del período actual?`)) {
      return;
    }

    setEliminandoId(id);
    setNotificacion(null);

    try {
      const resp = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.mensaje || "No se pudo eliminar la asignación.");
      }

      setNotificacion({
        tipo: "exito",
        texto: `Asignación de "${nombreMateria}" eliminada con éxito.`,
      });
      await onAsignacionCreada();
    } catch (err: any) {
      setNotificacion({ tipo: "error", texto: err.message });
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner de Feedback */}
      {notificacion && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex justify-between items-center shadow-xs transition-all ${
            notificacion.tipo === "exito"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notificacion.tipo === "exito" ? (
              <IconoCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <IconoAlerta className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notificacion.texto}</span>
          </div>
          <button onClick={() => setNotificacion(null)} className="text-xs font-bold opacity-60 hover:opacity-100 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Catálogo de Asignaciones Académicas</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de materias, docentes y distribución semanal para la planificación.
          </p>
        </div>
        <button
          onClick={() => setModalAsignacionAbierto(true)}
          className="py-2.5 px-5 rounded-full font-semibold text-xs transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white"
        >
          <IconoPlus className="w-3.5 h-3.5" />
          <span>+ Nueva Asignación</span>
        </button>
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
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {asignaciones.length > 0 ? (
                asignaciones.map((asig) => {
                  const horasSemanales = Math.round(asig.weekly_minutes / 60);
                  const grupoTexto = formatearNombreGrupo(asig.student_groups.name, asig.student_groups.code);
                  const estaEliminando = eliminandoId === asig.id;

                  return (
                    <tr key={asig.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{asig.subjects.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{asig.subjects.code}</div>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {asig.teachers.first_name} {asig.teachers.last_name}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          <IconoEstudiante className="w-3 h-3 text-slate-400" />
                          <span>{grupoTexto}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-800">
                          {horasSemanales} hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {asig.session_requirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px]">
                            <IconoReloj className="w-3 h-3 text-slate-400" />
                            <span>
                              {req.quantity} {req.quantity === 1 ? "sesión" : "sesiones"} de {Math.round(req.duration_minutes / 60)}h
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => manejarEliminarAsignacion(asig.id, asig.subjects.name)}
                          disabled={estaEliminando}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar Asignación"
                        >
                          <IconoBasura className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No hay asignaciones registradas para el período activo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: NUEVA ASIGNACIÓN (Estilo Imagen 2) ================= */}
      {montado && modalAsignacionAbierto && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 border border-slate-100 relative overflow-visible">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Nueva Asignación</h3>
                <p className="text-[11px] text-slate-500">Configura la materia, docente y grupo para el horario.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalAsignacionAbierto(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={manejarGuardarAsignacion} className="space-y-4 text-xs">
              {/* Selector Asignatura (Estilo Imagen 1) */}
              <SelectorBuscable
                etiqueta="Asignatura"
                placeholder="Escribe para buscar..."
                requerido
                items={listaMaterias.map((m) => ({
                  id: m.id,
                  titulo: m.name,
                  subtitulo: m.code ? `Código: ${m.code}` : undefined,
                }))}
                valorSeleccionadoId={materiaId}
                alSeleccionar={(id) => setMateriaId(id)}
                textoCrearNuevo="Nueva Asignatura"
                alCrearNuevo={() => setModalMateriaAbierto(true)}
              />

              {/* Selector Docente (Estilo Imagen 1) */}
              <SelectorBuscable
                etiqueta="Docente"
                placeholder="Escribe para buscar..."
                requerido
                items={listaDocentes.map((d) => {
                  const dias = d.teacher_availability?.map((a) => NOMBRES_DIAS[a.day_of_week]?.slice(0, 3)).join(", ");
                  return {
                    id: d.id,
                    titulo: `${d.first_name} ${d.last_name}`,
                    subtitulo: dias ? `Días: ${dias}` : "Disponibilidad completa",
                  };
                })}
                valorSeleccionadoId={docenteId}
                alSeleccionar={(id) => setDocenteId(id)}
                textoCrearNuevo="Nuevo Profesor"
                alCrearNuevo={() => setModalDocenteAbierto(true)}
              />

              {/* Selector Año Académico */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Año Académico <span className="text-rose-500">*</span>
                </label>
                <select
                  value={grupoId}
                  onChange={(e) => setGrupoId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-xs text-slate-800 font-medium outline-hidden transition-all"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {formatearNombreGrupo(g.name, g.code)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estructura de Clases */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Estructura de Clases Semanales
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x120", titulo: "4 horas semanales", sub: "2 clases de 2h" },
                    { id: "1x180", titulo: "3 horas semanales", sub: "1 clase de 3h" },
                    { id: "1x120", titulo: "2 horas semanales", sub: "1 clase de 2h" },
                    { id: "1x180_1x120", titulo: "5 horas semanales", sub: "1 de 3h + 1 de 2h" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTipoEstructura(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        tipoEstructura === opt.id
                          ? "border-slate-900 bg-slate-50 text-slate-900 shadow-2xs font-semibold"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.titulo}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumen en tiempo real */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                <span className="font-bold text-slate-900 truncate">
                  {materiaActiva?.name || "Sin Asignatura"}
                </span>
                <span className="text-slate-400">·</span>
                <span className="truncate">
                  {docenteActivo ? `${docenteActivo.first_name} ${docenteActivo.last_name}` : "Sin docente"}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-indigo-700 shrink-0">
                  {salonSugerido}
                </span>
              </div>

              {/* Botones estilo Imagen 2: Cancelar (blanco con borde) y Guardar (dark navy) */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAsignacionAbierto(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border border-slate-300 transition-all text-xs shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoAsignacion || !materiaId || !docenteId}
                  className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f172a] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 text-xs"
                >
                  {guardandoAsignacion ? "Guardando..." : "Guardar Asignación"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL: NUEVA ASIGNATURA (Estilo Imagen 2) ================= */}
      {montado && modalMateriaAbierto && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100000] w-screen h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Nueva Asignatura</h3>
              <button
                type="button"
                onClick={() => setModalMateriaAbierto(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={manejarGuardarMateria} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Nombre de la Asignatura <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Redes de Computadoras"
                  value={nuevaMateriaNombre}
                  onChange={(e) => setNuevaMateriaNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 font-medium outline-hidden transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Código <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. INF-305"
                    value={nuevaMateriaCodigo}
                    onChange={(e) => setNuevaMateriaCodigo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 font-medium outline-hidden transition-all placeholder:text-slate-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Créditos</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nuevaMateriaCreditos}
                    onChange={(e) => setNuevaMateriaCreditos(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 font-medium outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Botones estilo Imagen 2: Cancelar y Guardar */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMateriaAbierto(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border border-slate-300 transition-all text-xs shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoMateria}
                  className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f172a] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 text-xs"
                >
                  {guardandoMateria ? "Guardando..." : "Guardar Asignatura"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL: NUEVO PROFESOR (Estilo Imagen 2) ================= */}
      {montado && modalDocenteAbierto && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100000] w-screen h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Nuevo Profesor</h3>
                <p className="text-[11px] text-slate-500">Datos personales y configuración de disponibilidad horaria.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalDocenteAbierto(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={manejarGuardarDocente} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto"
                    value={nuevoDocenteNombre}
                    onChange={(e) => setNuevoDocenteNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 font-medium outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Apellido <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Silva"
                    value={nuevoDocenteApellido}
                    onChange={(e) => setNuevoDocenteApellido(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl text-slate-800 font-medium outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Disponibilidad Semanal */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Disponibilidad Semanal del Profesor
                  </span>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    {diasDisponibles.length} días seleccionados
                  </span>
                </div>

                {/* Días */}
                <div>
                  <label className="block font-semibold text-slate-600 mb-1.5 text-[11px]">Días de asistencia:</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {DIAS_SEMANA.map((dia) => {
                      const activo = diasDisponibles.includes(dia.id);
                      return (
                        <button
                          key={dia.id}
                          type="button"
                          onClick={() => {
                            if (activo) {
                              setDiasDisponibles((prev) => prev.filter((d) => d !== dia.id));
                            } else {
                              setDiasDisponibles((prev) => [...prev, dia.id].sort((a, b) => a - b));
                            }
                          }}
                          className={`py-1.5 rounded-lg text-center text-xs font-semibold border transition-all ${
                            activo
                              ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {dia.corto}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Franja horaria */}
                <div>
                  <label className="block font-semibold text-slate-600 mb-1.5 text-[11px]">Turno / Franja horaria:</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: "manana", nombre: "Mañana", desc: "8:00 AM - 1:00 PM" },
                      { id: "tarde", nombre: "Tarde", desc: "1:00 PM - 6:00 PM" },
                      { id: "completo", nombre: "Completa", desc: "8:00 AM - 6:00 PM" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFranjaHoraria(f.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          franjaHoraria === f.id
                            ? "border-slate-900 bg-white font-semibold text-slate-900 shadow-2xs"
                            : "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold">{f.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones estilo Imagen 2: Cancelar y Guardar */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDocenteAbierto(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border border-slate-300 transition-all text-xs shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoDocente}
                  className="px-6 py-2.5 bg-[#172554] hover:bg-[#0f172a] text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 text-xs"
                >
                  {guardandoDocente ? "Guardando..." : "Guardar Profesor"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
