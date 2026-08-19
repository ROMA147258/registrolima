import { QrService } from '../../infrastructure/external/QrService.js';
import { config } from '../../config/env.js';

export class VerifyCredentialUseCase {
  constructor(personeroRepository, auditRepository) {
    this.personeroRepo = personeroRepository;
    this.auditRepo = auditRepository;
  }

  async execute(tokenOrDni, context = {}) {
    const cleanQuery = String(tokenOrDni || '').trim();
    if (!cleanQuery) throw new Error('Token o DNI de verificación es requerido.');

    const match = await this.personeroRepo.findByToken(cleanQuery);
    if (!match || !match.entity) {
      return {
        status: 'invalid',
        isValid: false,
        message: 'No se encontró ninguna acreditación oficial asociada al código o DNI consultado.'
      };
    }

    const entity = match.entity;
    const isAccredited = entity.credenciales === 'Confirmado' || (entity.video >= 2 && entity.pdf >= 2 && entity.preguntas === 'Aprobado');

    await this.auditRepo.log({
      action: 'PUBLIC_VERIFY',
      userIdentifier: entity.dni,
      role: entity.rolADesempenar,
      details: { token: cleanQuery, isAccredited },
      ipAddress: context.ip,
      userAgent: context.userAgent
    });

    const publicUrl = `${config.frontendUrl}/#verificar?dni=${entity.dni}&mesa=${encodeURIComponent(entity.mesaAsignada || '')}&distrito=${encodeURIComponent(entity.distritoAsignado || '')}&personero=${encodeURIComponent(entity.nombresApellidos)}&local=${encodeURIComponent(entity.localDeVotacionAsignado || '')}&rol=${encodeURIComponent(entity.rolADesempenar)}&folio=${encodeURIComponent(entity.tokenVerificacion)}`;

    const qrDataUrl = await QrService.generateQrDataUrl(publicUrl);

    return {
      status: 'success',
      isValid: true,
      isAccredited,
      data: {
        folio: entity.tokenVerificacion,
        dni: entity.dni,
        nombresApellidos: entity.nombresApellidos,
        rol: entity.rolADesempenar,
        distritoAsignado: entity.distritoAsignado,
        localAsignado: entity.localDeVotacionAsignado,
        mesaAsignada: entity.mesaAsignada,
        estadoCredencial: entity.credenciales,
        progreso: {
          video: entity.video,
          pdf: entity.pdf,
          preguntas: entity.preguntas
        },
        fechaRegistro: entity.fechaRegistro,
        qrCode: qrDataUrl,
        publicUrl
      }
    };
  }
}
