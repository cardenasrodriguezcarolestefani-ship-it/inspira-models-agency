const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

let sesion = { usuario: '', password: '' };

function esc(v) { return String(v || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmt(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function doLogin() {
  const usuario  = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPass').value;
  const errBox = document.getElementById('loginError');
  errBox.style.display = 'none';
  if (!usuario || !password) return;

  const btn = document.querySelector('.login-btn');
  btn.disabled = true; btn.textContent = 'Ingresando...';

  try {
    const res = await fetch(`${API_BASE}?path=login-empresa&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    btn.disabled = false; btn.textContent = 'Ingresar';

    if (!data.success) {
      errBox.textContent = 'Usuario o contraseña incorrectos';
      errBox.style.display = 'block';
      return;
    }
    sesion = { usuario, password };
    sessionStorage.setItem('empresa_usuario', usuario);
    sessionStorage.setItem('empresa_pass', password);
    mostrarDashboard(data);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Ingresar';
    errBox.textContent = 'Error de conexión.';
    errBox.style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('empresa_usuario');
  sessionStorage.removeItem('empresa_pass');
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
  document.getElementById('dashNombre').textContent = data.empresa.razon_social;

  renderPromos(data.productos || []);
  renderCotizaciones(data.cotizaciones || []);
}

function renderPromos(rows) {
  const wrap = document.getElementById('promosList');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">No hay productos disponibles por ahora.</p>'; return; }
  wrap.innerHTML = rows.map(p => `
    <div class="producto-mini">
      ${p.imagen_url ? `<img src="${p.imagen_url}">` : ''}
      <div><div class="item-title" style="margin-bottom:2px">${esc(p.nombre)}</div><div class="item-desc">$${esc(p.precio)} · ${esc(p.categoria)}</div></div>
    </div>
  `).join('');
}

function renderCotizaciones(rows) {
  const wrap = document.getElementById('cotizacionesList');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">No tienes procesos registrados todavía.</p>'; return; }
  wrap.innerHTML = rows.slice().reverse().map(c => {
    const badgeClass = c.estado === 'agendado' || c.estado === 'confirmado' ? 'badge-aceptado' : c.estado === 'rechazado' ? 'badge-rechazado' : 'badge-pendiente';
    return `<div class="item-card">
      <div class="item-title">Radicado ${esc(c.radicado)} <span class="${badgeClass}">${esc(c.estado)}</span></div>
      <div class="item-desc">${esc(c.curso)} — ${esc(c.fecha_deseada)}</div>
      ${c.valor_cotizado ? `<div class="item-desc">Valor cotizado: $${esc(c.valor_cotizado)}</div>` : ''}
      <div class="item-meta">${fmt(c.created_at)}</div>
    </div>`;
  }).join('');
}

async function enviarResena() {
  const calificacion = document.getElementById('resCalificacion').value;
  const comentario = document.getElementById('resComentario').value.trim();
  if (!comentario) { alert('Escribe un comentario.'); return; }

  await enviarASheet(new URLSearchParams({ path: 'enviar-resena', usuario: sesion.usuario, password: sesion.password, calificacion, comentario }));

  document.getElementById('resComentario').value = '';
  const ok = document.getElementById('resOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 3000);
}

async function enviarHistoria() {
  const texto = document.getElementById('histTexto').value.trim();
  if (!texto) { alert('Cuenta tu experiencia primero.'); return; }

  await enviarASheet(new URLSearchParams({ path: 'enviar-historia', usuario: sesion.usuario, password: sesion.password, texto, videoUrl: '' }));

  document.getElementById('histTexto').value = '';
  const ok = document.getElementById('histOk');
  ok.style.display = 'block';
  setTimeout(() => ok.style.display = 'none', 3000);
}

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

window.addEventListener('DOMContentLoaded', async () => {
  const usuario  = sessionStorage.getItem('empresa_usuario');
  const password = sessionStorage.getItem('empresa_pass');
  if (usuario && password) {
    sesion = { usuario, password };
    const res = await fetch(`${API_BASE}?path=login-empresa&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    if (data.success) mostrarDashboard(data);
  }
});
