// Basic interactivity for SNYA site

// Mobile nav toggle
const menuButton = document.querySelector('.menu-button');
const navMenu = document.querySelector('#nav-menu');
if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    const open = navMenu.style.display === 'block';
    navMenu.style.display = open ? 'none' : 'block';
    menuButton.setAttribute('aria-expanded', String(!open));
  });
}

// Copy to clipboard utility
function copyTextFromSelector(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent?.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    toast('Copied!');
  }).catch(() => toast('Copy failed'));
}

// Wire copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const selector = btn.getAttribute('data-copy');
    if (selector) copyTextFromSelector(selector);
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Minimal toast
function toast(message) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.position = 'fixed';
    t.style.bottom = '16px';
    t.style.left = '50%';
    t.style.transform = 'translateX(-50%)';
    t.style.background = '#ffffff';
    t.style.color = '#1f252e';
    t.style.border = '1px solid #e8edf3';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '10px';
    t.style.zIndex = '9999';
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 1200);
}

// Static links are embedded in the HTML for GitHub Pages; no CMS.
