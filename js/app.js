
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

/* ===== Cobertura: Buscador + Mapa SVG + Accordion ===== */



/* ====== BUSCADOR ====== */
(function(){
  const destinos = [
    // Puedes generar esta lista a partir de DESTINOS_POR_DEPTO si querés evitar doble mantenimiento:
    // ...Object.values(DESTINOS_POR_DEPTO).flat()
    "Rocha","Punta del Diablo","Castillos","Chuy","Barra de Valizas","Cabo Polonio","Aguas Dulces","La Coronilla",
    "Maldonado","Aiguá","Paysandú","Carmelo","Colonia","Rosario","Tarariras","Nueva Palmira",
    "San José","Libertad","Florida","Casupá","Fray Marcos","Canelones","Progreso","Sauce","Las Piedras",
    "Santa Lucía","Santa Rosa","Tala","Durazno","Trinidad","Salto","Treinta y Tres","Santa Clara del Olimar",
    "Cerro Chato","Artigas","Minas","Solís de Mataojo"
  ];
  const qi = document.getElementById("searchInput");
  const ul = document.getElementById("searchResults");
  if (!qi || !ul) return;

  qi.addEventListener("input", function(){
    const q = this.value.toLowerCase();
    ul.innerHTML = "";
    if (q.length > 1) {
      const filtered = destinos.filter(d => d.toLowerCase().includes(q));
      filtered.forEach(d => {
        const li = document.createElement("li");
        li.textContent = d;
        ul.appendChild(li);
      });
    }
  });
})();

/* ====== ACCORDION ====== */
(function(){
  const accBtns = document.querySelectorAll(".accordion-btn");
  accBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) { panel.style.maxHeight = null; }
      else { panel.style.maxHeight = panel.scrollHeight + "px"; }
    });
  });
})();

// === Cobertura: colores y labels (simple y directo sobre el SVG de MapSVG) ===
// Configuración de colores
const COLOR_COVER = "#3fc380";   // verde cobertura
const COLOR_NO_COVER = "#cfcfcf"; // gris sin cobertura
const COLOR_HOVER = "#5ff0a0";    // verde brillante al hover
const COLOR_STROKE = "#444";      // borde

// Departamentos con cobertura (según la lista de tu cliente)
const DEPTOS_COBERTURA = new Set([
  "Artigas","Canelones","CerroLargo","Colonia","Durazno","Flores","Florida",
  "Lavalleja","Maldonado","Montevideo","Paysandu","RioNegro","Rivera",
  "Rocha","Salto","SanJose","Soriano","Tacuarembo","TreintaYTres"
]);

// Fuente para labels
const LABEL_FONT_FAMILY = "Arial, sans-serif";
const LABEL_FONT_SIZE = 11; // ajustable

document.addEventListener("DOMContentLoaded", () => {
  const obj = document.getElementById("mapaUruguay");
  if (!obj) return;

  obj.addEventListener("load", () => {
    const svg = obj.contentDocument;
    if (!svg) return;

    // 1) Encontramos todos los paths de departamentos (MapSVG suele ponerlos como <path id="Depto" ...>)
    const deptos = Array.from(svg.querySelectorAll("path[id]"));

    deptos.forEach(path => {
      const id = path.getAttribute("id"); // ej: "Rocha", "Maldonado", etc. (PascalCase)
      if (!id) return;

      // Pintar según cobertura
      const tieneCobertura = DEPTOS_COBERTURA.has(id);
      path.setAttribute("fill", tieneCobertura ? COLOR_COVER : COLOR_NO_COVER);
      path.setAttribute("stroke", COLOR_STROKE);
      path.setAttribute("stroke-width", "1.2");
      path.style.cursor = "pointer";

      // Tooltip nativo del navegador
      let title = path.querySelector("title");
      if (!title) {
        title = svg.createElementNS("http://www.w3.org/2000/svg", "title");
        path.appendChild(title);
      }
      title.textContent = id; // muestra el nombre

      // Hover (sin romper el color final)
      path.addEventListener("mouseenter", () => {
        path.dataset._fill = path.getAttribute("fill");
        path.setAttribute("fill", COLOR_HOVER);
      });
      path.addEventListener("mouseleave", () => {
        path.setAttribute("fill", path.dataset._fill || (tieneCobertura ? COLOR_COVER : COLOR_NO_COVER));
      });

      // Click → tu modal existente (si ya lo tenés en app.js)
      path.addEventListener("click", () => {
        // Si ya tenés abrirModalDepto(nombre, destinos), usá:
        if (typeof abrirModalDepto === "function") {
          abrirModalDepto(id, (window.DESTINOS_POR_DEPTO && window.DESTINOS_POR_DEPTO[id.toLowerCase()]) || []);
        }
      });

      // 2) Agregar label visible (centrado aproximado del path)
      // Calculamos bbox y lo centramos
      const bbox = path.getBBox();
      const label = svg.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", bbox.x + bbox.width / 2);
      label.setAttribute("y", bbox.y + bbox.height / 2);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("font-family", LABEL_FONT_FAMILY);
      label.setAttribute("font-size", LABEL_FONT_SIZE);
      label.setAttribute("fill", "#111"); // negro para buen contraste
      label.setAttribute("pointer-events", "none");
      label.textContent = id; // nombre visible

      // Insertamos los labels en una capa superior (o justo después del path)
      // Mejor en una capa común:
      let labelsLayer = svg.getElementById("labels-layer");
      if (!labelsLayer) {
        labelsLayer = svg.createElementNS("http://www.w3.org/2000/svg", "g");
        labelsLayer.setAttribute("id", "labels-layer");
        svg.documentElement.appendChild(labelsLayer);
      }
      labelsLayer.appendChild(label);
    });
  });
});

// ========== COBERTURA: INTEGRACIÓN PARA app.js ==========
;(() => {
  const pageRoot = document.getElementById('page-cobertura');
  if (!pageRoot) return;

  // IDs ISO del SVG -> slugs internos
  const idMap = {
    "UY-AR":"artigas","UY-CA":"canelones","UY-CL":"cerro_largo","UY-CO":"colonia",
    "UY-DU":"durazno","UY-FD":"florida","UY-FS":"flores","UY-LA":"lavalleja",
    "UY-MA":"maldonado","UY-MO":"montevideo","UY-PA":"paysandu","UY-RN":"rio_negro",
    "UY-RV":"rivera","UY-RO":"rocha","UY-SA":"salto","UY-SJ":"san_jose",
    "UY-SO":"soriano","UY-TA":"tacuarembo","UY-TT":"treinta_y_tres"
  };

  // Cobertura (basada en la lista de tu cliente)
  const coverage = {
    artigas: ["Artigas"],
    canelones: [
      "Canelones","Costa de Oro","Montes","Progreso","Sauce","Los Cerrillos",
      "San Bautista","San Antonio","San Ramón","Las Piedras","Santa Lucía","Santa Rosa"
    ],
    cerro_largo: ["Melo","Río Branco","Tupambaé"],
    colonia: ["Colonia","Carmelo","Rosario","Tarariras","Nueva Palmira"],
    durazno: ["Durazno","Sarandí del Yí"],
    flores: ["Trinidad"],
    florida: ["Florida","Sarandí Grande","Fray Marcos","Casupá","Cerro Colorado"],
    lavalleja: ["Minas","José Pedro Varela","Mariscala","Solís de Mataojo","José Batlle y Ordóñez"],
    maldonado: ["Maldonado","Aiguá"],
    montevideo: [],
    paysandu: ["Paysandú"],
    rio_negro: [],
    rivera: [],
    rocha: ["Rocha","Punta del Diablo","Castillos","Chuy","Barra de Valizas","Aguas Dulces","Cabo Polonio","La Coronilla"],
    salto: ["Salto"],
    san_jose: ["San José","Libertad","Villa Rodríguez"],
    soriano: ["Cardona","José E. Rodó"],
    tacuarembo: [],
    treinta_y_tres: ["Treinta y Tres","Santa Clara del Olimar","La Charqueada","Cerro Chato"],
  };

  const svg = document.getElementById('uy-map');
  const tooltip = document.getElementById('tooltip');
  const accRoot = document.getElementById('accordion-root');
  if (!svg || !tooltip || !accRoot) return;

  // Vincular por IDs ISO del SVG
  const paths = svg.querySelectorAll('path[id^="UY-"]');
  paths.forEach(el => {
    const code = el.id;
    const slug = idMap[code];
    const has = slug && coverage[slug] && coverage[slug].length;

    el.classList.add(has ? 'dept-ok' : 'dept-no');

    el.addEventListener('mousemove', (ev) => showTooltip(ev, slug, has));
    el.addEventListener('mouseleave', hideTooltip);

    // Mobile/touch
    el.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      const t = ev.touches[0];
      showTooltip({clientX:t.clientX, clientY:t.clientY}, slug, has);
    }, {passive:false});
    svg.addEventListener('touchend', hideTooltip, {passive:true});
  });

  buildAccordion(accRoot, coverage);

  function showTooltip(ev, slug, has){
    const label = toTitle(slug || 'Departamento');
    tooltip.innerHTML = has
      ? `<h3>${label}</h3><p>Destinos con cobertura:</p>${toList(coverage[slug])}`
      : `<h3>${label}</h3><p>No hay cobertura disponible.</p>`;
    tooltip.style.left = ev.clientX + 'px';
    tooltip.style.top = ev.clientY + 'px';
    tooltip.setAttribute('data-show','true');
    tooltip.setAttribute('aria-hidden','false');
  }
  function hideTooltip(){
    tooltip.removeAttribute('data-show');
    tooltip.setAttribute('aria-hidden','true');
  }
  function toList(arr){ return '<ul>' + arr.map(x=>`<li>${x}</li>`).join('') + '</ul>'; }
  function toTitle(slug){ return (slug||'').replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase()); }

  function buildAccordion(root, data){
    root.innerHTML = '';
    Object.entries(data).forEach(([dept, places]) => {
      const has = places && places.length;
      const details = document.createElement('details');
      if (has) details.setAttribute('open','');
      const summary = document.createElement('summary');
      summary.textContent = toTitle(dept) + (has ? `  ·  ${places.length}` : ' · sin cobertura');
      details.appendChild(summary);
      if (has){
        const ul = document.createElement('ul');
        places.forEach(p => { const li=document.createElement('li'); li.textContent=p; ul.appendChild(li); });
        details.appendChild(ul);
      }
      root.appendChild(details);
    });
  }
})();
// ========== /COBERTURA ==========
/**
 * cobertura-map.js — versión completa (100%) con todos los destinos provistos
 * Requiere en la página:
 *   <div id="uy-map-container"><div id="uy-map"></div></div>
 * SVG esperado: img/Uruguay.svg con IDs ISO-3166-2 por depto (p. ej., UY-RO)
 */
(function(){
  // Nombres por código ISO (deben coincidir con los ids del SVG)
  const DEPT_NAMES = {
    "UY-AR":"Artigas",
    "UY-CA":"Canelones",
    "UY-CL":"Cerro Largo",
    "UY-CO":"Colonia",
    "UY-DU":"Durazno",
    "UY-FD":"Florida",
    "UY-FS":"Flores",
    "UY-LA":"Lavalleja",
    "UY-MA":"Maldonado",
    "UY-MO":"Montevideo",
    "UY-PA":"Paysandú",
    "UY-RN":"Río Negro",
    "UY-RO":"Rocha",
    "UY-RV":"Rivera",
    "UY-SA":"Salto",
    "UY-SJ":"San José",
    "UY-SO":"Soriano",
    "UY-TA":"Tacuarembó",
    "UY-TT":"Treinta y Tres"
  };

  // Mapeo completo (según la lista de destinos que compartiste)
  const DESTINOS_BY_DEPT = {
    "UY-AR": [ "Artigas" ],

    "UY-CA": [
      "Canelones","Costa de Oro","Progreso","Sauce","Los Cerrillos","San Bautista",
      "San Antonio","San Ramón","Las Piedras","Santa Lucía","Santa Rosa","Tala","Montes"
    ],

    "UY-CL": [ "Melo","Río Branco","Tupambaé" ],

    "UY-CO": [ "Colonia","Carmelo","Rosario","Tarariras","Nueva Palmira" ],

    "UY-DU": [ "Durazno","Sarandí del Yí","Cerro Chato" ],

    "UY-FD": [ "Florida","Sarandí Grande","Casupá","Fray Marcos","Cerro Colorado","Cerro Chato" ],

    "UY-FS": [ "Trinidad" ],

    "UY-LA": [ "Minas","Mariscala","José Pedro Varela","Solís de Mataojo","Batlle y Ordóñez" ],

    "UY-MA": [ "Maldonado","Aiguá" ],

    "UY-MO": [ /* sin destinos provistos → sin cobertura */ ],

    "UY-PA": [ "Paysandú" ],

    "UY-RN": [ /* sin destinos provistos → sin cobertura */ ],

    "UY-RO": [
      "Rocha","Punta del Diablo","Castillos","Chuy","Barra de Valizas","Aguas Dulces",
      "Cabo Polonio","La Coronilla"
    ],

    "UY-RV": [ /* sin destinos provistos → sin cobertura */ ],

    "UY-SA": [ "Salto" ],

    "UY-SJ": [ "San José","Libertad","Villa Rodríguez" ],

    "UY-SO": [ "Cardona","José E. Rodó" ],

    "UY-TA": [ /* sin destinos provistos → sin cobertura */ ],

    "UY-TT": [ "Treinta y Tres","La Charqueada","Santa Clara del Olimar","Cerro Chato" ]
  };

  const MAP_SVG_URL = "img/Uruguay.svg";
  const MAP_CONTAINER = document.getElementById("uy-map");
  const WRAP = document.getElementById("uy-map-container");
  if(!MAP_CONTAINER || !WRAP){ console.warn("[cobertura-map] Falta el contenedor"); return; }

  // Tooltip flotante
  const tip = document.createElement("div");
  tip.className = "tooltip";
  WRAP.appendChild(tip);

  // Cargar/inyectar el SVG para poder atachar listeners
  fetch(MAP_SVG_URL).then(r=>r.text()).then(svgText=>{
    MAP_CONTAINER.innerHTML = svgText;
    const svg = MAP_CONTAINER.querySelector("svg");
    if(!svg){ console.error("[cobertura-map] No se pudo montar el SVG."); return; }

    Object.keys(DEPT_NAMES).forEach(code => {
      const node = svg.querySelector("#"+CSS.escape(code));
      if(!node){ console.warn("[cobertura-map] Falta en SVG:", code); return; }

      node.classList.add("dept");
      const destinos = DESTINOS_BY_DEPT[code] || [];
      if(destinos.length){
        node.classList.add("has-coverage");
      }else{
        node.classList.add("no-coverage");
      }

      // Hover → tooltip en el puntero
      node.addEventListener("mousemove", (ev) => {
        const list = DESTINOS_BY_DEPT[code] || [];
        let html = `<h4>${DEPT_NAMES[code]}</h4>`;
        if(list.length){
          html += `<ul>` + list.map(d=>`<li>${d}</li>`).join("") + `</ul>`;
        }else{
          html += `<div class="sin">Sin cobertura</div>`;
        }
        tip.innerHTML = html;
        tip.style.display = "block";
        const rect = WRAP.getBoundingClientRect();
        tip.style.left = (ev.clientX - rect.left + 12) + "px";
        tip.style.top  = (ev.clientY - rect.top + 12) + "px";
      });
      node.addEventListener("mouseleave", ()=>{ tip.style.display = "none"; });

      // Click → ancla/param en la misma página de cobertura
      node.addEventListener("click", ()=>{
        const slug = (DEPT_NAMES[code]||"")
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
          .replace(/\s+/g,"-");
        // ancla y query param por si querés usarlo desde el contenido
        const href = `${location.pathname}?dept=${encodeURIComponent(code)}#${slug}`;
        location.href = href;
      });

      // Accesibilidad
      node.setAttribute("tabindex","0");
      node.setAttribute("role","button");
      node.setAttribute("aria-label", `Cobertura en ${DEPT_NAMES[code]}`);
      node.addEventListener("keydown",(e)=>{ if(e.key==="Enter" || e.key===" "){ node.click(); }});
    });

    // Si hay ?dept= en la URL, hacemos scroll al bloque correspondiente
    const params = new URLSearchParams(location.search);
    const paramDept = params.get("dept");
    if(paramDept && DEPT_NAMES[paramDept]){
      const slug = DEPT_NAMES[paramDept].toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
        .replace(/\s+/g,"-");
      const target = document.getElementById(slug);
      if(target){ target.scrollIntoView({behavior:"smooth", block:"start"}); }
    }
  });


  // Render de la grilla de destinos dentro de cada <article> (contenido anclable)
  document.querySelectorAll(".cobertura-detalle article").forEach(art=>{
    const id = art.id; // slug
    const match = Object.entries(DEPT_NAMES).find(([code, name])=>{
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
      return slug === id;
    });
    if(!match) return;
    const [code] = match;
    const destinos = DESTINOS_BY_DEPT[code] || [];
    const cont = art.querySelector(".destinos");
    if(!cont) return;
    if(!destinos.length){
      cont.innerHTML = `<p class="sin">Sin cobertura</p>`;
    }else{
      cont.innerHTML = `<ul class="destinos-grid">` + destinos.map(d=>`<li>${d}</li>`).join("") + `</ul>`;
    }
  });
})();

