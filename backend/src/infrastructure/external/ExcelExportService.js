import * as XLSX from 'xlsx';

export class ExcelExportService {
  static generateExcelBuffer(data, sheetName = 'Registros Somos Perú 2026') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static generateCsvBuffer(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
