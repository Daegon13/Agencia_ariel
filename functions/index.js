/**
 * Cloud Functions – Alertas de Lead (SendGrid)
 * - Dispara email al crear un documento en Firestore: collection('leads')
 * - Sin reCAPTCHA (a pedido), se recomienda monitorear volumen.
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import sgMail from "@sendgrid/mail";
import { leadToHtml, leadToText } from "./mailTemplate.js";

// ⚙️ SECRETO: configurá SENDGRID_API_KEY con Firebase CLI
//   firebase functions:secrets:set SENDGRID_API_KEY
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");

// ⚙️ Email destino (puede setearse como variable de entorno en deploy)
const TO_EMAIL = process.env.TO_EMAIL || "tudireccion@tudominio.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@tudominio.com"; // Debe estar verificada en SendGrid

export const onLeadCreatedEmail = onDocumentCreated(
  {
    document: "leads/{docId}",
    region: "southamerica-east1",
    secrets: [SENDGRID_API_KEY],
    timeoutSeconds: 60,
    memory: "128MiB",
    invoker: "public", // si querés limitar, quitá esta línea
  },
  async (event) => {
    try {
      const snap = event.data;
      if (!snap) return;
      const lead = snap.data();
      const id = snap.id;

      // Preparar SendGrid
      sgMail.setApiKey(SENDGRID_API_KEY.value());

      const subject = `🧾 Nuevo lead (${lead.form || "desconocido"}) – ${lead.nombre || "Sin nombre"}`;
      const msg = {
        to: TO_EMAIL,
        from: FROM_EMAIL,
        subject,
        text: leadToText(id, lead),
        html: leadToHtml(id, lead),
      };

      await sgMail.send(msg);
      logger.info("Email de lead enviado", {id, to: TO_EMAIL, form: lead.form});
    } catch (err) {
      logger.error("Error enviando email de lead", err);
    }
  }
);
