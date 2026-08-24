import * as XLSX from 'xlsx';

export class ExcelExportService {
  static generateExcelBuffer(data, sheetName = 'Padrón Somos Perú 2026') {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajuste automático del ancho de columnas para visualización óptima
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      worksheet['!cols'] = keys.map(key => {
        let maxLen = key.length;
        data.forEach(row => {
          const val = row[key];
          if (val !== null && val !== undefined) {
            const len = String(val).length;
            if (len > maxLen) maxLen = len;
          }
        });
        return { wch: Math.min(Math.max(maxLen + 4, 10), 60) };
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static generateCsvBuffer(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
