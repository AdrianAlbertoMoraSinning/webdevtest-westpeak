const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
const form = document.getElementById("approval-form");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        window.location.href = "thank-you.html";
      })
      .catch(() => {
        window.location.href = "thank-you.html";
      });
  });
}

async function loadManagedReviews() {
  const grid = document.getElementById('reviewsGrid');
  const config = window.AGENDA_CONFIG;

  if (!grid || !config || !config.appsScriptUrl || config.appsScriptUrl.includes('PASTE_GOOGLE')) {
    return;
  }

  try {
    const response = await fetch(config.appsScriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'listReviews' })
    });

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.data)) return;

    const reviews = data.data
      .filter(item => item.status !== 'hidden')
      .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999))
      .slice(0, 6);

    if (!reviews.length) return;

    grid.innerHTML = '';
    reviews.forEach(item => {
      const article = document.createElement('article');
      const rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
      article.innerHTML = `
        <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
        <p>“${escapeHtml(item.reviewText || '')}”</p>
        <strong>${escapeHtml(item.customerName || 'Montecristo Client')}</strong>
        <small>${escapeHtml(item.location || 'Alberta')}</small>
      `;
      grid.appendChild(article);
    });
  } catch (error) {
    console.warn('Reviews could not be loaded.', error);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadManagedReviews();
