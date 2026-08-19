# Somos Perú 2026 — Sistema de Registro y Control Electoral

Plataforma integral para el registro, capacitación, acreditación oficial y monitoreo en tiempo real de Personeros y Coordinadores del **Partido Democrático Somos Perú** para las Elecciones Regionales y Municipales 2026.

---

## 🏛️ Arquitectura del Sistema

El sistema está construido siguiendo los principios de **Clean Architecture**:

- **Frontend**: React 18 + Vite, CSS Tokens (Slate Dark / Light), Chart.js, QRCode, Canvas Confetti.
- **Backend**: Node.js + Express con arquitectura hexagonal:
  - `src/domain/`: Entidades y reglas de negocio puras (`Personero`, `Coordinador`, `User`, `AuditLog`).
  - `src/application/`: Casos de uso (`RegisterPersonero`, `Login`, `UpdateTrainingProgress`, `VerifyCredential`, `GetDashboardData`, `ExportRecords`).
  - `src/infrastructure/`: Repositorios SQL Server, Pool de conexiones con reconexión automática, Migraciones versionadas, Generador QR y exportador Excel.
  - `src/interfaces/`: Controladores delgados, Routers RESTful, Middlewares de autenticación JWT y manejo centralizado de errores.
- **Base de Datos**: Microsoft SQL Server 2022 / Express (`conteo`), con soporte para tablas `dbo.Rpersoneros`, `dbo.Rcoordinadores`, `dbo.Usuarios`, `dbo.AuditLogs`, `dbo.SchemaMigrations`.

---

## 📁 Estructura del Proyecto

```
registroconteolima/
├── _backup_original/                     # Copia de seguridad intacta del sistema previo a la reingeniería
├── images/                               # Capturas de pantalla originales de referencia visual
├── backend/                              # Backend Node.js + Express con Clean Architecture
│   ├── migrations/                       # Migraciones SQL versionadas e idempotentes
│   ├── src/                              # Código fuente (domain, application, infrastructure, interfaces)
│   ├── tests/                            # Pruebas unitarias de dominio y validaciones
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                             # Frontend React + Vite
│   ├── public/                           # Assets canónicos (logos, videos tutoriales, manuales PDF)
│   ├── src/                              # Componentes React, Features, Contexts, Hooks, Services
│   ├── Dockerfile
│   └── package.json
├── scripts/                              # Scripts automatizados de Windows
│   ├── iniciar_servidor.bat              # Inicia Backend + Frontend + Detección de IP Wi-Fi
│   ├── compartir_pagina.bat              # Crea túnel Cloudflare HTTPS público
│   └── compilar.bat                      # Compilación de producción
├── iniciar_servidor.bat                  # Lanzador principal en la raíz
├── docker-compose.yml                    # Orquestación con Docker Compose
└── README.md
```

---

## 🚀 Puesta en Marcha Rápida

### Opción 1: En Windows con Scripts (Recomendado)
1. Haz doble clic sobre **`iniciar_servidor.bat`**.
2. El script:
   - Liberará los puertos `3180` y `3000`.
   - Iniciará el Backend SQL Server en el puerto `3000`.
   - Iniciará el Frontend React en el puerto `3180`.
   - Abrirá automáticamente tu navegador en `http://localhost:3180`.
   - Mostrará tu dirección IP local para conectar celulares conectados a la misma red Wi-Fi (`http://[TU_IP]:3180`).

### Opción 2: Con Docker Compose
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:3180`
- Backend: `http://localhost:3000/api`
- SQL Server: `localhost:1433`

---

## 🔒 Variables de Entorno (`backend/.env`)

| Variable | Valor por defecto | Descripción |
| :--- | :--- | :--- |
| `PORT` | `3000` | Puerto del servidor API |
| `DB_SERVER` | `localhost` | Instancia de SQL Server |
| `DB_NAME` | `conteo` | Nombre de la base de datos |
| `DB_USER` | `data` | Usuario SQL Server |
| `DB_PASSWORD` | `TECNOlogia2026.$` | Contraseña SQL Server |
| `JWT_SECRET` | *(secreto)* | Clave para tokens de sesión |
| `ADMIN_USERNAME` | `admin` | Usuario administrador |
| `ADMIN_PASSWORD` | `admin123` | Contraseña administrador |
| `ERIC_USERNAME` | `eric` | Usuario Coordinador Central |
| `ERIC_PASSWORD` | `eric123` | Contraseña Coordinador Central |

---

## 🧪 Ejecución de Pruebas

```bash
# Pruebas unitarias de Backend
cd backend
npm test

# Compilación de Frontend
cd ../frontend
npm run build
```

---

## 🔄 Rollback al Sistema Original

Si se requiere restaurar el sistema anterior en cualquier momento, todos los archivos originales se encuentran inmutables en:
`E:\conteolima\registroconteolima\_backup_original\`
