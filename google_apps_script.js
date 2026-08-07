/**
 * Google Apps Script para registrar los datos del formulario de Personeros.
 * 
 * Instrucciones:
 * 1. Abre tu hoja de Google Sheets.
 * 2. Ve a 'Extensiones' -> 'Apps Script'.
 * 3. Borra el código existente y pega este script.
 * 4. Guarda el proyecto (clic en el icono de guardar).
 * 5. Haz clic en 'Implementar' -> 'Nueva implementación'.
 * 6. Selecciona el tipo 'Aplicación web'.
 * 7. Configura:
 *    - Descripción: Registro de Personeros
 *    - Ejecutar como: Tú (tu correo)
 *    - Quién tiene acceso: 'Cualquiera' (Muy importante para recibir datos del formulario)
 * 8. Haz clic en 'Implementar', autoriza los permisos necesarios y copia la 'URL de la aplicación web'.
 * 9. Pega esa URL en el aplicativo (ya sea en el código o en la sección de configuración).
 */

function doPost(e) {
  // Si se ejecuta manualmente desde el editor de Apps Script (donde 'e' es undefined)
  if (!e || !e.postData || !e.postData.contents) {
    try {
      inicializarHoja();
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Ejecución manual: Hoja y encabezados creados con éxito." }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Error en inicialización manual: " + err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // CORS support
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  try {
    // Parsear datos entrantes
    var data = JSON.parse(e.postData.contents);
    
    // Obtener u ordenar la hoja de cálculo "Registro"
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registro");
    
    if (!sheet) {
      sheet = ss.insertSheet("Registro");
    }
    
    // Definir cabeceras con ID de conteo al inicio
    var columnHeaders = [
      "ID",
      "Fecha de Registro",
      "Nombres y Apellidos",
      "D.N.I.",
      "Distrito de Votación",
      "Centro de Votación",
      "Mesa Electoral",
      "Número de Celular",
      "¿Usa WhatsApp?",
      "WhatsApp Alterno",
      "Correo Electrónico",
      "Experiencia como Personero",
      "Compromiso 2da Vuelta 2026",
      "¿Cuenta con Movilidad Propia?",
      "Video",
      "PDF",
      "Credenciales"
    ];
    
    // Si la hoja está vacía, agregar cabeceras formateadas
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columnHeaders);
      sheet.getRange(1, 1, 1, columnHeaders.length)
        .setFontWeight("bold")
        .setBackground("#e0f2fe") // Celeste claro
        .setFontColor("#0f172a") // Gris oscuro
        .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, columnHeaders.length);
    }
    
    // Calcular el siguiente ID (autoincrementable)
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
    
    // Preparar fila con datos recibidos
    var rowData = [
      nextId,
      data.fecha_registro || new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
      data.nombres,
      data.dni,
      data.distrito,
      data.centro,
      data.mesa,
      data.celular,
      data.usa_whatsapp,
      data.whatsapp_otro || "Mismo número",
      data.correo,
      data.experiencia_personero,
      data.compromiso_2da_vuelta,
      data.movilidad_propia,
      0, // Video counter initial
      0, // PDF counter initial
      "Bloqueado" // Credenciales status initial
    ];
    
    sheet.appendRow(rowData);
    formatearCeldaCredenciales(sheet, sheet.getLastRow(), columnHeaders.indexOf("Credenciales") + 1, "Bloqueado");
    
    var responseOutput = JSON.stringify({ status: "success", message: "Registro exitoso en Google Sheets", id: nextId });
    return ContentService.createTextOutput(responseOutput)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorOutput = JSON.stringify({ status: "error", message: error.toString() });
    return ContentService.createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Configuración para preflight requests (OPTIONS) requeridas en CORS
function doOptions(e) {
  var output = ContentService.createTextOutput();
  return output.setMimeType(ContentService.MimeType.TEXT);
}

// Obtener los datos registrados para mostrarlos en el Dashboard
function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    
    if (action === "login") {
      var dni = e && e.parameter && e.parameter.dni;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Registro");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Hoja 'Registro' no encontrada" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No hay registros" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var headers = rows[0];
      var idxDni = headers.indexOf("D.N.I.");
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
      for (var j = 0; j < headers.length; j++) {
        userRecord[headers[j]] = rows[targetRow][j];
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", user: userRecord }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "update_progress") {
      var dni = e && e.parameter && e.parameter.dni;
      var type = e && e.parameter && e.parameter.type; // "video" o "pdf"
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Registro");
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Hoja 'Registro' no encontrada" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var rows = sheet.getDataRange().getValues();
      var headers = rows[0];
      var idxDni = headers.indexOf("D.N.I.");
      var idxVideo = headers.indexOf("Video");
      var idxPdf = headers.indexOf("PDF");
      var idxCredenciales = headers.indexOf("Credenciales");
      
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
      
      // Obtener valores actuales y asegurar que sean numéricos (evitando celdas vacías o NaN)
      var valVideo = sheet.getRange(targetRow, idxVideo + 1).getValue();
      var currentVideo = (valVideo === "" || isNaN(valVideo)) ? 0 : parseInt(valVideo, 10);
      
      var valPdf = sheet.getRange(targetRow, idxPdf + 1).getValue();
      var currentPdf = (valPdf === "" || isNaN(valPdf)) ? 0 : parseInt(valPdf, 10);
      
      // Incrementar de forma idempotente y segura
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
    
    if (action === "read") {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Registro");
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
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
          var key = headersRow[j];
          record[key] = row[j];
        }
        data.push(record);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "running", message: "Apps Script activo. Esperando peticiones POST/GET en la hoja 'Registro'." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Crea el menú personalizado en Google Sheets para ejecutar la creación de encabezados.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Sistema Registro')
      .addItem('Inicializar Encabezados', 'inicializarHoja')
      .addToUi();
}

/**
 * Ejecuta la creación e inicialización de la hoja "Registro" con sus encabezados formateados.
 */
function inicializarHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Registro");
  
  if (!sheet) {
    sheet = ss.insertSheet("Registro");
  }
  
  var columnHeaders = [
    "ID",
    "Fecha de Registro",
    "Nombres y Apellidos",
    "D.N.I.",
    "Distrito de Votación",
    "Centro de Votación",
    "Mesa Electoral",
    "Número de Celular",
    "¿Usa WhatsApp?",
    "WhatsApp Alterno",
    "Correo Electrónico",
    "Experiencia como Personero",
    "Compromiso 2da Vuelta 2026",
    "¿Cuenta con Movilidad Propia?",
    "Video",
    "PDF",
    "Credenciales"
  ];
  
  // Escribir los encabezados en la primera fila
  sheet.getRange(1, 1, 1, columnHeaders.length).setValues([columnHeaders]);
  
  // Aplicar formato profesional (Negrita, fondo celeste, texto oscuro, centrado)
  sheet.getRange(1, 1, 1, columnHeaders.length)
    .setFontWeight("bold")
    .setBackground("#3fb7e2") // Celeste del tema de la app
    .setFontColor("#ffffff") // Texto blanco
    .setHorizontalAlignment("center");
  
  // Congelar la primera fila
  sheet.setFrozenRows(1);
  
  // Ajustar el ancho de las columnas
  sheet.autoResizeColumns(1, columnHeaders.length);
  
  SpreadsheetApp.getUi().alert("Hoja 'Registro' inicializada con éxito.");
}

/**
 * Helper to style the "Credenciales" status cell.
 * Green background for "Confirmado"/"Desbloqueado", red background for "Bloqueado".
 */
function formatearCeldaCredenciales(sheet, rowNumber, colIndex, status) {
  var cell = sheet.getRange(rowNumber, colIndex);
  if (status === "Confirmado" || status === "Desbloqueado") {
    cell.setBackground("#d1fae5") // Verde claro
        .setFontColor("#065f46") // Verde oscuro
        .setFontWeight("bold")
        .setHorizontalAlignment("center");
  } else {
    cell.setBackground("#fee2e2") // Rojo claro
        .setFontColor("#991b1b") // Rojo oscuro
        .setFontWeight("bold")
        .setHorizontalAlignment("center");
  }
}
