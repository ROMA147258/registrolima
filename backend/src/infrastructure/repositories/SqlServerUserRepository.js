import sql from 'mssql';
import { dbPool } from '../database/ConnectionPool.js';
import { User } from '../../domain/entities/User.js';

export class SqlServerUserRepository {
  mapRowToEntity(row) {
    if (!row) return null;
    return new User({
      id: row.id || row.ID,
      username: row.nombre || row.Username || row.dni,
      passwordHash: row.PasswordHash || row.dni,
      fullName: row.nombre || row.FullName || 'Usuario Somos Perú',
      role: (row.rol || row.Role || 'personero').toLowerCase().includes('admin') ? 'superadmin' : 'personero',
      isActive: row.estado === 'Activo' || row.IsActive === 1 || row.IsActive === true,
      createdAt: row.fecha_registro || row.CreatedAt,
      lastLoginAt: row.last_login || row.LastLoginAt
    });
  }

  async findByUsername(username) {
    const pool = await dbPool.getPool();
    const cleanUser = String(username).toLowerCase().trim();

    try {
      // 1. Consulta compatible con la tabla Usuarios existente (dni / nombre / rol)
      const res = await pool.request()
        .input('user', sql.NVarChar, cleanUser)
        .query(`
          SELECT TOP 1 * FROM [dbo].[Usuarios] 
          WHERE (LOWER([nombre]) = @user OR LOWER([dni]) = @user OR [dni] = @user)
        `);

      if (res.recordset.length > 0) {
        return this.mapRowToEntity(res.recordset[0]);
      }
    } catch (err) {
      console.warn('Advertencia en findByUsername:', err.message);
    }

    return null;
  }

  async updateLastLogin(id) {
    try {
      const pool = await dbPool.getPool();
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE [dbo].[Usuarios] SET [fecha_registro] = GETDATE() WHERE [id] = @id');
    } catch {}
  }
}
