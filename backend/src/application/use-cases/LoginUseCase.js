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

    // 1. Verificación Inmediata de Administrador (eric / eric123 o admin / admin123)
    if (
      (cleanUser === 'eric' && (cleanPass === 'eric123' || cleanPass === 'admin123')) ||
      (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'eric123')) ||
      (cleanUser === config.admin.username.toLowerCase() && cleanPass === config.admin.password) ||
      (cleanUser === config.admin.ericUsername.toLowerCase() && cleanPass === config.admin.ericPassword)
    ) {
      const token = jwt.sign(
        { username: cleanUser, role: ROLES.SUPERADMIN, name: cleanUser === 'eric' ? 'Eric' : 'Administrador' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      try {
        await this.auditRepo?.log({
          action: 'LOGIN_ADMIN',
          userIdentifier: cleanUser,
          role: ROLES.SUPERADMIN,
          details: { username: cleanUser },
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
          fullName: cleanUser === 'eric' ? 'Eric - Coordinador Central' : 'Administrador General',
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
        const isCoordLocal = !isCoordDistrital && (tblName.includes('coord') || rolLower.includes('coordinador') || rolLower.includes('local'));
        const isCoord = isCoordDistrital || isCoordLocal;
        const userRole = isCoord ? ROLES.COORDINADOR : ROLES.PERSONERO_REGISTRADO;
        const distAsig = entity.distritoAsignado || entity.distritoDondeVota || '';
        const localAsig = entity.localDeVotacionAsignado || entity.localDeVotacion || '';

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
            isCoordinadorLocal: isCoordLocal
          }
        };
      }
    } catch (err) {
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
          const isCoordLocal = !isCoordDistrital && (tblName.includes('coord') || rolLower.includes('coordinador') || rolLower.includes('local'));
          const isCoord = isCoordDistrital || isCoordLocal;
          const userRole = isCoord ? ROLES.COORDINADOR : ROLES.PERSONERO_REGISTRADO;
          const distAsig = entity.distritoAsignado || entity.distritoDondeVota || '';
          const localAsig = entity.localDeVotacionAsignado || entity.localDeVotacion || '';

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
