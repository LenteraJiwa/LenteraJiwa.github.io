/* ============================================================
   artikel.js — Daftar & pembaca artikel dari server
   Sumber: Apps Script (sheet "Konten" + isi dari Google Docs).
   Semua teks dari server ditulis lewat textContent; isi artikel
   (HTML) dibuat & di-escape oleh server dari Google Docs.
   ============================================================ */
'use strict';

(function () {
  const USIA = { anak: '🌱 Anak', remaja: '🌙 Remaja', dewasa: '☀️ Dewasa', lansia: '🌸 Lansia' };
  const grid = document.getElementById('artikel-grid');
  if (!grid) return;
  let LIST = [];
  let lastFocus = null;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function message(text, sub) {
    grid.textContent = '';
    const box = el('div', 'artikel-card');
    box.style.cssText = 'grid-column:1/-1;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;cursor:default;';
    box.append(el('div', '', '📭'), el('p', '', text));
    if (sub) { const s = el('p', '', sub); s.style.cssText = 'font-size:13px;color:var(--text-secondary);max-width:420px;'; box.append(s); }
    grid.append(box);
    grid.setAttribute('aria-busy', 'false');
  }

  function card(a) {
    const c = el('article', 'artikel-card card-hover');
    c.setAttribute('role', 'listitem');
    c.tabIndex = 0;
    c.dataset.articleId = a.id;
    c.dataset.usia = (a.usia || []).join(' ');
    c.setAttribute('aria-label', 'Buka artikel: ' + a.judul);
    const tag = el('span', 'artikel-tag', [(a.usia || []).map(u => (USIA[u] || u).replace(/^\S+\s/, '')).join(' · '), (a.topik || [])[0]].filter(Boolean).join(' · '));
    tag.style.cssText = 'background:var(--lav-100);color:var(--lav-800);';
    const meta = el('div', 'artikel-meta');
    meta.append(el('span', '', '📖 ' + (a.menitBaca || 1) + ' menit baca'), el('span', '', '✍️ ' + (a.penulisNama || 'Tim Lentera Jiwa')));
    c.append(tag, el('h2', 'artikel-title regular', a.judul), el('p', 'artikel-excerpt', a.ringkasan), meta);
    c.addEventListener('click', () => Reader.open(a));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Reader.open(a); } });
    return c;
  }

  function render(filter) {
    const shown = LIST.filter(a => filter === 'semua' || (a.usia || []).indexOf(filter) >= 0);
    grid.textContent = '';
    if (!LIST.length) return message('Artikel sedang disiapkan.', 'Artikel pertama sedang disiapkan. Kembali lagi nanti, ya.');
    if (!shown.length) return message('Belum ada artikel untuk kelompok usia ini.', 'Coba pilih "Semua".');
    shown.forEach(a => grid.append(card(a)));
    grid.setAttribute('aria-busy', 'false');
    const cnt = document.getElementById('artikel-count');
    if (cnt) cnt.textContent = shown.length + ' artikel ditampilkan';
  }

  /* ── Pembaca artikel ── */
  const Reader = {
    overlay: document.getElementById('article-overlay'),
    drawer: document.getElementById('article-drawer'),
    content: document.getElementById('article-content'),
    progress: document.getElementById('article-progress-fill'),
    isOpen: false,
    async open(a) {
      lastFocus = document.activeElement;
      const c = this.content;
      c.textContent = '';
      document.getElementById('article-drawer-tag').textContent = (a.usia || []).map(u => USIA[u] || u).join(' · ');
      document.getElementById('article-drawer-time').textContent = '📖 ' + (a.menitBaca || 1) + ' menit baca';
      const h1 = el('h1', 'article-h1', a.judul);
      h1.id = 'article-drawer-title'; h1.tabIndex = -1;
      const author = el('div', 'article-author');
      const av = el('div', 'article-author-avatar', '🧑‍⚕️');
      const who = el('div');
      who.append(el('div', 'article-author-name', a.penulisNama || 'Tim Lentera Jiwa'),
                 el('div', 'article-author-role', a.diperbarui ? 'Diperbarui ' + new Date(a.diperbarui).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''));
      author.append(av, who);
      const note = el('div', 'article-disclaimer', '📋 Konten ini bersifat edukatif dan tidak menggantikan diagnosis atau konsultasi profesional. Dalam keadaan darurat hubungi Layanan SEJIWA 119 ext 8 atau 112.');
      note.setAttribute('role', 'note');
      const body = el('div', '', 'Memuat isi artikel…');
      c.append(author, note, h1, body);

      this.overlay.classList.add('is-open'); this.overlay.setAttribute('aria-hidden', 'false');
      this.drawer.classList.add('is-open'); this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.isOpen = true;
      this.drawer.scrollTop = 0;
      if (this.progress) this.progress.style.transform = 'scaleX(0)';
      setTimeout(() => h1.focus(), 300);

      const r = await LJ_AUTH.apiGet('getArtikel', { id: a.id });
      if (!this.isOpen) return;
      if (r.ok && r.artikel) body.innerHTML = r.artikel.html; // HTML dibuat & di-escape oleh server
      else body.textContent = r.msg || 'Isi artikel belum bisa dimuat. Coba lagi nanti.';
    },
    close() {
      if (!this.isOpen) return;
      this.overlay.classList.remove('is-open'); this.overlay.setAttribute('aria-hidden', 'true');
      this.drawer.classList.remove('is-open'); this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.isOpen = false;
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    },
    update() {
      const d = this.drawer, max = d.scrollHeight - d.clientHeight;
      if (this.progress) { this.progress.style.transformOrigin = 'left'; this.progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(d.scrollTop / max, 1) : 0) + ')'; }
    }
  };
  document.getElementById('article-close').addEventListener('click', () => Reader.close());
  Reader.overlay.addEventListener('click', () => Reader.close());
  Reader.drawer.addEventListener('scroll', () => Reader.update(), { passive: true });
  // Satu listener Escape saja walau halaman dibuka berkali-kali
  if (window.__ljArtikelEsc) document.removeEventListener('keydown', window.__ljArtikelEsc);
  window.__ljArtikelEsc = e => { if (e.key === 'Escape') Reader.close(); };
  document.addEventListener('keydown', window.__ljArtikelEsc);

  /* ── Filter ── */
  document.querySelectorAll('#artikel-filter .filter-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#artikel-filter .filter-btn').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    render(btn.dataset.filter);
  }));

  /* ── Muat data ── */
  (async function load() {
    const r = await LJ_AUTH.apiGet('getKonten', { tipe: 'artikel' });
    if (!r.ok) return message('Artikel belum bisa dimuat.', r.offline ? 'Periksa koneksi internetmu lalu muat ulang halaman.' : 'Server sedang disiapkan. Coba lagi nanti.');
    LIST = r.konten || [];
    render('semua');
    // Dibuka dari kartu di Beranda
    let want = '';
    try { want = sessionStorage.getItem('lj_open_artikel') || ''; sessionStorage.removeItem('lj_open_artikel'); } catch (e) {}
    const a = want && LIST.filter(x => x.id === want)[0];
    if (a) Reader.open(a);
  })();
})();
