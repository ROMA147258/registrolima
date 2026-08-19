import { ExcelExportService } from '../../infrastructure/external/ExcelExportService.js';

export class ExportRecordsUseCase {
  constructor(personeroRepository) {
    this.personeroRepo = personeroRepository;
  }

  async execute(format = 'xlsx', filterDistrict = null) {
    let records = await this.personeroRepo.getAllCombined();

    if (filterDistrict && filterDistrict !== 'all') {
      records = records.filter(r => {
        const d = String(r['Distrito Asignado'] || r['Distrito donde Vota'] || '').toLowerCase();
        return d === filterDistrict.toLowerCase();
      });
    }

    if (format === 'csv') {
      const csv = ExcelExportService.generateCsvBuffer(records);
      return {
        buffer: Buffer.from(csv, 'utf8'),
        contentType: 'text/csv; charset=utf-8',
        filename: `Padron_SomosPeru_2026_${Date.now()}.csv`
      };
    }

    const buffer = ExcelExportService.generateExcelBuffer(records);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Padron_SomosPeru_2026_${Date.now()}.xlsx`
    };
  }
}
