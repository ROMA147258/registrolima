import { getRowValue } from './utils.js';

/**
 * Shows the detail modal containing all fields of the selected personero.
 * @param {Object} record - The personero row object.
 */
export function showModal(record) {
  const modal = document.getElementById('detail-modal');
  const container = document.getElementById('modal-details-content');
  if (!modal || !container) return;

  const idVal = getRowValue(record, ['ID', 'id']);
  const name = getRowValue(record, ['Nombres y Apellidos', 'nombres']);
  const dni = getRowValue(record, ['D.N.I.', 'dni']);
  const dist = getRowValue(record, ['Distrito de Votación', 'distrito']);
  const center = getRowValue(record, ['Centro de Votación', 'centro']);
  const mesa = getRowValue(record, ['Mesa Electoral', 'mesa']);
  const cell = getRowValue(record, ['Número de Celular', 'celular']);
  const usesWA = getRowValue(record, ['¿Usa WhatsApp?', 'usa_whatsapp']);
  const waOtro = getRowValue(record, ['WhatsApp Alterno', 'whatsapp_otro']) || 'Mismo número';
  const mail = getRowValue(record, ['Correo Electrónico', 'correo']);
  const exp = getRowValue(record, ['Experiencia como Personero', 'experiencia_personero']);
  const comp = getRowValue(record, ['Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta']);
  const mob = getRowValue(record, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);
  const videoVal = parseInt(getRowValue(record, ['Video', 'video']) || '0', 10);
  const pdfVal = parseInt(getRowValue(record, ['PDF', 'pdf']) || '0', 10);
  const rawCred = getRowValue(record, ['Credenciales', 'credenciales']);
  const isCompleted = (videoVal >= 2 && pdfVal >= 2) || (rawCred && rawCred.toLowerCase() === 'confirmado');
  const capStatusHTML = isCompleted 
    ? `<span style="background: #10b981; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">Completado (Confirmado)</span>` 
    : `<span style="background: #ef4444; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">Bloqueado</span>`;

  container.innerHTML = `
    <div class="details-grid">
      <div class="detail-item" style="grid-column: span 2;"><strong>ID de Conteo:</strong> <span style="font-weight: bold; color: #38bdf8;">#${idVal || '-'}</span></div>
      <div class="detail-item"><strong>Nombre Completo:</strong> <span>${name}</span></div>
      <div class="detail-item"><strong>D.N.I.:</strong> <span>${dni}</span></div>
      <div class="detail-item"><strong>Distrito:</strong> <span>${dist}</span></div>
      <div class="detail-item"><strong>Centro de Votación:</strong> <span>${center}</span></div>
      <div class="detail-item"><strong>Mesa de Votación:</strong> <span>${mesa}</span></div>
      <div class="detail-item"><strong>Celular:</strong> <span>${cell}</span></div>
      <div class="detail-item"><strong>¿Usa WhatsApp?:</strong> <span>${usesWA}</span></div>
      <div class="detail-item"><strong>WhatsApp Alterno:</strong> <span>${waOtro}</span></div>
      <div class="detail-item"><strong>Correo Electrónico:</strong> <span>${mail}</span></div>
      <div class="detail-item"><strong>Capacitación / Credencial:</strong> ${capStatusHTML} <span style="font-size:0.75rem; color:var(--text-muted);">(Video: ${videoVal}/2, PDF: ${pdfVal}/2)</span></div>
      <div class="detail-item"><strong>Experiencia:</strong> <span>${exp}</span></div>
      <div class="detail-item"><strong>Compromiso 2da Vuelta:</strong> <span>${comp}</span></div>
      <div class="detail-item"><strong>¿Tiene Movilidad?:</strong> <span>${mob}</span></div>
      <div class="detail-item" style="grid-column: span 2;"><strong>Fecha de Registro:</strong> <span>${date}</span></div>
    </div>
  `;

  modal.classList.remove('hidden');
}

/**
 * Hides the detail modal.
 */
export function hideModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.classList.add('hidden');
}
