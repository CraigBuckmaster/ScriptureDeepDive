// vhl.js — Verse Highlight Layer (shared logic)
// Each chapter defines its word groups inline, then calls initVHL(GROUPS).
// This file provides the highlighting engine and click handler.

window.initVHL = function(GROUPS) {
  function hasBtnType(row,types){return types.some(function(t){return row.querySelector('.anno-trigger.'+t);});}
  var vhlRowId=0;
  function highlightNode(node,word,cls,btns,row){
    if(node.nodeType===3){
      var nv=node.nodeValue,idx=nv.indexOf(word);
      if(idx===-1)return;
      var b=nv[idx-1],a=nv[idx+word.length];
      if((b!==undefined&&/[\w]/.test(b))||(a!==undefined&&/[\w]/.test(a)))return;
      var after=node.splitText(idx);after.splitText(word.length);
      var sp=document.createElement('span');sp.className='vhl '+cls;
      if(btns&&row){
        if(!row.dataset.vhlId){row.dataset.vhlId=++vhlRowId;row.setAttribute('data-vhl-id',vhlRowId);}
        sp.setAttribute('data-btn',btns.join(','));
        sp.setAttribute('data-row',row.dataset.vhlId);
      }
      after.parentNode.replaceChild(sp,after);sp.appendChild(document.createTextNode(word));
    } else if(node.nodeType===1&&!node.classList.contains('verse-num')&&node.tagName!=='BUTTON'&&!node.classList.contains('vhl')){
      var kids=[].slice.call(node.childNodes);
      kids.forEach(function(c){highlightNode(c,word,cls,btns,row);});
    }
  }
  document.querySelectorAll('.btn-row').forEach(function(row){
    var vt=row.previousElementSibling;
    while(vt&&!vt.classList.contains('verse-text'))vt=vt.previousElementSibling;
    if(!vt)return;
    GROUPS.forEach(function(g){
      if(!hasBtnType(row,g.btn))return;
      g.words.forEach(function(w){highlightNode(vt,w,g.cls,g.btn,row);});
    });
  });
  document.addEventListener('click',function(e){
    var sp=e.target.closest?e.target.closest('.vhl[data-btn]'):null;
    if(!sp)return;
    var rowId=sp.getAttribute('data-row');
    if(!rowId)return;
    var row=document.querySelector('.btn-row[data-vhl-id="'+rowId+'"]');
    if(!row)return;
    var types=(sp.getAttribute('data-btn')||'').split(',');
    var btn=null;
    for(var i=0;i<types.length;i++){btn=row.querySelector('.anno-trigger.'+types[i]);if(btn)break;}
    if(!btn)return;
    var oc=btn.getAttribute('onclick')||'';
    var m=oc.match(/'([^']+)'/);
    var panelId=m?m[1]:null;
    if(!panelId)return;
    sp.classList.remove('vhl-pulse');void sp.offsetWidth;sp.classList.add('vhl-pulse');
    tog(btn,panelId);
    var panel=document.getElementById(panelId);
    if(panel&&panel.classList.contains('open')){
      setTimeout(function(){panel.scrollIntoView({behavior:'smooth',block:'nearest'});},80);
    }
  });
};
