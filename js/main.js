'use strict';

if (!window.__LJ_MAIN_INIT__) {
window.__LJ_MAIN_INIT__ = true;

const STORAGE_KEY_AGE  = 'lj_age';
const STORAGE_KEY_DATA = 'lj_data';
const DEFAULT_AGE      = 'dewasa';

const AGE_META = {
  anak:   { emoji: '🌱', label: 'Anak',   range: '8–12 tahun' },
  remaja: { emoji: '🌙', label: 'Remaja', range: '13–17 tahun' },
  dewasa: { emoji: '☀️', label: 'Dewasa', range: '18–59 tahun' },
  lansia: { emoji: '🌸', label: 'Lansia', range: '60+ tahun' },
};

const PAGE_MAP = {
  'index.html':        {
    file:  'pages/utama.html',
    title: 'Beranda',
    js:    [],
    css:   ['css/pages/utama.css'],
  },
  '':                  {
    file:  'pages/utama.html',
    title: 'Beranda',
    js:    [],
    css:   ['css/pages/utama.css'],
  },
  'layanan.html':      {
    file:  'pages/layanan.html',
    title: 'Layanan Konsultasi',
    js:    ['js/layanan.js'],
    css:   ['css/pages/layanan.css'],
  },
  'artikel.html':      {
    file:  'pages/artikel.html',
    title: 'Artikel Kesehatan',
    js:    ['js/artikel.js'],
    css:   ['css/pages/artikel.css'],
  },
  'perpustakaan.html': {
    file:  'pages/perpustakaan.html',
    title: 'Buku & Jurnal',
    js:    ['js/perpustakaan.js'],
    css:   ['css/pages/perpustakaan.css'],
  },
  'tes.html':          {
    file:  'pages/tes.html',
    title: 'Tes Psikologi',
    js:    ['js/test.js'],
    css:   ['css/pages/tes.css'],
  },
  'tentang.html':      {
    file:  'pages/tentang.html',
    title: 'Tentang Kami',
    js:    [],
    css:   ['css/pages/tentang.css'],
  },
};

const _loadedStyles = new Set();

window.activeTimers = window.activeTimers || [];


/* ══════════════════════════════════════════════════════════
   loadPageStyle / loadPageStyles
   ══════════════════════════════════════════════════════════ */
function loadPageStyle(href, callback) {
  if (_loadedStyles.has(href)) {
    if (typeof callback === 'function') callback();
    return;
  }

  const existing = document.querySelector('link[data-page-style="' + href + '"]');
  if (existing) {
    _loadedStyles.add(href);
    if (typeof callback === 'function') callback();
    return;
  }

  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = href;
  link.setAttribute('data-page-style', href);

  link.onload = function() {
    _loadedStyles.add(href);
    if (typeof callback === 'function') callback();
  };

  link.onerror = function() {
    console.warn('[LJ] Gagal memuat CSS:', href);
    _loadedStyles.add(href);
    if (typeof callback === 'function') callback();
  };

  document.head.appendChild(link);
}

function loadPageStyles(hrefArray, allDoneCallback) {
  if (!hrefArray || hrefArray.length === 0) {
    if (typeof allDoneCallback === 'function') allDoneCallback();
    return;
  }

  let pending = hrefArray.length;

  function onEachDone() {
    pending--;
    if (pending <= 0 && typeof allDoneCallback === 'function') {
      allDoneCallback();
    }
  }

  hrefArray.forEach(href => loadPageStyle(href, onEachDone));
}


/* ══════════════════════════════════════════════════════════
   HELPER: Set progress fill menggunakan transform:scaleX
   PERBAIKAN: Ganti semua this.progress.style.width = x+'%'
   dengan fungsi ini di seluruh codebase
   ══════════════════════════════════════════════════════════ */
function setProgressFill(el, pct) {
  if (!el) return;
  /* Gunakan transform:scaleX (composite) bukan width (layout trigger) */
  const ratio = Math.max(0, Math.min(pct, 100)) / 100;
  el.style.transform = 'scaleX(' + ratio + ')';
  el.style.transformOrigin = 'left';
}


/* ══════════════════════════════════════════════════════════
   APP — Core SPA Logic
   ══════════════════════════════════════════════════════════ */
const App = {
  age:     DEFAULT_AGE,
  navOpen: false,
  _currentPage: '',
  _ageCardsInited: false,

  _rippleCount: 0,
  _MAX_RIPPLE:  6,

  init() {
    this.restoreAge();
    this.initNav();
    this.initBurger();
    this.initAgeCards();
    this.initRipple();
    this.initParticles();
    this.initSmoothLinks();
    this.initSPANavigation();
    this.updateAgeUI(this.age, false);
  },

  restoreAge() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGE);
      if (saved && AGE_META[saved]) this.age = saved;
    } catch(e) {}
    document.documentElement.setAttribute('data-age', this.age);
    document.body.setAttribute('data-age', this.age);
  },

  setAge(age) {
    if (!AGE_META[age]) return;
    this.age = age;
    try { localStorage.setItem(STORAGE_KEY_AGE, age); } catch(e) {}
    document.documentElement.setAttribute('data-age', age);
    document.body.setAttribute('data-age', age);
    this.updateAgeUI(age, true);
    this.dispatchAgeEvent(age);
  },

  updateAgeUI(age, animate) {
    const meta = AGE_META[age];
    if (animate === undefined) animate = true;

    const cards = document.querySelectorAll('[data-age-val]');
    const navAgeEl = document.getElementById('nav-age-label');
    const heroAge = document.getElementById('hero-age-current');

    requestAnimationFrame(() => {
      cards.forEach(card => {
        const val = card.getAttribute('data-age-val');
        card.classList.toggle('is-active', val === age);
        if (card.getAttribute('role') === 'button') {
          card.setAttribute('aria-pressed', val === age ? 'true' : 'false');
        }
      });

      if (navAgeEl) {
        if (animate) {
          navAgeEl.style.opacity = '0';
          navAgeEl.style.transform = 'translate3d(0, -4px, 0)';
          setTimeout(() => {
            navAgeEl.textContent = meta.emoji + ' ' + meta.label;
            navAgeEl.style.transition = 'opacity 0.3s, transform 0.3s';
            navAgeEl.style.opacity = '1';
            navAgeEl.style.transform = 'translate3d(0, 0, 0)';
          }, 150);
        } else {
          navAgeEl.textContent = meta.emoji + ' ' + meta.label;
        }
      }

      document.querySelectorAll('.nav-drawer-age[data-age-val]').forEach(el => {
        el.classList.toggle('is-active', el.getAttribute('data-age-val') === age);
      });

      if (heroAge) heroAge.textContent = meta.emoji + ' ' + meta.label;
    });

    if (animate) {
      this.fadeContentSwap();
      ToastManager.show(meta.emoji + ' Konten disesuaikan untuk ' + meta.label, 'success');
    }
  },

  fadeContentSwap() {
    const areas = document.querySelectorAll(
      '.content-anak, .content-remaja, .content-dewasa, .content-lansia'
    );

    requestAnimationFrame(() => {
      areas.forEach(el => {
        el.style.willChange = 'opacity, transform';
        el.style.opacity = '0';
        el.style.transform = 'translate3d(0, 8px, 0)';
        el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      });

      requestAnimationFrame(() => {
        areas.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0, 0, 0)';
        });
        setTimeout(() => {
          areas.forEach(el => { el.style.willChange = 'auto'; });
        }, 400);
      });
    });
  },

  dispatchAgeEvent(age) {
    document.dispatchEvent(new CustomEvent('lj:agechange', {
      detail: { age, meta: AGE_META[age] },
      bubbles: true,
    }));
  },

  /* ──────────────────────────────────────────────────────
     SPA NAVIGATION
  ────────────────────────────────────────────────────── */
  initSPANavigation() {
    document.body.style.opacity = '1';

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');

      if (!href ||
          href.startsWith('#') ||
          href.startsWith('http') ||
          href.startsWith('mailto') ||
          href.startsWith('tel') ||
          href.startsWith('javascript') ||
          link.target === '_blank') return;

      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      const hrefClean   = href.split('#')[0].split('?')[0];
      const hashPart    = href.includes('#') ? href.split('#')[1] : null;
      const pageName    = hrefClean.split('/').pop() || '';

      const normalizedTarget  = pageName === '' ? 'index.html' : pageName;
      const normalizedCurrent = this._currentPage === '' ? 'index.html' : this._currentPage;

      if (hrefClean !== '' || pageName !== '') {
        e.preventDefault();
        this._closeDrawer();

        if (normalizedTarget === normalizedCurrent) {
          if (hashPart) {
            setTimeout(() => {
              const target = document.getElementById(hashPart);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
          return;
        }

        this.navigateTo(pageName, hashPart);
        return;
      }
    });

    window.addEventListener('popstate', e => {
      const page = (e.state && e.state.page) || window.location.pathname.split('/').pop() || '';
      this.navigateTo(page, null, true);
    });
  },

  navigateTo(page, hash, isPop) {
    /* Cleanup active timers sebelum pindah halaman */
    if (window.activeTimers && window.activeTimers.length > 0) {
      window.activeTimers.forEach(id => {
        clearInterval(id);
        clearTimeout(id);
      });
      window.activeTimers = [];
    }

    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    const pageConf    = PAGE_MAP[page];
    const fileToFetch = pageConf ? pageConf.file : 'pages/utama.html';
    const cssFiles    = pageConf ? (pageConf.css || []) : ['css/pages/utama.css'];

    appContent.style.willChange = 'opacity';
    appContent.style.transition = 'opacity 0.2s ease';
    appContent.style.opacity    = '0';

    if (!isPop) {
      window.history.pushState({ page }, '', page || 'index.html');
    }

    this._currentPage = page;
    this.updateNavActiveLinks(page);

    if (pageConf && pageConf.title) {
      document.title = pageConf.title + ' — Lentera Jiwa';
    }

    loadPageStyles(cssFiles, () => {
      setTimeout(() => {
        fetch(fileToFetch)
          .then(r => {
            if (!r.ok) throw new Error('Gagal memuat ' + fileToFetch);
            return r.text();
          })
          .then(html => {
            appContent.innerHTML = html;

            window.scrollTo({ top: 0, behavior: 'instant' });

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                appContent.style.opacity = '1';
                appContent.style.willChange = 'auto';
              });
            });

            this.afterPageLoad(page);

            if (hash) {
              setTimeout(() => {
                const target = document.getElementById(hash);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 200);
            }

            if (pageConf && pageConf.js && pageConf.js.length > 0) {
              pageConf.js.forEach(src => this.loadPageScript(src));
            }
          })
          .catch(() => {
            appContent.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px 24px;"><div style="font-size:48px;margin-bottom:20px;">🪔</div><p style="font-family:\'Fraunces\',serif;font-size:36px;font-weight:300;font-style:italic;color:#7B6FD4;margin-bottom:12px;">Lentera Jiwa</p><p style="font-size:15px;color:#8A82A8;max-width:380px;line-height:1.7;">Konten sedang disiapkan… <br><br><a href="javascript:void(0)" onclick="window.LJ.App.navigateTo(window.LJ.App._currentPage, null, true)" style="color:#7B6FD4;font-weight:700;text-decoration:underline;">🔄 Coba Lagi</a></p></div>';
            requestAnimationFrame(() => {
              appContent.style.opacity = '1';
              appContent.style.willChange = 'auto';
            });
          });
      }, 200);
    });
  },

  loadPageScript(src) {
    const existing = document.querySelector('script[data-page-script="' + src + '"]');
    if (existing) existing.remove();
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute('data-page-script', src);
    document.body.appendChild(s);
  },

  afterPageLoad(page) {
    if (window.LJ && window.LJ.ScrollReveal) {
      window.LJ.ScrollReveal.observeAll();
    }
    if (window.LJ && window.LJ.ProgressAnimator) {
      window.LJ.ProgressAnimator.init();
    }
    if (window.LJ && window.LJ.MarqueeManager) {
      window.LJ.MarqueeManager.init();
    }

    /* PERBAIKAN: TesManager.init() hanya dipanggil di halaman tes
       agar tidak membuang resources dan menciptakan listener sia-sia */
    const normalizedPage = page === '' ? 'index.html' : page;
    if ((normalizedPage === 'tes.html' || normalizedPage === 'index.html') &&
        window.LJ && window.LJ.TesManager) {
      window.LJ.TesManager.init();
    }

    this.initParticles();
    this.updateAgeUI(this.age, false);
    this._ageCardsInited = false;
    this.initAgeCards();
    this.updateNavActiveLinks(page);
  },

  updateNavActiveLinks(page) {
    const normalizedPage = page === '' ? 'index.html' : page;
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      const linkPage = link.getAttribute('data-page');
      const normalizedLink = linkPage === '' ? 'index.html' : linkPage;
      link.classList.toggle('is-active', normalizedLink === normalizedPage);
    });

    document.querySelectorAll('.nav-drawer-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const hrefPage = href.split('/').pop() || 'index.html';
      const normalizedHref = hrefPage === '' ? 'index.html' : hrefPage;
      link.classList.toggle('is-active', normalizedHref === normalizedPage);
    });
  },

  /* ──────────────────────────────────────────────────────
     NAVIGATION
  ────────────────────────────────────────────────────── */
  initNav() {
    const navInner = document.getElementById('nav-inner');
    if (!navInner) return;

    let lastScrollY  = 0;
    let ticking      = false;

    const nav = document.getElementById('main-nav');
    if (nav) nav.style.willChange = 'transform';

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        navInner.classList.toggle('nav-scrolled', scrollY > 40);

        if (nav) {
          if (scrollY > lastScrollY + 80 && scrollY > 200) {
            nav.style.transform = 'translateX(-50%) translate3d(0, -120%, 0)';
          } else if (scrollY < lastScrollY - 20 || scrollY < 80) {
            nav.style.transform = 'translateX(-50%) translate3d(0, 0, 0)';
          }
        }
        lastScrollY = scrollY;
        ticking     = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const currentPage = window.location.pathname.split('/').pop() || '';
    this.updateNavActiveLinks(currentPage);
  },

  _closeDrawer() {
    const burger  = document.getElementById('nav-burger');
    const drawer  = document.getElementById('nav-drawer');
    const overlay = document.getElementById('nav-drawer-overlay');

    if (!drawer || !drawer.classList.contains('is-open')) return;

    this.navOpen = false;
    if (burger)  { burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    if (drawer)  { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  },

  initBurger() {
    const burger  = document.getElementById('nav-burger');
    const drawer  = document.getElementById('nav-drawer');
    const overlay = document.getElementById('nav-drawer-overlay');
    const close   = document.getElementById('nav-drawer-close');

    if (!burger || !drawer) return;

    drawer.style.willChange = 'transform';

    const open = () => {
      this.navOpen = true;
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      if (overlay) overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    };

    const closeFn = () => this._closeDrawer();

    burger.addEventListener('click', () => this.navOpen ? closeFn() : open());
    if (overlay) overlay.addEventListener('click', closeFn);
    if (close)   close.addEventListener('click', closeFn);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.navOpen) closeFn();
    });

    document.querySelectorAll('.nav-drawer-age[data-age-val]').forEach(card => {
      card.addEventListener('click', () => {
        this.setAge(card.getAttribute('data-age-val'));
      });
    });
  },

  initAgeCards() {
    if (this._ageCardsInited) return;
    this._ageCardsInited = true;

    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.addEventListener('click', e => {
        const card = e.target.closest('[data-age-val]');
        if (!card) return;
        this.setAge(card.getAttribute('data-age-val'));
      });
      appContent.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-age-val]');
        if (!card) return;
        e.preventDefault();
        this.setAge(card.getAttribute('data-age-val'));
      });
    }

    document.querySelectorAll('.hero-ages [data-age-val], .nav-drawer-age[data-age-val]').forEach(card => {
      if (card.dataset.ljAgeBound) return;
      card.dataset.ljAgeBound = '1';
      card.addEventListener('click', () => this.setAge(card.getAttribute('data-age-val')));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.setAge(card.getAttribute('data-age-val'));
        }
      });
    });
  },

  initRipple() {
    document.addEventListener('click', e => {
      if (this._rippleCount >= this._MAX_RIPPLE) return;

      const btn = e.target.closest('.btn-ripple, .btn-primary, .btn-soft, .nav-cta');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x    = e.clientX - rect.left - size / 2;
      const y    = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-circle';
      ripple.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + 'px;top:' + y + 'px;' +
        'position:absolute;pointer-events:none;border-radius:50%;' +
        'background:rgba(255,255,255,0.32);' +
        'will-change:transform,opacity;' +
        'transform:translate3d(0,0,0) scale(0);' +
        'animation:ripple 0.65s ease-out forwards;';

      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      this._rippleCount++;

      ripple.addEventListener('animationend', () => {
        ripple.remove();
        this._rippleCount--;
      }, { once: true });

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
          this._rippleCount = Math.max(0, this._rippleCount - 1);
        }
      }, 750);
    });
  },

  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    canvas.innerHTML = '';

    const isLowEnd = (navigator.deviceMemory && navigator.deviceMemory < 2) ||
                     (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

    if (isLowEnd) return;

    const particles = [
      { size: 12, color: '#C4BEFF', top: '18%', left: '8%',   dur: '9s',  delay: '0s'  },
      { size: 8,  color: '#B5D4F4', top: '62%', left: '4%',   dur: '12s', delay: '-3s' },
      { size: 16, color: '#FFD6C0', top: '28%', right: '7%',  dur: '14s', delay: '-5s' },
      { size: 10, color: '#DCFFF0', top: '72%', right: '11%', dur: '10s', delay: '-2s' },
    ];

    const fragment = document.createDocumentFragment();

    particles.forEach(p => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.cssText =
        'width:' + p.size + 'px;height:' + p.size + 'px;background:' + p.color + ';' +
        'top:' + p.top + ';left:' + (p.left || 'auto') + ';right:' + (p.right || 'auto') + ';' +
        '--p-dur:' + p.dur + ';animation-delay:' + p.delay + ';' +
        'border-radius:50%;opacity:0;' +
        'will-change:transform,opacity;' +
        'transform:translateZ(0);';
      fragment.appendChild(el);
    });

    canvas.appendChild(fragment);
  },

  initSmoothLinks() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 100,
          behavior: 'smooth',
        });
      }
    });
  },
};


/* ══════════════════════════════════════════════════════════
   TOAST MANAGER
   ══════════════════════════════════════════════════════════ */
const ToastManager = {
  container: null,

  init() {
    const existing = document.querySelector('.toast-container');
    if (existing) { this.container = existing; return; }
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type, duration) {
    type = type || 'info';
    duration = duration !== undefined ? duration : 3000;

    if (!this.container) this.init();

    const icons = { success: '✅', error: '❌', info: '💜', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.style.willChange = 'transform, opacity';
    toast.innerHTML =
      '<span style="font-size:18px;flex-shrink:0;">' + (icons[type] || icons.info) + '</span>' +
      '<span>' + message + '</span>';
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeSlideLeft 0.35s ease reverse forwards';
      toast.addEventListener('animationend', () => {
        toast.remove();
      }, { once: true });
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, duration);

    toast.addEventListener('click', () => {
      toast.style.animation = 'fadeSlideLeft 0.3s ease reverse forwards';
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
    });
  },
};


/* ══════════════════════════════════════════════════════════
   INITIAL PAGE LOAD
   PERBAIKAN: loadPageStyles HARUS selesai sebelum inject HTML
   ══════════════════════════════════════════════════════════ */
function initialLoad() {
  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  const page     = window.location.pathname.split('/').pop() || '';
  const pageConf = PAGE_MAP[page] || PAGE_MAP['index.html'];
  const fileToFetch = pageConf.file;
  const cssFiles    = pageConf.css || [];

  App._currentPage = page;

  if (pageConf.title) {
    document.title = pageConf.title + ' — Lentera Jiwa';
  }

  /* PERBAIKAN: CSS dimuat DULU dengan callback, baru fetch HTML
     Mencegah FOUC (Flash of Unstyled Content) */
  loadPageStyles(cssFiles, function() {
    fetch(fileToFetch)
      .then(r => {
        if (!r.ok) throw new Error('Gagal memuat ' + fileToFetch);
        return r.text();
      })
      .then(html => {
        appContent.innerHTML = html;

        const loader = document.getElementById('spa-loading');
        if (loader) {
          loader.classList.add('is-hidden');
          setTimeout(() => {
            loader.setAttribute('aria-hidden', 'true');
            loader.style.display = 'none';
          }, 460);
        }

        if (window.LJ && window.LJ.ScrollReveal) window.LJ.ScrollReveal.observeAll();
        if (window.LJ && window.LJ.ProgressAnimator) window.LJ.ProgressAnimator.init();
        if (window.LJ && window.LJ.MarqueeManager) window.LJ.MarqueeManager.init();

        /* PERBAIKAN: TesManager hanya di halaman tes & beranda */
        const normalizedPage = page === '' ? 'index.html' : page;
        if ((normalizedPage === 'tes.html' || normalizedPage === 'index.html') &&
            window.LJ && window.LJ.TesManager) {
          window.LJ.TesManager.init();
        }

        if (window.LJ && window.LJ.App) {
          window.LJ.App.updateAgeUI(window.LJ.App.age, false);
          window.LJ.App.initAgeCards();
        }

        if (pageConf.js && pageConf.js.length > 0) {
          pageConf.js.forEach(src => App.loadPageScript(src));
        }

        App.updateNavActiveLinks(page);

        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) {
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }
        }

        /* Prefetch halaman lain saat browser idle */
        const prefetchPages = Object.values(PAGE_MAP)
          .map(p => p.file)
          .filter((f, i, a) => a.indexOf(f) === i && f !== fileToFetch);

        const doPrefetch = () => {
          prefetchPages.forEach(f => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = f;
            link.as = 'fetch';
            document.head.appendChild(link);
          });
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(doPrefetch, { timeout: 2000 });
        } else {
          setTimeout(doPrefetch, 1500);
        }
      })
      .catch(() => {
        fetch('pages/utama.html')
          .then(r => r.text())
          .then(html => {
            appContent.innerHTML = html;
            const loader = document.getElementById('spa-loading');
            if (loader) {
              loader.classList.add('is-hidden');
              setTimeout(() => { loader.setAttribute('aria-hidden', 'true'); loader.style.display = 'none'; }, 460);
            }
          })
          .catch(() => {
            appContent.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px 24px;"><div style="font-size:48px;margin-bottom:20px;">🪔</div><p style="font-family:Fraunces,serif;font-size:32px;font-weight:300;font-style:italic;color:#7B6FD4;margin-bottom:12px;">Lentera Jiwa</p><p style="font-size:15px;color:#8A82A8;">Konten sedang disiapkan…</p></div>';
            const loader = document.getElementById('spa-loading');
            if (loader) { loader.classList.add('is-hidden'); loader.style.display = 'none'; }
          });
      });
  });
}


/* ══════════════════════════════════════════════════════════
   BOOTSTRAP
   ══════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ToastManager.init();
    App.init();
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(initialLoad, 120)));
  });
} else {
  ToastManager.init();
  App.init();
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(initialLoad, 120)));
}


/* ══════════════════════════════════════════════════════════
   EXPORTS
   ══════════════════════════════════════════════════════════ */
window.LJ = window.LJ || {};
Object.assign(window.LJ, {
  App,
  ToastManager,
  AGE_META,
  loadPageStyle,
  loadPageStyles,
  PAGE_MAP,
  setProgressFill,
});

window.LenteraJiwa = window.LenteraJiwa || {};
window.LenteraJiwa.loadPageStyle  = loadPageStyle;
window.LenteraJiwa.loadPageStyles = loadPageStyles;
window.LenteraJiwa.setProgressFill = setProgressFill;

} /* end guard __LJ_MAIN_INIT__ */