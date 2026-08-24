import { dbPool } from '../database/ConnectionPool.js';
import { Personero } from '../../domain/entities/Personero.js';
import { Coordinador } from '../../domain/entities/Coordinador.js';

export class PostgresPersoneroRepository {
  async ensureTablesExist() {
    try {
      const pool = await dbPool.getPool();

      // 1. Tabla rpersoneros
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rpersoneros (
          id SERIAL PRIMARY KEY,
          fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          nombres_y_apellidos VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL UNIQUE,
          celular VARCHAR(50),
          correo_electronico VARCHAR(255),
          usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
          numero_whatsapp_alterno VARCHAR(50),
          distrito_donde_vota VARCHAR(100),
          mesa_de_sufragio VARCHAR(50),
          local_de_votacion VARCHAR(255),
          rol_a_desempenar VARCHAR(100) DEFAULT 'Personero de Mesa',
          distrito_asignado VARCHAR(100),
          mesa_asignada VARCHAR(50) DEFAULT '-',
          local_de_votacion_asignado VARCHAR(255),
          tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
          cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
          se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
          video INT DEFAULT 0,
          pdf INT DEFAULT 0,
          preguntas VARCHAR(50) DEFAULT 'Pendiente',
          credenciales VARCHAR(50) DEFAULT 'Bloqueado',
          token_verificacion VARCHAR(100)
        );
      `);

      // 2. Tabla rcoordinadores (Coordinador de Local)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rcoordinadores (
          id SERIAL PRIMARY KEY,
          fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          nombres_y_apellidos VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL UNIQUE,
          celular VARCHAR(50),
          correo_electronico VARCHAR(255),
          usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
          numero_whatsapp_alterno VARCHAR(50),
          distrito_donde_vota VARCHAR(100),
          mesa_de_sufragio VARCHAR(50),
          local_de_votacion VARCHAR(255),
          rol_a_desempenar VARCHAR(100) DEFAULT 'Coordinador de Local',
          distrito_asignado VARCHAR(100),
          mesa_asignada VARCHAR(50) DEFAULT 'No aplica',
          local_de_votacion_asignado VARCHAR(255),
          tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
          cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
          se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
          video INT DEFAULT 0,
          pdf INT DEFAULT 0,
          preguntas VARCHAR(50) DEFAULT 'Pendiente',
          credenciales VARCHAR(50) DEFAULT 'Bloqueado',
          token_verificacion VARCHAR(100)
        );
      `);

      // 3. Tabla rcoordinadoresd (Coordinador de Distritos)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rcoordinadoresd (
          id SERIAL PRIMARY KEY,
          fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          nombres_y_apellidos VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL UNIQUE,
          celular VARCHAR(50),
          correo_electronico VARCHAR(255),
          usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
          numero_whatsapp_alterno VARCHAR(50),
          distrito_donde_vota VARCHAR(100),
          mesa_de_sufragio VARCHAR(50),
          local_de_votacion VARCHAR(255),
          rol_a_desempenar VARCHAR(100) DEFAULT 'Coordinador de Distritos',
          distrito_asignado VARCHAR(100),
          mesa_asignada VARCHAR(50) DEFAULT 'No aplica',
          local_de_votacion_asignado VARCHAR(255) DEFAULT 'No aplica',
          tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
          cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
          se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
          video INT DEFAULT 0,
          pdf INT DEFAULT 0,
          preguntas VARCHAR(50) DEFAULT 'Pendiente',
          credenciales VARCHAR(50) DEFAULT 'Bloqueado',
          token_verificacion VARCHAR(100)
        );
      `);

      // 4. Tablas rcoordinadoresz y rcoordinadorz (Coordinador Zonal)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rcoordinadoresz (
          id SERIAL PRIMARY KEY,
          fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          nombres_y_apellidos VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL UNIQUE,
          celular VARCHAR(50),
          correo_electronico VARCHAR(255),
          usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
          numero_whatsapp_alterno VARCHAR(50),
          distrito_donde_vota VARCHAR(100),
          mesa_de_sufragio VARCHAR(50),
          local_de_votacion VARCHAR(255),
          rol_a_desempenar VARCHAR(100) DEFAULT 'Coordinador Zonal',
          distrito_asignado VARCHAR(100),
          mesa_asignada VARCHAR(50) DEFAULT 'No aplica',
          local_de_votacion_asignado TEXT,
          tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
          cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
          se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
          video INT DEFAULT 0,
          pdf INT DEFAULT 0,
          preguntas VARCHAR(50) DEFAULT 'Pendiente',
          credenciales VARCHAR(50) DEFAULT 'Bloqueado',
          token_verificacion VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS rcoordinadorz (
          id SERIAL PRIMARY KEY,
          fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          nombres_y_apellidos VARCHAR(255) NOT NULL,
          dni VARCHAR(20) NOT NULL UNIQUE,
          celular VARCHAR(50),
          correo_electronico VARCHAR(255),
          usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
          numero_whatsapp_alterno VARCHAR(50),
          distrito_donde_vota VARCHAR(100),
          mesa_de_sufragio VARCHAR(50),
          local_de_votacion VARCHAR(255),
          rol_a_desempenar VARCHAR(100) DEFAULT 'Coordinador Zonal',
          distrito_asignado VARCHAR(100),
          mesa_asignada VARCHAR(50) DEFAULT 'No aplica',
          local_de_votacion_asignado TEXT,
          tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
          cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
          se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
          video INT DEFAULT 0,
          pdf INT DEFAULT 0,
          preguntas VARCHAR(50) DEFAULT 'Pendiente',
          credenciales VARCHAR(50) DEFAULT 'Bloqueado',
          token_verificacion VARCHAR(100)
        );
      `);
    } catch (err) {
      console.warn('Advertencia asegurando tablas de PostgreSQL:', err.message);
    }
  }

  mapRowToEntity(row, isCoordinador = false) {
    if (!row) return null;
    const rolVal = row.rol_a_desempenar || row.rol_desempenar || row.rol || row['Rol a Desempeñar'];
    const isActuallyCoord = isCoordinador || (rolVal && rolVal.toLowerCase().includes('coordinador'));

    const rawPreguntas = String(row.preguntas ?? row.evaluacion_estado ?? row.evaluacion ?? row['Preguntas'] ?? row['Evaluación Estado'] ?? 'Pendiente').trim();
    const rawCredenciales = String(row.credenciales ?? row.estado_credencial ?? row.estado ?? row['Credenciales'] ?? row['Estado Credencial'] ?? 'Bloqueado').trim();
    const videoVal = parseInt(row.video ?? row.videos_completados ?? row.videos ?? row['Video'] ?? row['Videos Completados'] ?? 0, 10);
    const pdfVal = parseInt(row.pdf ?? row.pdfs_completados ?? row.pdfs ?? row['PDF'] ?? row['PDFs Completados'] ?? 0, 10);

    const isAppr = rawPreguntas.toLowerCase().includes('aprob') || rawPreguntas.toLowerCase().includes('pasad') || rawCredenciales.toLowerCase() === 'confirmado';
    const finalCred = (rawCredenciales.toLowerCase() === 'confirmado' || (videoVal >= 2 && pdfVal >= 2 && isAppr)) ? 'Confirmado' : (rawCredenciales || 'Bloqueado');
    const finalPreg = isAppr ? 'Aprobado' : (rawPreguntas || 'Pendiente');

    const props = {
      id: row.id || row.ID,
      fechaRegistro: row.fecha_de_registro || row.fechaRegistro ? new Date(row.fecha_de_registro || row.fechaRegistro).toISOString() : new Date().toISOString(),
      nombresApellidos: row.nombres_y_apellidos || row.nombresApellidos || row['Nombres y Apellidos'],
      dni: String(row.dni || row.DNI || row['D.N.I.']).trim(),
      celular: row.celular || row.Celular,
      correoElectronico: row.correo_electronico || row.correoElectronico || row['Correo Electrónico'],
      usaWhatsApp: row.usa_whatsapp_en_su_celular || row.usaWhatsApp || row['Usa WhatsApp en su Celular'] || 'Sí',
      numeroWhatsAppAlterno: row.numero_whatsapp_alterno || row.numeroWhatsAppAlterno || row['Número WhatsApp Alterno'] || '',
      distritoDondeVota: row.distrito_donde_vota || row.distritoDondeVota || row['Distrito donde Vota'] || '',
      mesaDeSufragio: row.mesa_de_sufragio || row.mesaDeSufragio || row['Mesa de Sufragio'] || '',
      localDeVotacion: row.local_de_votacion || row.localDeVotacion || row['Local de Votación'] || '',
      rolADesempenar: rolVal || (isActuallyCoord ? 'Coordinador de Local' : 'Personero de Mesa'),
      distritoAsignado: row.distrito_asignado || row.distritoAsignado || row.distrito_donde_vota || '',
      mesaAsignada: row.mesa_asignada || row.mesaAsignada || (isActuallyCoord ? 'No aplica' : '-'),
      localDeVotacionAsignado: row.local_de_votacion_asignado || row.localDeVotacionAsignado || (rolVal?.includes('distrito') ? 'No aplica' : row.local_de_votacion || ''),
      tieneExperiencia: row.tiene_experiencia_como_personero || row.tieneExperiencia || 'No',
      cuentaConMovilidad: row.cuenta_con_movilidad_propia || row.cuentaConMovilidad || 'No',
      seCompromete: row.se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones || row.seCompromete || 'Sí',
      video: videoVal,
      pdf: pdfVal,
      preguntas: finalPreg,
      credenciales: finalCred,
      tokenVerificacion: row.token_verificacion || row.tokenVerificacion || row.codigo_credencial || `SP-LM2026-${row.dni || row.DNI}`
    };

    return isActuallyCoord ? new Coordinador(props) : new Personero(props);
  }

  async findByDni(dni) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDni = String(dni).trim();

    // 1. Coordinadores Distritales
    try {
      const resD = await pool.query('SELECT * FROM rcoordinadoresd WHERE dni = $1 LIMIT 1', [cleanDni]);
      if (resD.rows.length > 0) {
        return { entity: this.mapRowToEntity(resD.rows[0], true), tableName: 'rcoordinadoresd' };
      }
    } catch {}

    // 2. Coordinadores Zonales
    try {
      const resZ = await pool.query('SELECT * FROM rcoordinadoresz WHERE dni = $1 LIMIT 1', [cleanDni]);
      if (resZ.rows.length > 0) {
        return { entity: this.mapRowToEntity(resZ.rows[0], true), tableName: 'rcoordinadoresz' };
      }
    } catch {}
    try {
      const resZ2 = await pool.query('SELECT * FROM rcoordinadorz WHERE dni = $1 LIMIT 1', [cleanDni]);
      if (resZ2.rows.length > 0) {
        return { entity: this.mapRowToEntity(resZ2.rows[0], true), tableName: 'rcoordinadorz' };
      }
    } catch {}

    // 3. Coordinadores de Local
    try {
      const resC = await pool.query('SELECT * FROM rcoordinadores WHERE dni = $1 LIMIT 1', [cleanDni]);
      if (resC.rows.length > 0) {
        return { entity: this.mapRowToEntity(resC.rows[0], true), tableName: 'rcoordinadores' };
      }
    } catch {}

    // 4. Personeros de Mesa
    try {
      const resP = await pool.query('SELECT * FROM rpersoneros WHERE dni = $1 LIMIT 1', [cleanDni]);
      if (resP.rows.length > 0) {
        return { entity: this.mapRowToEntity(resP.rows[0], false), tableName: 'rpersoneros' };
      }
    } catch {}

    return null;
  }

  async findByCredentials(userIdentifier, secretPassOrDni) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanUser = String(userIdentifier).trim();
    const cleanPass = String(secretPassOrDni).trim();

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const query = `
          SELECT * FROM ${tbl.name}
          WHERE dni = $1 
             OR (LOWER(nombres_y_apellidos) = LOWER($2) AND dni = $1)
             OR (dni = $1 AND (LOWER(nombres_y_apellidos) = LOWER($2) OR $2 = ''))
          LIMIT 1
        `;
        const res = await pool.query(query, [cleanPass || cleanUser, cleanUser]);
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async findByFullName(fullName) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanName = String(fullName || '').trim().toLowerCase();
    if (!cleanName || cleanName.length < 3) return null;

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(
          `SELECT * FROM ${tbl.name} WHERE LOWER(TRIM(nombres_y_apellidos)) = $1 LIMIT 1`,
          [cleanName]
        );
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async findByPhone(phone) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7) return null;

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(
          `SELECT * FROM ${tbl.name} WHERE celular = $1 OR numero_whatsapp_alterno = $1 LIMIT 1`,
          [cleanPhone]
        );
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async findByToken(token) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanToken = String(token).trim();

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${tbl.name} WHERE token_verificacion = $1 LIMIT 1`, [cleanToken]);
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async countPersonerosByMesa(mesaAsignada, excludeDni = null) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanMesa = String(mesaAsignada || '').trim();
    if (!cleanMesa || cleanMesa === '-' || cleanMesa.toLowerCase() === 'no aplica') return 0;

    let query = `SELECT COUNT(*) as count FROM rpersoneros WHERE TRIM(mesa_asignada) = $1`;
    const params = [cleanMesa];

    if (excludeDni) {
      query += ` AND TRIM(dni) != $2`;
      params.push(String(excludeDni).trim());
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0]?.count || 0, 10);
  }

  async countCoordinadoresByLocal(distritoAsignado, localAsignado, excludeDni = null) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDist = String(distritoAsignado || '').trim().toLowerCase();
    const cleanLocal = String(localAsignado || '').trim().toLowerCase();
    if (!cleanDist || !cleanLocal || cleanLocal === 'no aplica') return 0;

    let query = `
      SELECT COUNT(*) as count FROM rcoordinadores 
      WHERE LOWER(TRIM(distrito_asignado)) = $1 AND LOWER(TRIM(local_de_votacion_asignado)) = $2
    `;
    const params = [cleanDist, cleanLocal];

    if (excludeDni) {
      query += ` AND TRIM(dni) != $3`;
      params.push(String(excludeDni).trim());
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0]?.count || 0, 10);
  }

  async findByEmail(email) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length < 5) return null;

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(
          `SELECT * FROM ${tbl.name} WHERE LOWER(TRIM(correo_electronico)) = $1 LIMIT 1`,
          [cleanEmail]
        );
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async findByWhatsapp(phone) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7) return null;

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadoresz', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(
          `SELECT * FROM ${tbl.name} WHERE celular = $1 OR numero_whatsapp_alterno = $1 LIMIT 1`,
          [cleanPhone]
        );
        if (res.rows.length > 0) {
          return { entity: this.mapRowToEntity(res.rows[0], tbl.isCoord), tableName: tbl.name };
        }
      } catch {}
    }

    return null;
  }

  async countCoordinadoresByDistrito(distritoAsignado, excludeDni = null) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDist = String(distritoAsignado || '').trim().toLowerCase();
    if (!cleanDist) return 0;

    let query = `
      SELECT COUNT(*) as count FROM rcoordinadores 
      WHERE LOWER(TRIM(distrito_asignado)) = $1
    `;
    const params = [cleanDist];

    if (excludeDni) {
      query += ` AND TRIM(dni) != $2`;
      params.push(String(excludeDni).trim());
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0]?.count || 0, 10);
  }

  async countCoordinadoresDistritales(distritoAsignado, excludeDni = null) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDist = String(distritoAsignado || '').trim().toLowerCase();
    if (!cleanDist) return 0;

    let query = `
      SELECT COUNT(*) as count FROM rcoordinadoresd 
      WHERE LOWER(TRIM(distrito_asignado)) = $1
    `;
    const params = [cleanDist];

    if (excludeDni) {
      query += ` AND TRIM(dni) != $2`;
      params.push(String(excludeDni).trim());
    }

    const res = await pool.query(query, params);
    return parseInt(res.rows[0]?.count || 0, 10);
  }

  async getAssignedLocalesByDistrito(distritoAsignado, excludeDni = null) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDist = String(distritoAsignado || '').trim().toLowerCase();
    if (!cleanDist) return [];

    const assignedSet = new Set();

    // 1. Locales de Coordinadores Zonales
    try {
      let qZonal = `SELECT local_de_votacion_asignado FROM rcoordinadoresz WHERE LOWER(TRIM(distrito_asignado)) = $1`;
      const paramsZ = [cleanDist];
      if (excludeDni) {
        qZonal += ` AND TRIM(dni) != $2`;
        paramsZ.push(String(excludeDni).trim());
      }
      const resZ = await pool.query(qZonal, paramsZ);
      resZ.rows.forEach(r => {
        const val = r.local_de_votacion_asignado || '';
        val.split(',').map(s => s.trim()).filter(Boolean).forEach(loc => assignedSet.add(loc));
      });
    } catch {}

    try {
      let qZonal2 = `SELECT local_de_votacion_asignado FROM rcoordinadorz WHERE LOWER(TRIM(distrito_asignado)) = $1`;
      const paramsZ2 = [cleanDist];
      if (excludeDni) {
        qZonal2 += ` AND TRIM(dni) != $2`;
        paramsZ2.push(String(excludeDni).trim());
      }
      const resZ2 = await pool.query(qZonal2, paramsZ2);
      resZ2.rows.forEach(r => {
        const val = r.local_de_votacion_asignado || '';
        val.split(',').map(s => s.trim()).filter(Boolean).forEach(loc => assignedSet.add(loc));
      });
    } catch {}

    // 2. Locales de Coordinadores de Local
    try {
      let qLocal = `SELECT local_de_votacion_asignado FROM rcoordinadores WHERE LOWER(TRIM(distrito_asignado)) = $1`;
      const paramsL = [cleanDist];
      if (excludeDni) {
        qLocal += ` AND TRIM(dni) != $2`;
        paramsL.push(String(excludeDni).trim());
      }
      const resL = await pool.query(qLocal, paramsL);
      resL.rows.forEach(r => {
        const val = (r.local_de_votacion_asignado || '').trim();
        if (val && val.toLowerCase() !== 'no aplica') {
          assignedSet.add(val);
        }
      });
    } catch {}

    return Array.from(assignedSet);
  }

  async save(personeroOrCoordinador) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const data = personeroOrCoordinador.toJSON ? personeroOrCoordinador.toJSON() : personeroOrCoordinador;
    const rol = String(data.rolADesempenar || '').toLowerCase();

    let tableName = 'rpersoneros';
    if (rol.includes('zonal') || rol.includes('zona')) {
      tableName = 'rcoordinadoresz';
    } else if (rol.includes('distrito') || rol.includes('distrital')) {
      tableName = 'rcoordinadoresd';
    } else if (rol.includes('coordinador') || rol.includes('local')) {
      tableName = 'rcoordinadores';
    }

    const token = data.tokenVerificacion || `SP-LM2026-${data.dni}`;

    const query = `
      INSERT INTO ${tableName} (
        nombres_y_apellidos, dni, celular, correo_electronico,
        usa_whatsapp_en_su_celular, numero_whatsapp_alterno,
        distrito_donde_vota, mesa_de_sufragio, local_de_votacion,
        rol_a_desempenar, distrito_asignado, mesa_asignada, local_de_votacion_asignado,
        tiene_experiencia_como_personero, cuenta_con_movilidad_propia,
        se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones,
        video, pdf, preguntas, credenciales, token_verificacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (dni) DO UPDATE SET
        nombres_y_apellidos = EXCLUDED.nombres_y_apellidos,
        celular = EXCLUDED.celular,
        correo_electronico = EXCLUDED.correo_electronico,
        distrito_asignado = EXCLUDED.distrito_asignado,
        local_de_votacion_asignado = EXCLUDED.local_de_votacion_asignado,
        mesa_asignada = EXCLUDED.mesa_asignada
      RETURNING *;
    `;

    const values = [
      data.nombresApellidos,
      data.dni,
      data.celular,
      data.correoElectronico || '',
      data.usaWhatsApp || 'Sí',
      data.numeroWhatsAppAlterno || '',
      data.distritoDondeVota || '',
      data.mesaDeSufragio || '',
      data.localDeVotacion || '',
      data.rolADesempenar || (tableName === 'rcoordinadoresz' || tableName === 'rcoordinadorz' ? 'Coordinador Zonal' : (tableName === 'rcoordinadoresd' ? 'Coordinador de Distritos' : (tableName === 'rcoordinadores' ? 'Coordinador de Local' : 'Personero de Mesa'))),
      data.distritoAsignado || data.distritoDondeVota || '',
      data.mesaAsignada || (tableName === 'rpersoneros' ? '-' : 'No aplica'),
      data.localDeVotacionAsignado || (tableName === 'rcoordinadoresd' ? 'No aplica' : data.localDeVotacion || ''),
      data.tieneExperiencia || 'No',
      data.cuentaConMovilidad || 'No',
      data.seCompromete || 'Sí, me comprometo el 4 de Octubre del 2026',
      data.video || 0,
      data.pdf || 0,
      data.preguntas || 'Pendiente',
      data.credenciales || 'Bloqueado',
      token
    ];

    const result = await pool.query(query, values);
    return this.mapRowToEntity(result.rows[0], tableName !== 'rpersoneros');
  }

  async updateProgress(dni, updatesOrType, currentValue) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDni = String(dni).trim();

    const existing = await this.findByDni(cleanDni);
    if (!existing) throw new Error(`Personero/Coordinador con DNI ${cleanDni} no encontrado`);

    const tableName = existing.tableName;
    const entity = existing.entity;

    let v = parseInt(entity.video || 0, 10);
    let p = parseInt(entity.pdf || 0, 10);
    let q = entity.preguntas || 'Pendiente';
    let credStatus = entity.credenciales || 'Bloqueado';

    if (typeof updatesOrType === 'object' && updatesOrType !== null) {
      if (updatesOrType.video !== undefined) v = parseInt(updatesOrType.video, 10);
      if (updatesOrType.pdf !== undefined) p = parseInt(updatesOrType.pdf, 10);
      if (updatesOrType.preguntas !== undefined) q = updatesOrType.preguntas;
      if (updatesOrType.credenciales !== undefined) credStatus = updatesOrType.credenciales;
    } else {
      const type = updatesOrType;
      if (type === 'video') v = Math.min(2, Math.max(v, (parseInt(currentValue, 10) || 0) + 1));
      if (type === 'pdf') p = Math.min(2, Math.max(p, (parseInt(currentValue, 10) || 0) + 1));
      if (type === 'quiz' || type === 'preguntas') q = 'Aprobado';
    }

    const isFullyApproved = v >= 2 && p >= 2 && String(q).toLowerCase() === 'aprobado';
    credStatus = isFullyApproved ? 'Confirmado' : 'Bloqueado';

    const query = `
      UPDATE ${tableName}
      SET video = $1, pdf = $2, preguntas = $3, credenciales = $4
      WHERE dni = $5
      RETURNING *;
    `;

    const res = await pool.query(query, [v, p, q, credStatus, cleanDni]);
    const updatedEntity = this.mapRowToEntity(res.rows[0], tableName !== 'rpersoneros');
    return {
      entity: updatedEntity,
      tableName
    };
  }

  async updateAssignment(dni, params = {}) {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const cleanDni = String(dni).trim();

    const existing = await this.findByDni(cleanDni);
    if (!existing) throw new Error(`No se encontró el registro con DNI ${cleanDni}`);

    const tableName = existing.tableName;
    const dist = params.distritoAsignado !== undefined ? params.distritoAsignado : params.distrito;
    const loc = params.localAsignado !== undefined ? params.localAsignado : params.local;
    const mes = params.mesaAsignada !== undefined ? params.mesaAsignada : params.mesa;

    const query = `
      UPDATE ${tableName}
      SET distrito_asignado = COALESCE($1, distrito_asignado),
          local_de_votacion_asignado = COALESCE($2, local_de_votacion_asignado),
          mesa_asignada = COALESCE($3, mesa_asignada)
      WHERE dni = $4
      RETURNING *;
    `;

    const res = await pool.query(query, [dist, loc, mes, cleanDni]);
    return {
      entity: this.mapRowToEntity(res.rows[0], tableName !== 'rpersoneros'),
      tableName
    };
  }

  async findAll() {
    await this.ensureTablesExist();
    const pool = await dbPool.getPool();
    const allRecords = [];

    const tables = [
      { name: 'rcoordinadoresd', isCoord: true },
      { name: 'rcoordinadorz', isCoord: true },
      { name: 'rcoordinadores', isCoord: true },
      { name: 'rpersoneros', isCoord: false }
    ];

    for (const tbl of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${tbl.name} ORDER BY id ASC`);
        res.rows.forEach(r => {
          allRecords.push(this.mapRowToEntity(r, tbl.isCoord));
        });
      } catch (e) {
        console.warn(`Aviso leyendo tabla ${tbl.name}:`, e.message);
      }
    }

    return allRecords;
  }

  async getAllCombined() {
    return this.findAll();
  }

  async getAll() {
    return this.findAll();
  }

  async findAllOrdered() {
    return this.findAll();
  }
}
