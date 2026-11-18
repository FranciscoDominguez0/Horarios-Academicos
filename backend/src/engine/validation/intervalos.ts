import { IntervaloTiempo } from "../types/dominio.js";

export function seSolapan(a: IntervaloTiempo, b: IntervaloTiempo): boolean {
  return a.inicioMinuto < b.finMinuto && a.finMinuto > b.inicioMinuto;
}

export function estaContenido(interior: IntervaloTiempo, exterior: IntervaloTiempo): boolean {
  return interior.inicioMinuto >= exterior.inicioMinuto && interior.finMinuto <= exterior.finMinuto;
}

export function minutosAHoraTexto(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

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
