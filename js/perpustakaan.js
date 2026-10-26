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
    // Pembaca tidak diberi link Drive: isi buku dibaca di dalam situs lewat server.
    const baca = b.bacaDiSitus === true, luar = safeUrl(b.linkLuar);
    if (baca) { const a = el('button', 'btn btn-primary btn-md w-full', '📖 Baca di Lentera Jiwa'); a.type = 'button'; a.style.justifyContent = 'center'; a.addEventListener('click', () => BookReader.open(b)); actions.append(a); }
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
    if (typeof BookReader !== 'undefined' && BookReader.isOpen()) BookReader.close();
    const overlay = document.getElementById('book-overlay'), drawer = document.getElementById('book-drawer');
    if (!drawer || !drawer.classList.contains('is-open')) return;
    overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (/^#buku-/.test(location.hash)) try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  /* ── Pembaca buku di dalam situs ──
     Google Docs → teks (HTML dari server). PDF → digambar halaman demi halaman
     dengan PDF.js; data PDF datang dari server, bukan dari link Drive. */
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  let pdfjsPromise = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = new Promise((ok, no) => {
      const sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js';
      sc.onload = () => { if (!window.pdfjsLib) return no(new Error('pdfjs')); window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(window.pdfjsLib); };
      sc.onerror = () => { pdfjsPromise = null; no(new Error('pdfjs')); };
      document.head.append(sc);
    });
    return pdfjsPromise;
  }
  const BookReader = (() => {
    // Halaman bisa dibuka ulang (SPA): buang pembaca lama beserta listener-nya
    const old = document.getElementById('book-reader'); if (old) old.remove();
    let root, body, titleEl, pageEl, opened = false, observer = null, prevFocus = null, token = 0;
    {
      root = el('div', 'book-reader'); root.id = 'book-reader';
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-hidden', 'true');
      const head = el('div', 'book-reader-head');
      const back = el('button', 'book-reader-btn', '←'); back.type = 'button'; back.setAttribute('aria-label', 'Tutup pembaca buku');
      titleEl = el('div', 'book-reader-title'); titleEl.id = 'book-reader-title'; root.setAttribute('aria-labelledby', 'book-reader-title');
      pageEl = el('div', 'book-reader-page'); pageEl.setAttribute('aria-live', 'polite');
      head.append(back, titleEl, pageEl);
      body = el('div', 'book-reader-body'); body.tabIndex = -1;
      root.append(head, body);
      document.body.append(root);
      back.addEventListener('click', () => close());
    }
    function status(text, retry) {
      body.textContent = '';
      const box = el('div', 'book-reader-msg', text);
      if (retry) { const r = el('button', 'btn btn-soft btn-sm', '🔄 Coba lagi'); r.type = 'button'; r.style.minHeight = '40px'; r.addEventListener('click', retry); box.append(document.createElement('br'), r); }
      body.append(box);
    }
    async function load(b) {
      const my = ++token;
      pageEl.textContent = ''; status('⏳ Memuat isi buku…');
      const r = await LJ_AUTH.apiGet('getBuku', { id: b.id });
      if (my !== token || !opened) return;
      if (!r.ok) return status(r.msg || 'Isi buku belum bisa dibuka.', () => load(b));
      if (r.format === 'html') {
        body.textContent = '';
        const t = el('div', 'book-text'); t.innerHTML = r.html; // HTML dibuat & di-escape oleh server
        body.append(t); return;
      }
      if (r.format === 'pdf') {
        let lib;
        try { lib = await loadPdfJs(); } catch (e) { return status('Penampil PDF belum bisa dimuat. Periksa koneksi internetmu.', () => load(b)); }
        let pdf;
        try {
          const bin = atob(r.base64), bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          pdf = await lib.getDocument({ data: bytes }).promise;
        } catch (e) { return status('File PDF buku ini tidak bisa dibaca.'); }
        if (my !== token || !opened) return;
        body.textContent = '';
        const first = await pdf.getPage(1), vp1 = first.getViewport({ scale: 1 });
        const pages = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const box = el('div', 'book-page'); box.dataset.page = n;
          box.style.aspectRatio = vp1.width + ' / ' + vp1.height;
          box.setAttribute('aria-label', 'Halaman ' + n + ' dari ' + pdf.numPages);
          body.append(box); pages.push(box);
        }
        pageEl.textContent = '1 / ' + pdf.numPages;
        const draw = async box => {
          if (box.dataset.done) return; box.dataset.done = '1';
          const page = await pdf.getPage(+box.dataset.page);
          const w = box.clientWidth, vp = page.getViewport({ scale: 1 }), dpr = Math.min(window.devicePixelRatio || 1, 2);
          const scale = (w / vp.width) * dpr, view = page.getViewport({ scale: scale });
          const c = document.createElement('canvas'); c.width = view.width; c.height = view.height;
          c.style.width = '100%'; c.style.height = 'auto';
          c.addEventListener('contextmenu', e => e.preventDefault());
          await page.render({ canvasContext: c.getContext('2d'), viewport: view }).promise;
          box.style.aspectRatio = ''; box.append(c);
        };
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(ents => ents.forEach(en => {
          if (en.isIntersecting) draw(en.target);
        }), { root: body, rootMargin: '600px 0px' });
        pages.forEach(p => observer.observe(p));
        // Penunjuk halaman = halaman yang menempati tengah layar pembaca
        body.onscroll = () => {
          const mid = body.getBoundingClientRect().top + body.clientHeight / 2;
          let cur = 1;
          for (const p of pages) { if (p.getBoundingClientRect().top <= mid) cur = +p.dataset.page; else break; }
          if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) cur = pdf.numPages; // sudah di ujung
          pageEl.textContent = cur + ' / ' + pdf.numPages;
        };
        return;
      }
      status('Format buku ini belum bisa dibaca di situs.');
    }
    function open(b) {
      prevFocus = document.activeElement; opened = true;
      titleEl.textContent = b.judul;
      root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      body.scrollTop = 0;
      setTimeout(() => root.querySelector('.book-reader-btn').focus(), 50);
      load(b);
    }
    function close() {
      if (!opened) return;
      opened = false; token++;
      if (observer) { observer.disconnect(); observer = null; }
      root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true');
      body.textContent = ''; pageEl.textContent = ''; body.onscroll = null;
      // Detail buku masih terbuka di belakang: kunci gulir tetap
      if (prevFocus && document.contains(prevFocus)) prevFocus.focus();
    }
    return { open, close, isOpen: () => opened };
  })();

  document.getElementById('book-close').addEventListener('click', closeDetail);
  document.getElementById('book-overlay').addEventListener('click', closeDetail);
  if (window.__ljBookEsc) document.removeEventListener('keydown', window.__ljBookEsc);
  window.__ljBookEsc = e => {
    if (e.key === 'Escape') { if (BookReader.isOpen()) BookReader.close(); else closeDetail(); return; }
    // Tab berputar di dalam pembaca / detail buku selama terbuka
    const drawer = BookReader.isOpen() ? document.getElementById('book-reader') : document.getElementById('book-drawer');
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
