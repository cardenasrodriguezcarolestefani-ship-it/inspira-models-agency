// Reemplaza TU_URL_DE_WEB_APP con la URL que obtengas al publicar el Apps Script.
const API_BASE = 'TU_URL_DE_WEB_APP';

async function postToGoogleSheet(path, payload) {
  const response = await fetch(`${API_BASE}?path=${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

// Ejemplo de uso para inscripciones
await postToGoogleSheet('inscripciones', {
  tipo: 'Modelo',
  nombre: 'Ana Pérez',
  edad: 21,
  wpp: '+57 300 000 0000',
  ciudad: 'Medellín',
  categoria: 'Comercial',
  fuente: 'Instagram'
});
