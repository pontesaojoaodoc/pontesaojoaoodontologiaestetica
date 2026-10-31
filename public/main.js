const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    mainNav.classList.toggle('is-open', !isOpen);
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      mainNav.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      mainNav.classList.remove('is-open');
      menuButton.focus();
    }
  });
}

const conversionAreas = [
  ['.site-header', 'header'],
  ['.hero', 'hero'],
  ['.service-card', 'service_card'],
  ['.needs-section', 'needs_section'],
  ['.steps-section', 'steps_section'],
  ['.faq-section', 'faq'],
  ['.contact-section', 'contact'],
  ['.site-footer', 'footer'],
  ['.whatsapp-float', 'floating_whatsapp']
];

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const area = conversionAreas.find(([selector]) => link.closest(selector));
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_contact_click',
    channel: href.startsWith('tel:') ? 'phone' : 'whatsapp',
    placement: area ? area[1] : 'other'
  });
});

const year = document.querySelector('#current-year');
if (year) year.textContent = String(new Date().getFullYear());
