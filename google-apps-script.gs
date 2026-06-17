const SHEET_ID           = '1ND06RgiP4ljc3dmH2g0qrsIM8yzKiC-HgnHo2H1zPjw';
const INSCRIPCIONES      = 'inscripciones';
const SOLICITUDES_MARCAS = 'solicitudes_marcas';
const SOLICITUDES_GRUPO  = 'solicitudes_grupo';
const PROFESORES         = 'profesores';
const MODELOS            = 'modelos';
const SEGUIMIENTO        = 'seguimiento';
const GALERIA            = 'galeria';
const RESENAS            = 'resenas';
const HISTORIAS          = 'historias';
const NOTICIAS           = 'noticias';
const PRODUCTOS          = 'productos';
const ASISTENCIA         = 'asistencia';
const EXCUSAS            = 'excusas';
const TALLERES           = 'talleres';
const ACTIVIDADES        = 'actividades';
const EMPRESAS_REGISTRO  = 'empresas_registro';
const COTIZACIONES       = 'cotizaciones';
const CONVOCATORIAS      = 'convocatorias';
const CONVOCATORIA_RESPUESTAS = 'convocatoria_respuestas';
const EMPRENDIMIENTOS    = 'emprendimientos';
const EMPRENDIMIENTO_PRODUCTOS = 'emprendimiento_productos';
const PAGOS_MENSUALIDAD = 'pagos_mensualidad';
const DIAS_LIMITE_PAGO   = 8;
const DIAS_LIMITE_MENSUALIDAD = 15;
const CONTRATO_DEFAULT   =
  'CONTRATO DE PRESTACIÓN DE SERVICIOS FORMATIVOS — INSPIRA MODELS\n\n' +
  'Este contrato se celebra entre Inspira Models y el/la estudiante (o su acudiente, si es menor de edad), ' +
  'quien acepta los términos académicos, de imagen y de pago establecidos por la academia. ' +
  '(Texto editable desde el panel administrativo.)';

// ── POST: rutas con archivos (base64) ─────────────────────────────────────────
function doPost(e) {
  const p    = e.parameter;
  const path = p.path || '';

  if (path === 'inscripciones') {
    let fotoCompletaUrl = '';
    let fotoMedioUrl = '';
    try {
      if (p.fotoCompleta) fotoCompletaUrl = saveBase64Image(p.fotoCompleta, 'completa_' + Date.now() + '.jpg');
      if (p.fotoMedio) fotoMedioUrl = saveBase64Image(p.fotoMedio, 'medio_' + Date.now() + '.jpg');
    } catch (err) {
      Logger.log('Error guardando fotos: ' + err);
    }
    return saveRow(INSCRIPCIONES, [
      p.tipo||'', p.nombre||'', p.fechaNacimiento||'', p.documento||'', p.edad||'',
      p.email||'', p.wpp||'', p.ciudad||'', p.horarioTipo||'', p.horario||'',
      p.experiencia||'', p.mayor||'si',
      p.acudNombre||'', p.acudCC||'', p.acudTel||'',
      fotoCompletaUrl, fotoMedioUrl,
      'pendiente',
      new Date().toISOString(),
      p.horaSugerida||''
    ]);
  }

  if (path === 'subir-documento')     return subirDocumento(p);
  if (path === 'subir-comprobante')   return subirComprobante(p);
  if (path === 'subir-abono')         return subirAbono(p);
  if (path === 'subir-foto-galeria')  return subirFotoGaleria(p);
  if (path === 'enviar-resena')       return enviarResena(p);
  if (path === 'enviar-historia')     return enviarHistoria(p);
  if (path === 'crear-noticia')       return crearNoticia(p);
  if (path === 'crear-producto')      return crearProducto(p);
  if (path === 'subir-excusa')        return subirExcusa(p);
  if (path === 'crear-taller')        return crearTaller(p);
  if (path === 'registrar-empresa')   return registrarEmpresa(p);
  if (path === 'subir-comprobante-cotizacion') return subirComprobanteCotizacion(p);
  if (path === 'crear-emprendimiento-modelo')      return crearEmprendimientoModelo(p);
  if (path === 'solicitar-emprendimiento-externo') return solicitarEmprendimientoExterno(p);
  if (path === 'agregar-producto-emprendimiento')  return agregarProductoEmprendimiento(p);
  if (path === 'pagar-mensualidad-inicial')         return pagarMensualidadInicial(p);
  if (path === 'pagar-mensualidad-mes')             return pagarMensualidadMes(p);

  return doGet(e);
}

// ── GET: rutas sin archivos ───────────────────────────────────────────────────
function doGet(e) {
  const p    = e.parameter;
  const path = p.path || '';

  if (path === 'solicitudes-marcas') {
    return saveRow(SOLICITUDES_MARCAS, [
      p.empresa||'', p.contacto||'', p.contactoInfo||'',
      p.tipoCampana||'', p.mensaje||'',
      new Date().toISOString()
    ]);
  }

  if (path === 'solicitudes-grupo') {
    return saveRow(SOLICITUDES_GRUPO, [
      p.nombre||'', p.wpp||'', p.tipo||'', p.personas||'',
      new Date().toISOString()
    ]);
  }

  if (path === 'create-profesor')    return crearProfesorConCredenciales(p);
  if (path === 'login-profesor')     return loginProfesor(p);
  if (path === 'marcar-asistencia')  return marcarAsistencia(p);
  if (path === 'revisar-excusa')     return revisarExcusa(p);
  if (path === 'crear-actividad')    return crearActividad(p);
  if (path === 'aceptar-empresa')    return aceptarEmpresa(p);
  if (path === 'rechazar-empresa')   return rechazarEmpresa(p);
  if (path === 'login-empresa')      return loginEmpresa(p);
  if (path === 'solicitar-cotizacion')      return solicitarCotizacion(p);
  if (path === 'consultar-radicado')        return consultarRadicado(p);
  if (path === 'cotizar')                   return cotizar(p);
  if (path === 'asignar-profesor-cotizacion') return asignarProfesorCotizacion(p);
  if (path === 'rechazar-cotizacion')       return rechazarCotizacion(p);
  if (path === 'toggle-agencia')            return toggleAgencia(p);
  if (path === 'actualizar-perfil-catalogo') return actualizarPerfilCatalogo(p);
  if (path === 'get-catalogo')              return getCatalogo();
  if (path === 'crear-convocatoria')        return crearConvocatoria(p);
  if (path === 'responder-convocatoria')    return responderConvocatoria(p);
  if (path === 'actualizar-estado-convocatoria') return actualizarEstadoConvocatoria(p);
  if (path === 'aceptar-emprendimiento')    return aceptarEmprendimiento(p);
  if (path === 'rechazar-emprendimiento')   return rechazarEmprendimiento(p);
  if (path === 'login-emprendedor')         return loginEmprendedor(p);
  if (path === 'get-emprendimientos')       return getEmprendimientos();
  if (path === 'proponer-opciones-horario') return proponerOpcionesHorario(p);
  if (path === 'aceptar-horario-directo')   return aceptarHorarioDirecto(p);
  if (path === 'elegir-horario')            return elegirHorario(p);
  if (path === 'get-agenda')                return getAgenda();

  if (path === 'aceptar')            return aceptarModelo(p);
  if (path === 'rechazar')           return rechazarModelo(p);
  if (path === 'login-aprendiz')     return loginAprendiz(p);
  if (path === 'add-seguimiento')    return addSeguimiento(p);
  if (path === 'aceptar-contrato')   return aceptarContrato(p);
  if (path === 'aprobar-horario')    return resolverHorario(p, 'aprobado');
  if (path === 'rechazar-horario')   return resolverHorario(p, 'rechazado');
  if (path === 'proponer-horario')   return resolverHorario(p, 'alternativa_propuesta');
  if (path === 'actualizar-contrato') return actualizarContrato(p);
  if (path === 'get-home')           return getHome();
  if (path === 'moderar-resena')     return moderarItem(RESENAS, p);
  if (path === 'moderar-historia')   return moderarItem(HISTORIAS, p);
  if (path === 'toggle-producto')    return toggleProducto(p);

  if (path === 'get-data') {
    return jsonOk({
      inscripciones: sheetToObjects(INSCRIPCIONES),
      marcas:        sheetToObjects(SOLICITUDES_MARCAS),
      grupo:         sheetToObjects(SOLICITUDES_GRUPO),
      profesores:    sheetToObjects(PROFESORES),
      modelos:       sheetToObjects(MODELOS),
      seguimiento:   sheetToObjects(SEGUIMIENTO),
      resenas:       sheetToObjects(RESENAS),
      historias:     sheetToObjects(HISTORIAS),
      noticias:      sheetToObjects(NOTICIAS),
      productos:     sheetToObjects(PRODUCTOS),
      asistencia:    sheetToObjects(ASISTENCIA),
      excusas:       sheetToObjects(EXCUSAS),
      talleres:      sheetToObjects(TALLERES),
      actividades:   sheetToObjects(ACTIVIDADES),
      empresas:      sheetToObjects(EMPRESAS_REGISTRO),
      cotizaciones:  sheetToObjects(COTIZACIONES),
      convocatorias: sheetToObjects(CONVOCATORIAS),
      convocatoriaRespuestas: sheetToObjects(CONVOCATORIA_RESPUESTAS),
      emprendimientos: sheetToObjects(EMPRENDIMIENTOS),
      emprendimientoProductos: sheetToObjects(EMPRENDIMIENTO_PRODUCTOS),
      pagosMensualidad: sheetToObjects(PAGOS_MENSUALIDAD),
      contrato:      obtenerContrato()
    });
  }

  return jsonError('Ruta no válida');
}

// ── HELPERS JSON ──────────────────────────────────────────────────────────────
function jsonOk(extra) {
  const obj = Object.assign({ success: true }, extra || {});
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function jsonError(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── LECTURA GENÉRICA DE HOJAS ─────────────────────────────────────────────────
function sheetToObjects(name) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map((row, i) => {
    const obj = { _rowNum: i + 2 };
    headers.forEach((h, j) => { obj[h] = row[j]; });
    return obj;
  });
}

// ── GUARDAR FILA ──────────────────────────────────────────────────────────────
function saveRow(sheetName, row) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return jsonError('Hoja no encontrada: ' + sheetName);
  sheet.appendRow(row);
  return jsonOk();
}

// ── GOOGLE DRIVE ──────────────────────────────────────────────────────────────
function getOrCreateFolder() {
  const name    = 'Inspira_Models_Fotos';
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function saveBase64Image(b64, filename) {
  const folder = getOrCreateFolder();
  const blob   = Utilities.newBlob(Utilities.base64Decode(b64), 'image/jpeg', filename);
  const file   = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w400';
}

// ── CONTRATO (texto editable desde el admin) ──────────────────────────────────
function obtenerContrato() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('CONTRATO_TEXTO') || CONTRATO_DEFAULT;
}
function actualizarContrato(p) {
  if (!p.texto) return jsonError('Falta el texto del contrato');
  PropertiesService.getScriptProperties().setProperty('CONTRATO_TEXTO', p.texto);
  return jsonOk();
}

// ── BUSCAR FILA DE MODELO POR USUARIO/CONTRASEÑA ──────────────────────────────
function buscarFilaModelo(usuario, password) {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(MODELOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');
  const idxP    = headers.indexOf('contrasena');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario && String(data[i][idxP]) === password) {
      return { sheet, headers, rowNum: i + 1, row: data[i] };
    }
  }
  return null;
}

function filaAObjeto(headers, row) {
  const obj = {};
  headers.forEach((h, j) => { obj[h] = row[j]; });
  return obj;
}

// ── RECALCULAR ESTADO DE PROCESO (¿ya está 100% activo?) ──────────────────────
function recalcularEstadoProceso(match) {
  const modelo  = filaAObjeto(match.headers, match.row);
  const esMayor = modelo.mayor_edad !== 'no';
  const docsOk  = esMayor
    ? !!(modelo.doc_cedula_url && modelo.doc_eps_url)
    : !!(modelo.doc_menor_url && modelo.doc_acudiente_cc_url && modelo.doc_eps_url);
  const contratoOk = modelo.contrato_aceptado === 'si';
  const pagoOk      = modelo.estado_pago === 'pagado';
  const horarioOk   = modelo.mensualidad_inicial_pagada === 'si';

  const nuevoEstado = (docsOk && contratoOk && pagoOk && horarioOk) ? 'activo' : 'filtro2';
  match.sheet.getRange(match.rowNum, match.headers.indexOf('estado_proceso') + 1).setValue(nuevoEstado);
  return nuevoEstado;
}

function calcularProgreso(modelo) {
  const esMayor = modelo.mayor_edad !== 'no';
  const documentos = esMayor
    ? !!(modelo.doc_cedula_url && modelo.doc_eps_url)
    : !!(modelo.doc_menor_url && modelo.doc_acudiente_cc_url && modelo.doc_eps_url);
  return {
    documentos: documentos,
    contrato:   modelo.contrato_aceptado === 'si',
    pago:       modelo.estado_pago === 'pagado',
    horario:    modelo.mensualidad_inicial_pagada === 'si',
    activo:     modelo.estado_proceso === 'activo'
  };
}

// ── LOGIN APRENDIZ ────────────────────────────────────────────────────────────
function loginAprendiz(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  if (!usuario || !password) return jsonError('Usuario y contraseña requeridos');

  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const modelo = filaAObjeto(match.headers, match.row);
  delete modelo.contrasena;

  const seguimiento = sheetToObjects(SEGUIMIENTO).filter(s => s.usuario === usuario);
  const galeria     = sheetToObjects(GALERIA).filter(g => g.usuario === usuario);
  const progreso    = calcularProgreso(modelo);
  const talleres    = sheetToObjects(TALLERES);
  const actividades = sheetToObjects(ACTIVIDADES);
  const asistencia  = sheetToObjects(ASISTENCIA).filter(a => a.usuario_modelo === usuario);
  const excusas     = sheetToObjects(EXCUSAS).filter(ex => ex.usuario === usuario);
  const convocatorias = sheetToObjects(CONVOCATORIA_RESPUESTAS).filter(c => c.usuario_modelo === usuario);
  const miEmprendimiento = sheetToObjects(EMPRENDIMIENTOS).find(e => e.usuario === usuario) || null;
  const misProductosEmprendimiento = miEmprendimiento
    ? sheetToObjects(EMPRENDIMIENTO_PRODUCTOS).filter(pr => parseInt(pr.emprendimiento_rowNum) === miEmprendimiento._rowNum)
    : [];
  const pagosMensualidad = sheetToObjects(PAGOS_MENSUALIDAD).filter(pg => pg.usuario === usuario);

  return jsonOk({ modelo, seguimiento, galeria, progreso, contrato: obtenerContrato(), talleres, actividades, asistencia, excusas, convocatorias, miEmprendimiento, misProductosEmprendimiento, pagosMensualidad });
}

// ── SUBIR DOCUMENTO (cédula / EPS / doc menor / cédula acudiente) ─────────────
function subirDocumento(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const tiposValidos = {
    cedula:      'doc_cedula_url',
    eps:         'doc_eps_url',
    doc_menor:   'doc_menor_url',
    acudiente_cc:'doc_acudiente_cc_url'
  };
  const columna = tiposValidos[p.tipo];
  if (!columna) return jsonError('Tipo de documento inválido');

  let url = '';
  try {
    if (p.archivo) url = saveBase64Image(p.archivo, p.tipo + '_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    Logger.log('Error guardando documento: ' + err);
    return jsonError('No se pudo guardar el documento');
  }
  if (!url) return jsonError('Archivo vacío');

  match.sheet.getRange(match.rowNum, match.headers.indexOf(columna) + 1).setValue(url);
  match.row[match.headers.indexOf(columna)] = url;
  const estado = recalcularEstadoProceso(match);
  return jsonOk({ estado_proceso: estado });
}

// ── ACEPTAR CONTRATO ───────────────────────────────────────────────────────────
function aceptarContrato(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const ahora = new Date().toISOString();
  match.sheet.getRange(match.rowNum, match.headers.indexOf('contrato_aceptado') + 1).setValue('si');
  match.sheet.getRange(match.rowNum, match.headers.indexOf('contrato_fecha') + 1).setValue(ahora);
  match.row[match.headers.indexOf('contrato_aceptado')] = 'si';
  match.row[match.headers.indexOf('contrato_fecha')] = ahora;
  const estado = recalcularEstadoProceso(match);
  return jsonOk({ estado_proceso: estado });
}

// ── SUBIR COMPROBANTE DE PAGO DE INSCRIPCIÓN ──────────────────────────────────
function subirComprobante(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let url = '';
  try {
    if (p.comprobante) url = saveBase64Image(p.comprobante, 'pago_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    Logger.log('Error guardando comprobante: ' + err);
    return jsonError('No se pudo guardar el comprobante');
  }
  if (!url) return jsonError('Comprobante vacío');

  match.sheet.getRange(match.rowNum, match.headers.indexOf('estado_pago') + 1).setValue('pagado');
  match.sheet.getRange(match.rowNum, match.headers.indexOf('comprobante_pago_url') + 1).setValue(url);
  match.row[match.headers.indexOf('estado_pago')] = 'pagado';

  const fechaLimiteMensualidad = new Date();
  fechaLimiteMensualidad.setDate(fechaLimiteMensualidad.getDate() + DIAS_LIMITE_MENSUALIDAD);
  match.sheet.getRange(match.rowNum, match.headers.indexOf('fecha_limite_mensualidad') + 1).setValue(fechaLimiteMensualidad.toISOString());
  match.row[match.headers.indexOf('fecha_limite_mensualidad')] = fechaLimiteMensualidad.toISOString();

  const estado = recalcularEstadoProceso(match);
  return jsonOk({ estado_proceso: estado });
}

// ── PAGO DE LA PRIMERA MENSUALIDAD (confirma el horario definitivamente) ──────
function pagarMensualidadInicial(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let url = '';
  try {
    if (p.comprobante) url = saveBase64Image(p.comprobante, 'mensualidad_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    Logger.log('Error guardando comprobante de mensualidad: ' + err);
    return jsonError('No se pudo guardar el comprobante');
  }
  if (!url) return jsonError('Comprobante vacío');

  match.sheet.getRange(match.rowNum, match.headers.indexOf('mensualidad_inicial_pagada') + 1).setValue('si');
  match.sheet.getRange(match.rowNum, match.headers.indexOf('mensualidad_inicial_url') + 1).setValue(url);
  match.sheet.getRange(match.rowNum, match.headers.indexOf('horario_estado') + 1).setValue('confirmado');
  match.row[match.headers.indexOf('mensualidad_inicial_pagada')] = 'si';

  const estado = recalcularEstadoProceso(match);
  return jsonOk({ estado_proceso: estado });
}

// ── PAGO DE MENSUALIDAD MES A MES (después de la activación) ─────────────────
function pagarMensualidadMes(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');
  const modelo = filaAObjeto(match.headers, match.row);

  let url = '';
  try {
    if (p.comprobante) url = saveBase64Image(p.comprobante, 'mensualidad_mes_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    Logger.log('Error guardando comprobante mensual: ' + err);
    return jsonError('No se pudo guardar el comprobante');
  }
  if (!url) return jsonError('Comprobante vacío');

  const mes = p.mes || Utilities.formatDate(new Date(), 'America/Bogota', 'MMMM yyyy');
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(PAGOS_MENSUALIDAD).appendRow([
    usuario, modelo.nombre, mes, p.valor || '', url, new Date().toISOString()
  ]);
  return jsonOk();
}

// ── ABONO OPCIONAL A LA MENSUALIDAD ────────────────────────────────────────────
function subirAbono(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let url = '';
  try {
    if (p.comprobante) url = saveBase64Image(p.comprobante, 'abono_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    return jsonError('No se pudo guardar el comprobante del abono');
  }

  match.sheet.getRange(match.rowNum, match.headers.indexOf('abono_valor') + 1).setValue(p.valor || '');
  if (url) match.sheet.getRange(match.rowNum, match.headers.indexOf('abono_url') + 1).setValue(url);
  return jsonOk();
}

// ── SUBIR FOTO A GALERÍA PROPIA ────────────────────────────────────────────────
function subirFotoGaleria(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let url = '';
  try {
    if (p.foto) url = saveBase64Image(p.foto, 'galeria_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) {
    return jsonError('No se pudo guardar la foto');
  }
  if (!url) return jsonError('Foto vacía');

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(GALERIA).appendRow([usuario, url, new Date().toISOString()]);
  return jsonOk();
}

// ── AGREGAR CALIFICACIÓN/OBSERVACIÓN POR ÁREA (desde profesor o admin) ────────
function addSeguimiento(p) {
  const usuario      = (p.usuario || '').trim();
  const materia       = p.materia || '';
  const calificacionRaw = parseFloat(p.calificacion);
  const calificacion  = (!isNaN(calificacionRaw) && calificacionRaw >= 1 && calificacionRaw <= 5) ? calificacionRaw : '';
  const comentario    = p.comentario || '';
  const autor         = p.autor || 'Directora';
  if (!usuario || !materia || !comentario) return jsonError('Faltan datos');

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(SEGUIMIENTO)
    .appendRow([usuario, materia, calificacion, comentario, autor, new Date().toISOString()]);
  return jsonOk();
}

// ── FILTRO 3: APROBAR / RECHAZAR / PROPONER ALTERNATIVO (desde el admin) ──────
function resolverHorario(p, accion) {
  const usuario = (p.usuario || '').trim();
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(MODELOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('horario_estado') + 1).setValue(accion);
      if (accion === 'alternativa_propuesta') {
        sheet.getRange(rowNum, headers.indexOf('horario_alternativo') + 1).setValue(p.alternativa || '');
      }
      const match = { sheet, headers, rowNum, row: sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0] };
      const estado = recalcularEstadoProceso(match);
      return jsonOk({ estado_proceso: estado });
    }
  }
  return jsonError('Modelo no encontrada');
}

// ── AGENDA: PROPONER OPCIONES / ACEPTAR DIRECTO / ELEGIR / VER AGENDA ──────────
function proponerOpcionesHorario(p) {
  const usuario  = (p.usuario || '').trim();
  const opciones = [p.opcion1, p.opcion2, p.opcion3].filter(Boolean);
  if (!opciones.length) return jsonError('Ingresa al menos una opción');

  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(MODELOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('horario_opciones') + 1).setValue(JSON.stringify(opciones));
      sheet.getRange(rowNum, headers.indexOf('horario_estado') + 1).setValue('propuesto');
      return jsonOk();
    }
  }
  return jsonError('Modelo no encontrada');
}

function aceptarHorarioDirecto(p) {
  const usuario = (p.usuario || '').trim();
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(MODELOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario) {
      sheet.getRange(i + 1, headers.indexOf('horario_estado') + 1).setValue('reservado');
      return jsonOk();
    }
  }
  return jsonError('Modelo no encontrada');
}

function elegirHorario(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const horarioElegido = p.horarioElegido || '';
  if (!horarioElegido) return jsonError('Selecciona un horario');

  match.sheet.getRange(match.rowNum, match.headers.indexOf('horario') + 1).setValue(horarioElegido);
  match.sheet.getRange(match.rowNum, match.headers.indexOf('horario_estado') + 1).setValue('reservado');
  return jsonOk();
}

function getAgenda() {
  const modelos = sheetToObjects(MODELOS);
  const reservados  = modelos.filter(m => m.horario_estado === 'reservado' || m.horario_estado === 'confirmado');
  const pendientes  = modelos.filter(m => m.horario_estado === 'pendiente' || m.horario_estado === 'propuesto');
  return jsonOk({ reservados, pendientes });
}

// ── ACEPTAR MODELO (Filtro 1 → habilita Filtro 2) ─────────────────────────────
function aceptarModelo(p) {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(INSCRIPCIONES);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const rowNum  = parseInt(p.rowNum);

  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');

  const row         = data[rowNum - 1];
  const nombre      = String(row[headers.indexOf('nombre')]      || '');
  const email       = String(row[headers.indexOf('email')]       || '');
  const horario     = String(row[headers.indexOf('horario')]     || '');
  const horarioTipo = String(row[headers.indexOf('horario_tipo')]|| 'finde');
  const mayorEdad   = String(row[headers.indexOf('mayor_edad')]  || 'si');
  const idxHoraSug  = headers.indexOf('hora_sugerida');
  const horaSugerida = idxHoraSug > -1 ? String(row[idxHoraSug] || '') : '';

  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('aceptado');

  const creds = generarCredenciales(nombre);
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + DIAS_LIMITE_PAGO);

  // Fin de semana: horario fijo, queda reservado directo. Entre semana: el admin debe revisarlo desde la Agenda.
  const horarioEstadoInicial = horarioTipo === 'semana' ? 'pendiente' : 'reservado';

  const modelosSheet = ss.getSheetByName(MODELOS);
  modelosSheet.appendRow([
    nombre, email, creds.usuario, creds.pass, mayorEdad, horarioTipo, horario,
    'pendiente', fechaLimite.toISOString(), '',
    '', '', '', '',
    'no', '',
    '', '',
    horarioEstadoInicial, '',
    'filtro2',
    new Date().toISOString(),
    'no', '', '', '', '', '', '',
    horaSugerida, '', 'no', '', ''
  ]);

  if (email) {
    try { enviarEmailAceptado(email, nombre, creds.usuario, creds.pass, fechaLimite); }
    catch (err) { Logger.log('Error email aceptado: ' + err); }
  }

  return jsonOk();
}

// ── RECHAZAR MODELO ───────────────────────────────────────────────────────────
function rechazarModelo(p) {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(INSCRIPCIONES);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const rowNum  = parseInt(p.rowNum);

  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');

  const row    = data[rowNum - 1];
  const nombre = String(row[headers.indexOf('nombre')] || '');
  const email  = String(row[headers.indexOf('email')]  || '');

  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('rechazado');

  if (email) {
    try { enviarEmailRechazado(email, nombre); }
    catch (err) { Logger.log('Error email rechazado: ' + err); }
  }

  return jsonOk();
}

// ── CREDENCIALES ──────────────────────────────────────────────────────────────
function generarCredenciales(nombre) {
  const base    = nombre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    .substring(0, 14);
  const num     = Math.floor(Math.random() * 900) + 100;
  const usuario = base + num;
  let pass = '';
  for (let i = 0; i < 6; i++) pass += Math.floor(Math.random() * 10);
  return { usuario, pass };
}

// ── EMAILS ────────────────────────────────────────────────────────────────────
function enviarEmailAceptado(email, nombre, usuario, pass, fechaLimite) {
  const fechaStr = fechaLimite.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  MailApp.sendEmail({
    to: email,
    subject: '¡Fuiste admitido/a a Inspira Models! — Continúa tu proceso',
    body:
`Hola ${nombre},

¡Te damos la bienvenida a la familia Inspira Models! Tu perfil fue revisado y aprobado por nuestra directora.

TUS CREDENCIALES DE ACCESO AL PORTAL DEL MODELO:
Usuario: ${usuario}
Contraseña: ${pass}

PRÓXIMO PASO:
Ingresa a tu Portal del Modelo desde el sitio web ("Portal Aprendiz") para continuar tu proceso: deberás cargar tus documentos, aceptar el contrato y pagar tu inscripción antes del ${fechaStr} (tienes ${DIAS_LIMITE_PAGO} días). En cuanto completes todo, tu cuenta se activará automáticamente.

Cualquier duda, escríbenos por WhatsApp.

Con cariño,
— Inspira Models · Medellín, Colombia`
  });
}

function enviarEmailRechazado(email, nombre) {
  MailApp.sendEmail({
    to: email,
    subject: 'Respuesta a tu solicitud — Inspira Models',
    body:
`Hola ${nombre},

Gracias por tu interés en Inspira Models y por tomarte el tiempo de enviarnos tu solicitud.

Luego de revisar cuidadosamente tu perfil, en esta ocasión no podemos continuar con tu proceso de admisión. Esto no significa que no tengas el potencial — te animamos a estar atento/a a nuestras próximas convocatorias.

Con cariño,
— Inspira Models · Medellín, Colombia`
  });
}

// ── RESEÑAS (solo modelos con historial verificado pueden publicar) ──────────
function enviarResena(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarUsuarioConHistorial(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let fotoUrl = '';
  try {
    if (p.foto) fotoUrl = saveBase64Image(p.foto, 'resena_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error foto reseña: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(RESENAS).appendRow([
    usuario, match.nombre, match.tipo, p.calificacion || '5', p.comentario || '',
    fotoUrl, 'pendiente', new Date().toISOString()
  ]);
  return jsonOk();
}

// ── HISTORIAS QUE INSPIRAN ──────────────────────────────────────────────────
function enviarHistoria(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarUsuarioConHistorial(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let fotoUrl = '';
  try {
    if (p.foto) fotoUrl = saveBase64Image(p.foto, 'historia_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error foto historia: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(HISTORIAS).appendRow([
    usuario, match.nombre, match.tipo, p.texto || '', fotoUrl, p.videoUrl || '',
    'pendiente', new Date().toISOString()
  ]);
  return jsonOk();
}

// ── NOTICIERO (creado manualmente por el admin) ───────────────────────────────
function crearNoticia(p) {
  let imagenUrl = '';
  try {
    if (p.imagen) imagenUrl = saveBase64Image(p.imagen, 'noticia_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error imagen noticia: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(NOTICIAS).appendRow([
    p.titulo || '', p.resumen || '', imagenUrl, p.link || '', new Date().toISOString()
  ]);
  return jsonOk();
}

// ── TIENDA OFICIAL (creado manualmente por el admin) ───────────────────────────
function crearProducto(p) {
  let imagenUrl = '';
  try {
    if (p.imagen) imagenUrl = saveBase64Image(p.imagen, 'producto_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error imagen producto: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTOS).appendRow([
    p.nombre || '', p.descripcion || '', p.precio || '', imagenUrl, p.categoria || '',
    'si', new Date().toISOString()
  ]);
  return jsonOk();
}

function toggleProducto(p) {
  const rowNum = parseInt(p.rowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTOS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col     = headers.indexOf('disponible') + 1;
  const actual  = sheet.getRange(rowNum, col).getValue();
  sheet.getRange(rowNum, col).setValue(actual === 'si' ? 'no' : 'si');
  return jsonOk();
}

// ── CONTENIDO PÚBLICO PARA LA PÁGINA PRINCIPAL ────────────────────────────────
function getHome() {
  return jsonOk({
    resenas:   sheetToObjects(RESENAS).filter(r => r.estado === 'aprobada'),
    historias: sheetToObjects(HISTORIAS).filter(h => h.estado === 'aprobada'),
    noticias:  sheetToObjects(NOTICIAS),
    productos: sheetToObjects(PRODUCTOS).filter(pr => pr.disponible === 'si')
  });
}

// ── MODERAR RESEÑA / HISTORIA (desde el admin) ────────────────────────────────
function moderarItem(sheetName, p) {
  const rowNum = parseInt(p.rowNum);
  const accion = p.accion;
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue(accion);
  return jsonOk();
}

// ── PORTAL DE PROFESORES ───────────────────────────────────────────────────────
function buscarFilaProfesor(usuario, password) {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(PROFESORES);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');
  const idxP    = headers.indexOf('contrasena');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario && String(data[i][idxP]) === password) {
      return { sheet, headers, rowNum: i + 1, row: data[i] };
    }
  }
  return null;
}

function crearProfesorConCredenciales(p) {
  const creds = generarCredenciales(p.nombre || 'profesor');
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(PROFESORES).appendRow([
    p.nombre||'', p.documento||'', p.especialidad||'', p.materias||'', p.email||'', p.telefono||'',
    creds.usuario, creds.pass, p.bio||'', 'Activo', new Date().toISOString()
  ]);
  if (p.email) {
    try { enviarEmailProfesor(p.email, p.nombre, creds.usuario, creds.pass); }
    catch (err) { Logger.log('Error email profesor: ' + err); }
  }
  return jsonOk();
}

function enviarEmailProfesor(email, nombre, usuario, pass) {
  MailApp.sendEmail({
    to: email,
    subject: 'Bienvenido/a al equipo docente de Inspira Models',
    body:
`Hola ${nombre},

Has sido registrado/a como profesor/a en Inspira Models.

TUS CREDENCIALES DE ACCESO AL PORTAL DE PROFESORES:
Usuario: ${usuario}
Contraseña: ${pass}

Ingresa desde el sitio web en "Portal Profesores" para ver tus estudiantes, calificar, registrar asistencia, revisar excusas y subir talleres.

Con cariño,
— Inspira Models · Medellín, Colombia`
  });
}

function loginProfesor(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  if (!usuario || !password) return jsonError('Usuario y contraseña requeridos');

  const match = buscarFilaProfesor(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const profesor = filaAObjeto(match.headers, match.row);
  delete profesor.contrasena;

  const estudiantes        = sheetToObjects(MODELOS).filter(m => m.estado_proceso === 'activo');
  const excusasPendientes  = sheetToObjects(EXCUSAS).filter(ex => ex.estado === 'pendiente');
  const talleres           = sheetToObjects(TALLERES).filter(t => t.usuario_profesor === usuario);
  const actividades        = sheetToObjects(ACTIVIDADES).filter(a => a.usuario_profesor === usuario);
  const seguimientoPropio  = sheetToObjects(SEGUIMIENTO).filter(s => s.autor === profesor.nombre);

  return jsonOk({ profesor, estudiantes, excusasPendientes, talleres, actividades, seguimiento: seguimientoPropio });
}

function marcarAsistencia(p) {
  const usuarioProfesor = (p.usuarioProfesor || '').trim();
  let lista;
  try { lista = JSON.parse(p.asistencias); } catch (e) { return jsonError('Datos inválidos'); }
  if (!Array.isArray(lista) || !lista.length) return jsonError('Sin estudiantes seleccionados');

  const fecha = new Date().toISOString().split('T')[0];
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ASISTENCIA);
  lista.forEach(item => {
    sheet.appendRow([usuarioProfesor, item.usuario, item.nombre, fecha, item.estado]);
  });
  return jsonOk();
}

function subirExcusa(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');
  const modelo = filaAObjeto(match.headers, match.row);

  let url = '';
  try {
    if (p.archivo) url = saveBase64Image(p.archivo, 'excusa_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error archivo excusa: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(EXCUSAS).appendRow([
    usuario, modelo.nombre, p.motivo || '', url, 'pendiente', new Date().toISOString()
  ]);
  return jsonOk();
}

function revisarExcusa(p) {
  const rowNum = parseInt(p.rowNum);
  const accion = p.accion;
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EXCUSAS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue(accion);
  return jsonOk();
}

function crearTaller(p) {
  let archivoUrl = '';
  try {
    if (p.archivo) archivoUrl = saveBase64Image(p.archivo, 'taller_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error archivo taller: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(TALLERES).appendRow([
    p.usuarioProfesor || '', p.nombreProfesor || '', p.materia || '', p.titulo || '',
    p.descripcion || '', archivoUrl || p.link || '', new Date().toISOString()
  ]);
  return jsonOk();
}

function crearActividad(p) {
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(ACTIVIDADES).appendRow([
    p.usuarioProfesor || '', p.nombreProfesor || '', p.titulo || '', p.descripcion || '',
    p.fechaActividad || '', new Date().toISOString()
  ]);
  return jsonOk();
}

// ── EMPRESAS: REGISTRO Y PORTAL ────────────────────────────────────────────────
function buscarFilaEmpresa(usuario, password) {
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(EMPRESAS_REGISTRO);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');
  const idxP    = headers.indexOf('contrasena');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario && String(data[i][idxP]) === password) {
      return { sheet, headers, rowNum: i + 1, row: data[i] };
    }
  }
  return null;
}

// Verifica historial en el sistema (modelo o empresa) — usado para reseñas/historias
function buscarUsuarioConHistorial(usuario, password) {
  const m = buscarFilaModelo(usuario, password);
  if (m) return Object.assign({ tipo: 'Modelo', nombre: filaAObjeto(m.headers, m.row).nombre }, m);
  const e = buscarFilaEmpresa(usuario, password);
  if (e) return Object.assign({ tipo: 'Empresa', nombre: filaAObjeto(e.headers, e.row).razon_social }, e);
  return null;
}

function registrarEmpresa(p) {
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRESAS_REGISTRO).appendRow([
    p.razonSocial || '', p.nombreRepresentante || '', p.camaraComercio || '', p.rut || '', p.documento || '',
    p.email || '', p.whatsapp || '', p.telefono || '', p.instagram || '', p.paginaWeb || '',
    p.descripcion || '', p.actividadEconomica || '', p.serviciosRequeridos || '',
    '', '', 'pendiente', new Date().toISOString()
  ]);
  return jsonOk();
}

function aceptarEmpresa(p) {
  const rowNum = parseInt(p.rowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRESAS_REGISTRO);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row     = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  const razonSocial = row[headers.indexOf('razon_social')];
  const email        = row[headers.indexOf('email')];

  const creds = generarCredenciales(razonSocial);
  sheet.getRange(rowNum, headers.indexOf('usuario') + 1).setValue(creds.usuario);
  sheet.getRange(rowNum, headers.indexOf('contrasena') + 1).setValue(creds.pass);
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('aceptado');

  if (email) {
    try { enviarEmailEmpresaAceptada(email, razonSocial, creds.usuario, creds.pass); }
    catch (err) { Logger.log('Error email empresa: ' + err); }
  }
  return jsonOk();
}

function rechazarEmpresa(p) {
  const rowNum = parseInt(p.rowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRESAS_REGISTRO);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('rechazado');
  return jsonOk();
}

function enviarEmailEmpresaAceptada(email, razonSocial, usuario, pass) {
  MailApp.sendEmail({
    to: email,
    subject: '¡Bienvenidos al Portal de Empresas de Inspira Models!',
    body:
`Hola equipo de ${razonSocial},

Su registro como empresa aliada de Inspira Models fue aprobado.

CREDENCIALES DE ACCESO AL PORTAL DE EMPRESAS:
Usuario: ${usuario}
Contraseña: ${pass}

Ingresen desde el sitio web en "Portal Empresas" para solicitar talentos, ver promociones, consultar el estado de sus procesos y publicar reseñas.

— Inspira Models · Medellín, Colombia`
  });
}

function loginEmpresa(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  if (!usuario || !password) return jsonError('Usuario y contraseña requeridos');

  const match = buscarFilaEmpresa(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const empresa = filaAObjeto(match.headers, match.row);
  delete empresa.contrasena;

  const resenas      = sheetToObjects(RESENAS).filter(r => r.usuario === usuario);
  const historias    = sheetToObjects(HISTORIAS).filter(h => h.usuario === usuario);
  const solicitudes  = sheetToObjects(SOLICITUDES_MARCAS).filter(s => s.usuario_empresa === usuario);
  const cotizaciones = sheetToObjects(COTIZACIONES).filter(c => c.usuario_empresa === usuario);
  const productos    = sheetToObjects(PRODUCTOS).filter(pr => pr.disponible === 'si');

  return jsonOk({ empresa, resenas, historias, solicitudes, cotizaciones, productos });
}

// ── CURSOS Y COTIZACIONES (con radicado) ───────────────────────────────────────
function generarRadicado() {
  const fecha = Utilities.formatDate(new Date(), 'America/Bogota', 'yyMMdd');
  const num   = Math.floor(Math.random() * 900) + 100;
  return 'INS-' + fecha + '-' + num;
}

function solicitarCotizacion(p) {
  const radicado = generarRadicado();
  SpreadsheetApp.openById(SHEET_ID).getSheetByName(COTIZACIONES).appendRow([
    radicado, p.nombre || '', p.email || '', p.telefono || '', p.curso || '', p.fechaDeseada || '',
    p.lugar || '', p.modalidad || '', p.numPersonas || '', p.horas || '', p.observaciones || '',
    'pendiente', '', '', '', '', p.usuarioEmpresa || '', new Date().toISOString()
  ]);
  if (p.email) {
    try { enviarEmailRadicado(p.email, p.nombre, radicado); }
    catch (err) { Logger.log('Error email radicado: ' + err); }
  }
  return jsonOk({ radicado });
}

function enviarEmailRadicado(email, nombre, radicado) {
  MailApp.sendEmail({
    to: email,
    subject: 'Tu número de radicado — Inspira Models',
    body:
`Hola ${nombre},

Recibimos tu solicitud de curso/cotización.

TU NÚMERO DE RADICADO: ${radicado}

Guárdalo — con él puedes consultar el estado de tu proceso en cualquier momento desde "Revisar Procesos" en nuestro sitio web.

Te contactaremos pronto con la cotización.

— Inspira Models · Medellín, Colombia`
  });
}

function consultarRadicado(p) {
  const radicado = (p.radicado || '').trim();
  if (!radicado) return jsonError('Ingresa un radicado');
  const match = sheetToObjects(COTIZACIONES).find(r => r.radicado === radicado);
  if (!match) return jsonError('Radicado no encontrado');
  return jsonOk({ cotizacion: match });
}

function subirComprobanteCotizacion(p) {
  const radicado = (p.radicado || '').trim();
  const sheet    = SpreadsheetApp.openById(SHEET_ID).getSheetByName(COTIZACIONES);
  const data     = sheet.getDataRange().getValues();
  const headers  = data[0];
  const idxRad   = headers.indexOf('radicado');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxRad]) === radicado) {
      let url = '';
      try {
        if (p.comprobante) url = saveBase64Image(p.comprobante, 'cotiz_' + radicado + '_' + Date.now() + '.jpg');
      } catch (err) { Logger.log('Error comprobante cotización: ' + err); }
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('comprobante_50_url') + 1).setValue(url);
      sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('confirmado');
      return jsonOk();
    }
  }
  return jsonError('Radicado no encontrado');
}

function cotizar(p) {
  const radicado = (p.radicado || '').trim();
  const sheet    = SpreadsheetApp.openById(SHEET_ID).getSheetByName(COTIZACIONES);
  const data     = sheet.getDataRange().getValues();
  const headers  = data[0];
  const idxRad   = headers.indexOf('radicado');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxRad]) === radicado) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('valor_cotizado') + 1).setValue(p.valor || '');
      sheet.getRange(rowNum, headers.indexOf('comentario_admin') + 1).setValue(p.comentario || '');
      sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('cotizado');
      const email  = data[i][headers.indexOf('email')];
      const nombre = data[i][headers.indexOf('nombre')];
      if (email) {
        try { enviarEmailCotizacion(email, nombre, radicado, p.valor); }
        catch (err) { Logger.log('Error email cotización: ' + err); }
      }
      return jsonOk();
    }
  }
  return jsonError('Radicado no encontrado');
}

function enviarEmailCotizacion(email, nombre, radicado, valor) {
  MailApp.sendEmail({
    to: email,
    subject: 'Tu cotización está lista — Inspira Models',
    body:
`Hola ${nombre},

Ya preparamos la cotización para tu solicitud (radicado ${radicado}).

Valor: $${valor}

Ingresa a "Revisar Procesos" en nuestro sitio con tu radicado para ver el detalle completo y confirmar subiendo el comprobante del 50% inicial.

— Inspira Models · Medellín, Colombia`
  });
}

function asignarProfesorCotizacion(p) {
  const radicado = (p.radicado || '').trim();
  const sheet    = SpreadsheetApp.openById(SHEET_ID).getSheetByName(COTIZACIONES);
  const data     = sheet.getDataRange().getValues();
  const headers  = data[0];
  const idxRad   = headers.indexOf('radicado');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxRad]) === radicado) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('profesor_asignado') + 1).setValue(p.profesor || '');
      sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('agendado');
      return jsonOk();
    }
  }
  return jsonError('Radicado no encontrado');
}

function rechazarCotizacion(p) {
  const radicado = (p.radicado || '').trim();
  const sheet    = SpreadsheetApp.openById(SHEET_ID).getSheetByName(COTIZACIONES);
  const data     = sheet.getDataRange().getValues();
  const headers  = data[0];
  const idxRad   = headers.indexOf('radicado');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxRad]) === radicado) {
      sheet.getRange(i + 1, headers.indexOf('estado') + 1).setValue('rechazado');
      return jsonOk();
    }
  }
  return jsonError('Radicado no encontrado');
}

// ── CATÁLOGO Y AGENDA LABORAL ──────────────────────────────────────────────────
function toggleAgencia(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');
  match.sheet.getRange(match.rowNum, match.headers.indexOf('quiere_agencia') + 1).setValue(p.quiere === 'si' ? 'si' : 'no');
  return jsonOk();
}

function actualizarPerfilCatalogo(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const campos = {
    nombre_artistico: p.nombreArtistico, estatura: p.estatura, tallas: p.tallas,
    medidas: p.medidas, ciudad_catalogo: p.ciudadCatalogo, disponibilidad: p.disponibilidad
  };
  Object.keys(campos).forEach(key => {
    if (campos[key] !== undefined) {
      match.sheet.getRange(match.rowNum, match.headers.indexOf(key) + 1).setValue(campos[key] || '');
    }
  });
  return jsonOk();
}

function getCatalogo() {
  const modelos = sheetToObjects(MODELOS).filter(m => m.quiere_agencia === 'si' && m.estado_proceso === 'activo');
  const conGaleria = modelos.map(m => {
    const fotos = sheetToObjects(GALERIA).filter(g => g.usuario === m.usuario).map(f => f.foto_url);
    return Object.assign({}, m, { fotos });
  });
  return jsonOk({ catalogo: conGaleria });
}

function crearConvocatoria(p) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(CONVOCATORIAS);
  sheet.appendRow([p.marca || '', p.cliente || '', p.fecha || '', p.lugar || '', p.hora || '', p.pago || '', p.requisitos || '', 'abierta', new Date().toISOString()]);
  const convocatoriaRowNum = sheet.getLastRow();

  const elegibles = sheetToObjects(MODELOS).filter(m => m.quiere_agencia === 'si' && m.estado_proceso === 'activo');
  const respSheet = ss.getSheetByName(CONVOCATORIA_RESPUESTAS);
  elegibles.forEach(m => {
    respSheet.appendRow([convocatoriaRowNum, m.usuario, m.nombre, p.marca || '', p.fecha || '', 'pendiente', '']);
  });
  return jsonOk({ notificadas: elegibles.length });
}

function responderConvocatoria(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  const rowNum = parseInt(p.respuestaRowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('Solicitud inválida');

  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONVOCATORIA_RESPUESTAS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue(p.estado);
  sheet.getRange(rowNum, headers.indexOf('fecha_respuesta') + 1).setValue(new Date().toISOString());
  return jsonOk();
}

function actualizarEstadoConvocatoria(p) {
  const rowNum = parseInt(p.respuestaRowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('Solicitud inválida');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONVOCATORIA_RESPUESTAS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue(p.estado);
  return jsonOk();
}

// ── PORTAL DE EMPRENDIMIENTOS ──────────────────────────────────────────────────
function crearEmprendimientoModelo(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const match = buscarFilaModelo(usuario, password);
  if (!match) return jsonError('Usuario o contraseña incorrectos');

  let logoUrl = '';
  try {
    if (p.logo) logoUrl = saveBase64Image(p.logo, 'logo_' + usuario + '_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error logo emprendimiento: ' + err); }

  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, headers.indexOf('nombre_negocio') + 1).setValue(p.nombreNegocio || '');
      sheet.getRange(rowNum, headers.indexOf('descripcion') + 1).setValue(p.descripcion || '');
      sheet.getRange(rowNum, headers.indexOf('categoria') + 1).setValue(p.categoria || '');
      sheet.getRange(rowNum, headers.indexOf('contacto') + 1).setValue(p.contacto || '');
      if (logoUrl) sheet.getRange(rowNum, headers.indexOf('logo_url') + 1).setValue(logoUrl);
      return jsonOk({ rowNum });
    }
  }

  sheet.appendRow([usuario, 'modelo', p.nombreNegocio || '', logoUrl, p.descripcion || '', p.categoria || '', p.contacto || '', '', 'aprobado', '', '', new Date().toISOString()]);
  return jsonOk({ rowNum: sheet.getLastRow() });
}

function solicitarEmprendimientoExterno(p) {
  let logoUrl = '';
  try {
    if (p.logo) logoUrl = saveBase64Image(p.logo, 'logo_externo_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error logo emprendimiento externo: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTOS).appendRow([
    '', 'externo', p.nombreNegocio || '', logoUrl, p.descripcion || '', p.categoria || '', p.contacto || '', p.email || '',
    'pendiente', '', '', new Date().toISOString()
  ]);
  return jsonOk();
}

function aceptarEmprendimiento(p) {
  const rowNum = parseInt(p.rowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTOS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row     = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  const tipo    = row[headers.indexOf('tipo')];

  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('aprobado');

  if (tipo === 'externo') {
    const nombreNegocio = row[headers.indexOf('nombre_negocio')];
    const email = row[headers.indexOf('email')];
    const creds = generarCredenciales(nombreNegocio);
    sheet.getRange(rowNum, headers.indexOf('usuario_externo') + 1).setValue(creds.usuario);
    sheet.getRange(rowNum, headers.indexOf('contrasena_externo') + 1).setValue(creds.pass);
    if (email) {
      try { enviarEmailEmprendimiento(email, nombreNegocio, creds.usuario, creds.pass); }
      catch (err) { Logger.log('Error email emprendimiento: ' + err); }
    }
  }
  return jsonOk();
}

function rechazarEmprendimiento(p) {
  const rowNum = parseInt(p.rowNum);
  if (isNaN(rowNum) || rowNum < 2) return jsonError('rowNum inválido');
  const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTOS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(rowNum, headers.indexOf('estado') + 1).setValue('rechazado');
  return jsonOk();
}

function enviarEmailEmprendimiento(email, nombreNegocio, usuario, pass) {
  MailApp.sendEmail({
    to: email,
    subject: '¡Tu emprendimiento fue aprobado! — Inspira Models',
    body:
`Hola,

Tu emprendimiento "${nombreNegocio}" fue aprobado para el Portal de Emprendimientos Inspira.

CREDENCIALES DE ACCESO:
Usuario: ${usuario}
Contraseña: ${pass}

Ingresa desde el sitio web en "Emprendimientos" para gestionar tus productos.

— Inspira Models · Medellín, Colombia`
  });
}

function loginEmprendedor(p) {
  const usuario  = (p.usuario  || '').trim();
  const password = (p.password || '').trim();
  const ss      = SpreadsheetApp.openById(SHEET_ID);
  const sheet   = ss.getSheetByName(EMPRENDIMIENTOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxU    = headers.indexOf('usuario_externo');
  const idxP    = headers.indexOf('contrasena_externo');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxU]) === usuario && String(data[i][idxP]) === password) {
      const emp = filaAObjeto(headers, data[i]);
      delete emp.contrasena_externo;
      const rowNum = i + 1;
      const productos = sheetToObjects(EMPRENDIMIENTO_PRODUCTOS).filter(pr => parseInt(pr.emprendimiento_rowNum) === rowNum);
      return jsonOk({ emprendimiento: emp, rowNum, productos });
    }
  }
  return jsonError('Usuario o contraseña incorrectos');
}

function agregarProductoEmprendimiento(p) {
  let rowNum;
  if (p.usuario && p.password && !p.rowNum) {
    const match = buscarFilaModelo(p.usuario, p.password);
    if (!match) return jsonError('Usuario o contraseña incorrectos');
    const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTOS);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idxU    = headers.indexOf('usuario');
    let found = null;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idxU]) === p.usuario) { found = i + 1; break; }
    }
    if (!found) return jsonError('Primero crea tu emprendimiento');
    rowNum = found;
  } else {
    rowNum = parseInt(p.rowNum);
    if (isNaN(rowNum)) return jsonError('Emprendimiento inválido');
  }

  let fotoUrl = '';
  try {
    if (p.foto) fotoUrl = saveBase64Image(p.foto, 'prod_emp_' + Date.now() + '.jpg');
  } catch (err) { Logger.log('Error foto producto emprendimiento: ' + err); }

  SpreadsheetApp.openById(SHEET_ID).getSheetByName(EMPRENDIMIENTO_PRODUCTOS).appendRow([
    rowNum, p.nombre || '', p.descripcion || '', p.precio || '', p.cantidad || '', fotoUrl, new Date().toISOString()
  ]);
  return jsonOk();
}

function getEmprendimientos() {
  const aprobados = sheetToObjects(EMPRENDIMIENTOS).filter(e => e.estado === 'aprobado');
  const conProductos = aprobados.map(e => {
    const productos = sheetToObjects(EMPRENDIMIENTO_PRODUCTOS).filter(pr => parseInt(pr.emprendimiento_rowNum) === e._rowNum);
    return Object.assign({}, e, { productos });
  });
  return jsonOk({ emprendimientos: conProductos });
}

// ── NOTICIERO AUTOMÁTICO (toma noticias reales de Google News, sin IA de pago) ─
function actualizarNoticiero() {
  const query = encodeURIComponent('modelaje OR pasarela OR "Miss Universo" OR "Fashion Week" OR "Miss Grand" OR moda Colombia');
  const url   = `https://news.google.com/rss/search?q=${query}&hl=es-419&gl=CO&ceid=CO:es-419`;

  try {
    const response = UrlFetchApp.fetch(url);
    const xml     = XmlService.parse(response.getContentText());
    const channel = xml.getRootElement().getChild('channel');
    const items   = channel.getChildren('item');

    const sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(NOTICIAS);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idxLink = headers.indexOf('link');
    const linksExistentes = data.slice(1).map(row => row[idxLink]);

    let nuevas = 0;
    for (let i = 0; i < items.length && nuevas < 8; i++) {
      const item  = items[i];
      const titulo = item.getChild('title') ? item.getChild('title').getText() : '';
      const link   = item.getChild('link')  ? item.getChild('link').getText()  : '';
      const pubDate = item.getChild('pubDate') ? item.getChild('pubDate').getText() : '';
      if (!link || linksExistentes.indexOf(link) !== -1) continue;

      const descRaw = item.getChild('description') ? item.getChild('description').getText() : '';
      const resumen = descRaw.replace(/<[^>]+>/g, '').substring(0, 220);
      const fecha   = pubDate ? new Date(pubDate) : new Date();

      sheet.appendRow([titulo, resumen, '', link, fecha.toISOString()]);
      nuevas++;
    }

    limpiarNoticiasViejas();
    Logger.log('✅ Noticias nuevas agregadas: ' + nuevas);
  } catch (err) {
    Logger.log('Error actualizando noticiero: ' + err);
  }
}

function limpiarNoticiasViejas() {
  const MAX = 40;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(NOTICIAS);
  const lastRow = sheet.getLastRow();
  if (lastRow - 1 > MAX) {
    sheet.deleteRows(2, (lastRow - 1) - MAX);
  }
}

// Ejecutar UNA VEZ para activar la actualización automática cada 6 horas
function configurarTriggerNoticiero() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'actualizarNoticiero') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('actualizarNoticiero').timeBased().everyHours(6).create();
  Logger.log('✅ Noticiero automático activado: se actualizará solo cada 6 horas');
}

// ── SETUP (ejecutar una vez después de cada cambio de columnas) ───────────────
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = {
    'inscripciones':      ['tipo','nombre','fecha_nacimiento','documento','edad','email','wpp','ciudad','horario_tipo','horario','experiencia','mayor_edad','acud_nombre','acud_cc','acud_tel','foto_completa','foto_medio','estado','created_at','hora_sugerida'],
    'solicitudes_marcas': ['empresa','contacto','contactoInfo','tipoCampana','mensaje','created_at'],
    'solicitudes_grupo':  ['nombre','wpp','tipo','personas','created_at'],
    'profesores':         ['nombre','documento','especialidad','materias','email','telefono','usuario','contrasena','bio','estado','created_at'],
    'modelos':            ['nombre','email','usuario','contrasena','mayor_edad','horario_tipo','horario','estado_pago','fecha_limite_pago','comprobante_pago_url','doc_cedula_url','doc_eps_url','doc_menor_url','doc_acudiente_cc_url','contrato_aceptado','contrato_fecha','abono_valor','abono_url','horario_estado','horario_alternativo','estado_proceso','created_at','quiere_agencia','nombre_artistico','estatura','tallas','medidas','ciudad_catalogo','disponibilidad','hora_sugerida','horario_opciones','mensualidad_inicial_pagada','mensualidad_inicial_url','fecha_limite_mensualidad'],
    'seguimiento':        ['usuario','materia','calificacion','comentario','autor','fecha'],
    'galeria':            ['usuario','foto_url','fecha'],
    'resenas':            ['usuario','nombre','tipo_usuario','calificacion','comentario','foto_url','estado','created_at'],
    'historias':          ['usuario','nombre','tipo_usuario','texto','foto_url','video_url','estado','created_at'],
    'noticias':           ['titulo','resumen','imagen_url','link','created_at'],
    'productos':          ['nombre','descripcion','precio','imagen_url','categoria','disponible','created_at'],
    'asistencia':         ['usuario_profesor','usuario_modelo','nombre_modelo','fecha','estado'],
    'excusas':            ['usuario','nombre','motivo','archivo_url','estado','created_at'],
    'talleres':           ['usuario_profesor','nombre_profesor','materia','titulo','descripcion','archivo_url','created_at'],
    'actividades':        ['usuario_profesor','nombre_profesor','titulo','descripcion','fecha_actividad','created_at'],
    'empresas_registro':  ['razon_social','nombre_representante','camara_comercio','rut','documento','email','whatsapp','telefono','instagram','pagina_web','descripcion','actividad_economica','servicios_requeridos','usuario','contrasena','estado','created_at'],
    'cotizaciones':       ['radicado','nombre','email','telefono','curso','fecha_deseada','lugar','modalidad','num_personas','horas','observaciones','estado','valor_cotizado','comentario_admin','comprobante_50_url','profesor_asignado','usuario_empresa','created_at'],
    'convocatorias':            ['marca','cliente','fecha','lugar','hora','pago','requisitos','estado','created_at'],
    'convocatoria_respuestas':  ['convocatoria_rowNum','usuario_modelo','nombre_modelo','marca','fecha_trabajo','estado','fecha_respuesta'],
    'emprendimientos':          ['usuario','tipo','nombre_negocio','logo_url','descripcion','categoria','contacto','email','estado','usuario_externo','contrasena_externo','created_at'],
    'emprendimiento_productos': ['emprendimiento_rowNum','nombre','descripcion','precio','cantidad','foto_url','created_at'],
    'pagos_mensualidad':  ['usuario','nombre','mes','valor','comprobante_url','fecha_pago']
  };
  for (const [name, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  Logger.log('✅ Hojas configuradas correctamente');
}
