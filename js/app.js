
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

/** 1) Mapeo Departamento → Destinos (completá/ajustá según tu cobertura real) */
const DESTINOS_POR_DEPTO = {
  "artigas": ["Artigas"],
  "canelones": ["Canelones","Progreso","Sauce","Las Piedras","Santa Lucía","Santa Rosa","San Bautista","San Ramón","Los Cerrillos","Tala","Costa de Oro"],
  "cerro-largo": ["Melo","Río Branco","Tupambaé","Cerro Chato (comp.)","La Charqueada"],
  "colonia": ["Colonia del Sacramento","Carmelo","Rosario","Tarariras","Nueva Palmira"],
  "durazno": ["Durazno","Sarandí del Yí","Cerro Chato (comp.)"],
  "flores": ["Trinidad"],
  "florida": ["Florida","Casupá","Fray Marcos","Cerro Chato (comp.)"],
  "lavalleja": ["Minas","Solís de Mataojo","José Pedro Varela (comp.)","Mariscala"],
  "maldonado": ["Maldonado","Aiguá"],
  "montevideo": ["Montevideo"],
  "paysandu": ["Paysandú"],
  "rio-negro": ["Fray Bentos","Young"],
  "rivera": ["Rivera"],
  "rocha": ["Rocha","Punta del Diablo","Castillos","Chuy","Barra de Valizas","Cabo Polonio","Aguas Dulces","La Coronilla"],
  "salto": ["Salto"],
  "san-jose": ["San José de Mayo","Libertad"],
  "soriano": ["Mercedes","Cardona","José E. Rodó"],
  "tacuarembo": ["Tacuarembó","Villa Ansina"],
  "treinta-y-tres": ["Treinta y Tres","Santa Clara del Olimar","Cerro Chato (comp.)","La Charqueada"]
};

/** 2) Normalizador de IDs (acepta PascalCase, snake, etc. y devuelve kebab-case) */
function normIdToKebab(id) {
  if (!id) return "";
  // Ej.: "Treinta y Tres" → "treinta-y-tres", "CerroLargo" → "cerro-largo"
  return id
    .toString()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}
function fmtNombreDesdeKebab(k) {
  return k.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace(" Y ", " y ");
}

/** 3) Modal liviano */
function abrirModalDepto(nombreDepto, destinos) {
  const html = `
    <div class="modal-backdrop" id="modalDepto">
      <div class="modal-box">
        <h3>${nombreDepto}</h3>
        ${
          destinos?.length
            ? `<ul>${destinos.map(d=>`<li>${d}</li>`).join("")}</ul>`
            : `<p>No hay destinos disponibles.</p>`
        }
        <button id="cerrarModal">Cerrar</button>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("cerrarModal").addEventListener("click", ()=> {
    document.getElementById("modalDepto")?.remove();
  });
}

/** 4) Hook del SVG (auto-detecta paths con class="depto") */
document.addEventListener("DOMContentLoaded", () => {
  const mapa = document.getElementById("mapaUruguay");
  if (!mapa) return;

  mapa.addEventListener("load", () => {
    const svgDoc = mapa.contentDocument;
    if (!svgDoc) return;

    const deptos = Array.from(svgDoc.querySelectorAll(".depto"));
    deptos.forEach(node => {
      const rawId = node.getAttribute("id") || "";
      const kId = normIdToKebab(rawId);   // compat PascalCase → kebab-case
      const destinos = DESTINOS_POR_DEPTO[kId] || [];

      // Aseguro interactividad aunque el SVG ya traiga estilos
      node.style.cursor = "pointer";

      node.addEventListener("click", () => {
        const nombre = fmtNombreDesdeKebab(kId || rawId);
        abrirModalDepto(nombre, destinos);
      });

      // pequeño hover accesible
      node.addEventListener("mouseenter", () => node.classList.add("hover"));
      node.addEventListener("mouseleave", () => node.classList.remove("hover"));
    });
  });
});

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
