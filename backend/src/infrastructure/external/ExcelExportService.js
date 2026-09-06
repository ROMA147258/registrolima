import * as XLSX from 'xlsx';

export class ExcelExportService {
  /**
   * Genera un buffer de Excel con múltiples hojas personalizadas.
   * @param {Array<{ sheetName: string, data: Array<object> }>} sheets
   */
  static generateMultiSheetExcelBuffer(sheets) {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, data }) => {
      const worksheet = XLSX.utils.json_to_sheet(data || []);

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
          return { wch: Math.min(Math.max(maxLen + 3, 10), 65) };
        });
      }

      // El nombre de la hoja en Excel no puede exceder 31 caracteres ni contener ciertos caracteres especiales
      const safeSheetName = (sheetName || 'Hoja')
        .replace(/[*?:/\\\[\]]/g, '')
        .substring(0, 31);

      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static generateExcelBuffer(data, sheetName = 'Padrón Somos Perú 2026') {
    return this.generateMultiSheetExcelBuffer([{ sheetName, data }]);
  }

  static generateCsvBuffer(data) {
    const worksheet = XLSX.utils.json_to_sheet(data || []);
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
