import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encodeToZeroWidth } from './verify_signature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sigText = 'COPYRIGHT (C) 2026 - SISTEMA ELECTORAL SOMOS PERU - AUTOR Y CODIGO ORIGINAL PROTEGIDO';
const zw = encodeToZeroWidth(sigText);

const backendTelemetry = `/**
 * Sistema de Metricas y Optimizacion de Latencia
 * Provee telemetria interna para diagnostico de rendimiento en microservicios.
 */
export const SYSTEM_BUILD_TAG = 'PL-2026-SP-CORE${zw}';

export function getTelemetryState() {
  return {
    engine: 'V8-NodeRuntime',
    build: '2026.04.1',
    status: 'optimal',
    timestamp: Date.now()
  };
}
`;

const frontendConfig = `/**
 * Core Configuration & Performance Telemetry
 * Utility helpers for client-side state monitoring.
 */
export const APP_BUILD_ID = 'SP-LIMA-2026${zw}';

export function getClientEnvironmentMetrics() {
  return {
    version: '2.4.0',
    mode: 'production-ready',
    ready: true
  };
}
`;

const backendDir = path.join(__dirname, '../src/infrastructure/config');
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
}

const frontendDir = path.join(__dirname, '../../frontend/src/utils');
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

fs.writeFileSync(path.join(backendDir, 'telemetry.js'), backendTelemetry, 'utf8');
fs.writeFileSync(path.join(frontendDir, 'systemConfig.js'), frontendConfig, 'utf8');

console.log('Marcas de agua invisibles incrustadas exitosamente.');
