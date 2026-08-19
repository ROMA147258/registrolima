import sql from 'mssql';
import { dbPool } from '../database/ConnectionPool.js';

export class SqlServerAuditRepository {
  async log({ action, userIdentifier, role, details, ipAddress, userAgent }) {
    try {
      const pool = await dbPool.getPool();
      const stringifiedDetails = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

      await pool.request()
        .input('action', sql.NVarChar, action)
        .input('userId', sql.NVarChar, userIdentifier || 'ANONYMOUS')
        .input('role', sql.NVarChar, role || 'GUEST')
        .input('details', sql.NVarChar, stringifiedDetails)
        .input('ip', sql.NVarChar, ipAddress || 'UNKNOWN')
        .input('ua', sql.NVarChar, userAgent || 'UNKNOWN')
        .query(`
          INSERT INTO [dbo].[AuditLogs] ([Action], [UserIdentifier], [Role], [Details], [IpAddress], [UserAgent])
          VALUES (@action, @userId, @role, @details, @ip, @ua)
        `);
    } catch (err) {
      console.warn('⚠️ No se pudo registrar AuditLog:', err.message);
    }
  }

  async getRecentLogs(limit = 100) {
    const pool = await dbPool.getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query('SELECT TOP (@limit) * FROM [dbo].[AuditLogs] ORDER BY [CreatedAt] DESC');
    return result.recordset;
  }
}
