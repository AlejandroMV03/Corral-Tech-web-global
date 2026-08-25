// frontend/src/lib/sanitizer.ts

/**
 * Colapsa saltos dobles y múltiples espacios a uno solo.
 * Remueve espacios al inicio del texto.
 */
export const limpiarEspaciosYSaltos = (valor: string): string => {
  if (!valor) return "";
  return valor
    .replace(/[\r\n]+/g, " ")      // Convierte saltos de línea en un solo espacio
    .replace(/\s{2,}/g, " ")       // Convierte 2 o más espacios consecutivos en 1 solo
    .replace(/^\s+/, "");          // No permite iniciar con espacios
};

/**
 * Sanitiza Texto General (Nombres, Apellidos, Ranchos, Propietarios).
 * - Permite letras (con acentos/ñ), números y espacios.
 * - Remueve caracteres peligrosos: < > { } [ ] $ ; \ / " '
 * - Límite por defecto: 14 caracteres.
 */
export const sanitizarTexto = (valor: string, maxLen = 14): string => {
  if (!valor) return "";
  const soloValidos = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s._-]/g, "");
  return limpiarEspaciosYSaltos(soloValidos).slice(0, maxLen);
};

/**
 * Sanitiza Teléfonos / Valores Numéricos.
 * - Solo admite dígitos del 0 al 9.
 * - Límite: 14 dígitos máximo.
 */
export const sanitizarTelefono = (valor: string, maxLen = 14): string => {
  if (!valor) return "";
  return valor.replace(/[^0-9]/g, "").slice(0, maxLen);
};

/**
 * Sanitiza Usernames / Identificadores.
 * - Solo minúsculas, números, puntos y guiones bajos (sin espacios).
 * - Límite: 14 caracteres.
 */
export const sanitizarUsername = (valor: string, maxLen = 14): string => {
  if (!valor) return "";
  return valor
    .replace(/[^a-zA-Z0-9_.-]/g, "") // Ahora incluye A-Z
    .slice(0, maxLen);
};

/**
 * Sanitiza Coordenadas GPS (Latitud, Longitud).
 * - Solo números, puntos, comas, signos de menos y espacios.
 */
export const sanitizarCoordenadas = (valor: string, maxLen = 40): string => {
  if (!valor) return "";
  return valor.replace(/[^0-9.,\- ]/g, "").slice(0, maxLen);
};