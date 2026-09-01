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
    const rolNorm = rol.toLowerCase().trim();

    // 1. VALIDACIÓN: NOMBRES Y APELLIDOS NO DUPLICADOS
    const existingName = await this.personeroRepo.findByFullName(nombres);
    if (existingName && existingName.entity) {
      throw new Error(`La persona '${nombres}' ya se encuentra registrada en el sistema. No se permite duplicar registros.`);
    }

    // 2. VALIDACIÓN: DNI NO DUPLICADO
    const existingUser = await this.personeroRepo.findByDni(dni);
    if (existingUser && existingUser.entity) {
      throw new Error(`El DNI ${dni} ya se encuentra registrado en el sistema como ${existingUser.entity.rolADesempenar || 'registrado'}. No se permite duplicar el registro.`);
    }

    // 3. VALIDACIÓN: CELULAR NO DUPLICADO
    if (celular) {
      const existingPhone = await this.personeroRepo.findByPhone(celular);
      if (existingPhone && existingPhone.entity) {
        throw new Error(`El número de celular ${celular} ya se encuentra registrado en el sistema.`);
      }
    }

    // 4. VALIDACIÓN: CORREO ELECTRÓNICO NO DUPLICADO
    if (correo) {
      const existingEmail = await this.personeroRepo.findByEmail(correo);
      if (existingEmail && existingEmail.entity) {
        throw new Error(`El correo electrónico '${correo}' ya se encuentra registrado en el sistema.`);
      }
    }

    // 5. VALIDACIÓN: NÚMERO WHATSAPP ALTERNATIVO NO DUPLICADO
    if (numWsAlt && numWsAlt !== 'Mismo número') {
      const existingWs = await this.personeroRepo.findByWhatsapp(numWsAlt);
      if (existingWs && existingWs.entity) {
        throw new Error(`El número de WhatsApp alternativo ${numWsAlt} ya se encuentra registrado en el sistema.`);
      }
    }

    // 6. VALIDACIONES DE CUPO SEGÚN EL ROL SELECCIONADO
    if (rolNorm.includes('zonal') || rolNorm.includes('zona')) {
      // Coordinador Zonal: Validación de colegios asignados (no duplicar colegios en el mismo distrito)
      if (!localAsig || localAsig.trim() === '' || localAsig.toLowerCase() === 'no aplica') {
        throw new Error('Debe seleccionar al menos un colegio o local de votación asignado.');
      }
      if (distAsig) {
        const assignedLocales = await this.personeroRepo.getAssignedLocalesByDistrito(distAsig);
        const selectedSchools = String(localAsig).split(',').map(s => s.trim()).filter(Boolean);
        for (const sch of selectedSchools) {
          const isTaken = assignedLocales.some(al => al.toLowerCase() === sch.toLowerCase());
          if (isTaken) {
            throw new Error(`El colegio '${sch}' ya se encuentra asignado a otro Coordinador Zonal en ${distAsig}.`);
          }
        }
      }
    } else if (rolNorm.includes('distrito') || rolNorm.includes('distrital')) {
      // Coordinador Distrital: Máximo 1 usuario por distrito asignado
      if (distAsig) {
        const countDist = await this.personeroRepo.countCoordinadoresDistritales(distAsig);
        if (countDist >= 1) {
          throw new Error(`El distrito de '${distAsig}' ya cuenta con un Coordinador Distrital asignado. Solo se permite 1 usuario por distrito asignado.`);
        }
      }
    } else if (rolNorm.includes('coordinador') || rolNorm.includes('local')) {
      // Personero de Local de Votación: Máximo 2 por cada colegio
      if (distAsig && localAsig && localAsig.toLowerCase() !== 'no aplica') {
        const countLocal = await this.personeroRepo.countCoordinadoresByLocal(distAsig, localAsig);
        if (countLocal >= 2) {
          throw new Error(`Cupo lleno: El colegio '${localAsig}' en ${distAsig} ya cuenta con 2 Personeros de Local de Votación asignados.`);
        }
      }
    } else {
      // Personero de Mesa: No se debe repetir 2 veces (máximo 1 personero por mesa)
      if (mesaAsig && mesaAsig !== '-' && mesaAsig.toLowerCase() !== 'no aplica') {
        const countMesa = await this.personeroRepo.countPersonerosByMesa(mesaAsig);
        if (countMesa >= 1) {
          throw new Error(`La mesa de sufragio Nº ${mesaAsig} ya se encuentra asignada a otro personero. No se permite duplicar asignación en la misma mesa.`);
        }
      }
    }

    let claveAcceso = rawData.clave_acceso || rawData.claveAcceso || rawData['Clave de Acceso'] || null;
    if (rolNorm.includes('distrito') || rolNorm.includes('distrital')) {
      if (!claveAcceso) {
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        claveAcceso = `SP${rand4}`;
      } else {
        claveAcceso = String(claveAcceso).replace(/-/g, '').trim();
      }
    }

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
      tokenVerificacion: `SP-LM2026-${dni}`,
      claveAcceso
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
      message: 'Registro electoral completado exitosamente.',
      data: saved?.entity || saved
    };
  }
}
