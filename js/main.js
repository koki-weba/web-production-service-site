/* =========================================
   HARUTO. Portfolio — main.js
   ========================================= */

/* ---- GSAP plugins ---- */
gsap.registerPlugin(ScrollTrigger);

/* =========================================
   1. LOADER
   ========================================= */
(function initLoader() {
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loaderBar');
  const loaderPct   = document.getElementById('loaderPercent');
  let pct = 0;

  document.body.classList.add('is-loading');

  const interval = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      loaderBar.style.width = '100%';
      loaderPct.textContent = '100%';

      setTimeout(() => {
        gsap.to(loader, {
          yPercent: -100,
          duration: 1,
          ease: 'expo.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            document.body.classList.remove('is-loading');
            initHeroAnimations();
          }
        });
      }, 400);
    } else {
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = Math.floor(pct) + '%';
    }
  }, 60);
})();

/* =========================================
   2. HERO CANVAS — Particle Network
   ========================================= */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.6;
      this.alpha = Math.random() * 0.6 + 0.2;
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.4;
        this.vy += (dy / dist) * force * 0.4;
      }
      // Damping
      this.vx *= 0.97;
      this.vy *= 0.97;
      this.x += this.vx;
      this.y += this.vy;
      // Wrap
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(163,163,163,${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor((W * H) / 8000), 140);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const MAX_DIST = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(163,163,163,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  resize();
  initParticles();
  render();
})();

/* =========================================
   3. CUSTOM CURSOR
   ========================================= */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let rx = 0, ry = 0;
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverSel = 'a, button, .work-card, .work-item, .service-card, .service-detail-card, .pricing-card, .tag, .tool-card, .faq-question, .contact-method-card, .filter-btn';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* =========================================
   4. HERO ANIMATIONS (called after loader)
   ========================================= */
function initHeroAnimations() {
  // Guard: only run on TOP page (inner pages use pages.js)
  if (!document.querySelector('.hero-word')) return;

  // Set GSAP initial states (avoids CSS-GSAP transform conflict)
  gsap.set('.hero-word', { yPercent: 110, opacity: 0 });
  gsap.set('#heroTypewriterWrap', { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Words reveal
  tl.to('.hero-word', {
    yPercent: 0,
    opacity: 1,
    duration: 1.1,
    stagger: 0.12,
  })
  .to('#heroTypewriterWrap', {
    opacity: 1,
    duration: 0.4,
  }, '-=0.3');

  // Start typewriter after hero reveals
  setTimeout(initTypewriter, 1200);
}

/* =========================================
   5. TYPEWRITER
   ========================================= */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    '個人店舗のWebサイトをプロが制作します',
    'ビジネスを加速するデザインを届けます',
    '北海道・札幌発、全国対応のWebクリエイター',
    'デザインからコーディングまでワンストップで',
  ];

  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 60);
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(tick, 500);
        return;
      }
      setTimeout(tick, 30);
    }
  }
  tick();
}

/* =========================================
   6. COUNTER ANIMATION
   ========================================= */
function initCounters() {
  document.querySelectorAll('.hero-stats .counter').forEach(el => {
    const target   = +el.dataset.target;
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = Math.min(now - startTime, duration);
      const progress = elapsed / duration;
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  });
}

/* =========================================
   7. HEADER SCROLL BEHAVIOR
   ========================================= */
(function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* =========================================
   8. HAMBURGER MENU
   ========================================= */
(function initHamburger() {
  const btn     = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!btn || !overlay) return;

  let open = false;
  function toggle() {
    open = !open;
    btn.classList.toggle('is-active', open);
    overlay.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);
  overlay.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => { if (open) toggle(); });
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) toggle(); });
})();

/* =========================================
   9. SCROLL REVEAL
   ========================================= */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = +(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('is-visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* =========================================
   10. MAGNETIC BUTTONS
   ========================================= */
(function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const factor = 0.28;
      gsap.to(el, {
        x: dx * factor,
        y: dy * factor,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });
  });
})();

/* =========================================
   11. WORK CARD TILT
   ========================================= */
(function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.work-card, .work-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / (rect.height / 2)) * -6;
      const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  6;
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
})();

/* =========================================
   12. SMOOTH SCROLL
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================
   13. BACK TO TOP
   ========================================= */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
})();

/* =========================================
   15. CONTACT FORM (basic — TOP page only)
   ========================================= */
(function initForm() {
  const form = document.getElementById('contactForm');
  // Inner pages load pages.js which handles full form validation
  if (!form || document.querySelector('.page-hero')) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;

    btnText.textContent = '送信中...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();

      btnText.textContent = '送信完了！ありがとうございます';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => {
        btnText.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    } catch {
      btnText.textContent = '送信に失敗しました。もう一度お試しください';
      btn.style.background = '#dc2626';
      btn.disabled = false;
      setTimeout(() => {
        btnText.textContent = originalText;
        btn.style.background = '';
      }, 3000);
    }
  });
})();

/* =========================================
   16. GSAP SCROLL-TRIGGERED DECORATIVE FX
   ========================================= */
(function initGsapScrollFx() {
  // Parallax on hero canvas — TOP page only
  if (document.querySelector('.hero-canvas')) {
    gsap.to('.hero-canvas', {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // Subtle parallax on about rings — TOP page only
  if (!document.querySelector('.about-avatar-wrap')) return;
  gsap.to('.about-avatar-wrap', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
})();
