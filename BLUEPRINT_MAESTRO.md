📦 BLUEPRINT MAESTRO: ARQUITECTURA Y ESPECIFICACIÓN TÉCNICA INTEGRAL
Propósito: Guía de especificación técnica definitiva para replicar una arquitectura escalable, segura, legalmente blindada, accesible y de ultra-alto rendimiento en cualquier proyecto de software moderno.
________________________________________
📑 ÍNDICE GENERAL DE IMPLEMENTACIÓN
text
1. DEFINICIÓN DE ARQUITECTURA GENERAL
   ├── 1.1 Patrón de Sistema (Cliente-Servidor 3 Capas Desacoplado / Headless) (Arquitectura Global)
   ├── 1.2 Patrón de Código Backend (Clean Architecture / Puertos y Adaptadores) (Backend - Dominio)
   ├── 1.3 Estándar Metodológico (12-Factor App) (Arquitectura y Despliegue)
   └── 1.4 Estructura Monorepo del Repositorio (Estructura de Carpetas)
2. MODELO DE CONEXIONES Y VARIABLES DE ENTORNO (.ENV)
   ├── 2.1 Regla de Oro: Preservación de Operatividad (.env Local Activo vs .env.example Público)
   ├── 2.2 Capa 1: Frontend ➔ Backend (.env Frontend con VITE_API_URL - Cero Secretos) (Frontend - Config)
   └── 2.3 Capa 2: Backend ➔ Base de Datos y Servicios (.env Backend con DATABASE_URL) (Backend - Config)
3. CAPA DE PERSISTENCIA Y DATOS (MOTOR FLEXIBLE Y AGNÓSTICO)
   ├── 3.1 Elección de Base de Datos (Relacional PostgreSQL / SQL Server o NoSQL) (Base de Datos)
   ├── 3.2 Patrón Repositorio (Repository Pattern) (Backend - Persistencia)
   ├── 3.3 Connection Pooling y Resiliencia de Conexión (Backend / BD - Silencioso / Sin UI)
   ├── 3.4 Seguridad a Nivel de Fila (Row Level Security - RLS) y Contexto de Sesión (Base de Datos / Backend - Silencioso)
   ├── 3.5 Pipeline de Migraciones Automatizadas e Idempotentes (schemamigrations) (Base de Datos - Scripts SQL)
   └── 3.6 Indexación Estratégica de Alto Rendimiento (B-Tree / Non-Clustered Indexes O(log N)) (Base de Datos - Silencioso)
4. MÓDULOS DE AUTENTICACIÓN, IDENTIDAD Y ACCESO (RBAC)
   ├── 4.1 Login Unificado con Detección Automática de Rol (Frontend UI Limpia + Backend Auth)
   ├── 4.2 Normalizador Inteligente de Credenciales (Anti-Errores Tipográficos y Tildes) (Backend - Lógica de Dominio)
   ├── 4.3 Tokens Criptográficos y Firmas Digitales (JWT con Clave Privada Oculta) (Backend - Criptografía)
   ├── 4.4 Firma de Autoría y Marca de Desarrollador Oficial (Frontend DevTools F12 + Backend Console - Sin UI)
   ├── 4.5 Control de Acceso Basado en Roles Jerárquicos (RBAC Estricto) (Backend - Middlewares)
   └── 4.6 Validación Geográfica / GPS a Sede Asignada (Opcional Haversine) (Backend / Servicio Opcional)
5. MÓDULOS DE SEGURIDAD, PROTECCIÓN DE RED Y CRIPTOGRAFÍA [LOS 20 CONTROLES MAESTROS]
   ├── 5.1 Cero Exposición de Secretos y Ocultamiento de API Keys (Backend - Cero Fugas a Cliente)
   ├── 5.2 Purgado de Secretos y Llaves en Control de Versiones (GIT Hygiene / .gitignore) (DevOps / Control de Versiones)
   ├── 5.3 Conexión Cifrada y Segura a Base de Datos (DATABASE_URL con SSL / TLS) (Backend / Red)
   ├── 5.4 Seguridad a Nivel de Fila (Row Level Security - RLS) y Aislamiento Multitenant (Base de Datos - Silencioso)
   ├── 5.5 Encriptación en Tránsito (HTTPS / TLS) y en Reposo (JWT HMAC-SHA256) (Infraestructura / Backend)
   ├── 5.6 Autenticación Forzosa y Verificación de Identidad desde Sesión Activa (req.user) (Backend - authMiddleware)
   ├── 5.7 Restricción Estricta de Acceso a Registros (RBAC Jerárquico + RLS Contextual) (Backend - requireRole)
   ├── 5.8 Protección contra Manipulación de Campos (Anti-Mass Assignment) (Backend - Dominio)
   ├── 5.9 Gestión de Sesión, Storage Técnico y Auto-Logout Preventivo (90s / 25s) (Frontend - Modal de Sesión / Hooks)
   ├── 5.10 Hasheo Criptográfico de Contraseñas y Credenciales (Bcrypt / Argon2) (Backend / BD - Silencioso)
   ├── 5.11 Límite Estricto de Acceso en Login (Rate Limiting 15 req/min) (Backend - Middleware Silencioso)
   ├── 5.12 Protección Antibot, Anti-DoS y Reglas Anti-Crawlers (300 req/min + robots.txt) (Backend / Infra - Silencioso)
   ├── 5.13 Consultas Parametrizadas y Declaraciones Preparadas ($1, $2 Anti-SQL Injection) (Backend - Repositorios)
   ├── 5.14 Validación Estricta de Inputs en Capa de Dominio (Regex / RFC / Trim) (Backend - ValidationDomainService)
   ├── 5.15 Escape Automático de Contenido de Usuario (Anti-XSS y JSX Seguro) (Frontend - Renderizado Limpio)
   ├── 5.16 Restricción de Carga de Archivos y Límites de Payload (Express 10MB + Compresión) (Backend - express.json)
   ├── 5.17 Recorte y Minimización de Respuestas de API (Data Minimization / DTOs) (Backend - DTOs sin Secretos)
   ├── 5.18 Cabeceras HTTP de Seguridad (Helmet, HSTS, CSP, X-Robots-Tag, Cache Inmutable) (Backend / Servidor)
   ├── 5.19 Enrutamiento Exclusivo sobre HTTPS / TLS Global (Infraestructura / Red)
   ├── 5.20 Auditoría y Escaneo Continuo de Dependencias Vulnerables (npm audit / SCA) (DevOps / Paquetes)
   ├── 5.21 Prevención de Condiciones de Carrera (Race Conditions) y Control ACID (Base de Datos + Backend + Botón UI disabled)
   └── 5.22 Búsqueda Instantánea con HASH en RAM (Bloom Filter O(1) con Murmur3/FNV-1a) (Backend / RAM - 100% Invisible en UI)
6. MÓDULOS DE ALTO RENDIMIENTO, ESCALABILIDAD Y PROCESAMIENTO ASÍNCRONO [LOS 10 PILARES]
   ├── 6.1 Escalado Vertical (Más CPU y RAM en Base de Datos y Servidor) (Infraestructura / Hardware)
   ├── 6.2 Escalado Horizontal (Más servidores pequeños e instancias Serverless) (Infraestructura / Serverless)
   ├── 6.3 Balanceo de Carga Multi-Capa (Edge Anycast CDN + PM2 Cluster / Nginx) (Infraestructura / Servidores)
   ├── 6.4 Autoescalado (La capacidad sigue a la demanda: Zero-to-Many Scale) (Infraestructura Cloud)
   ├── 6.5 Caché Multicapa (localStorage en cliente + RAM y Bloom Filters) (Frontend localStorage + Backend RAM)
   ├── 6.6 Red de Distribución (CDN) (Contenido estático en 300+ PoPs) (Infraestructura / Red)
   ├── 6.7 Replicación de Base de Datos (Las réplicas leen, el primario escribe + Pooler) (Base de Datos / Cloud)
   ├── 6.8 Fragmentación y Segmentación de BD (Sharding / Indexación por Tenant y Sucursal) (Base de Datos)
   ├── 6.9 Procesamiento Asíncrono, Lazy Loading y Algoritmos de Ordenamiento (Frontend React.lazy + Web Workers)
   ├── 6.10 Descomposición de Servicios (Divide el monolito en micro-aplicaciones) (Arquitectura Global)
   ├── 6.11 Cabeceras HTTP de Caché Inmutable (Cache-Control: public, immutable) (Backend / Servidor HTTP)
   ├── 6.12 Compresión de Archivos e Imágenes en el Cliente (~120 KB antes de subir) (Frontend - Utilidad Silenciosa)
   ├── 6.13 Sistema de Feature Flags (Zero-Downtime Feature Toggles) (Frontend / Backend Config)
   └── 6.14 Responsive Magazine Layout & Mobile Navigation Tabs (Frontend - 100% UI Visual con Animaciones Spring)
7. MONITOREO, TELEMETRÍA Y ALERTAS SILENCIOSAS
   ├── 7.1 Reporte Automático al Arranque del Servidor (Hardware, IP, Red, BD) (Backend - Telemetría Interna)
   └── 7.2 Disparadores de Alerta Inmediata por Correo / Webhook (Backend - Alertas Silenciosas)
8. MÓDULOS DE CUMPLIMIENTO LEGAL, PRIVACIDAD, ACCESIBILIDAD (A11Y) Y TRANSPARENCIA
   ├── 8.1 Políticas Legales y Contractuales (Privacidad Ley 29733/GDPR, Términos) (Frontend - Modales Legales / Enlaces)
   ├── 8.2 Gestión de Cookies y Consentimiento (Técnicas vs Rastreadores) (Frontend - Banner Accesible)
   ├── 8.3 Principio de Minimización de Datos y Consentimiento en Formularios (Frontend UI / Checkbox)
   ├── 8.4 Accesibilidad Web Universal (WCAG 2.1 AA/AAA, Contraste, Teclado, Alt Text) (Frontend - Estilos y Semántica)
   ├── 8.5 Integridad Comercial, Propiedad Intelectual y Veracidad de Información (Frontend - LegalFooter)
   └── 8.6 Matriz de Aplicabilidad Legal y Normativa por Tipo de Proyecto (Guía de Cumplimiento)
9. CHECKLIST DE EJECUCIÓN PASO A PASO PARA EL PROYECTO
10. PROTOCOLO DE INSTALACIÓN UI/UX PRO MAX, CONEXIÓN SQL Y PROMPT DE APLICACIÓN
________________________________________
🚫 REGLA DE ORO DE EXPERIENCIA DE USUARIO: CERO WIDGETS O LEYENDAS TÉCNICAS EN LA UI (Zero Tech-Exposure Principle)
El usuario final de la aplicación es un usuario de negocio (cliente, cajero, administrador, vendedor), NO un auditor de sistemas ni un evaluador de infraestructura.
Está ESTRICTAMENTE PROHIBIDO renderizar en la interfaz visual del Frontend (especialmente en el Login y Dashboards) tarjetas, badges, modales, etiquetas, contadores, candados decorativos o textos que hagan referencia a la tecnología o seguridad interna, tales como:
- ❌ 'Sesión protegida con cifrado SSL/TLS de alta seguridad' (o cualquier variante de cifrado)
- ❌ 'Conexión segura / Cifrado bancario / Encriptación AES-256'
- ❌ 'Protegido con JWT / Token Criptográfico Activo'
- ❌ 'Bloom Filter: Activo'
- ❌ 'Rate Limiting: 300 req/min'
- ❌ 'Row Level Security (RLS) On'
- ❌ 'B-Tree Index O(log N)'
- ❌ 'Algoritmo Murmur3 / FNV-1a'
- ❌ 'Connection Pooler Conectado'
- ❌ 'Idempotencia: Hash Activo'
- ❌ 'Race Condition Shield: Enabled'

Todos estos mecanismos son responsabilidades de INFRAESTRUCTURA Y BACKEND que deben operar de manera 100% SILENCIOSA E INVISIBLE. En el Frontend solo se renderizan los datos de negocio (catálogos, ventas, clientes, reportes, formularios) con un diseño limpio, profesional, minimalista y libre de textos técnicos artificiales.
________________________________________
🛠️ GUÍA DETALLADA DE IMPLEMENTACIÓN
1. DEFINICIÓN DE ARQUITECTURA GENERAL
•	Nombre Formal del Sistema: "Arquitectura Monorepo Full-Stack Desacoplada de 3 Capas (Three-Tier), basada en Clean Architecture (Puertos y Adaptadores), Serverless Edge Computing, Row Level Security (RLS), Lazy Loading Universal y los Principios de la Metodología 12-Factor App".
•	Estructura Monorepo Canónica:
text
mi-proyecto-app/
├── backend/                      # Servidor / API REST (Node.js, Express, etc.)
│   ├── .env                      # [PRIVADO/LOCAL] Credenciales activas de BD y llaves privadas (NUNCA en Git)
│   ├── .env.example              # Plantilla de variables específicas del backend
│   ├── migrations/               # Scripts SQL versionados (001_..., 002_indexes.sql, maestro)
│   ├── src/
│   │   ├── domain/               # Entidades de negocio puras
│   │   ├── application/
│   │   │   └── use-cases/        # Casos de uso (Login, Registrar, Capacitar, Consultar)
│   │   ├── infrastructure/       # Implementación técnica externa
│   │   │   ├── database/         # Pool SQL Server / PostgreSQL (Neon), withUserContext wrapper
│   │   │   ├── repositories/     # Repositorios SQL / NoSQL concretos
│   │   │   ├── cache/            # Bloom Filters en memoria RAM (Murmur3/FNV-1a)
│   │   │   └── services/         # Telemetría SMTP, servicios externos
│   │   └── interfaces/           # Controladores HTTP, middlewares (auth, rateLimit), rutas
│   ├── tests/                    # Pruebas unitarias e integración
│   └── package.json
│
├── frontend/                     # Aplicación Cliente (SPA / PWA - React, Vite, etc.)
│   ├── .env                      # [PRIVADO/LOCAL] Variables de conexión cliente (VITE_API_URL=/api)
│   ├── .env.example              # Plantilla pública del frontend
│   ├── public/
│   │   └── robots.txt            # Anti-indexación o Reglas de Rastreo
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # LoadingSpinner, CookieBanner, LegalFooter, Modales
│   │   │   └── forms/            # Form inputs accesibles con label y aria tags
│   │   ├── features/ / views/    # Módulos lazy loaded (Login, Registro, Dashboard)
│   │   ├── services/             # Clientes HTTP (API fetchers con caché local)
│   │   ├── workers/              # Tareas pesadas en segundo plano (Web Workers)
│   │   ├── hooks/                # Lógica de estado, eventos y auto-cierre de sesión
│   │   ├── utils/                # Normalizadores, hashes, Bloom Filters y helpers
│   │   └── context/              # AuthContext, ThemeContext
│   └── package.json
│
├── .env.example                  # [PÚBLICO] Plantilla Maestra Unificada con documentación completa (CERO secretos reales)
├── .gitignore                    # Reglas de blindaje criptográfico y exclusión total de .env en Git
├── arrancar_servidor.bat         # Script dual de automatización local (Backend + Frontend + IP Wi-Fi)
├── package.json                  # Orquestador monorepo raíz con scripts globales y autoría
└── README.md                     # Documentación general del repositorio
________________________________________
2. MODELO DE CONEXIONES Y VARIABLES DE ENTORNO (.ENV)
text
[ FRONTEND ] ──── ( VITE_API_URL ) ────► [ BACKEND ] ──── ( DATABASE_URL / SQL ) ────► [ BASE DE DATOS ]

•	REGLA FUNDAMENTAL DE OPERATIVIDAD Y SEGURIDAD:
	1. ¿El archivo .env se borra? ¡ROTUNDAMENTE NO! El archivo real .env DEBE existir localmente en el servidor / entorno de ejecución para que la base de datos conecte, los tokens JWT firmen y la aplicación funcione al 100%.
	2. ¿Qué significa "que el .env no se vea"? Significa que a través del archivo `.gitignore`, Git y los repositorios públicos tienen ESTRICTAMENTE PROHIBIDO rastrear o publicar los archivos `.env` reales, impidiendo cualquier fuga o robo de credenciales en internet.
	3. Dualidad Funcional:
	   - Archivo `.env` (Privado / Local): Contiene las contraseñas, URLs y cadenas de conexión reales del sistema. Permanece en tu máquina y servidor de producción.
	   - Archivo `.env.example` (Público / Guía): Contiene la lista exacta de variables pero con marcadores seguros (`TU_PASSWORD_AQUI`). Se sube a Git como manual para nuevos despliegues.

•	A. Frontend (frontend/.env):
env
# Conexión local / desarrollo (proxy Vite) o producción:
VITE_API_URL=/api
# NOTA DE SEGURIDAD: CERO llaves de servicio, contraseñas de BD o API keys privadas en este archivo.

•	B. Backend (backend/.env) — Estructura Estándar:
env
PORT=3000
NODE_ENV=development

# Base de Datos (PostgreSQL Neon Cloud con SSL Forzado)
DATABASE_URL=postgresql://neondb_owner:TU_PASSWORD_AQUI@ep-super-silence-axywhu8v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
DB_SERVER=ep-super-silence-axywhu8v-pooler.c-4.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USER=neondb_owner
DB_PASSWORD=TU_PASSWORD_AQUI
DB_SSL=true

# Seguridad & Autenticación Criptográfica
JWT_SECRET=super_secret_jwt_key_somos_peru_2026_conteo_lima

# Credenciales de Supervisión y Administración
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_admin
ERIC_USERNAME=eric
ERIC_PASSWORD=tu_password_eric
PAOLA_USERNAME=paola
PAOLA_PASSWORD=tu_password_paola
SUSANA_USERNAME=susana
SUSANA_PASSWORD=tu_password_susana

# Dominio / URL de Frontend Autorizado
FRONTEND_URL=http://localhost:3180

________________________________________
3. CAPA DE PERSISTENCIA Y DATOS (MOTOR FLEXIBLE Y AGNÓSTICO)
•	3.1 Motores Compatibles: Relacionales (PostgreSQL, Microsoft SQL Server, MySQL) y Documentales (MongoDB).
•	3.2 Patrón Repositorio: Contratos desacoplados de la infraestructura.
•	3.3 Connection Pooling: Pool de conexiones persistentes con reconexión automática y control de fugas (connection leak prevention).
•	3.4 Row Level Security (RLS) y Contexto de Sesión:
javascript
async function withUserContext(context = {}, callback) {
  const p = getPool();
  const client = await p.connect();
  try {
    const { userId = '', role = '', tenantId = '', orgId = '' } = context;
    if (userId || role) {
      await client.query('SELECT set_app_user_context($1, $2, $3, $4)', [userId, role, tenantId, orgId]);
    }
    return await callback(client);
  } finally {
    try { await client.query('SELECT clear_app_user_context()'); } catch (_) {}
    client.release();
  }
}
•	3.5 Migraciones Idempotentes: Registro en tabla schemamigrations de scripts SQL versionados.
•	3.6 Indexación de Tablas: Creación de índices NONCLUSTERED o B-Tree ($O(\log N)$) en columnas de alta consulta (user_id, status, email, created_at DESC) para evitar escaneos de tabla (Table Scans).
________________________________________
4. MÓDULOS DE AUTENTICACIÓN, IDENTIDAD Y ACCESO (RBAC)
1.	Login Unificado con Detección Automática de Rol (Cero Pestañas de Rol / Cero Botones Demo):
•	Interfaz Limpia y Profesional: Formulario único con dos campos: Identificador (Usuario, Correo o DNI/ID) y Contraseña.
•	Detección Automática en Servidor: El usuario NO elige su rol manualmente ni cambia de pestaña. El backend busca la cuenta en la base de datos, valida la contraseña hasheada y extrae automáticamente su rol (`ADMIN`, `SUPERVISOR`, `CAJERO`, etc.), emitiendo el JWT con sus permisos para redirigirlo a su vista correspondiente.
•	Prohibición Estricta de Pestañas y Demos: Prohibido incluir pestañas separadas ('Llave de Rol', 'Clave Maestra'), selectores manuales de rol o botones de 'Acceso rápido de prueba (1-clic)' en la pantalla de login.
•	CERO Insignias o Textos de Seguridad: Prohibido colocar leyendas, candados o badges que digan 'Sesión protegida con cifrado SSL/TLS de alta seguridad', 'Cifrado 256 bits', 'Seguridad bancaria' o similares. El formulario debe ser 100% sobrio y minimalista.
2.	Normalizador Inteligente de Credenciales: Limpieza de tildes, diacríticos, mayúsculas y espacios dobles.
3.	Tokens Criptográficos y Firmas Digitales (JWT):
•	La Clave Privada (JWT_SECRET): Se mantiene 100% oculta en el backend/.env. Jamás se envía al frontend ni a repositorios.
•	La Firma Digital Resultante: Es verificable en cada petición HTTP pero imposible de falsificar sin la clave secreta.
•	Comando de Verificación de Firma/Payload en Terminal:
powershell
# Decodificar el contenido de una firma JWT en PowerShell
$token = "TOKEN_JWT_AQUI"
$payload = $token.Split('.')[1]
while ($payload.Length % 4) { $payload += "=" }
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
4.	Firma de Autoría y Marca de Desarrollador Oficial:
•	En `package.json` (Frontend y Backend):
json
{
  "author": "Ricardo Alonso Rodriguez Malaver (DNI: 74909613)",
  "homepage": "https://github.com/ROMA147258"
}
•	En Frontend (DevTools F12 - `src/main.jsx`): Firma estética no intrusiva con nombre, DNI y carpeta del proyecto:
javascript
if (typeof window !== "undefined") {
  console.log(
    "%c 🚀 Proyecto: " + (window.location.pathname.split('/')[1] || "App") + " %c Desarrollado por Ricardo Alonso Rodriguez Malaver (DNI: 74909613) ",
    "background: #0f172a; color: #38bdf8; font-weight: bold; padding: 6px 12px; border-radius: 4px 0 0 4px; font-size: 12px;",
    "background: #0284c7; color: #ffffff; font-weight: bold; padding: 6px 12px; border-radius: 0 4px 4px 0; font-size: 12px;"
  );
}
•	En Backend (`src/server.js`): Banner de arranque limpio mediante TelemetryAlertService:
javascript
console.log(`
============================================================
 🛡️  SISTEMA INICIADO CON ÉXITO
 📁  Carpeta / Proyecto: ${process.cwd().split(/[\\\\/]/).pop()}
 👤  Autor: Ricardo Alonso Rodriguez Malaver (DNI: 74909613)
 📧  Contacto: ricardo27roma13@gmail.com
 🔒  Entorno: ${process.env.NODE_ENV || 'development'}
============================================================
`);
5.	RBAC Jerárquico: SuperAdmin > Administrador / Gerente > Supervisor > Operativo > Cliente / Usuario Final.
6.	Validación Geográfica / GPS a Sede Asignada (Opcional): Cálculo de distancia euclidiana o Haversine entre coordenadas del usuario y la sede.
________________________________________
5. MÓDULOS DE SEGURIDAD, PROTECCIÓN DE RED Y CRIPTOGRAFÍA [LOS 20 CONTROLES MAESTROS]
1.	Ocultar API Keys y Secretos en Cliente (Zero Frontend Secret Leak):
•	Ninguna clave privada, llave de servicio (IA, pagos) o credencial de BD reside en el cliente. El frontend solo consume endpoints a través de VITE_API_URL.
2.	Purgado de Secretos y Llaves en Control de Versiones (GIT Hygiene / .gitignore):
•	Blindaje Criptográfico en `.gitignore`: Exclusión automática de cualquier variante de `.env` (`.env`, `**/.env`, `**/.env.*`, `*.env`) asegurando que jamás se rastree en Git, permitiendo únicamente plantillas públicas (`!**/.env.example`).
•	Preservación de Operatividad: El `.gitignore` solo afecta el rastreo en Git; el archivo `.env` local permanece físicamente intacto en el disco para que Node.js y la Base de Datos operen sin interrupciones ni caídas de servicio.
3.	Conexión Cifrada y Segura a Base de Datos (DATABASE_URL con SSL / TLS):
•	Conexiones directas a la base de datos exclusivamente desde el backend a través de Connection Pooling (-pooler.tech) con cifrado SSL forzado (sslmode=require).
4.	Seguridad a Nivel de Fila (Row Level Security - RLS) y Aislamiento Multitenant:
•	Aislamiento criptográfico y lógico de filas en la BD según el rol y tenant del usuario conectado mediante el helper withUserContext(context, callback) invocando set_app_user_context($1, $2, $3, $4).
5.	Encriptación en Tránsito (HTTPS / TLS) y en Reposo:
•	Tokens de autenticación firmados criptográficamente mediante JWT (HMAC-SHA256) con expiración acotada y validación estricta de claims en cada petición.
6.	Autenticación Forzosa y Verificación de Sesión Activa:
•	Middleware authMiddleware obligatorio en todas las rutas privadas. El servidor extrae la identidad y permisos de req.user inyectado tras verificar la firma criptográfica, jamás confiando en identificadores enviados por el usuario.
7.	Restricción Estricta de Acceso a Registros (RBAC Jerárquico):
•	Control de acceso basado en roles con el middleware requireRole(['ADMIN', 'SUPERVISOR']). Mínimo privilegio aplicado: un usuario solo puede consultar y alterar registros bajo su jurisdicción u organización.
8.	Protección contra Manipulación de Campos (Anti-Mass Assignment):
•	El backend ignora campos sensibles enviados en el cuerpo del JSON (ej. role, isAdmin, tenantId, status) y los asigna estrictamente desde la lógica de dominio del servidor.
9.	Gestión de Sesión, Storage Técnico y Auto-Logout Preventivo:
•	Purga total de memoria, localStorage y sessionStorage al cerrar sesión.
•	Auto-logout preventivo: 90 segundos de inactividad física y 25 segundos en segundo plano, activando un modal popup de aviso con cuenta regresiva.
10.	Hasheo Criptográfico de Contraseñas y Credenciales:
•	Almacenamiento de contraseñas mediante funciones de derivación de claves unidireccionales de alta seguridad (bcrypt / Argon2 / SHA-256 con salt) impidiendo recuperación en texto plano.
11.	Límite Estricto de Acceso en Login (Anti-Fuerza Bruta):
•	Rate Limiting especializado en endpoints de autenticación: máximo 15 intentos por minuto por IP para bloquear ataques de diccionario y fuerza bruta automatizada.
12.	Protección Antibot, Anti-DoS y Reglas Anti-Crawlers:
•	Rate Limit Global (300 req/min) en toda la API, candados de idempotencia por hash de transacción y directivas robots.txt con meta-tags noindex, nofollow para evitar rastreo no autorizado.
13.	Consultas Parametrizadas y Declaraciones Preparadas ($1, $2 Anti-SQL Injection):
•	Uso estricto de placeholders parametrizados ($1, $2, $3...) en todos los repositorios (PostgreSQL / SQL Server / MySQL). Prohibición absoluta de concatenación de cadenas (${input}) en sentencias SQL.
14.	Validación Estricta de Inputs en Capa de Dominio:
•	ValidationDomainService: Validación por expresiones regulares (/^\d{8,12}$/), saneamiento numérico en teléfonos (replace(/[^\d+]/g, '')), normalización RFC de email y truncado de espacios (.trim()).
15.	Escape Automático de Contenido de Usuario (Anti-XSS):
•	Renderizado seguro en frontend mediante JSX nativo, bloqueando la inyección de código JavaScript o etiquetas <script> maliciosas.
16.	Restricción de Carga de Archivos y Límites de Payload:
•	Restricción de tamaño en express.json({ limit: '10mb' }) para evitar saturación de buffer y compresión en cliente a ~120 KB antes de cualquier subida.
17.	Recorte y Minimización de Respuestas de API (Data Minimization):
•	Proyección controlada en consultas SELECT (DTOs) devolviendo únicamente los campos indispensables para la vista, evitando la fuga de hashes de contraseña o campos confidenciales.
18.	Cabeceras HTTP de Seguridad (Security Headers):
•	Implementación de cabeceras seguras (Helmet, HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy) y cabeceras de caché inmutable para assets estáticos.
19.	Enrutamiento Exclusivo sobre HTTPS / TLS Global:
•	Obligatoriedad de HTTPS en todo el ecosistema (cliente, servidor y CDN perimetral Anycast).
20.	Auditoría y Escaneo Continuo de Dependencias Vulnerables (npm audit / SCA):
•	Revisión y actualización de paquetes mediante npm audit en frontend y backend para mitigar vulnerabilidades de la cadena de suministro de software.
21.	Prevención de Condiciones de Carrera (Race Conditions) y Control de Concurrencia ACID:
•	Restricciones UNIQUE en Base de Datos: Claves únicas a nivel de motor (uq_user_dni, uq_sku_tenant) que garantizan que dos peticiones simultáneas en el mismo microsegundo jamás dupliquen registros (rechazo atómico 23505).
•	Operaciones Atómicas Directas (Zero Check-Then-Act): Actualizaciones en una sola instrucción indivisible que valida y descuenta stock o cupos a nivel de hardware:
javascript
// Ejemplo Canónico Universal para E-commerce, SaaS, POS y Reservas
const result = await pool.query(`
  UPDATE inventory_items 
  SET stock = stock - $1 
  WHERE id = $2 AND stock >= $1 
  RETURNING stock;
`, [requestedQuantity, itemId]);

if (result.rowCount === 0) {
  throw new Error('Conflicto de concurrencia: Stock o recurso agotado simultáneamente por otro usuario.');
}
•	Bloqueo Pesimista en Transacciones (SELECT ... FOR UPDATE): Bloqueo exclusivo de fila durante asignaciones críticas de recursos o conciliación financiera hasta que se ejecute el COMMIT:
sql
-- Ejemplo Canónico de Transacción ACID Anti-Race Condition
BEGIN;
SELECT * FROM available_slots WHERE slot_id = $1 FOR UPDATE;
-- El motor bloquea la fila para otros usuarios hasta que se confirme la transacción
INSERT INTO reservations (user_id, slot_id) VALUES ($2, $1);
COMMIT;
•	Candados de Idempotencia en Frontend: Deshabilitación inmediata de botones al primer clic (disabled={isLoading}) para evitar peticiones duplicadas por reintentos de red o doble clic accidental:
jsx
// Ejemplo Canónico en React (Botón con Bloqueo de Concurrencia)
<button 
  type="submit" 
  disabled={isLoading} 
  className="btn-primary"
>
  {isLoading ? <LoadingSpinner size="sm" /> : 'Confirmar Transacción'}
</button>
22.	Búsqueda Instantánea con HASH en RAM ($O(1)$) vs B-Tree ($O(\log N)$) vs LIKE Scan ($O(N)$):
•	HASH / Bloom Filter en RAM ($O(1)$): Calcula la dirección exacta de memoria del código o ID con funciones Murmur3/FNV-1a. Salta directamente al dato en 0.0001 ms sin recorrer registros.
•	Índice B-Tree en SQL ($O(\log N)$): Búsqueda binaria jerárquica en base de datos para autocompletado y filtros territoriales.
•	LIKE '%texto%' ($O(N \times M)$): Escaneo secuencial para texto libre cuando no hay clave exacta.
________________________________________
6. MÓDULOS DE ALTO RENDIMIENTO, ESCALABILIDAD Y PROCESAMIENTO ASÍNCRONO (LOS 10 PILARES)
1.	Escalado Vertical (Más CPU y RAM en un servidor):
•	Asignación elástica de vCPU y memoria RAM en la base de datos (Neon PostgreSQL / SQL Server) para procesar consultas masivas sin cuellos de botella de cómputo.
2.	Escalado Horizontal (Más servidores pequeños):
•	Implementación Serverless en Vercel Edge. Si miles de usuarios se conectan en simultáneo, el sistema crea dinámicamente cientos de micro-instancias en paralelo.
3.	Balanceo de Carga Multi-Capa (Reparte el tráfico entre servidores):
•	Capa Frontend (Edge Load Balancing & CDN): Distribución perimetral de peticiones mediante Anycast DNS y Edge Gateways de Cloudflare/Vercel hacia el nodo más cercano al usuario.
•	Capa Backend (PM2 Cluster / Nginx Reverse Proxy): Balanceo Round-Robin local o distribuido entre múltiples núcleos de CPU mediante PM2 (pm2 start src/server.js -i max) o balanceadores de carga en la nube (AWS ALB / Nginx).
4.	Autoescalado (La capacidad sigue a la demanda):
•	Escalado automático Zero-to-Many: la infraestructura se expande ante picos de concurrencia y se contrae a 0 en reposo para optimizar costos.
5.	Caché Multicapa (Guarda datos frecuentes en memoria):
•	Cliente: localStorage para catálogos estáticos (categorías, departamentos, productos maestros) con respuesta instantánea a 0 ms.
•	Servidor: Filtros de Bloom en memoria RAM ($O(1)$) para descartar peticiones inexistentes en microsegundos sin consultar la base de datos.
6.	Red de Distribución (CDN) (Acerca el contenido a tus usuarios):
•	Distribución del frontend y assets estáticos (HTML, JS, CSS, PDF, imágenes) en más de 300 puntos de presencia (PoPs) globales.
7.	Replicación de Base de Datos (Las réplicas leen; el primario escribe):
•	Separación de almacenamiento y cómputo con Read Replicas y Connection Pooling (-pooler.tech) para tolerar alta concurrencia de lectura.
8.	Fragmentación y Segmentación de BD (Sharding / Reparte datos entre varias bases o esquemas):
•	Segmentación lógica particionada indexada por tenant o sucursal (IX_Tenant_Status, IX_Category_Created) para búsquedas directas tipo Index Seek.
9.	Procesamiento Asíncrono, Lazy Loading y Algoritmos de Ordenamiento:
•	Lazy Loading Universal: Carga diferida con React.lazy() y <Suspense> reduciendo el paquete inicial a < 40 KB.
•	Web Workers (Zero UI Freeze): Generación pesada de reportes Excel (.xlsx) y PDF en hilos separados con transferencia de memoria binaria $O(1)$ (Transferable ArrayBuffer).
•	Jerarquía de Algoritmos de Ordenamiento:
  - Radix Sort ($O(N \cdot K)$): El más rápido absoluto para ordenamiento de listas numéricas (IDs numéricos, códigos postales, correlativos) sin comparaciones.
  - QuickSort / Timsort ($O(N \log N)$): Algoritmo de uso general en JavaScript para ordenar catálogos jerárquicos, rankings y tablas dinámicas en < 2 ms.
  - Insertion Sort ($O(N)$ en datos casi ordenados): Inserción incremental rápida en colecciones pequeñas.
javascript
// Implementación Canónica de Lazy Loading en App.jsx
import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
const RegistrationView = lazy(() => import('./features/registration/RegistrationView.jsx'));
const LoginView = lazy(() => import('./features/authentication/LoginView.jsx'));
const DashboardView = lazy(() => import('./features/dashboard/DashboardView.jsx'));

// En el Render:
<Suspense fallback={<LoadingSpinner message="Cargando módulo..." />}>
  <LoginView />
</Suspense>
10.	Descomposición de Servicios (Divide el monolito en servicios):
•	Arquitectura de 3 micro-aplicaciones desacopladas:
  - Módulo 1: app-portal-web (Registro, Autenticación y Catálogos Maestros).
  - Módulo 2: app-operaciones-mobile (Operaciones en tiempo real, POS o Captura de Datos/QR).
  - Módulo 3: app-analytics-dashboard (Panel de Control Gerencial, War Room y Consolidación de Resultados).
11.	Cabeceras HTTP Inmutables: Cache-Control: public, max-age=31536000, immutable para recursos estáticos versionados.
12.	Compresión de Archivos en Cliente: Optimización automática de imágenes en el navegador a ~120 KB antes de la transmisión HTTP.
13.	Sistema de Feature Flags / Banderas de Características (Zero-Downtime Feature Toggles):
•	Control dinámico de módulos y funciones en caliente mediante variables de entorno (VITE_FEATURE_*) y estados de dominio sin necesidad de redesplegar código:
javascript
// Configuración centralizada de Feature Flags en Frontend
export const FEATURE_FLAGS = {
  ENABLE_TRAINING_MODULE: import.meta.env.VITE_FEATURE_TRAINING !== 'false',
  ENABLE_PUBLIC_VERIFICATION: import.meta.env.VITE_FEATURE_VERIFY !== 'false',
  ENABLE_CERTIFICATE_DOWNLOAD: import.meta.env.VITE_FEATURE_CERTIFICATES === 'true',
  MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === 'true'
};
14.	Responsive Magazine Layout & Mobile Navigation Tabs (Animaciones Spring):
•	Magazine Layout & Bento Grid: Maquetación editorial asimétrica en cuadrículas CSS Grid y Flexbox responsive, con tarjetas jerárquicas destacadas (Hero Cards), micro-interacciones hover y tipografía de alto contraste.
•	Mobile Navigation Tabs flotantes: Barra de navegación inferior fija para smartphones con animaciones físicas tipo Spring (rebote elástico suave mediante Motion / CSS cubic-bezier), indicador activo deslizante (sliding pill indicator) y accesibilidad táctil con feedback visual inmediato.
________________________________________
7. MONITOREO, TELEMETRÍA Y ALERTAS SILENCIOSAS
1.	Reporte Automático de Arranque (TelemetryAlertService): Diagnóstico de CPU, memoria RAM, IP, red y estado de conexión a la BD enviado por correo/webhook al inicializar el servidor.
2.	Disparadores de Alerta Inmediata: Notificación automática ante excepciones críticas no controladas o intentos reiterados de intrusión.
________________________________________
8. CUMPLIMIENTO LEGAL, PRIVACIDAD, ACCESIBILIDAD (A11Y) Y TRANSPARENCIA
1.	Políticas Legales y Contractuales:
•	Política de Privacidad: Conforme a la ley local de protección de datos (ej. Ley N° 29733 en Perú / GDPR en Europa), informando el banco de datos, finalidad sin fines de lucro, no cesión comercial y procedimiento de derechos ARCO.
•	Términos y Condiciones: Reglas de uso de la plataforma, deberes de los usuarios, custodia de credenciales y propiedad intelectual.
•	Política de Reembolsos: Solo exigible si la aplicación procesa ventas, cobros o suscripciones de pago (no aplica a aplicaciones de gestión interna o plataformas gratuitas).
2.	Gestión de Cookies y Consentimiento:
•	Cookies Técnicas: Uso exclusivo de almacenamiento local para tokens JWT y seguridad.
•	Banner Informativo / Consentimiento: Banner accesible para notificar el uso de almacenamiento técnico y seguridad sin rastreadores publicitarios.
3.	Minimización de Datos y Consentimiento en Formularios:
•	Solo solicitar datos estrictamente necesarios para la función operativa.
•	Casilla de verificación (checkbox) obligatoria de consentimiento libre, previo y expreso con enlace a Privacidad y Términos antes del envío.
4.	Accesibilidad Web Universal (WCAG 2.1 AA / AAA):
•	Contraste de Colores: Mínimo 4.5:1 para texto normal y 3:1 para elementos de interfaz.
•	Texto Alternativo (alt): Atributos descriptivos en todas las imágenes y logotipos.
•	Navegación Completa por Teclado: Operatividad con Tab, Enter, Escape y visible focus ring (:focus-visible).
•	Etiquetas Claras: Inputs asociados con <label htmlFor="...">, id y atributos ARIA (aria-required, aria-invalid).
5.	Transparencia Institucional y Veracidad:
•	Identificación de la Razón Social / Entidad Responsable en el pie de página (LegalFooter).
•	Prohibición de testimonios simulados, claims sin respaldo y suplantación de identidad.
________________________________________
8.6 📊 MATRIZ DE APLICABILIDAD LEGAL POR TIPO DE PROYECTO
Requisito / Módulo	📱 App Operativa / Gestión Interna	🛒 Tienda Online / E-commerce	🏢 ERP / SaaS B2B	📰 Blog / Portal Web
Política de Privacidad (LPDP/GDPR)	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Términos y Condiciones	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	🟡 Recomendado
Consentimiento en Formularios	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Minimización de Datos	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Accesibilidad (WCAG 2.1 AA)	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Copyright y Datos del Responsable	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Lazy Loading & Code Splitting	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO	✅ OBLIGATORIO
Banner de Cookies Publicitarias	❌ No aplica (Uso técnico)	✅ OBLIGATORIO	🟡 Opcional	✅ OBLIGATORIO
Política de Reembolsos / Pagos	❌ No aplica (Sin cobros)	✅ OBLIGATORIO	✅ OBLIGATORIO	❌ No aplica
Anti-Reseñas Falsas / Claims	❌ No aplica (No comercial)	✅ OBLIGATORIO	✅ OBLIGATORIO	🟡 Opcional
________________________________________
9. 📋 CHECKLIST DE EJECUCIÓN PASO A PASO
text
FASE 1: ESTRUCTURA Y ENTORNO
[ ] Crear estructura Monorepo (/frontend y /backend).
[ ] Configurar frontend/.env con VITE_API_URL (Cero API Keys secretas en cliente).
[ ] Configurar backend/.env con DATABASE_URL, JWT_SECRET, ADMIN_MASTER_KEY, GEMINI_API_KEY y SMTP.
FASE 2: BACKEND, BASE DE DATOS Y RLS
[ ] Implementar Clean Architecture (domain, use-cases, repositories, interfaces).
[ ] Configurar Connection Pooling hacia la base de datos (PostgreSQL / SQL Server).
[ ] Implementar tabla 'schemamigrations' y migración secuencial de índices de alto rendimiento.
[ ] Habilitar Row Level Security (RLS) y helper 'withUserContext' en la capa de datos.
[ ] Aplicar consultas parametrizadas ($1, $2...) en todos los repositorios para blindaje 100% anti-inyección SQL.
[ ] Configurar Doble Rate Limiting (Global 300 req/min + Login 15 req/min).
[ ] Implementar Bloom Filter en memoria RAM con hashes matemáticos (Murmur3/FNV-1a).
[ ] Integrar Gateway de IA Server-Side sin filtrar credenciales al cliente.
[ ] Integrar TelemetryAlertService para reporte de arranque.
[ ] Ejecutar auditoría de dependencias (npm audit) y mitigar paquetes vulnerables.
[ ] Configurar prevención de Race Conditions (Constraints UNIQUE, Updates atómicos, FOR UPDATE y candados UI).
FASE 3: AUTENTICACIÓN Y SEGURIDAD [LOS 20 CONTROLES MAESTROS]
[ ] Ocultar API keys privadas en backend y purgar secrets del historial GIT (.gitignore).
[ ] Configurar conexión segura y cifrada a base de datos con SSL (DATABASE_URL sslmode=require).
[ ] Sanitización estricta de entradas en la capa de Dominio (ValidationDomainService) con regex numéricos, email RFC y límites de payload.
[ ] Verificar identidad en backend exclusivamente desde req.user (JWT verificado), jamás del body (Anti-Mass Assignment).
[ ] Configurar Mínimo Privilegio (RBAC) en rutas privadas mediante middleware requireRole().
[ ] Configurar respuestas de error homogéneas/genéricas anti-enumeración de usuarios.
[ ] Implementar Login Unificado con Detección Automática de Rol en Backend (Cero pestañas de rol, cero botones demo de 1-clic) y Rate Limiting estricto (15 req/min).
[ ] Configurar Candado Anti-Doble Envío (Idempotencia mediante Hash de transacción) y directivas antibot (robots.txt noindex).
[ ] Escapar contenido de usuario en Frontend (JSX seguro anti-XSS) y restringir subida de archivos (~120 KB).
[ ] Proyectar DTOs en APIs para recorte y minimización de respuestas (Data Minimization).
[ ] Configurar Cabeceras HTTP de Seguridad (Helmet, CSP, Cache-Control inmutable) y HTTPS forzado.
FASE 4: CLIENTE (FRONTEND), RENDIMIENTO Y ESCALABILIDAD (10 PILARES)
[ ] Implementar Lazy Loading con React.lazy() y <Suspense> en todas las vistas y modales pesados.
[ ] Reducir el bundle inicial a < 40 KB con Code Splitting eficiente.
[ ] Configurar Web Worker para exportaciones pesadas (Excel/PDF) con Zero UI Freeze y ArrayBuffer O(1).
[ ] Implementar caché de catálogos en localStorage (0 ms de latencia).
[ ] Implementar sistema de Feature Flags centralizado para control de módulos sin re-despliegue.
[ ] Configurar balanceo de carga multi-capa (Edge CDN Anycast + PM2 Cluster / Nginx Round-Robin).
[ ] Implementar auto-cierre de sesión (90s inactividad + 25s background con Modal Popup).
[ ] Integrar compresión de imágenes en el cliente (~120 KB) antes de subir a la API.
[ ] Aplicar accesibilidad WCAG 2.1 AA: contraste accesible, navegación por teclado, etiquetas y alt text.
[ ] Configurar directiva 'robots.txt' y meta-tag 'noindex, nofollow' en paneles privados.
[ ] Diseñar Responsive Magazine Layout (Bento Grid) y Mobile Navigation Tabs con animaciones elásticas Spring.
[ ] Distribuir frontend a través de CDN Global Anycast con cabeceras de caché inmutable.
FASE 5: CUMPLIMIENTO LEGAL Y TRANSPARENCIA
[ ] Redactar e integrar Política de Privacidad (Ley N° 29733/GDPR) y Términos y Condiciones.
[ ] Añadir casilla obligatoria de consentimiento informado en formularios de captura.
[ ] Integrar CookieBanner para almacenamiento técnico y seguridad.
[ ] Integrar LegalFooter accesible con datos de la entidad responsable, copyright y enlaces legales.
________________________________________
10. 🎨 PROTOCOLO DE INSTALACIÓN UI/UX PRO MAX, CONEXIÓN SQL Y PROMPT DE APLICACIÓN
A. Pasos de Instalación y Verificación de Herramientas
Ejecutar la siguiente secuencia en la raíz del proyecto:
powershell
# 1. Instalación del paquete oficial actualizado
npm install -g ui-ux-pro-max-cli@latest
# 2. Comprobar la versión instalada
uipro --version
# 3. Instalar específicamente para Antigravity
uipro init --ai antigravity
# 4. Comprobar que se instalaron las skills
Get-ChildItem .agents\skills
# Deberías encontrar la carpeta: ui-ux-pro-max
B. Prompt Maestro de Aplicación UI/UX y Persistencia SQL
text
Analiza la interfaz actual de este proyecto y utiliza UI UX Pro Max para mejorar únicamente el diseño UI/UX.
No cambies la lógica de negocio.
No elimines funcionalidades existentes.
No cambies endpoints, base de datos ni APIs.
No elimines botones, formularios, tablas, modales ni componentes funcionales.
Primero analiza el proyecto y propón el sistema de diseño que vas a aplicar:
- Login Unificado y CERO Badges de Seguridad: Formulario único con solo dos campos (Identificador y Contraseña) y botón de ingreso. El backend determina automáticamente el rol del usuario desde la base de datos al validar credenciales y emite el JWT correspondiente. Estrictamente PROHIBIDO generar pestañas ('Llave de Rol', 'Clave Maestra'), botones demo ('Acceso Rápido 1-Clic') o leyendas/insignias de seguridad como 'Sesión protegida con cifrado SSL/TLS de alta seguridad', 'Cifrado 256 bits', 'Seguridad bancaria' o íconos de candado con texto de cifrado. El Login debe ser 100% limpio, sobrio y minimalista.
- CERO WIDGETS O LEYENDAS TÉCNICAS EN LA UI (Zero Tech Exposure): El Bloom Filter, Rate Limiting, RLS, Murmur3, B-Tree, Connection Pooler y candados de concurrencia deben funcionar 100% de forma interna y silenciosa en el backend/BD. Está ESTRICTAMENTE PROHIBIDO mostrar tarjetas, badges, modales, etiquetas o contadores en la interfaz que digan 'Bloom Filter Activo', 'Rate Limit: 300 req/min', 'RLS Habilitado', 'O(1)', 'Cifrado SSL activo' o cualquier métrica de ingeniería de software. La UI es exclusivamente para datos de negocio.
- Responsive Web Design Completo & Magazine Layout (Bento Grid) con Mobile Navigation Tabs:
  * RWD Universal: Adaptabilidad fluida y sin desbordamientos en smartphones, tablets, laptops y monitores ultrawide.
  * Magazine Layout: Maquetación editorial asimétrica para catálogos y dashboards (tarjetas Bento Grid, Hero Cards destacadas, tipografía premium y alta jerarquía visual).
  * Mobile Navigation Tabs: Barra de navegación inferior fija para móviles con animaciones físicas tipo Spring / rebote elástico suave, indicador activo deslizante (sliding pill) y feedback táctil/visual instantáneo.
- Modo Día y Noche (Light / Dark mode) con contrastes accesibles (WCAG AA/AAA).
- Accesibilidad Universal: navegación completa por teclado, etiquetas claras en inputs, textos alternativos (alt) e indicadores de foco visibles.
- Carga Diferida Universal (Lazy Loading): uso de React.lazy y Suspense con Spinners visuales elegantes para carga instantánea.
- Principio de Minimización: formularios limpios con solo los datos estrictamente necesarios y consentimiento informado (Ley de Protección de Datos).
- Paginación o Carga Progresiva: Solo incluir si la vista maneja catálogos masivos no segmentados (E-commerce / Facturación / Logs); en vistas operativas locales priorizar búsqueda directa instantánea.
- Protección de sesión por inactividad física (90s) y segundo plano (25s): que se visualice mediante un Modal Popup emergente con cuenta regresiva, barra de progreso y botones de acción (sin utilizar la palabra "bancaria").
- Firma Oficial de Autor y Proyecto: Configura en `package.json` el author: "Ricardo Alonso Rodriguez Malaver (DNI: 74909613)", agrega el banner estilizado en consola web (`frontend/src/main.jsx`) identificando el nombre de la carpeta del proyecto y el autor con su DNI, e inserta el banner de inicio en `backend/src/server.js`.
- Prevención de Race Conditions y Concurrencia: Bloqueo de botones en Frontend ante envío (disabled={isLoading}), constraints UNIQUE a nivel de BD y sentencias atómicas/transaccionales para evitar doble asignación de cupos, sobreventa de stock o duplicidad de registros.
- Conexión a Base de Datos SQL: Conectar a la base de datos SQL mediante Connection Pooling usando las credenciales configuradas (Usuario: data, Clave: TECNOlogia2026.$).
