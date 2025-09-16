
/* app.js (compartido) */
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  const baseWa = "https://wa.me/59893943838";
  function waUrl(text){ const u=new URL(baseWa); u.searchParams.set("text", text); return u.toString(); }
  const waDefault = "Hola, vengo desde la web. Quisiera cotizar un servicio.";
  ["#ctaWhatsAppHeader","#ctaWhatsAppBar","#ctaWhatsAppContacto"].forEach(id=>{
    const el = qs(id); if(el){ el.href = waUrl(waDefault); el.target="_blank"; el.rel="noopener"; }
  });

  const btn = qs("#menuToggle"); const list = qs("#menuList");
  if(btn && list){
    btn.addEventListener("click", ()=>{
      const open = list.style.display === "flex" || list.style.display === "block";
      list.style.display = open ? "none" : (window.innerWidth<721 ? "block" : "flex");
      btn.setAttribute("aria-expanded", String(!open));
    });
    window.addEventListener("resize", ()=>{
      list.style.display = (window.innerWidth<721) ? "none" : "flex";
    });
  }

  qsa('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", e=>{
      const id = a.getAttribute("href");
      if(id.length>1 && document.querySelector(id)){
        e.preventDefault();
        document.querySelector(id).scrollIntoView({behavior:"smooth"});
      }
    });
  });
})();
