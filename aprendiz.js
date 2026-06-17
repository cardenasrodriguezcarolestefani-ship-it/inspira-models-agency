const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

let sesion = { usuario: '', password: '' };

function esc(v) { return String(v || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmt(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtFecha(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    const res = await fetch(`${API_BASE}?path=login-aprendiz&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    btn.disabled = false; btn.textContent = 'Ingresar';

    if (!data.success) {
      errBox.textContent = 'Usuario o contraseña incorrectos';
      errBox.style.display = 'block';
      return;
    }
    sesion = { usuario, password };
    sessionStorage.setItem('aprendiz_usuario', usuario);
    sessionStorage.setItem('aprendiz_pass', password);
    mostrarPerfil(data);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Ingresar';
    errBox.textContent = 'Error de conexión. Intenta de nuevo.';
    errBox.style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('aprendiz_usuario');
  sessionStorage.removeItem('aprendiz_pass');
  location.reload();
}

// MOSTRAR PANTALLA SEGÚN ESTADO
function mostrarPerfil(data) {
  document.getElementById('loginScreen').style.display = 'none';
  const modelo = data.modelo;
  const progreso = data.progreso;

  const horarioReservado = modelo.horario_estado === 'reservado' || modelo.horario_estado === 'confirmado';
  const faltaSoloMensualidad = progreso.documentos && progreso.contrato && progreso.pago && horarioReservado && !progreso.activo;

  document.getElementById('filtro2Screen').style.display = 'none';
  document.getElementById('mensualidadScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';

  if (progreso.activo) {
    document.getElementById('dashboard').style.display = 'block';
    renderDashboard(data);
  } else if (faltaSoloMensualidad) {
    document.getElementById('mensualidadScreen').style.display = 'block';
    renderMensualidadScreen(modelo);
  } else {
    document.getElementById('filtro2Screen').style.display = 'block';
    renderFiltro2(data);
  }
}

function renderMensualidadScreen(modelo) {
  document.getElementById('msNombre').textContent = modelo.nombre;
  document.getElementById('msHorario').textContent = modelo.horario || '—';
  const limite = new Date(modelo.fecha_limite_mensualidad);
  const hoy = new Date();
  const dias = Math.max(0, Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24)));
  document.getElementById('msDias').textContent = isNaN(dias) ? '—' : dias;
  document.getElementById('msFecha').textContent = fmtFecha(modelo.fecha_limite_mensualidad);
}

// ── FILTRO 2 / 3 ───────────────────────────────────────────────────────────
function renderFiltro2(data) {
  const modelo = data.modelo;
  const progreso = data.progreso;
  document.getElementById('f2Nombre').textContent = modelo.nombre;

  marcarPaso('pasoDocs', progreso.documentos);
  marcarPaso('pasoContrato', progreso.contrato);
  marcarPaso('pasoPago', progreso.pago);
  marcarPaso('pasoHorario', progreso.horario);

  renderDocumentos(modelo, progreso.documentos);
  renderContrato(data, progreso.contrato);
  renderPago(modelo, progreso.pago);
  renderHorario(modelo, progreso.horario);
}

function marcarPaso(id, done) {
  const el = document.getElementById(id);
  const icon = el.querySelector('.progreso-icon');
  el.classList.toggle('done', done);
  icon.textContent = done ? '✓' : '○';
  icon.classList.toggle('done', done);
  icon.classList.toggle('pending', !done);
}

function renderDocumentos(modelo, done) {
  document.getElementById('docsBadge').outerHTML = done
    ? '<span id="docsBadge" class="f2-badge-done">Completo</span>'
    : '<span id="docsBadge" class="f2-badge-pending">Pendiente</span>';

  const esMayor = modelo.mayor_edad !== 'no';
  const docs = esMayor
    ? [
        { tipo: 'cedula', label: 'Fotocopia de la cédula', url: modelo.doc_cedula_url },
        { tipo: 'eps',    label: 'Certificado EPS vigente', url: modelo.doc_eps_url }
      ]
    : [
        { tipo: 'doc_menor',    label: 'Documento del menor', url: modelo.doc_menor_url },
        { tipo: 'acudiente_cc', label: 'Cédula del acudiente', url: modelo.doc_acudiente_cc_url },
        { tipo: 'eps',          label: 'Certificado EPS vigente', url: modelo.doc_eps_url }
      ];

  const wrap = document.getElementById('docsRows');
  wrap.innerHTML = docs.map(d => `
    <div class="doc-row ${d.url ? 'uploaded' : ''}" onclick="document.getElementById('docInput_${d.tipo}').click()">
      <span class="doc-row-label">${d.label}</span>
      <span class="doc-row-status ${d.url ? 'ok' : ''}">${d.url ? '✓ Subido' : 'Toca para subir'}</span>
      <input type="file" id="docInput_${d.tipo}" accept="image/*" style="display:none">
    </div>
  `).join('');

  docs.forEach(d => {
    document.getElementById(`docInput_${d.tipo}`).addEventListener('change', (e) => subirDocumento(d.tipo, e.target));
  });
}

async function subirDocumento(tipo, input) {
  const file = input.files[0];
  if (!file) return;
  const b64 = await comprimirImagen(file);
  await enviarPOST(new URLSearchParams({
    path: 'subir-documento', tipo,
    usuario: sesion.usuario, password: sesion.password,
    archivo: b64
  }));
  await new Promise(r => setTimeout(r, 1500));
  await reconsultarPerfil();
}

function renderContrato(data, done) {
  document.getElementById('contratoTexto').textContent = data.contrato || '';
  const badge = document.getElementById('contratoBadge');
  const formWrap = document.getElementById('contratoFormWrap');
  const msg = document.getElementById('contratoAceptadoMsg');

  if (done) {
    badge.outerHTML = '<span id="contratoBadge" class="f2-badge-done">Aceptado</span>';
    formWrap.style.display = 'none';
    msg.style.display = 'block';
    msg.textContent = `✓ Aceptaste el contrato el ${fmtFecha(data.modelo.contrato_fecha)}`;
  } else {
    badge.outerHTML = '<span id="contratoBadge" class="f2-badge-pending">Pendiente</span>';
    formWrap.style.display = 'block';
    msg.style.display = 'none';
    document.getElementById('contratoCheck').checked = false;
    document.getElementById('contratoCheck').onchange = (e) => {
      document.getElementById('contratoBtn').disabled = !e.target.checked;
    };
  }
}

async function aceptarContrato() {
  const btn = document.getElementById('contratoBtn');
  btn.disabled = true; btn.textContent = 'Guardando...';
  await enviarPOST(new URLSearchParams({ path: 'aceptar-contrato', usuario: sesion.usuario, password: sesion.password }));
  await new Promise(r => setTimeout(r, 1200));
  await reconsultarPerfil();
}

function renderPago(modelo, done) {
  const badge = document.getElementById('pagoBadge');
  const uploadWrap = document.getElementById('pagoUploadWrap');
  const okMsg = document.getElementById('pagoOkMsg');

  if (done) {
    badge.outerHTML = '<span id="pagoBadge" class="f2-badge-done">Pagado</span>';
    uploadWrap.style.display = 'none';
    okMsg.style.display = 'block';
  } else {
    badge.outerHTML = '<span id="pagoBadge" class="f2-badge-pending">Pendiente</span>';
    uploadWrap.style.display = 'block';
    okMsg.style.display = 'none';
  }
}

function renderHorario(modelo, done) {
  const badge = document.getElementById('horarioBadge');
  const opcionesBox = document.getElementById('horarioOpcionesBox');
  document.getElementById('horarioElegido').textContent = modelo.horario || '—';

  const estado = modelo.horario_estado || 'pendiente';
  const descEl = document.getElementById('horarioDesc');
  opcionesBox.style.display = 'none';

  if (estado === 'confirmado') {
    badge.outerHTML = '<span id="horarioBadge" class="f2-badge-done">Confirmado</span>';
    descEl.textContent = 'Tu horario está confirmado.';
    return;
  }

  if (estado === 'propuesto') {
    badge.outerHTML = '<span id="horarioBadge" class="f2-badge-pending">Elige una opción</span>';
    descEl.textContent = 'La directora propuso estas opciones según disponibilidad de agenda:';
    let opciones = [];
    try { opciones = JSON.parse(modelo.horario_opciones || '[]'); } catch (e) {}
    opcionesBox.style.display = 'block';
    document.getElementById('horarioOpcionesLista').innerHTML = opciones.map(o =>
      `<button class="submit-btn" style="text-align:left" onclick="elegirHorarioOpcion('${esc(o)}')">${esc(o)}</button>`
    ).join('') || '<p class="empty-msg">Aún no hay opciones cargadas.</p>';
    return;
  }

  if (estado === 'reservado') {
    badge.outerHTML = '<span id="horarioBadge" class="f2-badge-pending">Reservado, falta confirmar</span>';
    descEl.textContent = 'Tu horario quedó apartado. Una vez completes documentos, contrato y pago de inscripción, podrás pagar tu primera mensualidad para confirmarlo.';
    return;
  }

  // pendiente
  badge.outerHTML = '<span id="horarioBadge" class="f2-badge-pending">Pendiente</span>';
  descEl.textContent = 'Tu solicitud de horario entre semana está siendo revisada por la directora.';
}

async function elegirHorarioOpcion(horarioElegido) {
  if (!confirm(`¿Confirmar este horario: ${horarioElegido}?`)) return;
  await enviarPOST(new URLSearchParams({ path: 'elegir-horario', usuario: sesion.usuario, password: sesion.password, horarioElegido }));
  await new Promise(r => setTimeout(r, 1200));
  await reconsultarPerfil();
}

async function pagarMensualidadInicial() {
  const file = document.getElementById('mensualidadInput').files[0];
  if (!file) { alert('Selecciona la foto del comprobante.'); return; }

  const btn = document.getElementById('mensualidadBtn');
  btn.disabled = true; btn.textContent = 'Subiendo...';

  const comprobante = await comprimirImagen(file);
  await enviarPOST(new URLSearchParams({
    path: 'pagar-mensualidad-inicial', usuario: sesion.usuario, password: sesion.password, comprobante
  }));

  btn.textContent = 'Verificando...';
  await new Promise(r => setTimeout(r, 1500));
  await reconsultarPerfil();
  btn.disabled = false; btn.textContent = 'Subir comprobante de mensualidad';
}

// MIS DOCUMENTOS (solo lectura una vez activa)
function renderMisDocumentos(modelo) {
  const wrap = document.getElementById('misDocumentosList');
  const esMayor = modelo.mayor_edad !== 'no';
  const docs = esMayor
    ? [
        { label: 'Fotocopia de la cédula', url: modelo.doc_cedula_url },
        { label: 'Certificado EPS vigente', url: modelo.doc_eps_url }
      ]
    : [
        { label: 'Documento del menor', url: modelo.doc_menor_url },
        { label: 'Cédula del acudiente', url: modelo.doc_acudiente_cc_url },
        { label: 'Certificado EPS vigente', url: modelo.doc_eps_url }
      ];

  wrap.innerHTML = docs.map(d => `
    <div class="doc-row uploaded" style="cursor:default">
      <span class="doc-row-label">${esc(d.label)}</span>
      ${d.url ? `<a href="${d.url}" target="_blank" class="doc-row-status ok">✓ Ver documento</a>` : '<span class="doc-row-status">No subido</span>'}
    </div>
  `).join('');
}

// PAGO DE MENSUALIDAD MES A MES
function renderRegistroPagos(pagos) {
  const wrap = document.getElementById('registroPagosList');
  wrap.innerHTML = pagos.length
    ? pagos.slice().reverse().map(p => `
        <div class="seg-card">
          <div class="seg-comentario"><strong>${esc(p.mes)}</strong> — $${esc(p.valor)}</div>
          <div class="seg-meta">${fmt(p.fecha_pago)} ${p.comprobante_url ? `· <a href="${p.comprobante_url}" target="_blank" style="color:var(--gold)">ver comprobante</a>` : ''}</div>
        </div>`).join('')
    : '<div class="empty-msg">Aún no has registrado pagos de mensualidad.</div>';
}

async function pagarMensualidadMes() {
  const mes = document.getElementById('mensMes').value.trim();
  const valor = document.getElementById('mensValor').value;
  const file = document.getElementById('mensComprobanteInput').files[0];
  if (!mes || !valor || !file) { alert('Completa el mes, el valor y sube el comprobante.'); return; }

  const btn = document.getElementById('mensBtn');
  btn.disabled = true; btn.textContent = 'Subiendo...';

  const comprobante = await comprimirImagen(file);
  await enviarPOST(new URLSearchParams({
    path: 'pagar-mensualidad-mes', usuario: sesion.usuario, password: sesion.password,
    mes, valor, comprobante
  }));

  document.getElementById('mensMes').value = '';
  document.getElementById('mensValor').value = '';
  document.getElementById('mensComprobanteInput').value = '';
  document.getElementById('mensComprobanteNombre').style.display = 'none';

  const ok = document.getElementById('mensOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);

  await new Promise(r => setTimeout(r, 1200));
  await reconsultarPerfil();
  btn.disabled = false; btn.textContent = 'Registrar pago';
}

// ÁREAS DE FORMACIÓN (casillas fijas)
const AREAS_FORMACION = ['Pasarela','Actuación','Expresión corporal','Oratoria','Fotopose','Imagen personal','Redes sociales','Styling','Glamour','Protocolo y etiqueta'];

function renderAreasFormacion(seguimiento) {
  const grid = document.getElementById('areaGrid');

  const tarjetas = AREAS_FORMACION.map(area => {
    const entradas = seguimiento.filter(s => s.materia === area);
    if (!entradas.length) {
      return `<div class="area-card">
        <div class="area-card-header"><span class="area-nombre">${esc(area)}</span><span class="area-nota sin-nota">—</span></div>
        <div class="area-sugerencias vacio">Sin calificación aún</div>
      </div>`;
    }

    const notas = entradas.map(s => parseFloat(s.calificacion)).filter(n => !isNaN(n) && n > 0);
    const promedio = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length) : null;
    const ultima = entradas.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
    const notaMostrada = promedio !== null ? promedio.toFixed(1) : '—';
    const color = promedio === null ? '' : promedio >= 4.0 ? 'style="color:#4caf50"' : promedio >= 3.0 ? '' : 'style="color:#e57373"';

    return `<div class="area-card tiene-nota">
      <div class="area-card-header"><span class="area-nombre">${esc(area)}</span><span class="area-nota" ${color}>${notaMostrada}</span></div>
      <div class="area-profesor">${esc(ultima.autor)} · ${notas.length} nota${notas.length !== 1 ? 's' : ''}</div>
      <div class="area-sugerencias">${esc(ultima.comentario)}</div>
      <div class="area-fecha">Último: ${fmt(ultima.fecha)}</div>
    </div>`;
  });

  grid.innerHTML = tarjetas.join('');

  // Promedio general
  const todasNotas = seguimiento.map(s => parseFloat(s.calificacion)).filter(n => !isNaN(n) && n > 0);
  const promedioGeneral = todasNotas.length ? (todasNotas.reduce((a, b) => a + b, 0) / todasNotas.length) : null;
  const el = document.getElementById('promedioGeneral');
  if (el) el.textContent = promedioGeneral !== null ? promedioGeneral.toFixed(2) : '—';
}

// TABS DEL DASHBOARD
function switchDashTab(name, btn) {
  document.querySelectorAll('#dashboard .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#dashboard .tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('dashpanel-' + name).classList.add('active');
}

// ── DASHBOARD (activo) ────────────────────────────────────────────────────
function renderDashboard(data) {
  const modelo = data.modelo;
  document.getElementById('dashNombre').textContent = modelo.nombre;
  document.getElementById('dashHorario').textContent = modelo.horario || 'Por confirmar';
  document.getElementById('dashEstadoPago').textContent = 'Activo ✓';

  const quiereAgencia = modelo.quiere_agencia === 'si';
  document.getElementById('agSi').classList.toggle('on', quiereAgencia);
  document.getElementById('agNo').classList.toggle('on', !quiereAgencia);
  document.getElementById('catalogoFormWrap').style.display = quiereAgencia ? 'block' : 'none';
  if (quiereAgencia) {
    document.getElementById('catNombreArtistico').value = modelo.nombre_artistico || '';
    document.getElementById('catEstatura').value = modelo.estatura || '';
    document.getElementById('catTallas').value = modelo.tallas || '';
    document.getElementById('catMedidas').value = modelo.medidas || '';
    document.getElementById('catCiudad').value = modelo.ciudad_catalogo || '';
    document.getElementById('catDisponibilidad').value = modelo.disponibilidad || '';
  }

  const convocatorias = data.convocatorias || [];
  const agWrap = document.getElementById('agendaList');
  agWrap.innerHTML = convocatorias.length
    ? convocatorias.slice().reverse().map(c => {
        const badgeClass = c.estado === 'confirmada' || c.estado === 'finalizada' ? 'badge-aceptado' : c.estado === 'rechazada' || c.estado === 'cancelada' ? 'badge-rechazado' : 'badge-pendiente';
        const acciones = c.estado === 'pendiente'
          ? `<button class="submit-btn" style="padding:6px 14px;font-size:0.6rem" onclick="responderConvocatoria(${c._rowNum},'confirmada')">Aceptar</button>
             <button class="submit-btn" style="padding:6px 14px;font-size:0.6rem;background:transparent;color:var(--red);border:1px solid var(--red)" onclick="responderConvocatoria(${c._rowNum},'rechazada')">Rechazar</button>`
          : '';
        return `<div class="seg-card">
          <div class="seg-comentario"><strong>${esc(c.marca)}</strong> — ${fmt(c.fecha_trabajo)}</div>
          <div class="seg-meta"><span class="${badgeClass}">${esc(c.estado)}</span></div>
          <div style="margin-top:8px;display:flex;gap:8px">${acciones}</div>
        </div>`;
      }).join('')
    : '<div class="empty-msg">No tienes convocatorias por ahora.</div>';

  const tieneEmprendimiento = !!data.miEmprendimiento;
  document.getElementById('empSi').classList.toggle('on', tieneEmprendimiento);
  document.getElementById('empNo').classList.toggle('on', !tieneEmprendimiento);
  document.getElementById('emprendimientoFormWrap').style.display = tieneEmprendimiento ? 'block' : 'none';
  if (tieneEmprendimiento) {
    document.getElementById('empNombreNegocio').value = data.miEmprendimiento.nombre_negocio || '';
    document.getElementById('empCategoria').value = data.miEmprendimiento.categoria || '';
    document.getElementById('empDescripcion').value = data.miEmprendimiento.descripcion || '';
    document.getElementById('empContacto').value = data.miEmprendimiento.contacto || '';

    const productos = data.misProductosEmprendimiento || [];
    document.getElementById('misProductosList').innerHTML = productos.length
      ? productos.map(p => `<div class="seg-card"><div class="seg-comentario">${esc(p.nombre)} — $${esc(p.precio)}</div></div>`).join('')
      : '<div class="empty-msg">Aún no has agregado productos.</div>';
  }

  renderMisDocumentos(modelo);
  renderAreasFormacion(data.seguimiento || []);
  renderRegistroPagos(data.pagosMensualidad || []);

  const galeriaList = data.galeria || [];
  const galWrap = document.getElementById('galeriaGrid');
  galWrap.innerHTML = galeriaList.length
    ? galeriaList.map(g => `<img src="${g.foto_url}" class="gal-thumb" onclick="abrirFoto('${g.foto_url}')" onerror="this.style.display='none'">`).join('')
    : '<div class="empty-msg">Aún no has subido fotos.</div>';

  const talleresList = data.talleres || [];
  const tlWrap = document.getElementById('talleresList');
  tlWrap.innerHTML = talleresList.length
    ? talleresList.slice().reverse().map(t => `
        <div class="seg-card">
          <div class="seg-materia">${esc(t.materia)}</div>
          <div class="seg-comentario"><strong>${esc(t.titulo)}</strong><br>${esc(t.descripcion)}</div>
          ${t.archivo_url ? `<a href="${t.archivo_url}" target="_blank" style="font-size:0.7rem;color:var(--gold)">Ver material →</a>` : ''}
          <div class="seg-meta">${fmt(t.created_at)}</div>
        </div>`).join('')
    : '<div class="empty-msg">Aún no hay talleres publicados.</div>';

  const actividadesList = data.actividades || [];
  const acWrap = document.getElementById('actividadesList');
  acWrap.innerHTML = actividadesList.length
    ? actividadesList.slice().reverse().map(a => `
        <div class="seg-card">
          <div class="seg-comentario"><strong>${esc(a.titulo)}</strong><br>${esc(a.descripcion)}</div>
          <div class="seg-meta">Fecha: ${fmt(a.fecha_actividad)}</div>
        </div>`).join('')
    : '<div class="empty-msg">No hay actividades programadas.</div>';

  const asistenciaList = data.asistencia || [];
  const asWrap = document.getElementById('asistenciaList');
  asWrap.innerHTML = asistenciaList.length
    ? `<p style="font-size:0.78rem;color:var(--muted)">${asistenciaList.filter(a=>a.estado==='presente').length} de ${asistenciaList.length} clases registradas como presente.</p>`
    : '<div class="empty-msg">Aún no hay registros de asistencia.</div>';

  const excusasList = data.excusas || [];
  const exWrap = document.getElementById('excusasList');
  exWrap.innerHTML = excusasList.length
    ? excusasList.slice().reverse().map(ex => {
        const badgeClass = ex.estado === 'aprobada' ? 'badge-aceptado' : ex.estado === 'rechazada' ? 'badge-rechazado' : 'badge-pendiente';
        return `<div class="seg-card"><div class="seg-comentario">${esc(ex.motivo)}</div><div class="seg-meta"><span class="${badgeClass}">${esc(ex.estado)}</span> · ${fmt(ex.created_at)}</div></div>`;
      }).join('')
    : '<div class="empty-msg">No has enviado excusas.</div>';
}

async function subirExcusa() {
  const motivo = document.getElementById('excusaMotivo').value.trim();
  const file = document.getElementById('excusaInput').files[0];
  if (!motivo) { alert('Escribe el motivo de la excusa.'); return; }

  let archivo = '';
  if (file) archivo = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'subir-excusa', usuario: sesion.usuario, password: sesion.password,
    motivo, archivo
  }));

  document.getElementById('excusaMotivo').value = '';
  const ok = document.getElementById('excusaOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
  await reconsultarPerfil();
}

// ── COMPRESIÓN DE IMAGEN ──────────────────────────────────────────────────
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

// ── ENVÍO POST VÍA IFRAME (evita CORS) ────────────────────────────────────
function enviarPOST(params) {
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

async function reconsultarPerfil() {
  const res = await fetch(`${API_BASE}?path=login-aprendiz&usuario=${encodeURIComponent(sesion.usuario)}&password=${encodeURIComponent(sesion.password)}`);
  const data = await res.json();
  if (data.success) mostrarPerfil(data);
}

// SUBIR COMPROBANTE DE PAGO DE INSCRIPCIÓN
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('comprobanteInput');
  if (input) {
    input.addEventListener('change', () => {
      const nameEl = document.getElementById('comprobanteNombre');
      if (input.files[0]) { nameEl.textContent = input.files[0].name; nameEl.style.display = 'block'; }
    });
  }
  const mensComprobanteInput = document.getElementById('mensComprobanteInput');
  if (mensComprobanteInput) {
    mensComprobanteInput.addEventListener('change', () => {
      const nameEl = document.getElementById('mensComprobanteNombre');
      if (mensComprobanteInput.files[0]) { nameEl.textContent = mensComprobanteInput.files[0].name; nameEl.style.display = 'block'; }
    });
  }
  const mensualidadInput = document.getElementById('mensualidadInput');
  if (mensualidadInput) {
    mensualidadInput.addEventListener('change', () => {
      const nameEl = document.getElementById('mensualidadNombre');
      if (mensualidadInput.files[0]) { nameEl.textContent = mensualidadInput.files[0].name; nameEl.style.display = 'block'; }
    });
  }
  const abonoInput = document.getElementById('abonoInput');
  if (abonoInput) {
    abonoInput.addEventListener('change', () => {
      const nameEl = document.getElementById('abonoNombre');
      if (abonoInput.files[0]) { nameEl.textContent = abonoInput.files[0].name; nameEl.style.display = 'block'; }
    });
  }
  const galInput = document.getElementById('galeriaInput');
  if (galInput) galInput.addEventListener('change', subirFotoGaleria);

  const excusaInput = document.getElementById('excusaInput');
  if (excusaInput) {
    excusaInput.addEventListener('change', () => {
      const nameEl = document.getElementById('excusaNombre');
      if (excusaInput.files[0]) { nameEl.textContent = excusaInput.files[0].name; nameEl.style.display = 'block'; }
    });
  }
});

async function subirComprobante() {
  const file = document.getElementById('comprobanteInput').files[0];
  if (!file) { alert('Selecciona la foto del comprobante de pago.'); return; }

  const btn = document.getElementById('pagoBtn');
  btn.disabled = true; btn.textContent = 'Subiendo...';

  const b64 = await comprimirImagen(file);
  await enviarPOST(new URLSearchParams({
    path: 'subir-comprobante',
    usuario: sesion.usuario, password: sesion.password,
    comprobante: b64
  }));

  btn.textContent = 'Verificando...';
  await new Promise(r => setTimeout(r, 1500));
  await reconsultarPerfil();
}

async function subirAbono() {
  const valor = document.getElementById('abonoValor').value;
  const file = document.getElementById('abonoInput').files[0];
  if (!valor) { alert('Indica el valor abonado.'); return; }

  let comprobante = '';
  if (file) comprobante = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'subir-abono',
    usuario: sesion.usuario, password: sesion.password,
    valor, comprobante
  }));
  alert('Abono registrado. Tienes entre 8 y 15 días para completar el valor total de la mensualidad.');
}

async function subirFotoGaleria() {
  const file = document.getElementById('galeriaInput').files[0];
  if (!file) return;

  const btn = document.getElementById('galUploadBtn');
  btn.disabled = true; btn.textContent = 'Subiendo...';

  const b64 = await comprimirImagen(file);
  await enviarPOST(new URLSearchParams({
    path: 'subir-foto-galeria',
    usuario: sesion.usuario, password: sesion.password,
    foto: b64
  }));

  await new Promise(r => setTimeout(r, 1500));
  await reconsultarPerfil();
  btn.disabled = false; btn.textContent = '+ Subir foto';
}

// RESEÑAS
document.addEventListener('DOMContentLoaded', () => {
  const histInput = document.getElementById('histFotoInput');
  if (histInput) {
    histInput.addEventListener('change', () => {
      const nameEl = document.getElementById('histFotoNombre');
      if (histInput.files[0]) { nameEl.textContent = histInput.files[0].name; nameEl.style.display = 'block'; }
    });
  }
});

async function enviarResena() {
  const calificacion = document.getElementById('resCalificacion').value;
  const comentario = document.getElementById('resComentario').value.trim();
  if (!comentario) { alert('Escribe un comentario.'); return; }

  await enviarPOST(new URLSearchParams({
    path: 'enviar-resena', usuario: sesion.usuario, password: sesion.password,
    calificacion, comentario
  }));

  document.getElementById('resComentario').value = '';
  const ok = document.getElementById('resOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 3000);
}

async function enviarHistoria() {
  const texto = document.getElementById('histTexto').value.trim();
  const videoUrl = document.getElementById('histVideoUrl').value.trim();
  const file = document.getElementById('histFotoInput').files[0];
  if (!texto) { alert('Cuenta tu historia primero.'); return; }

  let foto = '';
  if (file) foto = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'enviar-historia', usuario: sesion.usuario, password: sesion.password,
    texto, videoUrl, foto
  }));

  document.getElementById('histTexto').value = '';
  document.getElementById('histVideoUrl').value = '';
  const ok = document.getElementById('histOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 3000);
}

// CATÁLOGO / AGENCIA
async function toggleAgencia(quiere) {
  await enviarPOST(new URLSearchParams({ path: 'toggle-agencia', usuario: sesion.usuario, password: sesion.password, quiere }));
  await reconsultarPerfil();
}

async function guardarPerfilCatalogo() {
  const nombreArtistico = document.getElementById('catNombreArtistico').value.trim();
  const estatura = document.getElementById('catEstatura').value.trim();
  const tallas = document.getElementById('catTallas').value.trim();
  const medidas = document.getElementById('catMedidas').value.trim();
  const ciudadCatalogo = document.getElementById('catCiudad').value.trim();
  const disponibilidad = document.getElementById('catDisponibilidad').value.trim();

  await enviarPOST(new URLSearchParams({
    path: 'actualizar-perfil-catalogo', usuario: sesion.usuario, password: sesion.password,
    nombreArtistico, estatura, tallas, medidas, ciudadCatalogo, disponibilidad
  }));

  const ok = document.getElementById('catOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 2500);
}

// AGENDA LABORAL
async function responderConvocatoria(respuestaRowNum, estado) {
  if (!confirm(estado === 'confirmada' ? '¿Confirmar tu disponibilidad?' : '¿Rechazar esta convocatoria?')) return;
  await enviarPOST(new URLSearchParams({
    path: 'responder-convocatoria', usuario: sesion.usuario, password: sesion.password,
    respuestaRowNum, estado
  }));
  await new Promise(r => setTimeout(r, 1200));
  await reconsultarPerfil();
}

// MI EMPRENDIMIENTO
function toggleEmprendimiento(mostrar) {
  document.getElementById('empSi').classList.toggle('on', mostrar);
  document.getElementById('empNo').classList.toggle('on', !mostrar);
  document.getElementById('emprendimientoFormWrap').style.display = mostrar ? 'block' : 'none';
}

async function guardarEmprendimiento() {
  const nombreNegocio = document.getElementById('empNombreNegocio').value.trim();
  const categoria = document.getElementById('empCategoria').value.trim();
  const descripcion = document.getElementById('empDescripcion').value.trim();
  const contacto = document.getElementById('empContacto').value.trim();
  if (!nombreNegocio) { alert('Escribe el nombre de tu negocio.'); return; }

  await enviarPOST(new URLSearchParams({
    path: 'crear-emprendimiento-modelo', usuario: sesion.usuario, password: sesion.password,
    nombreNegocio, categoria, descripcion, contacto
  }));

  const ok = document.getElementById('empOk');
  ok.style.display = 'block';
  setTimeout(async () => { ok.style.display = 'none'; await reconsultarPerfil(); }, 1500);
}

async function agregarProductoEmprendimiento() {
  const nombre = document.getElementById('empProdNombre').value.trim();
  const precio = document.getElementById('empProdPrecio').value;
  const file = document.getElementById('empProdFotoInput').files[0];
  if (!nombre || !precio) { alert('Completa nombre y precio del producto.'); return; }

  let foto = '';
  if (file) foto = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'agregar-producto-emprendimiento', usuario: sesion.usuario, password: sesion.password,
    nombre, precio, foto
  }));

  document.getElementById('empProdNombre').value = '';
  document.getElementById('empProdPrecio').value = '';
  document.getElementById('empProdFotoInput').value = '';
  await new Promise(r => setTimeout(r, 1200));
  await reconsultarPerfil();
}

// LIGHTBOX
function abrirFoto(url) {
  document.getElementById('fotoLightboxImg').src = url;
  document.getElementById('fotoLightbox').classList.add('open');
}
function cerrarFoto() {
  document.getElementById('fotoLightbox').classList.remove('open');
}

// AUTO-LOGIN SI HAY SESIÓN GUARDADA
window.addEventListener('DOMContentLoaded', async () => {
  const usuario  = sessionStorage.getItem('aprendiz_usuario');
  const password = sessionStorage.getItem('aprendiz_pass');
  if (usuario && password) {
    sesion = { usuario, password };
    await reconsultarPerfil();
  }
});
