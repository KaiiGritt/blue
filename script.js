/* ======================================
   ROMANTIC MONTHSARY WEBSITE - SCRIPTS
   ====================================== */

// ==========================================
// 1. THREE.JS STARFIELD BACKGROUND
// ==========================================
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 300;

  // Create stars
  const starCount = 1500;
  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const twinkleSpeeds = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    sizes[i] = Math.random() * 2.5 + 0.5;
    twinkleSpeeds[i] = Math.random() * 2 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for twinkling
  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x4DA6FF) }
    },
    vertexShader: `
      attribute float size;
      varying float vSize;
      void main() {
        vSize = size;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying float vSize;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= 0.5 + 0.5 * sin(uTime * (1.0 + vSize) + vSize * 10.0);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Floating particles
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 600;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.15,
      y: (Math.random() - 0.5) * 0.15,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x7EC8E3,
    size: 1.5,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Mouse position for subtle camera movement
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    starMaterial.uniforms.uTime.value += 0.01;

    // Subtle camera movement
    camera.position.x += (mouseX * 15 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 15 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Rotate stars slowly
    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.00005;

    // Float particles
    const pPos = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] += particleVelocities[i].x;
      pPos[i * 3 + 1] += particleVelocities[i].y;
      pPos[i * 3 + 2] += particleVelocities[i].z;

      // Wrap around
      if (Math.abs(pPos[i * 3]) > 300) particleVelocities[i].x *= -1;
      if (Math.abs(pPos[i * 3 + 1]) > 300) particleVelocities[i].y *= -1;
      if (Math.abs(pPos[i * 3 + 2]) > 150) particleVelocities[i].z *= -1;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ==========================================
// 2. CUSTOM GLOWING CURSOR
// ==========================================
(function initCursor() {
  const cursor = document.getElementById('cursor-glow');

  // Check for touch device
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
})();


// ==========================================
// 3. TYPING EFFECT
// ==========================================
(function initTypingEffect() {
  const messages = [
    "Every moment with you is a dream I never want to wake up from...",
    "You are the reason I believe in love...",
    "Two months of pure magic with you...",
    "I would choose you in a hundred lifetimes..."
  ];

  const typedText = document.getElementById('typed-text');
  let msgIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentMsg = messages[msgIndex];

    if (isDeleting) {
      typedText.textContent = currentMsg.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedText.textContent = currentMsg.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentMsg.length) {
      delay = 2500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      msgIndex = (msgIndex + 1) % messages.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 1500);
})();


// ==========================================
// 4. BUTTON RIPPLE EFFECT
// ==========================================
document.querySelectorAll('.glow-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('div');
    ripple.className = 'btn-ripple';
    const rect = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.animation = 'ripple-effect 0.6s ease-out';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});


// ==========================================
// 5. OPEN HEART BUTTON — SCROLL + HEARTS
// ==========================================
document.getElementById('open-heart-btn').addEventListener('click', () => {
  // Spawn heart particles
  spawnHeartParticles(15);

  // Smooth scroll to timeline
  setTimeout(() => {
    document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
  }, 300);
});

function spawnHeartParticles(count) {
  const container = document.getElementById('heart-particles');
  const hearts = ['💙', '💎', '✨', '🤍', '💙'];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.top = (40 + Math.random() * 40) + '%';
    heart.style.animationDelay = Math.random() * 0.8 + 's';
    heart.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 3500);
  }
}


// ==========================================
// 6. SCROLL-TRIGGERED FADE-IN ANIMATIONS
// ==========================================
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();


// ==========================================
// 7. INTERACTIVE TIMELINE
// ==========================================
document.querySelectorAll('.timeline-item').forEach(item => {
  item.addEventListener('click', () => {
    // Toggle active state
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
    }
  });
});


// ==========================================
// 8. FLIP CARDS
// ==========================================
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});


// ==========================================
// 9. COUNTDOWN TIMER
// ==========================================
(function initCountdown() {
  function getNextMonthsary() {
    const now = new Date();
    // Relationship started on the 20th
    const day = 20;
    let month = now.getMonth();
    let year = now.getFullYear();

    // Find next monthsary date
    let target = new Date(year, month, day);
    if (target <= now) {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      target = new Date(year, month, day);
    }
    return target;
  }

  function updateCountdown() {
    const now = new Date();
    const target = getNextMonthsary();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();


// ==========================================
// 10. SECRET SURPRISE SECTION
// ==========================================
(function initSurprise() {
  const input = document.getElementById('secret-password');
  const unlockBtn = document.getElementById('unlock-btn');
  const wrongMsg = document.getElementById('wrong-msg');
  const loveLetter = document.getElementById('love-letter');

  // Set the password — change this to his actual nickname!
  const PASSWORD = 'babe';

  function tryUnlock() {
    const value = input.value.trim().toLowerCase();

    if (value === PASSWORD) {
      // Success!
      wrongMsg.classList.remove('show');
      loveLetter.classList.add('show');
      input.parentElement.style.display = 'none';
      document.querySelector('.surprise-hint').textContent = 'You unlocked my heart! 💙';
      launchConfetti();
    } else {
      // Wrong
      wrongMsg.classList.add('show');
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      setTimeout(() => wrongMsg.classList.remove('show'), 3000);
    }
  }

  unlockBtn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });
})();

// Confetti launcher
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#4DA6FF', '#7EC8E3', '#FFFFFF', '#162B5B', '#ff6b8a', '#ffd700'];

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.width = (5 + Math.random() * 10) + 'px';
    piece.style.height = (5 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}


// ==========================================
// 11. MUSIC TOGGLE
// ==========================================
(function initMusic() {
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      musicBtn.querySelector('span').textContent = '🎵 Play Our Song';
    } else {
      audio.play().catch(() => {
        // Autoplay blocked — that's okay
      });
      musicBtn.querySelector('span').textContent = '⏸️ Pause Music';
    }
    isPlaying = !isPlaying;
  });
})();


// ==========================================
// 12. FOREVER BUTTON — HEARTS + GLOW BURST
// ==========================================
document.getElementById('forever-btn').addEventListener('click', () => {
  // Glow burst
  const burst = document.createElement('div');
  burst.className = 'glow-burst';
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 1500);

  // Floating hearts
  const container = document.getElementById('floating-hearts');
  const hearts = ['💙', '💎', '🤍', '✨', '💙', '🦋', '💙'];

  for (let i = 0; i < 30; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 2 + 's';
    heart.style.animationDuration = (3 + Math.random() * 3) + 's';
    heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }
});


// ==========================================
// 13. PARALLAX SCROLL EFFECT
// ==========================================
(function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const speed = 0.05;
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = rect.top * speed;
        section.style.transform = `translateY(${offset}px)`;
      }
    });
  }, { passive: true });
})();
