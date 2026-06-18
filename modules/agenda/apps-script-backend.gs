/*
  Google Apps Script backend for Montecristo Auto Finance.

  Setup:
  1. Create / open the Google Sheet used for the website.
  2. Extensions > Apps Script.
  3. Paste this file.
  4. Confirm SHEET_ID, OWNER_EMAIL and ADMIN_PIN.
  5. Deploy > New deployment > Web app.
  6. Execute as: Me. Who has access: Anyone.
  7. Copy Web App URL into agenda-config.js > appsScriptUrl.

  Sheets created automatically:
  - appointments
  - reviews
*/

const SHEET_ID = '1SGt-Br7K-pMlfVDVxDEB219hYeBDUC3AEuf_DviL1s';
const APPOINTMENTS_SHEET_NAME = 'appointments';
const REVIEWS_SHEET_NAME = 'reviews';
const OWNER_EMAIL = 'marlon@mtcautofinance.ca';
const ADMIN_PIN = 'MTC2026';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');

    if (body.action === 'list') return json({ ok:true, data:listAppointments(getAppointmentsSheet()) });
    if (body.action === 'create') return json({ ok:true, data:createAppointment(getAppointmentsSheet(), body) });

    if (body.action === 'delete') {
      requireAdmin(body);
      return json({ ok:true, data:updateAppointmentStatus(getAppointmentsSheet(), body.id, 'cancelled') });
    }

    if (body.action === 'update') {
      requireAdmin(body);
      return json({ ok:true, data:updateAppointment(getAppointmentsSheet(), body.id, body.updates || {}) });
    }

    if (body.action === 'listReviews') return json({ ok:true, data:listReviews(getReviewsSheet()) });

    if (body.action === 'createReview') {
      requireAdmin(body);
      return json({ ok:true, data:createReview(getReviewsSheet(), body) });
    }

    if (body.action === 'updateReview') {
      requireAdmin(body);
      return json({ ok:true, data:updateReview(getReviewsSheet(), body.id, body.updates || {}) });
    }

    if (body.action === 'deleteReview') {
      requireAdmin(body);
      return json({ ok:true, data:deleteReview(getReviewsSheet(), body.id) });
    }

    return json({ ok:false, message:'Invalid action' });
  } catch (error) {
    return json({ ok:false, message:error.message });
  }
}

function getAppointmentsSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(APPOINTMENTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(APPOINTMENTS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','appointmentDate','appointmentTime','clientName','clientPhone','clientEmail','clientComment','status','createdAt']);
  }
  return sheet;
}

function getReviewsSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(REVIEWS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(REVIEWS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','customerName','rating','reviewText','location','status','sortOrder','createdAt']);
  }
  return sheet;
}

function rowsToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(row => row[0]).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function listAppointments(sheet) {
  return rowsToObjects(sheet);
}

function createAppointment(sheet, body) {
  if (!body.appointmentDate || !body.appointmentTime || !body.clientName || !body.clientPhone) {
    throw new Error('Faltan datos obligatorios.');
  }

  const appointments = listAppointments(sheet);
  const exists = appointments.some(item => item.appointmentDate === body.appointmentDate && item.appointmentTime === body.appointmentTime && item.status !== 'cancelled');
  if (exists) throw new Error('Ese horario ya fue reservado. Selecciona otro horario.');

  const record = {
    id: Utilities.getUuid(),
    appointmentDate: body.appointmentDate,
    appointmentTime: body.appointmentTime,
    clientName: body.clientName,
    clientPhone: body.clientPhone,
    clientEmail: body.clientEmail || '',
    clientComment: body.clientComment || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  sheet.appendRow([record.id, record.appointmentDate, record.appointmentTime, record.clientName, record.clientPhone, record.clientEmail, record.clientComment, record.status, record.createdAt]);
  sendOwnerEmail(record, body.companyName || 'Montecristo Auto Finance');
  return record;
}

function sendOwnerEmail(record, companyName) {
  const subject = `Nueva cita agendada - ${companyName}`;
  const message = [
    `Nueva cita agendada desde la página web.`,
    ``,
    `Fecha: ${record.appointmentDate}`,
    `Hora: ${record.appointmentTime}`,
    `Cliente: ${record.clientName}`,
    `Teléfono/WhatsApp: ${record.clientPhone}`,
    `Correo: ${record.clientEmail}`,
    `Comentario: ${record.clientComment}`,
    ``,
    `Panel de administración: abre agenda-admin.html en la web.`
  ].join('\n');
  MailApp.sendEmail(OWNER_EMAIL, subject, message);
}

function updateAppointmentStatus(sheet, id, status) {
  const row = findRowById(sheet, id);
  sheet.getRange(row, 8).setValue(status);
  return true;
}

function updateAppointment(sheet, id, updates) {
  const row = findRowById(sheet, id);
  if (typeof updates.clientComment === 'string') sheet.getRange(row, 7).setValue(updates.clientComment);
  return true;
}

function listReviews(sheet) {
  return rowsToObjects(sheet);
}

function createReview(sheet, body) {
  if (!body.customerName || !body.reviewText) throw new Error('Customer name and review text are required.');

  const record = {
    id: Utilities.getUuid(),
    customerName: body.customerName,
    rating: body.rating || '5',
    reviewText: body.reviewText,
    location: body.location || 'Alberta',
    status: body.status || 'active',
    sortOrder: body.sortOrder || 1,
    createdAt: new Date().toISOString()
  };

  sheet.appendRow([record.id, record.customerName, record.rating, record.reviewText, record.location, record.status, record.sortOrder, record.createdAt]);
  return record;
}

function updateReview(sheet, id, updates) {
  const row = findRowById(sheet, id);
  if (typeof updates.customerName === 'string') sheet.getRange(row, 2).setValue(updates.customerName);
  if (typeof updates.rating !== 'undefined') sheet.getRange(row, 3).setValue(updates.rating);
  if (typeof updates.reviewText === 'string') sheet.getRange(row, 4).setValue(updates.reviewText);
  if (typeof updates.location === 'string') sheet.getRange(row, 5).setValue(updates.location);
  if (typeof updates.status === 'string') sheet.getRange(row, 6).setValue(updates.status);
  if (typeof updates.sortOrder !== 'undefined') sheet.getRange(row, 7).setValue(updates.sortOrder);
  return true;
}

function deleteReview(sheet, id) {
  const row = findRowById(sheet, id);
  sheet.deleteRow(row);
  return true;
}

function findRowById(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1;
  }
  throw new Error('Registro no encontrado.');
}

function requireAdmin(body) {
  if (body.adminPin !== ADMIN_PIN) throw new Error('Acceso no autorizado.');
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
