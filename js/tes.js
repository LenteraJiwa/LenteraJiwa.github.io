/* ============================================================
   LENTERA JIWA — tes.js
   Kuis refleksi diri (bukan diagnosis, belum divalidasi secara
   psikometrik). Butir soal ditulis sendiri, terinspirasi konsep
   WHO-5 & PERMA, teori Big Five, serta konsep burnout & stres.
   Jangan menambahkan klaim reliabilitas/validitas tanpa studi.
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════
   BAGIAN I — DATA INSTRUMEN LENGKAP
   ══════════════════════════════════════════════════════════ */

/* ── 1. WELLBEING EMOSIONAL (20 Pertanyaan) ─────────────── */
const WELLBEING_QUESTIONS = [
  /* DIMENSI: positive_emotion */
  {
    id: 1, dimension: 'positive_emotion',
    text: 'Dalam dua minggu terakhir, seberapa sering kamu merasa optimis tentang masa depan?',
    options: ['Tidak pernah', 'Beberapa hari', 'Lebih dari separuh waktu', 'Hampir setiap hari'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 2, dimension: 'positive_emotion',
    text: 'Seberapa sering kamu merasa tenang dan damai dalam dua minggu terakhir?',
    options: ['Tidak pernah', 'Beberapa hari', 'Lebih dari separuh waktu', 'Hampir setiap hari'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 3, dimension: 'positive_emotion',
    text: 'Seberapa sering kamu merasa penuh energi dan vitalitas?',
    options: ['Tidak pernah', 'Beberapa hari', 'Lebih dari separuh waktu', 'Hampir setiap hari'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  /* DIMENSI: engagement */
  {
    id: 4, dimension: 'engagement',
    text: 'Seberapa sering kamu merasa benar-benar terlibat dan hadir dalam aktivitas sehari-harimu?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 5, dimension: 'engagement',
    text: 'Apakah kamu masih bisa menikmati hal-hal yang biasanya menyenangkan bagimu?',
    options: ['Tidak sama sekali', 'Sedikit', 'Cukup', 'Seperti biasanya'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 6, dimension: 'engagement',
    text: 'Seberapa sering pikiranmu terasa "kosong" atau sulit fokus tanpa sebab yang jelas?',
    options: ['Hampir tidak pernah', 'Beberapa kali', 'Cukup sering', 'Hampir setiap hari'],
    scores: [3, 2, 1, 0], reverse: true,
  },
  /* DIMENSI: relationships */
  {
    id: 7, dimension: 'relationships',
    text: 'Apakah kamu merasa ada orang yang bisa kamu andalkan saat menghadapi masa sulit?',
    options: ['Tidak ada', 'Mungkin ada', 'Ada', 'Pasti ada'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 8, dimension: 'relationships',
    text: 'Seberapa terhubung kamu merasa dengan orang-orang di sekitarmu belakangan ini?',
    options: ['Sangat terisolasi', 'Cukup terisolasi', 'Cukup terhubung', 'Sangat terhubung'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 9, dimension: 'relationships',
    text: 'Seberapa sering kamu menarik diri dari interaksi sosial yang biasanya kamu nikmati?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [3, 2, 1, 0], reverse: true,
  },
  /* DIMENSI: meaning */
  {
    id: 10, dimension: 'meaning',
    text: 'Seberapa jelas tujuan hidupmu terasa saat ini?',
    options: ['Sangat tidak jelas', 'Agak kabur', 'Cukup jelas', 'Sangat jelas'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 11, dimension: 'meaning',
    text: 'Apakah aktivitas harianmu terasa bermakna dan bernilai?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  /* DIMENSI: accomplishment */
  {
    id: 12, dimension: 'accomplishment',
    text: 'Seberapa percaya diri kamu dalam menghadapi tantangan baru?',
    options: ['Tidak percaya diri sama sekali', 'Kurang percaya diri', 'Cukup percaya diri', 'Sangat percaya diri'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 13, dimension: 'accomplishment',
    text: 'Apakah kamu merasa perkembangan dirimu bergerak ke arah yang kamu inginkan?',
    options: ['Tidak sama sekali', 'Sedikit', 'Cukup', 'Sangat ya'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  /* DIMENSI: negative_affect */
  {
    id: 14, dimension: 'negative_affect',
    text: 'Seberapa sering kamu merasa sedih atau hampa tanpa tahu alasannya?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Hampir setiap hari'],
    scores: [3, 2, 1, 0], reverse: true,
  },
  {
    id: 15, dimension: 'negative_affect',
    text: 'Seberapa sering pikiran negatif tentang dirimu sendiri muncul berulang-ulang?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Hampir setiap hari'],
    scores: [3, 2, 1, 0], reverse: true,
  },
  {
    id: 16, dimension: 'negative_affect',
    text: 'Apakah kamu mengalami perubahan pola tidur yang mengganggu (terlalu banyak atau terlalu sedikit)?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Hampir setiap hari'],
    scores: [3, 2, 1, 0], reverse: true,
  },
  /* DIMENSI: resilience */
  {
    id: 17, dimension: 'resilience',
    text: 'Ketika sesuatu yang buruk terjadi, seberapa cepat kamu biasanya bisa bangkit kembali?',
    options: ['Sangat lambat / Belum bisa', 'Cukup lambat', 'Cukup cepat', 'Relatif cepat'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 18, dimension: 'resilience',
    text: 'Apakah kamu punya strategi atau cara yang efektif untuk mengelola stresmu?',
    options: ['Tidak punya', 'Kurang efektif', 'Cukup efektif', 'Sangat efektif'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  /* DIMENSI: physical_mental */
  {
    id: 19, dimension: 'physical_mental',
    text: 'Seberapa baik kamu merawat kebutuhan fisik dasarmu (tidur cukup, makan teratur, bergerak)?',
    options: ['Sangat tidak baik', 'Kurang baik', 'Cukup baik', 'Sangat baik'],
    scores: [0, 1, 2, 3], reverse: false,
  },
  {
    id: 20, dimension: 'physical_mental',
    text: 'Apakah kamu pernah merasa bahwa kondisi fisikmu berdampak besar pada suasana hatimu?',
    options: ['Tidak pernah memperhatikan', 'Kadang-kadang', 'Sering sekali', 'Hampir selalu'],
    scores: [0, 1, 2, 3], reverse: false,
    informational: true, /* Tidak masuk skor total — dipakai untuk rekomendasi kontekstual */
  },
];

/* ── 2. STRES & BURNOUT (15 Pertanyaan) ──────────────────── */
const STRES_QUESTIONS = [
  /* SUBDIMENSI: exhaustion */
  {
    id: 1, subdimension: 'exhaustion',
    text: 'Seberapa sering kamu merasa kehabisan energi secara emosional dari pekerjaanmu?',
    options: ['Tidak pernah', 'Beberapa kali setahun', 'Setiap bulan', 'Beberapa kali seminggu'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 2, subdimension: 'exhaustion',
    text: 'Apakah kamu merasa kelelahan saat bangun pagi dan harus menghadapi hari kerja baru?',
    options: ['Tidak pernah', 'Kadang-kadang', 'Sering', 'Setiap hari'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 3, subdimension: 'exhaustion',
    text: 'Seberapa sering bekerja seharian terasa sangat melelahkan bagimu?',
    options: ['Tidak pernah', 'Beberapa kali setahun', 'Beberapa kali sebulan', 'Setiap minggu'],
    scores: [0, 1, 2, 3],
  },
  /* SUBDIMENSI: cynicism */
  {
    id: 4, subdimension: 'cynicism',
    text: 'Apakah kamu merasakan semakin kurang peduli dengan pekerjaanmu dibanding sebelumnya?',
    options: ['Tidak sama sekali', 'Sedikit', 'Cukup', 'Sangat ya'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 5, subdimension: 'cynicism',
    text: 'Seberapa sering kamu meragukan apakah pekerjaanmu memberi dampak atau nilai apapun?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 6, subdimension: 'cynicism',
    text: 'Apakah kamu merasa sulit untuk antusias tentang pekerjaanmu?',
    options: ['Tidak', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [0, 1, 2, 3],
  },
  /* SUBDIMENSI: perceived_stress */
  {
    id: 7, subdimension: 'perceived_stress',
    text: 'Seberapa sering dalam sebulan terakhir kamu merasa tidak mampu mengendalikan hal-hal penting dalam hidupmu?',
    options: ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Sering'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 8, subdimension: 'perceived_stress',
    text: 'Seberapa sering kamu merasa kesulitan menghadapi semua hal yang harus kamu lakukan?',
    options: ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Sering'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 9, subdimension: 'perceived_stress',
    text: 'Seberapa sering kamu bisa mengelola iritasi dalam kehidupan sehari-hari dengan efektif?',
    options: ['Hampir selalu', 'Sering', 'Kadang-kadang', 'Hampir tidak pernah'],
    scores: [0, 1, 2, 3], reverse: true,
  },
  /* SUBDIMENSI: physical */
  {
    id: 10, subdimension: 'physical',
    text: 'Apakah kamu mengalami gejala fisik berulang yang mungkin berkaitan dengan stres? (sakit kepala, gangguan perut, nyeri otot)',
    options: ['Tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir setiap minggu'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 11, subdimension: 'physical',
    text: 'Seberapa sering kualitas tidurmu terganggu karena pikiran tentang pekerjaan atau tanggung jawab?',
    options: ['Hampir tidak pernah', 'Beberapa kali sebulan', 'Beberapa kali seminggu', 'Hampir setiap malam'],
    scores: [0, 1, 2, 3],
  },
  /* SUBDIMENSI: recovery */
  {
    id: 12, subdimension: 'recovery',
    text: 'Seberapa sulit bagimu untuk "melepaskan diri" dari pekerjaan saat hari libur atau waktu luang?',
    options: ['Mudah', 'Kadang sulit', 'Sering sulit', 'Hampir tidak pernah bisa'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 13, subdimension: 'recovery',
    text: 'Apakah kamu merasa sudah punya batasan yang cukup sehat antara pekerjaan dan kehidupan pribadi?',
    options: ['Ya, sangat sehat', 'Cukup sehat', 'Kurang sehat', 'Tidak ada batas sama sekali'],
    scores: [0, 1, 2, 3], reverse: true,
  },
  /* SUBDIMENSI: self_efficacy */
  {
    id: 14, subdimension: 'self_efficacy',
    text: 'Seberapa sering kamu meragukan kemampuanmu untuk menghadapi tantangan yang ada?',
    options: ['Hampir tidak pernah', 'Kadang-kadang', 'Sering', 'Hampir selalu'],
    scores: [0, 1, 2, 3],
  },
  {
    id: 15, subdimension: 'self_efficacy',
    text: 'Apakah kamu merasa cukup efektif dalam mencapai hal-hal yang penting bagimu?',
    options: ['Sangat efektif', 'Cukup efektif', 'Kurang efektif', 'Tidak efektif sama sekali'],
    scores: [0, 1, 2, 3], reverse: true,
  },
];

/* ── 3. PROFIL KEPRIBADIAN — BIG FIVE (30 Pertanyaan) ────── */
const KEPRIBADIAN_QUESTIONS = [
  /* OPENNESS (6 items) */
  { id: 1,  trait: 'O', text: 'Saya suka mengeksplorasi ide-ide baru, bahkan yang tidak praktis sekalipun.',       options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 2,  trait: 'O', text: 'Saya menikmati seni, musik, atau karya kreatif yang tidak biasa.',                   options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 3,  trait: 'O', text: 'Saya lebih suka rutinitas yang terprediksi daripada pengalaman baru.',               options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 4,  trait: 'O', text: 'Saya senang merenungkan pertanyaan-pertanyaan filosofis atau abstrak.',               options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 5,  trait: 'O', text: 'Saya mudah terinspirasi oleh pengalaman estetik (keindahan alam, karya seni, musik).', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 6,  trait: 'O', text: 'Imajinasi dan kreativitas adalah bagian penting dari cara saya berpikir.',            options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  /* CONSCIENTIOUSNESS (6 items) */
  { id: 7,  trait: 'C', text: 'Saya cenderung membuat rencana terperinci sebelum memulai sesuatu.',                  options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 8,  trait: 'C', text: 'Saya biasanya menyelesaikan tugas tepat waktu atau lebih awal.',                      options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 9,  trait: 'C', text: 'Saya mudah teralihkan dan kesulitan menyelesaikan apa yang sudah dimulai.',           options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 10, trait: 'C', text: 'Saya memperhatikan detail dan ingin memastikan segalanya dilakukan dengan benar.',    options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 11, trait: 'C', text: 'Saya cenderung menjaga lingkungan sekitar saya tetap teratur dan rapi.',               options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 12, trait: 'C', text: 'Saya lebih mengandalkan intuisi daripada perencanaan yang matang.',                   options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  /* EXTRAVERSION (6 items) */
  { id: 13, trait: 'E', text: 'Saya merasa energi bertambah setelah berinteraksi dengan banyak orang.',               options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 14, trait: 'E', text: 'Saya biasanya menjadi pusat perhatian dalam pertemuan sosial.',                        options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 15, trait: 'E', text: 'Saya lebih suka menghabiskan waktu sendirian daripada dalam kelompok besar.',          options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 16, trait: 'E', text: 'Saya mudah memulai percakapan dengan orang yang baru saya kenal.',                     options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 17, trait: 'E', text: 'Saya menikmati suasana ramai dan penuh aktivitas.',                                    options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 18, trait: 'E', text: 'Setelah acara sosial yang panjang, saya merasa butuh waktu sendiri untuk memulihkan diri.', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  /* AGREEABLENESS (6 items) */
  { id: 19, trait: 'A', text: 'Saya cenderung mementingkan kepentingan orang lain, bahkan di atas kepentingan sendiri.', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 20, trait: 'A', text: 'Saya mudah merasa empati dan ikut merasakan perasaan orang lain.',                     options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 21, trait: 'A', text: 'Saya sering tidak setuju dengan orang lain dan tidak segan untuk mengatakan demikian.', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 22, trait: 'A', text: 'Saya percaya bahwa pada dasarnya orang-orang memiliki niat baik.',                     options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 23, trait: 'A', text: 'Saya lebih suka bekerja sama daripada berkompetisi.',                                  options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 24, trait: 'A', text: 'Saya bisa dengan mudah melihat sisi baik dari orang yang berbeda pendapat dengan saya.', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  /* NEUROTICISM (6 items) */
  { id: 25, trait: 'N', text: 'Saya cenderung mudah merasa cemas atau khawatir tentang berbagai hal.',                options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 26, trait: 'N', text: 'Suasana hati saya bisa berubah dengan cukup cepat.',                                   options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 27, trait: 'N', text: 'Saya biasanya tetap tenang dalam situasi yang menekan.',                               options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 28, trait: 'N', text: 'Saya mudah merasa kewalahan ketika terlalu banyak hal yang harus ditangani sekaligus.', options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
  { id: 29, trait: 'N', text: 'Saya jarang merasa sedih atau tertekan tanpa alasan yang jelas.',                      options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [4,3,2,1,0], reverse: true },
  { id: 30, trait: 'N', text: 'Kritik atau penolakan cenderung sangat mempengaruhi perasaan saya.',                   options: ['Sangat tidak setuju','Tidak setuju','Netral','Setuju','Sangat setuju'], scores: [0,1,2,3,4] },
];

/* ══════════════════════════════════════════════════════════
   BAGIAN II — INTERPRETASI & SCORING RUBRICS
   ══════════════════════════════════════════════════════════ */

const WELLBEING_INTERPRETATION = {
  /*
   * Skor total max = 57 (item 20 bersifat informatif, tidak dihitung)
   * Item ke-20 berkontribusi 0 pada total, max scoring = 19 items × 3 = 57
   */
  ranges: [
    {
      min: 44, max: 57,
      level: 'Flourishing',
      color: '#3DB87A',
      headline: 'Kesejahteraan Emosionalmu Kuat',
      desc: 'Kamu menunjukkan tanda-tanda wellbeing yang solid — mampu mengelola emosi, menjaga hubungan, dan menemukan makna dalam aktivitas sehari-hari. Pertahankan kebiasaan positifmu.',
      recommendation: 'Eksplorasi materi pengembangan diri tingkat lanjut di perpustakaan kami.',
      cta: 'Eksplorasi Materi Pengembangan Diri →',
      ctaHref: 'perpustakaan.html',
    },
    {
      min: 30, max: 43,
      level: 'Moderate Wellbeing',
      color: '#D4A92A',
      headline: 'Ada Ruang untuk Tumbuh',
      desc: 'Secara keseluruhan kamu cukup baik, namun ada beberapa area yang menguras energi lebih dari yang seharusnya. Ini saat yang tepat untuk lebih memperhatikan kebutuhanmu.',
      recommendation: 'Artikel tentang stress management dan mindfulness bisa menjadi langkah awal yang baik.',
      cta: 'Pelajari Strategi Self-Care →',
      ctaHref: 'artikel.html',
    },
    {
      min: 15, max: 29,
      level: 'Struggling',
      color: '#E88B6A',
      headline: 'Kamu Sedang Menanggung Beban yang Berat',
      desc: 'Skormu menunjukkan bahwa kamu mungkin sedang berjuang lebih keras dari yang orang lain lihat. Kamu tidak harus menghadapi ini sendirian — berbicara dengan seseorang yang terlatih bisa sangat membantu.',
      recommendation: 'Konsultasi dengan psikolog kami adalah langkah konkret yang bisa kamu ambil hari ini.',
      cta: 'Bicarakan dengan Psikolog Kami →',
      ctaHref: 'layanan.html',
    },
    {
      min: 0, max: 14,
      level: 'At Risk',
      color: '#C0392B',
      headline: 'Penting untuk Mendapat Dukungan Segera',
      desc: 'Skor ini menunjukkan tingkat distres yang signifikan. Ini bukan kelemahan — ini sinyal bahwa sistem pendukungmu perlu diperkuat. Kami sangat menyarankan untuk berbicara dengan profesional.',
      recommendation: 'Hubungi psikolog kami sekarang. Sesi pertama bisa dilakukan dalam 24 jam.',
      cta: 'Jadwalkan Konsultasi Sekarang — Kami Siap 💜',
      ctaHref: 'layanan.html',
      urgent: true,
    },
  ],
};

const DIMENSION_INSIGHTS = {
  positive_emotion: {
    low:  'Emosi positif terasa langka belakangan ini. Ini bukan tentang "berpikir positif" — melainkan tentang membangun momen kecil yang memberikan kesenangan nyata.',
    high: 'Kamu mampu merasakan dan menghargai emosi positif dengan baik. Ini adalah aset kesehatan mental yang kuat.',
  },
  engagement: {
    low:  'Perasaan "kosong" atau "tidak hadir" yang kamu alami bisa menjadi tanda bahwa energi mentalmu sangat terkuras. Istirahat yang berkualitas menjadi prioritas.',
    high: 'Kemampuanmu untuk hadir dan terlibat dalam aktivitas adalah fondasi produktivitas dan kepuasan hidup yang sehat.',
  },
  relationships: {
    low:  'Koneksi sosial adalah kebutuhan biologis manusia, bukan sekadar kesenangan. Membangun satu hubungan yang dalam lebih berharga dari banyak koneksi dangkal.',
    high: 'Jaringan dukungan sosialmu terlihat cukup kuat — ini adalah salah satu perlindungan terbaik terhadap stres kronis.',
  },
  meaning: {
    low:  'Kehilangan rasa makna sering mendahului atau menyertai depresi dan burnout. Ini perlu diperhatikan serius — eksplorasi nilai-nilai dan tujuan jangka panjangmu.',
    high: 'Rasa makna yang kuat dalam hidupmu adalah prediktor kuat dari resiliensi dan kepuasan jangka panjang.',
  },
  /* Skor dimensi ini dibalik: makin tinggi = makin JARANG sedih/hampa/
     pikiran negatif. Karena itu label tampilannya "Bebas Emosi Negatif". */
  negative_affect: {
    low:  'Kamu cukup sering mengalami perasaan sedih, hampa, atau pikiran negatif tentang diri sendiri. Ini cukup signifikan — kami menyarankan untuk mempertimbangkan berbicara dengan profesional.',
    high: 'Emosi negatif yang kamu alami masih dalam rentang yang bisa dikelola dengan strategi self-care yang tepat.',
  },
  accomplishment: {
    low:  'Kepercayaan diri dan rasa berkembangmu sedang rendah. Mulailah dari target kecil yang bisa dicapai minggu ini, lalu rayakan setiap kemajuan.',
    high: 'Kamu merasa mampu menghadapi tantangan dan melihat dirimu berkembang. Ini sumber motivasi yang kuat.',
  },
  physical_mental: {
    low:  'Kebutuhan dasar seperti tidur, makan teratur, dan bergerak sedang terabaikan. Merawat tubuh adalah langkah pertama merawat pikiran.',
    high: 'Kamu cukup baik merawat kebutuhan fisik dasarmu — fondasi penting untuk suasana hati yang stabil.',
  },
  resilience: {
    low:  'Resiliensi bukan karakter bawaan — ini adalah keterampilan yang bisa dipelajari dan diperkuat. Workshop dan konseling kami dirancang khusus untuk ini.',
    high: 'Kemampuan pulihmu terlihat cukup baik. Terus investasikan waktu dalam strategi coping yang sudah terbukti efektif untukmu.',
  },
};

const STRES_INTERPRETATION = {
  ranges: [
    {
      min: 0, max: 12,
      level: 'Stres Ringan',
      color: '#3DB87A',
      headline: 'Level Stresmu Masih Terkendali',
      desc: 'Kamu menunjukkan kemampuan coping yang baik. Beberapa tekanan mungkin ada, namun belum mengganggu fungsi harianmu secara signifikan. Jaga rutinitas recovery-mu.',
      next_steps: ['Pertahankan keseimbangan kerja-istirahat', 'Eksplorasi teknik mindfulness preventif', 'Gunakan artikel kami untuk memperkuat strategi stres managementmu'],
      cta: 'Eksplorasi Artikel Mindfulness →',
      ctaHref: 'artikel.html',
    },
    {
      min: 13, max: 26,
      level: 'Stres Moderat',
      color: '#D4A92A',
      headline: 'Tekanan Mulai Menumpuk',
      desc: 'Ada sinyal bahwa tanki energimu mulai menipis. Ini bukan alarm darurat, tapi undangan untuk lebih serius merawat dirimu sebelum berkembang lebih jauh.',
      next_steps: ['Prioritaskan tidur berkualitas sebagai intervensi utama', 'Tinjau kembali beban kerja dan prioritas', 'Pertimbangkan sesi konsultasi untuk mendapat strategi personal'],
      cta: 'Pelajari Strategi Recovery →',
      ctaHref: 'artikel.html',
    },
    {
      min: 27, max: 36,
      level: 'Burnout Moderat',
      color: '#E88B6A',
      headline: 'Tanda-tanda Burnout Terdeteksi',
      desc: 'Skor ini menunjukkan pola kelelahan yang sudah cukup dalam. Burnout bukan sekadar lelah — ia adalah kondisi yang perlu ditangani dengan strategi yang tepat dan dukungan yang memadai.',
      next_steps: ['Bicarakan kondisimu dengan psikolog dalam waktu dekat', 'Evaluasi apakah ada perubahan struktural yang perlu dilakukan', 'Gunakan teknik boundary-setting dan recovery aktif'],
      cta: 'Bicara dengan Psikolog Kami →',
      ctaHref: 'layanan.html',
    },
    {
      min: 37, max: 45,
      level: 'Burnout Berat',
      color: '#C0392B',
      headline: 'Burnout yang Membutuhkan Perhatian Serius',
      desc: 'Tingkat kelelahan yang kamu laporkan sudah dalam kategori serius. Ini bukan tentang "lebih keras berusaha" — justru sebaliknya, ini tentang berhenti sejenak dan mendapatkan dukungan yang tepat.',
      next_steps: ['Hubungi psikolog atau konselor profesional', 'Bicarakan kondisimu dengan orang terdekat atau supervisor', 'Pertimbangkan medical leave jika kondisi memungkinkan'],
      cta: 'Hubungi Psikolog Sekarang 💜',
      ctaHref: 'layanan.html',
      urgent: true,
    },
  ],
};

const PERSONALITY_TRAITS = {
  O: {
    name: 'Keterbukaan terhadap Pengalaman',
    thresholds: { low: 8, high: 15 }, /* dari max 24 */
    low:  { label: 'Konvensional & Praktis', desc: 'Kamu cenderung lebih suka hal-hal yang familiar, terstruktur, dan terbukti. Kamu adalah pemikir konkret yang menghargai tradisi dan kepastian.' },
    mid:  { label: 'Seimbang & Adaptif',     desc: 'Kamu memiliki keseimbangan antara kreativitas dan pragmatisme — bisa menikmati ide baru namun tetap menghargai struktur.' },
    high: { label: 'Kreatif & Eksploratif',  desc: 'Kamu memiliki rasa ingin tahu yang besar, terbuka pada perspektif baru, dan menikmati kedalaman intelektual. Kreativitas adalah nafasmu.' },
  },
  C: {
    name: 'Ketelitian',
    thresholds: { low: 8, high: 15 },
    low:  { label: 'Fleksibel & Spontan',    desc: 'Kamu lebih suka fleksibilitas daripada rencana kaku. Kamu bekerja baik dalam kondisi yang membutuhkan adaptasi cepat.' },
    mid:  { label: 'Terorganisir & Adaptif', desc: 'Kamu bisa terorganisir saat dibutuhkan, namun tidak kaku. Keseimbangan ini memberimu fleksibilitas yang sehat.' },
    high: { label: 'Disiplin & Terencana',   desc: 'Kamu sangat dapat diandalkan, detail-oriented, dan memiliki standar tinggi untuk dirimu sendiri. Ketelitianmu adalah kekuatan besar.' },
  },
  E: {
    name: 'Ekstraversi',
    thresholds: { low: 8, high: 15 },
    low:  { label: 'Introvert & Reflektif',  desc: 'Kamu mendapatkan energi dari kesendirian dan refleksi mendalam. Kamu lebih suka percakapan bermakna daripada interaksi sosial luas.' },
    mid:  { label: 'Ambivert yang Luwes',    desc: 'Kamu nyaman baik dalam situasi sosial maupun waktu menyendiri. Kemampuan beradaptasi ini adalah aset sosial yang berharga.' },
    high: { label: 'Ekstrover & Ekspresif',  desc: 'Kamu mendapatkan energi dari orang lain, ekspresif, dan menikmati menjadi bagian dari dinamika sosial yang aktif.' },
  },
  A: {
    name: 'Keramahan',
    thresholds: { low: 8, high: 15 },
    low:  { label: 'Asertif & Independen',   desc: 'Kamu tidak mudah terpengaruh dan berani mengambil posisi yang berbeda. Ketegasan ini bisa menjadi kepemimpinan yang kuat jika diimbangi empati.' },
    mid:  { label: 'Kooperatif & Asertif',   desc: 'Kamu bisa berempati dan bekerja sama, namun juga tidak takut untuk menegakkan batasanmu.' },
    high: { label: 'Empatik & Kolaboratif',  desc: 'Kamu sangat peduli pada orang lain, kooperatif, dan menjadi perekat sosial dalam kelompok. Empatimu adalah hadiah bagi orang-orang di sekitarmu.' },
  },
  N: {
    name: 'Neurotisisme (Kepekaan Emosi)',
    thresholds: { low: 8, high: 15 },
    low:  { label: 'Stabil & Tangguh',       desc: 'Kamu cenderung tenang di bawah tekanan dan tidak mudah terguncang. Stabilitas emosionalmu membuat orang nyaman bersandar padamu.' },
    mid:  { label: 'Cukup Peka & Seimbang',  desc: 'Kamu memiliki sensitivitas emosional yang sehat — bisa merasakan dengan dalam namun tetap bisa mengelola diri.' },
    high: { label: 'Sensitif & Mendalam',    desc: 'Kamu merasakan emosi dengan intensitas tinggi — baik yang menyenangkan maupun yang menantang. Sensitivitasmu adalah kekuatan kreatif, namun perlu strategi regulasi yang baik.' },
  },
};

/* ══════════════════════════════════════════════════════════
   BAGIAN III — FUNGSI KALKULASI PSIKOMETRIK
   ══════════════════════════════════════════════════════════ */

/* Minimal proporsi soal (yang dihitung skornya) yang harus dijawab
   agar hasil boleh ditampilkan. Sebelumnya soal yang dilewati dihitung
   0, sehingga melewati semua soal memberi vonis "At Risk". */
const MIN_ANSWER_RATIO = 0.8;

function _isAnswered(a) { return a !== undefined && a !== null; }

/**
 * Hitung skor per soal. Soal yang dijawab memakai tabel scores[];
 * soal yang dilewati diisi rata-rata jawaban pengguna di kelompok
 * (dimensi/trait) yang sama, atau rata-rata keseluruhan bila satu
 * kelompok kosong. Soal informational diberi null.
 */
function _scoreItems(questions, answers, groupKey) {
  const raw = questions.map((q, i) =>
    q.informational ? null : (_isAnswered(answers[i]) ? q.scores[answers[i]] : undefined));
  const sums = {}, counts = {};
  let allSum = 0, allN = 0;
  questions.forEach((q, i) => {
    if (raw[i] === null || raw[i] === undefined) return;
    const g = q[groupKey];
    sums[g] = (sums[g] || 0) + raw[i];
    counts[g] = (counts[g] || 0) + 1;
    allSum += raw[i]; allN++;
  });
  const allMean = allN ? allSum / allN : 0;
  let answered = 0, scored = 0;
  const scores = questions.map((q, i) => {
    if (raw[i] === null) return null;
    scored++;
    if (raw[i] !== undefined) { answered++; return raw[i]; }
    const g = q[groupKey];
    return counts[g] ? sums[g] / counts[g] : allMean;
  });
  return { scores, answered, scored };
}

/**
 * checkCompleteness(tesId, answers)
 * @returns {{ ok, answered, required, total }}
 */
function checkCompleteness(tesId, answers) {
  const tes = TES_DATA[tesId];
  if (!tes) return { ok: false, answered: 0, required: 0, total: 0 };
  const scoredQs = tes.questions.filter(q => !q.informational);
  const answered = tes.questions.filter((q, i) => !q.informational && _isAnswered(answers[i])).length;
  const required = Math.ceil(scoredQs.length * MIN_ANSWER_RATIO);
  return { ok: answered >= required, answered, required, total: scoredQs.length };
}

/**
 * calculateWellbeingScore(answers)
 * @param {number[]} answers - Array 20 angka (index pilihan, 0-3)
 * @returns {{ total, maxTotal, percentile, result, dimensions }}
 *
 * CATATAN: Item 20 (index 19) bersifat informatif.
 * Score dihitung dari 19 item (max = 57).
 * Reverse-scored items ditangani via tabel scores[] masing-masing item.
 */
function calculateWellbeingScore(answers) {
  if (!Array.isArray(answers) || answers.length < 19) {
    throw new Error('Wellbeing membutuhkan minimal 19 jawaban.');
  }

  let total = 0;
  const dimScores = {};
  const scored = _scoreItems(WELLBEING_QUESTIONS, answers, 'dimension');

  WELLBEING_QUESTIONS.forEach((q, idx) => {
    /* Item 20 tidak masuk total */
    const score = scored.scores[idx];
    if (score === null) return;
    total += score;

    /* Akumulasi per dimensi */
    if (!dimScores[q.dimension]) dimScores[q.dimension] = 0;
    dimScores[q.dimension] += score;
  });

  /* Skor dibulatkan ke bilangan bulat agar cocok dengan rentang interpretasi */
  total = Math.round(total);

  /* Max per dimensi (untuk normalisasi) */
  const maxTotal = 57;
  const percentile = Math.round((total / maxTotal) * 100);

  /* Tentukan range interpretasi */
  const result = WELLBEING_INTERPRETATION.ranges.find(
    r => total >= r.min && total <= r.max
  ) || WELLBEING_INTERPRETATION.ranges[WELLBEING_INTERPRETATION.ranges.length - 1];

  /* Generate dimension insights */
  const dimensionReport = {};
  Object.keys(dimScores).forEach(dim => {
    const rawScore = dimScores[dim];
    const itemsInDim = WELLBEING_QUESTIONS.filter(q => q.dimension === dim && !q.informational).length;
    const maxDim = itemsInDim * 3;
    const dimPct = maxDim > 0 ? rawScore / maxDim : 0;

    const insight = DIMENSION_INSIGHTS[dim];
    if (insight) {
      dimensionReport[dim] = {
        score: rawScore,
        max: maxDim,
        pct: Math.round(dimPct * 100),
        insight: dimPct < 0.5 ? insight.low : insight.high,
      };
    }
  });

  return { total, maxTotal, percentile, result, dimensions: dimensionReport,
           answered: scored.answered, scoredItems: scored.scored };
}

/**
 * calculateStresScore(answers)
 * @param {number[]} answers - Array 15 angka (index pilihan, 0-3)
 * @returns {{ total, maxTotal, percentile, result, subdimensions }}
 * Max = 45
 */
function calculateStresScore(answers) {
  if (!Array.isArray(answers) || answers.length < 15) {
    throw new Error('Stres & Burnout membutuhkan 15 jawaban.');
  }

  let total = 0;
  const subScores = {};
  const scored = _scoreItems(STRES_QUESTIONS, answers, 'subdimension');

  STRES_QUESTIONS.forEach((q, idx) => {
    const score = scored.scores[idx];
    total += score;

    if (!subScores[q.subdimension]) subScores[q.subdimension] = 0;
    subScores[q.subdimension] += score;
  });

  total = Math.round(total);
  const maxTotal = 45;
  const percentile = Math.round((total / maxTotal) * 100);

  const result = STRES_INTERPRETATION.ranges.find(
    r => total >= r.min && total <= r.max
  ) || STRES_INTERPRETATION.ranges[STRES_INTERPRETATION.ranges.length - 1];

  /* ── Burnout Profile (MBI — evaluasi per dimensi, bukan total) ── */
  const maxExh  = 9; /* 3 soal × max 3 */
  const maxCyn  = 9;
  const exhRaw  = subScores['exhaustion']  || 0;
  const cynRaw  = subScores['cynicism']    || 0;
  const exhPct  = Math.round((exhRaw / maxExh) * 100);
  const cynPct  = Math.round((cynRaw / maxCyn) * 100);

  let burnoutProfile;
  if (exhPct >= 67 && cynPct >= 67) {
    burnoutProfile = {
      type:  'Burnout Penuh',
      color: '#C0392B',
      desc:  'Kamu mengalami kelelahan tinggi DAN sinisme tinggi — kombinasi paling kritis menurut Maslach. Keduanya perlu ditangani segera.',
    };
  } else if (exhPct >= 67 && cynPct < 67) {
    burnoutProfile = {
      type:  'Kelelahan Dominan',
      color: '#E88B6A',
      desc:  'Energimu terkuras habis, namun kamu masih peduli dengan pekerjaanmu. Istirahat terstruktur adalah prioritas utama sekarang.',
    };
  } else if (exhPct < 67 && cynPct >= 67) {
    burnoutProfile = {
      type:  'Sinisme Dominan',
      color: '#D4A92A',
      desc:  'Kamu masih punya energi fisik, namun koneksi emosional dengan pekerjaanmu sudah melemah signifikan. Ini sinyal awal burnout yang perlu diatasi.',
    };
  } else {
    burnoutProfile = {
      type:  'Tidak Ada Burnout Signifikan',
      color: '#3DB87A',
      desc:  'Skor kelelahan dan sinisme keduanya dalam batas sehat. Pertahankan keseimbangan yang sudah kamu bangun.',
    };
  }

  const burnoutDetail = {
    exhaustion: { raw: exhRaw, max: maxExh, pct: exhPct },
    cynicism:   { raw: cynRaw, max: maxCyn, pct: cynPct },
  };

  return { total, maxTotal, percentile, result, subdimensions: subScores, burnoutProfile, burnoutDetail,
           answered: scored.answered, scoredItems: scored.scored };
}

/**
 * calculateKepribadianScore(answers)
 * @param {number[]} answers - Array 30 angka (index pilihan, 0-4)
 * @returns {{ traits: { O, C, E, A, N }, profiles }}
 *
 * Skor per trait: 6 item × max 4 = 24 per trait
 * Interpretasi: low(<12) / mid(12-18) / high(>18)
 */
function calculateKepribadianScore(answers) {
  if (!Array.isArray(answers) || answers.length < 30) {
    throw new Error('Kepribadian membutuhkan 30 jawaban.');
  }

  const traitRaw = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const scored = _scoreItems(KEPRIBADIAN_QUESTIONS, answers, 'trait');

  KEPRIBADIAN_QUESTIONS.forEach((q, idx) => {
    traitRaw[q.trait] += scored.scores[idx];
  });

  const profiles = {};
  Object.keys(traitRaw).forEach(trait => {
    const raw = Math.round(traitRaw[trait] * 100) / 100;
    const meta = PERSONALITY_TRAITS[trait];
    const pct = Math.round((raw / 24) * 100);

    let level;
    if (raw < meta.thresholds.low)  level = meta.low;
    else if (raw > meta.thresholds.high) level = meta.high;
    else level = meta.mid;

    profiles[trait] = {
      name: meta.name,
      raw,
      max: 24,
      pct,
      label: level.label,
      desc: level.desc,
      tier: raw < meta.thresholds.low ? 'low' : (raw > meta.thresholds.high ? 'high' : 'mid'),
    };
  });

  return { traits: traitRaw, profiles, answered: scored.answered, scoredItems: scored.scored };
}

/* ══════════════════════════════════════════════════════════
   BAGIAN IV — TES DATA REGISTRY (untuk TesManager)
   ══════════════════════════════════════════════════════════ */

const TES_DATA = {
  wellbeing: {
    id: 'wellbeing',
    icon: '😌',
    title: 'Wellbeing Emosional',
    duration: '~10 menit',
    total: 20,
    questions: WELLBEING_QUESTIONS,
    calculate: calculateWellbeingScore,
    disclaimer: 'Kuis refleksi diri, terinspirasi konsep WHO-5 & PERMA. Belum divalidasi secara psikometrik.',
    basis: 'Terinspirasi konsep WHO-5 & PERMA (bukan instrumen aslinya)',
  },
  kepribadian: {
    id: 'kepribadian',
    icon: '🧠',
    title: 'Profil Kepribadian',
    duration: '~15 menit',
    total: 30,
    questions: KEPRIBADIAN_QUESTIONS,
    calculate: calculateKepribadianScore,
    disclaimer: 'Kuis refleksi diri, terinspirasi teori kepribadian Big Five. Belum divalidasi secara psikometrik.',
    basis: 'Terinspirasi teori Big Five (bukan instrumen aslinya)',
  },
  stres: {
    id: 'stres',
    icon: '🌿',
    title: 'Stres & Burnout',
    duration: '~8 menit',
    total: 15,
    questions: STRES_QUESTIONS,
    calculate: calculateStresScore,
    disclaimer: 'Kuis refleksi diri, terinspirasi konsep burnout & stres yang dirasakan. Belum divalidasi secara psikometrik.',
    basis: 'Terinspirasi konsep burnout & stres yang dirasakan (bukan instrumen aslinya)',
  },
};

/* ══════════════════════════════════════════════════════════
   BAGIAN V — TES MANAGER (UI Engine)
   ══════════════════════════════════════════════════════════ */

/* Panel di Beranda hanya CONTOH beberapa pertanyaan (jawaban tidak disimpan).
   Tes sungguhan ada di halaman Tes. */
const DEMO_N = 4;

const TesManager = {
  currentTes: null,
  currentQ:   0,
  answers:    [],
  mode:       'demo', /* 'demo' | 'full' */

  init() {
    this.initTesCards();
    // Beranda: panel contoh langsung aktif (dulu pilihan awal hanya berubah warna, tidak berjalan)
    const panel = document.getElementById('tes-demo-panel');
    const card = document.querySelector('.tes-card.is-active[data-tes-id]') || document.querySelector('.tes-card[data-tes-id]');
    if (panel && card) {
      this.currentTes = TES_DATA[card.getAttribute('data-tes-id')];
      this.currentQ = 0; this.answers = []; this._busy = false;
      if (this.currentTes) this._updateDemoPanelDOM(this.currentTes, this.currentTes.questions[0], 0);
    } else {
      this.initDemoOptions();
    }
  },

  /* ── Select test card ──────────────────────────────────── */
  initTesCards() {
    document.querySelectorAll('[data-tes-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-tes-id');
        this.selectTes(id, card);
      });
      // Enter / Spasi juga memilih kartu (sebelumnya hanya klik)
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectTes(card.getAttribute('data-tes-id'), card); }
      });
    });
  },

  selectTes(id, cardEl) {
    const tes = TES_DATA[id];
    if (!tes) return;

    this.currentTes = tes;
    this.currentQ   = 0;
    this.answers    = [];
    this.mode       = 'demo';

    /* Active state */
    document.querySelectorAll('[data-tes-id]').forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
    if (cardEl) { cardEl.classList.add('is-active'); cardEl.setAttribute('aria-pressed', 'true'); }
    this._busy = false;

    this.renderDemo(tes);
  },

  /* ── Demo panel render ─────────────────────────────────── */
  renderDemo(tes) {
    const panel = document.getElementById('tes-demo-panel');
    if (!panel) return;

    const q   = tes.questions[0];
    const pct = 0;

    /* Fade out → update → fade in */
    panel.style.opacity    = '0';
    panel.style.transform  = 'translateX(14px)';

    setTimeout(() => {
      this._updateDemoPanelDOM(tes, q, pct);
      panel.style.transition = 'opacity 0.35s ease, transform 0.35s var(--ease-smooth)';
      panel.style.opacity    = '1';
      panel.style.transform  = 'translateX(0)';
    }, 160);
  },

  _updateDemoPanelDOM(tes, q, pct) {
    const titleEl = document.getElementById('tes-demo-title');
    const pctEl   = document.getElementById('tes-demo-pct');
    const fillEl  = document.getElementById('tes-demo-fill');
    const qEl     = document.getElementById('tes-demo-q');
    const optsEl  = document.getElementById('tes-demo-opts');

    if (titleEl) titleEl.textContent = `${tes.icon} ${tes.title}`;
    if (pctEl)   pctEl.textContent   = `Contoh 1 dari ${DEMO_N}`;
    if (fillEl)  fillEl.style.width  = `${100 / DEMO_N}%`;
    if (qEl)     qEl.textContent     = `"${q.text}"`;
    const full = document.getElementById('tes-demo-full');
    if (full) full.textContent = `Mulai Tes Lengkap (${tes.total} soal) ✨`;

    if (optsEl) {
      optsEl.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = this._createOptionBtn(opt, i, optsEl);
        optsEl.appendChild(btn);
      });
    }
  },

  _createOptionBtn(text, idx, container) {
    const btn = document.createElement('button');
    btn.className  = 'tes-demo-option btn-ripple';
    btn.textContent = text;
    btn.setAttribute('aria-label', `Pilih: ${text}`);

    btn.addEventListener('click', () => {
      // Klik dua kali cepat tidak boleh melompati pertanyaan
      if (this._busy) return;
      this._busy = true;
      /* Deselect all */
      container.querySelectorAll('.tes-demo-option').forEach(b => {
        b.classList.remove('is-selected');
        b.style.opacity = '0.55';
      });
      btn.classList.add('is-selected');
      btn.style.opacity = '1';

      this.answers[this.currentQ] = idx;

      setTimeout(() => this.nextDemoQuestion(), 420);
    });

    return btn;
  },

  nextDemoQuestion() {
    const tes = this.currentTes;
    if (!tes) return;

    this.currentQ++;
    this._busy = false;

    if (this.currentQ >= tes.questions.length || this.currentQ >= DEMO_N) {
      /* Demo uses only first 4 questions, then prompts for full test */
      this.showDemoComplete();
      return;
    }

    const q   = tes.questions[this.currentQ];
    const pct = (this.currentQ / tes.total) * 100;

    this._animateQuestionChange(q, pct);
  },

  _animateQuestionChange(q, pct) {
    const fillEl = document.getElementById('tes-demo-fill');
    const pctEl  = document.getElementById('tes-demo-pct');
    const qEl    = document.getElementById('tes-demo-q');
    const optsEl = document.getElementById('tes-demo-opts');

    /* Fade out current question */
    if (qEl) {
      qEl.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      qEl.style.opacity    = '0';
      qEl.style.transform  = 'translateY(-10px)';
    }
    if (optsEl) optsEl.style.opacity = '0';

    setTimeout(() => {
      if (fillEl) fillEl.style.width = `${((this.currentQ + 1) / DEMO_N) * 100}%`;
      if (pctEl)  pctEl.textContent  = `Contoh ${this.currentQ + 1} dari ${DEMO_N}`;

      if (qEl) {
        qEl.textContent = `"${q.text}"`;
        qEl.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-smooth)';
        qEl.style.opacity    = '1';
        qEl.style.transform  = 'translateY(0)';
      }

      if (optsEl) {
        optsEl.innerHTML = '';
        q.options.forEach((opt, i) => {
          const btn     = this._createOptionBtn(opt, i, optsEl);
          btn.style.opacity   = '0';
          btn.style.transform = 'translateY(8px)';
          optsEl.appendChild(btn);

          setTimeout(() => {
            btn.style.transition = 'opacity 0.25s ease, transform 0.25s var(--ease-smooth), border-color 0.18s, background 0.18s';
            btn.style.opacity    = '1';
            btn.style.transform  = 'translateY(0)';
          }, i * 65 + 40);
        });
        optsEl.style.opacity = '1';
      }
    }, 230);
  },

  showDemoComplete() {
    const qEl    = document.getElementById('tes-demo-q');
    const optsEl = document.getElementById('tes-demo-opts');
    const fillEl = document.getElementById('tes-demo-fill');
    const pctEl  = document.getElementById('tes-demo-pct');

    if (fillEl) fillEl.style.width  = '100%';
    if (pctEl)  pctEl.textContent   = 'Contoh selesai ✓';
    const total = this.currentTes ? this.currentTes.total : '';

    if (qEl) {
      qEl.style.opacity = '0';
      setTimeout(() => {
        qEl.textContent = '';
        const em = document.createElement('em');
        em.textContent = `Itu tadi ${DEMO_N} pertanyaan contoh. Jawabanmu tidak disimpan dan tidak dinilai. Kerjakan tes lengkap (${total} soal) untuk melihat hasilmu.`;
        qEl.append(em);
        qEl.style.opacity = '1';
      }, 220);
    }

    if (optsEl) {
      optsEl.style.opacity = '0';
      setTimeout(() => {
        optsEl.innerHTML = '';
        optsEl.style.opacity = '1';
      }, 220);
    }
  },

  /* ── Init pre-rendered HTML demo options ───────────────── */
  initDemoOptions() {
    document.querySelectorAll('.tes-demo-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const container = btn.parentElement;
        container.querySelectorAll('.tes-demo-option').forEach(b => {
          b.classList.remove('is-selected');
          b.style.opacity = '0.55';
        });
        btn.classList.add('is-selected');
        btn.style.opacity = '1';
      });
    });
  },

  /* ── Public: run full test (to be used by tes.html) ────── */
  startFullTest(tesId) {
    const tes = TES_DATA[tesId];
    if (!tes) return;

    this.currentTes = tes;
    this.currentQ   = 0;
    this.answers    = new Array(tes.total).fill(null);
    this.mode       = 'full';

    document.dispatchEvent(new CustomEvent('lj:tes:start', {
      detail: { tes },
      bubbles: true,
    }));
  },

  submitAnswer(qIdx, optionIdx) {
    if (!this.currentTes) return;
    this.answers[qIdx] = optionIdx;
  },

  getResults() {
    const tes = this.currentTes;
    if (!tes) return null;

    const answeredCount = this.answers.filter(a => a !== null).length;
    const required = tes.id === 'kepribadian' ? 30 : (tes.id === 'stres' ? 15 : 19);

    if (answeredCount < required) {
      return { error: `Belum semua pertanyaan dijawab (${answeredCount}/${tes.total}).` };
    }

    try {
      const raw = tes.calculate(this.answers);
      return { tes: tes.id, ...raw };
    } catch (err) {
      return { error: err.message };
    }
  },
};

/* ── DOM READY ───────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TesManager.init());
} else {
  TesManager.init();
}

/* ── EXPORTS ─────────────────────────────────────────────── */
window.LJ = window.LJ || {};
Object.assign(window.LJ, {
  TesManager,
  TES_DATA,
  /* Expose scoring functions for tes.html full test page */
  calculateWellbeingScore,
  calculateStresScore,
  calculateKepribadianScore,
  checkCompleteness,
  MIN_ANSWER_RATIO,
  /* Raw question sets */
  WELLBEING_QUESTIONS,
  STRES_QUESTIONS,
  KEPRIBADIAN_QUESTIONS,
  /* Interpretation rubrics */
  WELLBEING_INTERPRETATION,
  STRES_INTERPRETATION,
  PERSONALITY_TRAITS,
  DIMENSION_INSIGHTS,
});