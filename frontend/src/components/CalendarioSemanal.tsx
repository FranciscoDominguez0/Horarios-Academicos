"use client";

import React from "react";

export interface SesionCalendario {
  id: string;
  diaSemana: number; // 1 = Lunes .. 5 = Viernes
  inicioMinuto: number;
  finMinuto: number;
  asignatura: string;
  docente: string;
  grupo: string;
}

interface PropiedadesCalendario {
  sesiones: SesionCalendario[];
  jornadaInicioMinuto?: number;
  jornadaFinMinuto?: number;
}

const DIAS = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
];

function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function CalendarioSemanal({
  sesiones,
  jornadaInicioMinuto = 420, // 07:00
  jornadaFinMinuto = 1080, // 18:00
}: PropiedadesCalendario) {
  const duracionTotalJornada = jornadaFinMinuto - jornadaInicioMinuto;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-lg">Calendario Semanal</h3>
        <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full">
          {sesiones.length} sesiones programadas
        </span>
      </div>

      <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-center font-medium text-xs text-slate-600">
        {DIAS.map((dia) => (
          <div key={dia.id} className="py-2.5 border-r last:border-r-0 border-slate-200">
            {dia.nombre}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 relative h-[560px] bg-slate-50/30">
        {DIAS.map((dia) => {
          const sesionesDelDia = sesiones.filter((s) => s.diaSemana === dia.id);

          return (
            <div
              key={dia.id}
              className="relative border-r last:border-r-0 border-slate-200 h-full p-1"
            >
              {sesionesDelDia.map((item) => {
                const topPorcentaje =
                  ((item.inicioMinuto - jornadaInicioMinuto) / duracionTotalJornada) * 100;
                const alturaPorcentaje =
                  ((item.finMinuto - item.inicioMinuto) / duracionTotalJornada) * 100;

                return (
                  <div
                    key={item.id}
                    style={{
                      top: `${Math.max(0, topPorcentaje)}%`,
                      height: `${Math.max(4, alturaPorcentaje)}%`,
                    }}
                    className="absolute left-1 right-1 rounded-lg p-2 bg-indigo-600 text-white shadow-sm border border-indigo-700 flex flex-col justify-between overflow-hidden text-xs transition-all hover:z-10 hover:shadow-md"
                  >
                    <div>
                      <p className="font-bold truncate">{item.asignatura}</p>
                      <p className="text-[10px] text-indigo-100 truncate">{item.docente}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-indigo-200 font-mono mt-1">
                      <span>{item.grupo}</span>
                      <span>
                        {formatearMinutos(item.inicioMinuto)} - {formatearMinutos(item.finMinuto)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
