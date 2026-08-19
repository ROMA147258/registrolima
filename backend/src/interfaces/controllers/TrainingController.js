export class TrainingController {
  constructor(updateTrainingProgressUseCase) {
    this.updateProgressUseCase = updateTrainingProgressUseCase;
  }

  async updateProgress(req, res, next) {
    try {
      const dni = req.query.dni || req.body.dni;
      const type = req.query.type || req.body.type;
      const current = req.query.current || req.body.current;

      const context = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await this.updateProgressUseCase.execute({ dni, type, current }, context);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
