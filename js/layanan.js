'use strict';

/* ============================================================
   layanan.js (PERF v3.0 FIXED)
   PERBAIKAN: IIFE membungkus seluruh kode agar tidak ada
   identifier di global scope, dan event listener tidak menumpuk
   antar navigasi SPA.
   ============================================================ */

(function() {

  /* ── KEAMANAN: escape semua teks sebelum masuk innerHTML ──
     Data dari server (nama, username, pesan) bisa berisi HTML/JS
     buatan pengguna. Jangan pernah menyisipkannya mentah. */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── KESELAMATAN: deteksi pesan krisis ──
     Bila pesan mengandung tanda risiko bunuh diri / menyakiti diri,
     situs langsung menampilkan kartu bantuan dan TIDAK meneruskan
     pesan ke AI. Daftar ini sengaja luas: lebih baik kartu muncul
     berlebih daripada terlewat. */
  var CRISIS_PATTERNS = [
    /bunuh\s*diri/i, /akhiri\s*hidup/i, /mengakhiri\s*(hidup|nyawa)/i,
    /(ingin|pengen|pengin|mau|kepingin)\s*(mati|meninggal)/i,
    /lebih\s*baik\s*(aku|saya|gue|gw)?\s*mati/i,
    /(gak|ga|nggak|enggak|tidak|tak)\s*(mau|ingin|pengen)\s*hidup/i,
    /(menyakiti|melukai|nyakitin)\s*diri/i, /self[\s-]*harm/i,
    /\bsuicid/i, /\bkill\s*myself/i, /\bsayat\s*(tangan|nadi)/i,
    /\boverdosis\b/i, /\bgantung\s*diri/i, /\blompat\s*dari\b/i
  ];
  function isCrisis(text) {
    return CRISIS_PATTERNS.some(function(re) { return re.test(text); });
  }
  var CRISIS_CARD =
    '<div role="alert" style="background:#FFF4F0;border:1.5px solid #E88B6A;border-radius:16px;padding:14px 16px;font-size:13px;line-height:1.65;color:#2D2550;">' +
      '<div style="font-weight:800;margin-bottom:6px;">💜 Kamu tidak sendirian. Bantuan tersedia sekarang.</div>' +
      '<div>Apa yang kamu rasakan itu penting. Tolong hubungi salah satu ini sekarang juga:</div>' +
      '<ul style="margin:8px 0 8px 18px;padding:0;">' +
        '<li><b>Layanan SEJIWA: telepon 119, lalu tekan 8</b></li>' +
        '<li><b>Darurat: 112</b>, atau datang ke IGD rumah sakit terdekat</li>' +
        '<li>Hubungi orang yang kamu percaya dan minta mereka menemanimu</li>' +
      '</ul>' +
      '<div style="font-size:12px;color:#5A527A;">Pesan ini tidak dikirim ke AI. AI tidak bisa menggantikan bantuan manusia saat kamu dalam bahaya.</div>' +
    '</div>';

  function initLayanan() {
    var scheduleChips = document.querySelectorAll('.schedule-chip');
    var modalityBtns  = document.querySelectorAll('.modality-btn');
    var faqBtns       = document.querySelectorAll('.faq-q');
    var bookingForm   = document.getElementById('booking-form');

    if (!bookingForm && scheduleChips.length === 0) return;

    scheduleChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        scheduleChips.forEach(function(c) { c.classList.remove('is-selected'); });
        chip.classList.add('is-selected');
        var waktuVal = document.getElementById('waktu-val');
        if (waktuVal) waktuVal.value = chip.dataset.time;
      });
    });

    modalityBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        modalityBtns.forEach(function(b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        var modeVal = document.getElementById('mode-val');
        if (modeVal) modeVal.value = btn.dataset.mode;
      });
    });

    faqBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item   = btn.closest('.faq-item');
        var isOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item').forEach(function(i) {
          i.classList.remove('is-open');
          var q = i.querySelector('.faq-q');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    if (bookingForm) {
      bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn    = document.getElementById('submit-btn');
        var nama   = document.getElementById('nama');
        var email  = document.getElementById('email');
        var telp   = document.getElementById('telp');

        if (!nama || !nama.value.trim()) {
          if (nama) nama.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Nama perlu diisi.', 'error');
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
          if (email) email.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Format email belum tepat.', 'error');
          return;
        }
        if (!telp || !/^(\+62|62|0)[0-9]{8,13}$/.test(telp.value.replace(/[\s-]/g, ''))) {
          if (telp) telp.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Nomor HP kurang valid. Contoh: 081234567890', 'error');
          return;
        }
        var usiaSel = document.getElementById('usia');
        if (usiaSel && !usiaSel.value) {
          usiaSel.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Pilih kelompok usia dulu.', 'error');
          return;
        }

        var errBox = document.getElementById('booking-error');
        if (errBox) errBox.style.display = 'none';
        var oldLabel = btn ? btn.textContent : '';
        if (btn) {
          btn.textContent = 'Mengirim permintaanmu... 💜';
          btn.disabled    = true;
        }

        /* Data benar-benar dikirim ke server. Pesan sukses HANYA tampil
           bila server menjawab ok:true. Server perlu aksi 'booking'
           (lihat docs/BACKEND_BOOKING.md). */
        var val = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
        var payload = {
          action: 'booking',
          data: {
            nama: val('nama'), usia: val('usia'), email: val('email'), telp: val('telp'),
            layanan: val('layanan-pilih'), waktu: val('waktu-val'), mode: val('mode-val'),
            cerita: val('cerita'), dikirim: new Date().toISOString()
          }
        };
        var timeout = new Promise(function(_, rj) { setTimeout(function() { rj(new Error('timeout')); }, 20000); });
        Promise.race([
          fetch(LIVE_API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) })
            .then(function(r) { return r.json(); }),
          timeout
        ]).then(function(res) {
          if (!res || res.ok !== true) throw new Error((res && res.msg) || 'Server menolak permintaan.');
          bookingForm.style.display = 'none';
          var formSuccess = document.getElementById('form-success');
          if (formSuccess) formSuccess.classList.add('is-visible');
        }).catch(function() {
          if (btn) { btn.textContent = oldLabel; btn.disabled = false; }
          if (errBox) { errBox.style.display = 'block'; errBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Permintaan belum terkirim. Coba lagi nanti.', 'error', 5000);
        });
      });
    }
  }


  // ── CHAT WIDGET ─────────────────────────────────────────
  function initEmbeddedChat() {
    if (!document.getElementById('emb-body')) return;

    var SYS = 'Kamu adalah asisten AI edukasi kesehatan jiwa dari Lentera Jiwa. Kamu BUKAN psikolog atau dokter dan tidak boleh mendiagnosis atau meresepkan obat. '
      + 'HANYA jawab seputar kesehatan mental, psikologi, emosi, dan kesejahteraan jiwa, dengan bahasa Indonesia yang hangat dan singkat. '
      + 'Jika di luar topik, jawab: Maaf, pertanyaan itu di luar cakupan Lentera Jiwa. '
      + 'PENTING: Jika pengguna menyebut keinginan bunuh diri, menyakiti diri, ingin mati, atau berada dalam bahaya, jangan memberi saran lain lebih dulu. '
      + 'Tunjukkan kepedulian, minta mereka segera menghubungi Layanan SEJIWA 119 ext 8 atau nomor darurat 112 atau IGD terdekat, dan menghubungi orang yang mereka percaya. '
      + 'Untuk masalah yang berat atau berkepanjangan, sarankan berbicara dengan psikolog atau psikiater.';
    var EMB = {tab:'live', replyTarget:null, aiMsgs:[], aiLoading:false, liveCrisisHeld:false, LIVE:'lj_chat_live', PAKAR:'lj_chat_pakar'};

    /* Riwayat "Pakar" lama berisi balasan otomatis yang menyamar sebagai
       manusia. Hapus agar tidak lagi tampil sebagai jawaban pakar. */
    try { localStorage.removeItem(EMB.PAKAR); } catch(e) {}

    function sl(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
    function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
    function me(){try{return localStorage.getItem('lj_username')||'Anonim';}catch(e){return 'Anonim';}}
    function ts(){return new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
    function ini(n){return escHtml(String(n||'A').slice(0,2).toUpperCase());}
    function esc(s){return escHtml(s).replace(/\n/g,'<br>');}
    function bodyNotice(html){var b=document.getElementById('emb-body');if(!b)return;b.insertAdjacentHTML('beforeend',html);scr();}
    function scr(){var b=document.getElementById('emb-body');if(b)b.scrollTop=b.scrollHeight;}

    function rLive(m,mine){
      var rq=m.replyTo?('<div style="background:rgba(123,111,212,0.08);border-left:3px solid #7B6FD4;border-radius:0 8px 8px 0;padding:5px 9px;font-size:11px;color:#5A527A;margin-bottom:5px;">&laquo; <b>'+esc(m.replyTo.user)+'</b>: '+esc(String(m.replyTo.text).slice(0,60))+'</div>'):'';
      var bubStyle=mine?'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px':'background:rgba(255,255,255,0.85);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(123,111,212,0.12)';
      var replyBtn=mine?'':('<button onclick="embReply(\''+escHtml(String(m.id).replace(/[^\w-]/g,''))+'\')" style="opacity:0.6;background:none;border:1px solid rgba(123,111,212,0.2);border-radius:999px;padding:2px 9px;font-size:10px;color:#7B6FD4;cursor:pointer;margin-top:3px;font-family:Nunito,sans-serif;font-weight:700;">&#8617; Balas</button>');
      return '<div style="display:flex;flex-direction:column;gap:4px;" data-id="'+escHtml(m.id)+'">'
        +'<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7B6FD4,#9B8FE4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;'+(mine?'order:2':'')+'">'
        +ini(m.user)+'</div><span>'+(mine?'Kamu':esc(m.user))+'</span><span>'+esc(m.ts)+'</span></div>'
        +'<div style="display:flex;flex-direction:column;'+(mine?'align-items:flex-end':'')+'">'
        +rq+'<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;'+bubStyle+'">'+esc(m.text)+'</div>'
        +replyBtn+'</div></div>';
    }

    function rAI(m){
      if(m.role==='crisis') return CRISIS_CARD;
      var mine=m.role==='user';
      var bubStyle=mine?'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px':'background:rgba(236,252,243,0.9);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(61,184,122,0.2)';
      var avBg=mine?'linear-gradient(135deg,#7B6FD4,#9B8FE4)':'linear-gradient(135deg,#3DB87A,#6FDDB0)';
      return '<div style="display:flex;flex-direction:column;gap:4px;">'
        +'<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:'+avBg+';display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;'+(mine?'order:2':'')+'">'
        +(mine?ini(me()):'AI')+'</div><span>'+(mine?'Kamu':'🤖 AI (bukan psikolog)')+'</span><span>'+esc(m.ts)+'</span></div>'
        +'<div style="display:flex;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;'+bubStyle+'">'+esc(m.text)+'</div></div></div>';
    }

    function embRender(){
      var b=document.getElementById('emb-body'),m=me();
      if(!b)return;
      b.innerHTML='';
      var empty='<div style="text-align:center;padding:40px 16px;color:#8A82A8;">';
      if(EMB.tab==='live'){
        embRenderLive(); return;
      } else if(EMB.tab==='ai'){
        if(!EMB.aiMsgs.length){b.innerHTML=empty+'<div style="font-size:36px;margin-bottom:8px;">🤖</div><p style="font-size:13px;line-height:1.65;">Halo! Saya asisten AI untuk informasi seputar kesehatan jiwa.<br><b>Saya bukan psikolog</b> dan tidak bisa mendiagnosis.</p>'
          +'<p style="font-size:11.5px;line-height:1.6;margin-top:10px;color:#5A527A;">🔒 Pesanmu diproses oleh layanan AI pihak ketiga (Pollinations.ai). Jangan tuliskan nama lengkap, alamat, nomor HP, atau data pribadi lain.<br>Dalam keadaan darurat hubungi <b>119 ext 8</b> (SEJIWA) atau <b>112</b>.</p></div>';}
        else EMB.aiMsgs.forEach(function(msg){b.insertAdjacentHTML('beforeend',rAI(msg));});
      } else {
        b.innerHTML=empty+'<div style="font-size:36px;margin-bottom:8px;">👨‍⚕️</div><p style="font-size:13px;line-height:1.65;"><b>Tanya Pakar belum tersedia.</b><br>Saat ini belum ada psikolog yang menjawab pertanyaan lewat chat ini.</p>'
          +'<p style="font-size:12px;line-height:1.6;margin-top:10px;">Kamu bisa <a href="#booking" style="color:#7B6FD4;font-weight:700;">mengisi form konsultasi</a> di bawah.<br>Jika darurat, hubungi <b>119 ext 8</b> (SEJIWA) atau <b>112</b>.</p></div>';
      }
      scr();
    }

    window.embTab=function(el){
      document.querySelectorAll('.emb-tab').forEach(function(t){t.classList.remove('active');t.style.background='rgba(255,255,255,0.18)';t.style.color='rgba(255,255,255,0.8)';});
      el.classList.add('active');
      EMB.tab=el.dataset.tab;
      EMB.replyTarget=null;
      document.getElementById('emb-reply-bar').style.display='none';
      var ph={live:'Tulis pesan ke semua orang…',ai:'Tanyakan seputar kesehatan jiwa…',pakar:'Tanya Pakar belum tersedia'};
      document.getElementById('emb-input').placeholder=ph[EMB.tab];
      embRender();
    };

    window.embReply=function(id){
      var msgs=sl(EMB.LIVE,[]),msg=msgs.find(function(m){return m.id===id;});
      if(!msg)return;
      EMB.replyTarget={id:msg.id,user:msg.user,text:msg.text};
      document.getElementById('emb-reply-text').textContent=msg.user+': '+msg.text.slice(0,55)+'…';
      document.getElementById('emb-reply-bar').style.display='flex';
      document.getElementById('emb-input').focus();
    };

    window.embCancelReply=function(){
      EMB.replyTarget=null;
      document.getElementById('emb-reply-bar').style.display='none';
    };

    window.embSend=function(){
      var inp=document.getElementById('emb-input'),text=inp.value.trim();
      if(!text)return;
      var crisis=isCrisis(text);
      if(EMB.tab==='pakar'){
        /* Belum ada pakar sungguhan: jangan pura-pura menerima pertanyaan. */
        if(crisis) bodyNotice(CRISIS_CARD);
        return;
      }
      if(EMB.tab==='live'){
        /* Pesan krisis tidak langsung diposting ke ruang publik.
           Tampilkan bantuan dulu; jika tetap ingin, kirim sekali lagi. */
        if(crisis && !EMB.liveCrisisHeld){
          EMB.liveCrisisHeld=true;
          bodyNotice(CRISIS_CARD+'<div style="font-size:11.5px;color:#5A527A;text-align:center;">Pesanmu belum dikirim ke ruang obrolan publik. Tekan kirim sekali lagi bila tetap ingin membagikannya.</div>');
          return;
        }
        EMB.liveCrisisHeld=false;
        var token='';
        try{var s=JSON.parse(localStorage.getItem('lj_session'));token=s?s.token:'';}catch(e){}
        if(!token){
          bodyNotice('<div role="status" style="text-align:center;font-size:12.5px;color:#5A527A;padding:8px;">Masuk ke akunmu dulu untuk ikut mengobrol di ruang Live. <a href="login.html" onclick="event.stopPropagation();location.href=\'login.html\';return false;" style="color:#7B6FD4;font-weight:700;">Masuk →</a></div>');
          return;
        }
        inp.value='';inp.style.height='auto';
        EMB.replyTarget=null;
        document.getElementById('emb-reply-bar').style.display='none';
        /* POST: token dan isi pesan tidak lagi muncul di URL */
        fetch(LIVE_API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'sendChat',token:token,pesan:text})})
        .then(function(r){return r.json();})
        .then(function(d){
          if(d.ok){liveGetMessages();return;}
          inp.value=text;
          bodyNotice('<div role="alert" style="text-align:center;font-size:12.5px;color:#C0392B;padding:8px;">Pesan belum terkirim'+(d.msg?': '+esc(d.msg):'.')+'</div>');
        })
        .catch(function(){
          inp.value=text;
          bodyNotice('<div role="alert" style="text-align:center;font-size:12.5px;color:#C0392B;padding:8px;">Pesan belum terkirim. Periksa koneksi internetmu.</div>');
        });
        return;
      }
      /* Tab AI */
      inp.value='';inp.style.height='auto';
      EMB.aiMsgs.push({role:'user',text:text,ts:ts()});
      if(crisis){
        /* Pesan krisis TIDAK dikirim ke AI pihak ketiga. */
        EMB.aiMsgs.push({role:'crisis',ts:ts()});
        embRender();
        return;
      }
      embRender();
      embCallAI(text);
    };

    window.embKey=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();embSend();}};

    async function embCallAI(txt){
      EMB.aiLoading=true;
      var typing=document.getElementById('emb-typing');
      if(typing)typing.style.display='flex';
      scr();
      var reply=null;
      try{
        var prompt=encodeURIComponent(txt);
        var sys=encodeURIComponent(SYS);
        var seed=Math.floor(Math.random()*99999);
        var url='https://text.pollinations.ai/'+prompt+'?system='+sys+'&model=openai&seed='+seed;
        var r=await Promise.race([
          fetch(url),
          new Promise(function(_,rj){setTimeout(function(){rj(new Error('timeout'));},45000);})
        ]);
        if(r.status===429){
          reply='⏳ Server sedang sibuk, tunggu beberapa detik lalu kirim lagi ya.';
        } else {
          var raw=(await r.text()).trim();
          if(raw.includes('will continue to work normally')){
            var parts=raw.split('will continue to work normally.');
            raw=parts[parts.length-1].trim();
          }
          if(raw&&raw.length>2) reply=raw;
        }
      }catch(e){console.error('Pollinations error:',e);}
      if(!reply) reply='Maaf, koneksi sedang terganggu. Coba kirim pesan lagi ya 🪔';
      if(typing)typing.style.display='none';
      EMB.aiLoading=false;
      EMB.aiMsgs.push({role:'ai',text:reply,ts:ts()});
      embRender();
    }

    embRender();
    var oc=Math.floor(Math.random()*40+24);
    var oel=document.getElementById('emb-online');if(oel)oel.textContent=oc;
    liveStartPolling();
  }

// ── Chat Live Global (Spreadsheet) ──
const LIVE_API = 'https://script.google.com/macros/s/AKfycbxxsDNCC84VIo4UjXuBuzF6q2F_PfVGNJpuWhapELL0eg8JCOFkNqjNfSRyAVp-yt8z9w/exec';
let _livePolling = null;
let _liveMsgs = [];
let _liveLastCount = 0;
  initEmbeddedChat();

  initLayanan();


async function liveGetMessages() {
  try {
    const res = await fetch(LIVE_API + '?action=getChat');
    const data = await res.json();
    if (!data.ok) return;
    if (data.messages.length === _liveLastCount) return;
    _liveLastCount = data.messages.length;
    _liveMsgs = data.messages;
    /* Render hanya bila tab Live sedang aktif; sebelumnya pesan baru
       menimpa isi tab AI (termasuk kartu bantuan krisis). */
    var activeTab = document.querySelector('.emb-tab.active');
    if (activeTab && activeTab.dataset.tab === 'live' && typeof embRenderLive === 'function') embRenderLive();
  } catch(e) {}
}

function embRenderLive() {
  var b = document.getElementById('emb-body');
  if (!b) return;
  var m = '';
  try { var s = JSON.parse(localStorage.getItem('lj_session')); m = s ? (s.username || '') : ''; } catch(e) {}
  var empty = '<div style="text-align:center;padding:40px 16px;color:#8A82A8;">';
  var msgs = _liveMsgs || [];
  if (!msgs.length) {
    b.innerHTML = empty + '<div style="font-size:36px;margin-bottom:8px;">🌐</div><p style="font-size:13px;line-height:1.65;">Belum ada pesan.<br>Jadilah yang pertama menyapa!</p></div>';
    return;
  }
  var wasAtBottom = b.scrollHeight - b.scrollTop - b.clientHeight < 60;
  b.innerHTML = '';
  msgs.forEach(function(msg) {
    var mine = msg.username === m;
    var dt = new Date(msg.timestamp);
    var waktu = isNaN(dt.getTime()) ? '' : dt.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    var rq = '';
    var bubStyle = mine
      ? 'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px'
      : 'background:rgba(255,255,255,0.85);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(123,111,212,0.12)';
    var ini = escHtml(String(msg.nama || msg.username || '?').slice(0,2).toUpperCase());
    var html = '<div style="display:flex;flex-direction:column;gap:4px;">'
      + '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;' + (mine ? 'justify-content:flex-end' : '') + '">'
      + '<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7B6FD4,#9B8FE4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;' + (mine ? 'order:2' : '') + '">'
      + ini + '</div><span>' + (mine ? 'Kamu' : escHtml(msg.nama || msg.username)) + '</span><span>' + waktu + '</span></div>'
      + '<div style="display:flex;flex-direction:column;' + (mine ? 'align-items:flex-end' : '') + '">'
      + '<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;' + bubStyle + '">' + escHtml(msg.pesan) + '</div>'
      + '</div></div>';
    b.insertAdjacentHTML('beforeend', html);
  });
  if (wasAtBottom) b.scrollTop = b.scrollHeight;
}

function liveStartPolling() {
  liveGetMessages();
  if (_livePolling) clearInterval(_livePolling);
  _livePolling = setInterval(liveGetMessages, 4000);
  /* Didaftarkan agar dihentikan main.js saat pindah halaman */
  if (window.activeTimers) window.activeTimers.push(_livePolling);
}

function liveStopPolling() {
  if (_livePolling) { clearInterval(_livePolling); _livePolling = null; }
}

})();