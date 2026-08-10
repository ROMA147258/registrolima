/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - SISTEMA DE REGISTRO Y CONTROL ELECTORAL SOMOS PERÚ 2026
 * ==============================================================================
 * 
 * ORDEN OFICIAL DE COLUMNAS EXACTO AL FORMULARIO:
 * 1.  ID
 * 2.  Fecha de Registro
 * 3.  Nombres y Apellidos
 * 4.  D.N.I.
 * 5.  Celular
 * 6.  Correo Electrónico
 * 7.  ¿Usa WhatsApp en su celular?
 * 8.  Número WhatsApp Alterno
 * 9.  Distrito donde Vota
 * 10. Mesa de Sufragio
 * 11. Local de Votación
 * 12. Rol a Desempeñar
 * 13. Distrito Asignado
 * 14. Mesa Asignada
 * 15. Local de Votación Asignado
 * 16. ¿Tiene Experiencia como Personero?
 * 17. ¿Cuenta con Movilidad Propia?
 * 18. ¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?
 * 19. Video
 * 20. PDF
 * 21. Credenciales
 * ==============================================================================
 */

// Lista oficial exacta con las 21 columnas en el orden del formulario
var HEADERS_OFICIALES = [
  "ID",
  "Fecha de Registro",
  "Nombres y Apellidos",
  "D.N.I.",
  "Celular",
  "Correo Electrónico",
  "¿Usa WhatsApp en su celular?",
  "Número WhatsApp Alterno",
  "Distrito donde Vota",
  "Mesa de Sufragio",
  "Local de Votación",
  "Rol a Desempeñar",
  "Distrito Asignado",
  "Mesa Asignada",
  "Local de Votación Asignado",
  "¿Tiene Experiencia como Personero?",
  "¿Cuenta con Movilidad Propia?",
  "¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?",
  "Video",
  "PDF",
  "Credenciales"
];

/**
 * Normaliza cualquier texto quitando acentos, tildes, signos y espacios
 */
function normalizarTexto(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Recibe y registra los datos del formulario web con mapeo dinámico infalible
 */
function doPost(e) {
  // Ejecución manual directa desde el editor de Apps Script
  if (!e || !e.postData || !e.postData.contents) {
    try {
      inicializarHoja();
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Ejecución manual: Hoja 'Registro' y encabezados creados/ordenados con éxito." 
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Error en inicialización manual: " + err.toString() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Soporte CORS
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registro");
    
    if (!sheet) {
      sheet = ss.insertSheet("Registro");
    }
    
    // Si la hoja está vacía, inicializarla
    if (sheet.getLastRow() === 0) {
      inicializarHoja();
      sheet = ss.getSheetByName("Registro");
    }
    
    // Leer encabezados reales existentes en la Fila 1
    var numCols = sheet.getLastColumn();
    if (numCols < HEADERS_OFICIALES.length) {
      inicializarHoja();
      sheet = ss.getSheetByName("Registro");
      numCols = sheet.getLastColumn();
    }
    var currentHeaders = sheet.getRange(1, 1, 1, numCols).getValues()[0];
    
    // Calcular siguiente ID autoincrementable
    var lastRow = sheet.getLastRow();
    var nextId = 1;
    if (lastRow > 1) {
      var lastIdValue = sheet.getRange(lastRow, 1).getValue();
      if (!isNaN(lastIdValue) && lastIdValue !== "") {
        nextId = parseInt(lastIdValue, 10) + 1;
      } else {
        nextId = lastRow;
      }
    }
    
    // Diccionario de mapeo dinámico con todas las combinaciones de nombres
    var fieldMap = {
      // 1 y 2: ID y Fechas
      "id": nextId,
      "fechaderegistro": data.fecha_registro || new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
      "marcatemporal": data.fecha_registro || new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
      
      // 3, 4, 5, 6: Sección 1 - Datos Personales
      "nombresyapellidos": data.nombres || "",
      "nombres": data.nombres || "",
      "dni": data.dni || "",
      "celular": data.celular || data.numero_celular || "",
      "numerodecelular": data.celular || data.numero_celular || "",
      "nmerodecelular": data.celular || data.numero_celular || "",
      "correoelectronico": data.correo || data.correo_electronico || "",
      "correo": data.correo || data.correo_electronico || "",
      "correoelectrnico": data.correo || data.correo_electronico || "",
      
      // 7 y 8: WhatsApp
      "usawhatsappensucelular": data.usa_whatsapp || "Sí",
      "usawhatsapp": data.usa_whatsapp || "Sí",
      "numerowhatsappalterno": data.whatsapp_otro || "Mismo número",
      "whatsappalterno": data.whatsapp_otro || "Mismo número",
      
      // 9, 10, 11: Sección 2 - Mi Lugar de Votación (DNI)
      "distritodondevota": data.distrito || data.distrito_votacion || "",
      "distritodevotacion": data.distrito || data.distrito_votacion || "",
      "distrito": data.distrito || data.distrito_votacion || "",
      "mesadesufragio": data.mesa || data.mesa_electoral || data.mesa_sufragio || "",
      "mesasufragio": data.mesa || data.mesa_electoral || data.mesa_sufragio || "",
      "mesaelectoral": data.mesa || data.mesa_electoral || data.mesa_sufragio || "",
      "mesa": data.mesa || data.mesa_electoral || data.mesa_sufragio || "",
      "localdevotacion": data.centro || data.centro_votacion || data.local_votacion || "",
      "localdevotacin": data.centro || data.centro_votacion || data.local_votacion || "",
      "centrodevotacion": data.centro || data.centro_votacion || data.local_votacion || "",
      "centro": data.centro || data.centro_votacion || data.local_votacion || "",
      "local": data.centro || data.centro_votacion || data.local_votacion || "",
      
      // 12, 13, 14, 15: Sección 3 - Rol y Asignación Electoral
      "roladesempenar": data.rol_electoral || "Personero de Mesa",
      "rolelectoral": data.rol_electoral || "Personero de Mesa",
      "rol": data.rol_electoral || "Personero de Mesa",
      "distritoasignado": data.distrito_asignado || data.distrito || "",
      "mesaasignada": data.mesa_asignada || data.mesa || "",
      "mesadesufragioasignada": data.mesa_asignada || data.mesa || "",
      "localdevotacionasignado": data.centro_asignado || data.centro || "",
      "localasignado": data.centro_asignado || data.centro || "",
      "centroasignado": data.centro_asignado || data.centro || "",
      
      // 16, 17, 18: Sección 4 - Compromiso y Logística (Botones)
      "tieneexperienciacomopersonero": data.experiencia_personero || "No",
      "experienciacomopersonero": data.experiencia_personero || "No",
      "experiencia": data.experiencia_personero || "No",
      
      "cuentaconmovilidadpropia": data.movilidad_propia || "No",
      "movilidadpropia": data.movilidad_propia || "No",
      "movilidad": data.movilidad_propia || "No",
      
      "secomprometeacolaborarel4deoctubredel2026enlaselecciones": data.compromiso_2da_vuelta || "Sí",
      "compromiso4deoctubredel2026enlaselecciones": data.compromiso_2da_vuelta || "Sí",
      "compromiso2davuelta2026": data.compromiso_2da_vuelta || "Sí",
      "compromiso": data.compromiso_2da_vuelta || "Sí",
      
      // 19, 20, 21: Control del Sistema
      "video": 0,
      "pdf": 0,
      "credenciales": "Bloqueado"
    };

    // Construir la fila respetando dinámicamente cada columna de Google Sheets
    var rowData = [];
    for (var c = 0; c < currentHeaders.length; c++) {
      var headerClean = normalizarTexto(currentHeaders[c]);
      var value = (fieldMap[headerClean] !== undefined) ? fieldMap[headerClean] : "";
      rowData.push(value);
    }
    
    sheet.appendRow(rowData);
    
    // Formatear celda de Credenciales
    var colCred = currentHeaders.map(normalizarTexto).indexOf("credenciales") + 1;
    if (colCred > 0) {
      formatearCeldaCredenciales(sheet, sheet.getLastRow(), colCred, "Bloqueado");
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Registro guardado exitosamente en Google Sheets", 
      id: nextId 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Soporte Preflight OPTIONS para CORS
 */
function doOptions(e) {
  var output = ContentService.createTextOutput();
  return output.setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Consulta de datos para Dashboard, Login y Progreso de Capacitación
 */
function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registro");
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Hoja 'Registro' no encontrada" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Acción: Login optimizado por DNI
    if (action === "login") {
      var dni = e && e.parameter && e.parameter.dni;
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No hay registros" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var headers = rows[0].map(normalizarTexto);
      var idxDni = headers.indexOf("dni");
      if (idxDni === -1) idxDni = 3;
      
      var targetRow = -1;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][idxDni]).trim() === String(dni).trim()) {
          targetRow = i;
          break;
        }
      }
      
      if (targetRow === -1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Usuario no encontrado" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var userRecord = {};
      var rawHeaders = rows[0];
      for (var j = 0; j < rawHeaders.length; j++) {
        userRecord[rawHeaders[j]] = rows[targetRow][j];
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", user: userRecord }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Acción: Actualizar progreso de Video / PDF
    if (action === "update_progress") {
      var dni = e && e.parameter && e.parameter.dni;
      var type = e && e.parameter && e.parameter.type;
      
      var rows = sheet.getDataRange().getValues();
      var headers = rows[0].map(normalizarTexto);
      var idxDni = headers.indexOf("dni");
      var idxVideo = headers.indexOf("video");
      var idxPdf = headers.indexOf("pdf");
      var idxCredenciales = headers.indexOf("credenciales");
      
      var targetRow = -1;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][idxDni]).trim() === String(dni).trim()) {
          targetRow = i + 1;
          break;
        }
      }
      
      if (targetRow === -1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Usuario con DNI " + dni + " no encontrado" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var clientCurrent = (e && e.parameter && e.parameter.current !== undefined) ? parseInt(e.parameter.current, 10) : -1;
      
      var valVideo = sheet.getRange(targetRow, idxVideo + 1).getValue();
      var currentVideo = (valVideo === "" || isNaN(valVideo)) ? 0 : parseInt(valVideo, 10);
      
      var valPdf = sheet.getRange(targetRow, idxPdf + 1).getValue();
      var currentPdf = (valPdf === "" || isNaN(valPdf)) ? 0 : parseInt(valPdf, 10);
      
      if (type === 'video') {
        var nextVideo = (clientCurrent !== -1) ? (clientCurrent < 2 ? clientCurrent + 1 : 2) : (currentVideo + 1);
        currentVideo = Math.max(currentVideo, nextVideo);
        if (currentVideo > 2) currentVideo = 2;
      } else if (type === 'pdf') {
        var nextPdf = (clientCurrent !== -1) ? (clientCurrent < 2 ? clientCurrent + 1 : 2) : (currentPdf + 1);
        currentPdf = Math.max(currentPdf, nextPdf);
        if (currentPdf > 2) currentPdf = 2;
      }
      
      var credencialesStatus = (currentVideo >= 2 && currentPdf >= 2) ? "Confirmado" : "Bloqueado";
      
      sheet.getRange(targetRow, idxVideo + 1).setValue(currentVideo);
      sheet.getRange(targetRow, idxPdf + 1).setValue(currentPdf);
      sheet.getRange(targetRow, idxCredenciales + 1).setValue(credencialesStatus);
      formatearCeldaCredenciales(sheet, targetRow, idxCredenciales + 1, credencialesStatus);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        video: currentVideo, 
        pdf: currentPdf, 
        credenciales: credencialesStatus 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Acción: Leer todos los registros para el Dashboard
    if (action === "read" || !action) {
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var headersRow = rows[0];
      var data = [];
      
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var record = {};
        for (var j = 0; j < headersRow.length; j++) {
          record[headersRow[j]] = row[j];
        }
        data.push(record);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "running", 
      message: "Sistema Somos Perú Activo." 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menú superior en Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('★ Somos Perú 2026 ★')
        .addItem('📌 Inicializar / Reordenar Encabezados', 'inicializarHoja')
        .addItem('🎨 Reparar Formatos de Colores', 'repararFormatos')
        .addToUi();
  } catch (e) {
    Logger.log("onOpen ejecutado.");
  }
}

/**
 * Crea o actualiza la Fila 1 con los 21 encabezados oficiales en el orden exacto del formulario
 */
function inicializarHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registro");
  
  if (!sheet) {
    sheet = ss.insertSheet("Registro");
  }
  
  sheet.getRange(1, 1, 1, HEADERS_OFICIALES.length).setValues([HEADERS_OFICIALES]);
  
  sheet.getRange(1, 1, 1, HEADERS_OFICIALES.length)
    .setFontWeight("bold")
    .setFontFamily("Calibri")
    .setFontSize(10)
    .setBackground("#0284c7") // Celeste Somos Perú
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(false);
  
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
  
  for (var c = 1; c <= HEADERS_OFICIALES.length; c++) {
    sheet.autoResizeColumn(c);
  }
  
  try {
    SpreadsheetApp.getUi().alert("¡Éxito! Hoja 'Registro' inicializada con los 21 encabezados en el orden exacto del formulario.");
  } catch (e) {
    Logger.log("Hoja 'Registro' inicializada con encabezados oficiales.");
  }
}

/**
 * Repara el coloreado de la columna Credenciales
 */
function repararFormatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registro");
  if (!sheet) return;
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizarTexto);
  var colCred = headers.indexOf("credenciales") + 1;
  
  if (colCred > 0) {
    var credRange = sheet.getRange(2, colCred, lastRow - 1, 1).getValues();
    for (var i = 0; i < credRange.length; i++) {
      var row = i + 2;
      var status = credRange[i][0];
      formatearCeldaCredenciales(sheet, row, colCred, status);
    }
  }
}

/**
 * Colorea celda Credenciales: Verde si confirmado, Rojo claro si bloqueado
 */
function formatearCeldaCredenciales(sheet, rowNumber, colIndex, status) {
  var cell = sheet.getRange(rowNumber, colIndex);
  if (status === "Confirmado" || status === "Desbloqueado" || status === "Completado") {
    cell.setBackground("#d1fae5")
        .setFontColor("#065f46")
        .setFontWeight("bold")
        .setHorizontalAlignment("center");
  } else {
    cell.setBackground("#fee2e2")
        .setFontColor("#991b1b")
        .setFontWeight("bold")
        .setHorizontalAlignment("center");
  }
}
