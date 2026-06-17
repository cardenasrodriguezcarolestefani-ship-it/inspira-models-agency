# Configuración de Google Sheets como base de datos

Este archivo tiene todo lo necesario para crear las hojas y la API en Google Sheets.

## 1. Crea el archivo en Google Sheets

1. Abre https://sheets.google.com.
2. Crea una hoja nueva.
3. Renombra las pestañas (hojas) a:
   - `inscripciones`
   - `solicitudes_marcas`
   - `solicitudes_grupo`

## 2. Añade los encabezados

Para la hoja `inscripciones`, usa estas columnas en la fila 1:

- tipo
- nombre
- edad
- wpp
- ciudad
- categoria
- fuente
- created_at

Para la hoja `solicitudes_marcas`, usa:

- empresa
- contacto
- contacto_info
- tipo_campana
- mensaje
- created_at

Para la hoja `solicitudes_grupo`, usa:

- nombre
- wpp
- tipo
- personas
- created_at

## 3. Copia este script en Apps Script

1. En Google Sheets, ve a `Extensiones` → `Apps Script`.
2. Borra el contenido actual.
3. Pega el contenido del archivo `google-apps-script.gs`.
4. Cambia `TU_ID_DE_HOJA_AQUI` por el ID de tu hoja de cálculo.

## 4. Publica el script como Web App

1. En Apps Script, haz clic en `Deploy` → `New deployment`.
2. Selecciona `Web app`.
3. En `Description` escribe algo como `API INSCRIPCIONES Inspira Models`.
4. En `Who has access` selecciona `Anyone`.
5. Haz clic en `Deploy`.
6. Copia la URL de la Web App.

## 5. Cambia tu frontend para usar la URL

En tu `scripts.js`, reemplaza las llamadas a `'/api/inscripciones'`, `'/api/solicitudes-grupo'` y `'/api/solicitudes-marcas'` por:

```js
const API_BASE = 'TU_URL_DE_WEB_APP';

await fetch(`${API_BASE}?path=inscripciones`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

Y para los otros dos endpoints:

- `?path=solicitudes-marcas`
- `?path=solicitudes-grupo`

## 6. Prueba en el navegador

- Abre la página de tu proyecto.
- Envía una inscripción.
- Abre tu Google Sheet y verifica que se llenó la fila.

---

### Nota

Yo no puedo crear la hoja directamente en tu Google Drive porque no tengo acceso a tu cuenta, pero aquí tienes todo lo que necesitas para hacerlo tú misma en minutos.
