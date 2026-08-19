import sql from 'mssql';
import { dbPool } from '../database/ConnectionPool.js';
import { Personero } from '../../domain/entities/Personero.js';
import { Coordinador } from '../../domain/entities/Coordinador.js';

export class SqlServerPersoneroRepository {
  async getPersoneroTableName() {
    try {
      const pool = await dbPool.getPool();
      const res = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'Rpersoneros' OR TABLE_NAME = 'personeros' OR TABLE_NAME = 'Personeros'
        ORDER BY CASE WHEN TABLE_NAME = 'Rpersoneros' THEN 1 ELSE 2 END
      `);
      if (res.recordset.length > 0) return res.recordset[0].TABLE_NAME;
    } catch {}
    return 'Rpersoneros';
  }

  async getCoordinadorTableName() {
    try {
      const pool = await dbPool.getPool();
      const res = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'Rcoordinadores' OR TABLE_NAME = 'coordinadores' OR TABLE_NAME = 'Coordinadores'
        ORDER BY CASE WHEN TABLE_NAME = 'Rcoordinadores' THEN 1 ELSE 2 END
      `);
      if (res.recordset.length > 0) return res.recordset[0].TABLE_NAME;
    } catch {}
    return 'Rcoordinadores';
  }

  async ensureCoordinadorDistritalTableExists() {
    try {
      const pool = await dbPool.getPool();
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadoresd]') AND type in (N'U'))
           AND NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoodinadoresd]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[Rcoordinadoresd] (
                [ID] INT IDENTITY(1,1) PRIMARY KEY,
                [Fecha_de_Registro] DATETIME DEFAULT GETDATE(),
                [Nombres_y_Apellidos] NVARCHAR(255) NOT NULL,
                [DNI] NVARCHAR(20) NOT NULL UNIQUE,
                [Celular] NVARCHAR(50) NULL,
                [Correo_Electronico] NVARCHAR(255) NULL,
                [Usa_WhatsApp_en_su_celular] NVARCHAR(255) DEFAULT 'Sí',
                [Numero_WhatsApp_Alterno] NVARCHAR(50) NULL,
                [Distrito_donde_Vota] NVARCHAR(100) NULL,
                [Mesa_de_Sufragio] NVARCHAR(50) NULL,
                [Local_de_Votacion] NVARCHAR(255) NULL,
                [Rol_a_Desempenar] NVARCHAR(100) DEFAULT 'Coordinador de Distritos',
                [Distrito_Asignado] NVARCHAR(100) NULL,
                [Mesa_Asignada] NVARCHAR(50) DEFAULT 'No aplica',
                [Local_de_Votacion_Asignado] NVARCHAR(255) DEFAULT 'No aplica',
                [Tiene_Experiencia_como_Personero] NVARCHAR(50) DEFAULT 'No',
                [Cuenta_con_Movilidad_Propia] NVARCHAR(50) DEFAULT 'No',
                [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
                [Video] INT DEFAULT 0,
                [PDF] INT DEFAULT 0,
                [Preguntas] NVARCHAR(50) DEFAULT 'Pendiente',
                [Credenciales] NVARCHAR(50) DEFAULT 'Bloqueado',
                [Token_Verificacion] NVARCHAR(100) NULL
            );
        END
      `);
    } catch (e) {}
  }

  async getCoordinadorDistritalTableName() {
    await this.ensureCoordinadorDistritalTableExists();
    try {
      const pool = await dbPool.getPool();
      const res = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'Rcoordinadoresd' 
           OR TABLE_NAME = 'rcoordinadoresd' 
           OR TABLE_NAME = 'Rcoodinadoresd' 
           OR TABLE_NAME = 'rcoodinadoresd' 
           OR TABLE_NAME = 'coordinadoresd'
        ORDER BY CASE 
          WHEN TABLE_NAME = 'Rcoordinadoresd' THEN 1 
          WHEN TABLE_NAME = 'rcoordinadoresd' THEN 2 
          WHEN TABLE_NAME = 'Rcoodinadoresd' THEN 3
          WHEN TABLE_NAME = 'rcoodinadoresd' THEN 4
          ELSE 5 
        END
      `);
      if (res.recordset.length > 0) return res.recordset[0].TABLE_NAME;
    } catch {}
    return 'Rcoordinadoresd';
  }

  mapRowToEntity(row, isCoordinador = false) {
    if (!row) return null;
    const rolVal = row.Rol_a_Desempenar || row.rol_desempenar || row.Rol;
    const isActuallyCoord = isCoordinador || (rolVal && rolVal.toLowerCase().includes('coordinador'));
    const props = {
      id: row.ID || row.id,
      fechaRegistro: row.Fecha_de_Registro || row.fecha_registro || row.FechaRegistro,
      nombresApellidos: row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre || row.personero_nombre,
      dni: row.DNI || row.dni || row.personero_dni,
      celular: row.Celular || row.celular || row.Telefono,
      correoElectronico: row.Correo_Electronico || row.correo_electronico || row.Email || row.Correo,
      usaWhatsApp: row.Usa_WhatsApp_en_su_celular || row.usa_whatsapp,
      numeroWhatsAppAlterno: row.Numero_WhatsApp_Alterno || row.numero_whatsapp_alterno,
      distritoDondeVota: row.Distrito_donde_Vota || row.distrito_vota || row.DistritoVota || row.distrito,
      mesaDeSufragio: row.Mesa_de_Sufragio || row.mesa_vota || row.MesaVota || row.Mesa,
      localDeVotacion: row.Local_de_Votacion || row.local_vota || row.LocalVota || row.Local || row.local,
      rolADesempenar: rolVal || (isActuallyCoord ? 'Coordinador de Local' : 'Personero de Mesa'),
      distritoAsignado: row.Distrito_Asignado || row.distrito_asig || row.DistritoAsignado || row.distrito,
      mesaAsignada: row.Mesa_Asignada || row.mesa_asig || row.MesaAsignada || (isActuallyCoord ? 'No aplica' : '-'),
      localDeVotacionAsignado: row.Local_de_Votacion_Asignado || row.local_asig || row.LocalAsignado || row.local,
      tieneExperiencia: row.Tiene_Experiencia_como_Personero || row.experiencia || row.TieneExperiencia || 'No',
      cuentaConMovilidad: row.Cuenta_con_Movilidad_Propia || row.movilidad || row.CuentaMovilidad || 'No',
      seCompromete: row.Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones || row.compromiso || 'Sí',
      video: parseInt(row.Video || row.video || 0, 10),
      pdf: parseInt(row.PDF || row.pdf || 0, 10),
      preguntas: row.Preguntas || row.preguntas || 'Pendiente',
      credenciales: row.Credenciales || row.credenciales || 'Bloqueado',
      tokenVerificacion: row.Token_Verificacion || row.token || `SP-LM2026-${row.DNI || row.dni || row.personero_dni}`
    };
    return isActuallyCoord ? new Coordinador(props) : new Personero(props);
  }

  async findByDni(dni) {
    const pool = await dbPool.getPool();
    const cleanDni = String(dni).trim();

    const dTable = await this.getCoordinadorDistritalTableName();
    const cTable = await this.getCoordinadorTableName();
    const pTable = await this.getPersoneroTableName();

    // 1. Buscar en tabla de coordinadores distritales (dbo.rcoodinadoresd)
    try {
      const coordDistritalRes = await pool.request()
        .input('dni', sql.NVarChar, cleanDni)
        .query(`SELECT TOP 1 * FROM [dbo].[${dTable}] WHERE [DNI] = @dni`);

      if (coordDistritalRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(coordDistritalRes.recordset[0], true), tableName: dTable };
      }
    } catch (e) {}

    // 2. Buscar en tabla de coordinadores de local (dbo.Rcoordinadores)
    try {
      const coordinadorRes = await pool.request()
        .input('dni', sql.NVarChar, cleanDni)
        .query(`SELECT TOP 1 * FROM [dbo].[${cTable}] WHERE [DNI] = @dni`);

      if (coordinadorRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(coordinadorRes.recordset[0], true), tableName: cTable };
      }
    } catch (e) {}

    // 3. Buscar en tabla de personeros (dbo.Rpersoneros)
    try {
      const personeroRes = await pool.request()
        .input('dni', sql.NVarChar, cleanDni)
        .query(`SELECT TOP 1 * FROM [dbo].[${pTable}] WHERE [DNI] = @dni`);

      if (personeroRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(personeroRes.recordset[0], false), tableName: pTable };
      }
    } catch (e) {}

    return null;
  }

  async findByCredentials(nameOrDni1, nameOrDni2) {
    const pool = await dbPool.getPool();
    const val1 = String(nameOrDni1 || '').trim();
    const val2 = String(nameOrDni2 || '').trim();

    const dTable = await this.getCoordinadorDistritalTableName();
    const cTable = await this.getCoordinadorTableName();
    const pTable = await this.getPersoneroTableName();

    // Extraer candidato a DNI
    const dniCandidate = [val1, val2].find(v => /^\d{6,10}$/.test(v)) || (val2 && /^\d+$/.test(val2) ? val2 : '');
    const textCandidate = [val1, val2].find(v => v && v !== dniCandidate) || val1 || val2;

    const tables = [
      { name: dTable, isCoord: true }, // Buscar primero en coordinadores distritales (dbo.rcoodinadoresd)
      { name: cTable, isCoord: true }, // Luego en coordinadores de local (dbo.Rcoordinadores)
      { name: pTable, isCoord: false }  // Luego en personeros (dbo.Rpersoneros)
    ];

    const matchNameWords = (fullName, searchStr) => {
      if (!searchStr || !fullName) return true;
      const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const normFull = normalize(fullName);
      const words = normalize(searchStr).split(/\s+/).filter(w => w.length >= 2);
      if (words.length === 0) return true;
      return words.every(w => normFull.includes(w)) || normFull.includes(normalize(searchStr));
    };

    for (const t of tables) {
      try {
        // Intento 1: Buscar por DNI y validar coincidencia de nombre
        if (dniCandidate) {
          const res = await pool.request()
            .input('dni', sql.NVarChar, dniCandidate)
            .query(`SELECT TOP 1 * FROM [dbo].[${t.name}] WHERE [DNI] = @dni`);

          if (res.recordset.length > 0) {
            const row = res.recordset[0];
            const fullName = row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre || '';
            if (!textCandidate || matchNameWords(fullName, textCandidate)) {
              return { entity: this.mapRowToEntity(row, t.isCoord), tableName: t.name };
            }
          }
        }

        // Intento 2: Buscar por Nombres y Apellidos en SQL Server (desglosando palabras)
        if (textCandidate) {
          const words = textCandidate.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
          if (words.length > 0) {
            const req = pool.request();
            const whereParts = words.map((w, idx) => {
              req.input(`word_${idx}`, sql.NVarChar, `%${w}%`);
              return `([Nombres_y_Apellidos] LIKE @word_${idx} OR [Nombres] LIKE @word_${idx} OR [Nombre] LIKE @word_${idx})`;
            });

            // Usamos fallback por si el nombre de columna varía
            let querySql = `SELECT TOP 5 * FROM [dbo].[${t.name}] WHERE (${whereParts.join(' AND ')})`;
            try {
              const resText = await req.query(querySql);
              if (resText.recordset.length > 0) {
                // Si encontramos coincidencia exacta o de alta similitud
                for (const row of resText.recordset) {
                  const fullName = row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre || '';
                  if (matchNameWords(fullName, textCandidate)) {
                    return { entity: this.mapRowToEntity(row, t.isCoord), tableName: t.name };
                  }
                }
                // Si no hay filtro estricto, retornar el primer match relevante
                return { entity: this.mapRowToEntity(resText.recordset[0], t.isCoord), tableName: t.name };
              }
            } catch (colErr) {
              // Intento simplificado con LIKE sobre Nombres_y_Apellidos
              const simpleReq = pool.request();
              simpleReq.input('mainWord', sql.NVarChar, `%${words[0]}%`);
              const simpleRes = await simpleReq.query(`SELECT TOP 5 * FROM [dbo].[${t.name}] WHERE [Nombres_y_Apellidos] LIKE @mainWord`);
              if (simpleRes.recordset.length > 0) {
                return { entity: this.mapRowToEntity(simpleRes.recordset[0], t.isCoord), tableName: t.name };
              }
            }
          }
        }
      } catch (e) {
        // Continuar buscando en la siguiente tabla si falla
      }
    }

    return null;
  }

  async findByToken(token) {
    const pool = await dbPool.getPool();
    const cleanToken = String(token).trim();

    const dTable = await this.getCoordinadorDistritalTableName();
    const cTable = await this.getCoordinadorTableName();
    const pTable = await this.getPersoneroTableName();

    try {
      const distritalRes = await pool.request()
        .input('token', sql.NVarChar, cleanToken)
        .query(`SELECT TOP 1 * FROM [dbo].[${dTable}] WHERE [Token_Verificacion] = @token OR [DNI] = @token`);

      if (distritalRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(distritalRes.recordset[0], true), tableName: dTable };
      }
    } catch (e) {}

    try {
      const coordinadorRes = await pool.request()
        .input('token', sql.NVarChar, cleanToken)
        .query(`SELECT TOP 1 * FROM [dbo].[${cTable}] WHERE [Token_Verificacion] = @token OR [DNI] = @token`);

      if (coordinadorRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(coordinadorRes.recordset[0], true), tableName: cTable };
      }
    } catch (e) {}

    try {
      const personeroRes = await pool.request()
        .input('token', sql.NVarChar, cleanToken)
        .query(`SELECT TOP 1 * FROM [dbo].[${pTable}] WHERE [Token_Verificacion] = @token OR [DNI] = @token`);

      if (personeroRes.recordset.length > 0) {
        return { entity: this.mapRowToEntity(personeroRes.recordset[0], false), tableName: pTable };
      }
    } catch (e) {}

    return null;
  }

  async save(entity, isCoordinador = false) {
    const pool = await dbPool.getPool();
    const rolStr = String(entity.rolADesempenar || '').toLowerCase();
    const isDistrital = rolStr.includes('distrito') || rolStr.includes('distrital');

    let tableName;
    if (isDistrital) {
      tableName = await this.getCoordinadorDistritalTableName();
    } else if (isCoordinador || rolStr.includes('coordinador')) {
      tableName = await this.getCoordinadorTableName();
    } else {
      tableName = await this.getPersoneroTableName();
    }

    const checkExisting = await this.findByDni(entity.dni);
    if (checkExisting) {
      throw new Error(`El DNI ${entity.dni} ya se encuentra registrado en el sistema.`);
    }

    const token = entity.tokenVerificacion || `SP-LM2026-${entity.dni}`;

    await pool.request()
      .input('nombres', sql.NVarChar, entity.nombresApellidos)
      .input('dni', sql.NVarChar, entity.dni)
      .input('celular', sql.NVarChar, entity.celular)
      .input('correo', sql.NVarChar, entity.correoElectronico)
      .input('usa_ws', sql.NVarChar, entity.usaWhatsApp)
      .input('num_ws_alt', sql.NVarChar, entity.numeroWhatsAppAlterno)
      .input('distrito_vota', sql.NVarChar, entity.distritoDondeVota)
      .input('mesa_vota', sql.NVarChar, entity.mesaDeSufragio)
      .input('local_vota', sql.NVarChar, entity.localDeVotacion)
      .input('rol', sql.NVarChar, entity.rolADesempenar)
      .input('distrito_asig', sql.NVarChar, entity.distritoAsignado)
      .input('mesa_asig', sql.NVarChar, entity.mesaAsignada)
      .input('local_asig', sql.NVarChar, entity.localDeVotacionAsignado)
      .input('exp', sql.NVarChar, entity.tieneExperiencia)
      .input('mov', sql.NVarChar, entity.cuentaConMovilidad)
      .input('compromiso', sql.NVarChar, entity.seCompromete)
      .input('video', sql.Int, entity.video)
      .input('pdf', sql.Int, entity.pdf)
      .input('preguntas', sql.NVarChar, entity.preguntas)
      .input('credenciales', sql.NVarChar, entity.credenciales)
      .input('token', sql.NVarChar, token)
      .query(`
        INSERT INTO [dbo].[${tableName}] (
          [Nombres_y_Apellidos], [DNI], [Celular], [Correo_Electronico],
          [Usa_WhatsApp_en_su_celular], [Numero_WhatsApp_Alterno], [Distrito_donde_Vota],
          [Mesa_de_Sufragio], [Local_de_Votacion], [Rol_a_Desempenar],
          [Distrito_Asignado], [Mesa_Asignada], [Local_de_Votacion_Asignado],
          [Tiene_Experiencia_como_Personero], [Cuenta_con_Movilidad_Propia],
          [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones],
          [Video], [PDF], [Preguntas], [Credenciales], [Token_Verificacion]
        ) VALUES (
          @nombres, @dni, @celular, @correo,
          @usa_ws, @num_ws_alt, @distrito_vota,
          @mesa_vota, @local_vota, @rol,
          @distrito_asig, @mesa_asig, @local_asig,
          @exp, @mov, @compromiso,
          @video, @pdf, @preguntas, @credenciales, @token
        )
      `);

    return this.findByDni(entity.dni);
  }

  async updateProgress(dni, { video, pdf, preguntas, credenciales }) {
    const existing = await this.findByDni(dni);
    if (!existing) {
      throw new Error(`Usuario con DNI ${dni} no encontrado.`);
    }

    const pool = await dbPool.getPool();
    const tableName = existing.tableName;

    await pool.request()
      .input('dni', sql.NVarChar, String(dni).trim())
      .input('video', sql.Int, video)
      .input('pdf', sql.Int, pdf)
      .input('preguntas', sql.NVarChar, preguntas)
      .input('credenciales', sql.NVarChar, credenciales)
      .query(`
        UPDATE [dbo].[${tableName}]
        SET [Video] = @video, [PDF] = @pdf, [Preguntas] = @preguntas, [Credenciales] = @credenciales
        WHERE [DNI] = @dni
      `);

    return this.findByDni(dni);
  }

  async updateAssignment(dni, { distritoAsignado, localAsignado, mesaAsignada, rolADesempenar, credenciales }) {
    const existing = await this.findByDni(dni);
    if (!existing) {
      throw new Error(`Usuario con DNI ${dni} no encontrado.`);
    }

    const pool = await dbPool.getPool();
    const tableName = existing.tableName;

    await pool.request()
      .input('dni', sql.NVarChar, String(dni).trim())
      .input('distrito_asig', sql.NVarChar, distritoAsignado)
      .input('local_asig', sql.NVarChar, localAsignado)
      .input('mesa_asig', sql.NVarChar, mesaAsignada)
      .input('rol', sql.NVarChar, rolADesempenar)
      .input('credenciales', sql.NVarChar, credenciales)
      .query(`
        UPDATE [dbo].[${tableName}]
        SET [Distrito_Asignado] = @distrito_asig,
            [Local_de_Votacion_Asignado] = @local_asig,
            [Mesa_Asignada] = @mesa_asig,
            [Rol_a_Desempenar] = @rol,
            [Credenciales] = @credenciales
        WHERE [DNI] = @dni
      `);

    return this.findByDni(dni);
  }

  async getAllCombined() {
    const pool = await dbPool.getPool();
    const pTable = await this.getPersoneroTableName();
    const cTable = await this.getCoordinadorTableName();
    const dTable = await this.getCoordinadorDistritalTableName();

    let personerosRows = [];
    let coordinadoresRows = [];
    let coordinadoresDistritalesRows = [];

    try {
      const pRes = await pool.request().query(`SELECT * FROM [dbo].[${pTable}] ORDER BY [ID] DESC`);
      personerosRows = pRes.recordset;
    } catch (e) {}

    try {
      const cRes = await pool.request().query(`SELECT * FROM [dbo].[${cTable}] ORDER BY [ID] DESC`);
      coordinadoresRows = cRes.recordset;
    } catch (e) {}

    try {
      const dRes = await pool.request().query(`SELECT * FROM [dbo].[${dTable}] ORDER BY [ID] DESC`);
      coordinadoresDistritalesRows = dRes.recordset;
    } catch (e) {}

    const mapPersonero = (row) => {
      const expVal = row.Tiene_Experiencia_como_Personero || row['¿Tiene Experiencia como Personero?'] || row['Tiene Experiencia como Personero'] || row.experiencia || row.TieneExperiencia || 'No';
      const movVal = row.Cuenta_con_Movilidad_Propia || row['¿Cuenta con Movilidad Propia?'] || row['Cuenta con Movilidad Propia'] || row.movilidad || row.CuentaMovilidad || 'No';
      const compVal = row.Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones || row['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?'] || row['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] || row.compromiso || row.seCompromete || 'Sí, me comprometo el 4 de Octubre del 2026';

      return {
        'ID': row.ID || row.id,
        'Fecha de Registro': row.Fecha_de_Registro || row.fecha_registro || row.FechaRegistro || '2026-08-17',
        'Nombres y Apellidos': row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre,
        'D.N.I.': row.DNI || row.dni,
        'Celular': row.Celular || row.celular || row.Telefono,
        'Correo Electrónico': row.Correo_Electronico || row.correo_electronico || row.Email || row.Correo,
        '¿Usa WhatsApp en su celular?': row.Usa_WhatsApp_en_su_celular || row.usa_whatsapp || 'Sí',
        'Número WhatsApp Alterno': row.Numero_WhatsApp_Alterno || row.numero_whatsapp_alterno || '',
        'Distrito donde Vota': row.Distrito_donde_Vota || row.distrito_vota || row.DistritoVota,
        'Mesa de Sufragio': row.Mesa_de_Sufragio || row.mesa_vota || row.MesaVota,
        'Local de Votación': row.Local_de_Votacion || row.local_vota || row.LocalVota,
        'Rol a Desempeñar': row.Rol_a_Desempenar || row.rol_desempenar || row.Rol || 'Personero de Mesa',
        'Distrito Asignado': row.Distrito_Asignado || row.distrito_asig || row.DistritoAsignado,
        'Mesa Asignada': row.Mesa_Asignada || row.mesa_asig || row.MesaAsignada,
        'Local de Votación Asignado': row.Local_de_Votacion_Asignado || row.local_asig || row.LocalAsignado,
        'Tiene Experiencia como Personero': expVal,
        '¿Tiene Experiencia como Personero?': expVal,
        'Cuenta con Movilidad Propia': movVal,
        '¿Cuenta con Movilidad Propia?': movVal,
        'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': compVal,
        '¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?': compVal,
        'Video': parseInt(row.Video || row.video || 0, 10),
        'PDF': parseInt(row.PDF || row.pdf || 0, 10),
        'Preguntas': row.Preguntas || row.preguntas || 'Pendiente',
        'Credenciales': row.Credenciales || row.credenciales || 'Bloqueado',
        'Token': row.Token_Verificacion || row.token || `SP-LM2026-${row.DNI || row.dni}`
      };
    };

    const mapCoordinador = (row) => {
      const expVal = row.Tiene_Experiencia_como_Personero || row['¿Tiene Experiencia como Personero?'] || row['Tiene Experiencia como Personero'] || row.experiencia || row.TieneExperiencia || 'No';
      const movVal = row.Cuenta_con_Movilidad_Propia || row['¿Cuenta con Movilidad Propia?'] || row['Cuenta con Movilidad Propia'] || row.movilidad || row.CuentaMovilidad || 'No';
      const compVal = row.Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones || row['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?'] || row['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] || row.compromiso || row.seCompromete || 'Sí, me comprometo el 4 de Octubre del 2026';

      return {
        'ID': row.ID || row.id,
        'Fecha de Registro': row.Fecha_de_Registro || row.fecha_registro || row.FechaRegistro || '2026-08-17',
        'Nombres y Apellidos': row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre,
        'D.N.I.': row.DNI || row.dni,
        'Celular': row.Celular || row.celular || row.Telefono,
        'Correo Electrónico': row.Correo_Electronico || row.correo_electronico || row.Email || row.Correo,
        '¿Usa WhatsApp en su celular?': row.Usa_WhatsApp_en_su_celular || row.usa_whatsapp || 'Sí',
        'Número WhatsApp Alterno': row.Numero_WhatsApp_Alterno || row.numero_whatsapp_alterno || '',
        'Distrito donde Vota': row.Distrito_donde_Vota || row.distrito_vota || row.DistritoVota,
        'Mesa de Sufragio': row.Mesa_de_Sufragio || row.mesa_vota || row.MesaVota,
        'Local de Votación': row.Local_de_Votacion || row.local_vota || row.LocalVota,
        'Rol a Desempeñar': row.Rol_a_Desempenar || row.rol_desempenar || row.Rol || 'Coordinador de Local',
        'Distrito Asignado': row.Distrito_Asignado || row.distrito_asig || row.DistritoAsignado,
        'Mesa Asignada': row.Mesa_Asignada || row.mesa_asig || row.MesaAsignada || 'No aplica',
        'Local de Votación Asignado': row.Local_de_Votacion_Asignado || row.local_asig || row.LocalAsignado,
        'Tiene Experiencia como Personero': expVal,
        '¿Tiene Experiencia como Personero?': expVal,
        'Cuenta con Movilidad Propia': movVal,
        '¿Cuenta con Movilidad Propia?': movVal,
        'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': compVal,
        '¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?': compVal,
        'Video': parseInt(row.Video || row.video || 0, 10),
        'PDF': parseInt(row.PDF || row.pdf || 0, 10),
        'Preguntas': row.Preguntas || row.preguntas || 'Pendiente',
        'Credenciales': row.Credenciales || row.credenciales || 'Bloqueado',
        'Token': row.Token_Verificacion || row.token || `SP-LM2026-${row.DNI || row.dni}`
      };
    };

    const mapCoordinadorDistrital = (row) => {
      const expVal = row.Tiene_Experiencia_como_Personero || row['¿Tiene Experiencia como Personero?'] || row['Tiene Experiencia como Personero'] || row.experiencia || row.TieneExperiencia || 'No';
      const movVal = row.Cuenta_con_Movilidad_Propia || row['¿Cuenta con Movilidad Propia?'] || row['Cuenta con Movilidad Propia'] || row.movilidad || row.CuentaMovilidad || 'No';
      const compVal = row.Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones || row['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?'] || row['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] || row.compromiso || row.seCompromete || 'Sí, me comprometo el 4 de Octubre del 2026';

      return {
        'ID': row.ID || row.id,
        'Fecha de Registro': row.Fecha_de_Registro || row.fecha_registro || row.FechaRegistro || '2026-08-17',
        'Nombres y Apellidos': row.Nombres_y_Apellidos || row.nombres_apellidos || row.Nombres || row.Nombre,
        'D.N.I.': row.DNI || row.dni,
        'Celular': row.Celular || row.celular || row.Telefono,
        'Correo Electrónico': row.Correo_Electronico || row.correo_electronico || row.Email || row.Correo,
        '¿Usa WhatsApp en su celular?': row.Usa_WhatsApp_en_su_celular || row.usa_whatsapp || 'Sí',
        'Número WhatsApp Alterno': row.Numero_WhatsApp_Alterno || row.numero_whatsapp_alterno || '',
        'Distrito donde Vota': row.Distrito_donde_Vota || row.distrito_vota || row.DistritoVota,
        'Mesa de Sufragio': row.Mesa_de_Sufragio || row.mesa_vota || row.MesaVota,
        'Local de Votación': row.Local_de_Votacion || row.local_vota || row.LocalVota,
        'Rol a Desempeñar': row.Rol_a_Desempenar || row.rol_desempenar || row.Rol || 'Coordinador de Distritos',
        'Distrito Asignado': row.Distrito_Asignado || row.distrito_asig || row.DistritoAsignado,
        'Mesa Asignada': row.Mesa_Asignada || row.mesa_asig || row.MesaAsignada || 'No aplica',
        'Local de Votación Asignado': row.Local_de_Votacion_Asignado || row.local_asig || row.LocalAsignado || 'No aplica',
        'Tiene Experiencia como Personero': expVal,
        '¿Tiene Experiencia como Personero?': expVal,
        'Cuenta con Movilidad Propia': movVal,
        '¿Cuenta con Movilidad Propia?': movVal,
        'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': compVal,
        '¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?': compVal,
        'Video': parseInt(row.Video || row.video || 0, 10),
        'PDF': parseInt(row.PDF || row.pdf || 0, 10),
        'Preguntas': row.Preguntas || row.preguntas || 'Pendiente',
        'Credenciales': row.Credenciales || row.credenciales || 'Bloqueado',
        'Token': row.Token_Verificacion || row.token || `SP-LM2026-${row.DNI || row.dni}`
      };
    };

    return [
      ...personerosRows.map(mapPersonero),
      ...coordinadoresRows.map(mapCoordinador),
      ...coordinadoresDistritalesRows.map(mapCoordinadorDistrital)
    ];
  }
}
