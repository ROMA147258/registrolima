/**
 * Función de exportación a Excel inhabilitada para todos los roles
 */
export function exportPadronToExcel() {
  console.warn('La función de descarga de Excel está inhabilitada temporalmente para todos los usuarios.');
  return Promise.resolve(false);
}
