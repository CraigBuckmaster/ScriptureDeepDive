// tog.js — Panel toggle and authorship disclosure
// Shared across all chapter pages. Loaded via <script src="../../tog.js">
//
// tog(btn, id)       — Toggle an annotation panel open/closed.
//                      Closes any other open panel first (single-open policy).
// toggleAuth(btn)    — Toggle the authorship disclosure block.

function tog(btn,id){
  var p=document.getElementById(id);
  if(!p)return;
  var willOpen=!p.classList.contains('open');
  // Close all open panels (both annotation and themes)
  document.querySelectorAll('.anno-panel.open,.themes-panel.open').forEach(function(op){op.classList.remove('open');});
  document.querySelectorAll('.anno-trigger.active').forEach(function(tb){tb.classList.remove('active');});
  if(willOpen){p.classList.add('open');btn.classList.add('active');}
}

function toggleAuth(btn){btn.nextElementSibling.classList.toggle('open');btn.classList.toggle('open');}
