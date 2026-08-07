import { icons } from './icons.js';
import { getCurrentSession } from './auth.js';
import { updateTrainingProgress } from './api.js';

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
            <div class="info-badge"><strong>Distrito:</strong> <span>${session.district || '-'}</span></div>
            <div class="info-badge"><strong>Mesa:</strong> <span>${session.mesa || '-'}</span></div>
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
              <strong>Mi Credencial Oficial</strong>
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
      if (iconEl) iconEl.textContent = '🎟️';
      labelCredentials.textContent = 'Desbloqueado (Confirmado)';
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
      <style>
        .simulated-video-container {
          position: relative;
          overflow: hidden;
          background: #090d16;
          border-radius: 8px;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #1e293b;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
          cursor: pointer;
        }
        /* Fullscreen styles when native fullscreen is active */
        .simulated-video-container:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          border: none !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          background: #000 !important;
        }
        .simulated-video-container:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          border: none !important;
          border-radius: 0 !important;
          background: #000 !important;
        }
        
        /* Video Controls Overlay */
        .video-controls-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(15, 23, 42, 0.95) 45%);
          padding: 24px 12px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
          z-index: 20;
          border-top: none;
        }
        .simulated-video-container.show-controls .video-controls-overlay {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        
        /* Range input scrubber custom styling */
        #video-scrubber {
          flex: 1;
          accent-color: var(--primary-color);
          cursor: pointer;
          height: 4px;
          border-radius: 2px;
          background: #334155;
          outline: none;
          transition: height 0.1s ease;
        }
        #video-scrubber:hover {
          height: 6px;
        }
      </style>
      <div class="training-modal-overlay">
        <div class="training-modal" style="max-width: 440px;">
          <div class="training-modal-header">
            <h3>Capacitación Electoral - Video</h3>
            <button class="btn-close-modal" id="btn-close-video">×</button>
          </div>
          <div class="training-modal-body">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
              Observe el video tutorial sobre el Conteo Electoral completo para validar su progreso. Mueva el cursor sobre el video para ver los controles.
            </p>
            
            <div class="simulated-video-container show-controls">
              <!-- Video Screen Area -->
              <div id="video-visual-screen" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #38bdf8; padding: 15px; z-index: 10;">
                <div style="font-size: 2.2rem; margin-bottom: 6px; filter: drop-shadow(0 2px 8px rgba(56,189,248,0.4));" id="video-visual-icon">🗳️</div>
                <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" id="video-visual-title">1. Instalación de la Mesa</div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px; line-height: 1.3;" id="video-visual-subtext">Verifique los materiales y actas antes del inicio.</div>
              </div>
              
              <!-- Video Controls Area (YouTube style overlay) -->
              <div class="video-controls-overlay">
                <!-- Scrubber Slider -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="range" id="video-scrubber" min="0" max="60" value="0">
                  <span id="simulated-time-label" style="font-size: 0.75rem; color: #94a3b8; font-family: monospace; white-space: nowrap;">00:00 / 01:00</span>
                </div>
                
                <!-- Playback Buttons -->
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <button type="button" id="btn-video-rewind" class="btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; display: flex; align-items: center; gap: 4px; background: #1e293b; border-color: #334155; margin: 0; width: auto; color: #fff; border-radius: 4px;" title="Retroceder 10 segundos">
                      ⏪ -10s
                    </button>
                    <button type="button" id="btn-video-play-pause" class="btn-submit" style="padding: 4px 12px; font-size: 0.75rem; display: flex; align-items: center; gap: 4px; background: var(--primary-color); color: #0f172a; font-weight: bold; margin: 0; width: auto; border-radius: 4px;">
                      <span id="play-pause-btn-text">▶️ Iniciar</span>
                    </button>
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <!-- Volume Control -->
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <button type="button" id="btn-video-volume" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; font-size: 0.85rem;" title="Volumen">
                        🔊
                      </button>
                      <input type="range" id="video-volume-slider" min="0" max="100" value="100" style="width: 50px; accent-color: var(--primary-color); cursor: pointer;" title="Ajustar volumen">
                    </div>

                    <button type="button" id="btn-video-fullscreen" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" title="Pantalla Completa">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2-2h3"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="video-status-msg" style="font-size: 0.8rem; text-align: center; margin-top: 10px; color: var(--primary-color); font-weight: 500;">
              Haga clic en el botón de Iniciar para reproducir.
            </div>
          </div>
          <div class="training-modal-footer">
            <button class="btn-submit" id="btn-finish-video" style="padding: 8px 16px; font-size: 0.85rem; width: auto; margin: 0; opacity: 0.5; cursor: not-allowed;" disabled>
              <span>🔒 Debe terminar el video</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('btn-close-video');
    const container = document.querySelector('.simulated-video-container');
    const scrubber = document.getElementById('video-scrubber');
    const playPauseBtn = document.getElementById('btn-video-play-pause');
    const playPauseText = document.getElementById('play-pause-btn-text');
    const btnRewind = document.getElementById('btn-video-rewind');
    const btnVolume = document.getElementById('btn-video-volume');
    const volumeSlider = document.getElementById('video-volume-slider');
    const btnFullscreen = document.getElementById('btn-video-fullscreen');
    const timeLabel = document.getElementById('simulated-time-label');
    const visualIcon = document.getElementById('video-visual-icon');
    const visualTitle = document.getElementById('video-visual-title');
    const visualSub = document.getElementById('video-visual-subtext');
    const finishBtn = document.getElementById('btn-finish-video');
    const statusMsg = document.getElementById('video-status-msg');

    let videoPlaying = false;
    let videoDuration = 60; // 60 seconds simulation
    let videoCurrentTime = 0;
    let maxWatchedTime = 0;
    let currentVolume = 100;
    let isMuted = false;
    let intervalId = null;
    let hideTimeout = null;

    // Helper to format time as mm:ss
    function formatTime(sec) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    // Educational content slides shown based on video timestamp
    const slides = [
      { time: 0, icon: '🗳️', title: '1. Instalación de la Mesa', sub: 'Verifique los materiales electorales y actas antes del inicio oficial.' },
      { time: 15, icon: '👥', title: '2. Sufragio de los Votantes', sub: 'Valide la identidad de cada elector con su D.N.I. y firma.' },
      { time: 35, icon: '📊', title: '3. Escrutinio y Conteo', sub: 'Cuente voto por voto de forma minuciosa y registre votos de nuestra lista.' },
      { time: 50, icon: '✍️', title: '4. Cierre y Copias del Acta', sub: 'Firme el acta final y exija su copia certificada inmediatamente.' }
    ];

    function showControls() {
      container.classList.add('show-controls');
      clearTimeout(hideTimeout);
      
      // Auto hide controls only if video is playing
      if (videoPlaying) {
        hideTimeout = setTimeout(() => {
          container.classList.remove('show-controls');
        }, 2200);
      }
    }

    function updateVisualScreen() {
      let activeSlide = slides[0];
      for (let i = 0; i < slides.length; i++) {
        if (videoCurrentTime >= slides[i].time) {
          activeSlide = slides[i];
        }
      }
      visualIcon.textContent = activeSlide.icon;
      visualTitle.textContent = activeSlide.title;
      visualSub.textContent = activeSlide.sub;
      
      scrubber.value = videoCurrentTime;
      timeLabel.textContent = `${formatTime(videoCurrentTime)} / ${formatTime(videoDuration)}`;

      if (videoCurrentTime >= videoDuration) {
        videoPlaying = false;
        clearInterval(intervalId);
        playPauseText.textContent = '▶️ Iniciar';
        statusMsg.textContent = '✅ ¡Video observado correctamente!';
        finishBtn.disabled = false;
        finishBtn.innerHTML = '<span>Completar Video</span>';
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
        finishBtn.style.background = 'var(--success-color)';
        finishBtn.style.color = '#fff';
        container.classList.add('show-controls');
      } else {
        finishBtn.disabled = true;
        finishBtn.style.opacity = '0.5';
        finishBtn.style.cursor = 'not-allowed';
        finishBtn.innerHTML = '<span>🔒 Debe terminar el video</span>';
        if (videoPlaying) {
          statusMsg.textContent = '🎥 Reproduciendo video instructivo... (Adelanto desactivado)';
        } else {
          statusMsg.textContent = '⏸️ Video pausado.';
        }
      }
    }

    function togglePlay() {
      if (videoPlaying) {
        videoPlaying = false;
        clearInterval(intervalId);
        playPauseText.textContent = '▶️ Reanudar';
        clearTimeout(hideTimeout);
        container.classList.add('show-controls');
      } else {
        if (videoCurrentTime >= videoDuration) {
          videoCurrentTime = 0;
        }
        videoPlaying = true;
        playPauseText.textContent = '⏸️ Pausar';
        intervalId = setInterval(() => {
          videoCurrentTime += 1;
          if (videoCurrentTime > maxWatchedTime) {
            maxWatchedTime = videoCurrentTime;
          }
          if (videoCurrentTime >= videoDuration) {
            videoCurrentTime = videoDuration;
          }
          updateVisualScreen();
        }, 1000);
        showControls();
      }
      updateVisualScreen();
    }

    // Event listeners for auto-hide controls
    container.addEventListener('mousemove', showControls);
    container.addEventListener('mouseenter', showControls);
    container.addEventListener('mouseleave', () => {
      if (videoPlaying) {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          container.classList.remove('show-controls');
        }, 800);
      }
    });

    container.addEventListener('click', (e) => {
      const isControls = e.target.closest('.video-controls-overlay');
      if (!isControls) {
        togglePlay();
      }
    });

    closeBtn.addEventListener('click', () => {
      clearInterval(intervalId);
      clearTimeout(hideTimeout);
      modalContainer.innerHTML = '';
    });

    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });

    btnRewind.addEventListener('click', (e) => {
      e.stopPropagation();
      videoCurrentTime = Math.max(0, videoCurrentTime - 10);
      showControls();
      updateVisualScreen();
    });

    // Prevent seeking forward: user can only seek backward or to what was already watched
    scrubber.addEventListener('input', (e) => {
      const targetTime = parseInt(e.target.value, 10);
      if (targetTime > maxWatchedTime) {
        // Prevent forward seek beyond watched time
        scrubber.value = videoCurrentTime;
      } else {
        // Allow rewinding / seeking back
        videoCurrentTime = targetTime;
        showControls();
        updateVisualScreen();
      }
    });

    // Volume controls
    function updateVolumeUI() {
      if (isMuted || currentVolume === 0) {
        btnVolume.textContent = '🔇';
      } else if (currentVolume < 50) {
        btnVolume.textContent = '🔉';
      } else {
        btnVolume.textContent = '🔊';
      }
    }

    btnVolume.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      volumeSlider.value = isMuted ? 0 : currentVolume;
      updateVolumeUI();
    });

    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      currentVolume = parseInt(e.target.value, 10);
      isMuted = (currentVolume === 0);
      updateVolumeUI();
    });

    btnFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      showControls();
    });

    finishBtn.addEventListener('click', async () => {
      if (videoCount >= 2) {
        showToastNotification('Límite Alcanzado', 'Ya completaste las 2 visualizaciones de video.', 'warning');
        modalContainer.innerHTML = '';
        return;
      }

      finishBtn.disabled = true;
      finishBtn.innerHTML = `<span>Procesando...</span> <span class="spinner-inline"></span>`;

      try {
        const res = await updateTrainingProgress(session.dni, 'video', videoCount);
        if (res.status === 'success') {
          videoCount = res.video !== undefined ? res.video : Math.min(2, videoCount + 1);
          if (res.pdf !== undefined) pdfCount = res.pdf;
          credenciales = res.credenciales || ((videoCount >= 2 && pdfCount >= 2) ? 'Confirmado' : 'Bloqueado');
          
          localStorage.setItem('user_video_count', videoCount);
          localStorage.setItem('user_pdf_count', pdfCount);
          localStorage.setItem('user_credenciales', credenciales);
          updateUIState();

          if (videoCount >= 2 && pdfCount >= 2) {
            showToastNotification('¡Capacitación Completada!', 'Has completado 2/2 videos y 2/2 lecturas. ¡Tu Credencial Oficial ha sido DESBLOQUEADA!', 'success');
          } else {
            showToastNotification('¡Video Registrado!', `Progreso de video guardado exitosamente (${videoCount}/2)`, 'success');
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

    function openPdfModal() {
    modalContainer.innerHTML = `
      <div class="training-modal-overlay">
        <div class="training-modal" style="max-width:580px;width:94%;max-height:90vh;">
          <div class="training-modal-header" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;gap:7px;">
              <span style="font-size:1rem;">ðŸ“˜</span>
              <h3 style="color:#fff;font-size:0.92rem;margin:0;font-family:'Outfit',sans-serif;font-weight:700;">Manual Oficial DidÃ¡ctico â€” VotoReal 2026</h3>
            </div>
            <button class="btn-close-modal" id="btn-close-pdf" style="color:#fff;">Ã—</button>
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
                .pm-tips li::before { content:'âœ”'; color:#a78bfa; font-weight:800; margin-right:4px; }
                .pm-print-bar { display:flex; justify-content:flex-end; margin-bottom:8px; }
                .pm-print-btn { background:linear-gradient(90deg,#0284c7,#0369a1); color:#fff; border:none; padding:5px 11px; border-radius:7px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; font-size:0.68rem; }
              </style>

              <div class="pm">
                <div class="pm-print-bar">
                  <button class="pm-print-btn" id="btn-print-pdf-manual">ðŸ–¨ï¸ Imprimir / Guardar PDF</button>
                </div>

                <div class="pm-head">
                  <div class="pm-badge">ðŸ“± VotoReal MÃ³vil 2026 â€” Somos PerÃº</div>
                  <div class="pm-title">Manual Oficial con Capturas Reales</div>
                  <p class="pm-subtitle">GuÃ­a visual paso a paso para Personeros y Coordinadores de Mesa.</p>
                </div>

                <h2 class="pm-section">ðŸ“± Paso a Paso con Capturas de Pantalla</h2>

                <!-- PASO 1 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">1</div><div class="pm-step-title">Ingreso al Aplicativo (Acceso)</div></div>
                  <p class="pm-desc">Abre <strong>VotoReal MÃ³vil</strong> en tu celular. Ingresa tus <strong>Nombres y Apellidos</strong> y tu <strong>DNI de 8 dÃ­gitos</strong>, luego presiona <strong>"Ingresar"</strong>.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_1_login.png" alt="Captura 1 - Inicio de SesiÃ³n" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_1_login.png';">
                    <div class="pm-img-caption">ðŸ“¸ Pantalla Real: Acceso de Personero con DNI</div>
                  </div>
                </div>

                <!-- PASO 2 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">2</div><div class="pm-step-title">MÃ³dulo de Conteo Manual</div></div>
                  <p class="pm-desc">Al iniciar el escrutinio (5:00 PM), accede a la pantalla de <strong>Conteo de Votos</strong> de tu mesa electoral asignada.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_2_conteo_manual.png" alt="Captura 2 - Conteo Manual" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_2_conteo_manual.png';">
                    <div class="pm-img-caption">ðŸ“¸ Pantalla Real: Ingreso y SelecciÃ³n de Mesa de VotaciÃ³n</div>
                  </div>
                </div>

                <!-- PASO 3 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">3</div><div class="pm-step-title">Llenado de Casillas de Votos</div></div>
                  <p class="pm-desc">Ingresa casilla por casilla los votos vÃ¡lidos de <strong>Somos PerÃº Provincial</strong>, <strong>Somos PerÃº Distrital</strong>, <strong>Votos Nulos</strong> y <strong>Blancos</strong>.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_3_votos_llenados.png" alt="Captura 3 - Casillas de VotaciÃ³n" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_3_votos_llenados.png';">
                    <div class="pm-img-caption">ðŸ“¸ Pantalla Real: Registro detallado de votos por lista</div>
                  </div>
                </div>

                <!-- PASO 4 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">4</div><div class="pm-step-title">VerificaciÃ³n de Conteo y ComparaciÃ³n</div></div>
                  <p class="pm-desc">Revisa el total calculado automÃ¡ticamente por el sistema y compÃ¡ralo con el acta fÃ­sica firmada en la mesa.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_4_conteo_imagen.png" alt="Captura 4 - Conteo por Imagen" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_4_conteo_imagen.png';">
                    <div class="pm-img-caption">ðŸ“¸ Pantalla Real: TotalizaciÃ³n y ValidaciÃ³n de Resultados</div>
                  </div>
                </div>

                <!-- PASO 5 -->
                <div class="pm-step">
                  <div class="pm-step-hdr"><div class="pm-num">5</div><div class="pm-step-title">TransmisiÃ³n, Escaneo y Cierre Oficial</div></div>
                  <p class="pm-desc">Toma la foto o escaneo del acta de cierre y presiona <strong>"Enviar y Transmitir"</strong> para registrar en Google Sheets y cerrar mesa.</p>
                  <div class="pm-img-frame">
                    <img src="./app_captura_5_modal_escaner.png" alt="Captura 5 - EscÃ¡ner y Cierre" loading="lazy" onerror="this.onerror=null;this.src='/app_captura_5_modal_escaner.png';">
                    <div class="pm-img-caption">ðŸ“¸ Pantalla Real: TransmisiÃ³n y EnvÃ­o al Servidor Central</div>
                  </div>
                </div>

                <div class="pm-tips">
                  <h4>ðŸ’¡ Recomendaciones Clave para la Jornada</h4>
                  <ul>
                    <li>Lleva tu celular cargado al 100% y con datos mÃ³viles activos.</li>
                    <li>Anota tu usuario y DNI en papel como respaldo ante cualquier duda.</li>
                    <li>Si la seÃ±al es dÃ©bil, el sistema guardarÃ¡ todo en modo local y se sincronizarÃ¡ automÃ¡ticamente.</li>
                    <li>Verifica que la suma de votos coincida con los votantes que sufragaron.</li>
                  </ul>
                </div>

              </div>
            </div>

            <div style="margin-top:8px;display:flex;justify-content:flex-end;">
              <button id="btn-finish-pdf" disabled style="opacity:0.4;cursor:not-allowed;background:linear-gradient(90deg,#10b981,#059669);color:#fff;border:none;padding:7px 14px;border-radius:9px;font-weight:700;font-size:0.78rem;display:flex;align-items:center;gap:5px;">
                âœ… Marcar como LeÃ­do
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
      if (pdfCount >= 2) {
        showToastNotification('LÃ­mite Alcanzado', 'Ya completaste las 2 lecturas de PDF.', 'warning');
        modalContainer.innerHTML = '';
        return;
      }

      finishBtn.disabled = true;
      finishBtn.innerHTML = `<span>Procesando...</span> <span class="spinner-inline"></span>`;

      try {
        const res = await updateTrainingProgress(session.dni, 'pdf', pdfCount);
        if (res.status === 'success') {
          pdfCount = res.pdf !== undefined ? res.pdf : Math.min(2, pdfCount + 1);
          if (res.video !== undefined) videoCount = res.video;
          credenciales = res.credenciales || ((videoCount >= 2 && pdfCount >= 2) ? 'Confirmado' : 'Bloqueado');

          localStorage.setItem('user_video_count', videoCount);
          localStorage.setItem('user_pdf_count', pdfCount);
          localStorage.setItem('user_credenciales', credenciales);
          updateUIState();

          if (videoCount >= 2 && pdfCount >= 2) {
            showToastNotification('Â¡CapacitaciÃ³n Completada!', 'Has completado 2/2 videos y 2/2 lecturas. Â¡Tu Credencial Oficial ha sido DESBLOQUEADA!', 'success');
          } else {
            showToastNotification('Â¡Manual Registrado!', `Progreso de lectura guardado exitosamente (${pdfCount}/2)`, 'success');
          }
        }
      } catch (err) {
        console.error(err);
        showToastNotification('Error de ConexiÃ³n', 'No se pudo guardar el avance. Por favor intente nuevamente.', 'warning');
      } finally {
        modalContainer.innerHTML = '';
      }
    });
  }

  function openCredentialsModal() {
    modalContainer.innerHTML = `
      <style id="credentials-print-style">
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-credential-area, #printable-credential-area * {
            visibility: visible;
          }
          #printable-credential-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.3);
            border: 2px solid #0f172a !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          .credential-header {
            background: #0f172a !important;
            color: #ffffff !important;
          }
          .credential-status-badge {
            background: #d1fae5 !important;
            color: #065f46 !important;
            border: 1px solid #10b981 !important;
          }
        }
      </style>
      <div class="training-modal-overlay">
        <div class="training-modal" style="max-width: 420px;">
          <div class="training-modal-header">
            <h3>Credencial Oficial</h3>
            <button class="btn-close-modal" id="btn-close-credentials">×</button>
          </div>
          <div class="training-modal-body" style="padding: 24px;">
            <div class="credential-badge" id="printable-credential-area">
              <div class="credential-header">
                <h4>CONTEO LIMA 2026</h4>
                <span>Personero de Mesa</span>
              </div>
              <div class="credential-body">
                <div class="credential-field">
                  <label>Nombres y Apellidos</label>
                  <span>${session.name}</span>
                </div>
                <div class="credential-field">
                  <label>D.N.I.</label>
                  <span>${session.dni}</span>
                </div>
                <div class="credential-field" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div>
                    <label>Distrito</label>
                    <span>${session.district}</span>
                  </div>
                  <div>
                    <label>Mesa Electoral</label>
                    <span>${session.mesa}</span>
                  </div>
                </div>
                <div class="credential-field">
                  <label>Centro de Votación</label>
                  <span style="font-size: 0.85rem;">${session.center || 'No asignado'}</span>
                </div>
                
                <div class="credential-status-badge">
                  <span>✨ Credencial Confirmada ✨</span>
                </div>
              </div>
            </div>
          </div>
          <div class="training-modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn-secondary" id="btn-download-credentials" style="padding: 8px 16px; font-size: 0.85rem; width: auto; margin: 0; display: flex; align-items: center; gap: 6px; border-color: #334155;">
              💾 Descargar
            </button>
            <button class="btn-submit" id="btn-print-credentials" style="padding: 8px 16px; font-size: 0.85rem; width: auto; margin: 0; background: var(--primary-color); color: #0f172a;">
              <span>🖨️ Imprimir</span>
            </button>
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

    downloadBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 600, 400);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 400);
      
      // Elegant blue border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 594, 394);
      
      // Circular visual decoration
      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.beginPath();
      ctx.arc(600, 0, 220, 0, Math.PI * 2);
      ctx.fill();
      
      // Title
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CONTEO LIMA 2026', 40, 55);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('CREDENCIAL OFICIAL DE PERSONERO DE MESA', 40, 80);
      
      // Line divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 100);
      ctx.lineTo(560, 100);
      ctx.stroke();
      
      // Data fields labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 11px sans-serif';
      ctx.fillText('NOMBRES Y APELLIDOS', 40, 135);
      ctx.fillText('DOCUMENTO NACIONAL DE IDENTIDAD (D.N.I.)', 40, 205);
      ctx.fillText('DISTRITO DE VOTACIÓN', 40, 275);
      ctx.fillText('MESA ELECTORAL', 240, 275);
      ctx.fillText('CENTRO DE VOTACIÓN', 40, 345);
      
      // Data values
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(session.name.toUpperCase(), 40, 160);
      ctx.fillText(session.dni, 40, 230);
      ctx.fillText(session.district.toUpperCase(), 40, 300);
      ctx.fillText(session.mesa, 240, 300);
      ctx.fillText((session.center || 'No asignado').toUpperCase(), 40, 370);
      
      // Stamp "Confirmada"
      ctx.fillStyle = '#10b981';
      ctx.fillRect(410, 125, 140, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CONFIRMADA', 480, 147);
      
      // Download link
      const link = document.createElement('a');
      link.download = `credencial_personero_${session.dni}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}
