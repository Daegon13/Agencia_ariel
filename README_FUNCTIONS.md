# Cloud Functions para alertas de leads (sin reCAPTCHA)

Envío de email automático cuando se crea un documento en **Firestore → leads**.
Implementación con **SendGrid** (simple, robusto).

## Archivos incluidos
- `functions/package.json` – dependencias, Node 20, scripts
- `functions/index.js` – función `onLeadCreatedEmail` (v2) con secret `SENDGRID_API_KEY`
- `functions/mailTemplate.js` – plantilla HTML/texto del correo
- `functions/.eslintrc.json` – estilo opcional de lint

---

## Requisitos
- **Firebase CLI** instalado (`npm i -g firebase-tools`)
- Proyecto de Firebase ya configurado
- SendGrid (cuenta gratuita) con **API Key** y un remitente verificado

## Pasos de instalación
1) Ir a la carpeta raíz de tu proyecto (donde está `firebase.json` o corré `firebase init` si aún no existe).
2) Copiar la carpeta **functions/** de este paquete dentro de tu proyecto.
3) Instalar dependencias:
```bash
cd functions
npm install
```
4) Configurar secretos y variables:
```bash
# Setear el secreto de SendGrid
firebase functions:secrets:set SENDGRID_API_KEY

# (Opcional) Setear correos de destino/remitente como variables de entorno
firebase functions:config:set email.to="tudireccion@tudominio.com" email.from="no-reply@tudominio.com"
```
> También podés usar variables de entorno del sistema en el deploy:
> `TO_EMAIL` y `FROM_EMAIL`. Si usás `functions:config:set`, podrías leerlas desde `process.env` con scripts de deployment.

5) **Deploy** de la función:
```bash
cd ..   # volver a la raíz con firebase.json
firebase deploy --only functions
```
> La función se desplegará en `southamerica-east1` y escuchará `onDocumentCreated` en `leads/{docId}`.

## Prueba rápida
- En tu web, enviá un formulario para crear un doc en `leads` (ya lo hace `leads.js`).
- Verificá en Firestore que el doc aparece y recibís el email.
- Revisá el dashboard de SendGrid si hay errores de entrega.

## Alternativa Mailgun (si preferís)
- Cambiar `@sendgrid/mail` por la librería HTTP de tu preferencia y hacer `fetch` a la API de Mailgun.
- Si querés, te preparo `mailgun.js` y un flag para alternar proveedor.

## Consejos
- Como no usamos reCAPTCHA, monitorizá el volumen y calidad de leads. Si aparecen bots, podemos:
  - Agregar **honeypot** invisible (campo que los bots suelen completar).
  - Validar email con una **regex** y longitud.
  - Umbral de tasa por IP desde Cloud Functions (siguiente sprint).

Listo. Cuando quieras agrego la capa de **honeypot** y/o **Mailgun** como proveedor alternativo.
