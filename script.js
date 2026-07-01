/* ============================================================
   KESHAVARAJ B — JARVIS-STYLE PORTFOLIO JS
   Canvas particle network, typewriter, counters, scroll-spy,
   reveal, HUD widget, 3D tilt, magnetic buttons, glitch,
   scroll beam — ported from ariv98 with color adjustments
   ============================================================ */
;(function () {
  'use strict';

  /* ---------- CANVAS PARTICLE NETWORK + RINGS ---------- */
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], rings = [];
  let mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Structured particle density with hub clusters
    const density = Math.min(200, Math.floor((W * H) / 8000));
    const hubs = [
      { x: W * 0.08, y: H * 0.26 },
      { x: W * 0.24, y: H * 0.70 },
      { x: W * 0.50, y: H * 0.22 },
      { x: W * 0.76, y: H * 0.68 },
      { x: W * 0.92, y: H * 0.30 },
    ];
    const bottomCount = Math.max(14, Math.floor(density * 0.12));
    const coverageCount = Math.floor((density - hubs.length - bottomCount) * 0.78);
    const clusteredCount = density - hubs.length - bottomCount - coverageCount;
    const cols = Math.max(8, Math.ceil(Math.sqrt(coverageCount * (W / H))));
    const rows = Math.max(5, Math.ceil(coverageCount / cols));
    const cellW = W / cols, cellH = H / rows;

    // Hub particles
    particles = hubs.map((hub, i) => ({
      x: hub.x, y: hub.y,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: i === 4 ? 1.9 : 1.6,
      tone: i % 3 === 1 ? 'coral' : 'blue',
      pulse: Math.random() * Math.PI * 2,
      hub: true,
    }));

    // Evenly distributed coverage particles
    for (let row = 0; row < rows && particles.length < hubs.length + coverageCount; row++) {
      for (let col = 0; col < cols && particles.length < hubs.length + coverageCount; col++) {
        particles.push({
          x: col * cellW + (0.18 + Math.random() * 0.64) * cellW,
          y: row * cellH + (0.18 + Math.random() * 0.64) * cellH,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.45 + 0.8,
          tone: Math.random() < 0.8 ? 'blue' : 'coral',
          pulse: Math.random() * Math.PI * 2,
          hub: false,
        });
      }
    }

    // Clustered particles around hubs
    for (let i = 0; i < clusteredCount; i++) {
      const hub = hubs[i % hubs.length];
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 110;
      particles.push({
        x: Math.min(W - 10, Math.max(10, hub.x + Math.cos(angle) * radius)),
        y: Math.min(H - 10, Math.max(10, hub.y + Math.sin(angle) * radius)),
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.8 + 0.9,
        tone: Math.random() < 0.76 ? 'blue' : 'coral',
        pulse: Math.random() * Math.PI * 2,
        hub: false,
      });
    }

    // Bottom band particles
    for (let i = 0; i < bottomCount; i++) {
      particles.push({
        x: 10 + Math.random() * (W - 20),
        y: H * (0.78 + Math.random() * 0.18),
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.55 + 0.85,
        tone: Math.random() < 0.82 ? 'blue' : 'coral',
        pulse: Math.random() * Math.PI * 2,
        hub: false,
      });
    }

    // Holographic concentric rings
    rings = [
      { r: 90,  speed: 0.0035,  dash: [2, 8],   color: 'rgba(74, 158, 255, 0.55)', width: 1 },
      { r: 140, speed: -0.0022, dash: [10, 6],  color: 'rgba(74, 158, 255, 0.35)', width: 1 },
      { r: 210, speed: 0.0014,  dash: [4, 14],  color: 'rgba(255, 107, 138, 0.30)', width: 1 },
      { r: 290, speed: -0.0009, dash: [],        color: 'rgba(74, 158, 255, 0.18)', width: 0.8 },
    ];
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse & touch tracking
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchmove', e => {
    if (e.touches.length) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.active = false; });

  function drawRings(t) {
    const cx = W / 2, cy = H / 2;
    for (const ring of rings) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * ring.speed);
      ctx.beginPath();
      ctx.setLineDash(ring.dash);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.width;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 12;
      ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }

  // HUD-style segmented link between particles
  function drawHudLink(from, to, strokeStyle, lineWidth, isHubLink) {
    const vx = to.x - from.x, vy = to.y - from.y;
    const seg = isHubLink ? 0.34 : 0.26;
    const midX = from.x + vx * 0.5, midY = from.y + vy * 0.5;
    const fsx = from.x + vx * seg, fsy = from.y + vy * seg;
    const tsx = to.x - vx * seg, tsy = to.y - vy * seg;

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(fsx, fsy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tsx, tsy); ctx.lineTo(to.x, to.y); ctx.stroke();

    ctx.fillStyle = strokeStyle;
    ctx.beginPath(); ctx.arc(midX, midY, isHubLink ? 1.4 : 1, 0, Math.PI * 2); ctx.fill();
  }

  function animate(timestamp) {
    ctx.clearRect(0, 0, W, H);
    drawRings(timestamp || 0);

    // Update particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.pulse += 0.085;
    }

    // Connections — nearest-neighbor with link limits
    const maxDist = 165, maxDist2 = maxDist * maxDist, maxLinks = 3;
    const linkCounts = new Array(particles.length).fill(0);
    const linkLimits = particles.map(p => p.hub ? 6 : maxLinks);

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      if (linkCounts[i] >= linkLimits[i]) continue;

      const candidates = [];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        if (linkCounts[j] >= linkLimits[j]) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) candidates.push({ j, d2 });
      }
      candidates.sort((l, r) => l.d2 - r.d2);

      for (const c of candidates) {
        if (linkCounts[i] >= linkLimits[i]) break;
        if (linkCounts[c.j] >= linkLimits[c.j]) continue;
        const b = particles[c.j];
        const d = Math.sqrt(c.d2);
        const isHubLink = a.hub || b.hub;
        const alpha = Math.pow(1 - d / maxDist, 1.15) * (isHubLink ? 0.78 : 0.48);
        const useCoral = a.tone === 'coral' && b.tone === 'coral';
        const strokeStyle = useCoral
          ? `rgba(255, 107, 138, ${alpha})`
          : `rgba(74, 158, 255, ${alpha})`;
        drawHudLink(a, b, strokeStyle, isHubLink ? 1.05 : 0.72, isHubLink);
        linkCounts[i]++;
        linkCounts[c.j]++;
      }

      // Mouse interaction — beam lines to nearby particles
      if (mouse.active) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) {
          const alpha = (1 - d / 170) * 0.55;
          ctx.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // Draw glowing particles
    for (const p of particles) {
      const pulse = 0.74 + Math.sin(p.pulse) * 0.38;
      const r = p.r * pulse;
      const color = p.tone === 'blue' ? '74, 158, 255' : '255, 107, 138';
      const glowRadius = p.hub ? r * 5.6 : r * 5.4;

      // Outer glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      grad.addColorStop(0, `rgba(${color}, 0.78)`);
      grad.addColorStop(0.45, `rgba(${color}, ${p.hub ? 0.18 : 0.20})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Solid core
      ctx.fillStyle = `rgba(${color}, 0.98)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.hub ? r * 1.02 : r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouse cursor reactor glow — visible tracking circle
    if (mouse.active) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
      grad.addColorStop(0, 'rgba(74, 158, 255, 0.35)');
      grad.addColorStop(0.5, 'rgba(74, 158, 255, 0.1)');
      grad.addColorStop(1, 'rgba(74, 158, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  /* ---------- TYPEWRITER ---------- */
  const phrases = [
    'Product Software Engineer',
    'Java & Spring Boot Developer',
    'Integration Specialist',
    'AI & MCP Enthusiast'
  ];
  const typedEl = document.getElementById('typed');
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function typeLoop() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      typedEl.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeLoop, 2000);
        return;
      }
      setTimeout(typeLoop, 80);
    } else {
      typedEl.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 40);
    }
  }
  typeLoop();

  /* ---------- COUNTER ANIMATION ---------- */
  function animateCounters() {
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const dur = 1500;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(p * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounters(); statsObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObs.observe(statsSection);

  /* ---------- SCROLL-SPY ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  function scrollSpy() {
    const scrollY = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const h = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + h) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  window.addEventListener('scroll', scrollSpy);

  /* ---------- NAVBAR SCROLL ---------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ---------- HAMBURGER ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.querySelector('.nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksEl.classList.toggle('open');
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinksEl.classList.remove('open');
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('active'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- BACK TO TOP ---------- */
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 600);
  });
  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 3D TILT ON CARDS ---------- */
  document.querySelectorAll('.ai-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- MAGNETIC BUTTONS ---------- */
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ---------- HERO SPOTLIGHT ---------- */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      heroSection.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
      heroSection.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
      heroSection.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(74,158,255,0.06), transparent 60%)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroSection.style.background = '';
    });
  }

  /* ---------- HUD WIDGET ---------- */
  const hud = document.createElement('div');
  hud.className = 'hud-widget';
  hud.innerHTML = `
    <div class="hud-line"><span class="hud-label">SYS</span><span class="hud-value online"><span class="hud-dot"></span> ONLINE</span></div>
    <div class="hud-line"><span class="hud-label">LOC</span><span class="hud-value" id="hud-loc">HERO</span></div>
    <div class="hud-line"><span class="hud-label">PRG</span><span class="hud-value" id="hud-scroll">0%</span></div>
    <div class="hud-line"><span class="hud-label">UTC</span><span class="hud-value" id="hud-utc">--:--:--</span></div>`;
  document.body.appendChild(hud);

  const hudLoc = document.getElementById('hud-loc');
  const hudScroll = document.getElementById('hud-scroll');
  const hudUtc = document.getElementById('hud-utc');

  // scroll % + current section
  window.addEventListener('scroll', () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    hudScroll.textContent = (scrollMax > 0 ? Math.round((window.scrollY / scrollMax) * 100) : 0) + '%';
    // update location
    const sections = document.querySelectorAll('section[id]');
    let current = 'HERO';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id.toUpperCase(); });
    hudLoc.textContent = current;
  });

  // UTC clock
  function updateUtc() {
    const now = new Date();
    hudUtc.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  }
  updateUtc();
  setInterval(updateUtc, 1000);

  /* ---------- SCROLL BEAM ---------- */
  const beam = document.createElement('div');
  beam.className = 'scroll-beam';
  beam.innerHTML = '<div class="scroll-beam-fill"></div>';
  document.body.appendChild(beam);
  const beamFill = beam.querySelector('.scroll-beam-fill');
  window.addEventListener('scroll', () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollMax > 0 ? (window.scrollY / scrollMax) * 100 : 0;
    beamFill.style.width = pct + '%';
  });

  /* ---------- SMOOTH ANCHOR SCROLLING ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
