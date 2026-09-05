(function() {
  'use strict';

  // ─── Mobile nav toggle ───
  var navToggle = document.querySelector('.rcs-embed .mobile-toggle');
  var navLinks  = document.getElementById('rcs-navlinks');
  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'rcs-navlinks');
    navToggle.addEventListener('click', function() {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() { navLinks.classList.remove('open'); });
    });
  }

  // ─── Nav scroll state ───
  var topnav = document.getElementById('rcs-topnav');
  if (topnav) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 30) topnav.classList.add('scrolled');
      else topnav.classList.remove('scrolled');
    }, { passive: true });
  }

  // ─── FAQ accordion ───
  document.querySelectorAll('.rcs-embed .faq-item').forEach(function(item, i) {
    var q = item.querySelector('.q-row');
    var a = item.querySelector('.a');
    if (!q) return;
    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.setAttribute('aria-expanded', 'false');
    if (a) { a.id = a.id || ('faq-panel-' + i); q.setAttribute('aria-controls', a.id); }
    function toggle() {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    item.addEventListener('click', toggle);
    q.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); e.stopPropagation(); toggle(); }
    });
  });

  // ─── Scroll reveal (IntersectionObserver) ───
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.rcs-embed .reveal').forEach(function(el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.rcs-embed .reveal').forEach(function(el) { el.classList.add('in'); });
  }

  // ─── Calculator ───
  var reclassRates = { str: 0.32, sfr: 0.22, duplex: 0.24, small_mf: 0.26, mixed: 0.28 };
  var $ = function(id) { return document.getElementById(id); };
  var pV = $('rcs-propValue'), pT = $('rcs-propType'), tR = $('rcs-taxRate');
  var rV = $('rcs-resultValue'), rA = $('rcs-resultAccel'), rP = $('rcs-resultPct');
  function fmt(n) {
    if (n >= 1000000) return (n/1000000).toFixed(2).replace(/\.?0+$/,'') + 'M';
    if (n >= 1000)    return Math.round(n/1000) + 'K';
    return Math.round(n).toString();
  }
  function calcSavings() {
    if (!pV || !pT || !tR) return;
    var price = parseFloat(pV.value) || 0;
    var rate  = (parseFloat(tR.value) || 0) / 100;
    var ratio = reclassRates[pT.value] || 0.22;
    var basis = price * 0.80;            // 80% depreciable basis
    var reclassified = basis * ratio;    // dollar amount reclassified
    var savings = reclassified * rate;   // year-1 tax savings (assumes 100% bonus)
    if (rV) rV.textContent = fmt(savings);
    if (rA) rA.textContent = '$' + fmt(reclassified);
    if (rP) rP.textContent = Math.round(ratio * 100);
  }
  if (pV) pV.addEventListener('input', calcSavings);
  if (pT) pT.addEventListener('change', calcSavings);
  if (tR) tR.addEventListener('input', calcSavings);
  calcSavings(); // initial run

  // ─── Journal listing: progressive disclosure ("show more") ───
  var listing = document.querySelector('.rcs-embed .listing-grid');
  if (listing) {
    var cards = listing.querySelectorAll('.blog-card');
    var total = cards.length;
    var STEP  = 9;
    var shown = STEP;

    if (total > STEP) {
      if (!listing.id) listing.id = 'journal-listing';

      var moreWrap = document.createElement('div');
      moreWrap.className = 'listing-more';

      var counter = document.createElement('p');
      counter.className = 'listing-count';
      counter.setAttribute('role', 'status');
      counter.setAttribute('aria-live', 'polite');

      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'btn btn-ghost';
      moreBtn.setAttribute('aria-controls', listing.id);

      var moreLabel = document.createElement('span');
      var moreArrow = document.createElement('span');
      moreArrow.className = 'arrow';
      moreArrow.setAttribute('aria-hidden', 'true');
      moreArrow.textContent = '↓';

      moreBtn.appendChild(moreLabel);
      moreBtn.appendChild(moreArrow);
      moreWrap.appendChild(counter);
      moreWrap.appendChild(moreBtn);
      listing.parentNode.insertBefore(moreWrap, listing.nextSibling);

      var renderListing = function() {
        for (var i = 0; i < total; i++) {
          cards[i].style.display = i < shown ? 'flex' : 'none';
        }
        counter.textContent = 'Showing ' + shown + ' of ' + total + ' essays';
        if (shown >= total) {
          moreBtn.hidden = true;
          moreBtn.style.display = 'none';
        } else {
          var next = Math.min(STEP, total - shown);
          moreLabel.textContent = 'Show ' + next + ' more ' + (next === 1 ? 'essay' : 'essays');
        }
      };

      moreBtn.addEventListener('click', function() {
        var firstNew = shown;
        shown = Math.min(shown + STEP, total);
        renderListing();
        var target = cards[firstNew];
        if (target) {
          target.setAttribute('tabindex', '-1');
          try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
        }
      });

      renderListing();
    }
  }

})();