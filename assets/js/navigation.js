/**
 * Digital Kamai Pakistan - Navigation & Modal Management
 */

import { ARTICLES } from './data/articles.js';

export function initNavigation() {
  const menuBtn = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  function openDrawer() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeSearchModal();
    }
  });

  initSearchModal();
}

export function initSearchModal() {
  const searchTriggers = document.querySelectorAll('.search-trigger-btn');
  const modalBackdrop = document.querySelector('.search-modal-backdrop');
  const modalCloseBtn = document.querySelector('.search-close-btn');
  const searchInput = document.querySelector('.search-input');
  const resultsContainer = document.querySelector('.search-results-list');

  function openSearchModal() {
    modalBackdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 50);
  }

  function closeSearchModal() {
    modalBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.innerHTML = '';
  }

  searchTriggers.forEach(btn => btn.addEventListener('click', openSearchModal));
  modalCloseBtn?.addEventListener('click', closeSearchModal);

  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeSearchModal();
    }
  });

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!resultsContainer) return;

    if (!query) {
      resultsContainer.innerHTML = '';
      return;
    }

    const matches = ARTICLES.filter(art => {
      const titleMatch = art.title.toLowerCase().includes(query);
      const excerptMatch = art.excerpt.toLowerCase().includes(query);
      const categoryMatch = art.category.toLowerCase().includes(query);
      const tagMatch = art.tags.some(t => t.toLowerCase().includes(query));
      return titleMatch || excerptMatch || categoryMatch || tagMatch;
    }).slice(0, 5);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          No matching articles found for "<strong>${escapeHtml(query)}</strong>".
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.map(art => `
      <a href="/article.html?id=${art.id}" class="search-result-item">
        <div class="search-result-title">${escapeHtml(art.title)}</div>
        <div class="search-result-meta">${escapeHtml(art.category)} · ${art.readingTime} min read</div>
      </a>
    `).join('') + `
      <div style="padding: 0.75rem 1.25rem; border-top: 1px solid var(--border-subtle); text-align: right;">
        <a href="/search.html?q=${encodeURIComponent(query)}" style="font-size: 0.8125rem; font-weight: 600; color: var(--brand-emerald);">
          View all results &rarr;
        </a>
      </div>
    `;
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
