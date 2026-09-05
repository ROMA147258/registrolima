export class DashboardController {
  constructor(getDashboardDataUseCase, exportRecordsUseCase, auditRepository) {
    this.getDashboardUseCase = getDashboardDataUseCase;
    this.exportUseCase = exportRecordsUseCase;
    this.auditRepo = auditRepository;
  }

  async getSummary(req, res, next) {
    try {
      const data = await this.getDashboardUseCase.execute();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async readAll(req, res, next) {
    try {
      const data = await this.getDashboardUseCase.execute();
      res.json({ status: 'success', data: data.records });
    } catch (err) {
      next(err);
    }
  }

  async export(req, res, next) {
    try {
      const format = req.query.format || 'xlsx';
      const district = req.query.district || null;

      const result = await this.exportUseCase.execute(format, district);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { action, limit, offset } = req.query;
      const logs = await this.auditRepo?.findAll({ action, limit, offset });
      res.json({ status: 'success', data: logs || [] });
    } catch (err) {
      next(err);
    }
  }
}

