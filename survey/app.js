/* ============================================================
   Game Night Satisfaction Survey™ — app logic
   ============================================================ */
(() => {
  'use strict';

  // -----------------------------------------------------------
  // CONFIG / STATE
  // -----------------------------------------------------------
  const cfg = window.SURVEY_CONFIG || {};
  const supa = (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_URL !== 'REPLACE_ME')
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  const state = {
    section: 1,
    total: 5,
    answers: {},
    likertDirections: {},
    events: [],
    rage: 0,
    startedAt: Date.now(),
    cookieIndex: 0,
    responseId: null,
  };

  const COOKIE_CATEGORIES = [
    'Strictly necessary',
    'Performance',
    'Marketing',
    'Emotional damage',
    'Mild surveillance',
    'Aggressive surveillance',
    'Cookies that taste bad',
    'Cookies your mother warned you about',
  ];

  const RATCHET_LABELS = [
    [0,   'Soul-crushing'],
    [33,  'Genuinely upsetting'],
    [67,  'Vaguely tolerable'],
    [100, 'Mildly disappointing'],
  ];

  function logEvent(type, payload = {}) {
    state.events.push({ type, payload, ts: Date.now() });
  }

  // -----------------------------------------------------------
  // LIKERT (reversing direction per question)
  // -----------------------------------------------------------
  function buildLikert(host) {
    const qid = host.dataset.question;
    const lowLabel = host.dataset.lowLabel;
    const highLabel = host.dataset.highLabel;
    const flipped = Math.random() < 0.5;
    state.likertDirections[qid] = flipped ? 'flipped' : 'normal';

    const labels = document.createElement('div');
    labels.className = 'likert__labels';
    labels.innerHTML = flipped
      ? `<span>${highLabel}</span><span>${lowLabel}</span>`
      : `<span>${lowLabel}</span><span>${highLabel}</span>`;

    const buttons = document.createElement('div');
    buttons.className = 'likert__buttons';

    const order = [];
    for (let i = 1; i <= 10; i++) order.push(i);
    if (flipped) order.reverse();

    const recal = document.createElement('div');
    recal.className = 'likert__recalibrating';

    order.forEach(i => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'likert__btn';
      btn.textContent = i;
      btn.dataset.value = i;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        host.querySelectorAll('.likert__btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const displayed = parseInt(btn.dataset.value, 10);
        const semantic = flipped ? (11 - displayed) : displayed;
        state.answers[qid] = { displayed, semantic, direction: state.likertDirections[qid] };
        logEvent('likert_answer', { qid, displayed, semantic, flipped });

        recal.textContent = '⟲ recalibrating…';
        host.classList.add('recalibrating');
        setTimeout(() => {
          host.classList.remove('recalibrating');
          recal.textContent = '';
        }, 600);
      });
      buttons.appendChild(btn);
    });

    host.appendChild(labels);
    host.appendChild(buttons);
    host.appendChild(recal);
  }

  // -----------------------------------------------------------
  // RATCHET (one-way) SLIDER
  // -----------------------------------------------------------
  function buildRatchet(host) {
    const qid = host.dataset.question;
    const input = host.querySelector('.ratchet__input');
    const readout = host.querySelector('.ratchet__readout');
    let lockedMax = 100;

    function updateReadout(v) {
      let label = 'Mildly disappointing';
      for (const [threshold, text] of RATCHET_LABELS) {
        if (v >= threshold) label = text;
      }
      readout.textContent = label;
    }

    input.addEventListener('input', () => {
      let v = parseInt(input.value, 10);
      if (v > lockedMax) {
        v = lockedMax;
        input.value = v;
      } else {
        lockedMax = v;
      }
      updateReadout(v);
      state.answers[qid] = v;
      logEvent('ratchet_change', { qid, value: v });
    });

    state.answers[qid] = 100;
    updateReadout(100);
  }

  // -----------------------------------------------------------
  // NONSENSE SLIDERS
  // -----------------------------------------------------------
  function bindNonsense() {
    document.querySelectorAll('.nonsense input[type=range]').forEach(input => {
      const qid = input.dataset.question;
      state.answers[qid] = parseInt(input.value, 10);
      input.addEventListener('input', () => {
        state.answers[qid] = parseInt(input.value, 10);
      });
    });
  }

  // -----------------------------------------------------------
  // YES / YES
  // -----------------------------------------------------------
  function bindYesYes() {
    document.querySelectorAll('.yesyes').forEach(host => {
      const qid = host.dataset.question;
      host.querySelectorAll('button').forEach(btn => {
        // The "No" button is intentionally inert.
        if (btn.dataset.value !== 'yes') return;
        btn.addEventListener('click', () => {
          state.answers[qid] = 'yes';
          host.querySelectorAll('button').forEach(b => b.style.opacity = '0.55');
          btn.style.opacity = '1';
          btn.style.outline = '3px solid #15803d';
          btn.style.outlineOffset = '2px';
          logEvent('yesyes_pick', { qid });
        });
      });
    });
  }

  // -----------------------------------------------------------
  // RADIOS
  // -----------------------------------------------------------
  function bindRadios() {
    document.querySelectorAll('.radio-group').forEach(host => {
      const qid = host.dataset.question;
      host.querySelectorAll('input[type=radio]').forEach(r => {
        r.addEventListener('change', () => {
          if (r.checked) state.answers[qid] = r.value;
        });
      });
    });
  }

  // -----------------------------------------------------------
  // TEXT INPUTS
  // -----------------------------------------------------------
  function bindTextInputs() {
    document.querySelectorAll('.text-input[data-question]').forEach(input => {
      const qid = input.dataset.question;
      input.addEventListener('input', () => { state.answers[qid] = input.value; });
    });
    document.querySelectorAll('.textarea[data-question]').forEach(area => {
      const qid = area.dataset.question;
      const counter = document.querySelector(`[data-counter-for="${qid}"]`);
      area.addEventListener('input', () => {
        state.answers[qid] = area.value;
        if (counter) counter.textContent = area.value.length;
      });
    });
  }

  // -----------------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------------
  function showError(qid) {
    const el = document.querySelector(`[data-error-for="${qid}"]`);
    if (el) el.classList.remove('hidden');
  }
  function hideError(qid) {
    const el = document.querySelector(`[data-error-for="${qid}"]`);
    if (el) el.classList.add('hidden');
  }
  function snark(msg) {
    state.rage += 1;
    alert(msg);
  }

  function validateSection(sec) {
    if (sec === 1) {
      if (!state.answers.q1_like_people) { snark('You skipped one. Try again.'); return false; }
      const focaccia = (state.answers.q2_focaccia || '').trim();
      if (focaccia.length < 2) { showError('q2_focaccia'); return false; }
      hideError('q2_focaccia');
      return true;
    }
    if (sec === 2) {
      if (!state.answers.q3_complexity) { snark('Pick one. They are all "yes".'); return false; }
      if (!state.answers.q4_ario) { snark('Please answer Yes.'); return false; }
      return true;
    }
    if (sec === 3) {
      if (state.answers.q5_enjoyment == null) { snark('Use the slider. It only goes one way.'); return false; }
      if (!state.answers.q6_invite_friend) { snark('Be honest about your friends.'); return false; }
      return true;
    }
    if (sec === 4) return true;
    if (sec === 5) {
      const fb = (state.answers.q8_feedback || '').trim();
      if (fb.length < 100) { showError('q8_feedback'); return false; }
      hideError('q8_feedback');
      return true;
    }
    return true;
  }

  // -----------------------------------------------------------
  // GRAVITY BUTTON
  // -----------------------------------------------------------
  function activateGravity(btn) {
    btn._gravityArmed = false;
    hideCookieBanner();
    const rect = btn.getBoundingClientRect();
    const startTop = rect.top;
    const startLeft = rect.left;
    const width = rect.width;

    const section = btn.closest('.section');
    const void_ = document.createElement('div');
    void_.className = 'void';
    void_.innerHTML = `
      <div class="void__msg void__msg--1">keep going</div>
      <div class="void__msg void__msg--2">almost there</div>
      <div class="void__msg void__msg--3">too far</div>
      <div class="void__msg void__msg--4">↓ here ↓</div>
      <div class="void__landing-pad"></div>
    `;
    section.parentNode.insertBefore(void_, section.nextSibling);

    btn.classList.add('is-falling');
    btn.style.top = startTop + 'px';
    btn.style.left = startLeft + 'px';
    btn.style.width = width + 'px';

    // Small upward toss + slower fall so the gag is legible.
    let v = -8;
    let y = startTop;
    const accel = 0.28;
    const exitY = window.innerHeight + 60;

    function frame() {
      v += accel;
      y += v;
      btn.style.top = y + 'px';
      if (y >= exitY) {
        const pad = void_.querySelector('.void__landing-pad');
        btn.classList.remove('is-falling');
        btn.classList.add('is-landed');
        btn.style.top = '';
        btn.style.left = '';
        btn.style.width = '';
        pad.appendChild(btn);
        if (navigator.vibrate) navigator.vibrate(50);
        logEvent('button_landed', {});
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    state.rage += 1;
    logEvent('button_fell', {});
  }

  // -----------------------------------------------------------
  // SECTION ADVANCE
  // -----------------------------------------------------------
  function showSection(n, { scroll = true } = {}) {
    document.querySelectorAll('.section').forEach(s => {
      s.dataset.active = s.dataset.section === String(n) ? 'true' : 'false';
    });
    // Remove any voids left over from previous gravity-button transitions.
    document.querySelectorAll('.void').forEach(v => v.remove());
    state.section = n;
    if (scroll) {
      requestAnimationFrame(() => {
        const target = document.querySelector(`.section[data-section="${n}"]`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function advanceFromSection(n) {
    const next = n + 1;
    if (next > state.total + 1) return;
    showSection(next);
    if (next <= state.total) {
      setTimeout(() => showCookieBanner(), 400);
    }
    logEvent('section_advance', { from: n, to: next });
  }

  // -----------------------------------------------------------
  // COOKIE BANNER
  // -----------------------------------------------------------
  const banner = document.getElementById('cookie-banner');
  const cookieList = document.getElementById('cookie-categories');
  const cookieModal = document.getElementById('cookie-modal');
  const cookieModalList = document.getElementById('cookie-modal-list');

  function showCookieBanner() {
    state.cookieIndex = Math.min(state.cookieIndex + 1, COOKIE_CATEGORIES.length);
    cookieList.innerHTML = '';
    for (let i = 0; i < state.cookieIndex; i++) {
      const li = document.createElement('li');
      li.textContent = COOKIE_CATEGORIES[i];
      if (i === state.cookieIndex - 1) li.classList.add('is-new');
      cookieList.appendChild(li);
    }
    banner.classList.remove('hidden');
    logEvent('cookie_banner_shown', { count: state.cookieIndex });
  }
  function hideCookieBanner() { banner.classList.add('hidden'); }

  document.getElementById('cookie-accept').addEventListener('click', () => {
    hideCookieBanner();
    logEvent('cookie_accept', {});
  });
  document.getElementById('cookie-manage').addEventListener('click', () => {
    cookieModalList.innerHTML = '';
    for (let i = 0; i < state.cookieIndex; i++) {
      const li = document.createElement('li');
      li.textContent = COOKIE_CATEGORIES[i];
      cookieModalList.appendChild(li);
    }
    cookieModal.classList.remove('hidden');
    state.rage += 1;
    logEvent('cookie_manage', {});
  });
  document.getElementById('cookie-modal-accept').addEventListener('click', () => {
    cookieModal.classList.add('hidden');
    hideCookieBanner();
    logEvent('cookie_modal_accept', {});
  });

  // -----------------------------------------------------------
  // NAV BUTTONS
  // -----------------------------------------------------------
  function bindNavButtons() {
    document.querySelectorAll('.btn--next').forEach(btn => {
      btn._gravityArmed = true;
      btn.addEventListener('click', () => {
        const sec = parseInt(btn.dataset.next, 10);
        if (!validateSection(sec)) return;
        if (btn._gravityArmed) {
          activateGravity(btn);
        } else {
          advanceFromSection(sec);
        }
      });
    });

    const submit = document.getElementById('submit-btn');
    submit._gravityArmed = true;
    submit.addEventListener('click', () => {
      if (!validateSection(5)) return;
      if (submit._gravityArmed) {
        activateGravity(submit);
      } else {
        runSubmitFlow();
      }
    });
  }

  // -----------------------------------------------------------
  // REFORMAT MODAL + FINAL SUBMIT
  // -----------------------------------------------------------
  const reformatModal = document.getElementById('reformat-modal');
  const reformatText = document.getElementById('reformat-text');
  const reformatCountdown = document.getElementById('reformat-countdown');
  const reformatCancel = document.getElementById('reformat-cancel');
  const reformatSubmitBtn = document.getElementById('reformat-submit');
  const loading = document.getElementById('loading');
  let countdownInterval = null;

  async function runSubmitFlow() {
    const text = (state.answers.q8_feedback || '').trim();
    let rewritten = text;

    const fnReady = !cfg.DISABLE_REFORMATTER
      && cfg.REFORMAT_FN_URL
      && cfg.REFORMAT_FN_URL !== 'REPLACE_ME';

    if (fnReady) {
      loading.classList.remove('hidden');
      try {
        const headers = { 'content-type': 'application/json' };
        if (cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY !== 'REPLACE_ME') {
          headers['authorization'] = `Bearer ${cfg.SUPABASE_ANON_KEY}`;
          headers['apikey'] = cfg.SUPABASE_ANON_KEY;
        }
        const r = await fetch(cfg.REFORMAT_FN_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text }),
        });
        if (r.ok) {
          const data = await r.json();
          if (data && data.rewritten) rewritten = data.rewritten;
        } else {
          console.warn('reformat failed', r.status, await r.text());
        }
      } catch (e) {
        console.warn('reformat error', e);
      } finally {
        loading.classList.add('hidden');
      }
    }

    state.answers.q8_feedback_original = text;
    state.answers.q8_feedback_rewritten = rewritten;

    reformatText.textContent = rewritten;
    reformatModal.classList.remove('hidden');

    let n = 5;
    reformatCountdown.textContent = String(n);
    countdownInterval = setInterval(() => {
      n -= 1;
      reformatCountdown.textContent = String(n);
      if (n <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        finalSubmit();
      }
    }, 1000);

    logEvent('reformat_modal_shown', {});
  }

  reformatCancel.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    logEvent('reformat_cancel_pressed', {});
    finalSubmit();
  });
  reformatSubmitBtn.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    logEvent('reformat_submit_pressed', {});
    finalSubmit();
  });

  let submitted = false;
  async function finalSubmit() {
    if (submitted) return;
    submitted = true;
    reformatModal.classList.add('hidden');
    hideCookieBanner();

    const payload = {
      payload: state.answers,
      feedback_original: state.answers.q8_feedback_original || state.answers.q8_feedback || '',
      feedback_rewritten: state.answers.q8_feedback_rewritten || '',
      rage_score: state.rage,
      user_agent: navigator.userAgent,
    };

    if (supa) {
      try {
        const ins = await supa.from('gn_responses').insert(payload).select('id').single();
        if (ins.error) console.warn('insert response failed', ins.error);
        if (ins.data) state.responseId = ins.data.id;

        if (state.events.length) {
          const rows = state.events.map(e => ({
            response_id: state.responseId,
            event_type: e.type,
            payload: e.payload,
          }));
          const ev = await supa.from('gn_events').insert(rows);
          if (ev.error) console.warn('insert events failed', ev.error);
        }
      } catch (e) {
        console.warn('supabase error', e);
      }
    } else {
      console.log('[gn-survey] Supabase not configured. Payload:', payload);
    }

    showSection(6);
    logEvent('reveal_shown', {});
  }

  // -----------------------------------------------------------
  // INIT
  // -----------------------------------------------------------
  function init() {
    document.querySelectorAll('.likert').forEach(buildLikert);
    document.querySelectorAll('.ratchet').forEach(buildRatchet);
    bindNonsense();
    bindYesYes();
    bindRadios();
    bindTextInputs();
    bindNavButtons();
    showSection(1, { scroll: false });
    setTimeout(showCookieBanner, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
