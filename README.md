# Inspira Models

Sitio web de Inspira Models — academia y agencia de talentos en Medellín, Colombia. Sin backend propio: los formularios escriben directamente a Google Sheets a través de Google Apps Script.

## Archivos

- `index.html` — Página principal: inscripción de modelos, solicitud de curso grupal, info de la academia.
- `empresas.html` — Portal para marcas/empresas que quieren contratar talentos.
- `admin.html` / `admin.js` — Panel de la directora: ver inscripciones, marcas, grupos y profesores; aceptar o rechazar modelos; crear perfiles de profesor.
- `scripts.js` — Lógica del sitio principal (modal de inscripción, cálculo de edad, subida de fotos, envío a Google Sheets).
- `styles.css` — Estilos de todo el sitio.
- `google-apps-script.gs` — Código del Web App de Google Apps Script. Debe pegarse en el editor de Apps Script del proyecto vinculado al Google Sheet.

## Base de datos

Google Sheets (ID configurado en `SHEET_ID` dentro de `google-apps-script.gs`), con las hojas:

- `inscripciones` — solicitudes de modelos/padres, con fotos (cuerpo entero + medio cuerpo) guardadas en Google Drive.
- `solicitudes_marcas` — solicitudes de empresas.
- `solicitudes_grupo` — solicitudes de curso grupal.
- `profesores` — perfiles de profesores creados desde el admin.
- `modelos` — modelos aceptados, con usuario/contraseña generados automáticamente.

## Cómo desplegar cambios al backend

1. Copia el contenido de `google-apps-script.gs`.
2. Pégalo en [script.google.com](https://script.google.com) en el proyecto del Web App.
3. Si agregaste columnas nuevas, ejecuta la función `setup` una vez.
4. Deploy → Manage deployments → ícono de lápiz → **New version** → Deploy.
5. Confirma que "Who has access" esté en **Anyone**.

## Panel de administración

Abrir `admin.html` (o el botón "Admin" fijo en la esquina inferior izquierda del sitio). Contraseña: ver `admin.js` (`PASSWORD`).
