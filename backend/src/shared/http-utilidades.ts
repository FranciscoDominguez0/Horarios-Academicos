export function obtenerParametroTexto(valor: unknown): string {
  if (Array.isArray(valor)) {
    return String(valor[0] ?? "");
  }
  return typeof valor === "string" ? valor : "";
}

export function obtenerParametroEntero(valor: unknown): number {
  const texto = obtenerParametroTexto(valor);
  const numero = parseInt(texto, 10);
  if (isNaN(numero)) {
    throw new Error(`El identificador "${texto}" no es un número entero válido.`);
  }
  return numero;
}
