// mailTemplate.js
function fmt(v){
  if(v === undefined || v === null || v === "") return "—";
  if(typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

export function leadToText(id, lead){
  return [
    `Nuevo lead #${id}`,
    `Formulario: ${fmt(lead.form)}`,
    `Nombre/Empresa: ${fmt(lead.nombre)}`,
    `Email: ${fmt(lead.email)}`,
    `Teléfono: ${fmt(lead.telefono)}`,
    `Origen: ${fmt(lead.origen)} -> Destino: ${fmt(lead.destino)}`,
    `Tipo: ${fmt(lead.tipo)}`,
    `Medidas/Peso: ${fmt(lead.medidas)}`,
    `Servicio: ${fmt(lead.servicio)}`,
    `Urgencia: ${fmt(lead.urgencia)}`,
    `Mensaje: ${fmt(lead.mensaje)}`,
    `Ciudad (consulta salida): ${fmt(lead.ciudad)}`,
    `Notas: ${fmt(lead.notes)}`,
    ``,
    `UTM: ${fmt(lead.utm)}`,
    `Página: ${fmt(lead.page)}`,
    `Hints: ${fmt(lead.hints)}`,
    ``,
    `Creado: ${fmt(lead.createdAt)} (serverTimestamp)`
  ].join("\n");
}

export function leadToHtml(id, lead){
  const row = (k,v)=>`<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${fmt(v)}</td></tr>`;
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#111">
    <h2 style="margin:0 0 6px">Nuevo lead #${id}</h2>
    <p style="margin:0 0 16px">Formulario: <strong>${fmt(lead.form)}</strong></p>
    <table style="border-collapse:collapse;width:100%;max-width:720px">
      ${row("Nombre/Empresa", lead.nombre)}
      ${row("Email", lead.email)}
      ${row("Teléfono", lead.telefono)}
      ${row("Origen → Destino", `${fmt(lead.origen)} → ${fmt(lead.destino)}`)}
      ${row("Tipo", lead.tipo)}
      ${row("Medidas/Peso", lead.medidas)}
      ${row("Servicio", lead.servicio)}
      ${row("Urgencia", lead.urgencia)}
      ${row("Mensaje", lead.mensaje)}
      ${row("Ciudad (consulta salida)", lead.ciudad)}
      ${row("Notas", lead.notes)}
      ${row("UTM", JSON.stringify(lead.utm))}
      ${row("Página", lead.page)}
      ${row("Hints", JSON.stringify(lead.hints))}
      ${row("Creado", "serverTimestamp")}
    </table>
    <p style="font-size:12px;color:#666;margin-top:16px">
      Este correo se generó automáticamente desde Firestore (colección <code>leads</code>).
    </p>
  </div>`;
}
