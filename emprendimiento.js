const API_BASE = 'https://script.google.com/macros/s/AKfycbwn-5addPc374NBrTFNk8fa4Qo4WlmQJGqJHTYvF7DV3TE54aTgsZRTmoM4LQ1I-aLJNw/exec';

let sesion = { usuario: '', password: '', rowNum: null };

function esc(v) { return String(v || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function doLogin() {
  const usuario  = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPass').value;
  const errBox = document.getElementById('loginError');
  errBox.style.display = 'none';
  if (!usuario || !password) return;

  const btn = document.querySelector('.login-btn');
  btn.disabled = true; btn.textContent = 'Ingresando...';

  try {
    const res = await fetch(`${API_BASE}?path=login-emprendedor&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    btn.disabled = false; btn.textContent = 'Ingresar';

    if (!data.success) {
      errBox.textContent = 'Usuario o contraseña incorrectos';
      errBox.style.display = 'block';
      return;
    }
    sesion = { usuario, password, rowNum: data.rowNum };
    sessionStorage.setItem('emp_usuario', usuario);
    sessionStorage.setItem('emp_pass', password);
    mostrarDashboard(data);
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Ingresar';
    errBox.textContent = 'Error de conexión.';
    errBox.style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('emp_usuario');
  sessionStorage.removeItem('emp_pass');
  location.reload();
}

function mostrarDashboard(data) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('dashNombre').textContent = data.emprendimiento.nombre_negocio;
  renderProductos(data.productos || []);
}

function renderProductos(rows) {
  const wrap = document.getElementById('productosList');
  if (!rows.length) { wrap.innerHTML = '<p class="empty-msg">Aún no has agregado productos.</p>'; return; }
  wrap.innerHTML = rows.map(p => `
    <div class="producto-mini">
      ${p.foto_url ? `<img src="${p.foto_url}">` : ''}
      <div><div style="font-size:0.82rem">${esc(p.nombre)}</div><div style="font-size:0.7rem;color:var(--muted)">$${esc(p.precio)} · Cant: ${esc(p.cantidad)}</div></div>
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

async function agregarProducto() {
  const nombre = document.getElementById('prodNombre').value.trim();
  const descripcion = document.getElementById('prodDescripcion').value.trim();
  const precio = document.getElementById('prodPrecio').value;
  const cantidad = document.getElementById('prodCantidad').value;
  const file = document.getElementById('prodFotoInput').files[0];
  if (!nombre || !precio) { alert('Completa nombre y precio.'); return; }

  let foto = '';
  if (file) foto = await comprimirImagen(file);

  await enviarPOST(new URLSearchParams({
    path: 'agregar-producto-emprendimiento', rowNum: sesion.rowNum,
    nombre, descripcion, precio, cantidad, foto
  }));

  document.getElementById('prodNombre').value = '';
  document.getElementById('prodDescripcion').value = '';
  document.getElementById('prodPrecio').value = '';
  document.getElementById('prodCantidad').value = '';
  document.getElementById('prodFotoInput').value = '';

  const ok = document.getElementById('prodOk');
  ok.style.display = 'block';
  setTimeout(async () => {
    ok.style.display = 'none';
    const res = await fetch(`${API_BASE}?path=login-emprendedor&usuario=${encodeURIComponent(sesion.usuario)}&password=${encodeURIComponent(sesion.password)}`);
    const data = await res.json();
    if (data.success) renderProductos(data.productos || []);
  }, 1500);
}

window.addEventListener('DOMContentLoaded', async () => {
  const usuario  = sessionStorage.getItem('emp_usuario');
  const password = sessionStorage.getItem('emp_pass');
  if (usuario && password) {
    const res = await fetch(`${API_BASE}?path=login-emprendedor&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    if (data.success) {
      sesion = { usuario, password, rowNum: data.rowNum };
      mostrarDashboard(data);
    }
  }
});
