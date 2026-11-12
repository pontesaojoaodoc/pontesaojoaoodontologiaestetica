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

// Endpoint publicado no Apps Script vinculado à Planilha Leads Ads.
const LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzeD6tJIP4sm6o5ffpmt2wO5iMja2bmzvk9Pm_rZs8LWyFQT8KGxUjeFHin7wtgnpec8g/exec';

function getCampaignData() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || ''
  };
}

function sendLeadToSheets(payload) {
  const body = JSON.stringify(payload);
  // text/plain evita preflight e o sendBeacon continua enviando mesmo quando o
  // navegador já está abrindo o WhatsApp em uma nova aba.
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      LEADS_ENDPOINT,
      new Blob([body], { type: 'text/plain;charset=UTF-8' })
    );
    if (sent) return;
  }
  fetch(LEADS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body
  }).catch(() => {});
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const area = conversionAreas.find(([selector]) => link.closest(selector));
  const channel = href.startsWith('tel:') ? 'phone' : 'whatsapp';
  const placement = area ? area[1] : 'other';
  const campaign = getCampaignData();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_contact_click',
    channel,
    placement,
    ...campaign
  });

  sendLeadToSheets({
    nome: channel === 'whatsapp' ? 'Clique WhatsApp' : 'Clique telefone',
    telefone: '',
    pagina: window.location.href,
    origem: channel,
    termo: campaign.utm_term || placement,
    placement,
    destino: href,
    referrer: document.referrer,
    ...campaign
  });
});

const year = document.querySelector('#current-year');
if (year) year.textContent = String(new Date().getFullYear());
