-- Migración 004: Ampliar columnas de texto en Rpersoneros y Rcoordinadores para evitar truncamientos
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Rpersoneros')
BEGIN
    ALTER TABLE [dbo].[Rpersoneros] ALTER COLUMN [Usa_WhatsApp_en_su_celular] NVARCHAR(255);
    ALTER TABLE [dbo].[Rpersoneros] ALTER COLUMN [Numero_WhatsApp_Alterno] NVARCHAR(50);
    ALTER TABLE [dbo].[Rpersoneros] ALTER COLUMN [Tiene_Experiencia_como_Personero] NVARCHAR(50);
    ALTER TABLE [dbo].[Rpersoneros] ALTER COLUMN [Cuenta_con_Movilidad_Propia] NVARCHAR(50);
    ALTER TABLE [dbo].[Rpersoneros] ALTER COLUMN [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(500);
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Rcoordinadores')
BEGIN
    ALTER TABLE [dbo].[Rcoordinadores] ALTER COLUMN [Usa_WhatsApp_en_su_celular] NVARCHAR(255);
    ALTER TABLE [dbo].[Rcoordinadores] ALTER COLUMN [Numero_WhatsApp_Alterno] NVARCHAR(50);
    ALTER TABLE [dbo].[Rcoordinadores] ALTER COLUMN [Tiene_Experiencia_como_Personero] NVARCHAR(50);
    ALTER TABLE [dbo].[Rcoordinadores] ALTER COLUMN [Cuenta_con_Movilidad_Propia] NVARCHAR(50);
    ALTER TABLE [dbo].[Rcoordinadores] ALTER COLUMN [Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones] NVARCHAR(500);
END
GO
