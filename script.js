(function() {
  'use strict';

  // ─── Jotform auto-resize ───
  if (window.jotformEmbedHandler) {
    window.jotformEmbedHandler("iframe[id='JotFormIFrame-261446273575059']", "https://form.jotform.com");
  }

  // ─── Mobile nav toggle ───
  var navToggle = document.querySelector('.rcs-embed .mobile-toggle');
  var navLinks  = document.getElementById('rcs-navlinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() { navLinks.classList.toggle('open'); });
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
  document.querySelectorAll('.rcs-embed .faq-item').forEach(function(item) {
    item.addEventListener('click', function() { item.classList.toggle('open'); });
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

})();