export class AuthController {
  constructor(loginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  async login(req, res, next) {
    try {
      const { username, password, dni } = req.body;
      const context = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await this.loginUseCase.execute({ username, password, dni }, context);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async checkUser(req, res, next) {
    try {
      const dni = req.query.dni || req.params.dni;
      const context = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await this.loginUseCase.execute({ dni }, context);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
