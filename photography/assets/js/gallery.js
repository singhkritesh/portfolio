(function () {
  'use strict';

  // ── Mobile nav ─────────────────────────────────────────────────
  var menuBtn  = document.getElementById('ks-menu-btn');
  var mobileMenu = document.getElementById('ks-mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      var nav = document.querySelector('.ks-nav');
      if (nav && !nav.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Preload removal ─────────────────────────────────────────────
  window.addEventListener('load', function () {
    setTimeout(function () { document.body.classList.remove('is-preload'); }, 100);
  });

  // ── Random stagger delay classes on thumbnails ──────────────────
  document.querySelectorAll('.item.thumb').forEach(function (el) {
    el.classList.add('delay-' + (Math.floor(Math.random() * 6) + 1));
  });

  // ── Horizontal scroll ───────────────────────────────────────────
  var main    = document.getElementById('main');
  var isMobile = ('ontouchstart' in window) || window.innerWidth <= 480;

  if (isMobile) {
    main.style.overflowX = 'auto';
  } else {
    // Mouse wheel → horizontal scroll
    document.body.addEventListener('wheel', function (e) {
      if (document.body.classList.contains('lb-open')) return;
      e.preventDefault();
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      main.scrollLeft += delta;
    }, { passive: false });

    // Scroll zones
    ['left', 'right'].forEach(function (side) {
      var zone = document.createElement('div');
      zone.className = 'scrollZone ' + side;
      document.getElementById('wrapper').appendChild(zone);
      var iv = null;
      zone.addEventListener('mouseenter', function () {
        iv = setInterval(function () { main.scrollLeft += side === 'right' ? 15 : -15; }, 25);
      });
      zone.addEventListener('mouseleave', function () { clearInterval(iv); });
    });

    // Keyboard scroll (when lightbox is closed)
    window.addEventListener('keydown', function (e) {
      if (document.body.classList.contains('lb-open')) return;
      switch (e.keyCode) {
        case 37: main.scrollLeft -= 50;                      e.preventDefault(); break;
        case 39: main.scrollLeft += 50;                      e.preventDefault(); break;
        case 33: main.scrollLeft -= window.innerWidth - 100; e.preventDefault(); break;
        case 34:
        case 32: main.scrollLeft += window.innerWidth - 100; e.preventDefault(); break;
        case 36: main.scrollLeft  = 0;                       e.preventDefault(); break;
        case 35: main.scrollLeft  = main.scrollWidth;        e.preventDefault(); break;
      }
    });
  }

  // ── Lightbox ────────────────────────────────────────────────────
  // Build DOM
  var lb = document.createElement('div');
  lb.id = 'ks-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<div class="lb-backdrop"></div>' +
    '<div class="lb-stage">' +
      '<button class="lb-btn lb-prev" aria-label="Previous">' +
        '<svg width="11" height="20" viewBox="0 0 11 20" fill="none"><path d="M9.5 1.5L2 10l7.5 8.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="lb-img-wrap"><div class="lb-spinner"></div><img class="lb-img" src="" alt="" /></div>' +
      '<button class="lb-btn lb-next" aria-label="Next">' +
        '<svg width="11" height="20" viewBox="0 0 11 20" fill="none"><path d="M1.5 1.5L9 10l-7.5 8.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="lb-caption"></div>' +
    '<button class="lb-close" aria-label="Close">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '</button>';
  document.body.appendChild(lb);

  var items   = Array.from(document.querySelectorAll('.item.thumb a.image'));
  var current = 0;

  function open(i) {
    current = i;
    show(i);
    lb.classList.add('open');
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.classList.remove('lb-open');
    var img = lb.querySelector('.lb-img');
    img.src = '';
    img.style.opacity = '0';
  }

  function show(i) {
    var a       = items[i];
    var img     = lb.querySelector('.lb-img');
    var spinner = lb.querySelector('.lb-spinner');
    var caption = lb.querySelector('.lb-caption');

    img.style.opacity = '0';
    spinner.style.display = 'block';

    var src = a.getAttribute('href');
    var tmp = new Image();
    tmp.onload = function () {
      img.src           = src;
      img.alt           = a.querySelector('img').alt;
      spinner.style.display = 'none';
      img.style.opacity = '1';
    };
    tmp.onerror = function () { spinner.style.display = 'none'; };
    tmp.src = src;

    var h2 = a.previousElementSibling;
    caption.textContent = h2 ? h2.textContent : '';

    lb.querySelector('.lb-prev').style.display = items.length > 1 ? '' : 'none';
    lb.querySelector('.lb-next').style.display = items.length > 1 ? '' : 'none';
  }

  // Touch swipe
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      current = dx < 0
        ? (current + 1) % items.length
        : (current - 1 + items.length) % items.length;
      show(current);
    }
    touchX = null;
  }, { passive: true });

  // Wire gallery clicks
  items.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });

  lb.querySelector('.lb-backdrop').addEventListener('click', close);
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () {
    current = (current - 1 + items.length) % items.length; show(current);
  });
  lb.querySelector('.lb-next').addEventListener('click', function () {
    current = (current + 1) % items.length; show(current);
  });

  window.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('lb-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  { current = (current - 1 + items.length) % items.length; show(current); }
    if (e.key === 'ArrowRight') { current = (current + 1) % items.length; show(current); }
  });

})();
