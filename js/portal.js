'use strict';
/* ============================================================
   portal.js — Portal psikolog & admin Lentera Jiwa
   Semua data dari server dimasukkan lewat textContent (bukan innerHTML).
   ============================================================ */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  let ME = null;

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
    });
    kids.flat().forEach(c => { if (c != null && c !== false) n.append(c instanceof Node ? c : String(c)); });
    return n;
  }
  function status(box, type, msg) { box.className = 'portal-status ' + (type || ''); box.textContent = msg || ''; }
  function toast(msg) {
    const t = $('#pt-toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  }
  async function busy(btn, fn) {
    btn.disabled = true;
    try { return await fn(); } finally { btn.disabled = false; }
  }
  const USIA_LABEL = { anak: '🌱 Anak', remaja: '🌙 Remaja', dewasa: '☀️ Dewasa', lansia: '🌸 Lansia' };

  /* ── Gerbang akses ── */
  function gate(msg, link) {
    const g = $('#pt-gate');
    g.textContent = '';
    g.append(el('h1', { class: 'portal-h1' }, 'Portal Psikolog'), el('p', { class: 'portal-help' }, msg));
    if (link) g.append(el('a', { class: 'portal-btn', href: link.href, style: 'display:inline-block;text-decoration:none' }, link.text));
    g.hidden = false; $('#pt-app').hidden = true;
  }

  async function init() {
    $('#pt-logout').addEventListener('click', () => LJ_AUTH.logout());
    const s = LJ_AUTH.getSession();
    if (!s) return gate('Masuk dulu dengan akun psikolog atau admin untuk membuka portal ini.', { href: 'login.html', text: 'Masuk' });
    $('#pt-user').textContent = s.nama || s.username || '';
    const r = await LJ_AUTH.call('portalSaya');
    if (!r.ok) {
      if (r.code === 'AUTH') return gate('Sesimu sudah berakhir. Silakan masuk lagi.', { href: 'login.html', text: 'Masuk lagi' });
      if (r.code === 'ROLE') return gate('Akun ini belum punya akses portal. Minta admin Lentera Jiwa menjadikan akunmu sebagai psikolog.', { href: 'index.html', text: 'Kembali ke situs' });
      if (/tidak dikenal/i.test(r.msg || '')) return gate('Portal belum aktif di server. Admin perlu memasang backend versi terbaru di Apps Script.', { href: 'index.html', text: 'Kembali ke situs' });
      return gate(r.msg || 'Portal belum bisa dibuka. Coba lagi nanti.', { href: 'portal.html', text: 'Coba lagi' });
    }
    ME = r.user;
    $('#pt-user').textContent = ME.nama + ' · ' + (ME.role === 'admin' ? 'Admin' : 'Psikolog');
    $('#pt-gate').hidden = true; $('#pt-app').hidden = false;
    if (ME.role === 'admin') $('.portal-tab[data-tab="admin"]').hidden = false;
    initTabs(); fillProfil(r.profil); initProfil(); initKonten(); initAdmin();
    loadKonten();
  }

  /* ── Tab ── */
  function initTabs() {
    $$('.portal-tab').forEach(t => t.addEventListener('click', () => {
      $$('.portal-tab').forEach(x => x.setAttribute('aria-selected', String(x === t)));
      $$('.portal-panel').forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
      if (t.dataset.tab === 'admin' && !$('#ad-list').childElementCount) searchUsers('*');
    }));
  }

  /* ── Profil ── */
  function fillProfil(p) {
    const f = $('#pf-form');
    const box = $('#pf-status');
    if (!p) {
      f.namaTampil.value = ME.nama || '';
      status(box, 'info', 'Kamu belum punya profil psikolog. Lengkapi formulir di bawah.');
      return;
    }
    f.namaTampil.value = p.namaTampil || ''; f.gelar.value = p.gelar || ''; f.nomorIzin.value = p.nomorIzin || '';
    f.pengalamanTahun.value = p.pengalamanTahun || 0; f.spesialisasi.value = p.spesialisasi || '';
    f.topik.value = (p.topik || []).join(', '); f.kutipan.value = p.kutipan || '';
    f.fotoLink.value = p.fotoFileId ? 'https://drive.google.com/file/d/' + p.fotoFileId + '/view' : '';
    $$('input[name="usiaLayanan"]', f).forEach(c => { c.checked = (p.usiaLayanan || []).indexOf(c.value) >= 0; });
    status(box, p.terverifikasi ? 'ok' : 'info', p.terverifikasi
      ? '✅ Profilmu sudah diverifikasi dan tampil di situs.'
      : '⏳ Profilmu menunggu verifikasi admin, jadi belum tampil di situs.');
  }
  function initProfil() {
    $('#pf-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target, btn = f.querySelector('button[type=submit]');
      const data = {
        namaTampil: f.namaTampil.value, gelar: f.gelar.value, nomorIzin: f.nomorIzin.value,
        pengalamanTahun: f.pengalamanTahun.value, spesialisasi: f.spesialisasi.value, topik: f.topik.value,
        kutipan: f.kutipan.value, fotoLink: f.fotoLink.value,
        usiaLayanan: $$('input[name="usiaLayanan"]:checked', f).map(c => c.value)
      };
      const r = await busy(btn, () => LJ_AUTH.call('simpanProfilPsikolog', { data }));
      status($('#pf-status'), r.ok ? (r.terverifikasi ? 'ok' : 'info') : 'err', r.msg || (r.ok ? 'Tersimpan.' : 'Gagal menyimpan.'));
      if (r.ok) toast('Profil disimpan');
    });
  }

  /* ── Konten ── */
  function setTipeUI(tipe) {
    const f = $('#kt-form'), pustaka = tipe === 'buku' || tipe === 'jurnal';
    $('#kt-file-label').textContent = tipe === 'artikel' ? 'Link Google Docs artikel *' : 'Link file PDF / Google Docs di Drive (tetap privat; opsional jika ada link luar)';
    f.fileLink.placeholder = tipe === 'artikel' ? 'https://docs.google.com/document/d/…' : 'https://drive.google.com/file/d/…';
    $('#kt-luar-wrap').hidden = !pustaka;
    $('#kt-pustaka-wrap').hidden = !pustaka;
    $('#kt-luar-label').textContent = tipe === 'jurnal' ? 'Link jurnal (DOI / situs jurnal, opsional jika ada file)' : 'Link luar (toko/perpustakaan, opsional)';
    f.linkLuar.placeholder = tipe === 'jurnal' ? 'https://doi.org/…' : 'https://…';
    $('#kt-sumber-label').textContent = tipe === 'jurnal' ? 'Penulis, nama jurnal & tahun (opsional)' : 'Penulis & penerbit (opsional)';
    f.sumber.placeholder = tipe === 'jurnal' ? 'Contoh: Sari, D. & Putra, A. · Jurnal Psikologi Indonesia, 2023' : 'Contoh: M.N. Hegde & Don Freed · Plural Publishing, 2022';
  }
  /* ── Sampul: dikecilkan di perangkat (maks. 400×600, JPEG) sebelum dikirim ── */
  const SAMPUL = { data: '', hapus: false, ada: false };
  function sampulPreview(src, note) {
    const box = $('#kt-sampul-preview'); box.textContent = '';
    if (src) { const img = new Image(); img.src = src; img.alt = 'Pratinjau sampul'; box.append(img); }
    else box.append(el('span', {}, note || 'Belum ada sampul'));
    $('#kt-sampul-hapus').hidden = !(src || SAMPUL.ada) || SAMPUL.hapus;
  }
  function kecilkanGambar(file) {
    return new Promise((ok, no) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const sc = Math.min(1, 400 / img.width, 600 / img.height);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * sc)); c.height = Math.max(1, Math.round(img.height * sc));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        let q = 0.85, d = c.toDataURL('image/jpeg', q);
        while (d.length > 110000 && q > 0.4) { q -= 0.1; d = c.toDataURL('image/jpeg', q); } // ±80 KB
        ok(d);
      };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error('img')); };
      img.src = url;
    });
  }
  function resetSampul() { SAMPUL.data = ''; SAMPUL.hapus = false; SAMPUL.ada = false; $('#kt-sampul-file').value = ''; sampulPreview(''); }
  function initSampul() {
    $('#kt-sampul-file').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { status($('#kt-status'), 'err', 'Sampul harus berupa gambar JPG, PNG, atau WEBP.'); e.target.value = ''; return; }
      if (file.size > 15 * 1024 * 1024) { status($('#kt-status'), 'err', 'Gambar sampul terlalu besar (maks. 15 MB sebelum dikecilkan).'); e.target.value = ''; return; }
      try { SAMPUL.data = await kecilkanGambar(file); SAMPUL.hapus = false; sampulPreview(SAMPUL.data); }
      catch (err) { status($('#kt-status'), 'err', 'Gambar tidak bisa dibuka. Coba gambar lain.'); }
    });
    $('#kt-sampul-hapus').addEventListener('click', () => {
      SAMPUL.data = ''; $('#kt-sampul-file').value = '';
      SAMPUL.hapus = SAMPUL.ada; sampulPreview('', SAMPUL.ada ? 'Sampul akan dihapus saat disimpan' : 'Belum ada sampul');
    });
  }
  function resetKontenForm() {
    const f = $('#kt-form');
    f.reset(); f.id.value = ''; setTipeUI('artikel'); resetSampul();
    $('#kt-title').textContent = 'Tambah Konten';
    status($('#kt-status'), '', '');
  }
  function initKonten() {
    const f = $('#kt-form');
    f.tipe.addEventListener('change', () => setTipeUI(f.tipe.value));
    $('#kt-reset').addEventListener('click', resetKontenForm);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        id: f.id.value || undefined, tipe: f.tipe.value, status: f.status.value, judul: f.judul.value,
        ringkasan: f.ringkasan.value, topik: f.topik.value, fileLink: f.fileLink.value, linkLuar: f.linkLuar.value,
        usia: $$('input[name="usia"]:checked', f).map(c => c.value)
      };
      if (data.tipe !== 'artikel') {
        data.sumber = f.sumber.value;
        if (SAMPUL.data) data.sampulBase64 = SAMPUL.data;
        if (SAMPUL.hapus) data.hapusSampul = true;
      }
      // Link file Word/Office yang dibuka di Google Docs mengandung "rtpof=true".
      // Situs hanya bisa membaca Google Docs asli → beri tahu sebelum dikirim.
      if (data.tipe === 'artikel' && /[?&]rtpof=true/.test(data.fileLink)) {
        status($('#kt-status'), 'err', 'Link ini masih file Word (.docx), belum Google Docs. Buka file itu, pilih File → Simpan sebagai Google Dokumen (di HP: ⋮ → Bagikan & ekspor → Simpan sebagai Google Dokumen), lalu tempel link dari salinan barunya.');
        f.fileLink.focus();
        return;
      }
      status($('#kt-status'), 'info', '⏳ Memeriksa file di Google Drive dan menyimpan…');
      const r = await busy($('#kt-submit'), () => LJ_AUTH.call('simpanKonten', { data }));
      status($('#kt-status'), r.ok ? 'ok' : 'err', r.msg || (r.ok ? 'Tersimpan.' : 'Gagal menyimpan.'));
      if (r.ok) { toast('Konten disimpan'); const keep = r.msg; resetKontenForm(); status($('#kt-status'), 'ok', keep); loadKonten(); }
    });
    setTipeUI('artikel'); initSampul();
    if (ME.role === 'admin') $('#kt-list-title').textContent = 'Semua Konten (admin)';
  }
  async function loadKonten() {
    const box = $('#kt-list');
    box.textContent = 'Memuat…';
    const r = await LJ_AUTH.call('kontenSaya');
    box.textContent = '';
    if (!r.ok) { box.append(el('p', { class: 'portal-help' }, r.msg || 'Gagal memuat konten.')); return; }
    if (!r.konten.length) { box.append(el('p', { class: 'portal-help' }, 'Belum ada konten. Tambahkan artikel atau buku pertamamu di atas.')); return; }
    r.konten.forEach(k => {
      const meta = [k.tipe === 'artikel' ? '📝 Artikel' : k.tipe === 'jurnal' ? '📄 Jurnal' : '📚 Buku', (k.usia || []).map(u => USIA_LABEL[u] || u).join(', ')];
      if (k.adaSampul) meta.push('🖼️ bersampul');
      if (k.menitBaca) meta.push(k.menitBaca + ' menit baca');
      if (ME.role === 'admin') meta.push('oleh ' + k.penulisNama);
      box.append(el('div', { class: 'portal-item' },
        el('div', { class: 'portal-item-main' },
          el('div', { class: 'portal-item-title' }, el('span', { class: 'portal-pill ' + k.status }, k.status === 'terbit' ? 'Terbit' : 'Draf'), k.judul),
          el('div', { class: 'portal-item-meta' }, meta.join(' · '))),
        el('div', { class: 'portal-item-actions' },
          el('button', { type: 'button', class: 'portal-btn portal-btn-ghost portal-btn-sm', onclick: () => editKonten(k) }, 'Edit'),
          el('button', { type: 'button', class: 'portal-btn portal-btn-danger portal-btn-sm', onclick: (e) => hapusKonten(k, e.currentTarget) }, 'Hapus'))));
    });
  }
  function editKonten(k) {
    const f = $('#kt-form');
    f.id.value = k.id; f.tipe.value = k.tipe; f.status.value = k.status; f.judul.value = k.judul;
    f.ringkasan.value = k.ringkasan; f.topik.value = (k.topik || []).join(', ');
    f.fileLink.value = k.fileId ? (k.tipe === 'artikel' ? 'https://docs.google.com/document/d/' + k.fileId + '/edit' : 'https://drive.google.com/file/d/' + k.fileId + '/view') : '';
    f.linkLuar.value = k.linkLuar || '';
    f.sumber.value = k.sumber || '';
    $$('input[name="usia"]', f).forEach(c => { c.checked = (k.usia || []).indexOf(c.value) >= 0; });
    setTipeUI(k.tipe);
    resetSampul(); SAMPUL.ada = !!k.adaSampul;
    sampulPreview('', k.adaSampul ? '✅ Sudah ada sampul. Pilih gambar baru untuk mengganti.' : 'Belum ada sampul');
    // Sampul konten terbit bisa dipratinjau dari situs
    if (k.adaSampul && k.status === 'terbit' && k.sampul) LJ_AUTH.sampul([k]).then(m => { if (m[k.id] && !SAMPUL.data && !SAMPUL.hapus && f.id.value === k.id) sampulPreview(m[k.id]); });
    $('#kt-title').textContent = 'Edit Konten';
    status($('#kt-status'), 'info', 'Mengedit: ' + k.judul);
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function hapusKonten(k, btn) {
    if (!confirm('Hapus "' + k.judul + '" dari situs? File di Google Drive tidak ikut terhapus.')) return;
    const r = await busy(btn, () => LJ_AUTH.call('hapusKonten', { id: k.id }));
    toast(r.msg || (r.ok ? 'Dihapus' : 'Gagal menghapus'));
    if (r.ok) loadKonten();
  }

  /* ── Admin ── */
  function initAdmin() {
    if (ME.role !== 'admin') return;
    $('#ad-search').addEventListener('submit', e => { e.preventDefault(); searchUsers(e.target.q.value.trim()); });
    $('#ad-all').addEventListener('click', () => searchUsers('*'));
  }
  async function searchUsers(q) {
    const box = $('#ad-list'), st = $('#ad-status');
    if (q !== '*' && q.length < 2) { status(st, 'err', 'Ketik minimal 2 huruf.'); return; }
    status(st, 'info', 'Mencari…');
    const r = await LJ_AUTH.call('adminCariPengguna', { q });
    box.textContent = '';
    if (!r.ok) { status(st, 'err', r.msg || 'Gagal mencari.'); return; }
    status(st, '', r.pengguna.length ? '' : '');
    if (!r.pengguna.length) { status(st, 'info', q === '*' ? 'Belum ada akun psikolog.' : 'Tidak ada pengguna yang cocok.'); return; }
    r.pengguna.forEach(u => box.append(userRow(u, q)));
  }
  function userRow(u, q) {
    const actions = el('div', { class: 'portal-item-actions' });
    const act = async (btn, action, payload) => {
      const r = await busy(btn, () => LJ_AUTH.call(action, payload));
      toast(r.msg || (r.ok ? 'Berhasil' : 'Gagal'));
      if (r.ok) searchUsers(q);
    };
    if (u.role === 'admin') {
      actions.append(el('span', { class: 'portal-item-meta' }, 'Admin (diubah dari editor Apps Script)'));
    } else if (u.role !== 'psikolog') {
      actions.append(el('button', { type: 'button', class: 'portal-btn portal-btn-sm', onclick: e => act(e.currentTarget, 'adminSetRole', { userId: u.id, role: 'psikolog' }) }, 'Jadikan psikolog'));
    } else {
      if (u.punyaProfil) {
        actions.append(u.terverifikasi
          ? el('button', { type: 'button', class: 'portal-btn portal-btn-ghost portal-btn-sm', onclick: e => act(e.currentTarget, 'adminVerifikasi', { userId: u.id, verified: false }) }, 'Cabut verifikasi')
          : el('button', { type: 'button', class: 'portal-btn portal-btn-sm', onclick: e => act(e.currentTarget, 'adminVerifikasi', { userId: u.id, verified: true }) }, 'Verifikasi'));
      }
      actions.append(el('button', { type: 'button', class: 'portal-btn portal-btn-danger portal-btn-sm', onclick: e => {
        if (confirm('Kembalikan ' + u.nama + ' menjadi akun umum? Profil psikolognya akan disembunyikan.')) act(e.currentTarget, 'adminSetRole', { userId: u.id, role: 'umum' });
      } }, 'Cabut peran psikolog'));
    }
    const meta = ['@' + u.username, u.email];
    if (u.role === 'psikolog') meta.push(u.punyaProfil ? ('SIPP: ' + (u.nomorIzin || '—')) : 'belum mengisi profil');
    return el('div', { class: 'portal-item' },
      el('div', { class: 'portal-item-main' },
        el('div', { class: 'portal-item-title' }, el('span', { class: 'portal-pill role' }, u.role),
          u.role === 'psikolog' && u.punyaProfil ? el('span', { class: 'portal-pill ' + (u.terverifikasi ? 'ya' : 'tidak') }, u.terverifikasi ? 'Terverifikasi' : 'Belum diverifikasi') : null,
          u.nama),
        el('div', { class: 'portal-item-meta' }, meta.join(' · '))),
      actions);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
