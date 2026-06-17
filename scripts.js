// CURSOR (solo desktop)
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx - 4 + 'px';
    cursor.style.top  = my - 4 + 'px';
  });
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx - 18 + 'px';
    ring.style.top  = ry - 18 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a, button, .category-card, .platform-item, .profile-tab, .price-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(2.5)'; ring.style.transform = 'scale(1.5)'; ring.style.opacity = '0.3'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)';   ring.style.transform = 'scale(1)';   ring.style.opacity = '0.6'; });
  });
} else {
  cursor.style.display = 'none';
  ring.style.display   = 'none';
  document.body.style.cursor = 'auto';
}

// NAV SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// NAV MOBILE
function openNav()  { document.getElementById('navMobile').classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeNav() { document.getElementById('navMobile').classList.remove('open'); document.body.style.overflow = ''; }

// LIMITA FECHA DE NACIMIENTO A HOY (no fechas futuras)
window.addEventListener('DOMContentLoaded', () => {
  const fechaInput = document.getElementById('inscFechaNac');
  if (fechaInput) fechaInput.max = new Date().toISOString().split('T')[0];
});

// CONTENIDO PÚBLICO: RESEÑAS / HISTORIAS / NOTICIERO / TIENDA
function escPub(v) { return String(v || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtPub(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function cargarContenidoPublico() {
  try {
    const res = await fetch(`${API_BASE}?path=get-home`);
    const data = await res.json();
    if (!data.success) return;

    renderResenas(data.resenas || []);
    renderHistorias(data.historias || []);
    renderNoticiero(data.noticias || []);
    renderTienda(data.productos || []);
  } catch (err) {
    console.error('Error cargando contenido público:', err);
  }
}

function renderResenas(rows) {
  const grid = document.getElementById('resenasGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Aún no hay reseñas publicadas.</p>'; return; }
  grid.innerHTML = rows.slice(0, 9).map(r => `
    <div class="resena-card">
      <div class="resena-stars">${'★'.repeat(parseInt(r.calificacion) || 5)}${'☆'.repeat(5 - (parseInt(r.calificacion) || 5))}</div>
      <div class="resena-text">"${escPub(r.comentario)}"</div>
      <div class="resena-author">
        <span class="resena-name">${escPub(r.nombre)}</span>
        <span class="resena-tipo">${escPub(r.tipo_usuario)}</span>
      </div>
    </div>
  `).join('');
}

function renderHistorias(rows) {
  const grid = document.getElementById('historiasGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Aún no hay historias publicadas.</p>'; return; }
  grid.innerHTML = rows.slice(0, 6).map(h => `
    <div class="historia-card">
      ${h.foto_url ? `<img src="${h.foto_url}" class="historia-img">` : ''}
      <div class="historia-body">
        <div class="historia-text">"${escPub(h.texto)}"</div>
        <div class="historia-author">${escPub(h.nombre)}</div>
        ${h.video_url ? `<a href="${h.video_url}" target="_blank" class="historia-video-link">Ver video →</a>` : ''}
      </div>
    </div>
  `).join('');
}

function renderNoticiero(rows) {
  const grid = document.getElementById('noticieroGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Próximamente noticias del mundo del modelaje.</p>'; return; }
  const ordenadas = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  grid.innerHTML = ordenadas.slice(0, 6).map(n => `
    <div class="noticia-card">
      ${n.imagen_url ? `<img src="${n.imagen_url}" class="noticia-img">` : ''}
      <div class="noticia-body">
        <div class="noticia-fecha">${fmtPub(n.created_at)}</div>
        <div class="noticia-titulo">${escPub(n.titulo)}</div>
        <div class="noticia-resumen">${escPub(n.resumen)}</div>
        ${n.link ? `<a href="${n.link}" target="_blank" class="noticia-link">Leer más →</a>` : ''}
      </div>
    </div>
  `).join('');
}

function renderTienda(rows) {
  const grid = document.getElementById('tiendaGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Próximamente productos disponibles.</p>'; return; }
  grid.innerHTML = rows.map(p => {
    const msg = encodeURIComponent(`Hola, quiero pedir: ${p.nombre}`);
    return `
    <div class="producto-card">
      ${p.imagen_url ? `<img src="${p.imagen_url}" class="producto-img">` : ''}
      <div class="producto-body">
        <div class="producto-nombre">${escPub(p.nombre)}</div>
        <div class="producto-precio">$${escPub(p.precio)}</div>
        <a href="https://wa.me/573104479013?text=${msg}" target="_blank" class="producto-btn">Pedir por WhatsApp</a>
      </div>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', cargarContenidoPublico);
document.addEventListener('DOMContentLoaded', cargarCatalogoYEmprendimientos);

async function cargarCatalogoYEmprendimientos() {
  try {
    const [resCat, resEmp] = await Promise.all([
      fetch(`${API_BASE}?path=get-catalogo`),
      fetch(`${API_BASE}?path=get-emprendimientos`)
    ]);
    const dataCat = await resCat.json();
    const dataEmp = await resEmp.json();
    if (dataCat.success) renderCatalogo(dataCat.catalogo || []);
    if (dataEmp.success) renderEmprendimientos(dataEmp.emprendimientos || []);
  } catch (err) {
    console.error('Error cargando catálogo/emprendimientos:', err);
  }
}

function renderCatalogo(rows) {
  const grid = document.getElementById('catalogoGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Próximamente perfiles de nuestras modelos.</p>'; return; }
  grid.innerHTML = rows.map(m => `
    <div class="historia-card">
      ${m.fotos && m.fotos[0] ? `<img src="${m.fotos[0]}" class="historia-img">` : ''}
      <div class="historia-body">
        <div class="noticia-titulo" style="font-size:1rem">${escPub(m.nombre_artistico || m.nombre)}</div>
        <div class="historia-text">${escPub(m.ciudad_catalogo)} ${m.estatura ? '· ' + escPub(m.estatura) : ''}</div>
        <div class="historia-author">${escPub(m.tallas)} ${m.medidas ? '· ' + escPub(m.medidas) : ''}</div>
      </div>
    </div>
  `).join('');
}

function renderEmprendimientos(rows) {
  const grid = document.getElementById('emprendimientosGrid');
  if (!grid) return;
  if (!rows.length) { grid.innerHTML = '<p class="empty-msg-public">Próximamente emprendimientos de nuestra comunidad.</p>'; return; }
  grid.innerHTML = rows.map(e => {
    const productosHtml = (e.productos || []).slice(0, 3).map(p => `<div style="font-size:0.7rem;color:rgba(245,242,238,0.5);margin-top:4px">${escPub(p.nombre)} — $${escPub(p.precio)}</div>`).join('');
    return `
    <div class="producto-card">
      ${e.logo_url ? `<img src="${e.logo_url}" class="producto-img">` : ''}
      <div class="producto-body">
        <div class="producto-nombre">${escPub(e.nombre_negocio)}</div>
        <div style="font-size:0.7rem;color:var(--gold);margin-bottom:8px">${escPub(e.categoria)}</div>
        ${productosHtml}
        ${e.contacto ? `<a href="https://wa.me/?text=${encodeURIComponent('Hola, vi tu emprendimiento ' + e.nombre_negocio + ' en Inspira Models')}" target="_blank" class="producto-btn" style="margin-top:14px;display:inline-block">Contactar</a>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function submitEmprendimientoExterno(e) {
  e.preventDefault();
  const nombreNegocio = document.getElementById('extNombreNegocio').value.trim();
  const categoria = document.getElementById('extCategoria').value.trim();
  const descripcion = document.getElementById('extDescripcion').value.trim();
  const email = document.getElementById('extEmail').value.trim();
  const contacto = document.getElementById('extContacto').value.trim();
  if (!nombreNegocio || !email) return;

  await enviarASheet(new URLSearchParams({ path: 'solicitar-emprendimiento-externo', nombreNegocio, categoria, descripcion, email, contacto }));

  document.getElementById('empExternoForm').style.display = 'none';
  document.getElementById('empExternoSuccess').style.display = 'block';
}

// REGISTRO DE EMPRESA (empresas.html)
async function submitRegistroEmpresa(e) {
  e.preventDefault();
  const razonSocial = document.getElementById('regRazonSocial').value.trim();
  const nombreRepresentante = document.getElementById('regRepresentante').value.trim();
  const camaraComercio = document.getElementById('regCamara').value.trim();
  const rut = document.getElementById('regRut').value.trim();
  const documento = document.getElementById('regDocumento').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const whatsapp = document.getElementById('regWhatsapp').value.trim();
  const telefono = document.getElementById('regTelefono').value.trim();
  const instagram = document.getElementById('regInstagram').value.trim();
  const paginaWeb = document.getElementById('regWeb').value.trim();
  const actividadEconomica = document.getElementById('regActividad').value.trim();
  const descripcion = document.getElementById('regDescripcion').value.trim();
  const serviciosRequeridos = document.getElementById('regServicios').value.trim();

  if (!razonSocial || !nombreRepresentante || !email || !whatsapp) return;

  await enviarASheet(new URLSearchParams({
    path: 'registrar-empresa', razonSocial, nombreRepresentante, camaraComercio, rut, documento,
    email, whatsapp, telefono, instagram, paginaWeb, actividadEconomica, descripcion, serviciosRequeridos
  }));

  document.getElementById('regEmpresaFormWrap').style.display = 'none';
  document.getElementById('regEmpresaSuccess').style.display = 'block';
}

// CURSOS Y COTIZACIONES (radicado)
async function submitCotizacion(e) {
  e.preventDefault();
  const nombre = document.getElementById('cotNombre').value.trim();
  const email = document.getElementById('cotEmail').value.trim();
  const telefono = document.getElementById('cotTelefono').value.trim();
  const curso = document.getElementById('cotCurso').value.trim();
  const fechaDeseada = document.getElementById('cotFecha').value;
  const lugar = document.getElementById('cotLugar').value.trim();
  const modalidad = document.getElementById('cotModalidad').value;
  const numPersonas = document.getElementById('cotPersonas').value;
  const horas = document.getElementById('cotHoras').value;
  const observaciones = document.getElementById('cotObservaciones').value.trim();

  if (!nombre || !email || !telefono || !curso) return;

  const btn = document.getElementById('cotSubmitBtn');
  btn.disabled = true; btn.textContent = 'Enviando...';

  const res = await fetch(`${API_BASE}?path=solicitar-cotizacion&` + new URLSearchParams({
    nombre, email, telefono, curso, fechaDeseada, lugar, modalidad, numPersonas, horas, observaciones
  }));
  const data = await res.json();

  btn.disabled = false; btn.textContent = 'Enviar solicitud';
  document.getElementById('cotizacionForm').style.display = 'none';
  document.getElementById('cotizacionSuccess').style.display = 'block';
  if (data.success && data.radicado) {
    document.getElementById('cotizacionRadicado').textContent = data.radicado;
  }
}

// REVISAR PROCESOS (consulta por radicado)
async function consultarProceso() {
  const radicado = document.getElementById('radicadoInput').value.trim();
  const resultBox = document.getElementById('radicadoResultado');
  if (!radicado) return;

  resultBox.innerHTML = '<p class="empty-msg-public">Buscando...</p>';
  resultBox.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}?path=consultar-radicado&radicado=${encodeURIComponent(radicado)}`);
    const data = await res.json();
    if (!data.success) {
      resultBox.innerHTML = `<p class="empty-msg-public">${escPub(data.error || 'Radicado no encontrado')}</p>`;
      return;
    }
    const c = data.cotizacion;
    let pasos = `<li>Solicitud recibida</li>`;
    if (c.estado === 'cotizado' || c.estado === 'confirmado' || c.estado === 'agendado') pasos += `<li>Cotización enviada: <strong>$${escPub(c.valor_cotizado)}</strong></li>`;
    if (c.estado === 'confirmado' || c.estado === 'agendado') pasos += `<li>Comprobante recibido</li>`;
    if (c.estado === 'agendado') pasos += `<li>Profesor asignado: ${escPub(c.profesor_asignado)}</li>`;
    if (c.estado === 'rechazado') pasos += `<li style="color:#e06b6b">Solicitud rechazada</li>`;

    let accionPago = '';
    if (c.estado === 'cotizado') {
      accionPago = `
        <div style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(201,169,110,0.15)">
          <p style="font-size:0.7rem;color:rgba(245,242,238,0.5);margin-bottom:10px">Para confirmar, sube el comprobante del 50% inicial:</p>
          <input type="file" id="cotComprobanteInput" accept="image/*" style="margin-bottom:10px">
          <br><button class="btn-primary" onclick="subirComprobanteCotizacion('${escPub(c.radicado)}')" style="border:none;cursor:pointer;font-family:'Montserrat',sans-serif">Subir comprobante</button>
        </div>`;
    }

    resultBox.innerHTML = `
      <div style="text-align:left">
        <p style="font-size:0.7rem;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px">Radicado ${escPub(c.radicado)} · Estado: ${escPub(c.estado)}</p>
        <ul style="font-size:0.78rem;line-height:2;color:rgba(245,242,238,0.7);padding-left:20px">${pasos}</ul>
        ${c.comentario_admin ? `<p style="font-size:0.75rem;color:rgba(245,242,238,0.5);margin-top:10px">Comentario: ${escPub(c.comentario_admin)}</p>` : ''}
        ${accionPago}
      </div>`;
  } catch (err) {
    resultBox.innerHTML = '<p class="empty-msg-public">Error al consultar. Intenta de nuevo.</p>';
  }
}

function comprimirImagenPub(file) {
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

async function subirComprobanteCotizacion(radicado) {
  const file = document.getElementById('cotComprobanteInput').files[0];
  if (!file) { alert('Selecciona la foto del comprobante.'); return; }
  const comprobante = await comprimirImagenPub(file);

  await enviarASheetPOST(new URLSearchParams({ path: 'subir-comprobante-cotizacion', radicado, comprobante }));
  alert('Comprobante enviado. Tu proceso fue confirmado.');
  consultarProceso();
}

// REVEAL ON SCROLL
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(r => observer.observe(r));

// TABS PERFILES
function switchTab(tab) {
  const tabs = ['modelo', 'marca', 'profesor', 'padre'];
  document.querySelectorAll('.profile-tab').forEach((t, i) => t.classList.toggle('active', tabs[i] === tab));
  document.querySelectorAll('.profile-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

// MODAL INSCRIPCIÓN
function openModal() {
  document.getElementById('inscripcionModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('inscripcionModal').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.getElementById('modalSuccess').style.display   = 'none';
    document.getElementById('modalFormWrap').style.display  = 'block';
    document.getElementById('inscripcionForm').reset();
  }, 400);
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('inscripcionModal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeNav(); } });

let experienciaSeleccionada = 'si';
let esMayorDeEdad = true;
let edadCalculada = null;

let horarioTipo = 'finde';
function selectHorarioTipo(tipo, btn) {
  horarioTipo = tipo;
  document.getElementById('horFin').classList.toggle('active', tipo === 'finde');
  document.getElementById('horSemana').classList.toggle('active', tipo === 'semana');
  document.getElementById('horarioFindeWrap').style.display  = tipo === 'finde'  ? 'block' : 'none';
  document.getElementById('horarioSemanaWrap').style.display = tipo === 'semana' ? 'block' : 'none';
}
// Calcula el rango de 5 horas exactas a partir de una hora de inicio "HH:MM"
function calcularRangoClase(horaInicio24) {
  if (!horaInicio24) return '';
  const [h, m] = horaInicio24.split(':').map(Number);
  const inicio = new Date(2000, 0, 1, h, m);
  const fin = new Date(inicio.getTime() + 5 * 60 * 60 * 1000);
  const fmt = d => d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(inicio)} - ${fmt(fin)}`;
}

function obtenerHorarioElegido() {
  if (horarioTipo === 'finde') return document.getElementById('horarioFindeDia').value;
  const dia = document.getElementById('horarioSemanaDia').value;
  const jornada = document.getElementById('horarioSemanaJornada').value;
  const hora = document.getElementById('horarioSemanaHora').value;
  const rango = calcularRangoClase(hora);
  return `${dia} - ${jornada}` + (rango ? ` (sugerido ${rango})` : '');
}
function obtenerHoraSugerida() {
  return horarioTipo === 'semana' ? (document.getElementById('horarioSemanaHora').value || '') : '';
}

function selectExp(val, btn) {
  experienciaSeleccionada = val;
  document.querySelectorAll('#expSi, #expNo').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// CALCULA EDAD AUTOMÁTICAMENTE DESDE FECHA DE NACIMIENTO
function calcularEdad() {
  const fechaStr = document.getElementById('inscFechaNac').value;
  const info = document.getElementById('edadInfo');
  if (!fechaStr) { info.style.display = 'none'; return; }

  const hoy = new Date();
  const nacimiento = new Date(fechaStr + 'T00:00:00');
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - nacimiento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

  edadCalculada = edad;
  esMayorDeEdad = edad >= 18;

  info.style.display = 'block';
  if (esMayorDeEdad) {
    info.innerHTML = `Edad calculada: <strong>${edad} años</strong> · Mayor de edad`;
    info.style.color = 'rgba(107,224,107,0.85)';
  } else {
    info.innerHTML = `Edad calculada: <strong>${edad} años</strong> · Menor de edad — se requieren datos del acudiente`;
    info.style.color = 'rgba(255,200,50,0.9)';
  }
  document.getElementById('acudienteSection').style.display = esMayorDeEdad ? 'none' : 'block';
}

function previewFoto(tipo, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const idSuffix = tipo === 'completa' ? 'Completa' : 'Medio';
    const ph   = document.getElementById('foto' + idSuffix + 'PH');
    const prev = document.getElementById('foto' + idSuffix + 'Prev');
    ph.style.display = 'none';
    prev.src = e.target.result;
    prev.style.display = 'block';
  };
  reader.readAsDataURL(file);
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
function enviarASheetPOST(params) {
  return new Promise(resolve => {
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

const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

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
      input.type = 'hidden';
      input.name = k;
      input.value = v;
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

// SUBMIT INSCRIPCIÓN → API
async function submitInscripcion(e) {
  e.preventDefault();
  const btn = document.getElementById('inscSubmitBtn');
  btn.disabled = true;

  const nombre      = document.getElementById('inscNombre').value.trim();
  const fechaNac    = document.getElementById('inscFechaNac').value;
  const documento   = document.getElementById('inscDocumento').value.trim();
  const email       = document.getElementById('inscEmail').value.trim();
  const wpp         = document.getElementById('inscWpp').value.trim();
  const ciudad      = document.getElementById('inscCiudad').value.trim();
  const tipo        = 'Modelo';

  if (!fechaNac || edadCalculada === null) {
    alert('Por favor selecciona tu fecha de nacimiento.');
    btn.disabled = false;
    return;
  }

  let acudNombre = '', acudCC = '', acudTel = '';
  if (!esMayorDeEdad) {
    acudNombre = document.getElementById('acudNombre').value.trim();
    acudCC     = document.getElementById('acudCC').value.trim();
    acudTel    = document.getElementById('acudTel').value.trim();
    if (!acudNombre || !acudCC || !acudTel) {
      alert('Por favor completa los datos del acudiente (es menor de edad).');
      btn.disabled = false;
      return;
    }
  }

  const fotoCompletaFile = document.getElementById('fotoCompletaInput').files[0];
  const fotoMedioFile    = document.getElementById('fotoMedioInput').files[0];
  if (!fotoCompletaFile || !fotoMedioFile) {
    alert('Por favor sube la foto de cuerpo entero y la foto medio cuerpo.');
    btn.disabled = false;
    return;
  }

  btn.textContent = 'Procesando fotos...';
  const fotoCompletaB64 = await comprimirImagen(fotoCompletaFile);
  const fotoMedioB64    = await comprimirImagen(fotoMedioFile);

  btn.textContent = 'Enviando...';
  await enviarASheetPOST(new URLSearchParams({
    path: 'inscripciones',
    tipo, nombre, fechaNacimiento: fechaNac, documento, edad: edadCalculada,
    email, wpp, ciudad, horario: obtenerHorarioElegido(), horarioTipo, horaSugerida: obtenerHoraSugerida(),
    experiencia: experienciaSeleccionada,
    mayor: esMayorDeEdad ? 'si' : 'no',
    acudNombre, acudCC, acudTel,
    fotoCompleta: fotoCompletaB64,
    fotoMedio: fotoMedioB64
  }));

  document.getElementById('modalFormWrap').style.display = 'none';
  document.getElementById('modalSuccess').style.display  = 'block';
  btn.disabled = false;
  btn.textContent = 'Enviar solicitud';
}

// SUBMIT MARCAS → API
async function submitMarcasForm(e) {
  e.preventDefault();
  const empresa = document.getElementById('marcasEmpresa').value.trim();
  const contacto = document.getElementById('marcasContacto').value.trim();
  const contactoInfo = document.getElementById('marcasInfo').value.trim();
  const tipoCampana = document.getElementById('marcasTipo').value;
  const mensaje = document.getElementById('marcasMensaje').value.trim();

  if (!empresa || !contacto || !contactoInfo || !tipoCampana) return;

  await enviarASheet(new URLSearchParams({ path: 'solicitudes-marcas', empresa, contacto, contactoInfo, tipoCampana, mensaje }));
  document.getElementById('marcasFormWrap').style.display = 'none';
  document.getElementById('marcasSuccess').style.display  = 'block';
}

// SUBMIT CURSO GRUPO → API
async function submitCursoGrupo(e) {
  e.preventDefault();
  const nombre   = document.getElementById('cgNombre').value.trim();
  const wpp      = document.getElementById('cgWpp').value.trim();
  const tipo     = document.getElementById('cgTipo').value;
  const personas = parseInt(document.getElementById('cgPersonas').value, 10);

  if (!nombre || !wpp || !tipo || !personas) return;

  await enviarASheet(new URLSearchParams({ path: 'solicitudes-grupo', nombre, wpp, tipo, personas }));
  document.getElementById('cursoGrupoForm').style.display    = 'none';
  document.getElementById('cursoGrupoSuccess').style.display = 'block';
}
