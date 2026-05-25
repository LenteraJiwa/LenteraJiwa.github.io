'use strict';

/* ============================================================
   perpustakaan.js (PERF v3.0 FIXED)
   PERBAIKAN: IIFE mencegah identifier conflict di global scope
   ============================================================ */

(function() {

const BOOKS = [
  { id:'body-score', emoji:'🧠', gradient:'linear-gradient(135deg,#E8E4FF,#C4BEFF)', title:'The Body Keeps the Score', author:'Bessel van der Kolk', year:2014, tags:['dewasa','trauma'], agePill:'dewasa', rating:5, pages:464, difficulty:'Menengah', synopsis:'Salah satu buku paling berpengaruh dalam psikologi trauma dekade ini. Van der Kolk mengungkapkan bagaimana trauma tidak hanya tersimpan dalam memori — namun secara harfiah terpatri dalam jaringan tubuh kita.', insights:['Trauma mengubah struktur otak secara fisik, terutama pada amigdala dan korteks prefrontal','Penyembuhan trauma membutuhkan lebih dari sekadar berbicara — dibutuhkan keterlibatan tubuh','EMDR, yoga, dan theater memiliki dasar neurosains yang kuat untuk pemulihan trauma'], suitableFor:'Individu dalam proses pemulihan trauma, caregiver, praktisi kesehatan mental' },
  { id:'mindfulness-teens', emoji:'🌊', gradient:'linear-gradient(135deg,#D6EEFF,#7EC3F0)', title:'Mindfulness for Teens in 10 Minutes a Day', author:'Jennie Marie Battistin', year:2020, tags:['remaja'], agePill:'remaja', rating:4, pages:198, difficulty:'Mudah', synopsis:'Panduan praktis yang dirancang spesifik untuk otak remaja yang sedang berkembang. Menggunakan latihan singkat dan berbasis bukti yang bisa langsung diterapkan.', insights:['Teknik grounding 5 menit yang bisa mengurangi kecemasan','Mengapa otak remaja secara biologis lebih reaktif','Mindful scrolling: cara menggunakan media sosial tanpa kehilangan dirimu'], suitableFor:'Remaja 13–18 tahun, orang tua, konselor sekolah' },
  { id:'mans-meaning', emoji:'🌱', gradient:'linear-gradient(135deg,#DCFFF0,#3DB87A40)', title:"Man's Search for Meaning", author:'Viktor E. Frankl', year:1946, tags:['dewasa','lansia'], agePill:'dewasa', rating:5, pages:165, difficulty:'Mudah–Menengah', synopsis:'Mungkin buku psikologi paling berpengaruh sepanjang masa. Ditulis dari pengalaman nyata Frankl sebagai penyintas kamp konsentrasi Nazi, memperkenalkan Logotherapy.', insights:['Kita tidak bisa selalu memilih situasi, namun selalu bisa memilih respons kita','Makna bisa ditemukan bahkan dalam penderitaan','Kekosongan eksistensial adalah akar dari banyak gangguan psikologis modern'], suitableFor:'Semua dewasa, terutama yang sedang mencari arah atau menghadapi kehilangan besar' },
  { id:'feeling-good', emoji:'💜', gradient:'linear-gradient(135deg,#E8E4FF,#9B8FE4)', title:'Feeling Good: The New Mood Therapy', author:'David D. Burns', year:1980, tags:['dewasa','cbt'], agePill:'dewasa', rating:5, pages:736, difficulty:'Mudah', synopsis:'Buku self-help berbasis CBT yang paling banyak direkomendasikan oleh psikolog klinis. Burns memperkenalkan konsep "distorsi kognitif" dan teknik praktis untuk menantang pola pikir negatif.', insights:['10 distorsi kognitif paling umum dan cara mengenalinya','Teknik Triple Column untuk mengubah pola pikir negatif','Mengapa behavioral activation bekerja lebih cepat'], suitableFor:'Individu dengan depresi ringan–sedang, kecemasan' },
  { id:'atomic-habits', emoji:'⭐', gradient:'linear-gradient(135deg,#FFF9D6,#F0D070)', title:'Atomic Habits', author:'James Clear', year:2018, tags:['anak','remaja','dewasa','lansia','kebiasaan'], agePill:'umum', rating:4, pages:319, difficulty:'Mudah', synopsis:'Buku perubahan perilaku berbasis riset yang telah terjual 20 juta kopi. Clear menyintesis penelitian dari neurosains, psikologi perilaku, dan biologi evolusi.', insights:['Perubahan 1% yang konsisten menghasilkan dampak 37 kali lipat dalam setahun','Sistem lebih penting dari tujuan','4 Hukum Perubahan Perilaku: Terlihat, Menarik, Mudah, Memuaskan'], suitableFor:'Semua usia yang ingin membangun kebiasaan positif' },
  { id:'self-compassion', emoji:'🤗', gradient:'linear-gradient(135deg,#FFE8DC,#F0A882)', title:'Self-Compassion', author:'Kristin Neff', year:2011, tags:['remaja','dewasa'], agePill:'remaja', rating:5, pages:320, difficulty:'Mudah–Menengah', synopsis:'Kristin Neff menunjukkan bahwa belas kasih pada diri sendiri — bukan self-esteem tinggi — adalah kunci kesehatan mental yang sesungguhnya.', insights:['Self-compassion terdiri dari: self-kindness, common humanity, mindfulness','Inner critic adalah musuh diam-diam dari motivasi jangka panjang','Praktik self-compassion konkret yang bisa dilakukan dalam 10 menit sehari'], suitableFor:'Siapapun yang berjuang dengan perfeksionisme atau self-criticism berlebihan' },
  { id:'aku-berani', emoji:'🦁', gradient:'linear-gradient(135deg,#DCFFF0,#6FDDB0)', title:'Aku Berani!', author:'Tim Lentera Jiwa', year:2024, tags:['anak'], agePill:'anak', rating:5, pages:48, difficulty:'Mudah', synopsis:'Buku anak bergambar yang membantu si kecil memahami dan mengekspresikan perasaannya dengan cara yang menyenangkan.', insights:['Mengenal 8 emosi dasar melalui cerita dan ilustrasi','Teknik napas dan grounding untuk anak usia 6–12 tahun','Cara berbicara tentang perasaan kepada orang tua'], suitableFor:'Anak usia 6–12 tahun, orang tua, dan guru SD' },
  { id:'memeluk-senja', emoji:'🌸', gradient:'linear-gradient(135deg,#FFE8DC,#F0A882)', title:'Memeluk Usia Senja', author:'Tim Lentera Jiwa', year:2024, tags:['lansia'], agePill:'lansia', rating:4, pages:240, difficulty:'Mudah', synopsis:'Panduan psikologi penuaan yang sehat — membantu lansia dan keluarganya menemukan makna di tahap kehidupan ini.', insights:['Teori Erikson: integritas vs keputusasaan di usia lanjut','Harvard Study: hubungan sosial adalah perlindungan terkuat kesehatan lansia','Latihan mindfulness yang disesuaikan untuk lansia'], suitableFor:'Lansia 60+ tahun, caregiver, dan keluarga' },
  { id:'dbt-workbook', emoji:'🎯', gradient:'linear-gradient(135deg,#E8E4FF,#C4BEFF)', title:'The DBT Skills Workbook', author:'Matthew McKay, Jeffrey Wood', year:2019, tags:['dewasa','cbt'], agePill:'dewasa', rating:4, pages:456, difficulty:'Menengah', synopsis:'Panduan praktis Dialectical Behavior Therapy (DBT) dalam format workbook interaktif untuk regulasi emosi.', insights:['4 modul DBT: Mindfulness, Regulasi Emosi, Toleransi Distres, Efektivitas Interpersonal','Latihan harian yang terstruktur','Berbasis riset klinis'], suitableFor:'Individu dengan kesulitan regulasi emosi' },
  { id:'quiet', emoji:'🔇', gradient:'linear-gradient(135deg,#D6EEFF,#B5D4F4)', title:'Quiet: The Power of Introverts', author:'Susan Cain', year:2012, tags:['remaja','dewasa'], agePill:'dewasa', rating:5, pages:333, difficulty:'Mudah', synopsis:'Susan Cain memberikan pemahaman mendalam tentang introversi dan bagaimana dunia yang memuja ekstroversi sering salah menilai kekuatan kaum introvert.', insights:['Introversi bukan kelemahan sosial — melainkan gaya berpikir yang berbeda','Bagaimana sistem sekolah dan kerja merugikan introvert','Strategi untuk introvert berkembang di dunia yang berisik'], suitableFor:'Introvert dari semua usia, orang tua, dan manajer' },
  { id:'burnout', emoji:'🔥', gradient:'linear-gradient(135deg,#FFE8DC,#E88B6A40)', title:'Burnout: The Secret to Unlocking the Stress Cycle', author:'Emily & Amelia Nagoski', year:2019, tags:['dewasa'], agePill:'dewasa', rating:4, pages:320, difficulty:'Mudah', synopsis:'Nagoski bersaudara menjelaskan ilmu di balik stres dan mengapa "menyelesaikan" pekerjaan tidak sama dengan "menyelesaikan" siklus stres.', insights:['Perbedaan antara stresor dan respons stres','Cara mengakhiri siklus stres: olahraga, kreativitas, koneksi','Human Giver Syndrome'], suitableFor:'Dewasa yang mengalami kelelahan kronis, caregiver' },
  { id:'no-bad-kids', emoji:'🌈', gradient:'linear-gradient(135deg,#DCFFF0,#A8F0CC)', title:'No Bad Kids: Toddler Discipline Without Shame', author:'Janet Lansbury', year:2014, tags:['anak','dewasa'], agePill:'anak', rating:4, pages:192, difficulty:'Mudah', synopsis:'Panduan pengasuhan berbasis RIE yang menghormati anak sebagai individu penuh. Membantu orang tua memahami perilaku anak tanpa labeling.', insights:['Semua perilaku anak adalah komunikasi — tidak ada anak "nakal"','Cara menetapkan batasan yang tegas tanpa merusak hubungan','Perbedaan antara hukuman dan konsekuensi yang mendidik'], suitableFor:'Orang tua dengan anak usia 1–6 tahun, pendidik' },
];

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    filterBtns.forEach(function(b) {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed','false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed','true');
    applyFilter(btn.dataset.filter);
  });
});

function applyFilter(filter) {
  const searchInput = document.getElementById('search-input');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  let count = 0;
  document.querySelectorAll('.book-card').forEach(function(card) {
    const tags = card.dataset.tags || '';
    const matchFilter = filter === 'semua' || tags.includes(filter);
    const matchSearch = !query || card.dataset.searchable.includes(query);
    if (matchFilter && matchSearch) { card.classList.remove('is-hidden'); count++; }
    else card.classList.add('is-hidden');
  });
  const searchCount = document.getElementById('search-count');
  if (searchCount) searchCount.textContent = count + ' buku';
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.style.display = count === 0 ? 'block' : 'none';
}

const searchInputEl = document.getElementById('search-input');
if (searchInputEl) {
  searchInputEl.addEventListener('input', function() {
    const activeBtn = document.querySelector('.filter-btn.is-active');
    applyFilter(activeBtn ? activeBtn.dataset.filter : 'semua');
  });
}

const BookManager = {
  renderAll() {
    const grid = document.getElementById('book-grid');
    if (!grid) return;
    grid.innerHTML = '';

    /* DocumentFragment untuk batch DOM insert */
    const fragment = document.createDocumentFragment();

    BOOKS.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.dataset.bookId     = book.id;
      card.dataset.tags       = book.tags.join(' ');
      card.dataset.searchable = (book.title + ' ' + book.author + ' ' + book.tags.join(' ')).toLowerCase();
      card.setAttribute('role','listitem');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label', book.title + ' oleh ' + book.author);
      card.innerHTML =
        '<div class="book-cover" style="background:' + book.gradient + ';">' +
          book.emoji +
          '<div class="book-cover-shine"></div>' +
        '</div>' +
        '<div class="buku-info">' +
          '<div class="buku-title-text">' + book.title + '</div>' +
          '<div class="buku-author-text">' + book.author + '</div>' +
          '<div class="book-tags">' +
            '<span class="age-pill ' + book.agePill + '" style="font-size:10px;padding:2px 8px;">' +
              (book.agePill === 'umum' ? 'Semua Usia' : book.agePill.charAt(0).toUpperCase() + book.agePill.slice(1)) +
            '</span>' +
            (book.year ? '<span style="font-size:10px;font-weight:600;color:var(--text-muted);">' + book.year + '</span>' : '') +
          '</div>' +
        '</div>';
      card.addEventListener('click', () => this.openDetail(book));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openDetail(book);
        }
      });
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    const searchCount = document.getElementById('search-count');
    if (searchCount) searchCount.textContent = BOOKS.length + ' buku';
  },

  openDetail(book) {
    const overlay = document.getElementById('book-overlay');
    const drawer  = document.getElementById('book-drawer');
    const content = document.getElementById('book-detail-content');
    const tagEl   = document.getElementById('book-drawer-tag');

    if (!overlay || !drawer || !content) return;

    const stars = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
    if (tagEl) tagEl.textContent = book.tags[0].charAt(0).toUpperCase() + book.tags[0].slice(1);

    content.innerHTML =
      '<div class="book-detail-cover" style="background:' + book.gradient + ';">' + book.emoji + '</div>' +
      '<div class="book-detail-title">' + book.title + '</div>' +
      '<div class="book-detail-author">' + book.author + '</div>' +
      '<div class="book-meta-row">' +
        '<span class="age-pill ' + book.agePill + '" style="font-size:11px;">' + (book.agePill === 'umum' ? 'Semua Usia' : book.agePill.charAt(0).toUpperCase() + book.agePill.slice(1)) + '</span>' +
        '<span class="book-meta-chip">📖 ' + book.pages + ' hlm</span>' +
        '<span class="book-meta-chip">🎓 ' + book.difficulty + '</span>' +
        '<span class="book-meta-chip">📅 ' + book.year + '</span>' +
      '</div>' +
      '<div style="margin-bottom:20px;"><span class="star-rating" aria-label="Rating ' + book.rating + ' dari 5">' + stars + '</span><span style="font-size:12px;color:var(--text-muted);margin-left:8px;font-weight:600;">Rekomendasi Tim Klinis</span></div>' +
      '<div class="book-section-title">Sinopsis</div>' +
      '<p class="book-synopsis">' + book.synopsis + '</p>' +
      '<div class="book-section-title">Poin Kunci</div>' +
      '<ul class="key-insight-list" role="list">' + book.insights.map(i => '<li>' + i + '</li>').join('') + '</ul>' +
      '<div class="suitable-for"><strong>🎯 Cocok untuk</strong>' + book.suitableFor + '</div>' +
      '<a href="layanan.html" class="btn btn-primary btn-md w-full btn-ripple" style="justify-content:center;margin-top:8px;">Diskusikan dengan Psikolog ✨</a>';

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const title = content.querySelector('.book-detail-title');
      if (title) { title.setAttribute('tabindex','-1'); title.focus(); }
    }, 520);
  },

  closeDetail() {
    const overlay = document.getElementById('book-overlay');
    const drawer  = document.getElementById('book-drawer');
    if (overlay) { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); }
    if (drawer)  { drawer.classList.remove('is-open');  drawer.setAttribute('aria-hidden','true'); }
    document.body.style.overflow = '';
  }
};

const bookCloseBtn = document.getElementById('book-close');
const bookOverlay  = document.getElementById('book-overlay');
if (bookCloseBtn) bookCloseBtn.addEventListener('click', () => BookManager.closeDetail());
if (bookOverlay)  bookOverlay.addEventListener('click',  () => BookManager.closeDetail());

document.addEventListener('keydown', function handleBookEsc(e) {
  if (e.key === 'Escape') BookManager.closeDetail();
});

BookManager.renderAll();

window.BookManager = BookManager;

})();