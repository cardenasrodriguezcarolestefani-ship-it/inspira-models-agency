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

// SELECTOR TIPO
let tipoSeleccionado = 'modelo';
function selectType(tipo, btn) {
  tipoSeleccionado = tipo;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// SUBMIT INSCRIPCIÓN → WhatsApp
function submitInscripcion(e) {
  e.preventDefault();
  const nombre   = document.getElementById('inscNombre').value;
  const edad     = document.getElementById('inscEdad').value;
  const wpp      = document.getElementById('inscWpp').value;
  const ciudad   = document.getElementById('inscCiudad').value;
  const categoria = document.getElementById('inscCategoria').value;
  const tipo     = tipoSeleccionado === 'padre' ? 'Padre/Tutor' : 'Modelo';
  const msg = encodeURIComponent(
    `Hola Inspira Models! Quiero inscribirme.\n\n` +
    `Tipo: ${tipo}\nNombre: ${nombre}\nEdad: ${edad}\nCiudad: ${ciudad}\nCategoría: ${categoria}\nContacto: ${wpp}\n\n` +
    `Por favor indíquenme los siguientes pasos.`
  );
  document.getElementById('modalFormWrap').style.display = 'none';
  document.getElementById('modalSuccess').style.display  = 'block';
  setTimeout(() => window.open(`https://wa.me/573104479013?text=${msg}`, '_blank'), 800);
}

// SUBMIT MARCAS → WhatsApp
function submitMarcasForm(e) {
  e.preventDefault();
  document.getElementById('marcasFormWrap').style.display = 'none';
  document.getElementById('marcasSuccess').style.display  = 'block';
  setTimeout(() => window.open('https://wa.me/573104479013?text=' + encodeURIComponent('Hola! Soy una empresa y quiero solicitar talentos de Inspira Models.'), '_blank'), 800);
}

// SUBMIT CURSO GRUPO → WhatsApp
function submitCursoGrupo(e) {
  e.preventDefault();
  const nombre   = document.getElementById('cgNombre').value;
  const wpp      = document.getElementById('cgWpp').value;
  const tipo     = document.getElementById('cgTipo').value;
  const personas = document.getElementById('cgPersonas').value;
  const msg = encodeURIComponent(
    `Hola Inspira Models! Quiero solicitar un curso para grupo.\n\n` +
    `Nombre: ${nombre}\nWhatsApp: ${wpp}\nCurso: ${tipo}\nPersonas: ${personas}\n\n` +
    `Por favor envíenme una cotización.`
  );
  document.getElementById('cursoGrupoForm').style.display    = 'none';
  document.getElementById('cursoGrupoSuccess').style.display = 'block';
  setTimeout(() => window.open(`https://wa.me/573104479013?text=${msg}`, '_blank'), 800);
}
