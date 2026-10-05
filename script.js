(function(){
  var KEY="reading-list-v1";
  var LABELS={to:"To read",reading:"Reading",done:"Done"};
  var books=[], filter="all", editingId=null, confirmId=null;
  try{ var raw=localStorage.getItem(KEY); if(raw) books=JSON.parse(raw)||[]; }catch(e){ books=[]; }
  if(!Array.isArray(books)) books=[];

  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(books)); }catch(e){} }
  function count(s){ return s==="all"?books.length:books.filter(function(b){return b.status===s}).length; }

  function render(){
    document.getElementById("empty").hidden = books.length>0;

    var f=document.getElementById("filters"); f.innerHTML="";
    ["all","to","reading","done"].forEach(function(s){
      var b=document.createElement("button");
      b.type="button";
      b.setAttribute("aria-pressed", filter===s);
      b.textContent=(s==="all"?"All":LABELS[s])+" ("+count(s)+")";
      b.onclick=function(){ filter=s; render(); };
      f.appendChild(b);
    });

    var list=document.getElementById("list"); list.innerHTML="";
    var shown=books.filter(function(b){ return filter==="all"||b.status===filter; });
    if(books.length && !shown.length){
      var p=document.createElement("p"); p.className="empty";
      p.textContent="No books with this status."; list.appendChild(p);
    }
    shown.forEach(function(book){
      var card=document.createElement("div"); card.className="card";
      var t=document.createElement("div"); t.className="title"; t.textContent=book.title;
      var right=document.createElement("div"); right.className="right";
      var badge=document.createElement("span"); badge.className="badge s-"+book.status; badge.textContent=LABELS[book.status];
      var sel=document.createElement("select"); sel.setAttribute("aria-label","Change status of "+book.title);
      Object.keys(LABELS).forEach(function(k){
        var o=document.createElement("option"); o.value=k; o.textContent=LABELS[k]; if(k===book.status) o.selected=true; sel.appendChild(o);
      });
      sel.onchange=function(){ book.status=sel.value; save(); render(); };
      function mk(label,cls,fn){
        var b=document.createElement("button"); b.type="button"; b.className="act "+cls;
        b.textContent=label; b.setAttribute("aria-label",label+" "+book.title); b.onclick=fn; return b;
      }
      if(editingId===book.id){
        var inp=document.createElement("input"); inp.className="edit-input"; inp.type="text";
        inp.value=book.title; inp.maxLength=150; inp.setAttribute("aria-label","Edit title");
        var commit=function(){
          var v=inp.value.trim();
          if(v){ book.title=v; save(); }
          editingId=null; render();
        };
        inp.onkeydown=function(e){
          if(e.key==="Enter"){ e.preventDefault(); commit(); }
          if(e.key==="Escape"){ editingId=null; render(); }
        };
        right.appendChild(mk("Save","save",commit));
        right.appendChild(mk("Cancel","",function(){ editingId=null; render(); }));
        card.appendChild(inp); card.appendChild(right); list.appendChild(card);
        setTimeout(function(){ inp.focus(); inp.select(); },0);
        return;
      }
      right.appendChild(badge); right.appendChild(sel);
      right.appendChild(mk("Edit","",function(){ editingId=book.id; render(); }));
      if(confirmId===book.id){
        var q=document.createElement("span"); q.textContent="Delete this book?"; q.style.fontSize=".85rem";
        right.innerHTML="";
        right.appendChild(q);
        right.appendChild(mk("Yes, delete","del",function(){
          books=books.filter(function(x){return x.id!==book.id}); confirmId=null; save(); render();
        }));
        right.appendChild(mk("Cancel","",function(){ confirmId=null; render(); }));
        card.appendChild(t); card.appendChild(right); list.appendChild(card);
        return;
      }
      right.appendChild(mk("Delete","del",function(){ confirmId=book.id; render(); }));
      card.appendChild(t); card.appendChild(right); list.appendChild(card);
    });
  }

  document.getElementById("form").addEventListener("submit",function(e){
    e.preventDefault();
    var inp=document.getElementById("title"), title=inp.value.trim();
    if(!title) return;
    books.unshift({id:Date.now(),title:title,status:document.getElementById("status").value});
    save(); inp.value=""; inp.focus(); render();
  });

  render();
})();
