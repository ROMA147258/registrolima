export class PersoneroController {
  constructor(registerPersoneroUseCase, personeroRepository, auditRepository) {
    this.registerUseCase = registerPersoneroUseCase;
    this.personeroRepo = personeroRepository;
    this.auditRepo = auditRepository;
  }

  async register(req, res, next) {
    try {
      const context = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await this.registerUseCase.execute(req.body, context);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getByDni(req, res, next) {
    try {
      const { dni } = req.params;
      const match = await this.personeroRepo.findByDni(dni);
      if (!match || !match.entity) {
        return res.status(404).json({ status: 'error', message: 'Personero no encontrado' });
      }
      res.json({ status: 'success', data: match.entity });
    } catch (err) {
      next(err);
    }
  }

  async checkAvailability(req, res, next) {
    try {
      const { nombres, dni, celular, correo, whatsapp_alterno, rol, mesa, distrito, local } = req.query;

      // 1. Validar Nombres y Apellidos únicos en tiempo real
      if (nombres && String(nombres).trim().length >= 4) {
        const cleanName = String(nombres).trim();
        const existingName = await this.personeroRepo.findByFullName(cleanName);
        if (existingName && existingName.entity) {
          return res.json({
            status: 'success',
            available: false,
            field: 'nombres_apellidos',
            message: `Esta persona ('${cleanName}') ya se encuentra registrada en el sistema.`
          });
        }
      }

      // 2. Validar DNI único en tiempo real
      if (dni && String(dni).trim().length === 8) {
        const cleanDni = String(dni).trim();
        const existing = await this.personeroRepo.findByDni(cleanDni);
        if (existing && existing.entity) {
          return res.json({
            status: 'success',
            available: false,
            field: 'dni',
            message: `Este D.N.I. ya se encuentra registrado como ${existing.entity.rolADesempenar || 'personero'}.`
          });
        }
      }

      // 3. Validar Celular único en tiempo real
      if (celular && String(celular).trim().length === 9) {
        const cleanPhone = String(celular).trim();
        const existingPhone = await this.personeroRepo.findByPhone(cleanPhone);
        if (existingPhone && existingPhone.entity) {
          return res.json({
            status: 'success',
            available: false,
            field: 'celular',
            message: `Este número de celular (${cleanPhone}) ya se encuentra registrado.`
          });
        }
      }

      // 4. Validar Correo Electrónico único en tiempo real
      if (correo && String(correo).trim().length >= 5 && String(correo).includes('@')) {
        const cleanEmail = String(correo).trim().toLowerCase();
        const existingEmail = await this.personeroRepo.findByEmail(cleanEmail);
        if (existingEmail && existingEmail.entity) {
          return res.json({
            status: 'success',
            available: false,
            field: 'correo_electronico',
            message: `Este correo electrónico (${cleanEmail}) ya se encuentra registrado.`
          });
        }
      }

      // 5. Validar WhatsApp Alternativo único en tiempo real
      if (whatsapp_alterno && String(whatsapp_alterno).trim().length === 9) {
        const cleanWs = String(whatsapp_alterno).trim();
        const existingWs = await this.personeroRepo.findByWhatsapp(cleanWs);
        if (existingWs && existingWs.entity) {
          return res.json({
            status: 'success',
            available: false,
            field: 'numero_whatsapp_alterno',
            message: `Este número de WhatsApp alternativo (${cleanWs}) ya se encuentra registrado.`
          });
        }
      }

      const cleanRol = String(rol || '').toLowerCase().trim();

      // 6. Validar Mesa Asignada única (Personero de Mesa)
      if (mesa && String(mesa).trim().length === 6 && (!cleanRol || cleanRol === 'personero de mesa')) {
        const count = await this.personeroRepo.countPersonerosByMesa(mesa);
        if (count >= 1) {
          return res.json({
            status: 'success',
            available: false,
            field: 'mesa_asignada',
            message: `Esta mesa Nº ${mesa} ya cuenta con un personero de mesa asignado.`
          });
        }
      }

      // 7. Validar Coordinador de Local: Máximo 2 por cada distrito
      if (distrito && (cleanRol.includes('local') || (cleanRol.includes('coordinador') && !cleanRol.includes('distrito')))) {
        const countDist = await this.personeroRepo.countCoordinadoresByDistrito(distrito);
        if (countDist >= 2) {
          return res.json({
            status: 'success',
            available: false,
            field: 'distrito_asignado',
            message: `Cupo lleno: El distrito de ${distrito} ya cuenta con el límite máximo de 2 Coordinadores de Local.`
          });
        }
      }

      // 8. Validar Coordinador de Distritos (Máximo 1 por distrito)
      if (distrito && (cleanRol.includes('distrito') || cleanRol.includes('distrital'))) {
        const count = await this.personeroRepo.countCoordinadoresDistritales(distrito);
        if (count >= 1) {
          return res.json({
            status: 'success',
            available: false,
            field: 'distrito_asignado',
            message: `El distrito de '${distrito}' ya cuenta con su Coordinador de Distritos.`
          });
        }
      }

      return res.json({ status: 'success', available: true });
    } catch (err) {
      next(err);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const { dni } = req.params;
      const { distritoAsignado, localAsignado, mesaAsignada, rolADesempenar, credenciales } = req.body;
      const result = await this.personeroRepo.updateAssignment(dni, {
        distritoAsignado,
        localAsignado,
        mesaAsignada,
        rolADesempenar,
        credenciales
      });
      res.json({ status: 'success', message: 'Asignación actualizada correctamente', data: result.entity });
    } catch (err) {
      next(err);
    }
  }
}
