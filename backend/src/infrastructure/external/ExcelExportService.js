import XLSX from 'xlsx-js-style';

export class ExcelExportService {
  /**
   * Genera un buffer de Excel con múltiples hojas personalizadas, encabezados celestes y estilos profesionales.
   * @param {Array<{ sheetName: string, data: Array<object> }>} sheets
   */
  static generateMultiSheetExcelBuffer(sheets) {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, data }) => {
      const rows = data || [];
      const worksheet = XLSX.utils.json_to_sheet(rows);

      if (rows.length > 0) {
        const keys = Object.keys(rows[0]);
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // 1. Estilo de los Encabezados (Fila 0): Celeste vibrante, texto blanco en negrita, centrado
        const headerStyle = {
          fill: {
            fgColor: { rgb: "0284C7" } // Celeste institucional Somos Perú
          },
          font: {
            name: "Calibri",
            sz: 11,
            bold: true,
            color: { rgb: "FFFFFF" }
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "0369A1" } },
            bottom: { style: "medium", color: { rgb: "0369A1" } },
            left: { style: "thin", color: { rgb: "0369A1" } },
            right: { style: "thin", color: { rgb: "0369A1" } }
          }
        };

        // Estilo para celdas de datos regulares
        const cellStyleRegular = {
          font: {
            name: "Calibri",
            sz: 10,
            color: { rgb: "0F172A" }
          },
          alignment: {
            vertical: "center"
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };

        // Estilo para celdas de fila TOTAL
        const totalRowStyle = {
          fill: {
            fgColor: { rgb: "E0F2FE" } // Celeste claro para totales
          },
          font: {
            name: "Calibri",
            sz: 10,
            bold: true,
            color: { rgb: "0369A1" }
          },
          alignment: {
            vertical: "center"
          },
          border: {
            top: { style: "medium", color: { rgb: "0284C7" } },
            bottom: { style: "medium", color: { rgb: "0284C7" } },
            left: { style: "thin", color: { rgb: "BAE6FD" } },
            right: { style: "thin", color: { rgb: "BAE6FD" } }
          }
        };

        // Aplicar estilos a cada celda de la hoja
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const isHeader = (R === range.s.r);
          
          // Verificar si es fila de TOTAL
          let isTotalRow = false;
          if (!isHeader) {
            const firstCellRef = XLSX.utils.encode_cell({ r: R, c: 0 });
            const firstCellVal = worksheet[firstCellRef] ? String(worksheet[firstCellRef].v).toUpperCase() : '';
            if (firstCellVal.includes('TOTAL') || firstCellVal === 'TOTALES') {
              isTotalRow = true;
            }
          }

          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) continue;

            if (isHeader) {
              worksheet[cellAddress].s = headerStyle;
            } else if (isTotalRow) {
              worksheet[cellAddress].s = totalRowStyle;
            } else {
              // Celdas de datos con formato limpio
              worksheet[cellAddress].s = {
                ...cellStyleRegular,
                alignment: {
                  ...cellStyleRegular.alignment,
                  // Centrar columnas cortas como Nº, DNI, Teléfono, Mesa, Cantidad
                  horizontal: (C === 0 || keys[C] === 'DNI' || keys[C] === 'Mesa Asignada' || keys[C] === 'Total Mesas' || keys[C] === 'Cantidad' || keys[C] === 'Faltan por Completar') ? "center" : "left"
                }
              };
            }
          }
        }

        // 2. Altura de filas (Header más alto para que luzca espacioso)
        worksheet['!rows'] = [
          { hpt: 28 }, // Fila de cabecera con altura generosa
        ];

        // 3. Ajuste automático del ancho de columnas para visualización óptima
        worksheet['!cols'] = keys.map(key => {
          let maxLen = key.length;
          rows.forEach(row => {
            const val = row[key];
            if (val !== null && val !== undefined) {
              const len = String(val).length;
              if (len > maxLen) maxLen = len;
            }
          });
          return { wch: Math.min(Math.max(maxLen + 4, 12), 65) };
        });
      }

      // Nombre seguro para la pestaña de Excel
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
