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
