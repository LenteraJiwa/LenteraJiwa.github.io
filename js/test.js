'use strict';

/* ============================================================
   test.js (PERF v3.0 FIXED)
   PERBAIKAN:
   - Progress bar pakai setProgressFill() (scaleX) bukan style.width
   - Result dimension bars pakai scaleX bukan width
   - Guard mencegah override TestEngine saat script dimuat ulang
   ============================================================ */

if (!window.TestEngine) {

const TestEngine = {
  tesId:    null,
  data:     null,
  answers:  [],
  current:  0,

  start(id) {
    const lj = window.LJ;
    if (!lj || !lj.TES_DATA) { console.error('tes.js not loaded'); return; }

    this.tesId   = id;
    this.data    = lj.TES_DATA[id];
    this.answers = new Array(this.data.questions.length).fill(null);
    this.current = 0;

    const tesSelectorEl = document.getElementById('tes-selector');
    const testEngineEl  = document.getElementById('test-engine');
    const testResultsEl = document.getElementById('test-results');

    if (!tesSelectorEl || !testEngineEl || !testResultsEl) return;

    tesSelectorEl.classList.add('is-hidden');
    testEngineEl.classList.add('is-active');
    testResultsEl.classList.remove('is-active');

    this.renderQuestion();
    window.scrollTo({ top: testEngineEl.offsetTop - 120, behavior: 'smooth' });
  },

  renderQuestion() {
    const q     = this.data.questions[this.current];
    const total = this.data.questions.length;
    const pct   = Math.round((this.current / total) * 100);

    const qCounterEl  = document.getElementById('q-counter');
    const progressEl  = document.getElementById('test-progress');
    const qEl         = document.getElementById('test-question');
    const optsEl      = document.getElementById('test-options');
    const btnBackEl   = document.getElementById('btn-back');

    if (qCounterEl) qCounterEl.textContent = 'Pertanyaan ' + (this.current + 1) + ' dari ' + total;

    /* PERBAIKAN: pakai setProgressFill (scaleX) bukan style.width */
    if (progressEl && window.LJ && window.LJ.setProgressFill) {
      window.LJ.setProgressFill(progressEl, pct);
    } else if (progressEl) {
      /* Fallback jika setProgressFill belum tersedia */
      progressEl.style.transform = 'scaleX(' + (pct / 100) + ')';
      progressEl.style.transformOrigin = 'left';
    }

    if (qEl) {
      qEl.style.opacity   = '0';
      qEl.style.transform = 'translateY(10px)';
      setTimeout(() => {
        qEl.textContent      = q.text;
        qEl.style.transition = 'opacity .35s, transform .35s var(--ease-smooth)';
        qEl.style.opacity    = '1';
        qEl.style.transform  = 'translateY(0)';
      }, 120);
    }

    if (optsEl) {
      optsEl.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'test-option btn-ripple';
        btn.textContent = opt;
        btn.setAttribute('aria-label', 'Pilih: ' + opt);
        if (this.answers[this.current] === i) btn.classList.add('is-selected');

        btn.addEventListener('click', () => {
          optsEl.querySelectorAll('.test-option').forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          this.answers[this.current] = i;
          setTimeout(() => this.next(), 380);
        });

        btn.style.opacity   = '0';
        btn.style.transform = 'translateY(8px)';
        optsEl.appendChild(btn);
        setTimeout(() => {
          btn.style.transition = 'opacity .25s, transform .25s var(--ease-smooth), border-color .18s, background .18s';
          btn.style.opacity    = '1';
          btn.style.transform  = 'translateY(0)';
        }, i * 60 + 150);
      });
    }

    if (btnBackEl) btnBackEl.style.visibility = this.current > 0 ? 'visible' : 'hidden';
  },

  next() {
    const total = this.data.questions.length;
    if (this.current < total - 1) {
      this.current++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  },

  prev() {
    if (this.current > 0) { this.current--; this.renderQuestion(); }
  },

  skip() {
    this.answers[this.current] = null;
    this.next();
  },

  showResults() {
    const lj = window.LJ;
    const testEngineEl  = document.getElementById('test-engine');
    const resultsEl     = document.getElementById('test-results');

    if (!resultsEl) return;
    if (testEngineEl) testEngineEl.classList.remove('is-active');
    resultsEl.classList.add('is-active');

    let html = '';

    try {
      if (this.tesId === 'wellbeing') {
        const r = lj.calculateWellbeingScore(this.answers);
        html = this._renderWellbeingResult(r);
      } else if (this.tesId === 'stres') {
        const r = lj.calculateStresScore(this.answers);
        html = this._renderStresResult(r);
      } else if (this.tesId === 'kepribadian') {
        const r = lj.calculateKepribadianScore(this.answers);
        html = this._renderKepribadianResult(r);
      }
    } catch(err) {
      html = '<div class="result-hero"><p style="color:var(--peach-600);">⚠️ Beberapa pertanyaan belum dijawab. Hasil mungkin kurang akurat.</p></div>';
    }

    resultsEl.innerHTML = html;

    /* PERBAIKAN: Bars pakai transform:scaleX bukan width
       data-fill menyimpan nilai persentase, JS mengubah ke scaleX */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resultsEl.querySelectorAll('[data-fill]').forEach(el => {
          const pct = parseFloat(el.dataset.fill) || 0;
          el.style.transform = 'scaleX(' + (pct / 100) + ')';
          el.style.transformOrigin = 'left';
          el.style.transition = 'transform 1s var(--ease-smooth) 0.3s';
        });
      });
    });

    window.scrollTo({ top: resultsEl.offsetTop - 120, behavior: 'smooth' });
  },

  _renderWellbeingResult(r) {
    const color = r.result.color;
    const dimNames = {
      positive_emotion:'Emosi Positif',
      engagement:'Keterlibatan',
      relationships:'Hubungan',
      meaning:'Makna Hidup',
      negative_affect:'Emosi Negatif',
      resilience:'Resiliensi',
      physical_mental:'Fisik & Mental'
    };
    const dimHtml = Object.entries(r.dimensions).map(([k,v]) =>
      '<div class="dim-row">' +
        '<div class="dim-label">' +
          '<span class="dim-name">' + (dimNames[k] || k) + '</span>' +
          '<span class="dim-pct">' + v.pct + '%</span>' +
        '</div>' +
        '<div class="dim-bar">' +
          /* data-fill disimpan, JS di showResults() yang mengubah ke scaleX */
          '<div class="dim-fill" style="transform:scaleX(0);transform-origin:left;" data-fill="' + v.pct + '"></div>' +
        '</div>' +
        '<div class="dim-insight">' + v.insight + '</div>' +
      '</div>'
    ).join('');

    return (
      '<div class="result-hero">' +
        '<div class="result-level-badge" style="background:' + color + '20;color:' + color + ';">' + r.result.level + '</div>' +
        '<div class="result-score-ring" style="border-color:' + color + ';color:' + color + ';" aria-label="Skor ' + r.total + ' dari ' + r.maxTotal + '">' +
          r.total + '<span style="font-size:14px;margin-top:8px;display:block;opacity:.6;">/ ' + r.maxTotal + '</span>' +
        '</div>' +
        '<h2 class="result-headline">' + r.result.headline + '</h2>' +
        '<p class="result-desc">' + r.result.desc + '</p>' +
      '</div>' +
      '<div class="result-dimensions">' +
        '<div style="font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted);margin-bottom:20px;">Breakdown per Dimensi</div>' +
        dimHtml +
      '</div>' +
      this._renderResultFooter(r.result)
    );
  },

  _renderStresResult(r) {
    const color = r.result.color;
    const subNames = {
      exhaustion:'Kelelahan',
      cynicism:'Sinisme/Detachment',
      perceived_stress:'Persepsi Stres',
      physical:'Gejala Fisik',
      recovery:'Pemulihan & Batasan',
      self_efficacy:'Efikasi Diri'
    };
    const subHtml = Object.entries(r.subdimensions).map(([k,v]) => {
      const max = 3 * ({ exhaustion:3, cynicism:3, perceived_stress:3, physical:2, recovery:2, self_efficacy:2 }[k] || 2);
      const pct = Math.round((v / max) * 100);
      return (
        '<div class="dim-row">' +
          '<div class="dim-label"><span class="dim-name">' + (subNames[k] || k) + '</span><span class="dim-pct">' + pct + '%</span></div>' +
          '<div class="dim-bar"><div class="dim-fill" style="transform:scaleX(0);transform-origin:left;" data-fill="' + pct + '"></div></div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="result-hero">' +
        '<div class="result-level-badge" style="background:' + color + '20;color:' + color + ';">' + r.result.level + '</div>' +
        '<div class="result-score-ring" style="border-color:' + color + ';color:' + color + ';">' +
          r.total + '<span style="font-size:14px;margin-top:8px;display:block;opacity:.6;">/ ' + r.maxTotal + '</span>' +
        '</div>' +
        '<h2 class="result-headline">' + r.result.headline + '</h2>' +
        '<p class="result-desc">' + r.result.desc + '</p>' +
      '</div>' +
      '<div class="result-dimensions"><div style="font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text-muted);margin-bottom:20px;">Breakdown Subdimensi</div>' + subHtml + '</div>' +
      '<div class="result-dimensions" style="margin-bottom:20px;">' +
        '<div style="font-size:13px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px;">Langkah Selanjutnya</div>' +
        '<ul style="list-style:none;padding:0;margin:0;">' +
          r.result.next_steps.map(s =>
            '<li style="font-size:14px;color:var(--text-secondary);padding:8px 0;border-bottom:1px solid var(--border-mid);display:flex;align-items:flex-start;gap:10px;line-height:1.6;">' +
              '<span style="color:var(--mint-600);flex-shrink:0;">→</span>' + s +
            '</li>'
          ).join('') +
        '</ul>' +
      '</div>' +
      this._renderResultFooter(r.result)
    );
  },

  _renderKepribadianResult(r) {
    const traitCards = Object.entries(r.profiles).map(([t,p]) =>
      '<div class="trait-card">' +
        '<div class="trait-letter">' + t + '</div>' +
        '<div class="trait-name">' + p.name.split(' ')[0] + '</div>' +
        '<div class="trait-label">' + p.label + '</div>' +
        '<div class="trait-bar"><div class="trait-fill" style="transform:scaleX(0);transform-origin:left;" data-fill="' + p.pct + '"></div></div>' +
      '</div>'
    ).join('');

    const profileDetails = Object.entries(r.profiles).map(([t,p]) =>
      '<div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border-mid);">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
          '<span style="font-family:\'Fraunces\',serif;font-size:24px;color:var(--age-primary);">' + t + '</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:800;color:var(--text-primary);">' + p.name + '</div>' +
            '<div style="font-size:12px;color:var(--text-muted);">' + p.label + ' · ' + p.pct + '%</div>' +
          '</div>' +
        '</div>' +
        '<p style="font-size:14px;color:var(--text-secondary);line-height:1.75;margin:0;">' + p.desc + '</p>' +
      '</div>'
    ).join('');

    return (
      '<div class="result-hero">' +
        '<div class="result-level-badge" style="background:var(--lav-100);color:var(--lav-800);">Profil Kepribadianmu</div>' +
        '<h2 class="result-headline">Selamat mengenal dirimu lebih dalam</h2>' +
        '<p class="result-desc">Profil OCEAN-mu mencerminkan kecenderungan kepribadian yang unik. Ini bukan kotak yang membatasi — ini cermin untuk memahami diri.</p>' +
      '</div>' +
      '<div class="result-personality-grid">' + traitCards + '</div>' +
      '<div class="result-dimensions" style="margin-bottom:20px;">' + profileDetails + '</div>' +
      '<div class="result-disclaimer" role="note">📋 Profil kepribadian bersifat deskriptif, bukan preskriptif. Tidak ada tipe yang lebih baik dari yang lain.</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:20px;">' +
        '<a href="layanan.html" class="btn btn-primary btn-lg btn-ripple">Diskusikan dengan Psikolog ✨</a>' +
        '<button onclick="TestEngine.reset()" class="btn btn-soft btn-lg">Coba Tes Lain →</button>' +
      '</div>'
    );
  },

  _renderResultFooter(result) {
    return (
      '<div class="result-disclaimer" role="note">📋 Hasil ini didasarkan pada jawabanmu hari ini dan bersifat indikatif. Untuk pemahaman lebih mendalam, konsultasikan hasilmu dengan psikolog kami.</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:20px;">' +
        '<a href="layanan.html" class="btn btn-primary btn-lg btn-ripple">' + result.cta + '</a>' +
        '<button onclick="TestEngine.reset()" class="btn btn-soft btn-lg">Coba Tes Lain →</button>' +
      '</div>'
    );
  },

  reset() {
    this.tesId = null; this.data = null; this.answers = []; this.current = 0;

    const tesSelectorEl = document.getElementById('tes-selector');
    const testEngineEl  = document.getElementById('test-engine');
    const testResultsEl = document.getElementById('test-results');

    if (tesSelectorEl) tesSelectorEl.classList.remove('is-hidden');
    if (testEngineEl)  testEngineEl.classList.remove('is-active');
    if (testResultsEl) {
      testResultsEl.classList.remove('is-active');
      testResultsEl.innerHTML = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

window.TestEngine = TestEngine;

}