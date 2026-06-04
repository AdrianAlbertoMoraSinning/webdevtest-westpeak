const config = window.AGENDA_CONFIG;
const calendarGrid = document.getElementById('calendarGrid');
const weekLabel = document.getElementById('weekLabel');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const bookingForm = document.getElementById('bookingForm');
const selectedSlotTitle = document.getElementById('selectedSlotTitle');
const bookingMessage = document.getElementById('bookingMessage');

let weekOffset = 0;
let bookedSlots = [];

const pad = value => String(value).padStart(2, '0');
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const timeSlots = () => {
  const slots = [];
  for (let hour = config.startHour; hour < config.endHour; hour += config.slotMinutes / 60) {
    slots.push(`${pad(Math.floor(hour))}:${pad((hour % 1) * 60)}`);
  }
  return slots;
};

function mondayOfWeek(baseDate){
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff + weekOffset * 7);
  date.setHours(0,0,0,0);
  return date;
}

function displayDate(date){
  return date.toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short' });
}

async function api(action, payload = {}){
  if (!config.appsScriptUrl || config.appsScriptUrl.includes('PASTE_GOOGLE')) {
    const demo = JSON.parse(localStorage.getItem('agenda_demo_bookings') || '[]');
    if (action === 'list') return demo;
    if (action === 'create') {
      const exists = demo.some(item => item.appointmentDate === payload.appointmentDate && item.appointmentTime === payload.appointmentTime && item.status !== 'cancelled');
      if (exists) throw new Error('Ese horario ya fue reservado. Selecciona otro horario.');
      const record = { id: crypto.randomUUID(), status:'active', createdAt:new Date().toISOString(), ...payload };
      demo.push(record);
      localStorage.setItem('agenda_demo_bookings', JSON.stringify(demo));
      return record;
    }
  }

  const response = await fetch(config.appsScriptUrl, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload })
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.message || 'No se pudo completar la operación.');
  return data.data;
}

async function loadBookings(){
  bookedSlots = await api('list');
}

function isBooked(date, time){
  const key = dateKey(date);
  const normalizeHour = value => Number(String(value).split(':')[0]);

  return bookedSlots.some(item =>
    String(item.appointmentDate).trim() === key &&
    normalizeHour(item.appointmentTime) === normalizeHour(time) &&
    String(item.status).toLowerCase() !== 'cancelled'
  );
}

function renderCalendar(){
  const monday = mondayOfWeek(new Date());
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  weekLabel.textContent = `${monday.toLocaleDateString('es-CO',{day:'numeric',month:'short'})} - ${friday.toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}`;
  prevWeekBtn.disabled = weekOffset <= 0;
  calendarGrid.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dayCard = document.createElement('article');
    dayCard.className = 'calendar-day';
    dayCard.innerHTML = `<h3>${displayDate(day)}<small>${dateKey(day)}</small></h3><div class="slot-list"></div>`;
    const list = dayCard.querySelector('.slot-list');

    timeSlots().forEach(time => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot-button';
      button.textContent = time;
      if (isBooked(day, time)) {
        button.classList.add('booked');
        button.textContent = `${time} ocupado`;
        button.disabled = true;
      } else {
        button.addEventListener('click', () => selectSlot(day, time, button));
      }
      list.appendChild(button);
    });
    calendarGrid.appendChild(dayCard);
  }
}

function selectSlot(date, time, button){
  document.querySelectorAll('.slot-button.selected').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  document.getElementById('appointmentDate').value = dateKey(date);
  document.getElementById('appointmentTime').value = time;
  selectedSlotTitle.textContent = `Reserva para ${displayDate(date)} a las ${time}`;
  bookingMessage.textContent = '';
  document.getElementById('clientName').focus();
}

bookingForm.addEventListener('submit', async event => {
  event.preventDefault();
  const appointmentDate = document.getElementById('appointmentDate').value;
  const appointmentTime = document.getElementById('appointmentTime').value;
  if (!appointmentDate || !appointmentTime) {
    bookingMessage.textContent = 'Primero selecciona una fecha y hora disponible.';
    return;
  }

  const payload = {
    appointmentDate,
    appointmentTime,
    clientName: document.getElementById('clientName').value.trim(),
    clientPhone: document.getElementById('clientPhone').value.trim(),
    clientEmail: document.getElementById('clientEmail').value.trim(),
    clientComment: document.getElementById('clientComment').value.trim(),
    companyName: config.companyName,
    ownerEmail: config.ownerEmail,
    ownerWhatsapp: config.ownerWhatsapp
  };

  try {
    bookingMessage.textContent = 'Guardando reserva...';
    await api('create', payload);
    bookingMessage.textContent = 'Reserva confirmada. La firma recibirá la notificación por correo.';
    bookingForm.reset();
    selectedSlotTitle.textContent = 'Selecciona una hora';
    await loadBookings();
    renderCalendar();
  } catch (error) {
    bookingMessage.textContent = error.message;
  }
});

prevWeekBtn.addEventListener('click', async () => { weekOffset--; renderCalendar(); });
nextWeekBtn.addEventListener('click', async () => { weekOffset++; renderCalendar(); });

(async function init(){
  try {
    await loadBookings();
    renderCalendar();
    if (!config.appsScriptUrl || config.appsScriptUrl.includes('PASTE_GOOGLE')) {
      bookingMessage.textContent = 'Modo demo: las reservas se guardan solo en este navegador hasta conectar Google Apps Script.';
    }
  } catch (error) {
    bookingMessage.textContent = error.message;
  }
})();
