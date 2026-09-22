import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { ROLES } from '../../config/constants.js';
import { bloomFilterService } from '../../infrastructure/cache/RegistrationBloomFilterService.js';

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

    // 1. Verificación Inmediata de Superadministradores (supera, admin, eric, paola, pola, susana)
    const superadmins = {
      supera: {
        passwords: ['abcde12345', 'admin123', config.admin.password].filter(Boolean),
        displayName: 'Superadministrador Principal'
      },
      admin: {
        passwords: ['abcde12345', 'admin123', config.admin.password].filter(Boolean),
        displayName: 'Superadministrador Principal'
      },
      eric: {
        passwords: ['eric123', 'admin123', config.admin.ericPassword].filter(Boolean),
        displayName: 'Eric - Coordinador Central'
      },
      paola: {
        passwords: ['pao123*', 'pao123$', 'pola123', config.admin.paolaPassword].filter(Boolean),
        displayName: 'Paola - Superadministradora'
      },
      pola: {
        passwords: ['pao123*', 'pao123$', 'pola123', config.admin.paolaPassword].filter(Boolean),
        displayName: 'Pola - Superadministradora'
      },
      susana: {
        passwords: ['susan456&', 'susana123', config.admin.susanaPassword].filter(Boolean),
        displayName: 'Susana - Superadministradora'
      }
    };

    if (superadmins[cleanUser]) {
      if (superadmins[cleanUser].passwords.includes(cleanPass)) {
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
      } else {
        throw new Error('Credenciales incorrectas o contraseña de administrador inválida.');
      }
    }

    if (!cleanPass) {
      throw new Error('Por favor ingrese su contraseña o DNI para ingresar.');
    }

    if (!rawUser) {
      throw new Error('Por favor ingrese su nombre completo o DNI para ingresar.');
    }

    // 2. Pre-filtro Bloom Filter ultra-rápido para descartar usuarios inexistentes en 0.001ms
    if (
      !bloomFilterService.mightContainUser(rawUser) &&
      !bloomFilterService.mightContainDni(cleanDni) &&
      !bloomFilterService.mightContainName(rawUser) &&
      !bloomFilterService.mightContainUser(cleanPass)
    ) {
      throw new Error('Credenciales incorrectas o usuario no encontrado en el padrón electoral.');
    }

    // 3. Verificación de Personeros y Coordinadores en PostgreSQL
    try {
      const match = await this.personeroRepo.findByCredentials(rawUser, cleanPass);
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

        // Doble verificación estricta de contraseña: DNI o Clave de Acceso
        const userPassClean = cleanPass.replace(/[-\s]/g, '').toLowerCase();
        const entityDniClean = String(entity.dni || '').replace(/[-\s]/g, '').toLowerCase();
        const entityKeyClean = String(entity.claveAcceso || entity['Clave de Acceso'] || '').replace(/[-\s]/g, '').toLowerCase();

        const passMatchesDni = Boolean(userPassClean && entityDniClean && userPassClean === entityDniClean);
        const passMatchesKey = Boolean(userPassClean && entityKeyClean && userPassClean === entityKeyClean);

        if (!passMatchesDni && !passMatchesKey) {
          throw new Error('Contraseña o DNI incorrecto. Verifique sus credenciales.');
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
      if (err.message && (err.message.includes('Contraseña') || err.message.includes('Credenciales'))) {
        throw err;
      }
      console.error('Error buscando personero/coordinador en base de datos:', err);
    }

    // 4. Verificación en tabla dbo.Usuarios (si aplica)
    if (this.userRepo) {
      try {
        const dbUser = await this.userRepo.findByUsername(cleanUser);
        if (dbUser) {
          const passMatches = (dbUser.password && dbUser.password === cleanPass) || (dbUser.dni && String(dbUser.dni).trim() === cleanPass);
          if (passMatches) {
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
        }
      } catch (err) {}
    }

    throw new Error('Credenciales incorrectas. Verifique su Nombre/DNI y su Contraseña o DNI.');
  }
}
