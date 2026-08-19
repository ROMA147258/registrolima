-- ==============================================================================
-- MIGRACIÓN 003: TABLAS DE CATÁLOGOS Y COMPATIBILIDAD
-- ==============================================================================

-- 1. Tabla de Distritos si no existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Distritos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Distritos] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Nombre] NVARCHAR(100) NOT NULL UNIQUE,
        [Meta] INT NOT NULL DEFAULT 100,
        [Activo] BIT NOT NULL DEFAULT 1
    );
END;
GO

-- 2. Tabla de Locales de Votación si no existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LocalesVotacion]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LocalesVotacion] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Distrito] NVARCHAR(100) NOT NULL,
        [NombreLocal] NVARCHAR(255) NOT NULL,
        [Direccion] NVARCHAR(255) NULL,
        [Activo] BIT NOT NULL DEFAULT 1
    );
END;
GO
