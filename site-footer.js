// site-footer.js — shared footer + service worker registration
// Loaded by all standalone pages (homepage, people, timeline, commentator hub/bios).
// Chapter pages handle their own footer in styles.css/shared.py.

(function() {
  // Inject footer
  var target = document.getElementById('site-footer') || document.body;
  var footer = document.createElement('footer');
  footer.style.cssText = 'padding:2rem 1.5rem;text-align:center;font-family:"Source Sans 3",sans-serif;font-size:.65rem;color:#6a5a38;letter-spacing:.04em;line-height:1.8;border-top:1px solid #332810;margin-top:2rem;';
  footer.innerHTML =
    'Scripture: Holy Bible, New International Version (NIV) &middot; &copy; 1973, 1978, 1984, 2011 by Biblica, Inc.<br>' +
    'Commentary for personal study &middot; Scholarly paraphrases &mdash; not verbatim quotations';
  if (target.id === 'site-footer') {
    target.parentNode.replaceChild(footer, target);
  } else {
    target.appendChild(footer);
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    var swPath = location.pathname.indexOf('/commentators/') > -1 ? '../service-worker.js' : 'service-worker.js';
    window.addEventListener('load', function() {
      navigator.serviceWorker.register(swPath).catch(function() {});
    });
  }
})();
