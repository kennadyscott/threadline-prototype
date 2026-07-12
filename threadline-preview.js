/* Threadline — Preview mode. Included on app pages.
   Active when a brand exists but hasn't been activated: shows the persistent
   "Preview — Activate my brand" bar and lets pages gate make-it-real actions. */
(function(){
  function previewOn(){ try{ return !!localStorage.getItem('threadline.brand') && !localStorage.getItem('threadline.activated'); }catch(e){ return false; } }
  window.tlPreview=previewOn;
  window.tlGate=function(featureMsg){
    if(!previewOn()) return false;
    var t=document.getElementById('toast');
    if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent='👀 Preview mode — '+(featureMsg||'activate your brand to unlock this')+'.';
    t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(function(){ t.classList.remove('show'); },3000);
    var bar=document.getElementById('tlpbar'); if(bar){ bar.style.transform='translateY(-4px)'; setTimeout(function(){ bar.style.transform=''; },200); }
    return true;
  };
  // Arriving from deck activation flips the switch
  if(new URLSearchParams(location.search).get('activate')==='1'){ try{ localStorage.setItem('threadline.activated','1'); }catch(e){} return; }
  if(!previewOn()) return;
  function mk(){
    if(document.getElementById('tlpbar')) return;
    try{ if(sessionStorage.getItem('tlpbar.hide')) return; }catch(e){}
    var b=document.createElement('div'); b.id='tlpbar';
    b.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:200;display:flex;align-items:center;gap:14px;justify-content:center;background:#0f172a;color:#fff;font-family:Satoshi,system-ui,sans-serif;font-weight:700;font-size:13.5px;padding:11px 18px;box-shadow:0 -8px 30px rgba(15,23,42,.25);transition:transform .15s';
    b.innerHTML='<span>👀 <b style="background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent">Preview mode</b> — your brand is built and your plan is drafted. It all goes live when you activate.</span>'
      +'<button id="tlpgo" style="background:linear-gradient(135deg,#803dff,#3b82f6);color:#fff;font:800 13px Satoshi,sans-serif;border:none;border-radius:10px;padding:9px 16px;cursor:pointer;white-space:nowrap">✦ Activate my brand</button>'
      +'<button id="tlpx" style="background:none;border:none;color:rgba(255,255,255,.55);font-weight:900;font-size:15px;cursor:pointer;padding:4px 6px" title="Hide for this session">×</button>';
    document.body.appendChild(b);
    document.body.style.paddingBottom='64px';
    document.getElementById('tlpgo').onclick=function(){ location.href='threadline-review.html?slide=11'; };
    document.getElementById('tlpx').onclick=function(){ try{ sessionStorage.setItem('tlpbar.hide','1'); }catch(e){} b.remove(); document.body.style.paddingBottom=''; };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mk); else mk();
})();
