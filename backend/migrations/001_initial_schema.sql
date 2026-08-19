-- ==============================================================================
-- MIGRACIÓN 001: ESQUEMA INICIAL IDEMPOTENTE
-- TABLAS: SchemaMigrations, Rpersoneros, Rcoordinadores, Usuarios, AuditLogs
-- ==============================================================================

-- 0. Tabla de Control de Migraciones
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchemaMigrations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SchemaMigrations] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [MigrationName] NVARCHAR(255) NOT NULL UNIQUE,
        [AppliedAt] DATETIME DEFAULT GETDATE()
    );
END;
GO

-- 1. Tabla de Personeros (dbo.Rpersoneros) - Preserva compatibilidad 100%
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rpersoneros]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Rpersoneros] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Fecha_de_Registro] DATETIME DEFAULT GETDATE(),
        [Nombres_y_Apellidos] NVARCHAR(255) NOT NULL,
        [DNI] NVARCHAR(20) NOT NULL UNIQUE,
        [Celular] NVARCHAR(20) NULL,
        [Correo_Electronico] NVARCHAR(255) NULL,
        [Usa_WhatsApp_en_su_celular] NVARCHAR(10) DEFAULT 'Sí',
        [Numero_WhatsApp_Alterno] NVARCHAR(20) NULL,
        [Distrito_donde_Vota] NVARCHAR(100) NULL,
        [Mesa_de_Sufragio] NVARCHAR(50) NULL,
        [Local_de_Votacion] NVARCHAR(255) NULL,
        [Rol_a_Desempenar] NVARCHAR(100) DEFAULT 'Personero de Mesa',
        [Distrito_Asignado] NVARCHAR(100) NULL,
        [Mesa_Asignada] NVARCHAR(50) NULL,
        [Local_de_Votacion_Asignado] NVARCHAR(255) NULL,
        [Tiene_Experiencia_como_Personero] NVARCHAR(10) DEFAULT 'No',
        [Cuenta_con_Movilidad_Propia] NVARCHAR(10) DEFAULT 'No',
        [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(10) DEFAULT 'Sí',
        [Video] INT DEFAULT 0,
        [PDF] INT DEFAULT 0,
        [Preguntas] NVARCHAR(50) DEFAULT 'Pendiente',
        [Credenciales] NVARCHAR(50) DEFAULT 'Bloqueado',
        [Token_Verificacion] NVARCHAR(100) NULL
    );
END;
GO

-- Añadir columna Token_Verificacion si la tabla ya existía sin ella
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rpersoneros]') AND type in (N'U'))
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Rpersoneros]') AND name = 'Token_Verificacion')
BEGIN
    ALTER TABLE [dbo].[Rpersoneros] ADD [Token_Verificacion] NVARCHAR(100) NULL;
END;
GO

-- 2. Tabla de Coordinadores (dbo.Rcoordinadores) - Preserva compatibilidad 100%
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadores]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Rcoordinadores] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Fecha_de_Registro] DATETIME DEFAULT GETDATE(),
        [Nombres_y_Apellidos] NVARCHAR(255) NOT NULL,
        [DNI] NVARCHAR(20) NOT NULL UNIQUE,
        [Celular] NVARCHAR(20) NULL,
        [Correo_Electronico] NVARCHAR(255) NULL,
        [Usa_WhatsApp_en_su_celular] NVARCHAR(10) DEFAULT 'Sí',
        [Numero_WhatsApp_Alterno] NVARCHAR(20) NULL,
        [Distrito_donde_Vota] NVARCHAR(100) NULL,
        [Mesa_de_Sufragio] NVARCHAR(50) NULL,
        [Local_de_Votacion] NVARCHAR(255) NULL,
        [Rol_a_Desempenar] NVARCHAR(100) DEFAULT 'Coordinador de Local',
        [Distrito_Asignado] NVARCHAR(100) NULL,
        [Mesa_Asignada] NVARCHAR(50) NULL,
        [Local_de_Votacion_Asignado] NVARCHAR(255) NULL,
        [Tiene_Experiencia_como_Personero] NVARCHAR(10) DEFAULT 'No',
        [Cuenta_con_Movilidad_Propia] NVARCHAR(10) DEFAULT 'No',
        [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(10) DEFAULT 'Sí',
        [Video] INT DEFAULT 0,
        [PDF] INT DEFAULT 0,
        [Preguntas] NVARCHAR(50) DEFAULT 'Pendiente',
        [Credenciales] NVARCHAR(50) DEFAULT 'Bloqueado',
        [Token_Verificacion] NVARCHAR(100) NULL
    );
END;
GO

-- Añadir columna Token_Verificacion si la tabla ya existía sin ella
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadores]') AND type in (N'U'))
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadores]') AND name = 'Token_Verificacion')
BEGIN
    ALTER TABLE [dbo].[Rcoordinadores] ADD [Token_Verificacion] NVARCHAR(100) NULL;
END;
GO

-- 3. Tabla de Usuarios y Administradores (dbo.Usuarios)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Usuarios] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(100) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [FullName] NVARCHAR(255) NOT NULL,
        [Role] NVARCHAR(50) NOT NULL DEFAULT 'admin', -- 'superadmin', 'admin', 'supervisor'
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME DEFAULT GETDATE(),
        [LastLoginAt] DATETIME NULL
    );
END;
GO

-- 4. Tabla de Logs de Auditoría (dbo.AuditLogs)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AuditLogs] (
        [ID] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [Action] NVARCHAR(100) NOT NULL, -- 'REGISTER', 'LOGIN', 'PROGRESS_UPDATE', 'CREDENTIAL_GENERATED', 'VERIFY'
        [UserIdentifier] NVARCHAR(100) NULL, -- DNI o Username
        [Role] NVARCHAR(50) NULL,
        [Details] NVARCHAR(MAX) NULL,
        [IpAddress] NVARCHAR(50) NULL,
        [UserAgent] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME DEFAULT GETDATE()
    );
END;
GO
