-- ==============================================================================
-- MIGRACIÓN 002: ÍNDICES DE RENDIMIENTO Y CONSTRAINTS
-- ==============================================================================

-- Índices en Rpersoneros
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rpersoneros_DNI' AND object_id = OBJECT_ID('dbo.Rpersoneros'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Rpersoneros_DNI] ON [dbo].[Rpersoneros] ([DNI]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rpersoneros_Distrito_Asignado' AND object_id = OBJECT_ID('dbo.Rpersoneros'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Rpersoneros_Distrito_Asignado] ON [dbo].[Rpersoneros] ([Distrito_Asignado]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rpersoneros_Credenciales' AND object_id = OBJECT_ID('dbo.Rpersoneros'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Rpersoneros_Credenciales] ON [dbo].[Rpersoneros] ([Credenciales]);
END;
GO

-- Índices en Rcoordinadores
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoordinadores_DNI' AND object_id = OBJECT_ID('dbo.Rcoordinadores'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Rcoordinadores_DNI] ON [dbo].[Rcoordinadores] ([DNI]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoordinadores_Distrito_Asignado' AND object_id = OBJECT_ID('dbo.Rcoordinadores'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Rcoordinadores_Distrito_Asignado] ON [dbo].[Rcoordinadores] ([Distrito_Asignado]);
END;
GO

-- Índices en AuditLogs
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLogs_CreatedAt' AND object_id = OBJECT_ID('dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_CreatedAt] ON [dbo].[AuditLogs] ([CreatedAt] DESC);
END;
GO
