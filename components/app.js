/* =========================================
   Nathaniel Fedida — Portfolio Scripts
   ========================================= */

/* ─── Nav scroll state ─────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ─── Intersection Observer — reveal ────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Observe all reveal targets
document.querySelectorAll('[data-reveal], .reveal-up').forEach((el) => {
  revealObserver.observe(el);
});

/* ═══════════════════════════════════════════
   Projects — sticky scroll swap system
   ═══════════════════════════════════════════ */

const panels   = Array.from(document.querySelectorAll('.project-panel'));
const tracker  = document.getElementById('projTracker');
const dotsWrap = document.getElementById('trackerDots');
const counter  = document.getElementById('trackerCounter');
const outerEl  = document.getElementById('projectsOuter');
const N        = panels.length;

/* ── Set outer scroll height (N viewports of scroll fuel) ── */
function setOuterHeight() {
  if (outerEl) outerEl.style.height = (N * window.innerHeight) + 'px';
}
setOuterHeight();
window.addEventListener('resize', setOuterHeight, { passive: true });

/* ── Build tracker dots ─────────────────── */
if (dotsWrap && N) {
  panels.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'tracker-dot';
    btn.setAttribute('aria-label', `Project ${i + 1}`);
    btn.addEventListener('click', () => {
      if (!outerEl) return;
      const outerTop = outerEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: outerTop + i * window.innerHeight, behavior: 'smooth' });
    });
    dotsWrap.appendChild(btn);
  });
}

const dots = Array.from(dotsWrap ? dotsWrap.querySelectorAll('.tracker-dot') : []);
let lastActive = -1;

function setActive(index) {
  if (index === lastActive) return;
  lastActive = index;
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  if (counter) counter.textContent = String(index + 1).padStart(2, '0');
}
setActive(0);

/* ── Cache elements for direct JS transforms ── */
const panelData = panels.map(panel => ({
  num:     panel.querySelector('.project-num'),
  name:    panel.querySelector('.project-name'),
  sub:     panel.querySelector('.project-sub'),
  outcome: panel.querySelector('.project-outcome'),
  stack:   panel.querySelector('.project-stack'),
  github:  panel.querySelector('.project-github'),
  image:   panel.querySelector('.image-inner'),
}));

/* ── Scroll-driven panel animation ─────── */
let rafPending = false;

function updateProjects() {
  if (!outerEl) return;

  const vhPx     = window.innerHeight;
  const outerTop = outerEl.getBoundingClientRect().top + window.scrollY;
  const scrolled = Math.max(0, window.scrollY - outerTop);
  const globalT  = scrolled / vhPx;

  /* tracker visibility */
  const inZone = window.scrollY >= outerTop - vhPx * 0.3 &&
                 window.scrollY < outerTop + N * vhPx;
  if (tracker) tracker.classList.toggle('visible', inZone);

  setActive(Math.min(Math.max(0, Math.floor(globalT)), N - 1));

  panels.forEach((panel, i) => {
    const t    = globalT - i;
    const inT  = Math.max(0, Math.min(1, t + 1)); // 0→1 entering
    const outT = Math.max(0, Math.min(1, t));      // 0→1 exiting

    /* p: +1 = one panel-height below, 0 = in position, -1 = one panel-height above */
    const p = 1 - inT - outT;

    /* ── Whole panel slides as a solid unit ──────────────────────────────
       Each panel has background:var(--bg) so it fully covers the one behind.
       DOM order gives panel[i+1] higher z-index than panel[i] naturally —
       the entering panel always rises ON TOP of the exiting one.
       .projects-sticky overflow:hidden clips panels at ±100% off-screen. */
    panel.style.transform     = `translateY(${(p * 100).toFixed(2)}%)`;
    panel.style.pointerEvents = (inT > 0.9 && outT < 0.1) ? 'auto' : 'none';

    /* Line + ghost: simple var substitution, no calc multiplication */
    const activity = inT * (1 - outT);
    panel.style.setProperty('--line-scale',    activity.toFixed(4));
    panel.style.setProperty('--ghost-opacity', (0.04 * activity).toFixed(4));

    /* ── Parallax: elements float at different speeds relative to panel ──
       Title moves most (depth), button moves least — creates natural stagger
       as the panel slides. All relative to the already-moving panel. */
    const els = panelData[i];
    const rel = (px) => `translateY(${(p * px).toFixed(1)}px)`;

    if (els.num)     els.num.style.transform     = rel(40);
    if (els.name)    els.name.style.transform    = rel(80);
    if (els.sub)     els.sub.style.transform     = rel(60);
    if (els.outcome) els.outcome.style.transform = rel(50);
    if (els.stack)   els.stack.style.transform   = rel(40);
    if (els.github)  els.github.style.transform  = rel(30);

    /* Image drifts slightly slower than panel for depth */
    if (els.image) {
      const sc = (1.04 - inT * 0.04).toFixed(3);
      els.image.style.transform = `translateY(${(p * 50).toFixed(1)}px) scale(${sc})`;
    }
  });

  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(updateProjects);
  }
}, { passive: true });

updateProjects();

/* ─── Smooth hover parallax on photo ────── */
const photoFrame = document.querySelector('.photo-frame');
if (photoFrame) {
  photoFrame.addEventListener('mousemove', (e) => {
    const rect = photoFrame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    const photo = photoFrame.querySelector('.hero-photo');
    if (photo) {
      photo.style.transform = `scale(1.03) translate(${dx * 6}px, ${dy * 6}px)`;
    }
  });

  photoFrame.addEventListener('mouseleave', () => {
    const photo = photoFrame.querySelector('.hero-photo');
    if (photo) {
      photo.style.transform = '';
    }
  });
}

/* ─── Smooth scroll for anchor links ────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── Subtle cursor trail on hero ─────── */
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(pointer: fine)').matches) {
  const trail = document.createElement('div');
  trail.style.cssText = `
    position: fixed;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(217, 107, 48, 0.4);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s, transform 0.15s;
    opacity: 0;
  `;
  document.body.appendChild(trail);

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;
  let isInHero = false;

  hero.addEventListener('mouseenter', () => {
    isInHero = true;
    trail.style.opacity = '1';
  });
  hero.addEventListener('mouseleave', () => {
    isInHero = false;
    trail.style.opacity = '0';
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let rafId;
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    rafId = requestAnimationFrame(animateTrail);
  }
  animateTrail();
}


/* ─── Section label counter animation ────── */
function animateValue(el, start, end, duration) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * (end - start) + start) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.stat-num[data-count]');
        nums.forEach((num) => {
          const end = parseInt(num.dataset.count, 10);
          animateValue(num, 0, end, 1200);
        });
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statObserver.observe(statsEl);
