'use strict';

/* ============================================================
   layanan.js (PERF v3.0 FIXED)
   PERBAIKAN: IIFE membungkus seluruh kode agar tidak ada
   identifier di global scope, dan event listener tidak menumpuk
   antar navigasi SPA.
   ============================================================ */

(function() {

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
        if (!email || !email.value.trim() || !email.value.includes('@')) {
          if (email) email.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Format email belum tepat.', 'error');
          return;
        }
        if (!telp || !telp.value.trim() || telp.value.trim().length < 8) {
          if (telp) telp.focus();
          if (window.LJ && window.LJ.ToastManager) window.LJ.ToastManager.show('Nomor HP kurang valid.', 'error');
          return;
        }

        if (btn) {
          btn.textContent = 'Menghubungkan kamu dengan tim kami... 💜';
          btn.disabled    = true;
        }

        var timerId = setTimeout(function() {
          if (bookingForm) bookingForm.style.display = 'none';
          var formSuccess = document.getElementById('form-success');
          if (formSuccess) formSuccess.classList.add('is-visible');
        }, 1400);

        if (window.activeTimers) window.activeTimers.push(timerId);
      });
    }
  }


  // ── CHAT WIDGET ─────────────────────────────────────────
  function initEmbeddedChat() {
    if (!document.getElementById('emb-body')) return;

    var SYS = 'Kamu adalah AI asisten klinis dari Lentera Jiwa. HANYA jawab seputar kesehatan mental, psikologi, emosi, dan kesejahteraan jiwa. Jika di luar topik, jawab: Maaf, pertanyaan itu di luar cakupan Lentera Jiwa. Saya hanya bisa membantu seputar kesehatan jiwa dan psikologi.';
    var EMB = {tab:'live', replyTarget:null, aiMsgs:[], aiLoading:false, pakarPending:false, LIVE:'lj_chat_live', PAKAR:'lj_chat_pakar'};

    function sl(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
    function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
    function me(){try{return localStorage.getItem('lj_username')||'Anonim';}catch(e){return 'Anonim';}}
    function ts(){return new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
    function ini(n){return(n||'A').slice(0,2).toUpperCase();}
    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
    function scr(){var b=document.getElementById('emb-body');if(b)b.scrollTop=b.scrollHeight;}

    function rLive(m,mine){
      var rq=m.replyTo?('<div style="background:rgba(123,111,212,0.08);border-left:3px solid #7B6FD4;border-radius:0 8px 8px 0;padding:5px 9px;font-size:11px;color:#5A527A;margin-bottom:5px;">&laquo; <b>'+m.replyTo.user+'</b>: '+m.replyTo.text.slice(0,60)+'</div>'):'';
      var bubStyle=mine?'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px':'background:rgba(255,255,255,0.85);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(123,111,212,0.12)';
      var replyBtn=mine?'':('<button onclick="embReply(\''+m.id+'\')" style="opacity:0.6;background:none;border:1px solid rgba(123,111,212,0.2);border-radius:999px;padding:2px 9px;font-size:10px;color:#7B6FD4;cursor:pointer;margin-top:3px;font-family:Nunito,sans-serif;font-weight:700;">&#8617; Balas</button>');
      return '<div style="display:flex;flex-direction:column;gap:4px;" data-id="'+m.id+'">'
        +'<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7B6FD4,#9B8FE4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;'+(mine?'order:2':'')+'">'
        +ini(m.user)+'</div><span>'+(mine?'Kamu':m.user)+'</span><span>'+m.ts+'</span></div>'
        +'<div style="display:flex;flex-direction:column;'+(mine?'align-items:flex-end':'')+'">'
        +rq+'<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;'+bubStyle+'">'+esc(m.text)+'</div>'
        +replyBtn+'</div></div>';
    }

    function rAI(m){
      var mine=m.role==='user';
      var bubStyle=mine?'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px':'background:rgba(236,252,243,0.9);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(61,184,122,0.2)';
      var avBg=mine?'linear-gradient(135deg,#7B6FD4,#9B8FE4)':'linear-gradient(135deg,#3DB87A,#6FDDB0)';
      return '<div style="display:flex;flex-direction:column;gap:4px;">'
        +'<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:'+avBg+';display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;'+(mine?'order:2':'')+'">'
        +(mine?ini(me()):'AI')+'</div><span>'+(mine?'Kamu':'🤖 AI Lentera')+'</span><span>'+m.ts+'</span></div>'
        +'<div style="display:flex;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;'+bubStyle+'">'+esc(m.text)+'</div></div></div>';
    }

    function rPakar(m,mine){
      var bubStyle=mine?'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px':'background:rgba(255,255,255,0.85);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(123,111,212,0.12)';
      var stBg=m.status==='pending'?'background:rgba(245,185,66,0.15);color:#d4a92a':'background:rgba(61,184,122,0.15);color:#1a8a54';
      var st=mine?('<div style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;margin-top:4px;'+stBg+';">'+(m.status==='pending'?'⏳ Menunggu Pakar':'✅ Terjawab')+'</div>'):'';
      var rp=m.reply?('<div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;"><div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;"><div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#E88B6A,#F0A882);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;">P</div><span>Pakar</span><span>'+(m.replyTs||ts())+'</span></div><div style="background:rgba(255,255,255,0.85);border-left:3px solid #E88B6A;border-radius:0 14px 14px 14px;padding:9px 13px;font-size:13px;line-height:1.6;color:#2D2550;max-width:85%;">'+esc(m.reply)+'</div></div>'):'';
      return '<div style="display:flex;flex-direction:column;gap:4px;">'
        +'<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;'+(mine?'justify-content:flex-end':'')+'">'
        +'<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7B6FD4,#9B8FE4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;'+(mine?'order:2':'')+'">'
        +ini(m.user)+'</div><span>'+(mine?'Kamu':m.user)+'</span><span>'+m.ts+'</span></div>'
        +'<div style="display:flex;flex-direction:column;'+(mine?'align-items:flex-end':'')+'">'
        +'<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;'+bubStyle+'">'+esc(m.text)+'</div>'+st+'</div>'+rp+'</div>';
    }

    function embRender(){
      var b=document.getElementById('emb-body'),m=me();
      if(!b)return;
      b.innerHTML='';
      var empty='<div style="text-align:center;padding:40px 16px;color:#8A82A8;">';
      if(EMB.tab==='live'){
        embRenderLive(); return;
      } else if(EMB.tab==='ai'){
        if(!EMB.aiMsgs.length){b.innerHTML=empty+'<div style="font-size:36px;margin-bottom:8px;">🤖</div><p style="font-size:13px;line-height:1.65;">Halo! Saya AI Lentera Jiwa.<br>Ceritakan yang ada di pikiranmu 💜</p></div>';}
        else EMB.aiMsgs.forEach(function(msg){b.insertAdjacentHTML('beforeend',rAI(msg));});
      } else {
        var pMsgs=sl(EMB.PAKAR,[]),myM=pMsgs.filter(function(x){return x.user===m;});
        if(!myM.length){b.innerHTML=empty+'<div style="font-size:36px;margin-bottom:8px;">👨‍⚕️</div><p style="font-size:13px;line-height:1.65;">Kirim pertanyaan ke Pakar kami.<br>Jawaban tiba dalam waktu singkat.</p></div>';}
        else myM.forEach(function(msg){b.insertAdjacentHTML('beforeend',rPakar(msg,true));});
      }
      scr();
    }

    window.embTab=function(el){
      document.querySelectorAll('.emb-tab').forEach(function(t){t.classList.remove('active');t.style.background='rgba(255,255,255,0.18)';t.style.color='rgba(255,255,255,0.8)';});
      el.classList.add('active');
      EMB.tab=el.dataset.tab;
      EMB.replyTarget=null;
      document.getElementById('emb-reply-bar').style.display='none';
      var ph={live:'Tulis pesan ke semua orang…',ai:'Tanyakan seputar kesehatan jiwa…',pakar:'Tulis pertanyaan untuk Pakar…'};
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
      var m=me();inp.value='';inp.style.height='auto';
      if(EMB.tab==='live'){
        EMB.replyTarget=null;
        document.getElementById('emb-reply-bar').style.display='none';
        var token='';
        try{var s=JSON.parse(localStorage.getItem('lj_session'));token=s?s.token:'';}catch(e){}
        fetch(LIVE_API,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'sendChat',token:token,pesan:text})})
        .then(function(){setTimeout(liveGetMessages,1500);})
        .catch(function(e){alert('Error: '+e.message);});
      } else if(EMB.tab==='ai'){
        EMB.aiMsgs.push({role:'user',text:text,ts:ts()});
        embRender();
        embCallAI(text);
      } else {
        if(EMB.pakarPending){alert('⏳ Pertanyaanmu sedang menunggu jawaban pakar. Sabar ya 💜');return;}
        var pm={id:'p_'+Date.now(),user:m,text:text,ts:ts(),status:'pending',reply:null};
        var pms=sl(EMB.PAKAR,[]);pms.push(pm);ss(EMB.PAKAR,pms);
        EMB.pakarPending=true;embRender();embPakarSim(pm.id,text);
      }
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

    function embPakarSim(id,q){
      var delay=8000+Math.random()*10000;
      var tmpl=[
        {k:['cemas','anxiety','khawatir','takut'],r:'Kecemasan yang kamu rasakan wajar. Coba teknik napas 4-7-8: tarik 4 detik, tahan 7 detik, buang 8 detik. 💙'},
        {k:['depresi','sedih','hampa','kosong'],r:'Saya mendengarmu. Perasaan itu nyata dan valid. Kamu tidak sendirian. 💜'},
        {k:['stress','burnout','capek','lelah'],r:'Burnout adalah sinyal penting. Istirahat bukan kelemahan, itu kebutuhan. 🌿'},
        {k:['tidur','insomnia','susah tidur'],r:'Coba matikan layar 1 jam sebelum tidur dan buat jadwal tidur tetap. 🌙'}
      ];
      setTimeout(function(){
        var rep='Terima kasih sudah bertanya. Kamu sudah mengambil langkah berani. 🪔';
        var lq=q.toLowerCase();
        for(var i=0;i<tmpl.length;i++){if(tmpl[i].k.some(function(k){return lq.includes(k);})){rep=tmpl[i].r;break;}}
        var pms=sl(EMB.PAKAR,[]),idx=pms.findIndex(function(x){return x.id===id;});
        if(idx!==-1){pms[idx].status='answered';pms[idx].reply=rep;pms[idx].replyTs=ts();ss(EMB.PAKAR,pms);}
        EMB.pakarPending=false;
        if(EMB.tab==='pakar'){embRender();}
        else{var b=document.getElementById('emb-badge-pakar');if(b){b.textContent='1';b.style.display='flex';}}
      },delay);
    }

    embRender();
    var oc=Math.floor(Math.random()*40+24);
    var oel=document.getElementById('emb-online');if(oel)oel.textContent=oc;
    liveStartPolling();
  }

// ── Chat Live Global (Spreadsheet) ──
const LIVE_API = 'https://script.google.com/macros/s/AKfycbwXXLDgAb6ZmTVJSLb_FsgEIFzbgbOqt1gXsuK4C_QIks7UOXwV3B8MDc7qooWetyeqIw/exec';
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
    if (typeof embRenderLive === 'function') embRenderLive();
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
    var waktu = new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    var rq = '';
    var bubStyle = mine
      ? 'background:linear-gradient(135deg,#7B6FD4,#9B8FE4);color:#fff;border-radius:14px 0 14px 14px'
      : 'background:rgba(255,255,255,0.85);color:#2D2550;border-radius:0 14px 14px 14px;border:1px solid rgba(123,111,212,0.12)';
    var ini = (msg.nama || msg.username || '?').slice(0,2).toUpperCase();
    var html = '<div style="display:flex;flex-direction:column;gap:4px;">'
      + '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#8A82A8;font-weight:600;' + (mine ? 'justify-content:flex-end' : '') + '">'
      + '<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7B6FD4,#9B8FE4);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;' + (mine ? 'order:2' : '') + '">'
      + ini + '</div><span>' + (mine ? 'Kamu' : (msg.nama || msg.username)) + '</span><span>' + waktu + '</span></div>'
      + '<div style="display:flex;flex-direction:column;' + (mine ? 'align-items:flex-end' : '') + '">'
      + '<div style="padding:9px 13px;font-size:13px;line-height:1.6;max-width:85%;word-break:break-word;' + bubStyle + '">' + String(msg.pesan).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>'
      + '</div></div>';
    b.insertAdjacentHTML('beforeend', html);
  });
  if (wasAtBottom) b.scrollTop = b.scrollHeight;
}

function liveStartPolling() {
  liveGetMessages();
  if (_livePolling) clearInterval(_livePolling);
  _livePolling = setInterval(liveGetMessages, 4000);
}

function liveStopPolling() {
  if (_livePolling) { clearInterval(_livePolling); _livePolling = null; }
}

})();