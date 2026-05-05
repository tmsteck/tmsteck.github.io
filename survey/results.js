/* ============================================================
   Game Night Satisfaction Survey™ — public results
   Reads gn_responses with the anon key (anon SELECT policy must
   be applied, see schema.sql).
   ============================================================ */
(() => {
  'use strict';

  const cfg = window.SURVEY_CONFIG || {};
  const supa = (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_URL !== 'REPLACE_ME')
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  const $ = sel => document.querySelector(sel);
  const setHidden = (sel, hidden) => $(sel).classList.toggle('hidden', hidden);

  // Calibration metadata so the labels match the survey
  const CALIBRATIONS = [
    { qid: 'ns_thomas_fight', label: 'Could you beat Thomas in a fight?', low: '🤧 coughing baby', high: '☢️ atom bomb' },
    { qid: 'ns_snacks',       label: 'Snack quality',                    low: '🥣 soggy Weet-Bix', high: "🍫 last year's Tim Tams" },
    { qid: 'ns_chair',        label: 'Favorite chair style',             low: '🪑 whichever is free', high: '🛋️ beanbag' },
    { qid: 'ns_music',        label: 'What music should we play',        low: '🗡️ Blade', high: '🎺 distant kazoo' },
    { qid: 'ns_vibes',        label: 'Overall vibes',                    low: '👨‍🔬 Howard Milchberg', high: '👨‍🏫 Sankar Das Sarma' },
  ];

  const COMPLEXITY_LABELS = {
    more_complex:    'More complex please',
    longer_rules:    'Longer rulebooks',
    more_expansions: 'Add expansions to everything',
    more_players:    'Double the player count',
    setup_phase:     'Add a 90-min setup phase',
  };

  // -----------------------------------------------------------
  // ENTRY
  // -----------------------------------------------------------
  async function load() {
    if (!supa) {
      setHidden('#state-loading', true);
      setHidden('#state-error', false);
      $('#state-error').querySelector('p').textContent =
        'Supabase is not configured. Fill in config.js first.';
      return;
    }
    try {
      const { data, error } = await supa
        .from('gn_responses')
        .select('id, created_at, payload, feedback_original, feedback_rewritten, rage_score')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHidden('#state-loading', true);
      if (!data || data.length === 0) {
        setHidden('#state-empty', false);
        return;
      }
      render(data);
    } catch (e) {
      console.error(e);
      setHidden('#state-loading', true);
      setHidden('#state-error', false);
    }
  }

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  function render(rows) {
    // Reveal all cards
    document.querySelectorAll('.card').forEach(c => {
      if (!['state-loading', 'state-empty', 'state-error'].includes(c.id)) {
        c.classList.remove('hidden');
      }
    });

    renderHeadline(rows);
    renderLikert(rows, 'q1_like_people', '#q1-mean', '#q1-hist');
    renderLikert(rows, 'q6_invite_friend', '#q6-mean', '#q6-hist');
    renderRatchet(rows);
    renderRadio(rows, 'q3_complexity', '#q3-bars', COMPLEXITY_LABELS);
    renderYesYes(rows, '#q4-bars');
    renderFocaccia(rows);
    renderCalibration(rows);
    renderRageBoard(rows);
    renderFeedbackWall(rows);

    const newest = new Date(rows[0].created_at);
    $('#updated-at').textContent = newest.toLocaleString();
  }

  // -----------------------------------------------------------
  function renderHeadline(rows) {
    $('#m-count').textContent = rows.length;

    const enj = rows.map(r => r.payload?.q5_enjoyment).filter(v => typeof v === 'number');
    $('#m-enjoyment').textContent = enj.length
      ? Math.round(enj.reduce((a, b) => a + b, 0) / enj.length) + '/100'
      : '–';

    const rage = rows.map(r => r.rage_score || 0);
    $('#m-rage').textContent = rage.length
      ? (rage.reduce((a, b) => a + b, 0) / rage.length).toFixed(1)
      : '–';
  }

  // -----------------------------------------------------------
  function renderLikert(rows, qid, meanSel, histSel) {
    const semantics = rows
      .map(r => r.payload?.[qid]?.semantic ?? r.payload?.[qid]?.displayed)
      .filter(v => typeof v === 'number');
    if (!semantics.length) {
      $(meanSel).textContent = '–';
      $(histSel).innerHTML = '<p class="muted">No data.</p>';
      return;
    }
    const mean = semantics.reduce((a, b) => a + b, 0) / semantics.length;
    $(meanSel).textContent = mean.toFixed(1) + '/10';

    const counts = new Array(10).fill(0);
    semantics.forEach(v => {
      const idx = Math.max(1, Math.min(10, Math.round(v))) - 1;
      counts[idx] += 1;
    });
    const max = Math.max(...counts, 1);

    const host = $(histSel);
    host.innerHTML = '';
    counts.forEach((c, i) => {
      const bar = document.createElement('div');
      bar.className = 'histogram__bar';
      bar.style.height = (c / max * 100) + '%';
      bar.dataset.count = c;
      host.appendChild(bar);
    });
    const labels = document.createElement('div');
    labels.className = 'histogram__labels';
    for (let i = 1; i <= 10; i++) {
      const s = document.createElement('span');
      s.textContent = i;
      labels.appendChild(s);
    }
    host.parentNode.insertBefore(labels, host.nextSibling);
  }

  // -----------------------------------------------------------
  function renderRatchet(rows) {
    const vals = rows.map(r => r.payload?.q5_enjoyment).filter(v => typeof v === 'number');
    if (!vals.length) {
      $('#q5-mean').textContent = '–';
      $('#q5-hist').innerHTML = '<p class="muted">No data.</p>';
      return;
    }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    $('#q5-mean').textContent = Math.round(mean) + '/100';

    // Bin into 10 buckets of width 10
    const counts = new Array(10).fill(0);
    vals.forEach(v => {
      const idx = Math.min(9, Math.floor(v / 10));
      counts[idx] += 1;
    });
    const max = Math.max(...counts, 1);
    const host = $('#q5-hist');
    host.innerHTML = '';
    counts.forEach((c) => {
      const bar = document.createElement('div');
      bar.className = 'histogram__bar';
      bar.style.height = (c / max * 100) + '%';
      bar.dataset.count = c;
      host.appendChild(bar);
    });
    const labels = document.createElement('div');
    labels.className = 'histogram__labels';
    ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90'].forEach(t => {
      const s = document.createElement('span');
      s.textContent = t;
      labels.appendChild(s);
    });
    host.parentNode.insertBefore(labels, host.nextSibling);
  }

  // -----------------------------------------------------------
  function renderRadio(rows, qid, sel, labelMap) {
    const counts = {};
    Object.keys(labelMap).forEach(k => counts[k] = 0);
    rows.forEach(r => {
      const v = r.payload?.[qid];
      if (v && counts.hasOwnProperty(v)) counts[v] += 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const max = Math.max(...Object.values(counts), 1);
    const host = $(sel);
    host.innerHTML = '';
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, c]) => {
        const row = document.createElement('div');
        row.className = 'bars__row';
        row.innerHTML = `
          <div class="bars__label">${labelMap[key]}</div>
          <div class="bars__track"><div class="bars__fill" style="width: ${c / max * 100}%"></div></div>
          <div class="bars__count">${c}</div>
        `;
        host.appendChild(row);
      });
    if (total === 0) host.innerHTML = '<p class="muted">No responses yet.</p>';
  }

  // -----------------------------------------------------------
  function renderYesYes(rows, sel) {
    let yes = 0, no = 0;
    rows.forEach(r => {
      const v = r.payload?.q4_ario;
      if (v === 'yes') yes += 1; else if (v === 'no') no += 1;
    });
    const max = Math.max(yes, no, 1);
    const host = $(sel);
    host.innerHTML = '';
    [['Yes', yes], ['No', no]].forEach(([label, c]) => {
      const row = document.createElement('div');
      row.className = 'bars__row';
      row.innerHTML = `
        <div class="bars__label">${label}</div>
        <div class="bars__track"><div class="bars__fill" style="width: ${c / max * 100}%"></div></div>
        <div class="bars__count">${c}</div>
      `;
      host.appendChild(row);
    });
  }

  // -----------------------------------------------------------
  function renderFocaccia(rows) {
    const counts = {};
    rows.forEach(r => {
      const name = (r.payload?.q2_focaccia || '').trim();
      if (name.length < 2) return;
      const key = name.toLowerCase();
      if (!counts[key]) counts[key] = { display: name, count: 0 };
      counts[key].count += 1;
    });
    const host = $('#focaccia-list');
    host.innerHTML = '';
    const entries = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 25);
    if (!entries.length) {
      host.outerHTML = '<p class="muted">No nominations yet.</p>';
      return;
    }
    entries.forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="lb-name">${escapeHtml(e.display)}</span><span class="lb-count">${e.count}</span>`;
      host.appendChild(li);
    });
  }

  // -----------------------------------------------------------
  function renderCalibration(rows) {
    const host = $('#calib-list');
    host.innerHTML = '';
    CALIBRATIONS.forEach(c => {
      const vals = rows.map(r => r.payload?.[c.qid]).filter(v => typeof v === 'number');
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      const row = document.createElement('div');
      row.className = 'calib__row';
      row.innerHTML = `
        <div class="calib__head">
          <strong>${c.label}</strong>
          <span>${mean == null ? '–' : Math.round(mean) + '/100'}</span>
        </div>
        <div class="calib__bar">
          ${mean == null ? '' : `<div class="calib__marker" style="left: ${mean}%"></div>`}
        </div>
        <div class="calib__ends">
          <span>${c.low}</span><span>${c.high}</span>
        </div>
      `;
      host.appendChild(row);
    });
  }

  // -----------------------------------------------------------
  function renderRageBoard(rows) {
    const sorted = [...rows]
      .filter(r => (r.rage_score || 0) > 0)
      .sort((a, b) => (b.rage_score || 0) - (a.rage_score || 0))
      .slice(0, 10);
    const host = $('#rage-list');
    host.innerHTML = '';
    if (!sorted.length) {
      host.outerHTML = '<p class="muted">Everyone played along quietly.</p>';
      return;
    }
    sorted.forEach((r, i) => {
      const focaccia = (r.payload?.q2_focaccia || '').trim() || 'anonymous';
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="lb-name">#${i + 1} · accused: ${escapeHtml(focaccia)}</span>
        <span class="lb-count">${r.rage_score}</span>
      `;
      host.appendChild(li);
    });
  }

  // -----------------------------------------------------------
  function renderFeedbackWall(rows) {
    const host = $('#feedback-wall');
    host.innerHTML = '';
    const items = rows
      .filter(r => r.feedback_rewritten || r.feedback_original)
      .slice(0, 50);
    if (!items.length) {
      host.innerHTML = '<p class="muted">No feedback yet.</p>';
      return;
    }
    items.forEach(r => {
      const div = document.createElement('div');
      div.className = 'feedback-item';
      const rewritten = r.feedback_rewritten || r.feedback_original || '';
      const original = r.feedback_original || '';
      const date = new Date(r.created_at).toLocaleDateString();
      div.innerHTML = `
        <div>"${escapeHtml(rewritten)}"</div>
        ${original && original !== rewritten
          ? `<details><summary>show what they actually wrote</summary>
               <div class="feedback-item__original">${escapeHtml(original)}</div>
             </details>`
          : ''}
        <div class="feedback-item__date">${date}</div>
      `;
      host.appendChild(div);
    });
  }

  // -----------------------------------------------------------
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  load();
})();
