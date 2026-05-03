/* ═══════════════════════════════════════════
   VIGIL — LUXURY HMI ENGINE (V5.0)
   Live Feedback, Cinematic Transitions,
   Particles, Gemini 2.5 Flash AI
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const phaseInput = $('#phase-input');
  const phaseResults = $('#phase-results');
  const scanOverlay = $('#scan-overlay');
  const gaugePath = $('#gauge-readiness');

  let pathLength = 0;
  let bioRingLength = 628.3; // 2 * PI * 100

  const state = {
    sleep: 7.0,
    stress: 1,
    emotion: 1,
    meds: ['none']
  };

  // ═══ AUDIO FX ENGINE ═══
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let actx = null;
  function playClick() {
    if(!actx) actx = new AudioContext();
    if(actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, actx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.05);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(); osc.stop(actx.currentTime + 0.05);
  }
  function playScan() {
    if(!actx) actx = new AudioContext();
    if(actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, actx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, actx.currentTime + 1.5);
    gain.gain.setValueAtTime(0, actx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, actx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, actx.currentTime + 1.5);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(); osc.stop(actx.currentTime + 1.5);
  }

  // ═══ WEBCAM HUD ═══
  async function initWebcam() {
    const video = document.getElementById('operator-video');
    const hud = document.getElementById('operator-hud');
    if (!video || !hud) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = stream;
      const overlay = document.getElementById('hud-activate-overlay');
      if (overlay) overlay.classList.add('hidden');
      const hudStatus = document.getElementById('hud-status');
      if (hudStatus && hudStatus.textContent === 'STANDBY') hudStatus.textContent = 'ACQUIRING...';
    } catch (err) {
      console.warn('Webcam access denied. Running without live HUD.');
    }
  }

  // ═══ BOOT SEQUENCE ═══
  function runBootSequence() {
    const bootOverlay = document.getElementById('boot-sequence');
    const bootText = document.getElementById('boot-text');
    if(!bootOverlay || !bootText) { init(); return; }
    
    const lines = [
      "VIGIL OS v5.0 Kernel loaded.",
      "Initializing biometric matrices...",
      "Establishing secure neural link...",
      "Connecting to Gemini 2.5 AI Node...",
      "SYSTEM ONLINE."
    ];
    let i = 0;
    function nextLine() {
      if (i < lines.length) {
        bootText.innerHTML += lines[i] + "\n";
        if (i < lines.length - 1) playClick();
        i++;
        setTimeout(nextLine, 300 + Math.random() * 400);
      } else {
        setTimeout(() => {
          bootOverlay.classList.add('hidden');
          document.getElementById('operator-hud').style.display = 'block';
          init();
        }, 600);
      }
    }
    setTimeout(nextLine, 500);
  }

  // ═══ GEMINI AI SECURE BACKEND MODULE ═══
  async function callBackendAI(res) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, computed: res })
      });
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();
      return data.analysis || null;
    } catch (err) {
      console.error('Backend API Error:', err);
      return null;
    }
  }

  // Text-to-Speech
  let currentUtterance = null;
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const voiceIndicator = $('#voice-indicator');
    if (voiceIndicator) voiceIndicator.classList.remove('hidden');

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 1.05;
    currentUtterance.pitch = 0.95;
    
    // Pick an English voice, preferably female and professional
    const voices = window.speechSynthesis.getVoices();
    const prefVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira'));
    if (prefVoice) currentUtterance.voice = prefVoice;

    currentUtterance.onend = () => {
      if (voiceIndicator) voiceIndicator.classList.add('hidden');
    };
    currentUtterance.onerror = () => {
      if (voiceIndicator) voiceIndicator.classList.add('hidden');
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function typewriterEffect(elementId, text, speed = 18) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'ai-cursor';

    function type() {
      if (i < text.length) {
        // Add character
        el.textContent = text.substring(0, i + 1);
        el.appendChild(cursor);
        i++;
        setTimeout(type, speed + Math.random() * 10);
      } else {
        // Remove cursor after done
        setTimeout(() => cursor.remove(), 1500);
      }
    }
    type();
  }

  // ═══ PARTICLES ═══
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = 40;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.3 + 0.05
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.a})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ═══ HEARTBEAT CANVAS ═══
  let heartbeatAnim = null;
  function startHeartbeat(severity) {
    const canvas = document.getElementById('heartbeat-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 120;

    let offset = 0;
    const colors = {
      safe: '#00E5FF',
      warn: '#FFB700',
      danger: '#FF003C'
    };
    const color = colors[severity] || colors.safe;
    const speed = severity === 'danger' ? 3 : severity === 'warn' ? 2.2 : 1.6;

    if (heartbeatAnim) cancelAnimationFrame(heartbeatAnim);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      const mid = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const t = (x + offset) * 0.02 * speed;
        const cycle = t % (Math.PI * 2);
        let y = mid;

        // ECG-like waveform
        if (cycle > 1.5 && cycle < 1.8) {
          y = mid - 30 * Math.sin((cycle - 1.5) * (Math.PI / 0.3));
        } else if (cycle > 2.0 && cycle < 2.15) {
          y = mid + 50 * Math.sin((cycle - 2.0) * (Math.PI / 0.15));
        } else if (cycle > 2.15 && cycle < 2.45) {
          y = mid - 15 * Math.sin((cycle - 2.15) * (Math.PI / 0.3));
        } else {
          y = mid + Math.sin(t * 0.5) * 2;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += speed;
      heartbeatAnim = requestAnimationFrame(draw);
    }
    draw();
  }

  // ═══ LIVE READINESS (Phase 1) ═══
  function calculateRisk() {
    let fatigue = 0, impair = 0, emotional = 0;
    const anomalies = [];

    if (state.sleep <= 3) {
      fatigue = 9.5;
      anomalies.push({ type: 'danger', icon: '⚠', text: 'Critical Sleep Deficit (<4h)' });
    } else if (state.sleep <= 5) {
      fatigue = 7.0;
      anomalies.push({ type: 'warn', icon: '⚠', text: 'Significant Sleep Debt Detected' });
    } else if (state.sleep <= 6) {
      fatigue = 4.0;
    } else {
      fatigue = Math.max(0.2, (8 - state.sleep) * 0.5);
    }

    if (state.meds.includes('alcohol')) {
      impair = Math.max(impair, 9.5);
      anomalies.push({ type: 'danger', icon: '⛔', text: 'Alcohol Detected — Zero Tolerance' });
    }
    if (state.meds.includes('thc')) {
      impair = Math.max(impair, 8.0);
      anomalies.push({ type: 'danger', icon: '⛔', text: 'THC Detected — Cognitive Impairment' });
    }
    if (state.meds.includes('sedative')) {
      impair = Math.max(impair, 8.5);
      anomalies.push({ type: 'danger', icon: '⛔', text: 'Sedative Active — Reaction Time Degraded' });
    }
    if (state.meds.includes('stimulant')) {
      impair = Math.max(impair, 5.0);
      anomalies.push({ type: 'warn', icon: '⚠', text: 'Stimulant Active — Monitor Closely' });
    }

    emotional = (state.emotion - 1) * 3;
    if (state.stress > 1) emotional += state.stress * 1.5;
    if (state.stress >= 3) anomalies.push({ type: 'warn', icon: '⚠', text: 'Elevated Cortisol — Stress Response Active' });
    if (state.emotion >= 3) anomalies.push({ type: 'danger', icon: '⚠', text: 'Erratic Psychological State Detected' });

    emotional = Math.min(10, emotional);
    const compositeRisk = Math.min(10, (fatigue * 0.4) + (impair * 0.4) + (emotional * 0.2));
    const readinessScore = Math.max(0, 100 - (compositeRisk * 10));

    return { readiness: readinessScore, fatigue, impair, emotional, anomalies };
  }

  function updateLiveRing() {
    const res = calculateRisk();
    const score = Math.round(res.readiness);
    const ringFill = $('#bio-ring-fill');
    const scoreEl = $('#live-score');
    const statusEl = $('#live-status');

    // Update ring arc
    const offset = bioRingLength - (bioRingLength * (score / 100));
    ringFill.style.transition = 'stroke-dashoffset 0.5s ease, stroke 0.5s ease';
    ringFill.style.strokeDashoffset = offset;

    // Animate number
    animateValue('live-score', parseInt(scoreEl.textContent) || 0, score, 400);

    // Color theming
    scoreEl.className = 'bio-ring-score';
    if (score < 40) {
      ringFill.style.stroke = 'url(#ring-grad-danger)';
      statusEl.textContent = 'RESTRICTED';
      statusEl.style.color = 'var(--accent-danger)';
      scoreEl.classList.add('danger');
    } else if (score < 75) {
      ringFill.style.stroke = 'url(#ring-grad-warn)';
      statusEl.textContent = 'CAUTION';
      statusEl.style.color = 'var(--accent-warn)';
      scoreEl.classList.add('warn');
    } else {
      ringFill.style.stroke = 'url(#ring-grad-safe)';
      statusEl.textContent = 'OPTIMAL';
      statusEl.style.color = 'var(--accent-cyan)';
    }

    // Update card highlight states
    updateCardStates(res);
  }

  function updateCardStates(res) {
    // Sleep card
    const sleepCard = $('#card-sleep');
    const sleepMicro = $('#sleep-micro');
    const sleepFill = $('#sleep-fill');
    sleepCard.className = 'control-card';
    sleepMicro.className = 'micro-fill';
    sleepFill.className = 'slider-fill';

    if (state.sleep <= 3) {
      sleepCard.classList.add('active-danger');
      sleepMicro.classList.add('danger');
      sleepFill.classList.add('danger');
      sleepMicro.style.width = '15%';
    } else if (state.sleep <= 5) {
      sleepCard.classList.add('active-warn');
      sleepMicro.classList.add('warn');
      sleepFill.classList.add('warn');
      sleepMicro.style.width = '40%';
    } else {
      sleepMicro.classList.add('good');
      sleepMicro.style.width = Math.min(100, (state.sleep / 8) * 100) + '%';
    }
    sleepFill.style.width = (state.sleep / 12 * 100) + '%';

    // Stress card
    const stressCard = $('#card-stress');
    stressCard.className = 'control-card';
    if (state.stress >= 3) stressCard.classList.add('active-danger');
    else if (state.stress === 2) stressCard.classList.add('active-warn');

    // Emotion card
    const emotionCard = $('#card-emotion');
    emotionCard.className = 'control-card';
    if (state.emotion >= 3) emotionCard.classList.add('active-danger');
    else if (state.emotion === 2) emotionCard.classList.add('active-warn');

    // Meds card
    const medsCard = $('#card-meds');
    medsCard.className = 'control-card';
    if (state.meds.includes('alcohol') || state.meds.includes('thc') || state.meds.includes('sedative')) {
      medsCard.classList.add('active-danger');
    } else if (state.meds.includes('stimulant')) {
      medsCard.classList.add('active-warn');
    }
  }

  // ═══ SEGMENT HIGHLIGHT SLIDER ═══
  function moveHighlight(containerId, idx) {
    const highlight = $(`#${containerId} .segment-highlight`);
    if (!highlight) return;
    const segCount = $$(`#${containerId} .segment`).length;
    highlight.style.left = `calc(${idx * (100 / segCount)}% + 4px)`;
    highlight.style.width = `calc(${100 / segCount}% - 8px)`;
    highlight.style.transform = 'none';
  }

  // ═══ INIT ═══
  function init() {
    if (gaugePath) {
      pathLength = gaugePath.getTotalLength();
      gaugePath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      gaugePath.style.strokeDashoffset = pathLength;
    }

    // Clock
    const updateTime = () => {
      $('#time-display').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);

    initParticles();
    bindInputs();
    bindButtons();
    updateLiveRing();

    // Init segment highlights
    moveHighlight('in-stress', 0);
    moveHighlight('in-emotion', 0);

    // 3D Parallax effect on results dashboard
    const resultsPhase = $('#phase-results');
    const dashboardGrid = $('#phase-results > .dashboard-grid');
    if (resultsPhase && dashboardGrid) {
      resultsPhase.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 60;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
        dashboardGrid.style.transform = `perspective(1200px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      });
      resultsPhase.addEventListener('mouseleave', () => {
        dashboardGrid.style.transform = `perspective(1200px) rotateY(0deg) rotateX(0deg)`;
        setTimeout(() => dashboardGrid.style.transition = 'transform 0.1s ease-out', 300);
      });
      dashboardGrid.style.transition = 'transform 0.1s ease-out';
    }
  }

  function bindInputs() {
    // Sleep slider
    $('#in-sleep').addEventListener('input', (e) => {
      playClick();
      state.sleep = parseFloat(e.target.value);
      $('#val-sleep').textContent = state.sleep.toFixed(1) + 'h';
      updateLiveRing();
    });

    // Segmented controls with animated highlight
    function bindSegment(containerId, stateKey, valElId, labels) {
      const segments = $$(`#${containerId} .segment`);
      segments.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          playClick();
          segments.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state[stateKey] = parseInt(btn.dataset.val);
          $(`#${valElId}`).textContent = labels ? labels[state[stateKey] - 1] : btn.textContent;
          moveHighlight(containerId, idx);
          updateLiveRing();
        });
      });
    }

    bindSegment('in-stress', 'stress', 'val-stress', ['Low', 'Moderate', 'High', 'Critical']);
    bindSegment('in-emotion', 'emotion', 'val-emotion', null);

    // Chip toggles
    $$('#in-meds .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        playClick();
        const val = btn.dataset.val;
        if (val === 'none') {
          $$('#in-meds .chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.meds = ['none'];
        } else {
          btn.classList.toggle('active');
          $$('#in-meds .chip[data-val="none"]').forEach(b => b.classList.remove('active'));
          state.meds = [];
          $$('#in-meds .chip.active').forEach(b => state.meds.push(b.dataset.val));
          if (state.meds.length === 0) {
            $$('#in-meds .chip[data-val="none"]').forEach(b => b.classList.add('active'));
            state.meds = ['none'];
          }
        }
        if (state.meds.includes('none')) $('#val-meds').textContent = 'Clean';
        else if (state.meds.length === 1) $('#val-meds').textContent = state.meds[0].charAt(0).toUpperCase() + state.meds[0].slice(1);
        else $('#val-meds').textContent = 'Multiple';

        updateLiveRing();
      });
    });
  }

  function bindButtons() {
    const btnHudActivate = document.getElementById('btn-hud-activate');
    if (btnHudActivate) {
      btnHudActivate.addEventListener('click', () => {
        playClick();
        initWebcam();
      });
    }

    const btnAssess = $('#btn-assess');
    btnAssess.addEventListener('click', () => {
      playClick();
      playScan();
      const hudStatus = document.getElementById('hud-status');
      if(hudStatus) hudStatus.textContent = "ANALYZING...";

      // Show scan overlay
      scanOverlay.classList.add('active');
      phaseInput.classList.remove('active');

      const res = calculateRisk();
      const scanSteps = [
        { label: 'SCANNING BIOMETRICS', delay: 0, el: 't-sys', val: 'ONLINE' },
        { label: 'EVALUATING FATIGUE', delay: 600, el: 't-fat', val: res.fatigue.toFixed(1) },
        { label: 'CHEMICAL SCREENING', delay: 1200, el: 't-chem', val: state.meds.includes('none') ? 'CLEAR' : 'FLAGGED' },
        { label: 'PSYCH EVALUATION', delay: 1800, el: 't-psych', val: res.emotional.toFixed(1) },
        { label: 'COMPUTING COMPOSITE', delay: 2400, el: 't-comp', val: Math.round(res.readiness) + '/100' },
        { label: 'NEURAL INFERENCE', delay: 3000, el: 't-ai', val: 'STREAMING' }
      ];

      scanSteps.forEach(step => {
        setTimeout(() => {
          $('#scan-label').textContent = step.label;
          const el = document.getElementById(step.el);
          if (el) {
            el.textContent = step.val;
            el.style.color = step.val === 'FLAGGED' ? 'var(--accent-danger)' : 'var(--accent-cyan)';
          }
        }, step.delay);
      });

      // Start AI call during scan (parallel)
      const aiPromise = callBackendAI(res);

      // Transition to results
      setTimeout(() => {
        scanOverlay.classList.remove('active');
        phaseResults.classList.add('active');
        const hudStatus = document.getElementById('hud-status');
        if(hudStatus) hudStatus.textContent = "LOCKED";

        // Reset gauge for animation
        gaugePath.style.transition = 'none';
        gaugePath.style.strokeDashoffset = pathLength;
        $('#res-score').textContent = '0';
        $('#res-score-gauge').textContent = '0';

        setTimeout(() => updateResults(res, aiPromise), 80);
      }, 3800);
    });

    $('#btn-recalibrate').addEventListener('click', () => {
      playClick();
      const hudStatus = document.getElementById('hud-status');
      if(hudStatus) hudStatus.textContent = "ACQUIRING...";
      
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      const voiceIndicator = $('#voice-indicator');
      if (voiceIndicator) voiceIndicator.classList.add('hidden');

      phaseResults.classList.remove('active');
      phaseInput.classList.add('active');
      if (heartbeatAnim) cancelAnimationFrame(heartbeatAnim);
      $('#ambient-bg').className = 'ambient-glow bg-cyan';
      $('#logo-mark').style.background = '';
      $('#logo-mark').style.boxShadow = '';

      // Reset scan telemetry
      $$('.t-val').forEach(el => { el.textContent = '--'; el.style.color = 'var(--accent-cyan)'; });
    });
  }

  async function updateResults(res, aiPromise) {
    gaugePath.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1), stroke 1s ease';

    // Animate scores
    animateValue('res-score', 0, Math.round(res.readiness), 1200);
    animateValue('res-score-gauge', 0, Math.round(res.readiness), 1200);
    $('#res-fatigue').textContent = res.fatigue.toFixed(1);
    $('#res-impair').textContent = res.impair.toFixed(1);
    $('#res-emotion').textContent = res.emotional.toFixed(1);

    // Animate factor bars
    setTimeout(() => {
      const fatPct = Math.min(100, res.fatigue * 10);
      const impPct = Math.min(100, res.impair * 10);
      const emoPct = Math.min(100, res.emotional * 10);

      const barFat = $('#bar-fatigue');
      const barImp = $('#bar-impair');
      const barEmo = $('#bar-emotion');

      barFat.style.width = fatPct + '%';
      barFat.className = 'factor-bar-fill' + (fatPct > 70 ? ' danger' : fatPct > 40 ? ' warn' : '');

      barImp.style.width = impPct + '%';
      barImp.className = 'factor-bar-fill' + (impPct > 70 ? ' danger' : impPct > 40 ? ' warn' : '');

      barEmo.style.width = emoPct + '%';
      barEmo.className = 'factor-bar-fill' + (emoPct > 70 ? ' danger' : emoPct > 40 ? ' warn' : '');
    }, 200);

    // Gauge fill
    const offset = pathLength - (pathLength * (res.readiness / 100));
    gaugePath.style.strokeDashoffset = offset;

    // Anomalies
    const container = $('#res-anomalies');
    container.innerHTML = '';
    res.anomalies.forEach((a, i) => {
      const el = document.createElement('div');
      el.className = `anomaly-item ${a.type}`;
      el.style.animationDelay = `${i * 0.1}s`;
      el.innerHTML = `<span class="anomaly-icon">${a.icon}</span><span>${a.text}</span>`;
      container.appendChild(el);
    });

    // Theming
    const ambientBg = $('#ambient-bg');
    const verdictContainer = $('#verdict-container');
    const verdictBadge = $('#verdict-badge');
    const verdictIcon = $('#verdict-icon');
    const verdictStatus = $('#verdict-status');
    const verdictSub = $('#verdict-sub');
    const recBody = $('#rec-body');
    const recIcon = $('#rec-icon');
    const scoreNum = $('#res-score-gauge');
    const logoMark = $('#logo-mark');

    ambientBg.className = 'ambient-glow';
    verdictContainer.className = 'verdict-container';
    verdictBadge.className = 'verdict-badge';
    verdictStatus.className = 'verdict-status';

    let severity = 'safe';

    if (res.readiness < 40) {
      severity = 'danger';
      ambientBg.classList.add('bg-danger');
      gaugePath.style.stroke = 'url(#grad-danger)';
      verdictContainer.classList.add('danger');
      verdictBadge.classList.add('danger');
      verdictIcon.textContent = '✕';
      verdictStatus.classList.add('danger');
      verdictStatus.textContent = 'RESTRICTED';
      verdictSub.textContent = 'Operator clearance denied';
      scoreNum.style.color = 'var(--accent-danger)';
      recIcon.textContent = '⛔';
      recBody.textContent = 'Clearance denied. Operator cognitive and physical impairment exceeds maximum safety thresholds. Vehicle operation is strongly discouraged until biometric parameters normalize.';
      logoMark.style.background = 'var(--accent-danger)';
      logoMark.style.boxShadow = '0 0 16px var(--accent-danger), 0 0 40px rgba(255,0,60,0.15)';
    } else if (res.readiness < 75) {
      severity = 'warn';
      ambientBg.classList.add('bg-warn');
      gaugePath.style.stroke = 'url(#grad-warn)';
      verdictContainer.classList.add('warn');
      verdictBadge.classList.add('warn');
      verdictIcon.textContent = '!';
      verdictStatus.classList.add('warn');
      verdictStatus.textContent = 'CAUTION';
      verdictSub.textContent = 'Proceed with elevated awareness';
      scoreNum.style.color = 'var(--accent-warn)';
      recIcon.textContent = '⚠';
      recBody.textContent = 'Compound fatigue and/or stress indicators detected. Proceed with caution. Mandatory active driving aids and frequent rest intervals are recommended.';
      logoMark.style.background = 'var(--accent-warn)';
      logoMark.style.boxShadow = '0 0 16px var(--accent-warn), 0 0 40px rgba(255,183,0,0.15)';
    } else {
      ambientBg.classList.add('bg-cyan');
      gaugePath.style.stroke = 'url(#grad-safe)';
      verdictIcon.textContent = '✓';
      verdictStatus.textContent = 'CLEARED';
      verdictSub.textContent = 'All systems nominal';
      scoreNum.style.color = '#fff';
      recIcon.textContent = 'ℹ';
      recBody.textContent = 'Operator is cleared for transit. All biometric markers indicate optimal cognitive and physical readiness. Standard safety protocols apply.';
      logoMark.style.background = 'var(--accent-cyan)';
      logoMark.style.boxShadow = '0 0 16px var(--accent-cyan), 0 0 40px rgba(0,229,255,0.15)';
    }

    // Start heartbeat
    setTimeout(() => startHeartbeat(severity), 500);

    // ═══ AI BRIEFING ═══
    const aiLoading = $('#ai-loading');
    const aiText = $('#ai-text');
    aiText.innerHTML = '';

    aiLoading.classList.remove('hidden');
    try {
      const aiResponse = await aiPromise;
      aiLoading.classList.add('hidden');
      if (aiResponse) {
        typewriterEffect('ai-text', aiResponse, 18);
        speakText(aiResponse);
      } else {
        aiText.innerHTML = '<span class="ai-no-key">AI analysis unavailable. Secure backend communication failed.</span>';
      }
    } catch (e) {
      aiLoading.classList.add('hidden');
      aiText.innerHTML = '<span class="ai-no-key">AI inference failed. Check backend connection.</span>';
    }
  }

  function animateValue(id, start, end, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    if (start === end) { el.textContent = end; return; }
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.floor(ease * (end - start) + start);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', runBootSequence);
})();
