const config = window.AGENDA_CONFIG;

const loginCard = document.getElementById('loginCard');
const adminPanel = document.getElementById('adminPanel');
const adminLogin = document.getElementById('adminLogin');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminBookings = document.getElementById('adminBookings');
const refreshBookings = document.getElementById('refreshBookings');

const appointmentsTab = document.getElementById('appointmentsTab');
const reviewsTab = document.getElementById('reviewsTab');
const appointmentsPanel = document.getElementById('appointmentsPanel');
const reviewsPanel = document.getElementById('reviewsPanel');
const refreshReviews = document.getElementById('refreshReviews');
const reviewForm = document.getElementById('reviewForm');
const reviewId = document.getElementById('reviewId');
const reviewCustomer = document.getElementById('reviewCustomer');
const reviewRating = document.getElementById('reviewRating');
const reviewLocation = document.getElementById('reviewLocation');
const reviewText = document.getElementById('reviewText');
const reviewStatus = document.getElementById('reviewStatus');
const reviewSort = document.getElementById('reviewSort');
const reviewMessage = document.getElementById('reviewMessage');
const adminReviews = document.getElementById('adminReviews');

function getDemoBookings() {
  return JSON.parse(localStorage.getItem('agenda_demo_bookings') || '[]');
}

function setDemoBookings(bookings) {
  localStorage.setItem('agenda_demo_bookings', JSON.stringify(bookings));
}

function getDemoReviews() {
  return JSON.parse(localStorage.getItem('mtc_demo_reviews') || '[]');
}

function setDemoReviews(reviews) {
  localStorage.setItem('mtc_demo_reviews', JSON.stringify(reviews));
}

async function api(action, payload = {}) {
  const useDemo = !config.appsScriptUrl || config.appsScriptUrl.includes('PASTE_GOOGLE');

  if (useDemo) {
    if (action === 'list') return getDemoBookings();
    if (action === 'delete') {
      const updated = getDemoBookings().map(item => item.id === payload.id ? { ...item, status: 'cancelled' } : item);
      setDemoBookings(updated);
      return true;
    }
    if (action === 'update') {
      const updated = getDemoBookings().map(item => item.id === payload.id ? { ...item, ...payload.updates } : item);
      setDemoBookings(updated);
      return true;
    }
    if (action === 'listReviews') return getDemoReviews();
    if (action === 'createReview') {
      const reviews = getDemoReviews();
      const record = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        customerName: payload.customerName || '',
        rating: payload.rating || '5',
        reviewText: payload.reviewText || '',
        location: payload.location || '',
        status: payload.status || 'active',
        sortOrder: payload.sortOrder || 1,
        createdAt: new Date().toISOString()
      };
      reviews.push(record);
      setDemoReviews(reviews);
      return record;
    }
    if (action === 'updateReview') {
      const updated = getDemoReviews().map(item => item.id === payload.id ? { ...item, ...payload.updates } : item);
      setDemoReviews(updated);
      return true;
    }
    if (action === 'deleteReview') {
      const updated = getDemoReviews().filter(item => item.id !== payload.id);
      setDemoReviews(updated);
      return true;
    }
  }

  const response = await fetch(config.appsScriptUrl, {
    method: 'POST',
    body: JSON.stringify({
      action,
      adminPin: config.adminPin,
      ...payload
    })
  });

  const data = await response.json();
  if (!data.ok) throw new Error(data.message || 'Unable to complete the request.');
  return data.data;
}

function formatBooking(item) {
  return `${item.appointmentDate} · ${item.appointmentTime}`;
}

async function renderBookings() {
  adminBookings.innerHTML = '<p>Loading appointments...</p>';
  const bookings = await api('list');
  const active = bookings
    .filter(item => item.status !== 'cancelled')
    .sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`));

  if (!active.length) {
    adminBookings.innerHTML = '<p>No active appointments found.</p>';
    return;
  }

  adminBookings.innerHTML = '';
  active.forEach(item => {
    const card = document.createElement('article');
    card.className = 'admin-booking';
    card.innerHTML = `
      <strong>${formatBooking(item)}</strong>
      <span><b>Client:</b> ${escapeHtml(item.clientName || '')}</span>
      <span><b>Phone:</b> ${escapeHtml(item.clientPhone || '')}</span>
      <span><b>Email:</b> ${escapeHtml(item.clientEmail || '')}</span>
      <span><b>Comments:</b> ${escapeHtml(item.clientComment || '')}</span>
      <div class="admin-actions">
        <button class="edit" type="button">Edit Comment</button>
        <button class="delete" type="button">Cancel Appointment</button>
      </div>
    `;

    card.querySelector('.delete').addEventListener('click', async () => {
      if (!confirm('Cancel this appointment and free the time slot?')) return;
      await api('delete', { id: item.id });
      await renderBookings();
    });

    card.querySelector('.edit').addEventListener('click', async () => {
      const clientComment = prompt('Update comment:', item.clientComment || '');
      if (clientComment === null) return;
      await api('update', { id: item.id, updates: { clientComment } });
      await renderBookings();
    });

    adminBookings.appendChild(card);
  });
}

function switchPanel(panel) {
  const reviewsActive = panel === 'reviews';
  reviewsPanel.classList.toggle('hidden', !reviewsActive);
  appointmentsPanel.classList.toggle('hidden', reviewsActive);
  reviewsTab.classList.toggle('active', reviewsActive);
  appointmentsTab.classList.toggle('active', !reviewsActive);
  if (reviewsActive) renderReviews();
}

async function renderReviews() {
  adminReviews.innerHTML = '<p>Loading reviews...</p>';
  const reviews = await api('listReviews');
  const ordered = reviews.sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));

  if (!ordered.length) {
    adminReviews.innerHTML = '<p>No website reviews found yet. Add the first review above.</p>';
    return;
  }

  adminReviews.innerHTML = '';
  ordered.forEach(item => {
    const rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
    const card = document.createElement('article');
    card.className = 'admin-review-card';
    card.innerHTML = `
      <strong>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} ${escapeHtml(item.customerName || 'Client')}</strong>
      <small>${escapeHtml(item.location || 'Alberta')} · ${escapeHtml(item.status || 'active')} · Order ${escapeHtml(item.sortOrder || '')}</small>
      <p>${escapeHtml(item.reviewText || '')}</p>
      <div class="admin-actions">
        <button class="edit" type="button">Edit</button>
        <button class="hide" type="button">${item.status === 'hidden' ? 'Show' : 'Hide'}</button>
        <button class="delete" type="button">Delete</button>
      </div>
    `;

    card.querySelector('.edit').addEventListener('click', () => {
      reviewId.value = item.id;
      reviewCustomer.value = item.customerName || '';
      reviewRating.value = item.rating || '5';
      reviewLocation.value = item.location || '';
      reviewText.value = item.reviewText || '';
      reviewStatus.value = item.status || 'active';
      reviewSort.value = item.sortOrder || 1;
      reviewMessage.textContent = 'Editing selected review. Save to update.';
      reviewCustomer.focus();
    });

    card.querySelector('.hide').addEventListener('click', async () => {
      await api('updateReview', { id: item.id, updates: { status: item.status === 'hidden' ? 'active' : 'hidden' } });
      await renderReviews();
    });

    card.querySelector('.delete').addEventListener('click', async () => {
      if (!confirm('Delete this review from the website list?')) return;
      await api('deleteReview', { id: item.id });
      await renderReviews();
    });

    adminReviews.appendChild(card);
  });
}

reviewForm?.addEventListener('submit', async event => {
  event.preventDefault();
  reviewMessage.textContent = 'Saving review...';

  const payload = {
    customerName: reviewCustomer.value.trim(),
    rating: reviewRating.value,
    reviewText: reviewText.value.trim(),
    location: reviewLocation.value.trim(),
    status: reviewStatus.value,
    sortOrder: reviewSort.value || 1
  };

  if (reviewId.value) {
    await api('updateReview', { id: reviewId.value, updates: payload });
  } else {
    await api('createReview', payload);
  }

  reviewForm.reset();
  reviewId.value = '';
  reviewRating.value = '5';
  reviewStatus.value = 'active';
  reviewSort.value = '1';
  reviewMessage.textContent = 'Review saved successfully.';
  await renderReviews();
});

adminLogin.addEventListener('submit', async event => {
  event.preventDefault();
  const pin = document.getElementById('adminPin').value.trim();

  if (pin !== config.adminPin) {
    adminLoginMessage.textContent = 'Invalid PIN.';
    return;
  }

  sessionStorage.setItem('agenda_admin_ok', '1');
  loginCard.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  await renderBookings();
});

refreshBookings?.addEventListener('click', renderBookings);
refreshReviews?.addEventListener('click', renderReviews);
appointmentsTab?.addEventListener('click', () => switchPanel('appointments'));
reviewsTab?.addEventListener('click', () => switchPanel('reviews'));

if (sessionStorage.getItem('agenda_admin_ok') === '1') {
  loginCard.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  renderBookings();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
