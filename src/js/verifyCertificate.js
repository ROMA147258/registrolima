import { SOMOS_PERU_LOGO_DATA_URI } from './training.js';

/**
 * Renders the official Public Certificate Verification page
 * Triggered whenever someone scans the Somos Perú Certificate QR code
 */
export function getVerificationHTML() {
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(queryString);

  const dni = params.get('dni') || '00000000';
  const mesa = params.get('mesa') || '000000';
  const distrito = decodeURIComponent(params.get('distrito') || 'LIMA').toUpperCase();
  const personero = decodeURIComponent(params.get('personero') || 'PERSONERO ELECTORAL').toUpperCase();
  const local = decodeURIComponent(params.get('local') || 'LOCAL DE VOTACIÓN ASIGNADO').toUpperCase();
  const folio = decodeURIComponent(params.get('folio') || `SP-LM2026-${dni}`);
  const currentDate = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return `
    <div class="verification-container" style="min-height: 100vh; background: #0b1329; display: flex; align-items: center; justify-content: center; padding: 24px 16px; font-family: 'Montserrat', 'Outfit', sans-serif;">
      <div class="verification-card" style="width: 100%; max-width: 620px; background: #111c38; border: 1px solid #20488e; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); overflow: hidden;">
        
        <!-- Top Institutional Header -->
        <div style="background: linear-gradient(135deg, #0a142c 0%, #152654 100%); padding: 24px; text-align: center; border-bottom: 2px solid #20488e; position: relative;">
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <img src="${SOMOS_PERU_LOGO_DATA_URI}" alt="Partido Democrático Somos Perú" style="height: 48px; width: auto; object-fit: contain;" />
          </div>
          <h2 style="font-family: 'Cinzel', serif; color: #ffffff; margin: 0 0 4px 0; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.5px;">PARTIDO DEMOCRÁTICO SOMOS PERÚ</h2>
          <div style="font-size: 0.72rem; color: #cbd5e1; letter-spacing: 1px; font-weight: 600;">SISTEMA NACIONAL DE CONTROL ELECTORAL Y DEFENSA DEL VOTO</div>
          
          <div style="display: flex; height: 4px; width: 120px; margin: 12px auto 0; border-radius: 2px; overflow: hidden;">
            <div style="flex: 1; background: #e30613;"></div>
            <div style="flex: 1; background: #ffffff;"></div>
            <div style="flex: 1; background: #20488e;"></div>
          </div>
        </div>

        <!-- Verification Status Badge -->
        <div style="padding: 24px 24px 16px; text-align: center; background: rgba(16, 185, 129, 0.08); border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
          <div style="width: 56px; height: 56px; background: #10b981; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
            ✓
          </div>
          <h3 style="color: #10b981; margin: 0 0 4px; font-size: 1.25rem; font-weight: 700;">ACREDITACIÓN OFICIAL VÁLIDA</h3>
          <p style="color: #94a3b8; margin: 0; font-size: 0.82rem;">Este documento ha sido emitido y verificado en la base de datos electoral del partido.</p>
        </div>

        <!-- Verified Credential Information -->
        <div style="padding: 24px;">
          <div style="margin-bottom: 20px;">
            <label style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; display: block; margin-bottom: 2px;">Personero Acreditado</label>
            <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff; font-family: 'Playfair Display', serif;">${personero}</div>
            <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">D.N.I.: <strong style="color: #f1f5f9;">${dni}</strong></div>
          </div>

          <div style="background: rgba(32, 72, 142, 0.25); border: 1px solid #20488e; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; display: block;">Cargo Oficial</span>
              <strong style="color: #e2e8f0; font-size: 0.95rem; letter-spacing: 0.5px;">PERSONERO DE MESA TITULAR</strong>
            </div>
            <span style="background: #20488e; color: #ffffff; font-size: 0.7rem; padding: 4px 10px; border-radius: 20px; font-weight: 700; border: 1px solid #c59b27;">★ ELECCIONES 2026 ★</span>
          </div>

          <!-- Electoral Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: #0d162c; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
              <span style="font-size: 0.68rem; color: #64748b; display: block; text-transform: uppercase; font-weight: 600;">Distrito Electoral</span>
              <span style="color: #f1f5f9; font-size: 0.88rem; font-weight: 600;">${distrito}</span>
            </div>
            <div style="background: #0d162c; padding: 12px; border-radius: 8px; border: 1px solid rgba(227, 6, 19, 0.4);">
              <span style="font-size: 0.68rem; color: #ef4444; display: block; text-transform: uppercase; font-weight: 600;">Mesa de Sufragio</span>
              <span style="color: #ef4444; font-size: 1.05rem; font-weight: 800;">${mesa}</span>
            </div>
            <div style="background: #0d162c; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; grid-column: span 2;">
              <span style="font-size: 0.68rem; color: #64748b; display: block; text-transform: uppercase; font-weight: 600;">Local de Votación</span>
              <span style="color: #f1f5f9; font-size: 0.88rem; font-weight: 600;">${local}</span>
            </div>
          </div>

          <!-- Security Metadata -->
          <div style="background: #090e1d; border-radius: 8px; padding: 14px; border: 1px dashed #334155; font-size: 0.72rem; color: #64748b; line-height: 1.6;">
            <div><strong style="color: #94a3b8;">N° de Folio:</strong> <span style="font-family: monospace; color: #cbd5e1;">${folio}</span></div>
            <div><strong style="color: #94a3b8;">Fecha de Emisión:</strong> ${currentDate}</div>
            <div><strong style="color: #94a3b8;">Verificado en Servidor:</strong> ${currentDate} a las ${currentTime}</div>
            <div><strong style="color: #94a3b8;">Emisor:</strong> Comité Ejecutivo Nacional - Somos Perú</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background: #0a1124; border-top: 1px solid #1e293b; text-align: center;">
          <a href="#" id="btn-back-to-home" style="display: inline-block; color: #cbd5e1; text-decoration: none; font-size: 0.85rem; font-weight: 600; padding: 8px 20px; background: #1b294f; border-radius: 8px; border: 1px solid #20488e; transition: all 0.2s;">
            ← Ir al Portal Principal
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initVerification() {
  const backBtn = document.getElementById('btn-back-to-home');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
    });
  }
}
