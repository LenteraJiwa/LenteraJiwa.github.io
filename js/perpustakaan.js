'use strict';
/* ============================================================
   perpustakaan.js — Buku & materi dari server (sheet "Konten")
   Buku punya file Drive (dibaca langsung) dan/atau link luar.
   Semua teks dari server ditulis lewat textContent.
   ============================================================ */
(function () {
  const grid = document.getElementById('book-grid');
  if (!grid) return;
  const USIA = { anak: '🌱 Anak', remaja: '🌙 Remaja', dewasa: '☀️ Dewasa', lansia: '🌸 Lansia' };
  const GRAD = ['linear-gradient(135deg,#E8E4FF,#C4BEFF)', 'linear-gradient(135deg,#D6EEFF,#7EC3F0)', 'linear-gradient(135deg,#DCFFF0,#6FDDB0)', 'linear-gradient(135deg,#FFE8DC,#F0A882)', 'linear-gradient(135deg,#FFF9D6,#F0D070)'];
  const EMO = ['📘', '📗', '📙', '📕', '📒'];
  let LIST = [], filter = 'semua', lastFocus = null;
  const search = document.getElementById('search-input');
  const count = document.getElementById('search-count');
  const empty = document.getElementById('empty-state');

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pick(arr, id) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return arr[h % arr.length]; }
  function safeUrl(u) { return /^https:\/\//.test(String(u || '')) ? u : ''; }

  function showEmpty(title, sub, showReset, retry) {
    empty.style.display = 'block';
    document.getElementById('empty-title').textContent = title;
    document.getElementById('empty-sub').textContent = sub;
    document.getElementById('empty-reset').style.display = showReset ? '' : 'none';
    const rb = document.getElementById('empty-retry');
    if (rb) { rb.style.display = retry ? '' : 'none'; rb.disabled = false; rb.textContent = '🔄 Coba lagi'; rb.onclick = retry ? () => { rb.disabled = true; rb.textContent = '⏳ Memuat…'; retry(); } : null; }
  }
  // Jumlah buku di setiap tombol filter usia, mis. "🌙 Remaja (2)"
  function updateCounts() {
    document.querySelectorAll('#book-filter .filter-btn').forEach(btn => {
      const f = btn.dataset.filter;
      const n = LIST.filter(x => f === 'semua' || (x.usia || []).indexOf(f) >= 0).length;
      let c = btn.querySelector('.filter-count');
      if (!c) { c = el('span', 'filter-count'); btn.append(c); }
      c.textContent = LIST.length ? '(' + n + ')' : '';
    });
  }
  const safeId = id => /^[\w-]{1,80}$/.test(String(id || '')) ? String(id) : '';

  function render() {
    const q = (search ? search.value : '').trim().toLowerCase();
    const shown = LIST.filter(b => (filter === 'semua' || (b.usia || []).indexOf(filter) >= 0) &&
      (!q || [b.judul, b.ringkasan, b.penulisNama, (b.topik || []).join(' ')].join(' ').toLowerCase().indexOf(q) >= 0));
    grid.textContent = '';
    empty.style.display = 'none';
    if (count) count.textContent = shown.length + ' buku';
    if (!LIST.length) return showEmpty('Koleksi sedang disiapkan', 'Buku dan materi pertama sedang dipilih. Kembali lagi nanti, ya.', false);
    if (!shown.length) return showEmpty('Belum ada buku untuk pilihan ini', 'Coba kata kunci lain atau pilih "Semua".', true);
    shown.forEach(b => {
      const card = el('div', 'book-card');
      card.setAttribute('role', 'listitem'); card.tabIndex = 0;
      card.setAttribute('aria-label', b.judul);
      const cover = el('div', 'book-cover', pick(EMO, b.id));
      cover.style.background = pick(GRAD, b.id);
      cover.append(el('div', 'book-cover-shine'));
      const info = el('div', 'buku-info');
      const tags = el('div', 'book-tags');
      (b.usia || []).slice(0, 2).forEach(u => { const p = el('span', 'age-pill ' + u, (USIA[u] || u).replace(/^\S+\s/, '')); tags.append(p); });
      info.append(el('div', 'buku-title-text', b.judul), el('div', 'buku-author-text', b.penulisNama ? 'Dipilih oleh ' + b.penulisNama : ''), tags);
      card.append(cover, info);
      card.addEventListener('click', () => openDetail(b));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(b); } });
      grid.append(card);
    });
  }

  function openDetail(b) {
    lastFocus = document.activeElement;
    const overlay = document.getElementById('book-overlay'), drawer = document.getElementById('book-drawer');
    const c = document.getElementById('book-detail-content');
    document.getElementById('book-drawer-tag').textContent = (b.topik || [])[0] || 'Buku & Materi';
    c.textContent = '';
    const cover = el('div', 'book-detail-cover', pick(EMO, b.id));
    cover.style.background = pick(GRAD, b.id);
    const title = el('div', 'book-detail-title', b.judul); title.tabIndex = -1;
    const meta = el('div', 'book-meta-row');
    (b.usia || []).forEach(u => meta.append(el('span', 'age-pill ' + u, USIA[u] || u)));
    (b.topik || []).forEach(t => meta.append(el('span', 'book-meta-chip', t)));
    c.append(cover, title, el('div', 'book-detail-author', b.penulisNama ? 'Dipilih oleh ' + b.penulisNama : ''), meta,
             el('div', 'book-section-title', 'Tentang buku ini'), el('p', 'book-synopsis', b.ringkasan));
    const actions = el('div'); actions.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-top:12px;';
    const baca = safeUrl(b.linkBaca), luar = safeUrl(b.linkLuar);
    if (baca) { const a = el('a', 'btn btn-primary btn-md w-full', '📖 Baca di Google Drive'); a.href = baca; a.target = '_blank'; a.rel = 'noopener'; a.style.justifyContent = 'center'; actions.append(a); }
    if (luar) { const a = el('a', 'btn btn-soft btn-md w-full', '🔗 Lihat di toko / perpustakaan'); a.href = luar; a.target = '_blank'; a.rel = 'noopener'; a.style.justifyContent = 'center'; actions.append(a); }
    // (Dulu ada tombol "Diskusikan dengan Psikolog" — layanan belum ada, jadi dihapus.)
    if (!baca && !luar) actions.append(el('p', '', 'Tautan untuk membaca buku ini belum tersedia.'));
    c.append(actions);
    // Alamat yang bisa dibagikan: perpustakaan.html#buku-ID
    const sid = safeId(b.id);
    if (sid) try { history.replaceState(history.state, '', location.pathname + location.search + '#buku-' + sid); } catch (e) {}
    overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => title.focus(), 300);
  }
  function closeDetail() {
    const overlay = document.getElementById('book-overlay'), drawer = document.getElementById('book-drawer');
    if (!drawer || !drawer.classList.contains('is-open')) return;
    overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (/^#buku-/.test(location.hash)) try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  document.getElementById('book-close').addEventListener('click', closeDetail);
  document.getElementById('book-overlay').addEventListener('click', closeDetail);
  if (window.__ljBookEsc) document.removeEventListener('keydown', window.__ljBookEsc);
  window.__ljBookEsc = e => {
    if (e.key === 'Escape') closeDetail();
    // Tab berputar di dalam detail buku selama terbuka
    const drawer = document.getElementById('book-drawer');
    if (e.key === 'Tab' && drawer && drawer.classList.contains('is-open')) {
      const items = [...drawer.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
      if (!drawer.contains(document.activeElement)) { e.preventDefault(); (items[0] || drawer).focus(); return; }
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', window.__ljBookEsc);

  document.querySelectorAll('#book-filter .filter-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#book-filter .filter-btn').forEach(x => { x.classList.toggle('is-active', x === btn); x.setAttribute('aria-pressed', String(x === btn)); });
    filter = btn.dataset.filter; render();
  }));
  if (search) search.addEventListener('input', render);
  document.getElementById('empty-reset').addEventListener('click', () => {
    if (search) search.value = '';
    filter = 'semua';
    document.querySelectorAll('#book-filter .filter-btn').forEach(x => { const on = x.dataset.filter === 'semua'; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
    render();
  });

  (async function load() {
    grid.textContent = 'Memuat koleksi…';
    const r = await LJ_AUTH.apiGet('getKonten', { tipe: 'buku' });
    if (!r.ok) {
      grid.textContent = '';
      if (count) count.textContent = '';
      return showEmpty('Koleksi belum bisa dimuat', r.offline ? 'Periksa koneksi internetmu.' : 'Server sedang disiapkan. Coba lagi nanti.', false, load);
    }
    LIST = r.konten || [];
    updateCounts();
    render();
    // Dibuka dari tautan berbagi perpustakaan.html#buku-ID
    const m = location.hash.match(/^#buku-([\w-]{1,80})$/);
    const want = m && LIST.filter(x => x.id === m[1])[0];
    if (want) openDetail(want);
  })();
})();
