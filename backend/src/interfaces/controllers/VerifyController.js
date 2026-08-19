export class VerifyController {
  constructor(verifyCredentialUseCase) {
    this.verifyUseCase = verifyCredentialUseCase;
  }

  async verify(req, res, next) {
    try {
      const token = req.params.token || req.query.token || req.query.dni;
      const context = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await this.verifyUseCase.execute(token, context);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
