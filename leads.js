// leads.js
import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

function getUTM(){
  const p = new URLSearchParams(location.search);
  const o = {};
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k=>{
    if(p.get(k)) o[k]=p.get(k);
  });
  return o;
}

async function getClientHints(){
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    referrer: document.referrer || null,
    viewport: { w: innerWidth, h: innerHeight }
  };
}

async function saveLead(payload){
  const data = { ...payload, createdAt: serverTimestamp() };
  await addDoc(collection(db, "leads"), data);
  console.log("[Firestore] Lead guardado", data);
}

const formSalida = qs("#consultaSalida");
if(formSalida){
  formSalida.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(formSalida);
    const lead = {
      form: "consultaSalida",
      ciudad: fd.get("ciudad") || "",
      telefono: fd.get("telefono") || "",
      source: "web",
      utm: getUTM(),
      page: location.pathname + location.search,
      notes: "Consulta próxima salida"
    };
    const hints = await getClientHints();
    await saveLead({...lead, hints});
    const msg = `Consulta de próxima salida:%0A- Ciudad: ${encodeURIComponent(lead.ciudad)}%0A- Contacto: ${encodeURIComponent(lead.telefono)}`;
    const wa = new URL("https://wa.me/59893943838");
    wa.searchParams.set("text", msg);
    window.open(wa.toString(), "_blank");
    formSalida.reset();
  });
}

const formCot = qs("#cotizar");
if(formCot){
  const successMsg = formCot.querySelector(".form-success");
  formCot.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(formCot);
    const lead = {
      form: "cotizar",
      nombre: fd.get("nombre") || "",
      email: fd.get("email") || "",
      telefono: fd.get("telefono") || "",
      origen: fd.get("origen") || "",
      destino: fd.get("destino") || "",
      tipo: fd.get("tipo") || "",
      medidas: fd.get("medidas") || "",
      servicio: fd.get("servicio") || "",
      urgencia: fd.get("urgencia") || "Estándar",
      mensaje: fd.get("mensaje") || "",
      whatsapp_ok: !!fd.get("whatsapp_ok"),
      source: "web",
      utm: getUTM(),
      page: location.pathname + location.search
    };
    const hints = await getClientHints();
    await saveLead({...lead, hints});

    if(successMsg){ successMsg.hidden = false; }

    if(lead.whatsapp_ok){
      const resumen = [
        `Solicitud de presupuesto:`,
        `Nombre/Empresa: ${lead.nombre}`,
        `Email: ${lead.email}`,
        `Tel/WhatsApp: ${lead.telefono}`,
        `Origen: ${lead.origen} → Destino: ${lead.destino}`,
        `Tipo: ${lead.tipo}`,
        `Medidas/Peso: ${lead.medidas||"-"}`,
        `Servicio: ${lead.servicio}`,
        `Urgencia: ${lead.urgencia}`,
        `Mensaje: ${lead.mensaje||"-"}`
      ].join("\n");
      const wa = new URL("https://wa.me/59893943838");
      wa.searchParams.set("text", resumen);
      window.open(wa.toString(), "_blank");
    }

    formCot.reset();
  });
}

qsa("[href^='tel:']").forEach(el=>{
  el.addEventListener("click", ()=> console.log("metric: click_tel"));
});
qsa("#ctaWhatsAppHeader, #ctaWhatsAppBar, #ctaWhatsAppContacto").forEach(el=>{
  el.addEventListener("click", ()=> console.log("metric: click_whatsapp"));
});
