/* ============================================================
   LENTERA JIWA — scroll.js (PERF v3.0 FIXED)
   Scroll Reveal · IntersectionObserver · Counter Animation

   PERBAIKAN v3.0:
   - MutationObserver di-disconnect sebelum re-init (tidak menumpuk)
   - will-change dikelola dinamis: tambah sebelum animasi, hapus sesudah
   - Counter pakai requestAnimationFrame (bukan setTimeout)
   - Parallax pakai translate3d
   - Guard mencegah re-init double
   ============================================================ */

'use strict';

if (!window.__LJ_SCROLL_INIT__) {
window.__LJ_SCROLL_INIT__ = true;

const ScrollReveal = {

  observer: null,
  counterObserver: null,
  _mutationObserver: null, /* PERBAIKAN: simpan referensi agar bisa disconnect */

  init() {
    this.initReveal();
    this.initCounters();
    this.initParallax();
  },

  /* ── SCROLL REVEAL ───────────────────────────────────────── */
  initReveal() {
    const options = {
      root:       null,
      rootMargin: '0px 0px -60px 0px',
      threshold:  0.10,
    };

    /* Disconnect observer lama jika ada sebelum buat baru */
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;

          el.style.willChange = 'opacity, transform';

          requestAnimationFrame(() => {
            el.classList.add('is-visible');
            if (el.hasAttribute('data-stagger')) {
              this.staggerChildren(el);
            }
          });

          this.observer.unobserve(el);

          /* Hapus will-change setelah transisi — bebaskan GPU memory */
          const duration = parseFloat(getComputedStyle(el).transitionDuration) * 1000 || 750;
          setTimeout(() => {
            el.style.willChange = 'auto';
          }, duration + 100);
        }
      });
    }, options);

    this.observeAll();
    this.watchDOMChanges();
  },

  observeAll() {
    if (!this.observer) return;

    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.top > -rect.height) {
        el.classList.add('is-visible');
        return;
      }
      this.observer.observe(el);
    });
  },

  staggerChildren(parent) {
    const children = parent.querySelectorAll('.reveal-child');
    children.forEach((child, i) => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          child.classList.add('is-visible');
        });
      }, i * 90);
    });
  },

  watchDOMChanges() {
    /* PERBAIKAN: Disconnect observer lama SEBELUM membuat yang baru
       Ini mencegah penumpukan observer setiap navigasi SPA */
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
      this._mutationObserver = null;
    }

    const target = document.getElementById('app-content') || document.body;

    this._mutationObserver = new MutationObserver(mutations => {
      let hasNewReveal = false;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('reveal')) hasNewReveal = true;
          if (node.querySelectorAll && node.querySelectorAll('.reveal').length > 0) hasNewReveal = true;
        });
      });

      if (hasNewReveal) {
        requestAnimationFrame(() => this.observeAll());
      }
    });

    /* Scope dipersempit: childList + subtree tapi hanya #app-content */
    this._mutationObserver.observe(target, { childList: true, subtree: true });
  },

  /* ── COUNTER ANIMATION ───────────────────────────────────── */
  initCounters() {
    /* Disconnect observer lama */
    if (this.counterObserver) {
      this.counterObserver.disconnect();
    }

    const counterOptions = {
      root:       null,
      rootMargin: '0px',
      threshold:  0.5,
    };

    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.counterObserver.unobserve(entry.target);
        }
      });
    }, counterOptions);

    document.querySelectorAll('[data-count]').forEach(el => {
      this.counterObserver.observe(el);
    });
  },

  animateCounter(el) {
    const target   = parseFloat(el.getAttribute('data-count'));
    const prefix   = el.getAttribute('data-prefix') || '';
    const suffix   = el.getAttribute('data-suffix') || '';
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
    const duration = 1800;
    const start    = performance.now();

    const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const current  = target * eased;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    };

    requestAnimationFrame(update);
  },

  /* ── SUBTLE PARALLAX ─────────────────────────────────────── */
  _parallaxTicking: false,

  initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;
    if ('ontouchstart' in window) return;

    parallaxEls.forEach(el => {
      el.style.willChange = 'transform';
    });

    window.addEventListener('scroll', () => {
      if (this._parallaxTicking) return;
      this._parallaxTicking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
          const speed  = parseFloat(el.getAttribute('data-parallax')) || 0.3;
          const rect   = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2 - window.innerHeight / 2;
          el.style.transform = 'translate3d(0, ' + (center * speed) + 'px, 0)';
        });
        this._parallaxTicking = false;
      });
    }, { passive: true });
  },
};

/* ── PROGRESS BAR ANIMATION ─────────────────────────────────── */
const ProgressAnimator = {
  _observer: null,

  init() {
    /* Disconnect observer lama */
    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.progress-fill');
          if (fill) {
            fill.style.willChange = 'transform';
            fill.classList.add('animate');
            fill.addEventListener('transitionend', () => {
              fill.style.willChange = 'auto';
            }, { once: true });
          }
          this._observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.progress-bar').forEach(bar => {
      this._observer.observe(bar);
    });
  },
};

/* ── DOM READY ──────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ScrollReveal.init();
    ProgressAnimator.init();
  });
} else {
  ScrollReveal.init();
  ProgressAnimator.init();
}

window.LJ = window.LJ || {};
window.LJ.ScrollReveal     = ScrollReveal;
window.LJ.ProgressAnimator = ProgressAnimator;

} /* end guard */