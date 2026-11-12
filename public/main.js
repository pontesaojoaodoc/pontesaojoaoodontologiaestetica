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

const leadModal = document.querySelector('#lead-modal');
const leadForm = document.querySelector('#lead-form');
const nameInput = document.querySelector('#lead-name');
const phoneInput = document.querySelector('#lead-phone');
const leadError = document.querySelector('#lead-error');
let pendingWhatsApp = null;

function closeLeadModal() {
  if (!leadModal) return;
  leadModal.hidden = true;
  pendingWhatsApp = null;
  if (leadError) leadError.textContent = '';
}

function openLeadModal(link, placement) {
  if (!leadModal || !leadForm || !nameInput || !phoneInput) return false;
  pendingWhatsApp = { href: link.href, placement };
  leadForm.reset();
  if (leadError) leadError.textContent = '';
  leadModal.hidden = false;
  window.setTimeout(() => nameInput.focus(), 0);
  return true;
}

leadModal?.querySelectorAll('[data-close-lead-modal]').forEach((element) => {
  element.addEventListener('click', closeLeadModal);
});

leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const nome = nameInput.value.trim();
  const telefone = phoneInput.value.trim();
  if (nome.length < 2 || telefone.replace(/\D/g, '').length < 10) {
    if (leadError) leadError.textContent = 'Informe seu nome e um telefone válido para continuar.';
    return;
  }
  if (!pendingWhatsApp) return closeLeadModal();

  const campaign = getCampaignData();
  const placement = pendingWhatsApp.placement;
  const href = pendingWhatsApp.href;
  sendLeadToSheets({
    nome,
    telefone,
    pagina: window.location.href,
    origem: campaign.utm_source || 'whatsapp_form',
    termo: [campaign.utm_campaign, campaign.utm_content, campaign.utm_medium, campaign.utm_term, placement].filter(Boolean).join(' | '),
    placement,
    destino: href,
    referrer: document.referrer,
    ...campaign
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_form_submit',
    channel: 'whatsapp',
    placement,
    ...campaign
  });

  const message = `Olá, meu nome é ${nome}. Vim pelo site da Ponte São João e gostaria de agendar uma avaliação.`;
  const target = new URL(href);
  target.searchParams.set('text', message);
  closeLeadModal();
  window.open(target.toString(), '_blank', 'noopener,noreferrer');
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="https://wa.me/"]');
  const phoneLink = event.target.closest('a[href^="tel:"]');
  if (!link && !phoneLink) return;

  const activeLink = link || phoneLink;
  const href = activeLink.getAttribute('href') || '';
  const area = conversionAreas.find(([selector]) => activeLink.closest(selector));
  const channel = link ? 'whatsapp' : 'phone';
  const placement = area ? area[1] : 'other';
  const campaign = getCampaignData();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'lead_contact_click', channel, placement, ...campaign });

  if (link && openLeadModal(link, placement)) {
    event.preventDefault();
    return;
  }

  sendLeadToSheets({
    nome: 'Clique telefone',
    telefone: '',
    pagina: window.location.href,
    origem: campaign.utm_source || channel,
    termo: [campaign.utm_campaign, campaign.utm_content, campaign.utm_medium, campaign.utm_term, placement].filter(Boolean).join(' | '),
    placement,
    destino: href,
    referrer: document.referrer,
    ...campaign
  });
});

const year = document.querySelector('#current-year');
if (year) year.textContent = String(new Date().getFullYear());
