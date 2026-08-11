import QRCode from 'qrcode';
import { icons } from './icons.js';
import { getCurrentSession } from './auth.js';
import { updateTrainingProgress } from './api.js';

export const SOMOS_PERU_SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="753.5" height="643.901" viewBox="0 0 7535 6439.006"><g fill="#20488e"><path d="M6374 4286.004c-176-35-283-110-349-243-39-80-49-144-43-277 4-101 18-179 81-470 42-193 78-351 80-353s97-2 212-1l209 3-83 380c-86 394-99 492-73 552 37 89 212 110 318 38 83-56 98-100 199-574 46-217 86-396 87-398 2-2 98-2 214-1l209 3-91 420c-107 489-113 514-168 620-77 150-203 250-368 290-90 22-344 29-434 11zM1899 4271.004c0-7 266-1228 285-1309l6-23 397 3c391 3 398 4 456 27 75 30 147 96 177 164 43.294 124.902 30.388 270.799-15 363-73 147-194 238-359 269-51 10-140 15-248 15-93 0-169 1-169 3 0 1-24 112-53 247l-53 245-212 3c-123 1-212-1-212-7zm842-783c89-50 132-152 95-225-23-44-58-54-177-51l-103 3-33 145c-19 80-34 149-34 154s46 6 105 3c84-5 114-10 147-29zM3203 4281.449s66-319.445 141-666.445l147-675h554c305 0 554 2 554 5 0 2-13 66-30 142-16 75-30 138-30 140s-155 3-344 3h-343l-17 83c-10 45-20 92-23 105l-5 22h332c311 0 326 1.399 326 1.399s-17 86.6-31 150.6l-27 118-331 2-331 3-21 100c-12 55-25 112-28 128l-7 27h370c323 0 370 2.089 370 2.089s-13 88.912-30 162.912c-16 74-30 137-30 140s-264 5-586 5c-553 0-580 1.445-580 1.445zM4509 4273.004c0-5 64-306 142-671l142-663 451 3c406 3 455 5 497 22 66 25 141 95 175 164 43.987 115.938 42.13 247.731-5 344-60 122-165 201-303 230l-57 12 49 64c69 91 210 376 234 475l7 27h-440l-32-77c-174-421-196-458-284-465l-39-3-53 250c-29 138-62.69 291.445-62.69 291.445s-2.31 3.555-211.31 3.555c-116 0-210-3-210-7zm885-803c92-15 143-63 152-142 11-92-50-118-268-118-115 0-119 1-124 23-3 12-16 73-29 135l-23 112h116c64 0 143-5 176-10zM1189 2543.004c-174-60-251-221-206-426 48-215 194-357 399-389 187-28 348 46 415 191 22 47 26 70 26 146 0 233-153 436-365 484-67 16-217 12-269-6zm265-148c122-59 208-243 181-389-8-44-59-104-103-122-54-23-142-18-202 12-117 59-206 255-172 382 33 120 173 176 296 117zM3104 2546.004c-65-21-98-41-146-93-75-80-100-188-74-318 38-193 147-327 314-387 83-30 245-30 322 1 125 48 199 152 207 291 13 227-128 436-337 500-74 23-222 26-286 6zm261-154c83-42 153-149 175-267 19-103-9-181-80-226-37-24-56-29-108-29-78 0-118 16-176 69-125 116-157 345-60 433 57 52 169 61 249 20zM1828.783 2547.568S1997 1803.004 2004 1773.004l7-33h265l8 193c4 105 10 229 14 274l6 83 145-275 145-275h267l-6 26c-13 49-178.609 780.825-178.609 785.825l-167.391.305c0-5 36-154.13 80-322.13 43-168 78-306 76-307-1-1-75 138-164 310l-161 317.217-177 .783-12-258c-7-142-12-282-12-310 0-29-3-53-8-53-4 0-22 73-40 163-19 89-48 228-64 310l-31 147-167.217-2.436zM358 2546.004c-117-31-188-108-197-212l-4-52 86-4 87-3 6 38c12 75 62 107 168 107 70 0 121-16 145-47 49-63 15-105-140-171-63-26-134-60-157-75-102-65-119-210-36-306 46-54 95-79 188-93 154-24 298 22 362 116 29 42 42 121 42 121s-44 7-92 11c-78 6-83.087 5.651-83.087 5.651 0-33-33.913-89.651-69.913-106.651-27-13-54-16-106-13-62 3-73 7-94 31-57 67-22 103 177 186 163 68 209 118 209 228 0 109-80 201-204 238-60 18-222 19-287 1zM3970 2548.004c-117-31-188-108-197-212l-4-52 86-4 87-3 6 38c12 75 62 107 168 107 70 0 121-16 145-47 49-63 15-105-140-171-63-26-134-60-157-75-102-65-119-210-36-306 46-54 95-79 188-93 154-24 298 22 362 116 29 42 42 121 42 121s-44 7-92 11c-78 6-83.087 5.651-83.087 5.651 0-33-33.913-89.651-69.913-106.651-27-13-54-16-106-13-62 3-73 7-94 31-57 67-22 103 177 186 163 68 209 118 209 228 0 109-80 201-204 238-60 18-222 19-287 1z"/></g><g fill="#fb1320"><path d="M3319 6271.004c-52-37-214-150-360-251-815-565-1266-925-1691-1350-332-332-509-545-706-854-106-165-268-491-329-661-40-113-109-364-128-462l-5-33h585l28 93c106 354 328 779 583 1115 407 535 909 972 1843 1601l253 171 31-23c17-13 123-91 236-172 427-309 851-634 1205-922l199-163 776-2.303c0 4-82 103.303-182 184.303-101 80-302 251-448 379-261 229-654 548-1145 930-285 222-639 489-646 488-2 0-47-31-99-68zM6113 2813.004c51-165 86-391 93-598 16-468-102-821-367-1099-466-488-1181-573-1729-204-176 120-290 242-491 528-67 96-124 176-125 178-2 2-56-59-121-135-149-175-416-443-514-515-172-127-353-216-539-266-86-23-114-26-271-26-147 0-187 4-252 22-258 71-451 194-714 456-131 132-210 232-300 383l-49 82-292 1c-184 0-293-4-293-10 0-17 58-157 100-239 116-232 289-472 495-689 359-377 826-583 1323-582 435 1 852 164 1247 487 61 49 116 97 124 107 13 15 20 10 85-52 674-648 1687-718 2461-170 100 71 296 255 378 356 187 229 340 537 406 819 78 332 70 737-21 1101l-20 82h-310c-290 0-309-1-304-17z"/></g></svg>`;
export const SOMOS_PERU_LOGO_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SOMOS_PERU_SVG_MARKUP)}`;

export function showToastNotification(title, message, type = 'success') {
  const existing = document.getElementById('custom-toast-popup');
  if (existing) existing.remove();

  const icon = type === 'success' ? '🎉' : type === 'warning' ? '⚠️' : 'ℹ️';
  const color = type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#38bdf8';

  const toast = document.createElement('div');
  toast.id = 'custom-toast-popup';
  toast.innerHTML = `
    <style>
      @keyframes toastBounceIn {
        0% {
          opacity: 0;
          transform: translateY(-40px) scale(0.85);
          filter: blur(6px);
        }
        65% {
          opacity: 1;
          transform: translateY(8px) scale(1.03);
          filter: blur(0);
        }
        85% {
          transform: translateY(-3px) scale(0.99);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes toastProgressCountdown {
        from { width: 100%; }
        to { width: 0%; }
      }

      .toast-animated-card {
        animation: toastBounceIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        will-change: transform, opacity, filter;
      }
    </style>
    <div class="toast-animated-card" style="position: fixed; top: 24px; right: 24px; z-index: 999999; background: #0f172a; color: #f8fafc; border: 1px solid ${color}; border-left: 6px solid ${color}; border-radius: 14px; padding: 16px 20px; box-shadow: 0 20px 45px rgba(0,0,0,0.55), 0 0 20px ${color}33; display: flex; align-items: center; gap: 14px; max-width: 400px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden;">
      <span style="font-size: 1.7rem; flex-shrink: 0;">${icon}</span>
      <div style="flex: 1;">
        <strong style="display: block; font-size: 0.95rem; color: ${color}; margin-bottom: 3px; font-weight: 700;">${title}</strong>
        <span style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.35; display: block;">${message}</span>
      </div>
      <button onclick="this.closest('#custom-toast-popup').remove()" style="background: rgba(255,255,255,0.06); border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; line-height: 1; margin-left: 4px; transition: background 0.2s ease;">&times;</button>
      <div style="position: absolute; bottom: 0; left: 0; height: 3px; background: ${color}; animation: toastProgressCountdown 4.5s linear forwards;"></div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast && toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.transform = 'translateY(-15px) scale(0.95)';
      setTimeout(() => toast.remove(), 400);
    }
  }, 4500);
}

export function getTrainingHTML() {
  const session = getCurrentSession();
  
  return `
    <div class="mobile-card" id="card-training">
      <!-- Header -->
      <div class="card-header" style="border-bottom: none; padding-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h1 class="card-title">Capacítate</h1>
          <button id="btn-training-logout" class="btn-logout-custom" title="Cerrar Sesión">
            ${icons.logout}
            <span>Salir</span>
          </button>
        </div>
        <p class="card-subtitle">Ficha de Capacitación de Personeros</p>
      </div>
      
      <!-- Content -->
      <div class="view-content" style="padding-top: 16px;">
        <!-- Welcome Details -->
        <div class="welcome-box">
          <h3>¡Bienvenido, <span id="training-user-name">${session.name || 'Personero'}</span>!</h3>
          <div class="training-info-grid">
            <div class="info-badge"><strong>DNI:</strong> <span>${session.dni || '-'}</span></div>
            <div class="info-badge"><strong>Distrito:</strong> <span>${session.distritoAsignado || session.district || '-'}</span></div>
            <div class="info-badge"><strong>Mesa:</strong> <span>${session.mesaAsignada || session.mesa || '-'}</span></div>
          </div>
        </div>
        
        <!-- Progress section -->
        <div class="progress-indicator-section">
          <!-- Video Progress Card -->
          <div class="progress-indicator-card">
            <div class="indicator-header">
              <span>Visualizaciones de Video</span>
              <strong id="label-video-progress">${session.videoCount || 0}/2</strong>
            </div>
            <div class="dots-container" id="dots-video">
              <span class="dot ${session.videoCount >= 1 ? 'completed' : ''}"></span>
              <span class="dot ${session.videoCount >= 2 ? 'completed' : ''}"></span>
            </div>
          </div>
          
          <!-- PDF Progress Card -->
          <div class="progress-indicator-card">
            <div class="indicator-header">
              <span>Lecturas de PDF</span>
              <strong id="label-pdf-progress">${session.pdfCount || 0}/2</strong>
            </div>
            <div class="dots-container" id="dots-pdf">
              <span class="dot ${session.pdfCount >= 1 ? 'completed' : ''}"></span>
              <span class="dot ${session.pdfCount >= 2 ? 'completed' : ''}"></span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-container">
          <button id="btn-action-video" class="btn-action-training">
            <span class="btn-training-icon">🎥</span>
            <div class="btn-training-text">
              <strong>Ver Video Tutorial</strong>
              <span>Ver el video instructivo (Conteo)</span>
            </div>
          </button>
          
          <button id="btn-action-pdf" class="btn-action-training">
            <span class="btn-training-icon">📄</span>
            <div class="btn-training-text">
              <strong>Leer PDF Instructivo</strong>
              <span>Leer el manual electoral</span>
            </div>
          </button>
          
          <button id="btn-action-credentials" class="btn-action-training locked" disabled>
            <span class="btn-training-icon">🔒</span>
            <div class="btn-training-text">
              <strong>Mi Certificado Oficial</strong>
              <span id="label-credentials-status">Bloqueado</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal Container -->
    <div id="training-modal-container"></div>
  `;
}

export function initTraining(onLogout) {
  const session = getCurrentSession();
  const logoutBtn = document.getElementById('btn-training-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', onLogout);
  }

  const btnVideo = document.getElementById('btn-action-video');
  const btnPdf = document.getElementById('btn-action-pdf');
  const btnCredentials = document.getElementById('btn-action-credentials');
  const labelCredentials = document.getElementById('label-credentials-status');
  const modalContainer = document.getElementById('training-modal-container');

  let videoCount = session.videoCount || 0;
  let pdfCount = session.pdfCount || 0;
  let credenciales = session.credenciales || 'Bloqueado';

  function updateUIState() {
    // Update labels
    document.getElementById('label-video-progress').textContent = `${videoCount}/2`;
    document.getElementById('label-pdf-progress').textContent = `${pdfCount}/2`;

    // Update dots for video
    const videoDots = document.querySelectorAll('#dots-video .dot');
    videoDots.forEach((dot, index) => {
      if (index < videoCount) {
        dot.classList.add('completed');
      } else {
        dot.classList.remove('completed');
      }
    });

    // Update dots for pdf
    const pdfDots = document.querySelectorAll('#dots-pdf .dot');
    pdfDots.forEach((dot, index) => {
      if (index < pdfCount) {
        dot.classList.add('completed');
      } else {
        dot.classList.remove('completed');
      }
    });

    // Check if credentials should be unlocked
    if (videoCount >= 2 && pdfCount >= 2) {
      btnCredentials.disabled = false;
      btnCredentials.classList.remove('locked');
      btnCredentials.classList.add('unlocked');
      const iconEl = btnCredentials.querySelector('.btn-training-icon');
      if (iconEl) iconEl.textContent = '📜';
      labelCredentials.textContent = 'Certificado Habilitado';
      credenciales = 'Confirmado';
    } else {
      btnCredentials.disabled = true;
      btnCredentials.classList.add('locked');
      btnCredentials.classList.remove('unlocked');
      const iconEl = btnCredentials.querySelector('.btn-training-icon');
      if (iconEl) iconEl.textContent = '🔒';
      labelCredentials.textContent = 'Bloqueado';
      credenciales = 'Bloqueado';
    }
  }

  // Initial UI state setup
  updateUIState();

  // Video Action
  btnVideo.addEventListener('click', () => {
    openVideoModal();
  });

  // PDF Action
  btnPdf.addEventListener('click', () => {
    openPdfModal();
  });

  // Credentials Action
  btnCredentials.addEventListener('click', () => {
    openCredentialsModal();
  });

  function openVideoModal() {
    modalContainer.innerHTML = `
      <div class="training-modal-overlay">
        <div class="training-modal" style="max-width: 580px; width: 95%; max-height: 92vh; display: flex; flex-direction: column;">
          <div class="training-modal-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem;">🎥</span>
              <h3 style="color: #ffffff; margin: 0; font-size: 0.98rem; font-weight: 700; font-family: 'Outfit', sans-serif;">Video Tutorial Oficial — Capacitación de Personeros</h3>
            </div>
            <button class="btn-close-modal" id="btn-close-video" style="color: #cbd5e1;">✕</button>
          </div>
          
          <div class="training-modal-body" style="padding: 12px; overflow-y: auto;">
            <p style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 10px; line-height: 1.4;">
              Observe el video tutorial instructivo completo sobre las funciones del personero y el conteo electoral para registrar su avance.
            </p>
            
            <div class="real-video-wrapper" style="position: relative; background: #000; border-radius: 12px; overflow: hidden; border: 1.5px solid #0284c7; box-shadow: 0 8px 25px rgba(0,0,0,0.5);">
              <video 
                id="real-tutorial-video" 
                playsinline 
                controls 
                preload="auto"
                style="width: 100%; max-height: 380px; display: block; background: #000; outline: none;"
              >
                <source src="./tutorial_personero.mp4" type="video/mp4">
                <source src="/tutorial_personero.mp4" type="video/mp4">
                <source src="./TUTORIAL%20PERSONERO.mp4" type="video/mp4">
                <source src="/TUTORIAL%20PERSONERO.mp4" type="video/mp4">
                Tu navegador no soporta el formato de video MP4.
              </video>
            </div>

            <div id="video-status-msg" style="font-size: 0.78rem; text-align: center; margin-top: 10px; color: #38bdf8; font-weight: 600;">
              ▶️ Presione Play en el reproductor para iniciar el video tutorial.
            </div>
          </div>
          
          <div class="training-modal-footer" style="background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: #94a3b8;" id="video-progress-text">Progreso: 0%</span>
            <button class="btn-submit" id="btn-finish-video" style="padding: 8px 18px; font-size: 0.82rem; width: auto; margin: 0; opacity: 0.45; cursor: not-allowed; background: #334155; color: #94a3b8; border: none; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 6px;" disabled>
              <span>🔒 Debe ver el video para registrar</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const videoEl = document.getElementById('real-tutorial-video');
    const closeBtn = document.getElementById('btn-close-video');
    const finishBtn = document.getElementById('btn-finish-video');
    const statusMsg = document.getElementById('video-status-msg');
    const progressText = document.getElementById('video-progress-text');

    let maxPercentWatched = 0;

    function unlockFinishBtn() {
      if (finishBtn && finishBtn.disabled) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
        finishBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        finishBtn.style.color = '#ffffff';
        finishBtn.innerHTML = '<span>✅ Registrar Video Visto</span>';
        if (statusMsg) statusMsg.textContent = '✅ Video observado. ¡Ya puede registrar su avance!';
      }
    }

    if (videoEl) {
      videoEl.addEventListener('timeupdate', () => {
        if (videoEl.duration) {
          const currentPercent = Math.min(100, Math.round((videoEl.currentTime / videoEl.duration) * 100));
          if (currentPercent > maxPercentWatched) {
            maxPercentWatched = currentPercent;
          }
          if (progressText) {
            progressText.textContent = `Progreso: ${maxPercentWatched}%`;
          }

          // Unlock finish button once user has watched at least 70% of the video or reached near the end
          if (maxPercentWatched >= 70 || videoEl.currentTime >= videoEl.duration - 2) {
            unlockFinishBtn();
          }
        }
      });

      videoEl.addEventListener('ended', () => {
        maxPercentWatched = 100;
        if (progressText) progressText.textContent = 'Progreso: 100%';
        unlockFinishBtn();
      });

      videoEl.addEventListener('play', () => {
        if (statusMsg && finishBtn.disabled) {
          statusMsg.textContent = '🎥 Reproduciendo video tutorial...';
        }
      });

      videoEl.addEventListener('pause', () => {
        if (statusMsg && finishBtn.disabled) {
          statusMsg.textContent = '⏸️ Video en pausa.';
        }
      });
    }

    closeBtn.addEventListener('click', () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
      modalContainer.innerHTML = '';
    });

    finishBtn.addEventListener('click', async () => {
      const activeDni = String(session.dni || localStorage.getItem('user_dni') || '').trim();
      if (!activeDni) {
        showToastNotification('Error de Sesión', 'No se identificó el DNI del usuario.', 'warning');
        return;
      }

      if (videoCount >= 2) {
        showToastNotification('Límite Alcanzado', 'Ya completaste las 2 visualizaciones de video.', 'warning');
        if (videoEl) {
          videoEl.pause();
          videoEl.src = '';
        }
        modalContainer.innerHTML = '';
        return;
      }

      finishBtn.disabled = true;
      finishBtn.innerHTML = `<span>Guardando en Google Sheets...</span> <span class="spinner-inline"></span>`;

      try {
        const res = await updateTrainingProgress(activeDni, 'video', videoCount);
        if (res && res.status === 'success') {
          videoCount = res.video !== undefined ? res.video : Math.min(2, videoCount + 1);
          if (res.pdf !== undefined) pdfCount = res.pdf;
          credenciales = res.credenciales || ((videoCount >= 2 && pdfCount >= 2) ? 'Confirmado' : 'Bloqueado');
          
          localStorage.setItem('user_video_count', videoCount);
          localStorage.setItem('user_pdf_count', pdfCount);
          localStorage.setItem('user_credenciales', credenciales);
          updateUIState();

          if (videoCount >= 2 && pdfCount >= 2) {
            showToastNotification('¡Capacitación Completada!', 'Has completado 2/2 videos y 2/2 lecturas. ¡Tu Certificado Oficial ha sido DESBLOQUEADO!', 'success');
          } else {
            showToastNotification('¡Video Registrado!', `Progreso de video guardado exitosamente en Google Sheets (${videoCount}/2)`, 'success');
          }
        }
      } catch (err) {
        console.error(err);
        showToastNotification('Error de Conexión', 'No se pudo guardar el avance. Por favor intente nuevamente.', 'warning');
      } finally {
        if (videoEl) {
          videoEl.pause();
          videoEl.src = '';
        }
        modalContainer.innerHTML = '';
      }
    });
  }

  function openPdfModal() {
    modalContainer.innerHTML = `
      <div class="training-modal-overlay">
        <div class="training-modal" style="max-width:580px;width:94%;max-height:90vh;">
          <div class="training-modal-header" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="font-size:1rem;">📘</span>
              <h3 style="color:#fff;font-size:0.92rem;margin:0;font-family:'Outfit',sans-serif;font-weight:700;">Manual Oficial Didáctico — VotoReal 2026</h3>
            </div>
            <button class="btn-close-modal" id="btn-close-pdf" style="color:#fff;">✕</button>
          </div>
          <div class="training-modal-body" style="padding:8px;">
            <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;line-height:1.3;">
              Deslice hacia abajo para consultar todas las capturas reales y habilitar la lectura.
            </p>
            <div id="pdf-viewer-scrollable" style="max-height:380px;overflow-y:auto;padding:10px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#0f172a;color:#f8fafc;">
              
              <style>
                .pm { font-family:'Inter',sans-serif; font-size:0.75rem; line-height:1.45; color:#f8fafc; }
                .pm * { box-sizing:border-box; }
                .pm-head { background:rgba(30,41,59,0.9); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px; text-align:center; margin-bottom:12px; }
                .pm-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(2,132,199,0.2); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; padding:2px 9px; border-radius:50px; font-size:0.65rem; font-weight:600; margin-bottom:6px; }
                .pm-title { font-family:'Outfit',sans-serif; font-size:1.05rem; font-weight:800; background:linear-gradient(90deg,#fff,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:3px; }
                .pm-subtitle { color:#94a3b8; font-size:0.68rem; }
                .pm-section { font-family:'Outfit',sans-serif; font-size:0.85rem; font-weight:700; margin:12px 0 7px; display:flex; align-items:center; gap:5px; color:#f1f5f9; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px; }
                .pm-step { background:rgba(30,41,59,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; margin-bottom:10px; }
                .pm-step-hdr { display:flex; align-items:center; gap:7px; margin-bottom:4px; }
                .pm-num { width:22px; height:22px; border-radius:50%; background:#0284c7; color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:0.7rem; flex-shrink:0; }
                .pm-step-title { font-size:0.8rem; font-weight:700; color:#fff; }
                .pm-desc { color:#cbd5e1; font-size:0.7rem; margin-bottom:6px; line-height:1.4; }
                
                .pm-img-frame {
                  background:#070d17;
                  border:1px solid rgba(56,189,248,0.25);
                  border-radius:10px;
                  padding:8px;
                  margin-top:6px;
                  text-align:center;
                  box-shadow:0 4px 15px rgba(0,0,0,0.3);
                }
                .pm-img-frame img {
                  max-width:100%;
                  width:280px;
                  height:auto;
                  border-radius:8px;
                  display:block;
                  margin:0 auto;
                  border:1px solid rgba(255,255,255,0.08);
                }
                .pm-img-caption {
                  font-size:0.65rem;
                  color:#38bdf8;
                  font-weight:600;
                  margin-top:5px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  gap:4px;
                }
                
                .pm-tips { background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.25); border-radius:8px; padding:8px 10px; margin-top:10px; }
                .pm-tips h4 { color:#c4b5fd; font-size:0.75rem; margin-bottom:5px; display:flex; align-items:center; gap:4px; }
                .pm-tips ul { list-style:none; display:flex; flex-direction:column; gap:4px; font-size:0.67rem; color:#e2e8f0; padding:0; margin:0; }
                .pm-tips li::before { content:'✔'; color:#a78bfa; font-weight:800; margin-right:4px; }
                .pm-print-bar { display:flex; justify-content:flex-end; margin-bottom:8px; }
                .pm-print-btn { background:linear-gradient(90deg,#0284c7,#0369a1); color:#fff; border:none; padding:5px 11px; border-radius:7px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; font-size:0.68rem; }
              </style>

              <div class="pm">
                <div class="pm-print-bar">
                  <button class="pm-print-btn" id="btn-print-pdf-manual">🖨️ Imprimir / Guardar PDF</button>
                </div>

                <div class="pm-head">
                  <div class="pm-badge">📱 VotoReal Móvil 2026 — Somos Perú</div>
                  <div class="pm-title">Manual Oficial con Capturas Reales</div>
                  <p class="pm-subtitle">Guía visual paso a paso para Personeros y Coordinadores de Mesa.</p>
                </div>

                <h2 class="pm-section">📱 Paso a Paso con Capturas de Pantalla</h2>

                <!-- PASO 1 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">1</div><div class="pm-step-title">Ingreso al Aplicativo (Acceso)</div></div>
                  <p class="pm-desc">Abre <strong>VotoReal Móvil</strong> en tu celular. Ingresa tus <strong>Nombres y Apellidos</strong> y tu <strong>DNI de 8 dígitos</strong>, luego presiona <strong>"Ingresar"</strong>.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_1_login.png" alt="Captura 1 - Inicio de Sesión" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_1_login.png';">
                    <div class="pm-img-caption">📸 Pantalla Real: Acceso de Personero con DNI</div>
                  </div>
                </div>

                <!-- PASO 2 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">2</div><div class="pm-step-title">Módulo de Conteo Manual</div></div>
                  <p class="pm-desc">Al iniciar el escrutinio (5:00 PM), accede a la pantalla de <strong>Conteo de Votos</strong> de tu mesa electoral asignada.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_2_conteo_manual.png" alt="Captura 2 - Conteo Manual" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_2_conteo_manual.png';">
                    <div class="pm-img-caption">📸 Pantalla Real: Ingreso y Selección de Mesa de Votación</div>
                  </div>
                </div>

                <!-- PASO 3 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">3</div><div class="pm-step-title">Llenado de Casillas de Votos</div></div>
                  <p class="pm-desc">Ingresa casilla por casilla los votos válidos de <strong>Somos Perú Provincial</strong>, <strong>Somos Perú Distrital</strong>, <strong>Votos Nulos</strong> y <strong>Blancos</strong>.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_3_votos_llenados.png" alt="Captura 3 - Casillas de Votación" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_3_votos_llenados.png';">
                    <div class="pm-img-caption">📸 Pantalla Real: Registro detallado de votos por lista</div>
                  </div>
                </div>

                <!-- PASO 4 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">4</div><div class="pm-step-title">Verificación de Conteo y Comparación</div></div>
                  <p class="pm-desc">Revisa el total calculado automáticamente por el sistema y compáralo con el acta física firmada en la mesa.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_4_conteo_imagen.png" alt="Captura 4 - Conteo por Imagen" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_4_conteo_imagen.png';">
                    <div class="pm-img-caption">📸 Pantalla Real: Totalización y Validación de Resultados</div>
                  </div>
                </div>

                <!-- PASO 5 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">5</div><div class="pm-step-title">Transmisión, Escaneo y Cierre Oficial</div></div>
                  <p class="pm-desc">Toma la foto o escaneo del acta de cierre y presiona <strong>"Enviar y Transmitir"</strong> para registrar en Google Sheets y cerrar mesa.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_5_modal_escaner.png" alt="Captura 5 - Escáner y Cierre" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_5_modal_escaner.png';">
                    <div class="pm-img-caption">📸 Pantalla Real: Transmisión y Envío al Servidor Central</div>
                  </div>
                </div>

                <div class="pm-tips">
                  <h4>💡 Recomendaciones Clave para la Jornada</h4>
                  <ul>
                    <li>Lleva tu celular cargado al 100% y con datos móviles activos.</li>
                    <li>Anota tu usuario y DNI en papel como respaldo ante cualquier duda.</li>
                    <li>Si la señal es débil, el sistema guardará todo en modo local y se sincronizará automáticamente.</li>
                    <li>Verifica que la suma de votos coincida con los votantes que sufragaron.</li>
                  </ul>
                </div>

              </div>
            </div>

            <div style="margin-top:8px;display:flex;justify-content:flex-end;">
              <button id="btn-finish-pdf" disabled style="opacity:0.4;cursor:not-allowed;background:linear-gradient(90deg,#10b981,#059669);color:#fff;border:none;padding:7px 14px;border-radius:9px;font-weight:700;font-size:0.78rem;display:flex;align-items:center;gap:5px;">
                ✅ Marcar como Leído
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Lucide icons if available
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    const printBtnManual = document.getElementById('btn-print-pdf-manual');
    if (printBtnManual) {
      printBtnManual.addEventListener('click', () => {
        window.print();
      });
    }

    const closeBtn = document.getElementById('btn-close-pdf');
    const finishBtn = document.getElementById('btn-finish-pdf');
    const pdfScrollable = document.getElementById('pdf-viewer-scrollable');

    function checkPdfScrolled() {
      if (!pdfScrollable || !finishBtn) return;
      if (pdfScrollable.scrollTop + pdfScrollable.clientHeight >= pdfScrollable.scrollHeight - 25) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
      }
    }

    if (pdfScrollable) {
      pdfScrollable.addEventListener('scroll', checkPdfScrolled);
      setTimeout(checkPdfScrolled, 100);
    }

    closeBtn.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    finishBtn.addEventListener('click', async () => {
      const activeDni = String(session.dni || localStorage.getItem('user_dni') || '').trim();
      if (!activeDni) {
        showToastNotification('Error de Sesión', 'No se identificó el DNI del usuario.', 'warning');
        return;
      }

      if (pdfCount >= 2) {
        showToastNotification('Límite Alcanzado', 'Ya completaste las 2 lecturas de PDF.', 'warning');
        modalContainer.innerHTML = '';
        return;
      }

      finishBtn.disabled = true;
      finishBtn.innerHTML = `<span>Guardando en Google Sheets...</span> <span class="spinner-inline"></span>`;

      try {
        const res = await updateTrainingProgress(activeDni, 'pdf', pdfCount);
        if (res && res.status === 'success') {
          pdfCount = res.pdf !== undefined ? res.pdf : Math.min(2, pdfCount + 1);
          if (res.video !== undefined) videoCount = res.video;
          credenciales = res.credenciales || ((videoCount >= 2 && pdfCount >= 2) ? 'Confirmado' : 'Bloqueado');

          localStorage.setItem('user_video_count', videoCount);
          localStorage.setItem('user_pdf_count', pdfCount);
          localStorage.setItem('user_credenciales', credenciales);
          updateUIState();

          if (videoCount >= 2 && pdfCount >= 2) {
            showToastNotification('¡Capacitación Completada!', 'Has completado tus 2 videos y 2 lecturas. ¡Tu Certificado Oficial ha sido DESBLOQUEADO!', 'success');
          } else {
            showToastNotification('¡Manual Registrado!', `Progreso de lectura guardado exitosamente en Google Sheets (${pdfCount}/2)`, 'success');
          }
        }
      } catch (err) {
        console.error(err);
        showToastNotification('Error de Conexión', 'No se pudo guardar el avance. Por favor intente nuevamente.', 'warning');
      } finally {
        modalContainer.innerHTML = '';
      }
    });
  }

  async function openCredentialsModal() {
    const rawDni = session.dni || '00000000';
    const rawMesa = (session.mesaAsignada || session.mesa || '000000').toUpperCase();
    const rawDistrict = (session.distritoAsignado || session.district || 'LIMA').toUpperCase();
    const rawCenter = (session.centroAsignado || session.center || 'LOCAL DE VOTACIÓN ASIGNADO').toUpperCase();
    const rawName = (session.name || 'PERSONERO ELECTORAL').toUpperCase();
    const isCoordinator = (session.rolElectoral || '').toLowerCase().includes('coordinador');
    const roleTitle = isCoordinator ? 'COORDINADOR DE LOCAL DE VOTACIÓN' : 'PERSONERO DE MESA TITULAR';

    const folioCode = `SP-LM2026-${rawDni}`;
    const verifCode = `SP-${rawDni}-${rawMesa}-2026`;
    const currentDateStr = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

    // Official Verification URL scannable by any phone
    const verificationUrl = `${window.location.origin}${window.location.pathname}#verificar?dni=${rawDni}&mesa=${rawMesa}&distrito=${encodeURIComponent(rawDistrict)}&personero=${encodeURIComponent(rawName)}&local=${encodeURIComponent(rawCenter)}&folio=${encodeURIComponent(folioCode)}&rol=${encodeURIComponent(roleTitle)}`;

    // Generate real, functional QR code Data URL
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 1,
        color: {
          dark: '#20488e',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('Error generando QR oficial:', err);
    }

    modalContainer.innerHTML = `
      <div class="training-modal-overlay">
        <div class="training-modal somosperu-modal-dialog">
          <div class="training-modal-header" style="background: #0f1c3f; border-bottom: 1px solid #20488e;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.3rem;">📜</span>
              <div>
                <h3 style="color: #ffffff; margin: 0; font-size: 1.05rem; font-weight: 700;">Certificado Oficial de Acreditación</h3>
                <span style="font-size: 0.72rem; color: #94a3b8;">Partido Democrático Somos Perú • Elecciones 2026</span>
              </div>
            </div>
            <button class="btn-close-modal" id="btn-close-credentials" style="color: #cbd5e1;">×</button>
          </div>
          
          <div class="training-modal-body cert-modal-body">
            <!-- Printable / Visual Certificate Container -->
            <div class="somosperu-certificate" id="printable-certificate-area">
              <div class="cert-outer-border">
                <div class="cert-inner-border">
                  <div class="cert-gold-border">
                    <!-- Ornate Corners -->
                    <div class="cert-corner top-left"></div>
                    <div class="cert-corner top-right"></div>
                    <div class="cert-corner bottom-left"></div>
                    <div class="cert-corner bottom-right"></div>

                    <!-- Watermark Logo -->
                    <img src="${SOMOS_PERU_LOGO_DATA_URI}" class="cert-watermark" alt="Marca de Agua Somos Perú" />

                    <!-- Header Layout -->
                    <div class="cert-header-layout">
                      <div class="cert-logo-box">
                        <img src="${SOMOS_PERU_LOGO_DATA_URI}" alt="Partido Somos Perú" style="width: 125px; height: auto; max-height: 52px; display: block; object-fit: contain;" />
                      </div>

                      <div class="cert-header-text">
                        <h4 class="cert-party-title">PARTIDO DEMOCRÁTICO SOMOS PERÚ</h4>
                        <div class="cert-party-subtitle">SISTEMA NACIONAL DE CONTROL ELECTORAL Y DEFENSA DEL VOTO</div>
                        <div class="cert-peru-flag-line">
                          <span class="cert-flag-red"></span>
                          <span class="cert-flag-white"></span>
                          <span class="cert-flag-blue"></span>
                        </div>
                      </div>

                      <div class="cert-qr-box">
                        <img src="${qrDataUrl}" alt="QR de Verificación Oficial" class="cert-qr-code" style="width: 60px; height: 60px; display: block; border-radius: 4px;" />
                        <span class="cert-qr-folio">${folioCode}</span>
                      </div>
                    </div>

                    <!-- Certificate Title -->
                    <div class="cert-title-section">
                      <h2 class="cert-main-title">CERTIFICADO OFICIAL DE ACREDITACIÓN</h2>
                      <div class="cert-main-subtitle">"Por la Democracia, la Descentralización y la Transparencia • Elecciones 2026"</div>
                    </div>

                    <!-- Proclamation & Recipient -->
                    <div class="cert-proclamation">
                      El Comité Ejecutivo Nacional y la Secretaría Nacional Electoral del Partido Democrático Somos Perú otorgan la presente acreditación oficial a:
                    </div>

                    <div class="cert-recipient-name">${rawName}</div>
                    <div class="cert-recipient-dni">DOCUMENTO NACIONAL DE IDENTIDAD (D.N.I.): <span>${rawDni}</span></div>

                    <div class="cert-merit-text">
                      Por haber culminado y aprobado satisfactoriamente el <strong>Programa Oficial de Capacitación Técnica en Conteo Rápido, Normativa Electoral y Fiscalización de Mesas</strong>, otorgándosele la calidad de:
                    </div>

                    <!-- Role Badge -->
                    <div class="cert-role-badge">
                      <div class="cert-role-tag">
                        <span>★</span>
                        <span>${roleTitle}</span>
                        <span>★</span>
                      </div>
                    </div>

                    <!-- Electoral Jurisdiction Grid -->
                    <div class="cert-details-grid">
                      <div class="cert-detail-item">
                        <label>Departamento / Región</label>
                        <span>LIMA METROPOLITANA</span>
                      </div>
                      <div class="cert-detail-item">
                        <label>Distrito Electoral</label>
                        <span>${rawDistrict}</span>
                      </div>
                      <div class="cert-detail-item highlight">
                        <label>Mesa de Sufragio N°</label>
                        <span>${rawMesa}</span>
                      </div>
                      <div class="cert-detail-item">
                        <label>Local de Votación</label>
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rawCenter}</span>
                      </div>
                    </div>

                    <!-- Signatures & Embossed Golden Seal -->
                    <div class="cert-footer-section">
                      <!-- Signature Left -->
                      <div class="cert-sign-col">
                        <svg width="150" height="36" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 26 C 25 8, 35 30, 45 12 C 55 2, 60 28, 80 15 C 95 6, 100 22, 120 12 C 130 8, 140 18, 145 16" stroke="#20488e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                          <path d="M25 30 C 55 32, 105 28, 135 26" stroke="#20488e" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                        </svg>
                        <div class="cert-sign-line"></div>
                        <div class="cert-sign-name">PATRICIA LI SOTELO</div>
                        <div class="cert-sign-role">Presidenta y Personera Legal Titular<br>Partido Democrático Somos Perú</div>
                      </div>

                      <!-- Center Gold Seal -->
                      <div class="cert-gold-seal">
                        <div class="cert-seal-outer">
                          <div class="cert-seal-inner">
                            <span class="cert-seal-text-top">SOMOS PERÚ</span>
                            <img src="${SOMOS_PERU_LOGO_DATA_URI}" alt="Logo" style="width: 38px; height: auto; margin: 2px 0;" />
                            <span class="cert-seal-year">2026</span>
                            <span class="cert-seal-text-bottom">ACREDITADO</span>
                          </div>
                        </div>
                        <div class="cert-ribbon-tails">
                          <div class="cert-ribbon-tail red"></div>
                          <div class="cert-ribbon-tail blue"></div>
                        </div>
                      </div>

                      <!-- Signature Right -->
                      <div class="cert-sign-col">
                        <svg width="150" height="36" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18 C 30 4, 38 32, 52 10 C 65 1, 75 25, 90 8 C 105 22, 125 4, 140 15" stroke="#20488e" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                          <path d="M20 26 C 50 28, 95 30, 130 24" stroke="#20488e" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                        </svg>
                        <div class="cert-sign-line"></div>
                        <div class="cert-sign-name">SECRETARÍA NACIONAL ELECTORAL</div>
                        <div class="cert-sign-role">Comisión de Control y Conteo Rápido<br>Elecciones Generales 2026</div>
                      </div>
                    </div>

                    <!-- Security Barcode / Hash -->
                    <div class="cert-security-bar">
                      <span>CÓDIGO DE VALIDACIÓN: ${verifCode}</span>
                      <span>EMISIÓN: ${currentDateStr.toUpperCase()}</span>
                      <span>HABILITACIÓN OFICIAL JNE / ONPE 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="training-modal-footer" style="background: #0f1c3f; border-top: 1px solid #20488e; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 0.78rem; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
              <span style="color: #10b981;">●</span> Estado: <strong style="color: #ffffff;">Acreditado y Confirmado</strong>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-secondary" id="btn-download-credentials" style="padding: 9px 18px; font-size: 0.85rem; width: auto; margin: 0; display: flex; align-items: center; gap: 8px; border-color: #20488e; color: #f8fafc; background: #1a2c5a;">
                <span>📥</span> Descargar Certificado HD (PNG)
              </button>
              <button class="btn-submit" id="btn-print-credentials" style="padding: 9px 18px; font-size: 0.85rem; width: auto; margin: 0; background: linear-gradient(135deg, #e30613 0%, #b8050f 100%); color: #ffffff; border: none; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>🖨️</span> Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('btn-close-credentials');
    const printBtn = document.getElementById('btn-print-credentials');
    const downloadBtn = document.getElementById('btn-download-credentials');

    closeBtn.addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    printBtn.addEventListener('click', () => {
      window.print();
    });

    downloadBtn.addEventListener('click', async () => {
      const originalBtnText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = `<span>⏳</span> Generando HD...`;
      downloadBtn.disabled = true;

      try {
        // High resolution HD Canvas rendering (2400x1600)
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 1600;
        const ctx = canvas.getContext('2d');

        // Load both Logo and QR Code Images
        const logoImg = new Image();
        const qrImg = new Image();

        await Promise.all([
          new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = resolve;
            logoImg.src = SOMOS_PERU_LOGO_DATA_URI;
          }),
          new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.onerror = resolve;
            qrImg.src = qrDataUrl;
          })
        ]);

        // 1. Parchment Background
        const bgGradient = ctx.createRadialGradient(1200, 800, 100, 1200, 800, 1300);
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(1, '#fbfbfa');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, 2400, 1600);

        // 2. Guilloche subtle wave lines (Banknote security texture)
        ctx.save();
        ctx.strokeStyle = 'rgba(32, 72, 142, 0.035)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          for (let x = 0; x < 2400; x += 40) {
            const y = 800 + Math.sin((x + i * 120) * 0.006) * (180 + i * 15) + Math.cos(x * 0.003) * 60;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // 3. Security Triple Borders
        // Outer Navy Border
        ctx.strokeStyle = '#20488e';
        ctx.lineWidth = 18;
        ctx.strokeRect(40, 40, 2320, 1520);

        // Middle Crimson Red Border
        ctx.strokeStyle = '#e30613';
        ctx.lineWidth = 6;
        ctx.strokeRect(62, 62, 2276, 1476);

        // Inner Gold Dashed Accent Border
        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(78, 78, 2244, 1444);
        ctx.setLineDash([]); // Reset line dash

        // Corner Ornaments in Gold
        const drawCorner = (x, y, dx, dy) => {
          ctx.strokeStyle = '#c59b27';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(x, y + dy * 45);
          ctx.lineTo(x, y);
          ctx.lineTo(x + dx * 45, y);
          ctx.stroke();

          ctx.fillStyle = '#c59b27';
          ctx.beginPath();
          ctx.arc(x + dx * 16, y + dy * 16, 4, 0, Math.PI * 2);
          ctx.fill();
        };
        drawCorner(92, 92, 1, 1);
        drawCorner(2308, 92, -1, 1);
        drawCorner(92, 1508, 1, -1);
        drawCorner(2308, 1508, -1, -1);

        // 4. Central Watermark with EXACT SOMOS PERU LOGO
        ctx.save();
        ctx.globalAlpha = 0.05;
        const wmWidth = 720;
        const wmHeight = (643.9 / 753.5) * wmWidth;
        ctx.drawImage(logoImg, 1200 - wmWidth / 2, 780 - wmHeight / 2, wmWidth, wmHeight);
        ctx.restore();

        // 5. Header Section
        // Top Institutional Text
        ctx.textAlign = 'center';
        ctx.fillStyle = '#20488e';
        ctx.font = 'bold 44px "Cinzel", "Times New Roman", Georgia, serif';
        ctx.fillText('PARTIDO DEMOCRÁTICO SOMOS PERÚ', 1200, 175);

        ctx.fillStyle = '#e30613';
        ctx.font = 'bold 22px "Montserrat", Arial, sans-serif';
        ctx.fillText('SISTEMA NACIONAL DE CONTROL ELECTORAL Y DEFENSA DEL VOTO', 1200, 220);

        // Peruvian Tricolor Flag Bar
        ctx.fillStyle = '#e30613';
        ctx.fillRect(1050, 242, 100, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1150, 242, 100, 6);
        ctx.fillStyle = '#20488e';
        ctx.fillRect(1250, 242, 100, 6);

        // Left Official Somos Peru Logo Image
        const headerLogoW = 200;
        const headerLogoH = (643.9 / 753.5) * headerLogoW;
        ctx.drawImage(logoImg, 140, 135, headerLogoW, headerLogoH);

        // Right REAL Functional QR Code Box
        const qrBoxX = 2070;
        const qrBoxY = 115;
        const qrBoxSize = 175;
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 8);
        ctx.fill();
        ctx.stroke();

        // Draw the REAL functional QR Code image
        ctx.drawImage(qrImg, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#20488e';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(folioCode, qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 22);

        // Line Divider
        ctx.strokeStyle = '#20488e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(180, 320);
        ctx.lineTo(2220, 320);
        ctx.stroke();

        // 6. Certificate Title
        ctx.fillStyle = '#20488e';
        ctx.font = 'bold 50px "Cinzel", "Times New Roman", Georgia, serif';
        ctx.fillText('CERTIFICADO OFICIAL DE ACREDITACIÓN', 1200, 390);

        ctx.fillStyle = '#c59b27';
        ctx.font = 'bold italic 25px "Playfair Display", Georgia, serif';
        ctx.fillText('"Por la Democracia, la Descentralización y la Transparencia • Elecciones 2026"', 1200, 435);

        // Proclamation
        ctx.fillStyle = '#475569';
        ctx.font = 'italic 24px "Montserrat", Arial, sans-serif';
        ctx.fillText('El Comité Ejecutivo Nacional y la Secretaría Nacional Electoral del Partido Democrático Somos Perú otorgan la presente acreditación a:', 1200, 495);

        // Recipient Name
        ctx.fillStyle = '#20488e';
        ctx.font = 'bold 58px "Playfair Display", "Times New Roman", serif';
        ctx.fillText(rawName, 1200, 580);

        // Gold line under name
        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(600, 605);
        ctx.lineTo(1800, 605);
        ctx.stroke();

        // DNI
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 26px "Montserrat", Arial, sans-serif';
        ctx.fillText('DOCUMENTO NACIONAL DE IDENTIDAD (D.N.I.): ' + rawDni, 1200, 655);

        // Merit Text
        ctx.fillStyle = '#334155';
        ctx.font = '22px "Montserrat", Arial, sans-serif';
        ctx.fillText('Por haber culminado y aprobado satisfactoriamente el Programa de Capacitación Técnica en Defensa del Voto,', 1200, 715);
        ctx.fillText('Conteo Rápido y Fiscalización de Mesas para las Elecciones Generales 2026, acreditándosele en calidad de:', 1200, 750);

        // 7. Role Badge
        const badgeWidth = 620;
        const badgeHeight = 65;
        const badgeX = (2400 - badgeWidth) / 2;
        const badgeY = 790;
        
        const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
        badgeGrad.addColorStop(0, '#20488e');
        badgeGrad.addColorStop(1, '#0f2759');
        ctx.fillStyle = badgeGrad;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 32);
        ctx.fill();

        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Cinzel", "Times New Roman", serif';
        ctx.fillText(`★  ${roleTitle}  ★`, 1200, badgeY + 42);

        // 8. Electoral Details Box
        const boxX = 220;
        const boxY = 890;
        const boxW = 1960;
        const boxH = 120;

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        // Top Navy accent line on box
        ctx.fillStyle = '#20488e';
        ctx.fillRect(boxX, boxY, boxW, 5);

        const colW = boxW / 4;
        const details = [
          { label: 'DEPARTAMENTO / REGIÓN', val: 'LIMA METROPOLITANA' },
          { label: 'DISTRITO ELECTORAL', val: rawDistrict },
          { label: 'MESA DE SUFRAGIO N°', val: rawMesa, highlight: true },
          { label: 'LOCAL DE VOTACIÓN', val: rawCenter }
        ];

        details.forEach((d, idx) => {
          const colCenter = boxX + colW * idx + colW / 2;
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 17px "Montserrat", Arial, sans-serif';
          ctx.fillText(d.label, colCenter, boxY + 45);

          ctx.fillStyle = d.highlight ? '#e30613' : '#0f172a';
          ctx.font = 'bold 24px "Montserrat", Arial, sans-serif';
          let textVal = d.val;
          if (textVal.length > 22) textVal = textVal.substring(0, 20) + '...';
          ctx.fillText(textVal, colCenter, boxY + 85);

          if (idx < 3) {
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(boxX + colW * (idx + 1), boxY + 20);
            ctx.lineTo(boxX + colW * (idx + 1), boxY + boxH - 20);
            ctx.stroke();
          }
        });

        // 9. Signatures & Center Gold Seal
        // Left Signature
        ctx.strokeStyle = '#20488e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(400, 1180);
        ctx.bezierCurveTo(450, 1120, 520, 1220, 600, 1140);
        ctx.bezierCurveTo(640, 1100, 680, 1200, 750, 1160);
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(380, 1230);
        ctx.lineTo(770, 1230);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px "Montserrat", Arial, sans-serif';
        ctx.fillText('PATRICIA LI SOTELO', 575, 1265);
        ctx.fillStyle = '#64748b';
        ctx.font = '18px "Montserrat", Arial, sans-serif';
        ctx.fillText('Presidenta y Personera Legal Titular', 575, 1295);
        ctx.fillText('Partido Democrático Somos Perú', 575, 1320);

        // Center Embossed Gold Foil Seal
        const sealX = 1200;
        const sealY = 1210;
        const sealRadius = 90;

        // Ribbon Tails
        ctx.fillStyle = '#e30613';
        ctx.beginPath();
        ctx.moveTo(sealX - 25, sealY + 60);
        ctx.lineTo(sealX - 45, sealY + 160);
        ctx.lineTo(sealX - 25, sealY + 145);
        ctx.lineTo(sealX - 5, sealY + 160);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#20488e';
        ctx.beginPath();
        ctx.moveTo(sealX + 5, sealY + 60);
        ctx.lineTo(sealX + 25, sealY + 160);
        ctx.lineTo(sealX + 45, sealY + 145);
        ctx.lineTo(sealX + 65, sealY + 160);
        ctx.closePath();
        ctx.fill();

        // Outer Gold Circle
        const sealGrad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, sealRadius);
        sealGrad.addColorStop(0, '#fff2a8');
        sealGrad.addColorStop(0.5, '#dfb15b');
        sealGrad.addColorStop(1, '#a37508');
        ctx.fillStyle = sealGrad;
        ctx.beginPath();
        ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#7a5806';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(sealX, sealY, sealRadius - 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#4a3301';
        ctx.font = 'bold 15px "Montserrat", sans-serif';
        ctx.fillText('SOMOS PERÚ', sealX, sealY - 38);

        // Draw real logo in seal
        const sealLogoW = 70;
        const sealLogoH = (643.9 / 753.5) * sealLogoW;
        ctx.drawImage(logoImg, sealX - sealLogoW / 2, sealY - 22, sealLogoW, sealLogoH);

        ctx.fillStyle = '#e30613';
        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.fillText('2026', sealX, sealY + 45);
        ctx.fillStyle = '#20488e';
        ctx.font = 'bold 13px "Montserrat", sans-serif';
        ctx.fillText('ACREDITACIÓN OFICIAL', sealX, sealY + 64);

        // Right Signature
        ctx.strokeStyle = '#20488e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(1650, 1170);
        ctx.bezierCurveTo(1700, 1110, 1770, 1230, 1850, 1130);
        ctx.bezierCurveTo(1890, 1090, 1930, 1210, 2010, 1160);
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(1630, 1230);
        ctx.lineTo(2020, 1230);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px "Montserrat", Arial, sans-serif';
        ctx.fillText('SECRETARÍA NACIONAL ELECTORAL', 1825, 1265);
        ctx.fillStyle = '#64748b';
        ctx.font = '18px "Montserrat", Arial, sans-serif';
        ctx.fillText('Comisión de Control y Conteo Rápido', 1825, 1295);
        ctx.fillText('Elecciones Generales 2026', 1825, 1320);

        // 10. Security Microline and Barcode
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(180, 1420);
        ctx.lineTo(2220, 1420);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.fillText(`CÓDIGO DE VALIDACIÓN: ${verifCode}  •  FOLIO: ${folioCode}  •  HABILITACIÓN OFICIAL JNE/ONPE 2026`, 180, 1455);

        ctx.textAlign = 'right';
        ctx.fillText(`EMISIÓN: ${currentDateStr.toUpperCase()}`, 2220, 1455);

        // Download High Quality PNG
        const link = document.createElement('a');
        link.download = `Certificado_Oficial_Somos_Peru_${rawDni}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (e) {
        console.error('Error al generar canvas HD:', e);
      } finally {
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.disabled = false;
      }
    });
  }
}
