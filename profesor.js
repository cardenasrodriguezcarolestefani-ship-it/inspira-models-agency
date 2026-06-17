const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

let sesion = { usuario: '', password: '' };
let estudiantesCache = [];
let asistenciaEstado = {};

function esc(v) { return String(v || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmt(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

// LOGIN
async function doLogin() {
  const usuario  = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPass').value;
  const errBox = document.getElementById('loginError');
  errBox.style.display = 'none';
  if (!usuario || !password) return;

  const btn = document.querySelector('.login-btn');
  btn.disabled = true; btn.textContent = 'Ingresando...';

  try {
    const res = await fetch(`${API_BASE}?path=login-profesor&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    btn.disabled = false; btn.textContent = 'Ingresar';

    if (!data.success) {
      errBox.textContent = 'Usuario o contraseña incorrectos';
      errBox.style.display = 'block';
      return;
    }
    sesion = { usuario, password };
    sessionStorage.setItem('profesor_usuario', usuario);
    sessionStorage.setItem('profesor_pass', password);
    mostrarDashboard(data);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Ingresar';
    errBox.textContent = 'Error de conexión. Intenta de nuevo.';
    errBox.style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('profesor_usuario');
  sessionStorage.removeItem('profesor_pass');
  location.reload();
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

function mostrarDashboard(data) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('dashNombre').textContent = data.profesor.nombre;

  estudiantesCache = data.estudiantes || [];
  renderEstudiantes(estudiantesCache);
  renderAsistenciaForm(estudiantesCache);
  renderExcusas(data.excusasPendientes || []);
  renderTalleres(data.talleres || []);
  renderActividades(data.actividades || []);
}

// ESTUDIANTES
function renderEstudiantes(rows) {
  const select = document.getElementById('calEstudiante');
  select.innerHTML = rows.map(r => `<option value="${esc(r.usuario)}">${esc(r.nombre)}</option>`).join('') || '<option value="">Sin estudiantes activos</option>';

  const lista = document.getElementById('listaEstudiantes');
  if (!rows.length) { lista.innerHTML = '<p class="empty-msg">No hay estudiantes activos todavía.</p>'; return; }
  lista.innerHTML = rows.map(r => `
    <div class="est-row">
      <div><div class="est-name">${esc(r.nombre)}</div><div class="est-meta">${esc(r.horario)}</div></div>
    </div>
  `).join('');
}

async function agregarCalificacion() {
  const usuario = document.getElementById('calEstudiante').value;
  const materia = document.getElementById('calMateria').value;
  const calificacion = document.getElementById('calCalificacion').value;
  const comentario = document.getElementById('calComentario').value.trim();
  if (!usuario || !comentario) { alert('Selecciona el estudiante y escribe una sugerencia.'); return; }

  await enviarASheet(new URLSearchParams({
    path: 'add-seguimiento', usuario, materia, calificacion, comentario,
    autor: document.getElementById('dashNombre').textContent
  }));

  document.getElementById('calCalificacion').value = '';
  document.getElementById('calComentario').value = '';
  const ok = document.getElementById('calOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

// ASISTENCIA
function renderAsistenciaForm(rows) {
  asistenciaEstado = {};
  rows.forEach(r => asistenciaEstado[r.usuario] = 'presente');

  const wrap = document.getElementById('listaAsistencia');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">No hay estudiantes activos todavía.</p>'; return; }
  wrap.innerHTML = rows.map(r => `
    <div class="est-row">
      <div><div class="est-name">${esc(r.nombre)}</div><div class="est-meta">${esc(r.horario)}</div></div>
      <div class="asis-toggle" id="asis_${esc(r.usuario)}">
        <button class="asis-btn active-si" onclick="marcarToggle('${r.usuario}','presente',this)">Presente</button>
        <button class="asis-btn" onclick="marcarToggle('${r.usuario}','ausente',this)">Ausente</button>
      </div>
    </div>
  `).join('');
}

function marcarToggle(usuario, estado, btn) {
  asistenciaEstado[usuario] = estado;
  const group = btn.parentElement;
  group.querySelectorAll('.asis-btn').forEach(b => b.classList.remove('active-si', 'active-no'));
  btn.classList.add(estado === 'presente' ? 'active-si' : 'active-no');
}

async function guardarAsistencia() {
  const lista = estudiantesCache.map(r => ({ usuario: r.usuario, nombre: r.nombre, estado: asistenciaEstado[r.usuario] || 'presente' }));
  if (!lista.length) return;

  await enviarPOST(new URLSearchParams({
    path: 'marcar-asistencia',
    usuarioProfesor: sesion.usuario,
    asistencias: JSON.stringify(lista)
  }));

  const ok = document.getElementById('asisOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

// EXCUSAS
function renderExcusas(rows) {
  const wrap = document.getElementById('listaExcusas');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">No hay excusas pendientes.</p>'; return; }
  wrap.innerHTML = rows.map(r => `
    <div class="excusa-card">
      <div>
        <div class="excusa-info">${esc(r.nombre)} — ${esc(r.motivo)}</div>
        <div class="excusa-meta">${fmt(r.created_at)} ${r.archivo_url ? `· <a href="${r.archivo_url}" target="_blank" style="color:var(--gold)">ver archivo</a>` : ''}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-aceptar" data-row="${r._rowNum}" onclick="resolverExcusa(this,'aprobada')">Aprobar</button>
        <button class="btn-rechazar" data-row="${r._rowNum}" onclick="resolverExcusa(this,'rechazada')">Rechazar</button>
      </div>
    </div>
  `).join('');
}

async function resolverExcusa(btn, accion) {
  const rowNum = btn.dataset.row;
  await enviarASheet(new URLSearchParams({ path: 'revisar-excusa', rowNum, accion }));
  btn.closest('.excusa-card').style.opacity = '0.4';
}

// TALLERES
function renderTalleres(rows) {
  const wrap = document.getElementById('listaTalleres');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">Aún no has publicado talleres.</p>'; return; }
  wrap.innerHTML = rows.slice().reverse().map(t => `
    <div class="item-card">
      <div class="item-title">${esc(t.titulo)} <span style="color:var(--muted);font-size:0.65rem">· ${esc(t.materia)}</span></div>
      <div class="item-desc">${esc(t.descripcion)}</div>
      ${t.archivo_url ? `<a href="${t.archivo_url}" target="_blank" style="font-size:0.7rem;color:var(--gold)">Ver material →</a>` : ''}
      <div class="item-meta">${fmt(t.created_at)}</div>
    </div>
  `).join('');
}

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function crearTaller() {
  const materia = document.getElementById('tlMateria').value.trim();
  const titulo = document.getElementById('tlTitulo').value.trim();
  const descripcion = document.getElementById('tlDescripcion').value.trim();
  const link = document.getElementById('tlLink').value.trim();
  const file = document.getElementById('tlArchivoInput').files[0];
  if (!titulo) { alert('Escribe un título.'); return; }

  let archivo = '';
  if (file) archivo = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'crear-taller', usuarioProfesor: sesion.usuario,
    nombreProfesor: document.getElementById('dashNombre').textContent,
    materia, titulo, descripcion, link, archivo
  }));

  document.getElementById('tlMateria').value = '';
  document.getElementById('tlTitulo').value = '';
  document.getElementById('tlDescripcion').value = '';
  document.getElementById('tlLink').value = '';
  document.getElementById('tlArchivoInput').value = '';

  const ok = document.getElementById('tlOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

// ACTIVIDADES
function renderActividades(rows) {
  const wrap = document.getElementById('listaActividades');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">Aún no has programado actividades.</p>'; return; }
  wrap.innerHTML = rows.slice().reverse().map(a => `
    <div class="item-card">
      <div class="item-title">${esc(a.titulo)}</div>
      <div class="item-desc">${esc(a.descripcion)}</div>
      <div class="item-meta">Fecha: ${fmt(a.fecha_actividad)}</div>
    </div>
  `).join('');
}

async function crearActividad() {
  const titulo = document.getElementById('acTitulo').value.trim();
  const descripcion = document.getElementById('acDescripcion').value.trim();
  const fechaActividad = document.getElementById('acFecha').value;
  if (!titulo || !fechaActividad) { alert('Escribe un título y selecciona una fecha.'); return; }

  await enviarASheet(new URLSearchParams({
    path: 'crear-actividad', usuarioProfesor: sesion.usuario,
    nombreProfesor: document.getElementById('dashNombre').textContent,
    titulo, descripcion, fechaActividad
  }));

  document.getElementById('acTitulo').value = '';
  document.getElementById('acDescripcion').value = '';
  document.getElementById('acFecha').value = '';

  const ok = document.getElementById('acOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

// ENVÍO GET (iframe, fire-and-forget)
function enviarASheet(params) {
  return new Promise((resolve) => {
    const id = 'iframe_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = id;
    iframe.style.cssText = 'display:none;width:0;height:0;border:0';
    document.body.appendChild(iframe);
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = API_BASE;
    form.target = id;
    for (const [k, v] of params.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = k; input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      resolve();
    }, 2500);
  });
}

// ENVÍO POST (iframe, para archivos/payloads grandes)
function enviarPOST(params) {
  return new Promise((resolve) => {
    const id = 'iframe_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = id;
    iframe.style.cssText = 'display:none;width:0;height:0;border:0';
    document.body.appendChild(iframe);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = API_BASE;
    form.target = id;
    for (const [k, v] of params.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = k; input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      resolve();
    }, 6000);
  });
}

// AUTO-LOGIN
window.addEventListener('DOMContentLoaded', async () => {
  const usuario  = sessionStorage.getItem('profesor_usuario');
  const password = sessionStorage.getItem('profesor_pass');
  if (usuario && password) {
    sesion = { usuario, password };
    const res = await fetch(`${API_BASE}?path=login-profesor&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    if (data.success) mostrarDashboard(data);
  }
});
