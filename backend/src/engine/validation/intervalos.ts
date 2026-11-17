/**
 * Utilidades matemáticas para el cálculo y verificación de intervalos de tiempo.
 * Todas las comparaciones se basan en minutos continuos desde medianoche.
 */

import { IntervaloTiempo } from "../types/dominio.js";

/**
 * Determina si dos intervalos de tiempo se solapan.
 * 
 * Regla matemática:
 * Dos intervalos A y B se solapan si y solo si:
 *   inicioA < finB Y finA > inicioB
 * 
 * Los intervalos adyacentes (que se tocan exactamente en el límite, ej. 08:00-10:00 y 10:00-12:00)
 * NO se consideran solapados.
 */
export function seSolapan(a: IntervaloTiempo, b: IntervaloTiempo): boolean {
  return a.inicioMinuto < b.finMinuto && a.finMinuto > b.inicioMinuto;
}

/**
 * Comprueba si un intervalo interior se encuentra completamente contenido dentro de otro exterior.
 * Ejemplo: la sesión debe estar completamente dentro de la disponibilidad docente.
 */
export function estaContenido(interior: IntervaloTiempo, exterior: IntervaloTiempo): boolean {
  return interior.inicioMinuto >= exterior.inicioMinuto && interior.finMinuto <= exterior.finMinuto;
}

/**
 * Convierte minutos desde la medianoche a una cadena con formato HH:mm.
 * Ejemplo: 480 -> "08:00", 750 -> "12:30".
 */
export function minutosAHoraTexto(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  const horasTexto = horas.toString().padStart(2, "0");
  const minsTexto = mins.toString().padStart(2, "0");
  return `${horasTexto}:${minsTexto}`;
}

/**
 * Convierte una cadena de texto en formato HH:mm a minutos desde la medianoche.
 * Ejemplo: "08:30" -> 510.
 */
export function horaTextoAMinutos(hora: string): number {
  const partes = hora.split(":");
  if (partes.length !== 2) {
    throw new Error(`Formato de hora inválido: "${hora}". Se esperaba "HH:mm".`);
  }
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);

  if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    throw new Error(`Valores de tiempo fuera de rango en: "${hora}".`);
  }

  return horas * 60 + minutos;
}
