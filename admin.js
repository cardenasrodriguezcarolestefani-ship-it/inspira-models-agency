const PASSWORD = 'inspira2026';
const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

// LIGHTBOX FOTOS
function abrirFoto(url) {
  document.getElementById('fotoLightboxImg').src = url;
  document.getElementById('fotoLightbox').classList.add('open');
}
function cerrarFoto() {
  document.getElementById('fotoLightbox').classList.remove('open');
}

// LOGIN
function doLogin() {
  const val = document.getElementById('loginPass').value;
  if (val === PASSWORD) {
    sessionStorage.setItem('admin_auth', '1');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadData();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('admin_auth');
  location.reload();
}

// TABS
function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

// DATE FORMAT
function fmt(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function esc(v) {
  return String(v || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// LOAD DATA FROM GOOGLE SHEETS
async function loadData() {
  try {
    const res = await fetch(`${API_BASE}?path=get-data`);
    const data = await res.json();

    renderInscripciones(data.inscripciones || []);
    renderMarcas(data.marcas || []);
    renderGrupo(data.grupo || []);
    renderProfesores(data.profesores || []);
    renderModelos(data.modelos || []);
    renderAgendaAcademica(data.modelos || []);
    renderPagosMensualidad(data.pagosMensualidad || []);
    renderResenasAdmin(data.resenas || []);
    renderHistoriasAdmin(data.historias || []);
    renderNoticiasAdmin(data.noticias || []);
    renderProductosAdmin(data.productos || []);
    renderEmpresasReg(data.empresas || []);
    renderCotizacionesAdmin(data.cotizaciones || [], data.profesores || []);
    renderConvocatoriasAdmin(data.convocatoriaRespuestas || []);
    renderEmprendimientosAdmin(data.emprendimientos || []);

    const contratoEl = document.getElementById('contratoTextoEdit');
    if (contratoEl && document.activeElement !== contratoEl) contratoEl.value = data.contrato || '';

    document.getElementById('statInsc').textContent = (data.inscripciones || []).length;
    document.getElementById('statMarcas').textContent = (data.marcas || []).length;
    document.getElementById('statGrupo').textContent = (data.grupo || []).length;
    document.getElementById('statProf').textContent = (data.profesores || []).length;
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

function renderInscripciones(rows) {
  const tbody = document.getElementById('tbodyInsc');
  document.getElementById('badgeInsc').textContent = rows.length + ' registros';
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="13" class="empty-msg">No hay inscripciones aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => {
    const estado = (r.estado || 'pendiente').toLowerCase();
    const badge  = `<span class="badge-${estado}">${estado}</span>`;
    const esMenor = r.mayor_edad === 'no';
    const fotos  = [r.foto_completa, r.foto_medio].filter(Boolean).map((url, i) =>
      `<img src="${url}" class="photo-thumb" title="${i===0?'Cuerpo entero':'Medio cuerpo'}" onclick="abrirFoto('${url}')" onerror="this.style.display='none'">`
    ).join('') || '—';
    const acudiente = esMenor
      ? `${esc(r.acud_nombre)}<br><span style="opacity:0.6">CC ${esc(r.acud_cc)} · ${esc(r.acud_tel)}</span>`
      : '—';
    const acciones = estado === 'pendiente'
      ? `<button class="btn-aceptar" data-row="${r._rowNum}" data-nombre="${esc(r.nombre)}" onclick="aceptarInscripcion(this)">Aceptar</button><button class="btn-rechazar" data-row="${r._rowNum}" data-nombre="${esc(r.nombre)}" onclick="rechazarInscripcion(this)">Rechazar</button>`
      : '—';
    return `<tr>
      <td>${esc(r.nombre)}</td>
      <td>${esc(r.documento)}</td>
      <td>${esc(r.edad)}</td>
      <td>${esc(r.email)}</td>
      <td>${esc(r.wpp)}</td>
      <td>${esc(r.horario)}</td>
      <td>${esc(r.experiencia)}</td>
      <td>${esMenor ? 'Menor' : 'Mayor'}</td>
      <td>${acudiente}</td>
      <td style="white-space:nowrap">${fotos}</td>
      <td>${badge}</td>
      <td style="white-space:nowrap">${acciones}</td>
      <td>${fmt(r.created_at)}</td>
    </tr>`;
  }).join('');
}

async function aceptarInscripcion(btn) {
  const rowNum = btn.dataset.row;
  const nombre = btn.dataset.nombre;
  if (!confirm(`¿Confirmar admisión de ${nombre}?`)) return;
  btn.disabled = true; btn.textContent = '...';
  await enviarASheet(new URLSearchParams({ path: 'aceptar', rowNum }));
  await new Promise(r => setTimeout(r, 1500));
  loadData();
}

async function rechazarInscripcion(btn) {
  const rowNum = btn.dataset.row;
  const nombre = btn.dataset.nombre;
  if (!confirm(`¿Rechazar solicitud de ${nombre}?`)) return;
  btn.disabled = true; btn.textContent = '...';
  await enviarASheet(new URLSearchParams({ path: 'rechazar', rowNum }));
  await new Promise(r => setTimeout(r, 1500));
  loadData();
}

function renderMarcas(rows) {
  const tbody = document.getElementById('tbodyMarcas');
  document.getElementById('badgeMarcas').textContent = rows.length + ' registros';
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay solicitudes aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${esc(r.empresa)}</td><td>${esc(r.contacto)}</td><td>${esc(r.contactoInfo)}</td>
    <td>${esc(r.tipoCampana)}</td><td>${esc(r.mensaje)}</td><td>${fmt(r.created_at)}</td>
  </tr>`).join('');
}

function renderGrupo(rows) {
  const tbody = document.getElementById('tbodyGrupo');
  document.getElementById('badgeGrupo').textContent = rows.length + ' registros';
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">No hay solicitudes aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => `<tr>
    <td>${esc(r.nombre)}</td><td>${esc(r.wpp)}</td><td>${esc(r.tipo)}</td>
    <td>${esc(r.personas)}</td><td>${fmt(r.created_at)}</td>
  </tr>`).join('');
}

function renderProfesores(rows) {
  const grid = document.getElementById('profGrid');
  document.getElementById('badgeProf').textContent = rows.length;
  document.getElementById('statProf').textContent = rows.length;
  if (!rows.length) { grid.innerHTML = `<div class="empty-msg">No hay profesores registrados aún.</div>`; return; }
  grid.innerHTML = rows.map(r => `
    <div class="prof-card">
      <div>
        <div class="prof-name">${esc(r.nombre)}</div>
        <div class="prof-esp">${esc(r.especialidad)}</div>
        <div class="prof-bio">${esc(r.materias)}</div>
        ${r.bio ? `<div class="prof-bio" style="margin-top:6px">${esc(r.bio)}</div>` : ''}
      </div>
      <span class="prof-badge">${esc(r.estado || 'Activo')}</span>
    </div>
  `).join('');
}

// CREAR PROFESOR
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

function enviarASheetPOST(params) {
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

async function crearProfesor() {
  const nombre = document.getElementById('pfNombre').value.trim();
  const documento = document.getElementById('pfDocumento').value.trim();
  const especialidad = document.getElementById('pfEsp').value.trim();
  const materias = document.getElementById('pfMaterias').value.trim();
  const email = document.getElementById('pfEmail').value.trim();
  const telefono = document.getElementById('pfTelefono').value.trim();
  const bio = document.getElementById('pfBio').value.trim();

  if (!nombre || !especialidad) {
    const err = document.getElementById('profErr');
    err.textContent = '✗ Nombre y especialidad son obligatorios';
    err.style.display = 'block';
    setTimeout(() => err.style.display = 'none', 3000);
    return;
  }

  await enviarASheet(new URLSearchParams({ path: 'create-profesor', nombre, documento, especialidad, materias, email, telefono, bio }));

  document.getElementById('pfNombre').value = '';
  document.getElementById('pfDocumento').value = '';
  document.getElementById('pfEsp').value = '';
  document.getElementById('pfMaterias').value = '';
  document.getElementById('pfEmail').value = '';
  document.getElementById('pfTelefono').value = '';
  document.getElementById('pfBio').value = '';

  const ok = document.getElementById('profOk');
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; loadData(); }, 2500);
}

// MODELOS (admitidas)
function renderModelos(rows) {
  const tbody = document.getElementById('tbodyModelos');
  document.getElementById('badgeModelos').textContent = rows.length;

  const select = document.getElementById('sgModelo');
  const seleccionPrevia = select.value;
  select.innerHTML = '<option value="">Selecciona una modelo</option>' +
    rows.map(r => `<option value="${esc(r.usuario)}">${esc(r.nombre)} (${esc(r.usuario)})</option>`).join('');
  select.value = seleccionPrevia;

  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="9" class="empty-msg">No hay modelos admitidas aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => {
    const esMayor = r.mayor_edad !== 'no';
    const docsOk = esMayor
      ? !!(r.doc_cedula_url && r.doc_eps_url)
      : !!(r.doc_menor_url && r.doc_acudiente_cc_url && r.doc_eps_url);
    const docBadge = docsOk ? '<span class="badge-aceptado">completo</span>' : '<span class="badge-pendiente">pendiente</span>';
    const contratoBadge = r.contrato_aceptado === 'si' ? '<span class="badge-aceptado">aceptado</span>' : '<span class="badge-pendiente">pendiente</span>';
    const pagoBadge = r.estado_pago === 'pagado' ? '<span class="badge-aceptado">pagado</span>' : '<span class="badge-pendiente">pendiente</span>';

    const horEstado = r.horario_estado || 'pendiente';
    const horBadgeClass = horEstado === 'confirmado' ? 'badge-aceptado' : horEstado === 'reservado' || horEstado === 'propuesto' ? 'badge-pendiente' : 'badge-pendiente';
    const horBadge = `<span class="${horBadgeClass}">${esc(horEstado)}</span>`;
    const mensualidadBadge = r.mensualidad_inicial_pagada === 'si' ? '<span class="badge-aceptado">pagada</span>' : '<span class="badge-pendiente">pendiente</span>';

    const procesoBadge = r.estado_proceso === 'activo' ? '<span class="badge-aceptado">activo</span>' : '<span class="badge-pendiente">filtro 2</span>';

    return `<tr>
      <td>${esc(r.nombre)}</td>
      <td>${esc(r.usuario)}</td>
      <td>${esc(r.horario)}</td>
      <td>${docBadge}</td>
      <td>${contratoBadge}</td>
      <td>${pagoBadge}</td>
      <td>${horBadge}</td>
      <td>${mensualidadBadge}</td>
      <td>${procesoBadge}</td>
    </tr>`;
  }).join('');
}

// AGENDA ACADÉMICA
function renderAgendaAcademica(rows) {
  const confirmados = rows.filter(r => r.horario_estado === 'reservado' || r.horario_estado === 'confirmado');
  const pendientes  = rows.filter(r => r.horario_estado === 'pendiente' || r.horario_estado === 'propuesto');

  const confWrap = document.getElementById('agendaConfirmados');
  confWrap.innerHTML = confirmados.length
    ? confirmados.map(r => `
        <div class="prof-card">
          <div><div class="prof-name">${esc(r.nombre)}</div><div class="prof-esp">${esc(r.horario)}</div></div>
          <span class="${r.horario_estado === 'confirmado' ? 'badge-aceptado' : 'badge-pendiente'}">${esc(r.horario_estado)}</span>
        </div>`).join('')
    : '<div class="empty-msg">No hay horarios reservados aún.</div>';

  document.getElementById('badgeAgendaPendientes').textContent = pendientes.length;
  const pendWrap = document.getElementById('agendaPendientes');
  pendWrap.innerHTML = pendientes.length
    ? pendientes.map(r => {
        if (r.horario_estado === 'propuesto') {
          let opciones = [];
          try { opciones = JSON.parse(r.horario_opciones || '[]'); } catch (e) {}
          return `<div class="prof-card">
            <div><div class="prof-name">${esc(r.nombre)}</div><div class="prof-esp">Solicitó: ${esc(r.horario)} ${r.hora_sugerida ? '· hora sugerida ' + esc(r.hora_sugerida) : ''}</div>
            <div class="prof-bio">Opciones propuestas: ${opciones.map(esc).join(' · ') || '—'}</div></div>
            <span class="badge-pendiente">esperando elección</span>
          </div>`;
        }
        return `<div class="prof-card">
          <div><div class="prof-name">${esc(r.nombre)}</div><div class="prof-esp">Solicitó: ${esc(r.horario)} ${r.hora_sugerida ? '· hora sugerida ' + esc(r.hora_sugerida) : ''}</div></div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <button class="btn-aceptar" data-usuario="${esc(r.usuario)}" onclick="aceptarHorarioDirecto(this)">Aceptar este horario</button>
            <button class="btn-mini" data-usuario="${esc(r.usuario)}" data-dia="${esc(r.horario)}" onclick="abrirProponerOpciones(this)">Proponer 3 opciones</button>
            <div id="opcionesForm_${esc(r.usuario)}" style="display:none;margin-top:6px;text-align:right">
              <div style="font-size:0.6rem;color:var(--muted);margin-bottom:4px">Cada opción dura 5 horas exactas — solo indica la hora de inicio</div>
              <input type="time" id="op1_${esc(r.usuario)}" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:5px;margin-bottom:4px;width:180px">
              <input type="time" id="op2_${esc(r.usuario)}" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:5px;margin-bottom:4px;width:180px">
              <input type="time" id="op3_${esc(r.usuario)}" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:5px;margin-bottom:4px;width:180px">
              <button class="btn-mini" data-usuario="${esc(r.usuario)}" onclick="enviarOpcionesHorario(this)">Enviar opciones</button>
            </div>
          </div>
        </div>`;
      }).join('')
    : '<div class="empty-msg">No hay solicitudes pendientes.</div>';
}

async function aceptarHorarioDirecto(btn) {
  const usuario = btn.dataset.usuario;
  if (!confirm('¿Aceptar el horario que solicitó?')) return;
  await enviarASheet(new URLSearchParams({ path: 'aceptar-horario-directo', usuario }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

function abrirProponerOpciones(btn) {
  const usuario = btn.dataset.usuario;
  const form = document.getElementById('opcionesForm_' + usuario);
  form.dataset.dia = btn.dataset.dia;
  form.style.display = 'block';
}

function calcularRangoClase(horaInicio24) {
  if (!horaInicio24) return '';
  const [h, m] = horaInicio24.split(':').map(Number);
  const inicio = new Date(2000, 0, 1, h, m);
  const fin = new Date(inicio.getTime() + 5 * 60 * 60 * 1000);
  const fmt = d => d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(inicio)} - ${fmt(fin)}`;
}

async function enviarOpcionesHorario(btn) {
  const usuario = btn.dataset.usuario;
  const dia = document.getElementById('opcionesForm_' + usuario).dataset.dia || '';
  const h1 = document.getElementById('op1_' + usuario).value;
  const h2 = document.getElementById('op2_' + usuario).value;
  const h3 = document.getElementById('op3_' + usuario).value;

  const construir = h => h ? `${dia.split(' - ')[0]} ${calcularRangoClase(h)}` : '';
  const opcion1 = construir(h1);
  const opcion2 = construir(h2);
  const opcion3 = construir(h3);

  if (!opcion1 && !opcion2 && !opcion3) { alert('Ingresa al menos una hora de inicio.'); return; }

  await enviarASheet(new URLSearchParams({ path: 'proponer-opciones-horario', usuario, opcion1, opcion2, opcion3 }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// PAGOS MENSUALIDAD
function renderPagosMensualidad(rows) {
  const tbody = document.getElementById('tbodyPagosMensualidad');
  document.getElementById('badgePagosMensualidad').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">No hay pagos registrados aún.</td></tr>`; return; }
  tbody.innerHTML = rows.slice().reverse().map(p => {
    const comprobante = p.comprobante_url
      ? `<img src="${p.comprobante_url}" class="photo-thumb" onclick="abrirFoto('${p.comprobante_url}')" onerror="this.style.display='none'">`
      : '—';
    return `<tr>
      <td>${esc(p.nombre)}</td><td>${esc(p.mes)}</td><td>$${esc(p.valor)}</td>
      <td>${comprobante}</td><td>${fmt(p.fecha_pago)}</td>
    </tr>`;
  }).join('');
}

async function guardarContrato() {
  const texto = document.getElementById('contratoTextoEdit').value.trim();
  if (!texto) return;
  await enviarASheetPOST(new URLSearchParams({ path: 'actualizar-contrato', texto }));
  const ok = document.getElementById('contratoOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

async function agregarSeguimiento() {
  const usuario      = document.getElementById('sgModelo').value;
  const materia       = document.getElementById('sgMateria').value;
  const calificacion  = document.getElementById('sgCalificacion').value;
  const comentario    = document.getElementById('sgComentario').value.trim();
  const err = document.getElementById('sgErr');
  const ok  = document.getElementById('sgOk');

  if (!usuario || !comentario) {
    err.style.display = 'block';
    setTimeout(() => err.style.display = 'none', 3000);
    return;
  }

  await enviarASheet(new URLSearchParams({ path: 'add-seguimiento', usuario, materia, calificacion, comentario, autor: 'Directora' }));

  document.getElementById('sgCalificacion').value = '';
  document.getElementById('sgComentario').value = '';

  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; loadData(); }, 2000);
}

// COMPRESIÓN DE IMAGEN (para noticias / productos)
function comprimirImagenAdmin(file) {
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

// RESEÑAS (moderar)
function renderResenasAdmin(rows) {
  const tbody = document.getElementById('tbodyResenas');
  document.getElementById('badgeResenas').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay reseñas aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => {
    const estado = r.estado || 'pendiente';
    const badgeClass = estado === 'aprobada' ? 'badge-aceptado' : estado === 'rechazada' ? 'badge-rechazado' : 'badge-pendiente';
    const acciones = estado === 'pendiente'
      ? `<button class="btn-aceptar" data-row="${r._rowNum}" onclick="moderarResena(this,'aprobada')">Aprobar</button><button class="btn-rechazar" data-row="${r._rowNum}" onclick="moderarResena(this,'rechazada')">Rechazar</button>`
      : '—';
    return `<tr>
      <td>${esc(r.nombre)}</td><td>${esc(r.tipo_usuario)}</td><td>${'★'.repeat(parseInt(r.calificacion)||0)}</td>
      <td>${esc(r.comentario)}</td><td><span class="${badgeClass}">${esc(estado)}</span></td>
      <td style="white-space:nowrap">${acciones}</td>
    </tr>`;
  }).join('');
}

async function moderarResena(btn, accion) {
  const rowNum = btn.dataset.row;
  await enviarASheet(new URLSearchParams({ path: 'moderar-resena', rowNum, accion }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// HISTORIAS (moderar)
function renderHistoriasAdmin(rows) {
  const tbody = document.getElementById('tbodyHistorias');
  document.getElementById('badgeHistorias').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay historias aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(h => {
    const estado = h.estado || 'pendiente';
    const badgeClass = estado === 'aprobada' ? 'badge-aceptado' : estado === 'rechazada' ? 'badge-rechazado' : 'badge-pendiente';
    const foto = h.foto_url ? `<img src="${h.foto_url}" class="photo-thumb" onclick="abrirFoto('${h.foto_url}')" onerror="this.style.display='none'">` : '—';
    const video = h.video_url ? `<a href="${h.video_url}" target="_blank">Ver</a>` : '—';
    const acciones = estado === 'pendiente'
      ? `<button class="btn-aceptar" data-row="${h._rowNum}" onclick="moderarHistoria(this,'aprobada')">Aprobar</button><button class="btn-rechazar" data-row="${h._rowNum}" onclick="moderarHistoria(this,'rechazada')">Rechazar</button>`
      : '—';
    return `<tr>
      <td>${esc(h.nombre)}</td><td>${esc(h.texto)}</td><td>${foto}</td><td>${video}</td>
      <td><span class="${badgeClass}">${esc(estado)}</span></td>
      <td style="white-space:nowrap">${acciones}</td>
    </tr>`;
  }).join('');
}

async function moderarHistoria(btn, accion) {
  const rowNum = btn.dataset.row;
  await enviarASheet(new URLSearchParams({ path: 'moderar-historia', rowNum, accion }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// NOTICIERO
function renderNoticiasAdmin(rows) {
  const grid = document.getElementById('noticiasGrid');
  document.getElementById('badgeNoticias').textContent = rows.length;
  if (!rows.length) { grid.innerHTML = `<div class="empty-msg">No hay noticias publicadas aún.</div>`; return; }
  grid.innerHTML = rows.slice().reverse().map(n => `
    <div class="prof-card">
      <div>
        <div class="prof-name">${esc(n.titulo)}</div>
        <div class="prof-bio">${esc(n.resumen)}</div>
        <div class="prof-esp" style="margin-top:6px">${fmt(n.created_at)}</div>
      </div>
      ${n.imagen_url ? `<img src="${n.imagen_url}" class="photo-thumb" onclick="abrirFoto('${n.imagen_url}')" onerror="this.style.display='none'">` : ''}
    </div>
  `).join('');
}

async function crearNoticia() {
  const titulo = document.getElementById('ntTitulo').value.trim();
  const resumen = document.getElementById('ntResumen').value.trim();
  const link = document.getElementById('ntLink').value.trim();
  const file = document.getElementById('ntImagenInput').files[0];

  if (!titulo) { alert('Escribe un título.'); return; }

  let imagen = '';
  if (file) imagen = await comprimirImagenAdmin(file);

  await enviarASheetPOST(new URLSearchParams({ path: 'crear-noticia', titulo, resumen, link, imagen }));

  document.getElementById('ntTitulo').value = '';
  document.getElementById('ntResumen').value = '';
  document.getElementById('ntLink').value = '';
  document.getElementById('ntImagenInput').value = '';

  const ok = document.getElementById('ntOk');
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; loadData(); }, 2000);
}

// TIENDA
function renderProductosAdmin(rows) {
  const grid = document.getElementById('productosGrid');
  document.getElementById('badgeProductos').textContent = rows.length;
  if (!rows.length) { grid.innerHTML = `<div class="empty-msg">No hay productos en la tienda aún.</div>`; return; }
  grid.innerHTML = rows.map(p => `
    <div class="prof-card">
      <div>
        <div class="prof-name">${esc(p.nombre)} — $${esc(p.precio)}</div>
        <div class="prof-esp">${esc(p.categoria)}</div>
        <div class="prof-bio" style="margin-top:6px">${esc(p.descripcion)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        ${p.imagen_url ? `<img src="${p.imagen_url}" class="photo-thumb" onclick="abrirFoto('${p.imagen_url}')" onerror="this.style.display='none'">` : ''}
        <button class="btn-rechazar" data-row="${p._rowNum}" onclick="toggleProducto(this)">${p.disponible === 'si' ? 'Ocultar' : 'Mostrar'}</button>
      </div>
    </div>
  `).join('');
}

async function crearProducto() {
  const nombre = document.getElementById('prNombre').value.trim();
  const descripcion = document.getElementById('prDescripcion').value.trim();
  const precio = document.getElementById('prPrecio').value;
  const categoria = document.getElementById('prCategoria').value.trim();
  const file = document.getElementById('prImagenInput').files[0];

  if (!nombre || !precio) { alert('Nombre y precio son obligatorios.'); return; }

  let imagen = '';
  if (file) imagen = await comprimirImagenAdmin(file);

  await enviarASheetPOST(new URLSearchParams({ path: 'crear-producto', nombre, descripcion, precio, categoria, imagen }));

  document.getElementById('prNombre').value = '';
  document.getElementById('prDescripcion').value = '';
  document.getElementById('prPrecio').value = '';
  document.getElementById('prCategoria').value = '';
  document.getElementById('prImagenInput').value = '';

  const ok = document.getElementById('prOk');
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; loadData(); }, 2000);
}

async function toggleProducto(btn) {
  const rowNum = btn.dataset.row;
  await enviarASheet(new URLSearchParams({ path: 'toggle-producto', rowNum }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// EMPRESAS REGISTRADAS
function renderEmpresasReg(rows) {
  const tbody = document.getElementById('tbodyEmpresasReg');
  document.getElementById('badgeEmpresasReg').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="7" class="empty-msg">No hay registros aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(r => {
    const estado = r.estado || 'pendiente';
    const badgeClass = estado === 'aceptado' ? 'badge-aceptado' : estado === 'rechazado' ? 'badge-rechazado' : 'badge-pendiente';
    const acciones = estado === 'pendiente'
      ? `<button class="btn-aceptar" data-row="${r._rowNum}" onclick="aceptarEmpresaReg(this)">Aceptar</button><button class="btn-rechazar" data-row="${r._rowNum}" onclick="rechazarEmpresaReg(this)">Rechazar</button>`
      : '—';
    return `<tr>
      <td>${esc(r.razon_social)}</td><td>${esc(r.nombre_representante)}</td><td>${esc(r.email)}</td>
      <td>${esc(r.whatsapp)}</td><td>${esc(r.servicios_requeridos)}</td>
      <td><span class="${badgeClass}">${esc(estado)}</span></td>
      <td style="white-space:nowrap">${acciones}</td>
    </tr>`;
  }).join('');
}

async function aceptarEmpresaReg(btn) {
  const rowNum = btn.dataset.row;
  if (!confirm('¿Aprobar este registro de empresa? Se le enviará usuario y contraseña por correo.')) return;
  await enviarASheet(new URLSearchParams({ path: 'aceptar-empresa', rowNum }));
  await new Promise(r => setTimeout(r, 1500));
  loadData();
}

async function rechazarEmpresaReg(btn) {
  const rowNum = btn.dataset.row;
  if (!confirm('¿Rechazar este registro?')) return;
  await enviarASheet(new URLSearchParams({ path: 'rechazar-empresa', rowNum }));
  await new Promise(r => setTimeout(r, 1500));
  loadData();
}

// COTIZACIONES
function renderCotizacionesAdmin(rows, profesores) {
  const tbody = document.getElementById('tbodyCotizaciones');
  document.getElementById('badgeCotizaciones').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-msg">No hay cotizaciones aún.</td></tr>`; return; }

  const opcionesProf = '<option value="">Profesor...</option>' + profesores.map(p => `<option value="${esc(p.nombre)}">${esc(p.nombre)}</option>`).join('');

  tbody.innerHTML = rows.slice().reverse().map(c => {
    const estado = c.estado || 'pendiente';
    const badgeClass = (estado === 'agendado' || estado === 'confirmado') ? 'badge-aceptado' : estado === 'rechazado' ? 'badge-rechazado' : 'badge-pendiente';
    const cotizarCell = estado === 'pendiente'
      ? `<input type="number" placeholder="Valor" id="val_${c.radicado}" style="width:80px;background:#1a1a1a;border:1px solid #333;color:#fff;padding:4px" >
         <button class="btn-mini" onclick="cotizarSolicitud('${c.radicado}')">Enviar</button>`
      : (c.valor_cotizado ? `$${esc(c.valor_cotizado)}` : '—');
    const asignarCell = (estado === 'confirmado')
      ? `<select id="prof_${c.radicado}" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:4px">${opcionesProf}</select>
         <button class="btn-mini" onclick="asignarProfesorCotiz('${c.radicado}')">Asignar</button>`
      : (c.profesor_asignado || '—');
    return `<tr>
      <td>${esc(c.radicado)}</td><td>${esc(c.nombre)}</td><td>${esc(c.curso)}</td><td>${esc(c.num_personas)}</td>
      <td><span class="${badgeClass}">${esc(estado)}</span></td>
      <td style="white-space:nowrap">${cotizarCell}</td>
      <td style="white-space:nowrap">${asignarCell}</td>
      <td>${fmt(c.created_at)}</td>
    </tr>`;
  }).join('');
}

async function cotizarSolicitud(radicado) {
  const valor = document.getElementById('val_' + radicado).value;
  if (!valor) { alert('Ingresa un valor.'); return; }
  await enviarASheet(new URLSearchParams({ path: 'cotizar', radicado, valor, comentario: '' }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

async function asignarProfesorCotiz(radicado) {
  const profesor = document.getElementById('prof_' + radicado).value;
  if (!profesor) { alert('Selecciona un profesor.'); return; }
  await enviarASheet(new URLSearchParams({ path: 'asignar-profesor-cotizacion', radicado, profesor }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// AGENDA LABORAL
async function crearConvocatoria() {
  const marca = document.getElementById('cvMarca').value.trim();
  const cliente = document.getElementById('cvCliente').value.trim();
  const fecha = document.getElementById('cvFecha').value;
  const lugar = document.getElementById('cvLugar').value.trim();
  const hora = document.getElementById('cvHora').value.trim();
  const pago = document.getElementById('cvPago').value.trim();
  const requisitos = document.getElementById('cvRequisitos').value.trim();
  if (!marca || !fecha) { alert('Marca y fecha son obligatorios.'); return; }

  await enviarASheet(new URLSearchParams({ path: 'crear-convocatoria', marca, cliente, fecha, lugar, hora, pago, requisitos }));

  document.getElementById('cvMarca').value = '';
  document.getElementById('cvCliente').value = '';
  document.getElementById('cvFecha').value = '';
  document.getElementById('cvLugar').value = '';
  document.getElementById('cvHora').value = '';
  document.getElementById('cvPago').value = '';
  document.getElementById('cvRequisitos').value = '';

  const ok = document.getElementById('cvOk');
  ok.style.display = 'block';
  setTimeout(() => { ok.style.display = 'none'; loadData(); }, 2000);
}

function renderConvocatoriasAdmin(rows) {
  const wrap = document.getElementById('convocatoriasList');
  document.getElementById('badgeConvocatorias').textContent = rows.length;
  if (!rows.length) { wrap.innerHTML = '<div class="empty-msg">No hay convocatorias enviadas aún.</div>'; return; }
  wrap.innerHTML = rows.slice().reverse().map(r => {
    const badgeClass = r.estado === 'confirmada' || r.estado === 'finalizada' ? 'badge-aceptado' : r.estado === 'rechazada' || r.estado === 'cancelada' ? 'badge-rechazado' : 'badge-pendiente';
    const acciones = r.estado === 'confirmada'
      ? `<button class="btn-mini" onclick="marcarConvocatoria(${r._rowNum},'finalizada')">Finalizar</button> <button class="btn-mini" onclick="marcarConvocatoria(${r._rowNum},'cancelada')">Cancelar</button>`
      : '';
    return `<div class="prof-card">
      <div><div class="prof-name">${esc(r.nombre_modelo)}</div><div class="prof-esp">${esc(r.marca)} · ${fmt(r.fecha_trabajo)}</div></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="badge-${r.estado === 'confirmada' || r.estado === 'finalizada' ? 'aceptado' : r.estado === 'rechazada' || r.estado === 'cancelada' ? 'rechazado' : 'pendiente'}">${esc(r.estado)}</span>${acciones}</div>
    </div>`;
  }).join('');
}

async function marcarConvocatoria(respuestaRowNum, estado) {
  await enviarASheet(new URLSearchParams({ path: 'actualizar-estado-convocatoria', respuestaRowNum, estado }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// EMPRENDIMIENTOS
function renderEmprendimientosAdmin(rows) {
  const tbody = document.getElementById('tbodyEmprendimientos');
  document.getElementById('badgeEmprendimientos').textContent = rows.length;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">No hay emprendimientos aún.</td></tr>`; return; }
  tbody.innerHTML = rows.map(e => {
    const estado = e.estado || 'pendiente';
    const badgeClass = estado === 'aprobado' ? 'badge-aceptado' : estado === 'rechazado' ? 'badge-rechazado' : 'badge-pendiente';
    const acciones = (estado === 'pendiente' && e.tipo === 'externo')
      ? `<button class="btn-aceptar" data-row="${e._rowNum}" onclick="aceptarEmprendimientoAdmin(this)">Aceptar</button><button class="btn-rechazar" data-row="${e._rowNum}" onclick="rechazarEmprendimientoAdmin(this)">Rechazar</button>`
      : '—';
    return `<tr>
      <td>${esc(e.nombre_negocio)}</td><td>${esc(e.tipo)}</td><td>${esc(e.categoria)}</td><td>${esc(e.contacto)}</td>
      <td><span class="${badgeClass}">${esc(estado)}</span></td>
      <td style="white-space:nowrap">${acciones}</td>
    </tr>`;
  }).join('');
}

async function aceptarEmprendimientoAdmin(btn) {
  const rowNum = btn.dataset.row;
  if (!confirm('¿Aprobar este emprendimiento? Se le enviará usuario y contraseña por correo.')) return;
  await enviarASheet(new URLSearchParams({ path: 'aceptar-emprendimiento', rowNum }));
  await new Promise(r => setTimeout(r, 1500));
  loadData();
}

async function rechazarEmprendimientoAdmin(btn) {
  const rowNum = btn.dataset.row;
  await enviarASheet(new URLSearchParams({ path: 'rechazar-emprendimiento', rowNum }));
  await new Promise(r => setTimeout(r, 1200));
  loadData();
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('admin_auth') === '1') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadData();
  }
});
