

document.addEventListener('DOMContentLoaded', () => {

  /* ── Loader ── */
  const loader = document.getElementById('loader');
  
  function dismissLoader() {
    if (loader.classList.contains('done')) return;
    setTimeout(() => loader.classList.add('done'), 400);
    setTimeout(() => heroEnter(), 700);
  }

  // Try all paths to ensure loader always dismisses
  window.addEventListener('load', dismissLoader);
  if (document.readyState === 'complete') {
    dismissLoader();
  }
  // Safety net: force dismiss after 3s no matter what
  setTimeout(dismissLoader, 3000);


  /* ── Hero entrance ── */
  function heroEnter() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.classList.add('entered');
    // stagger via data-delay
    hero.querySelectorAll('.anim').forEach(el => {
      const d = parseInt(el.dataset.delay || 0);
      el.style.transitionDelay = d + 'ms';
    });
  }


  /* ── Nav scroll ── */
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    lastScroll = window.scrollY;
  }, { passive: true });


  /* ── Active link ── */
  const links = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');

  function setActive() {
    const y = window.scrollY + 200;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav__link[href="#${sec.id}"]`);
      if (!link) return;
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });


  /* ── Mobile menu ── */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav__link').forEach(l => {
    l.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });


  /* ── Smooth scroll for anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });


  /* ── Scroll reveal (IntersectionObserver, no lag) ── */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Small stagger per batch
          entry.target.style.transitionDelay = (i * 60) + 'ms';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


  /* ── Form ── */
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn');
      const orig = btn.innerHTML;
      btn.innerHTML = 'Sent! <i class="ri-check-line"></i>';
      btn.style.background = '#0d9488';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        form.reset();
      }, 2500);
    });
  }

});


/* PARTICLE ANIMATION - Canvas, zero dependencies */

(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles;
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 140;
  const SPEED = 0.07;
  const COLOR = '218, 218, 218';       // teal RGB
  const MOUSE_RADIUS = 120;         // repulsion radius
  const MOUSE_FORCE  = 0.06;        // repulsion strength

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.strokeStyle = `rgba(${COLOR},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw & move particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR},0.4)`;
      ctx.fill();

      // Mouse repulsion
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < MOUSE_RADIUS && mdist > 0) {
        const force = (1 - mdist / MOUSE_RADIUS) * MOUSE_FORCE;
        p.vx += (mdx / mdist) * force;
        p.vy += (mdy / mdist) * force;
        // Clamp speed to 2× base
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const max = SPEED * 6;
        if (spd > max) { p.vx = (p.vx / spd) * max; p.vy = (p.vy / spd) * max; }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();