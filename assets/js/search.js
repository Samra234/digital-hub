/**
 * Digital Kamai Pakistan - Dedicated Search Page Controller
 */

import { ARTICLES, CATEGORIES } from './data/articles.js';
import { escapeHtml } from './navigation.js';

export function initSearchPage() {
  const searchInput = document.getElementById('searchPageInput');
  const categorySelect = document.getElementById('searchCategorySelect');
  const sortSelect = document.getElementById('searchSortSelect');
  const clearBtn = document.getElementById('searchClearBtn');
  const resultsContainer = document.getElementById('searchResultsGrid');
  const resultsCountEl = document.getElementById('searchResultsCount');

  if (!resultsContainer) return;

  // Populate category select
  if (categorySelect) {
    categorySelect.innerHTML = `<option value="">All Categories</option>` +
      CATEGORIES.map(c => `<option value="${c.slug}">${escapeHtml(c.name)}</option>`).join('');
  }

  // Parse URL search params
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const initialCat = params.get('cat') || '';
  const initialSort = params.get('sort') || 'newest';

  if (searchInput) searchInput.value = initialQuery;
  if (categorySelect) categorySelect.value = initialCat;
  if (sortSelect) sortSelect.value = initialSort;

  function runSearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const cat = categorySelect?.value || '';
    const sort = sortSelect?.value || 'newest';

    // Sync URL without page reload
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (cat) newParams.set('cat', cat);
    if (sort !== 'newest') newParams.set('sort', sort);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.replaceState({}, '', newParams.toString() ? newUrl : window.location.pathname);

    // Filter articles
    let filtered = ARTICLES.filter(art => {
      const matchQuery = !q || (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q))
      );

      const matchCat = !cat || art.categorySlug === cat;
      return matchQuery && matchCat;
    });

    // Sort articles
    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    // Render count
    if (resultsCountEl) {
      resultsCountEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'} found`;
    }

    // Render cards
    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3 class="empty-title">No Matching Articles Found</h3>
          <p class="empty-desc">We couldn't find any articles matching your search criteria. Try using different keywords, clearing filters, or browsing our primary categories.</p>
          <div style="margin-top: 1.5rem;">
            <button id="resetSearchBtn" class="btn-secondary">Clear All Filters</button>
          </div>
        </div>
      `;
      document.getElementById('resetSearchBtn')?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        runSearch();
      });
      return;
    }

    resultsContainer.innerHTML = filtered.map(art => `
      <article class="article-card">
        <a href="/article.html?id=${art.id}" class="card-media-wrapper" aria-label="${escapeHtml(art.title)}">
          <img src="${art.thumbnail}" alt="${escapeHtml(art.title)}" class="card-thumbnail" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
        </a>
        <div class="card-body">
          <div class="article-meta">
            <a href="/category.html?c=${art.categorySlug}" class="meta-category">${escapeHtml(art.category)}</a>
            <span class="meta-dot">·</span>
            <time datetime="${art.publishedAt}">${art.publishedAt}</time>
            <span class="meta-dot">·</span>
            <span>${art.readingTime} min read</span>
          </div>
          <h2 class="card-title">
            <a href="/article.html?id=${art.id}">${escapeHtml(art.title)}</a>
          </h2>
          <p class="card-excerpt">${escapeHtml(art.excerpt)}</p>
          <div class="card-footer">
            <span>By ${escapeHtml(art.author)}</span>
            <a href="/article.html?id=${art.id}" style="color: var(--brand-emerald); font-weight: 600;">Read Guide &rarr;</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  searchInput?.addEventListener('input', runSearch);
  categorySelect?.addEventListener('change', runSearch);
  sortSelect?.addEventListener('change', runSearch);
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    runSearch();
    searchInput?.focus();
  });

  runSearch();
}
