/* =========================================
   HARUTO. Portfolio — pages.js
   Inner page JavaScript (WORKS / SERVICE / SKILL / CONTACT)
   ========================================= */

/* =========================================
   PAGE HERO ANIMATION
   Runs after main.js loader completes — but on
   inner pages the loader fires initHeroAnimations()
   which targets .hero-word (absent here).
   We override with our own page hero animation.
   ========================================= */
(function initPageHero() {
  const word1   = document.getElementById('heroWord1');
  const word2   = document.getElementById('heroWord2');
  const desc    = document.getElementById('heroDesc');
  const breadc  = document.getElementById('breadcrumb');
  if (!word1) return;

  // Wait for main.js loader to finish (it removes is-loading)
  function waitForLoader() {
    if (!document.body.classList.contains('is-loading')) {
      runPageHeroAnim();
    } else {
      requestAnimationFrame(waitForLoader);
    }
  }

  function runPageHeroAnim() {
    gsap.set([word1, word2], { yPercent: 110, opacity: 0 });
    if (desc)   gsap.set(desc,   { y: 20, opacity: 0 });
    if (breadc) gsap.set(breadc, { y: 10, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    if (breadc) {
      tl.to(breadc, { y: 0, opacity: 1, duration: 0.6 });
    }
    tl.to(word1, { yPercent: 0, opacity: 1, duration: 1.0 }, breadc ? '-=0.3' : 0)
      .to(word2, { yPercent: 0, opacity: 1, duration: 1.0 }, '-=0.75');

    if (desc) {
      tl.to(desc, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5');
    }
  }

  waitForLoader();
})();

/* =========================================
   WORKS PAGE — FILTER
   ========================================= */
(function initWorksFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.work-item');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      btns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      items.forEach(item => {
        const cat = item.dataset.cat;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('is-hidden');
          gsap.to(item, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
        } else {
          item.classList.add('is-hidden');
          gsap.to(item, { opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' });
        }
      });
    });
  });
})();

/* =========================================
   WORKS PAGE — MODAL
   ========================================= */
(function initWorksModal() {
  const backdrop  = document.getElementById('worksModal');
  const modalHdr  = document.getElementById('worksModalHeader');
  const closeBtn  = document.getElementById('worksModalClose');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta  = document.getElementById('modalMeta');
  const modalDesc  = document.getElementById('modalDesc');
  const modalTags  = document.getElementById('modalTags');
  if (!backdrop) return;

  document.querySelectorAll('.work-item').forEach(item => {
    item.querySelector('.work-item-overlay-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      openModal(item);
    });
    item.addEventListener('click', () => openModal(item));
  });

  function openModal(item) {
    const title   = item.dataset.title   || '';
    const summary = item.dataset.summary || '';
    const tags    = (item.dataset.tags   || '').split(',');
    const period  = item.dataset.period  || '';
    const price   = item.dataset.price   || '';
    const cat     = item.dataset.cat     || '';
    const grad    = item.dataset.grad    || '';

    if (modalBadge) modalBadge.textContent = cat.toUpperCase();
    if (modalTitle) modalTitle.textContent = title;
    if (modalHdr)   modalHdr.style.background = grad;

    if (modalMeta) {
      modalMeta.innerHTML = `
        <div class="works-modal-meta-item">
          <span class="works-modal-meta-label">カテゴリ</span>
          <span class="works-modal-meta-value">${cat.toUpperCase()}</span>
        </div>
        <div class="works-modal-meta-item">
          <span class="works-modal-meta-label">制作期間</span>
          <span class="works-modal-meta-value">${period}</span>
        </div>
        <div class="works-modal-meta-item">
          <span class="works-modal-meta-label">料金</span>
          <span class="works-modal-meta-value">${price}</span>
        </div>
      `;
    }
    if (modalDesc) modalDesc.textContent = summary;
    if (modalTags) {
      modalTags.innerHTML = tags.map(t => `<span>${t.trim()}</span>`).join('');
    }

    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* =========================================
   SERVICE PAGE — FAQ ACCORDION
   CONTACT PAGE — FAQ ACCORDION
   ========================================= */
(function initFaq() {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;

  faqList.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all
      faqList.querySelectorAll('.faq-item.is-open').forEach(openItem => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

/* =========================================
   SKILL PAGE — SKILL BARS ANIMATION
   ========================================= */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill  = entry.target;
      const width = fill.dataset.width || '0';
      // Slight delay per bar for staggered effect
      const siblings = Array.from(fill.closest('.skill-category')?.querySelectorAll('.skill-bar-fill') || [fill]);
      const idx = siblings.indexOf(fill);
      setTimeout(() => {
        fill.style.width = width + '%';
      }, idx * 120);
      observer.unobserve(fill);
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => observer.observe(fill));
})();

/* =========================================
   SKILL PAGE — COUNTER (for stats row)
   NOTE: skill page has .counter elements in the
   stats row. The main.js counter runs on page load
   but those elements are not visible. We re-trigger
   on scroll for the skill page stats.
   ========================================= */
(function initSkillCounters() {
  const statsRow = document.querySelector('.skill-stats-row');
  if (!statsRow) return;

  let triggered = false;
  const observer = new IntersectionObserver((entries) => {
    if (triggered) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      triggered = true;
      statsRow.querySelectorAll('.counter').forEach(el => {
        const target   = +el.dataset.target;
        const duration = 1600;
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
    });
  }, { threshold: 0.4 });

  observer.observe(statsRow);
})();

/* =========================================
   CONTACT PAGE — FORM VALIDATION & SUBMIT
   ========================================= */
(function initContactPageForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !submitBtn) return;

  // Input focus styles
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.form-group')?.classList.add('is-focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.form-group')?.classList.remove('is-focused');
      if (input.value) input.closest('.form-group')?.classList.add('has-value');
      else input.closest('.form-group')?.classList.remove('has-value');
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) {
      gsap.to(form, {
        x: [-8, 8, -6, 6, 0],
        duration: 0.4,
        ease: 'power2.out',
      });
      return;
    }

    // Submit animation
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = '送信中...';
    submitBtn.disabled = true;
    gsap.to(submitBtn, { opacity: 0.7, duration: 0.2 });

    setTimeout(() => {
      gsap.to(submitBtn, { opacity: 1, duration: 0.3 });
      btnText.textContent = '✓ 送信が完了しました！';
      submitBtn.style.background = '#16a34a';
      submitBtn.style.boxShadow = '0 8px 24px rgba(22,163,74,0.3)';

      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.boxShadow = '';
        submitBtn.disabled = false;
        form.reset();
        form.querySelectorAll('.form-group').forEach(g => {
          g.classList.remove('has-value', 'is-focused');
        });
        form.querySelectorAll('[required]').forEach(f => {
          f.style.borderColor = '';
        });
      }, 4000);
    }, 1400);
  });
})();

/* =========================================
   INNER PAGE — HEADER ALWAYS SCROLLED
   On inner pages the header starts with .scrolled
   (set in HTML), so no logic needed for top state.
   Just add back-to-top.
   ========================================= */
(function initPageBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  // Make sure it scrolls to top of page
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
