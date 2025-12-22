// Mobile menu toggle logic
(function () {
  var btn = document.getElementById('mobileMenuBtn');
  var panel = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('iconOpen');
  var iconClose = document.getElementById('iconClose');

  if (!btn || !panel) return;

  btn.addEventListener('click', function () {
    var isHidden = panel.classList.contains('hidden');
    if (isHidden) {
      panel.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      panel.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking a link (improves mobile UX)
  panel.addEventListener('click', function (e) {
    if (e.target.tagName.toLowerCase() === 'a') {
      panel.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Dynamic year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

// Smooth scrolling for anchor links
(function () {
  document.addEventListener('click', function (e) {
    var target = e.target;
    // Find the closest anchor tag
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.tagName === 'A' && target.getAttribute('href')) {
      var href = target.getAttribute('href');
      // Check if it's an internal anchor link
      if (href.startsWith('#') && href.length > 1) {
        var targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          // Update URL hash without jumping
          history.pushState(null, null, href);
        }
      }
    }
  });
})();

// Theme toggle logic
(function () {
  var root = document.documentElement;
  var toggleButtons = document.querySelectorAll('[data-theme-toggle]');
  var storageKey = 'ps-theme-preference';
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function safeGetStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      return null;
    }
  }

  function safeStoreTheme(value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (err) {
      // Storage might be unavailable (private mode). Ignore gracefully.
    }
  }

  function getPreferredTheme() {
    var stored = safeGetStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return mediaQuery.matches ? 'dark' : 'light';
  }

  function setPressedState(isDark) {
    toggleButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      var sun = btn.querySelector('[data-theme-icon="sun"]');
      var moon = btn.querySelector('[data-theme-icon="moon"]');
      if (sun && moon) {
        sun.classList.toggle('hidden', !isDark);
        moon.classList.toggle('hidden', isDark);
      }
    });
  }

  function applyTheme(theme) {
    var isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    setPressedState(isDark);
  }

  function toggleTheme() {
    var nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    safeStoreTheme(nextTheme);
    applyTheme(nextTheme);
  }

  applyTheme(getPreferredTheme());

  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  function handleSystemChange(event) {
    if (safeGetStoredTheme() === null) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  }

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleSystemChange);
  }
})();

// Hero carousel logic
(function () {
  var carousel = document.getElementById('heroCarousel');
  if (!carousel) return;
  var track = carousel.querySelector('[data-carousel-track]');
  var slides = Array.prototype.slice.call(track.querySelectorAll('[data-carousel-slide]'));
  var prevBtn = carousel.querySelector('[data-carousel-prev]');
  var nextBtn = carousel.querySelector('[data-carousel-next]');
  var indicatorsContainer = carousel.querySelector('[data-carousel-indicators]');
  var current = 0;
  var intervalMs = 6000;
  var timer = null;

  // Build indicators
  slides.forEach(function (_, idx) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'w-3 h-3 rounded-full border border-white/70 transition-all';
    btn.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
    btn.addEventListener('click', function () {
      goTo(idx, true);
    });
    indicatorsContainer.appendChild(btn);
  });

  function updateIndicators() {
    var dots = indicatorsContainer.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].className = 'w-3 h-3 rounded-full border border-white/70 transition-all ' + (i === current ? 'bg-white scale-110' : 'bg-transparent');
    }
  }

  function goTo(index, userInitiated) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    var offset = -current * 100;
    track.style.transform = 'translateX(' + offset + '%)';
    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    updateIndicators();
    if (userInitiated) restartAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    timer = setInterval(function () { next(); }, intervalMs);
  }
  function stopAuto() {
    if (timer) {
      clearInterval(timer); timer = null;
    }
  }
  function restartAuto() { startAuto(); }

  if (nextBtn) nextBtn.addEventListener('click', function () { next(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); });

  // Pause on hover/focus for accessibility
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);

  // Init
  goTo(0);
  startAuto();
})();
