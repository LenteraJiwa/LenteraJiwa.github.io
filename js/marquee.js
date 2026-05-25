/* ============================================================
   LENTERA JIWA — marquee.js (PERF v3.0 FIXED)
   Ticker · Marquee · Auto-duplicate · Pause on Hover

   PERBAIKAN v3.0:
   - instances array di-reset setiap init() agar tidak menumpuk
   - duplicateItems: cek data-duplicated tetap valid karena
     HTML di-inject ulang SPA = attribute hilang = cek fresh
   - DocumentFragment untuk batch DOM insert
   - Passive event listeners
   ============================================================ */

'use strict';

const MarqueeManager = {

  instances: [],

  init() {
    /* PERBAIKAN: Reset instances array — jangan akumulasi dari navigasi lama */
    this.instances = [];

    document.querySelectorAll('.ticker-wrapper').forEach(wrapper => {
      this.initInstance(wrapper);
    });
  },

  initInstance(wrapper) {
    const track = wrapper.querySelector('.ticker-track, .ticker-track-reverse');
    if (!track) return;

    /* Cek apakah wrapper ini sudah punya instance terdaftar
       (mencegah double-init pada wrapper yang sama) */
    const alreadyInited = this.instances.some(inst => inst.wrapper === wrapper);
    if (alreadyInited) return;

    this.duplicateItems(track);

    track.style.willChange = 'transform';
    track.style.transform  = 'translateZ(0)';

    wrapper.style.contain = 'layout style';

    wrapper.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });

    const speed = parseFloat(wrapper.getAttribute('data-speed')) || 1;
    const items = track.children.length;
    const duration = (items * 3.5 / speed) + 's';

    track.style.setProperty('--ticker-dur', duration);

    this.instances.push({ wrapper, track });
  },

  duplicateItems(track) {
    /* Karena SPA meng-inject ulang HTML setiap navigasi,
       data-duplicated tidak ada di elemen baru — cek ini valid */
    if (track.getAttribute('data-duplicated')) return;

    /* PERBAIKAN: DocumentFragment untuk batch DOM insert */
    const fragment = document.createDocumentFragment();
    const original = Array.from(track.children);
    original.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      fragment.appendChild(clone);
    });
    track.appendChild(fragment);

    track.setAttribute('data-duplicated', 'true');
  },

  createTicker(container, items, options) {
    const opts = options || {};
    const speed      = opts.speed      !== undefined ? opts.speed      : 1;
    const reverse    = opts.reverse    !== undefined ? opts.reverse    : false;

    const wrapper = document.createElement('div');
    wrapper.className = 'ticker-wrapper';
    wrapper.setAttribute('data-speed', speed);

    const track = document.createElement('div');
    track.className = reverse ? 'ticker-track-reverse' : 'ticker-track';

    const frag = document.createDocumentFragment();
    items.forEach(function(item) {
      const el = document.createElement('div');
      el.className = 'ticker-item';
      el.innerHTML = item;
      frag.appendChild(el);
    });
    track.appendChild(frag);

    wrapper.appendChild(track);
    container.appendChild(wrapper);

    this.initInstance(wrapper);
    return wrapper;
  },
};

/* ── DOM READY ──────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MarqueeManager.init());
} else {
  MarqueeManager.init();
}

window.LJ = window.LJ || {};
window.LJ.MarqueeManager = MarqueeManager;