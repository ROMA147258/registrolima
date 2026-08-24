import { ExcelExportService } from '../../infrastructure/external/ExcelExportService.js';

export class ExportRecordsUseCase {
  constructor(personeroRepository) {
    this.personeroRepo = personeroRepository;
  }

  formatRecordForExport(r, index) {
    const data = r.toJSON ? r.toJSON() : r;
    const rawDate = data.fechaRegistro || data['Fecha de Registro'] || data.fecha_de_registro;
    let fechaFormatted = '';
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        fechaFormatted = d.toLocaleString('es-PE', { timeZone: 'America/Lima' });
      } else {
        fechaFormatted = String(rawDate);
      }
    }

    return {
      'Nº': index + 1,
      'Fecha de Registro': fechaFormatted,
      'Nombres y Apellidos': String(data.nombresApellidos || data['Nombres y Apellidos'] || data.nombres_y_apellidos || '').trim(),
      'DNI': String(data.dni || data['D.N.I.'] || data.DNI || '').trim(),
      'Clave de Acceso': String(data.claveAcceso || data['Clave de Acceso'] || data.clave_acceso || (String(data.rolADesempenar || '').toLowerCase().includes('distrito') ? '-' : 'Ingreso con DNI')).trim(),
      'Celular': String(data.celular || data.Celular || '').trim(),
      'Correo Electrónico': String(data.correoElectronico || data['Correo Electrónico'] || data.correo_electronico || '').trim(),
      'Usa WhatsApp en Celular': String(data.usaWhatsApp || data['Usa WhatsApp en su Celular'] || 'Sí').trim(),
      'Número WhatsApp Alterno': String(data.numeroWhatsAppAlterno || data['Número WhatsApp Alterno'] || data.numero_whatsapp_alterno || '-').trim(),
      'Distrito donde Vota': String(data.distritoDondeVota || data['Distrito donde Vota'] || data.distrito_donde_vota || '').trim(),
      'Mesa de Sufragio': String(data.mesaDeSufragio || data['Mesa de Sufragio'] || data.mesa_de_sufragio || '-').trim(),
      'Local de Votación': String(data.localDeVotacion || data['Local de Votación'] || data.local_de_votacion || '-').trim(),
      'Rol a Desempeñar': String(data.rolADesempenar || data['Rol a Desempeñar'] || data.rol_a_desempenar || '').trim(),
      'Distrito Asignado': String(data.distritoAsignado || data['Distrito Asignado'] || data.distrito_asignado || '').trim(),
      'Mesa Asignada': String(data.mesaAsignada || data['Mesa Asignada'] || data.mesa_asignada || '-').trim(),
      'Local de Votación Asignado': String(data.localDeVotacionAsignado || data['Local de Votación Asignado'] || data.local_de_votacion_asignado || '-').trim(),
      '¿Tiene Experiencia?': String(data.tieneExperiencia || data['Tiene Experiencia como Personero'] || data.tiene_experiencia_como_personero || 'No').trim(),
      '¿Movilidad Propia?': String(data.cuentaConMovilidad || data['Cuenta con Movilidad Propia'] || data.cuenta_con_movilidad_propia || 'No').trim(),
      'Compromiso 4 Octubre 2026': String(data.seCompromete || data['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] || data.se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones || 'Sí').trim(),
      'Videos Vistos (de 2)': parseInt(data.video || data.Video || 0, 10),
      'PDFs Leídos (de 2)': parseInt(data.pdf || data.PDF || 0, 10),
      'Evaluación': String(data.preguntas || data.Preguntas || 'Pendiente').trim(),
      'Estado Credencial': String(data.credenciales || data.Credenciales || 'Bloqueado').trim(),
      'Código Verificación': String(data.tokenVerificacion || data.Token || data.token_verificacion || '').trim()
    };
  }

  async execute(format = 'xlsx', filterDistrict = null) {
    let rawRecords = await this.personeroRepo.getAllCombined();

    // 1. Deduplicación estricta por DNI
    const uniqueMap = new Map();
    rawRecords.forEach(r => {
      const d = r.toJSON ? r.toJSON() : r;
      const dni = String(d.dni || d.DNI || d['D.N.I.'] || '').trim();
      if (dni && !uniqueMap.has(dni)) {
        uniqueMap.set(dni, r);
      }
    });
    let records = Array.from(uniqueMap.values());

    // 2. Filtro por distrito si se especifica
    if (filterDistrict && filterDistrict !== 'all') {
      records = records.filter(r => {
        const d = r.toJSON ? r.toJSON() : r;
        const dist = String(d.distritoAsignado || d['Distrito Asignado'] || d.distritoDondeVota || d['Distrito donde Vota'] || '').toLowerCase().trim();
        return dist === filterDistrict.toLowerCase().trim();
      });
    }

    // 3. Orden cronológico consistente: por Fecha de Registro (más recientes primero)
    records.sort((a, b) => {
      const da = a.toJSON ? a.toJSON() : a;
      const db = b.toJSON ? b.toJSON() : b;
      const dateA = new Date(da.fechaRegistro || da['Fecha de Registro'] || da.fecha_de_registro || 0).getTime();
      const dateB = new Date(db.fechaRegistro || db['Fecha de Registro'] || db.fecha_de_registro || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (Number(db.id || db.ID || 0)) - (Number(da.id || da.ID || 0));
    });

    const formattedRecords = records.map((r, i) => this.formatRecordForExport(r, i));

    if (format === 'csv') {
      const csv = ExcelExportService.generateCsvBuffer(formattedRecords);
      return {
        buffer: Buffer.from(csv, 'utf8'),
        contentType: 'text/csv; charset=utf-8',
        filename: `Padron_SomosPeru_2026_${Date.now()}.csv`
      };
    }

    const buffer = ExcelExportService.generateExcelBuffer(formattedRecords);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Padron_SomosPeru_2026_${Date.now()}.xlsx`
    };
  }
}
