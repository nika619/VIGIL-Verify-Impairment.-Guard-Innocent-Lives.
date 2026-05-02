/* ═══════════════════════════════════════════
   VIGIL — LUXURY HMI ENGINE (V3.2)
   Two-Phase Assessment Logic
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const phaseInput = $('#phase-input');
  const phaseResults = $('#phase-results');
  const gaugePath = $('#gauge-readiness');

  let pathLength = 0;

  const state = {
    sleep: 7.0,
    stress: 1,
    emotion: 1,
    meds: ['none']
  };

  function init() {
    if (gaugePath) {
      pathLength = gaugePath.getTotalLength();
      gaugePath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      gaugePath.style.strokeDashoffset = pathLength;
    }

    setInterval(() => {
      $('#time-display').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
    $('#time-display').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bindInputs();
    bindButtons();
  }

  function bindInputs() {
    $('#in-sleep').addEventListener('input', (e) => {
      state.sleep = parseFloat(e.target.value);
      $('#val-sleep').textContent = state.sleep.toFixed(1) + 'h';
    });

    function bindSegment(containerId, stateKey, valElId, labels) {
      $$(`#${containerId} .segment`).forEach(btn => {
        btn.addEventListener('click', () => {
          $$(`#${containerId} .segment`).forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state[stateKey] = parseInt(btn.dataset.val);
          $(`#${valElId}`).textContent = labels ? labels[state[stateKey] - 1] : btn.textContent;
        });
      });
    }

    bindSegment('in-stress', 'stress', 'val-stress', ['Low', 'Moderate', 'High', 'Critical']);
    bindSegment('in-emotion', 'emotion', 'val-emotion', null);

    $$('#in-meds .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val === 'none') {
          $$('#in-meds .chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.meds = ['none'];
        } else {
          btn.classList.toggle('active');
          $('[data-val="none"]').classList.remove('active');
          state.meds = [];
          $$('#in-meds .chip.active').forEach(b => state.meds.push(b.dataset.val));
          if (state.meds.length === 0) {
            $('[data-val="none"]').classList.add('active');
            state.meds = ['none'];
          }
        }
        if (state.meds.includes('none')) $('#val-meds').textContent = 'Clean';
        else if (state.meds.length === 1) $('#val-meds').textContent = state.meds[0].charAt(0).toUpperCase() + state.meds[0].slice(1);
        else $('#val-meds').textContent = 'Multiple';
      });
    });
  }

  function bindButtons() {
    const btnAssess = $('#btn-assess');
    btnAssess.addEventListener('click', () => {
      const originalHTML = btnAssess.innerHTML;
      btnAssess.innerHTML = '<span class="spinner"></span> Analyzing Telemetry...';
      btnAssess.style.pointerEvents = 'none';
      btnAssess.style.opacity = '0.7';

      setTimeout(() => {
        phaseInput.classList.remove('active');
        phaseResults.classList.add('active');

        gaugePath.style.transition = 'none';
        gaugePath.style.strokeDashoffset = pathLength;
        $('#res-score').textContent = '0';

        setTimeout(updateReadiness, 60);

        setTimeout(() => {
          btnAssess.innerHTML = originalHTML;
          btnAssess.style.pointerEvents = 'auto';
          btnAssess.style.opacity = '1';
        }, 500);
      }, 1200);
    });

    $('#btn-recalibrate').addEventListener('click', () => {
      phaseResults.classList.remove('active');
      phaseInput.classList.add('active');
      $('#ambient-bg').className = 'ambient-glow bg-cyan';
      $('#logo-mark').style.background = '';
      $('#logo-mark').style.boxShadow = '';
    });
  }

  function calculateRisk() {
    let fatigue = 0, impair = 0, emotional = 0;
    const anomalies = [];

    if (state.sleep <= 3)      { fatigue = 9.5; anomalies.push({ type: 'danger', icon: '⚠', text: 'Critical Sleep Deficit (<4h)' }); }
    else if (state.sleep <= 5) { fatigue = 7.0; anomalies.push({ type: 'warn',   icon: '⚠', text: 'Significant Sleep Debt Detected' }); }
    else if (state.sleep <= 6) fatigue = 4.0;
    else fatigue = 0.5;

    if (state.meds.includes('alcohol'))  { impair = Math.max(impair, 9.5); anomalies.push({ type: 'danger', icon: '⛔', text: 'Alcohol Detected' }); }
    if (state.meds.includes('thc'))      { impair = Math.max(impair, 8.0); anomalies.push({ type: 'danger', icon: '⛔', text: 'THC Detected' }); }
    if (state.meds.includes('sedative')) { impair = Math.max(impair, 8.5); anomalies.push({ type: 'danger', icon: '⛔', text: 'Sedative Active' }); }
    if (state.meds.includes('stimulant')){ impair = Math.max(impair, 5.0); anomalies.push({ type: 'warn',   icon: '⚠', text: 'Stimulant Active' }); }

    emotional = (state.emotion - 1) * 3;
    if (state.stress > 1) emotional += state.stress * 1.5;
    if (state.stress >= 3) anomalies.push({ type: 'warn',   icon: '⚠', text: 'High Cortisol Levels' });
    if (state.emotion >= 3) anomalies.push({ type: 'danger', icon: '⚠', text: 'Erratic Psychological State' });

    const compositeRisk = Math.min(10, (fatigue * 0.4) + (impair * 0.4) + (emotional * 0.2));
    const readinessScore = Math.max(0, 100 - (compositeRisk * 10));

    return { readiness: readinessScore, fatigue, impair, emotional, anomalies };
  }

  function updateReadiness() {
    const res = calculateRisk();

    gaugePath.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1), stroke 1s ease';

    $('#res-fatigue').textContent = res.fatigue.toFixed(1);
    $('#res-impair').textContent  = res.impair.toFixed(1);
    $('#res-emotion').textContent = res.emotional.toFixed(1);

    animateValue('res-score', 0, Math.round(res.readiness), 1000);

    const offset = pathLength - (pathLength * (res.readiness / 100));
    gaugePath.style.strokeDashoffset = offset;

    const container = $('#res-anomalies');
    container.innerHTML = '';
    res.anomalies.forEach(a => {
      const el = document.createElement('div');
      el.className = `anomaly-item ${a.type}`;
      el.innerHTML = `<span class="anomaly-icon">${a.icon}</span><span>${a.text}</span>`;
      container.appendChild(el);
    });

    const ambientBg = $('#ambient-bg');
    const statusText = $('#res-status');
    const recBox = $('#res-recommendation');
    const scoreNum = $('#res-score');
    const logoMark = $('#logo-mark');

    ambientBg.className = 'ambient-glow';

    if (res.readiness < 40) {
      ambientBg.classList.add('bg-danger');
      gaugePath.style.stroke = 'url(#grad-danger)';
      statusText.textContent = 'RESTRICTED';
      statusText.style.color = 'var(--accent-danger)';
      scoreNum.style.color = 'var(--accent-danger)';
      recBox.style.borderColor = 'var(--accent-danger)';
      recBox.textContent = 'Clearance denied. Operator cognitive and physical impairment exceeds maximum safety thresholds for vehicle operation.';
      logoMark.style.background = 'var(--accent-danger)';
      logoMark.style.boxShadow = '0 0 12px var(--accent-danger)';
    } else if (res.readiness < 75) {
      ambientBg.classList.add('bg-warn');
      gaugePath.style.stroke = 'url(#grad-warn)';
      statusText.textContent = 'CAUTION';
      statusText.style.color = 'var(--accent-warn)';
      scoreNum.style.color = 'var(--accent-warn)';
      recBox.style.borderColor = 'var(--accent-warn)';
      recBox.textContent = 'Proceed with caution. Compound fatigue or stress detected. Mandatory active driving aids engaged.';
      logoMark.style.background = 'var(--accent-warn)';
      logoMark.style.boxShadow = '0 0 12px var(--accent-warn)';
    } else {
      ambientBg.classList.add('bg-cyan');
      gaugePath.style.stroke = 'url(#grad-safe)';
      statusText.textContent = 'CLEARED';
      statusText.style.color = 'var(--accent-cyan)';
      scoreNum.style.color = '#fff';
      recBox.style.borderColor = 'var(--accent-cyan)';
      recBox.textContent = 'Operator is cleared for transit. All biometric markers indicate optimal cognitive state.';
      logoMark.style.background = 'var(--accent-cyan)';
      logoMark.style.boxShadow = '0 0 12px var(--accent-cyan)';
    }
  }

  function animateValue(id, start, end, duration) {
    if (start === end) { document.getElementById(id).textContent = end; return; }
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = p * (2 - p);
      document.getElementById(id).textContent = Math.floor(ease * (end - start) + start);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
