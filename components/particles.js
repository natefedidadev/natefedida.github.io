/* =========================================
   Particles Background — adapted from background.txt
   Vanilla JS port of the canvas particle system
   Orange palette to match site theme
   ========================================= */

(function () {
  /* ─── Config ───────────────────────────── */
  const QUANTITY   = 280;
  const STATICITY  = 50;
  const EASE       = 50;
  const BASE_SIZE  = 1.2;
  const VX         = 0;
  const VY         = 0;

  /* ─── Orange palette (RGB arrays) ──────── */
  const COLORS = [
    [217, 107,  48],   // #D96B30  — main orange
    [240, 149, 106],   // #F0956A  — light orange
    [232, 128,  74],   // #E8804A  — mid orange
    [192,  90,  36],   // #C05A24  — deep orange
    [245, 175, 130],   // #F5AF82  — soft peach
    [253, 220, 190],   // #FDDCBE  — pale cream-orange
    [184,  79,  30],   // #B84F1E  — burnt orange
    [255, 183, 120],   // #FFB778  — warm gold-orange
  ];

  /* ─── Setup canvas ──────────────────────── */
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');

  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:0',
  ].join(';');

  document.body.prepend(canvas);

  /* ─── State ─────────────────────────────── */
  const dpr       = window.devicePixelRatio || 1;
  const canvasSize = { w: 0, h: 0 };
  const mouse     = { x: 0, y: 0 };
  let   circles   = [];

  /* ─── Helpers ───────────────────────────── */
  function remapValue(value, s1, e1, s2, e2) {
    const r = ((value - s1) * (e2 - s2)) / (e1 - s1) + s2;
    return r > 0 ? r : 0;
  }

  function circleParams() {
    const rgb = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:          Math.random() * canvasSize.w,
      y:          Math.random() * canvasSize.h,
      translateX: 0,
      translateY: 0,
      size:       Math.floor(Math.random() * 2) + BASE_SIZE,
      alpha:      0,
      targetAlpha: parseFloat((Math.random() * 0.55 + 0.15).toFixed(2)),
      dx:         (Math.random() - 0.5) * 0.12,
      dy:         (Math.random() - 0.5) * 0.12,
      magnetism:  0.1 + Math.random() * 4,
      rgb,
    };
  }

  function drawCircle(circle, update = false) {
    const { x, y, translateX, translateY, size, alpha, rgb } = circle;
    ctx.save();
    ctx.translate(translateX, translateY);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
    ctx.fill();
    ctx.restore();
    if (!update) circles.push(circle);
  }

  /* ─── Init ──────────────────────────────── */
  function resizeCanvas() {
    circles = [];
    canvasSize.w = window.innerWidth;
    canvasSize.h = window.innerHeight;
    canvas.width  = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    canvas.style.width  = canvasSize.w + 'px';
    canvas.style.height = canvasSize.h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawParticles();
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    for (let i = 0; i < QUANTITY; i++) {
      drawCircle(circleParams());
    }
  }

  /* ─── Animation loop ────────────────────── */
  function animate() {
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    circles.forEach((circle, i) => {
      // Edge fade-out
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.h - circle.y - circle.translateY - circle.size,
      ];
      const closest = edge.reduce((a, b) => Math.min(a, b));
      const remapped = parseFloat(remapValue(closest, 0, 20, 0, 1).toFixed(2));

      if (remapped > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapped;
      }

      // Drift
      circle.x += circle.dx + VX;
      circle.y += circle.dy + VY;

      // Mouse magnetism
      circle.translateX += (mouse.x / (STATICITY / circle.magnetism) - circle.translateX) / EASE;
      circle.translateY += (mouse.y / (STATICITY / circle.magnetism) - circle.translateY) / EASE;

      drawCircle(circle, true);

      // Recycle off-screen particles
      const offscreen =
        circle.x < -circle.size ||
        circle.x > canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.h + circle.size;

      if (offscreen) {
        circles.splice(i, 1);
        drawCircle(circleParams());
      }
    });

    requestAnimationFrame(animate);
  }

  /* ─── Events ─────────────────────────────── */
  window.addEventListener('mousemove', (e) => {
    // Track relative to canvas center (matches original component logic)
    mouse.x = e.clientX - canvasSize.w / 2;
    mouse.y = e.clientY - canvasSize.h / 2;
  }, { passive: true });

  window.addEventListener('resize', resizeCanvas, { passive: true });

  /* ─── Boot ───────────────────────────────── */
  resizeCanvas();
  animate();
})();
