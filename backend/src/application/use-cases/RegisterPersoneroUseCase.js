import { Personero } from '../../domain/entities/Personero.js';
import { Coordinador } from '../../domain/entities/Coordinador.js';
import { ValidationDomainService } from '../../domain/services/ValidationDomainService.js';

export class RegisterPersoneroUseCase {
  constructor(personeroRepository, auditRepository) {
    this.personeroRepo = personeroRepository;
    this.auditRepo = auditRepository;
  }

  async execute(rawData, context = {}) {
    const validated = ValidationDomainService.validateRegistrationPayload(rawData);

    const nombres = (rawData.nombres_apellidos || rawData['Nombres y Apellidos'] || '').trim();
    const dni = validated.dni;
    const celular = validated.phone;
    const correo = validated.email;
    const usaWs = rawData.usa_whatsapp || rawData['¿Usa WhatsApp en su celular?'] || 'Sí';
    const numWsAlt = rawData.numero_whatsapp_alterno || rawData['Número WhatsApp Alterno'] || null;
    const distVota = rawData.distrito_vota || rawData['Distrito donde Vota'] || null;
    const mesaVota = rawData.mesa_vota || rawData['Mesa de Sufragio'] || null;
    const localVota = rawData.local_vota || rawData['Local de Votación'] || null;
    const rol = rawData.rol_electoral || rawData['Rol a Desempeñar'] || 'Personero de Mesa';
    const distAsig = rawData.distrito_asignado || rawData['Distrito Asignado'] || distVota;
    const mesaAsig = rawData.mesa_asignada || rawData['Mesa Asignada'] || mesaVota;
    const localAsig = rawData.local_asignado || rawData['Local de Votación Asignado'] || localVota;
    const exp = rawData.tiene_experiencia || rawData['¿Tiene Experiencia como Personero?'] || 'No';
    const mov = rawData.cuenta_movilidad || rawData['¿Cuenta con Movilidad Propia?'] || 'No';
    const comp = rawData.se_compromete || rawData['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?'] || 'Sí';

    const isCoordinador = rol.toLowerCase().includes('coordinador');

    const entityProps = {
      nombresApellidos: nombres,
      dni,
      celular,
      correoElectronico: correo,
      usaWhatsApp: usaWs,
      numeroWhatsAppAlterno: numWsAlt,
      distritoDondeVota: distVota,
      mesaDeSufragio: mesaVota,
      localDeVotacion: localVota,
      rolADesempenar: rol,
      distritoAsignado: distAsig,
      mesaAsignada: mesaAsig,
      localDeVotacionAsignado: localAsig,
      tieneExperiencia: exp,
      cuentaConMovilidad: mov,
      seCompromete: comp,
      video: 0,
      pdf: 0,
      preguntas: 'Pendiente',
      credenciales: 'Bloqueado',
      tokenVerificacion: `SP-LM2026-${dni}`
    };

    const entity = isCoordinador ? new Coordinador(entityProps) : new Personero(entityProps);
    const saved = await this.personeroRepo.save(entity, isCoordinador);

    if (this.auditRepo && typeof this.auditRepo.log === 'function') {
      try {
        await this.auditRepo.log({
          action: 'REGISTER',
          userIdentifier: dni,
          role: rol,
          details: { nombres, dni, rol, distritoAsignado: distAsig },
          ipAddress: context.ip,
          userAgent: context.userAgent
        });
      } catch (e) {
        console.warn('Aviso al auditar registro:', e.message);
      }
    }

    return {
      status: 'success',
      message: 'Registro electoral completado exitosamente en SQL Server.',
      data: saved.entity
    };
  }
}
