
/* MVP logic – Agencia Ariel */
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // WhatsApp deep links con mensaje prellenado y UTM si existen
  const baseWa = "https://wa.me/59893943838";
  const utm = new URLSearchParams(window.location.search);
  function waUrl(prefill){
    const txt = encodeURIComponent(prefill);
    const url = new URL(baseWa);
    url.searchParams.set("text", txt);
    // Adjuntar UTM en el mensaje si existen
    const utmPairs = [];
    utm.forEach((v,k)=>{utmPairs.push(`${k}=${v}`)});
    if(utmPairs.length){
      url.searchParams.set("text", `${txt}%0A%0AUTM: ${encodeURIComponent(utmPairs.join("&"))}`);
    }
    return url.toString();
  }

  const waMsg = "Hola, vengo desde la web. Quisiera cotizar un servicio de depósito/encomiendas.";
  ["#ctaWhatsAppHeader","#ctaWhatsAppBar","#ctaWhatsAppContacto"].forEach(id=>{
    const el = qs(id);
    if(el){ el.href = waUrl(waMsg); }
  });

  // Menú móvil
  const btn = qs("#menuToggle");
  const list = qs("#menuList");
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

  // Scroll suave
  qsa('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", e=>{
      const id = a.getAttribute("href");
      if(id.length>1 && document.querySelector(id)){
        e.preventDefault();
        document.querySelector(id).scrollIntoView({behavior:"smooth"});
      }
    });
  });

  // Form: Consultar próxima salida (envía a WhatsApp con datos)
  const formSalida = qs("#consultaSalida");
  if(formSalida){
    formSalida.addEventListener("submit", (e)=>{
      e.preventDefault();
      const datos = new FormData(formSalida);
      const ciudad = datos.get("ciudad");
      const tel = datos.get("telefono");
      const msg = `Consulta de próxima salida:%0A- Ciudad: ${encodeURIComponent(ciudad)}%0A- Contacto: ${encodeURIComponent(tel)}`;
      window.open(waUrl(msg), "_blank");
    });
  }

  // Form: Cotizar (muestra éxito y arma mensaje WhatsApp)
  const formCot = qs("#cotizar");
  if(formCot){
    formCot.addEventListener("submit", (e)=>{
      e.preventDefault();
      const fd = new FormData(formCot);
      const data = Object.fromEntries(fd.entries());
      const resumen = [
        `Solicitud de presupuesto:`,
        `Nombre/Empresa: ${data.nombre}`,
        `Email: ${data.email}`,
        `Tel/WhatsApp: ${data.telefono}`,
        `Origen: ${data.origen} → Destino: ${data.destino}`,
        `Tipo: ${data.tipo}`,
        `Medidas/Peso: ${data.medidas||"-"}`,
        `Servicio: ${data.servicio}`,
        `Urgencia: ${data.urgencia}`,
        `Mensaje: ${data.mensaje||"-"}`
      ].join("\n");
      const success = qs(".form-success");
      if(success){ success.hidden = false; }
      // Enviar a WhatsApp si el check está activo
      if(fd.get("whatsapp_ok")){
        const msg = encodeURIComponent(resumen);
        window.open(waUrl(resumen), "_blank");
      }
      formCot.reset();
    });
  }

  // Medición de clics básicos (console – listo para GA4)
  qsa("[href^='tel:']").forEach(el=>{
    el.addEventListener("click", ()=> console.log("metric: click_tel"));
  });
  qsa("#ctaWhatsAppHeader, #ctaWhatsAppBar, #ctaWhatsAppContacto").forEach(el=>{
    el.addEventListener("click", ()=> console.log("metric: click_whatsapp"));
  });

})();
