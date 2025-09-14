# Integración Firebase (Firestore) – Archivos nuevos

**Incluido en este paquete:**

- `firebase-init.js` (config e init de Firebase v10 via CDN ESM)
- `leads.js` (manejo de formularios y guardado en Firestore, mantiene WhatsApp)
- `firestore.rules` (reglas mínimas para colección `leads`)
- `robots.txt` y `sitemap.xml` (SEO técnico básico, editar dominio)
- `README_FIREBASE.md` (este) con paso a paso

---

## Paso a paso (como trabajamos antes)

### 1) Crear proyecto Firebase
- Ir a https://console.firebase.google.com → **Add Project**.
- Activar o no Analytics (opcional).

### 2) Agregar app Web y copiar config
- En la consola: **Project Overview → Add app → Web**.
- Copiá el objeto de configuración y pegalo en `firebase-init.js` (reemplazar `TU_API_KEY`, `TU_PROJECT_ID`, etc.).

### 3) Habilitar Firestore (producción)
- **Build → Firestore Database → Create**.
- Modo **Production**.

### 4) Reglas de seguridad
- Entrá a **Rules** de Firestore y pegá el contenido de `firestore.rules`.
- **Publish**.

> Estas reglas permiten **crear** documentos en `leads` desde el front y bloquean lectura pública. Son mínimas; para endurecer, te armo una Cloud Function en el siguiente sprint.

### 5) Subir archivos al proyecto
- Copiá `firebase-init.js` y `leads.js` a la raíz o a `/js` (ajustá los paths).
- Colocá en el HTML, antes de `</body>`:
```html
<script type="module" src="./firebase-init.js"></script>
<script type="module" src="./leads.js"></script>
```
- **No quites** tu `app.js`. `leads.js` solo maneja los formularios y Firestore.

### 6) Probar local
- Serví el sitio con un server (ESM necesita HTTP): 
  - VS Code **Live Server** o
  - `python3 -m http.server` → http://localhost:8000
- Enviá un formulario y verificá documentos en **Firestore → Data → leads**.

### 7) SEO técnico
- Subí `robots.txt` y `sitemap.xml` a la **raíz** del sitio.
- Editá el dominio real.
- En Search Console: enviá `sitemap.xml`.

### 8) WhatsApp y UTM
- El flujo a WhatsApp se mantiene. Las UTM de la URL se guardan en cada documento `lead.utm`.

### 9) Próximos pasos (opcionales)
- reCAPTCHA v3 en formularios.
- Cloud Function para enviar **email de alerta** al ingresar un lead (SendGrid/Mailgun).
- GA4 (`gtag.js`) con eventos: `lead_submit`, `click_whatsapp`, `click_tel`.

### Troubleshooting
- Error de imports → asegurate de usar `<script type="module">` y un server HTTP.
- Permisos/Reglas → confirmá que publicaste `firestore.rules`.
- `createdAt` vacío → es `serverTimestamp()`, se materializa al refrescar en la consola.
