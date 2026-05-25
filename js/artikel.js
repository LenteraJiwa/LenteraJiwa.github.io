/* ============================================================
   artikel.js — Article Reader & Filter Logic (PERF v3.0 FIXED)

   PERBAIKAN v3.0:
   - IIFE membungkus seluruh kode (mencegah identifier conflict di SPA)
   - article-progress-fill pakai transform:scaleX (bukan width)
     — width transition di setiap scroll event = layout reflow terus-menerus
   - Event listener tidak menumpuk antar navigasi karena IIFE fresh setiap load
   ============================================================ */

'use strict';

(function() {

/* ── ARTICLE DATA ──────────────────────────────────────────── */
const ARTICLES = {
  'hfa-dewasa': {
    tag: 'Dewasa · Kecemasan',
    tagStyle: 'background:var(--lav-100);color:var(--lav-800);',
    agePill: 'dewasa',
    readTime: '14 menit baca',
    author: 'Tim Klinis Lentera Jiwa',
    authorRole: 'Direview oleh Psikolog Klinis, M.Psi.',
    updated: 'Diperbarui 2025',
    render() {
      return `
        <div class="article-meta-row">
          <span class="artikel-tag" style="background:var(--lav-100);color:var(--lav-800);">Dewasa · Kecemasan</span>
          <span class="age-pill dewasa">Dewasa</span>
          <span style="font-size:12px;color:var(--text-muted);font-weight:600;">Diperbarui 2025</span>
        </div>

        <div class="article-author">
          <div class="article-author-avatar">🧑‍⚕️</div>
          <div>
            <div class="article-author-name">Tim Klinis Lentera Jiwa</div>
            <div class="article-author-role">Direview oleh Psikolog Klinis, M.Psi.</div>
          </div>
        </div>

        <div class="article-disclaimer" role="note" aria-label="Catatan penting">
          📋 <strong>Catatan:</strong> Konten ini bersifat edukatif dan tidak menggantikan diagnosis atau konsultasi profesional. Jika kamu merasa artikel ini menggambarkan kondisimu, pertimbangkan untuk berbicara dengan psikolog.
        </div>

        <h1 id="article-drawer-title" class="article-h1">Ketika Diam Terasa Lebih Aman: Memahami High-Functioning Anxiety</h1>

        <p class="article-intro">
          Pernahkah kamu merasa lelah, bukan karena kurang tidur, melainkan karena pikiran tidak pernah benar-benar berhenti? Kamu menyelesaikan semua tugasmu tepat waktu. Kamu tersenyum di rapat. Kamu yang selalu punya jawaban. Namun malam harinya, kamu berbaring di tempat tidur dan mereplay setiap kalimat yang kamu ucapkan hari ini — mencari kesalahan yang bahkan mungkin tidak ada.
          <br><br>
          Ini bukan perfeksionisme biasa. Ini bisa jadi <em>high-functioning anxiety</em>.
        </p>

        <h2 class="article-h2">Apa Itu High-Functioning Anxiety?</h2>

        <p class="article-p">
          High-functioning anxiety (HFA) bukan diagnosis resmi dalam DSM-5, namun merupakan istilah yang digunakan secara luas dalam komunitas psikologi klinis untuk menggambarkan individu yang mengalami gejala kecemasan bermakna — namun tetap mampu berfungsi, bahkan berprestasi tinggi dalam kehidupan sehari-hari.
        </p>
        <p class="article-p">
          Secara klinis, kondisi ini paling dekat dengan Generalized Anxiety Disorder (GAD) dengan presentasi tersembunyi. Penelitian dari Harvard Medical School (2017) menemukan bahwa sekitar 18% individu dengan gejala kecemasan tidak teridentifikasi dalam skrining standar karena kemampuan mereka mempertahankan fungsi sosial dan profesional.
        </p>

        <div class="article-callout" role="note">
          <strong>📌 Tahukah kamu?</strong>
          <p>Sebuah studi meta-analitik dari Journal of Anxiety Disorders (Remes et al., 2016) mencatat bahwa gangguan kecemasan mempengaruhi lebih dari 1 dari 3 perempuan dan 1 dari 5 laki-laki sepanjang hidup mereka — menjadikannya salah satu kondisi kesehatan mental yang paling umum namun paling sering tidak tertangani.</p>
        </div>

        <h2 class="article-h2">Tanda-tanda yang Mungkin Tidak Kamu Sadari</h2>

        <h3 class="article-h3">Tanda Internal (yang hanya kamu rasakan)</h3>
        <ul class="article-ul">
          <li>Pikiran berulang tentang "bagaimana jika..." bahkan untuk skenario yang sangat kecil kemungkinannya</li>
          <li>Kesulitan "mematikan" otak saat hendak tidur atau beristirahat</li>
          <li>Perasaan bahwa sesuatu yang buruk akan terjadi, meski tidak ada bukti nyata</li>
          <li>Kebutuhan kuat untuk mendapat kepastian dari orang lain sebelum mengambil keputusan</li>
          <li>Fisik tegang: rahang kencang, bahu kaku, perut tidak nyaman — tanpa penyebab medis yang jelas</li>
          <li>Menghindari situasi bukan karena tidak mampu, melainkan karena energi yang dibutuhkan terasa terlalu besar</li>
        </ul>

        <h3 class="article-h3">Tanda Eksternal (yang justru terlihat positif oleh orang lain)</h3>
        <ul class="article-ul">
          <li>Selalu tepat waktu, bahkan terlalu awal — karena keterlambatan terasa seperti bencana</li>
          <li>Sangat terorganisir dan detail-oriented di luar batas kebutuhan tugas</li>
          <li>Sering meminta maaf, bahkan untuk hal yang bukan salahmu</li>
          <li>Sulit mendelegasikan tugas karena takut hasilnya tidak sesuai standar</li>
          <li>Cenderung menjadi "orang yang bisa diandalkan" dalam kelompok, meski kamu sendiri kelelahan</li>
        </ul>

        <h2 class="article-h2">Mengapa HFA Sering Tidak Terdeteksi</h2>
        <p class="article-p">
          Sistem kesehatan mental kita, secara historis, dibangun untuk mengenali distres yang terlihat. Namun HFA bekerja dengan mekanisme sebaliknya: kecemasanlah yang menggerakkan produktivitas. Psikolog klinis Dr. Sherry Benton dari Florida menyebutnya sebagai <em>"anxiety-driven high performance"</em> — kondisi di mana output luar biasa dihasilkan bukan dari passion atau flow state, melainkan dari rasa takut gagal yang mengakar.
        </p>

        <h2 class="article-h2">Pendekatan Berbasis Bukti untuk Mulai Berubah</h2>

        <div class="article-step">
          <div class="article-step-num">1</div>
          <h3 class="article-h3" style="margin-top:0;">Cognitive Defusion (dari ACT)</h3>
          <p class="article-p" style="margin-bottom:0;">
            Dikembangkan oleh Steven C. Hayes, Acceptance and Commitment Therapy (ACT) mengajarkan kita untuk tidak melawan pikiran cemas, melainkan menciptakan jarak darinya. Ketika pikiran "Aku pasti gagal presentasi ini" muncul, alih-alih mempercayainya atau melawannya, coba framing ulang: <strong>"Aku sedang memiliki pikiran bahwa aku mungkin gagal presentasi ini."</strong>
          </p>
        </div>

        <div class="article-step">
          <div class="article-step-num">2</div>
          <h3 class="article-h3" style="margin-top:0;">Worry Window — Memberi Kecemasan Jadwalnya Sendiri</h3>
          <ul class="article-ul">
            <li>Tentukan 20 menit sehari sebagai "waktu khawatir" (misalnya, pukul 17.00)</li>
            <li>Sepanjang hari, saat pikiran cemas muncul, catat dan "jadwalkan" untuk nanti</li>
            <li>Saat tiba waktunya, duduk dan pikirkan secara penuh selama 20 menit</li>
            <li>Jika waktu habis, tutup. Esok ada jadwalnya lagi.</li>
          </ul>
        </div>

        <div class="article-step">
          <div class="article-step-num">3</div>
          <h3 class="article-h3" style="margin-top:0;">Somatic Grounding — Latihan 5-4-3-2-1</h3>
          <ul class="article-ul">
            <li><strong>5</strong> hal yang bisa kamu LIHAT saat ini</li>
            <li><strong>4</strong> hal yang bisa kamu SENTUH</li>
            <li><strong>3</strong> hal yang bisa kamu DENGAR</li>
            <li><strong>2</strong> hal yang bisa kamu CIUM</li>
            <li><strong>1</strong> hal yang bisa kamu RASAKAN di dalam mulut</li>
          </ul>
        </div>

        <div class="article-cta">
          <h3>Merasa artikel ini menggambarkan kondisimu?</h3>
          <p>Tim psikolog kami siap menemanimu. Sesi pertama gratis, 20 menit.</p>
          <a href="layanan.html" class="btn btn-ripple" style="background:white;color:var(--lav-800);padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">Mulai Konsultasi ✨</a>
        </div>
      `;
    }
  },

  'inner-critic-remaja': {
    tag: 'Remaja · Self-compassion',
    tagStyle: 'background:var(--sky-100);color:var(--sky-800);',
    agePill: 'remaja',
    readTime: '12 menit baca',
    render() {
      return `
        <div class="article-meta-row">
          <span class="artikel-tag" style="background:var(--sky-100);color:var(--sky-800);">Remaja · Self-compassion</span>
          <span class="age-pill remaja">Remaja</span>
        </div>

        <div class="article-disclaimer" role="note">
          📋 Artikel ini ditulis khusus untuk remaja usia 13–17 tahun. Konten bersifat edukatif.
        </div>

        <h1 id="article-drawer-title" class="article-h1">Ketika Dirimu Merasa Tidak Cukup: Memahami Inner Critic dan Cara Melunakkannya</h1>

        <p class="article-intro">
          Ada suara di dalam kepalamu yang mungkin kamu kenal. Suara yang bilang nilai segitu tidak cukup. Tubuhmu tidak ideal. Temanmu lebih menarik, lebih pintar, lebih segalanya.
          <br><br>
          Suara itu punya nama: <strong>Inner Critic.</strong> Dan kabar baiknya? Suara itu bisa dilunakkan.
        </p>

        <h2 class="article-h2">Kenapa Otak Remaja Lebih Rentan terhadap Inner Critic?</h2>
        <p class="article-p">
          Korteks prefrontal — bagian otak yang mengatur penilaian diri yang seimbang — baru selesai berkembang di sekitar usia 25 tahun. Sementara itu, amigdala — pusat respons emosional — sudah sangat aktif sejak remaja.
        </p>

        <h2 class="article-h2">Tiga Langkah Melunakkan Inner Critic</h2>

        <div class="article-step">
          <div class="article-step-num">1</div>
          <h3 class="article-h3" style="margin-top:0;">Kenali dan Beri Nama</h3>
          <p class="article-p" style="margin-bottom:0;">
            Ketika inner critic-mu muncul, observasi tanpa langsung bereaksi. Bisa beri nama: "Oh, ini si Perfeksionis sedang berbicara lagi."
          </p>
        </div>

        <div class="article-step">
          <div class="article-step-num">2</div>
          <h3 class="article-h3" style="margin-top:0;">Tanya Pertanyaan yang Berbeda</h3>
          <ul class="article-ul">
            <li><span style="color:var(--peach-600);">× "Kenapa aku selalu begini?"</span> → <span style="color:var(--mint-600);">✓ "Apa yang sedang kubutuhkan saat ini?"</span></li>
            <li><span style="color:var(--peach-600);">× "Apa yang salah denganku?"</span> → <span style="color:var(--mint-600);">✓ "Apa yang membuat situasi ini sulit?"</span></li>
          </ul>
        </div>

        <div class="article-step">
          <div class="article-step-num">3</div>
          <h3 class="article-h3" style="margin-top:0;">Perlakukan Dirimu Seperti Temanmu</h3>
          <div class="article-callout">
            <strong>💭 Coba ini sekarang</strong>
            <p>Bayangkan temanmu datang kepadamu dengan masalah yang persis sama. Apa yang akan kamu katakan padanya? Sekarang tanyakan: kenapa kamu tidak bisa berbicara pada dirimu sendiri dengan cara yang sama?</p>
          </div>
        </div>

        <div class="article-cta">
          <h3>Butuh ruang aman untuk bercerita?</h3>
          <p>Psikolog kami yang berpengalaman dengan remaja siap mendengarkan.</p>
          <a href="layanan.html" class="btn btn-ripple" style="background:white;color:var(--lav-800);padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">Mulai Obrolan Awal — Gratis ✨</a>
        </div>
      `;
    }
  },

  'emosi-anak': {
    tag: 'Anak · Emosi',
    tagStyle: 'background:var(--mint-100);color:var(--mint-800);',
    agePill: 'anak',
    readTime: '4 menit baca',
    render() {
      return `
        <div class="article-meta-row">
          <span class="artikel-tag" style="background:var(--mint-100);color:var(--mint-800);">Anak · Emosi</span>
          <span class="age-pill anak">Anak</span>
        </div>

        <h1 id="article-drawer-title" class="article-h1">Kenapa Aku Bisa Marah dan Sedih di Waktu yang Sama? 🌈</h1>

        <p class="article-intro">
          Pernahkah kamu merasa dua perasaan sekaligus? Kamu marah karena temanmu bilang sesuatu, tapi juga sedih karena kamu kangen berteman baik dengannya.
          <br><br>
          <strong>Tenang — itu sangat normal!</strong>
        </p>

        <h2 class="article-h2">Perasaanmu Itu Nyata dan Boleh Ada 💚</h2>

        <div class="emotion-wheel" role="list" aria-label="Contoh kombinasi perasaan">
          <div class="emotion-chip" role="listitem">🌧️ Sedih tapi juga <strong>lega</strong></div>
          <div class="emotion-chip" role="listitem">😤 Marah tapi juga <strong>sayang</strong></div>
          <div class="emotion-chip" role="listitem">😄 Senang tapi juga <strong>sedikit takut</strong></div>
          <div class="emotion-chip" role="listitem">🙈 Malu tapi juga <strong>bangga</strong></div>
        </div>

        <div class="article-step">
          <div class="article-step-num">🌬️</div>
          <h3 class="article-h3" style="margin-top:0;">Tarik Napas Seperti Meniup Balon</h3>
          <ul class="article-ul">
            <li>Tarik napas pelan lewat hidung (hitung <strong>1-2-3-4</strong>)</li>
            <li>Tahan sebentar (hitung <strong>1-2</strong>)</li>
            <li>Hembuskan pelan (hitung <strong>1-2-3-4-5-6</strong>)</li>
          </ul>
        </div>

        <div class="article-step">
          <div class="article-step-num">🗣️</div>
          <h3 class="article-h3" style="margin-top:0;">Kasih Nama Perasaanmu</h3>
          <div class="article-callout">
            <strong>🧠 Fakta keren!</strong>
            <p>Ketika kita memberi nama perasaan, otaknya jadi lebih tenang! Psikolog menyebutnya <em>"name it to tame it"</em>.</p>
          </div>
        </div>
      `;
    }
  },

  'makna-lansia': {
    tag: 'Lansia · Makna & Penuaan',
    tagStyle: 'background:var(--peach-100);color:var(--peach-800);',
    agePill: 'lansia',
    readTime: '11 menit baca',
    render() {
      return `
        <div class="article-meta-row">
          <span class="artikel-tag" style="background:var(--peach-100);color:var(--peach-800);">Lansia · Makna &amp; Penuaan</span>
          <span class="age-pill lansia">Lansia</span>
        </div>

        <h1 id="article-drawer-title" class="article-h1">Menemukan Makna di Setiap Tahap: Psikologi Penuaan yang Sehat</h1>

        <p class="article-intro">
          Ada pandangan keliru yang terlalu lama kita pegang: bahwa usia tua adalah tentang kehilangan.
          <br><br>
          Namun penelitian selama 40 tahun terakhir menggambarkan kisah yang sangat berbeda — kisah tentang pertumbuhan, kebijaksanaan, dan kapasitas unik yang hanya bisa dimiliki oleh mereka yang telah melewati banyak perjalanan hidup.
        </p>

        <h2 class="article-h2">Teori Erikson — Integritas vs. Keputusasaan</h2>
        <p class="article-p">
          Erik Erikson mengidentifikasi tugas perkembangan utama di usia lanjut sebagai pencapaian <em>"ego integrity"</em> — kemampuan melihat ke belakang pada hidup yang telah dijalani dengan penerimaan dan rasa syukur.
        </p>

        <div class="article-callout" role="note">
          <strong>🔬 Harvard Study of Adult Development</strong>
          <p>Penelitian longitudinal terpanjang tentang kehidupan manusia (Vaillant, 2012) menemukan bahwa kualitas hubungan dekat adalah prediktor tunggal terkuat dari kesehatan fisik dan kebahagiaan di usia lanjut.</p>
        </div>

        <div class="article-cta">
          <h3>Anda tidak harus berjalan sendirian.</h3>
          <p>Psikolog kami siap menemani Anda dengan hangat dan penuh hormat.</p>
          <a href="layanan.html" class="btn btn-ripple" style="background:white;color:var(--lav-800);padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">Jadwalkan Sesi ✨</a>
        </div>
      `;
    }
  },
};

/* ── ARTICLE READER ─────────────────────────────────────── */
const ArticleReader = {
  overlay:  null,
  drawer:   null,
  progress: null,
  isOpen:   false,
  _scrollHandler: null, /* PERBAIKAN: simpan referensi untuk cleanup */

  init() {
    this.overlay  = document.getElementById('article-overlay');
    this.drawer   = document.getElementById('article-drawer');
    this.progress = document.getElementById('article-progress-fill');

    if (!this.overlay || !this.drawer) return;

    document.querySelectorAll('[data-article-id]').forEach(card => {
      card.addEventListener('click',   () => this.open(card.dataset.articleId));
      card.addEventListener('keydown', e  => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open(card.dataset.articleId);
        }
      });
    });

    const closeBtn = document.getElementById('article-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    /* PERBAIKAN: progress bar pakai transform:scaleX bukan width
       Ini menghilangkan layout reflow di setiap scroll event */
    if (this.drawer) {
      this._scrollHandler = () => this.updateProgress();
      this.drawer.addEventListener('scroll', this._scrollHandler, { passive: true });
    }
  },

  open(id) {
    const article = ARTICLES[id];
    if (!article) return;

    const content = document.getElementById('article-content');
    const tagEl   = document.getElementById('article-drawer-tag');
    const timeEl  = document.getElementById('article-drawer-time');

    if (content) content.innerHTML = article.render();
    if (tagEl)   { tagEl.textContent = article.tag; tagEl.style.cssText = article.tagStyle + 'margin-bottom:0;'; }
    if (timeEl)  timeEl.textContent  = '📖 ' + article.readTime;

    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;

    if (this.drawer) this.drawer.scrollTop = 0;
    /* PERBAIKAN: reset via transform bukan width */
    if (this.progress) {
      this.progress.style.transform = 'scaleX(0)';
      this.progress.style.transformOrigin = 'left';
    }

    setTimeout(() => {
      const focusTarget = content && content.querySelector('#article-drawer-title') || document.getElementById('article-close');
      if (focusTarget) focusTarget.focus();
    }, 520);
  },

  close() {
    if (!this.overlay || !this.drawer) return;
    this.overlay.classList.remove('is-open');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.isOpen = false;
  },

  updateProgress() {
    if (!this.drawer || !this.progress) return;
    const { scrollTop, scrollHeight, clientHeight } = this.drawer;
    const scrollable = scrollHeight - clientHeight;
    const pct = scrollable > 0 ? (scrollTop / scrollable) : 0;
    /* PERBAIKAN: scaleX (composite, GPU) bukan width (layout trigger) */
    this.progress.style.transform = 'scaleX(' + Math.min(pct, 1) + ')';
    this.progress.style.transformOrigin = 'left';
  },
};

/* ── FILTER LOGIC ───────────────────────────────────────── */
const FilterManager = {
  init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        this.apply(filter);
      });
    });
  },

  apply(filter) {
    document.querySelectorAll('[data-article-id]').forEach(card => {
      const tags = card.dataset.tags || '';
      const show = filter === 'semua' || tags.includes(filter);

      card.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-spring)';

      if (show) {
        card.style.opacity       = '1';
        card.style.transform     = '';
        card.style.pointerEvents = '';
        card.setAttribute('tabindex', '0');
      } else {
        card.style.opacity       = '0.25';
        card.style.transform     = 'scale(0.97)';
        card.style.pointerEvents = 'none';
        card.setAttribute('tabindex', '-1');
      }
    });
  },
};

/* ── INIT ── */
ArticleReader.init();
FilterManager.init();

})();