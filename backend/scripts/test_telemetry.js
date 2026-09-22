import { dispatchTelemetryAlert, TelemetryAlertService } from '../src/infrastructure/services/TelemetryAlertService.js';

console.log('📡 Iniciando prueba del Sistema de Alertas Automáticas y Telemetría Activa...');
console.log(`📧 Destinatario de Alertas: ${TelemetryAlertService.TELEMETRY_CONFIG.ALERT_RECIPIENT}`);

const metrics = TelemetryAlertService.getSystemMetrics();
console.log('\n--- Métricas del Servidor Capturadas ---');
console.log(`• Hostname:     ${metrics.hostname}`);
console.log(`• Plataforma:   ${metrics.platform}`);
console.log(`• IPs de Red:   ${metrics.networkIPs}`);
console.log(`• Hora Local:   ${metrics.localTime}`);
console.log(`• Memoria Libre:${metrics.freeMemoryMB} MB de ${metrics.totalMemoryMB} MB`);

console.log('\n🚀 Despachando alerta de prueba...');
dispatchTelemetryAlert({
  eventType: 'MANUAL_TEST_ALERT',
  subject: 'Prueba de Sistema de Telemetría Activa',
  details: {
    motivo: 'Verificación manual de enlace de alertas',
    estado: 'Óptimo y en línea',
    operador: 'Administrador del Sistema'
  }
}).then((result) => {
  console.log('\n✅ Alerta de telemetría procesada y despachada con éxito:');
  console.log(result);
  console.log(`\n🎉 Vinculación confirmada con ${TelemetryAlertService.TELEMETRY_CONFIG.ALERT_RECIPIENT}`);
}).catch((err) => {
  console.error('❌ Error en el despacho:', err);
});
