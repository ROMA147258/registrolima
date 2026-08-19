-- Migración 005: Creación de la tabla dbo.Rcoordinadoresd (Coordinadores de Distritos)
-- Guarda todos los datos de registro cuando se presiona el botón 'Coordinador de Distritos'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadoresd]') AND type in (N'U'))
   AND NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoodinadoresd]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Rcoordinadoresd] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [Fecha_de_Registro] DATETIME DEFAULT GETDATE(),
        [Nombres_y_Apellidos] NVARCHAR(255) NOT NULL,
        [DNI] NVARCHAR(20) NOT NULL UNIQUE,
        [Celular] NVARCHAR(50) NULL,
        [Correo_Electronico] NVARCHAR(255) NULL,
        [Usa_WhatsApp_en_su_celular] NVARCHAR(255) DEFAULT 'Sí',
        [Numero_WhatsApp_Alterno] NVARCHAR(50) NULL,
        [Distrito_donde_Vota] NVARCHAR(100) NULL,
        [Mesa_de_Sufragio] NVARCHAR(50) NULL,
        [Local_de_Votacion] NVARCHAR(255) NULL,
        [Rol_a_Desempenar] NVARCHAR(100) DEFAULT 'Coordinador de Distritos',
        [Distrito_Asignado] NVARCHAR(100) NULL,
        [Mesa_Asignada] NVARCHAR(50) DEFAULT 'No aplica',
        [Local_de_Votacion_Asignado] NVARCHAR(255) DEFAULT 'No aplica',
        [Tiene_Experiencia_como_Personero] NVARCHAR(50) DEFAULT 'No',
        [Cuenta_con_Movilidad_Propia] NVARCHAR(50) DEFAULT 'No',
        [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
        [Video] INT DEFAULT 0,
        [PDF] INT DEFAULT 0,
        [Preguntas] NVARCHAR(50) DEFAULT 'Pendiente',
        [Credenciales] NVARCHAR(50) DEFAULT 'Bloqueado',
        [Token_Verificacion] NVARCHAR(100) NULL
    );
END;
GO

-- Índices de alto rendimiento para búsqueda por DNI y Distrito Asignado
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoordinadoresd]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoordinadoresd_DNI' AND object_id = OBJECT_ID('dbo.Rcoordinadoresd'))
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_Rcoordinadoresd_DNI] ON [dbo].[Rcoordinadoresd] ([DNI]);
    END;
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoordinadoresd_Distrito_Asignado' AND object_id = OBJECT_ID('dbo.Rcoordinadoresd'))
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_Rcoordinadoresd_Distrito_Asignado] ON [dbo].[Rcoordinadoresd] ([Distrito_Asignado]);
    END;
END;
GO

-- Soporte si ya existía como Rcoodinadoresd
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rcoodinadoresd]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoodinadoresd_DNI' AND object_id = OBJECT_ID('dbo.Rcoodinadoresd'))
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_Rcoodinadoresd_DNI] ON [dbo].[Rcoodinadoresd] ([DNI]);
    END;
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rcoodinadoresd_Distrito_Asignado' AND object_id = OBJECT_ID('dbo.Rcoodinadoresd'))
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_Rcoodinadoresd_Distrito_Asignado] ON [dbo].[Rcoodinadoresd] ([Distrito_Asignado]);
    END;
END;
GO

