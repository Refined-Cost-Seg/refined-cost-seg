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

  // ─── Savings estimator ───
  // Must agree with the order form. The form shows three tiers — Conservative,
  // Balanced, Upper-Range — at 15/25/35% of (price − land) × marginal rate, and
  // it is the number the client actually buys on, two clicks after this one.
  // The old version used per-type ratios against a flat 80% basis, which put a
  // fourth number in front of the same property. One method, one set of numbers.
  var TIERS = { low: 0.15, mid: 0.25, high: 0.35 };
  var LAND_SHARE = 0.20;               // land defaults to 20% of price until the client says otherwise
  var $ = function(id) { return document.getElementById(id); };
  var pV = $('rcs-propValue'), lV = $('rcs-landValue'), tR = $('rcs-taxRate');
  var rMid = $('rcs-resultValue'), rLow = $('rcs-resultLow'), rHigh = $('rcs-resultHigh');
  var landEdited = false;
  // Whole dollars with separators, exactly as the form prints them. The old
  // rounded "31K" shorthand could not be visibly tied out against the form.
  function money(n) { return Math.round(n).toLocaleString('en-US'); }
  function calcSavings() {
    if (!pV || !lV || !tR) return;
    var price = parseFloat(pV.value) || 0;
    var land  = parseFloat(lV.value);
    if (isNaN(land) || land < 0) land = 0;
    var rate  = (parseFloat(tR.value) || 0) / 100;
    var basis = Math.max(price - land, 0);   // depreciable basis: land is never depreciated
    if (rLow)  rLow.textContent  = money(basis * TIERS.low  * rate);
    if (rMid)  rMid.textContent  = money(basis * TIERS.mid  * rate);
    if (rHigh) rHigh.textContent = money(basis * TIERS.high * rate);
  }
  function trackLand() {
    if (landEdited || !pV || !lV) return;
    lV.value = Math.round((parseFloat(pV.value) || 0) * LAND_SHARE);
  }
  if (pV) pV.addEventListener('input', function() { trackLand(); calcSavings(); });
  if (lV) lV.addEventListener('input', function() { landEdited = true; calcSavings(); });
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
