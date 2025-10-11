
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
 * SVG esperado: img/uruguay.svg con IDs ISO-3166-2 por depto (p. ej., UY-RO)
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

  const MAP_SVG_URL = "img/uruguay.svg";
  const MAP_CONTAINER = document.getElementById("uy-map");
  const WRAP = document.getElementById("uy-map-container");
  if(!MAP_CONTAINER || !WRAP){ console.warn("[cobertura-map] Falta el contenedor"); return; }
  /* === Acordeón siempre colapsado y sin auto-open en móvil/SPA === */
/* Si YA definiste AUTO_EXPAND_ON_SELECT en otro lado, borra la línea de abajo y deja la asignación más adelante */
const AUTO_EXPAND_ON_SELECT = false; // mantener contraído salvo gesto del usuario
const ACC_SELECTOR = '#accordion-root'; // cambia si tu contenedor del acordeón tiene otro id

function collapseAllAccordions(root = document) {
  root.querySelectorAll(`${ACC_SELECTOR} details[open]`).forEach(d => { d.open = false; });
}

// 1) Colapsar al tener DOM y otra vez al 'load' (por Safari que a veces latea)
document.addEventListener('DOMContentLoaded', () => collapseAllAccordions());
window.addEventListener('load', () => collapseAllAccordions());

// 2) Evitar aperturas programáticas: solo permitir toggles iniciados por el usuario
document.addEventListener('toggle', (ev) => {
  const d = ev.target;
  if (!(d instanceof HTMLDetailsElement)) return;
  // Si alguien lo abrió por código (isTrusted === false), lo volvemos a cerrar.
  if (d.open && !ev.isTrusted) d.open = false;
}, true);

// 3) Si el acordeón se construye/actualiza dinámicamente, observar y cerrar cualquier <details> que llegue abierto
const accRoot = document.querySelector(ACC_SELECTOR);
if (accRoot) {
  const mo = new MutationObserver(() => {
    clearTimeout(mo._t);
    mo._t = setTimeout(() => collapseAllAccordions(accRoot), 0);
  });
  mo.observe(accRoot, { childList: true, subtree: true });
}

// 4) Si existe openAccordionItem(id), que respete el flag sin romper otras llamadas
(function ensureOpenFuncRespectsFlag(){
  const esc = (s) => String(s).replace(/[^a-zA-Z0-9\-_]/g, '\\$&');
  if (typeof window.openAccordionItem === 'function') {
    const _open = window.openAccordionItem;
    window.openAccordionItem = function(id) {
      if (window.AUTO_EXPAND_ON_SELECT ?? AUTO_EXPAND_ON_SELECT) {
        _open.call(this, id);
      }
      // Siempre guiamos al usuario al ítem (aunque no se abra)
      const el = document.querySelector(`#acc-${esc(id)}`) || document.querySelector(`details[data-dept="${id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
  }
})();

// Al cargar la página, cerrar cualquier <details> que venga abierto
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#accordion-root details[open]').forEach(d => { d.open = false; });
});


  // Tooltip flotante
  const tip = document.createElement("div");
  tip.className = "tooltip";
  WRAP.appendChild(tip);

  // Cargar/inyectar el SVG para poder atachar listeners
  fetch(MAP_SVG_URL).then(r=>r.text()).then(svgText=>{
    MAP_CONTAINER.innerHTML = svgText;
    const svg = MAP_CONTAINER.querySelector("svg");
    if(!svg){ console.error("[cobertura-map] No se pudo montar el SVG."); return; }
    // --- Normalizar viewport del SVG de forma segura en móvil ---
    // ==== Posicionamiento inteligente del tooltip ====
const MAP_WRAP = document.getElementById('uy-map-container');
const MAP_TIP  = document.getElementById('map-tooltip');
const GAP = 12;

// Medir tooltip aunque esté oculto
function measureTip(){
  if (!MAP_TIP) return {w:0,h:0};
  const prevVis = MAP_TIP.style.visibility;
  const prevDisp = MAP_TIP.style.display;
  MAP_TIP.style.visibility = 'hidden';
  MAP_TIP.style.display = 'block';
  const w = MAP_TIP.offsetWidth;
  const h = MAP_TIP.offsetHeight;
  MAP_TIP.style.display = prevDisp || '';
  MAP_TIP.style.visibility = prevVis || '';
  return { w, h };
}

// Colocar el tooltip alrededor de (relX, relY) y voltearlo si no entra
function placeTip(relX, relY){
  if (!MAP_WRAP || !MAP_TIP) return;
  const cw = MAP_WRAP.clientWidth, ch = MAP_WRAP.clientHeight;
  const { w:tw, h:th } = measureTip();

  // Posición base: a la DERECHA y centrado vertical del ancla
  let x = relX + GAP;
  let y = relY - th/2;

  // Si no entra a la derecha, VOLTEAR a la IZQUIERDA
  if (x + tw + GAP > cw){
    x = relX - tw - GAP;
  }

  // Clamps verticales
  if (y < GAP) y = GAP;
  if (y + th + GAP > ch) y = ch - th - GAP;

  // Clamps horizontales por las dudas
  if (x < GAP) x = GAP;
  if (x + tw + GAP > cw) x = cw - tw - GAP;

  MAP_TIP.style.left = `${x}px`;
  MAP_TIP.style.top  = `${y}px`;
}

// Hover/mouse
function positionTooltipFromPointer(ev){
  if (!MAP_WRAP) return;
  const r = MAP_WRAP.getBoundingClientRect();
  const relX = ev.clientX - r.left;
  const relY = ev.clientY - r.top;
  placeTip(relX, relY);
}

// Tap/click (usá el centro del departamento)
function positionTooltipFromNode(node){
  if (!MAP_WRAP || !node) return;
  const rWrap = MAP_WRAP.getBoundingClientRect();
  const rNode = node.getBoundingClientRect();
  const relX = (rNode.left + rNode.width/2) - rWrap.left;
  const relY = (rNode.top  + rNode.height/2) - rWrap.top;
  placeTip(relX, relY);
}

// (Opcional) marcar el título dentro del tooltip para aplicar el CSS de “alto contraste”
function emphasizeTip(){
  const t = MAP_TIP?.querySelector('h3,h4,strong,b,.title') || MAP_TIP?.firstElementChild;
  t?.classList.add('mt-title');
}


function clampTooltipPosition(relX, relY) {
  if (!MAP_WRAP || !MAP_TIP) return;
  // Medidas del contenedor
  const cw = MAP_WRAP.clientWidth;
  const ch = MAP_WRAP.clientHeight;

  // Medimos el tooltip (aseguramos display para medir)
  const prevDisplay = MAP_TIP.style.display;
  if (getComputedStyle(MAP_TIP).display === 'none') MAP_TIP.style.display = 'block';
  const tw = MAP_TIP.offsetWidth;
  const th = MAP_TIP.offsetHeight;
  MAP_TIP.style.display = prevDisplay || '';

  // Offset base
  const pad = 12;
  let x = relX + pad;
  let y = relY + pad;

  // Clamp para que no se salga del cuadro
  x = Math.max(pad, Math.min(x, cw - tw - pad));
  y = Math.max(pad, Math.min(y, ch - th - pad));

  MAP_TIP.style.left = `${x}px`;
  MAP_TIP.style.top  = `${y}px`;
}

/* Para hover: se llama con el puntero (coordenadas relativas al contenedor) */
function positionTooltipFromPointer(ev) {
  if (!MAP_WRAP || !MAP_TIP) return;
  const r = MAP_WRAP.getBoundingClientRect();
  const relX = ev.clientX - r.left;
  const relY = ev.clientY - r.top;
  clampTooltipPosition(relX, relY);
}

/* Para tap/click: centramos en el nodo del departamento */
function positionTooltipFromNode(node) {
  if (!MAP_WRAP || !MAP_TIP || !node) return;
  const rWrap = MAP_WRAP.getBoundingClientRect();
  const rNode = node.getBoundingClientRect();
  const relX = (rNode.left + rNode.width  / 2) - rWrap.left;
  const relY = (rNode.top  + rNode.height / 2) - rWrap.top;
  clampTooltipPosition(relX, relY);
}

positionTooltipFromPointer(ev);

// 1) Garantiza proporción centrada y evita dimensiones fijas del archivo original
svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
svg.removeAttribute('width');
svg.removeAttribute('height');

// 2) Recalcula viewBox con el contenido real (espera un frame para que el layout exista)
requestAnimationFrame(() => {
  try {
    // Unimos las cajas de todos los elementos gráficos relevantes
    const nodes = svg.querySelectorAll('path, polygon, polyline, rect, circle, ellipse');
    if (!nodes.length) return; // si no hay, usamos el viewBox que traiga el archivo

    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    nodes.forEach(n => {
      const b = n.getBBox();
      x1 = Math.min(x1, b.x);
      y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.width);
      y2 = Math.max(y2, b.y + b.height);
    });

    const pad = 0; // margen visual
    const vb = `${x1 - pad} ${y1 - pad} ${(x2 - x1) + pad*2} ${(y2 - y1) + pad*2}`;
    svg.setAttribute('viewBox', vb);
  } catch (e) {
    console.warn('[cobertura-map] No se pudo normalizar el viewBox:', e);
  }
});

    // ==== TAP EN MÓVIL: simular hover sin recargar ====

const SVG_ROOT = svg;                           // el <svg> recién inyectado
const DEPT_SEL = '[data-dept], path[id], g[id]';

// 1) Neutralizar navegación de enlaces internos del SVG (evita reload)
SVG_ROOT.addEventListener('click', (e) => {
  const a = e.target.closest('a,[href],[xlink\\:href]');
  if (a) { e.preventDefault(); e.stopPropagation(); }
}, { capture: true });

// 2) Listeners por departamento
SVG_ROOT.querySelectorAll(DEPT_SEL).forEach(node => {
  node.classList.add('dept'); // por si tu CSS ya usa .dept

  // hover real en desktop
  node.addEventListener('pointerenter', () => activateDept(getDeptId(node)));
  node.addEventListener('pointerleave', () => deactivateDept());

  // tap/click: simular hover + abrir acordeón + NO navegar
  node.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  const id = getDeptId(node);
  activateDept(id);
  // (si no querés auto-abrir el acordeón, dejalo así)
  setDeptInUrl(id);

  // posicionar el tooltip dentro del recuadro sin que se corte
  MAP_TIP?.classList.remove('hidden'); // si lo ocultás por defecto
  positionTooltipFromNode(node);
  
    
    if (AUTO_EXPAND_ON_SELECT) openAccordionItem(id);
    setDeptInUrl(id); // sin recargar
    // opcional: acercar el item del acordeón a la vista
    document.querySelector(`#acc-${cssSafe(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

window.addEventListener('resize', () => {
  if (CURRENT_EL && !MAP_TIP?.classList.contains('hidden')) {
    positionTooltipFromNode(CURRENT_EL);
  }
}, { passive: true });


// --- helpers ---
function getDeptId(el) { return el.dataset.dept || el.id; }
function cssSafe(id)   { return id.replace(/[^a-zA-Z0-9\-_]/g, '\\$&'); }

let CURRENT_EL = null;
function activateDept(id) {
  if (CURRENT_EL) CURRENT_EL.classList.remove('is-touch');
  CURRENT_EL = SVG_ROOT.querySelector(`[data-dept="${id}"], #${cssSafe(id)}`);
  if (CURRENT_EL) CURRENT_EL.classList.add('is-touch'); // mimetiza :hover
}
function deactivateDept() {
  if (CURRENT_EL) CURRENT_EL.classList.remove('is-touch');
  CURRENT_EL = null;
}

// Abre el acordeón del depto (ajustá el selector a tu markup)
function openAccordionItem(id) {
  // ejemplos posibles:
  const d = document.querySelector(`#acc-${cssSafe(id)}`) 
        || document.querySelector(`details[data-dept="${id}"]`);
  if (d && 'open' in d) d.open = true;
}

// Cambia la URL sin recargar la página (nada de navegar)
function setDeptInUrl(id) {
  const url = new URL(location);
  url.searchParams.set('dept', id);
  history.replaceState(null, '', url); // NO agrega entrada al historial y NO recarga
}

// (Opcional) si tenés tooltip flotante, lo apagamos en touch:
if (matchMedia('(hover: none)').matches) {
  document.querySelector('#map-tooltip')?.classList.add('hidden'); // o removerlo
}



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

      function fitSvgToContent(svgEl, padding = 24) {
  try {
    // Tomamos el <g> principal si existe (suele contener los departamentos)
    const content = svgEl.querySelector('g') || svgEl;
    const box = content.getBBox();
    const vb = [
      box.x - padding,
      box.y - padding,
      box.width + padding * 2,
      box.height + padding * 2
    ].join(' ');

    svgEl.setAttribute('viewBox', vb);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.removeAttribute('width');
    svgEl.removeAttribute('height');
    svgEl.style.width = '100%';
    svgEl.style.height = 'auto';
  } catch (e) {
    console.warn('[cobertura-map] No se pudo recalcular viewBox:', e);
  }
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
