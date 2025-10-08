
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

