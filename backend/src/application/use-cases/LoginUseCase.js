import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { ROLES } from '../../config/constants.js';

export class LoginUseCase {
  constructor(personeroRepository, userRepository, auditRepository) {
    this.personeroRepo = personeroRepository;
    this.userRepo = userRepository;
    this.auditRepo = auditRepository;
  }

  async execute({ username, password, dni, fullName }, context = {}) {
    const rawUser = String(username || fullName || '').trim();
    const cleanUser = rawUser.toLowerCase();
    const cleanPass = String(password || '').trim();
    const cleanDni = String(dni || (/^\d{7,9}$/.test(cleanPass) ? cleanPass : (/^\d{7,9}$/.test(cleanUser) ? cleanUser : ''))).trim();

    // 1. Verificación Inmediata de Superadministradores (eric, paola, susana, admin)
    const superadmins = {
      eric: {
        passwords: ['eric123', 'admin123', config.admin.ericPassword, config.admin.password].filter(Boolean),
        displayName: 'Eric - Coordinador Central'
      },
      paola: {
        passwords: ['pao123$', config.admin.paolaPassword].filter(Boolean),
        displayName: 'Paola - Superadministradora'
      },
      susana: {
        passwords: ['susan456&', config.admin.susanaPassword].filter(Boolean),
        displayName: 'Susana - Superadministradora'
      },
      admin: {
        passwords: ['admin123', 'eric123', config.admin.password].filter(Boolean),
        displayName: 'Administrador General'
      }
    };

    if (superadmins[cleanUser] && superadmins[cleanUser].passwords.includes(cleanPass)) {
      const superadminData = superadmins[cleanUser];
      const token = jwt.sign(
        { username: cleanUser, role: ROLES.SUPERADMIN, name: superadminData.displayName },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      try {
        await this.auditRepo?.log({
          action: 'LOGIN_ADMIN',
          userIdentifier: cleanUser,
          role: ROLES.SUPERADMIN,
          details: { username: cleanUser, name: superadminData.displayName },
          ipAddress: context.ip,
          userAgent: context.userAgent
        });
      } catch (e) {}

      return {
        status: 'success',
        role: ROLES.SUPERADMIN,
        token,
        user: {
          username: cleanUser,
          fullName: superadminData.displayName,
          'Nombres y Apellidos': superadminData.displayName,
          'Rol a Desempeñar': 'Superadministrador',
          role: ROLES.SUPERADMIN
        }
      };
    }

    // 2. Verificación de Personeros y Coordinadores en dbo.Rpersoneros y dbo.Rcoordinadores
    try {
      const match = await this.personeroRepo.findByCredentials(rawUser, cleanPass || cleanDni);
      if (match && match.entity) {
        const entity = match.entity;
        const tblName = String(match.tableName || '').toLowerCase();
        const rolLower = String(entity.rolADesempenar || '').toLowerCase();
        const isCoordDistrital = tblName.includes('coordinadoresd') || tblName.includes('coodinadoresd') || rolLower.includes('distrito') || rolLower.includes('distrital');
        const isCoordZonal = !isCoordDistrital && (tblName.includes('coordinadorz') || tblName.includes('coordinadoresz') || rolLower.includes('zonal') || rolLower.includes('zona'));
        const isCoordLocal = !isCoordDistrital && !isCoordZonal && (tblName.includes('coord') || rolLower.includes('coordinador') || rolLower.includes('local'));
        const isCoord = isCoordDistrital || isCoordZonal || isCoordLocal;
        const userRole = isCoord ? ROLES.COORDINADOR : ROLES.PERSONERO_REGISTRADO;
        const distAsig = entity.distritoAsignado || entity.distritoDondeVota || '';
        const localAsig = entity.localDeVotacionAsignado || entity.localDeVotacion || '';

        if (isCoordDistrital) {
          const expectedKey = String(entity.claveAcceso || entity['Clave de Acceso'] || '').replace(/[-\s]/g, '').trim();
          if (expectedKey) {
            const userPassClean = cleanPass.replace(/[-\s]/g, '').toUpperCase();
            if (userPassClean !== expectedKey.toUpperCase()) {
              throw new Error('Contraseña incorrecta. El Coordinador Distrital debe ingresar con su clave asignada.');
            }
          }
        }

        const token = jwt.sign(
          { dni: entity.dni, role: userRole, name: entity.nombresApellidos, distrito: distAsig, local: localAsig },
          config.jwt.secret,
          { expiresIn: config.jwt.expiresIn }
        );

        try {
          await this.auditRepo?.log({
            action: isCoord ? 'LOGIN_COORDINADOR' : 'LOGIN_PERSONERO',
            userIdentifier: entity.dni,
            role: entity.rolADesempenar,
            details: { dni: entity.dni, nombres: entity.nombresApellidos, rol: entity.rolADesempenar, distritoAsignado: distAsig, localAsignado: localAsig },
            ipAddress: context.ip,
            userAgent: context.userAgent
          });
        } catch {}

        return {
          status: 'success',
          role: userRole,
          token,
          user: {
            'ID': entity.id,
            'Nombres y Apellidos': entity.nombresApellidos,
            'D.N.I.': entity.dni,
            'Clave de Acceso': entity.claveAcceso || '',
            'Celular': entity.celular,
            'Correo Electrónico': entity.correoElectronico,
            'Distrito donde Vota': entity.distritoDondeVota,
            'Mesa de Sufragio': entity.mesaDeSufragio,
            'Local de Votación': entity.localDeVotacion,
            'Rol a Desempeñar': entity.rolADesempenar,
            'Distrito Asignado': distAsig,
            'Mesa Asignada': entity.mesaAsignada,
            'Local de Votación Asignado': localAsig,
            'Tiene Experiencia como Personero': entity.tieneExperiencia,
            'Cuenta con Movilidad Propia': entity.cuentaConMovilidad,
            'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': entity.seCompromete,
            'Video': entity.video,
            'PDF': entity.pdf,
            'Preguntas': entity.preguntas,
            'Credenciales': entity.credenciales,
            'Token': entity.tokenVerificacion,
            id: entity.id,
            username: entity.dni,
            fullName: entity.nombresApellidos,
            role: userRole,
            distritoAsignado: distAsig,
            localAsignado: localAsig,
            isCoordinador: isCoord,
            isCoordinadorDistrital: isCoordDistrital,
            isCoordinadorZonal: isCoordZonal,
            isCoordinadorLocal: isCoordLocal
          }
        };
      }
    } catch (err) {
      if (err.message && (err.message.includes('Coordinador Distrital') || err.message.includes('Coordinador de Distritos'))) {
        throw err;
      }
      console.error('Error buscando personero/coordinador en base de datos:', err);
    }

    // 3. Verificación adicional por DNI exacto
    if (cleanDni) {
      try {
        const match = await this.personeroRepo.findByDni(cleanDni);
        if (match && match.entity) {
          const entity = match.entity;
          const tblName = String(match.tableName || '').toLowerCase();
          const rolLower = String(entity.rolADesempenar || '').toLowerCase();
          const isCoordDistrital = tblName.includes('coordinadoresd') || tblName.includes('coodinadoresd') || rolLower.includes('distrito') || rolLower.includes('distrital');
          const isCoordZonal = !isCoordDistrital && (tblName.includes('coordinadorz') || tblName.includes('coordinadoresz') || rolLower.includes('zonal') || rolLower.includes('zona'));
          const isCoordLocal = !isCoordDistrital && !isCoordZonal && (tblName.includes('coord') || rolLower.includes('coordinador') || rolLower.includes('local'));
          const isCoord = isCoordDistrital || isCoordZonal || isCoordLocal;
          const userRole = isCoord ? ROLES.COORDINADOR : ROLES.PERSONERO_REGISTRADO;
          const distAsig = entity.distritoAsignado || entity.distritoDondeVota || '';
          const localAsig = entity.localDeVotacionAsignado || entity.localDeVotacion || '';

          if (isCoordDistrital) {
            const expectedKey = String(entity.claveAcceso || entity['Clave de Acceso'] || '').replace(/[-\s]/g, '').trim();
            if (expectedKey) {
              const userPassClean = cleanPass.replace(/[-\s]/g, '').toUpperCase();
              if (userPassClean !== expectedKey.toUpperCase()) {
                throw new Error('Contraseña incorrecta. El Coordinador Distrital debe ingresar con su clave asignada.');
              }
            }
          }

          const token = jwt.sign(
            { dni: entity.dni, role: userRole, name: entity.nombresApellidos, distrito: distAsig, local: localAsig },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );

          return {
            status: 'success',
            role: userRole,
            token,
            user: {
              'ID': entity.id,
              'Nombres y Apellidos': entity.nombresApellidos,
              'D.N.I.': entity.dni,
              'Celular': entity.celular,
              'Correo Electrónico': entity.correoElectronico,
              'Distrito donde Vota': entity.distritoDondeVota,
              'Mesa de Sufragio': entity.mesaDeSufragio,
              'Local de Votación': entity.localDeVotacion,
              'Rol a Desempeñar': entity.rolADesempenar,
              'Distrito Asignado': distAsig,
              'Mesa Asignada': entity.mesaAsignada,
              'Local de Votación Asignado': localAsig,
              'Tiene Experiencia como Personero': entity.tieneExperiencia,
              'Cuenta con Movilidad Propia': entity.cuentaConMovilidad,
              'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': entity.seCompromete,
              'Video': entity.video,
              'PDF': entity.pdf,
              'Preguntas': entity.preguntas,
              'Credenciales': entity.credenciales,
              'Token': entity.tokenVerificacion,
              id: entity.id,
              username: entity.dni,
              fullName: entity.nombresApellidos,
              role: userRole,
              distritoAsignado: distAsig,
              localAsignado: localAsig,
              isCoordinador: isCoord,
              isCoordinadorDistrital: isCoordDistrital,
              isCoordinadorZonal: isCoordZonal,
              isCoordinadorLocal: isCoordLocal
            }
          };
        }
      } catch (err) {}
    }

    // 4. Verificación en tabla dbo.Usuarios
    if (cleanUser && cleanPass) {
      try {
        const dbUser = await this.userRepo.findByUsername(cleanUser);
        if (dbUser) {
          const token = jwt.sign(
            { id: dbUser.id, username: dbUser.username, role: dbUser.role, name: dbUser.fullName },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );

          return {
            status: 'success',
            role: dbUser.role,
            token,
            user: {
              id: dbUser.id,
              username: dbUser.username,
              fullName: dbUser.fullName,
              role: dbUser.role
            }
          };
        }
      } catch (err) {}
    }

    throw new Error('Credenciales incorrectas. Verifique su Nombre/Usuario y DNI/Contraseña.');
  }
}
