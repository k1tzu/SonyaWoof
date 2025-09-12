// Basic interactivity + content CMS loader for SNYA site

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
    t.style.background = '#161a22';
    t.style.color = '#e8ecf2';
    t.style.border = '1px solid #252a33';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '10px';
    t.style.zIndex = '9999';
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 1200);
}

// Content loading from localStorage or data/content.json
(async function loadContent(){
  let data = null;
  // Prefer localStorage for preview from admin
  const local = localStorage.getItem('snya-content');
  const usingLocal = !!local;
  if (local) {
    try { data = JSON.parse(local); } catch {}
  }
  if (!data) {
    try {
      const res = await fetch('data/content.json', { cache: 'no-store' });
      if (res.ok) data = await res.json();
    } catch {}
  }
  if (!data) return;

  // Site meta
  if (data.site) {
    if (data.site.title) document.title = data.site.title;
    const m = document.querySelector('meta[name="description"]');
    if (m && data.site.description) m.setAttribute('content', data.site.description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel','canonical');
      document.head.appendChild(canonical);
    }
    if (canonical && data.site.canonical) canonical.setAttribute('href', data.site.canonical);
  }

  // Hero
  if (data.hero) {
    const lead = document.querySelector('.lead');
    if (lead && data.hero.lead) lead.textContent = data.hero.lead;
    const img = document.querySelector('.hero-image img');
    if (img && data.hero.image) img.setAttribute('src', data.hero.image);
  }

  // Links and contract
  if (data.links) {
    const addrEl = document.getElementById('contract-address');
    if (addrEl && data.links.contract) addrEl.textContent = data.links.contract;
    const linkMap = ['etherscan','uniswap','dexscreener','twitter','telegram','discord'];
    linkMap.forEach(key => {
      document.querySelectorAll(`[data-link="${key}"]`).forEach(a => {
        const url = data.links[key];
        if (url) { a.setAttribute('href', url); a.removeAttribute('aria-disabled'); }
        else { a.setAttribute('href', '#'); a.setAttribute('aria-disabled','true'); }
      });
    });
  }

  // Solana specifics
  if (data.solana) {
    const sm = document.getElementById('sol-mint-address');
    if (sm && data.solana.mint) sm.textContent = data.solana.mint;
    const solLinks = ['solscan','jupiter','birdeye','raydiumSol','raydiumUsdc'];
    solLinks.forEach(key => {
      document.querySelectorAll(`[data-link="${key}"]`).forEach(a => {
        const url = data.solana[key];
        if (url) { a.setAttribute('href', url); a.removeAttribute('aria-disabled'); }
        else { a.setAttribute('href', '#'); a.setAttribute('aria-disabled','true'); }
      });
    });
    // Probe Jupiter route availability; disable CTA if no route yet
    if (data.solana.mint) {
      try {
        const inputSOL = 'So11111111111111111111111111111111111111112';
        const amt = 10000000; // 0.01 SOL (lamports)
        const q = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputSOL}&outputMint=${data.solana.mint}&amount=${amt}&slippageBps=50`);
        if (q.ok) {
          const json = await q.json();
          const hasRoute = Array.isArray(json.routes) ? json.routes.length > 0 : (json.data && json.data.length > 0);
          if (!hasRoute) {
            document.querySelectorAll('[data-link="jupiter"]').forEach(a => { a.setAttribute('aria-disabled','true'); a.textContent = 'Jupiter (no route yet)'; a.setAttribute('href','#'); });
          }
        }
      } catch {}
    }
  }

  // Tokenomics
  if (data.tokenomics) {
    Object.entries(data.tokenomics).forEach(([key, text]) => {
      const card = document.querySelector(`.card[data-tokenomics="${key}"] p`);
      if (card && text) card.textContent = text;
    });
  }

  // Roadmap
  if (Array.isArray(data.roadmap)) {
    const ul = document.getElementById('roadmap-list');
    if (ul) {
      ul.innerHTML = '';
      data.roadmap.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
    }
  }

  // Contact
  if (data.contact?.email) {
    const a = document.getElementById('contact-email');
    if (a) { a.textContent = data.contact.email; a.setAttribute('href', `mailto:${data.contact.email}`); }
  }

  // Preview badge
  if (usingLocal) {
    const badge = document.getElementById('cms-preview-badge');
    if (badge) badge.style.display = 'block';
  }
})();
