
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

/*
Archivo: app.js
Descripción: Lógica para el buscador de destinos y menú desplegable.
Autor: Agencia Ariel
*/

// ====== LISTA DE DESTINOS ======
const destinos = [
  "Rocha","Punta del Diablo","Castillos","Chuy","Barra de Valizas",
  "Cabo Polonio","Aguas Dulces","La Coronilla",
  "Maldonado","Aiguá",
  "Paysandú","Carmelo","Colonia","Rosario","Tarariras","Nueva Palmira",
  "San José","Libertad",
  "Florida","Casupá","Fray Marcos",
  "Canelones","Progreso","Sauce","Las Piedras","Santa Lucía","Santa Rosa","Tala",
  "Durazno","Trinidad","Salto",
  "Treinta y Tres","Santa Clara del Olimar","Cerro Chato",
  "Artigas","Minas","Solís de Mataojo"
  // Agregar todos los demás aquí
];

// ====== BUSCADOR ======
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", function() {
  const query = this.value.toLowerCase();
  searchResults.innerHTML = "";

  if (query.length > 1) {
    const filtered = destinos.filter(dest => dest.toLowerCase().includes(query));
    filtered.forEach(dest => {
      const li = document.createElement("li");
      li.textContent = dest;
      searchResults.appendChild(li);
    });
  }
});

// ====== ACCORDION ======
const accBtns = document.querySelectorAll(".accordion-btn");

accBtns.forEach(btn => {
  btn.addEventListener("click", function() {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

/*
Archivo: app.js
Descripción: Lógica para buscador, menú y mapa SVG interactivo.
*/

// ===== MAPA SVG INTERACTIVO =====
document.addEventListener("DOMContentLoaded", () => {
  const mapa = document.getElementById("mapaUruguay");

  mapa.addEventListener("load", () => {
    const svgDoc = mapa.contentDocument;

    // Lista de departamentos en el SVG
    const departamentos = ["Rocha", "Maldonado", "Canelones"];

    departamentos.forEach(dep => {
      const depto = svgDoc.getElementById(dep);
      if (depto) {
        depto.addEventListener("click", () => {
          alert("Destinos en " + dep); 
          // Aquí en lugar de alert podríamos mostrar un modal con la lista de destinos
        });
      }
    });
  });
});

