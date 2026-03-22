(function() {
'use strict';
// history.js — Recent chapter tracker
// Records the current chapter visit in localStorage for the homepage
// "Continue Reading" bar. Keeps the last 5 chapters visited.
// Loaded via <script src="../../history.js"> at the bottom of each chapter page.

(function(){
  try {
    var KEY='sdw_recent', MAX=5;
    var hist = JSON.parse(localStorage.getItem(KEY)||'[]');
    var parts=window.location.pathname.split('/'); var url=parts.slice(-3).join('/');
    var title = document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '';
    var subtitle = document.querySelector('header p') ? document.querySelector('header p').textContent.trim() : '';
    var label = title + (subtitle ? ' · ' + subtitle.slice(0,30) : '');
    hist = hist.filter(function(h){ return h.url !== url; });
    hist.unshift({url:url, label:label, title:title, subtitle:subtitle});
    if(hist.length > MAX) hist = hist.slice(0,MAX);
    localStorage.setItem(KEY, JSON.stringify(hist));
  } catch(e){}
})();

})();
