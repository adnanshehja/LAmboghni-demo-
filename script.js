/* ============================================================
   THE LINEUP — interaction & motion
   Website created by Adnan Shaikh
   ============================================================ */
(() => {
  'use strict';

  const body = document.body;
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  /* Deterministic static mode: ?static=1 — skips the intro for previews. */
  const staticMode = new URLSearchParams(window.location.search).has('static');
  if (staticMode) {
    body.classList.remove('is-loading');
    body.classList.add('is-ready', 'is-static');
    document.getElementById('preloader')?.remove();
    $$('.reveal, .model').forEach((el) => el.classList.add('in-view'));
    $$('[data-count]').forEach((el) => {
      const value = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = decimals ? value.toFixed(decimals) : String(value);
    });
    window.addEventListener('load', () => {
      const target = window.location.hash ? document.querySelector(window.location.hash) : null;
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo(0, top);
      }
    }, { once: true });
  }

  /* ------------------------------------------------------------
     Preloader
  ------------------------------------------------------------ */
  const preloader = $('#preloader');
  const preloaderCount = $('#preloaderCount');
  const preloaderBar = $('.preloader__bar');
  let pageReady = false;

  const finishLoading = () => {
    if (pageReady) return;
    pageReady = true;
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    if (preloader) {
      preloader.classList.add('is-done');
      window.setTimeout(() => preloader.remove(), 900);
    }
    initAfterLoad();
  };

  if (!staticMode) {
    if (reduceMotion) {
      if (preloaderBar) preloaderBar.style.transform = 'scaleX(1)';
      if (preloaderCount) preloaderCount.textContent = '100';
      window.setTimeout(finishLoading, 120);
    } else {
      const duration = 1450;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (preloaderCount) preloaderCount.textContent = String(Math.round(eased * 100)).padStart(2, '0');
        if (preloaderBar) preloaderBar.style.transform = `scaleX(${eased})`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          window.setTimeout(finishLoading, 180);
        }
      };
      requestAnimationFrame(tick);

      // Never allow the intro to hold the page hostage.
      window.setTimeout(finishLoading, 4200);
    }
  }

  /* ------------------------------------------------------------
     Counters
  ------------------------------------------------------------ */
  const counterObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.55 })
    : null;

  function animateCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = reduceMotion ? 1 : 1500;
    const start = performance.now();

    const update = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      el.textContent = decimals ? current.toFixed(decimals) : String(Math.round(current));
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = decimals ? target.toFixed(decimals) : String(target);
    };
    requestAnimationFrame(update);
  }

  function watchCounters(scope = document) {
    if (!counterObserver) return;
    $$('[data-count]', scope).forEach((el) => {
      if (el.dataset.counted !== 'true') counterObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------
     Reveals
  ------------------------------------------------------------ */
  let revealObserver = null;
  function initReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal, .model').forEach((el) => el.classList.add('in-view'));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('in-view');
        if (el.matches('.model')) {
          watchCounters(el);
        }
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal, .model').forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------
     Header / scroll progress / hero parallax
  ------------------------------------------------------------ */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const heroCar = $('#heroCar');
  const hero = $('.hero');
  let scrollQueued = false;

  function updateScroll() {
    scrollQueued = false;
    const y = window.scrollY || window.pageYOffset;
    header?.classList.toggle('is-scrolled', y > 24);

    if (progress) {
      const max = Math.max(1, html.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
    }
  }

  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });

  if (finePointer && !reduceMotion && hero && heroCar) {
    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroCar.style.transform = `translate3d(${(x * 20).toFixed(2)}px, ${(y * 13).toFixed(2)}px, 0) rotate(${(x * 1.2).toFixed(2)}deg)`;
    });
    hero.addEventListener('mouseleave', () => {
      heroCar.style.transform = '';
    });
  }

  /* ------------------------------------------------------------
     Cursor glow
  ------------------------------------------------------------ */
  const glow = $('#cursorGlow');
  if (glow && finePointer && !reduceMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let glowFrame = 0;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!glowFrame) glowFrame = requestAnimationFrame(renderGlow);
    }, { passive: true });

    const renderGlow = () => {
      glowX += (mouseX - glowX) * 0.09;
      glowY += (mouseY - glowY) * 0.09;
      glow.style.transform = `translate3d(${glowX - 260}px, ${glowY - 260}px, 0)`;
      if (Math.abs(mouseX - glowX) > 0.4 || Math.abs(mouseY - glowY) > 0.4) {
        glowFrame = requestAnimationFrame(renderGlow);
      } else {
        glowFrame = 0;
      }
    };
  }

  /* ------------------------------------------------------------
     Model accordions
  ------------------------------------------------------------ */
  const modelToggles = $$('.model__toggle');
  modelToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const model = button.closest('.model');
      const willOpen = !model.classList.contains('is-open');

      $$('.model.is-open').forEach((openModel) => {
        if (openModel === model) return;
        openModel.classList.remove('is-open');
        const openToggle = $('.model__toggle', openModel);
        openToggle?.setAttribute('aria-expanded', 'false');
        if (openToggle) openToggle.setAttribute('aria-label', openToggle.getAttribute('aria-label').replace('Hide', 'Show'));
      });

      model.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace(willOpen ? 'Show' : 'Hide', willOpen ? 'Hide' : 'Show'));
    });
  });

  /* ------------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------------ */
  const menuBtn = $('#menuBtn');
  const nav = $('#primaryNav');

  function closeNav(returnFocus = false) {
    body.classList.remove('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Open menu');
    if (returnFocus) menuBtn?.focus();
  }

  menuBtn?.addEventListener('click', () => {
    const open = !body.classList.contains('nav-open');
    body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  $$('.nav__link').forEach((link) => link.addEventListener('click', () => closeNav()));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && body.classList.contains('nav-open')) closeNav();
  });

  /* ------------------------------------------------------------
     Credit modal + focus management
  ------------------------------------------------------------ */
  const creditModal = $('#creditModal');
  const searchPanel = $('#searchPanel');
  const searchInput = $('#searchInput');
  let lastFocused = null;

  function activeOverlay() {
    if (creditModal?.classList.contains('is-open')) return creditModal;
    if (searchPanel?.classList.contains('is-open')) return searchPanel;
    return null;
  }

  function openOverlay(overlay, focusTarget) {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    body.classList.add('no-scroll');
    closeNav();
    window.setTimeout(() => {
      (focusTarget || overlay.querySelector('button, input, a[href]'))?.focus();
    }, 60);
  }

  function closeOverlay(overlay, returnFocus = true) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (!activeOverlay()) body.classList.remove('no-scroll');
    if (returnFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  $$('[data-credit-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openOverlay(creditModal, $('.modal__close', creditModal));
    });
  });
  $$('[data-credit-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => closeOverlay(creditModal));
  });

  const searchOpen = $('#searchOpen');
  searchOpen?.addEventListener('click', () => {
    openOverlay(searchPanel, searchInput);
    if (searchInput) {
      searchInput.value = '';
      filterSearch('');
    }
  });
  $$('[data-search-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => closeOverlay(searchPanel));
  });
  $$('.search__results a').forEach((link) => {
    link.addEventListener('click', () => closeOverlay(searchPanel, false));
  });

  // Focus trap
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (searchPanel?.classList.contains('is-open')) {
        closeOverlay(searchPanel);
      } else if (creditModal?.classList.contains('is-open')) {
        closeOverlay(creditModal);
      } else if (body.classList.contains('nav-open')) {
        closeNav(true);
      }
      return;
    }

    if (event.key !== 'Tab') return;
    const overlay = activeOverlay();
    if (!overlay) return;
    const focusable = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', overlay)
      .filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ------------------------------------------------------------
     Search filter
  ------------------------------------------------------------ */
  const searchResults = $$('#searchResults a');
  const searchEmpty = $('#searchEmpty');
  const normalise = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  function filterSearch(value) {
    const query = normalise(value.trim());
    let visible = 0;
    searchResults.forEach((result) => {
      const haystack = normalise(`${result.textContent} ${result.dataset.searchTerm || ''}`);
      const match = !query || haystack.includes(query);
      result.hidden = !match;
      if (match) visible += 1;
    });
    if (searchEmpty) searchEmpty.hidden = visible !== 0;
  }

  searchInput?.addEventListener('input', (event) => filterSearch(event.target.value));

  /* ------------------------------------------------------------
     Copy credit
  ------------------------------------------------------------ */
  const copyButton = $('#copyCredit');
  const toast = $('#toast');
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // fall through to the legacy path
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }
    textarea.remove();
    return copied;
  };

  copyButton?.addEventListener('click', async () => {
    const credit = 'Website created by Adnan Shaikh — design & development, 2026. Lamborghini concept showcase.';
    const copied = await copyText(credit);
    showToast(copied ? 'Credit copied to clipboard' : 'Copy failed — credit: Adnan Shaikh');
    if (copied) {
      const label = copyButton.querySelector('span');
      if (label) {
        const previous = label.textContent;
        label.textContent = 'Copied';
        window.setTimeout(() => { label.textContent = previous; }, 1800);
      }
    }
  });

  /* ------------------------------------------------------------
     Init after preloader
  ------------------------------------------------------------ */
  function initAfterLoad() {
    updateScroll();
    initReveals();

    // Hero numbers are visible immediately; give them a moment to settle.
    window.setTimeout(() => {
      $$('.hero [data-count]').forEach(animateCounter);
    }, 260);

    // Anything already on-screen (e.g. deep-link reload) should reveal at once.
    requestAnimationFrame(() => {
      $$('.reveal, .model').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94) el.classList.add('in-view');
      });
    });
  }

  // If the browser restores the page from cache, don't show the intro again.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      preloader?.remove();
      initAfterLoad();
    }
  });
})();
