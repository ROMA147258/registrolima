-- ============================================================================
-- MIGRACIÓN 006: Creación exclusiva de la tabla rcoordinadoresz (Coordinador Zonal)
-- Elimina la tabla temporal rcoordinadorz y consolida en rcoordinadoresz
-- ============================================================================

-- 1. Eliminar la tabla rcoordinadorz si existía
DROP TABLE IF EXISTS rcoordinadorz CASCADE;

-- 2. Crear la tabla oficial rcoordinadoresz
CREATE TABLE IF NOT EXISTS rcoordinadoresz (
    id SERIAL PRIMARY KEY,
    fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombres_y_apellidos VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    celular VARCHAR(50),
    correo_electronico VARCHAR(255),
    usa_whatsapp_en_su_celular VARCHAR(255) DEFAULT 'Sí',
    numero_whatsapp_alterno VARCHAR(50),
    distrito_donde_vota VARCHAR(100),
    mesa_de_sufragio VARCHAR(50),
    local_de_votacion VARCHAR(255),
    rol_a_desempenar VARCHAR(100) DEFAULT 'Coordinador Zonal',
    distrito_asignado VARCHAR(100),
    mesa_asignada VARCHAR(50) DEFAULT 'No aplica',
    local_de_votacion_asignado TEXT,
    tiene_experiencia_como_personero VARCHAR(50) DEFAULT 'No',
    cuenta_con_movilidad_propia VARCHAR(50) DEFAULT 'No',
    se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecciones VARCHAR(500) DEFAULT 'Sí, me comprometo el 4 de Octubre del 2026',
    video INT DEFAULT 0,
    pdf INT DEFAULT 0,
    preguntas VARCHAR(50) DEFAULT 'Pendiente',
    credenciales VARCHAR(50) DEFAULT 'Bloqueado',
    token_verificacion VARCHAR(100)
);

-- 3. Índices de optimización
CREATE INDEX IF NOT EXISTS idx_rcoordinadoresz_dni ON rcoordinadoresz(dni);
CREATE INDEX IF NOT EXISTS idx_rcoordinadoresz_distrito ON rcoordinadoresz(distrito_asignado);
