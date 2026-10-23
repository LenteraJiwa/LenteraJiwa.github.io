'use strict';
/* ============================================================
   beranda.js — Data nyata untuk Beranda & Tentang
   - Angka statistik ([data-stat]) dari server
   - Artikel & buku terbaru (Beranda)
   - Tim psikolog terverifikasi (Tentang)
   Semua teks dari server ditulis lewat textContent.
   ============================================================ */
(function () {
  if (typeof LJ_AUTH === 'undefined') return;
  const USIA = { anak: 'Anak', remaja: 'Remaja', dewasa: 'Dewasa', lansia: 'Lansia' };
  const GRAD = ['linear-gradient(135deg,#E8E4FF,#C4BEFF)', 'linear-gradient(135deg,#D6EEFF,#7EC3F0)', 'linear-gradient(135deg,#DCFFF0,#6FDDB0)', 'linear-gradient(135deg,#FFE8DC,#F0A882)', 'linear-gradient(135deg,#FFF9D6,#F0D070)'];

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function info(box, cls, text) {
    box.textContent = '';
    const n = el('div', cls, text);
    n.style.cssText = 'min-height:120px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--text-secondary);cursor:default;padding:20px;grid-column:1/-1;';
    box.append(n);
  }
  function goto(page) {
    if (window.LJ && window.LJ.App) window.LJ.App.navigateTo(page);
    else location.href = page;
  }

  /* ── Statistik ── */
  const statEls = document.querySelectorAll('[data-stat]');
  if (statEls.length) {
    LJ_AUTH.apiGet('getStatistik').then(r => {
      statEls.forEach(e => {
        const v = r.ok && r.statistik ? r.statistik[e.dataset.stat] : null;
        e.textContent = (typeof v === 'number') ? String(v) : '–';
        if (!r.ok) e.title = 'Data belum bisa dimuat';
      });
    });
  }

  /* ── Artikel terbaru (Beranda) ── */
  const homeArt = document.getElementById('home-artikel');
  if (homeArt) {
    LJ_AUTH.apiGet('getKonten', { tipe: 'artikel' }).then(r => {
      if (!r.ok) return info(homeArt, 'artikel-card', 'Artikel belum bisa dimuat. Coba lagi nanti.');
      const list = (r.konten || []).slice(0, 3);
      if (!list.length) return info(homeArt, 'artikel-card', '📭 Artikel pertama sedang ditulis oleh psikolog kami.');
      homeArt.textContent = '';
      list.forEach(a => {
        const c = el('article', 'artikel-card card-hover');
        c.tabIndex = 0;
        c.setAttribute('aria-label', 'Buka artikel: ' + a.judul);
        const tag = el('span', 'artikel-tag', (a.usia || []).map(u => USIA[u] || u).join(' · '));
        tag.style.cssText = 'background:var(--lav-100);color:var(--lav-800);';
        const meta = el('div', 'artikel-meta');
        meta.append(el('span', '', '📖 ' + (a.menitBaca || 1) + ' menit baca'));
        c.append(tag, el('h3', 'artikel-title regular', a.judul), el('p', 'artikel-excerpt', a.ringkasan), meta);
        const open = () => { try { sessionStorage.setItem('lj_open_artikel', a.id); } catch (e) {} goto('artikel.html'); };
        c.addEventListener('click', open);
        c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        homeArt.append(c);
      });
    });
  }

  /* ── Buku terbaru (Beranda) ── */
  const homeBuku = document.getElementById('home-buku');
  if (homeBuku) {
    LJ_AUTH.apiGet('getKonten', { tipe: 'buku' }).then(r => {
      if (!r.ok) return info(homeBuku, 'buku-card', 'Koleksi belum bisa dimuat.');
      const list = (r.konten || []).slice(0, 8);
      if (!list.length) return info(homeBuku, 'buku-card', '📭 Koleksi sedang disiapkan.');
      homeBuku.textContent = '';
      list.forEach((b, i) => {
        const c = el('div', 'buku-card');
        c.setAttribute('role', 'listitem'); c.tabIndex = 0;
        c.setAttribute('aria-label', b.judul);
        const cover = el('div', 'buku-cover', '📘');
        cover.style.background = GRAD[i % GRAD.length];
        const inf = el('div', 'buku-info');
        inf.append(el('div', 'buku-title-text', b.judul), el('div', 'buku-author-text', (b.usia || []).map(u => USIA[u] || u).join(' · ')));
        c.append(cover, inf);
        c.addEventListener('click', () => goto('perpustakaan.html'));
        c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto('perpustakaan.html'); } });
        homeBuku.append(c);
      });
    });
  }

  /* ── Tim psikolog (Tentang) ── */
  const team = document.getElementById('team-grid');
  if (team) {
    LJ_AUTH.apiGet('getPsikolog').then(r => {
      if (!r.ok) return info(team, 'team-card', 'Profil psikolog belum bisa dimuat. Coba lagi nanti.');
      const list = r.psikolog || [];
      team.textContent = '';
      list.forEach((p, i) => {
        const c = el('article', 'team-card');
        c.setAttribute('aria-label', 'Profil ' + p.namaTampil);
        const av = el('div', 'team-avatar');
        av.style.background = GRAD[i % GRAD.length];
        if (/^https:\/\/drive\.google\.com\/thumbnail\?/.test(p.foto || '')) {
          const img = el('img'); img.src = p.foto; img.alt = 'Foto ' + p.namaTampil; img.loading = 'lazy';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
          av.append(img);
        } else av.textContent = '🧑‍⚕️';
        const inf = el('div', 'team-info');
        inf.append(el('h3', 'team-name', p.namaTampil),
                   el('div', 'team-cred', [p.gelar, p.pengalamanTahun ? p.pengalamanTahun + ' tahun pengalaman' : ''].filter(Boolean).join(' · ')));
        const tags = el('div', 'team-tags');
        (p.usiaLayanan || []).concat(p.topik || []).slice(0, 5).forEach(t => tags.append(el('span', 'team-tag', USIA[t] || t)));
        inf.append(tags);
        if (p.spesialisasi) inf.append(el('div', 'team-spec', 'Spesialis: ' + p.spesialisasi));
        if (p.nomorIzin) inf.append(el('div', 'team-spec', '🪪 Izin praktik: ' + p.nomorIzin));
        if (p.kutipan) inf.append(el('div', 'team-quote', '“' + p.kutipan + '”'));
        c.append(av, inf);
        team.append(c);
      });
      // Kartu ajakan bergabung selalu ada di akhir
      const join = el('article', 'team-card');
      join.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;min-height:260px;cursor:default;';
      join.append(el('span', '', '🌱'),
        el('h3', '', list.length ? 'Bergabung dengan Tim' : 'Tim psikolog sedang dibentuk'),
        el('p', '', list.length ? 'Kami mencari psikolog berizin praktik yang ingin berbagi dan mendampingi.' : 'Profil psikolog akan tampil di sini setelah izin praktiknya kami verifikasi.'));
      join.querySelector('span').style.fontSize = '44px';
      join.querySelector('h3').style.cssText = "font-family:'Fraunces',serif;font-size:20px;font-weight:300;margin:12px 0 8px;";
      join.querySelector('p').style.cssText = 'font-size:13px;color:var(--text-secondary);line-height:1.65;max-width:240px;';
      team.append(join);
    });
  }
})();
