/**
 * Digital Kamai Pakistan - Category Listing Controller
 */

import { ARTICLES, CATEGORIES } from './data/articles.js';
import { escapeHtml } from './navigation.js';

export function initCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('c') || 'online-business';

  const category = CATEGORIES.find(c => c.slug === categorySlug) || CATEGORIES[0];

  // Set document meta
  document.title = `${category.name} – Digital Kamai Pakistan`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', category.description);
  }

  // Update Breadcrumbs
  const breadcrumbsEl = document.getElementById('categoryBreadcrumbs');
  if (breadcrumbsEl) {
    breadcrumbsEl.innerHTML = `
      <a href="/index.html">Home</a>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <a href="/category.html">Categories</a>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(category.name)}</span>
    `;
  }

  // Header Details
  const titleEl = document.getElementById('categoryTitle');
  const descEl = document.getElementById('categoryDescription');
  if (titleEl) titleEl.textContent = category.name;
  if (descEl) descEl.textContent = category.description;

  // Category Nav Pills (interactive segmented tabs)
  const tabsContainer = document.getElementById('categoryTabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = CATEGORIES.map(c => `
      <a href="/category.html?c=${c.slug}" class="btn-secondary" style="font-size: 0.8125rem; padding: 0.4rem 0.85rem; ${c.slug === category.slug ? 'background-color: var(--brand-emerald); color: #ffffff; border-color: var(--brand-emerald);' : ''}">
        ${escapeHtml(c.name)}
      </a>
    `).join('');
  }

  // Filter and Sort State
  const searchInput = document.getElementById('categorySearchInput');
  const sortSelect = document.getElementById('categorySortSelect');
  const gridContainer = document.getElementById('categoryArticlesGrid');
  const loadMoreBtn = document.getElementById('categoryLoadMoreBtn');
  const featuredWrapper = document.getElementById('categoryFeaturedWrapper');

  let itemsPerPage = 6;
  let currentPage = 1;

  function renderCategoryArticles() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const sort = sortSelect?.value || 'newest';

    let list = ARTICLES.filter(art => {
      const isCat = art.categorySlug === category.slug || art.category.toLowerCase().includes(category.name.toLowerCase());
      if (!isCat) return false;
      if (!q) return true;
      return art.title.toLowerCase().includes(q) || art.excerpt.toLowerCase().includes(q);
    });

    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    } else {
      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    // Render Featured Article for this category if available and not searching
    if (featuredWrapper) {
      if (!q && list.length > 0) {
        const feat = list[0];
        featuredWrapper.style.display = 'block';
        featuredWrapper.innerHTML = `
          <div class="featured-card">
            <a href="/article.html?id=${feat.id}" class="featured-media" aria-label="${escapeHtml(feat.title)}">
              <img src="${feat.thumbnail}" alt="${escapeHtml(feat.title)}" class="featured-img" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
            </a>
            <div class="featured-content">
              <div class="article-meta">
                <span class="meta-category">Featured in ${escapeHtml(category.name)}</span>
                <span class="meta-dot">·</span>
                <time datetime="${feat.publishedAt}">${feat.publishedAt}</time>
                <span class="meta-dot">·</span>
                <span>${feat.readingTime} min read</span>
              </div>
              <h2 class="featured-title">
                <a href="/article.html?id=${feat.id}">${escapeHtml(feat.title)}</a>
              </h2>
              <p class="featured-excerpt">${escapeHtml(feat.excerpt)}</p>
              <div style="margin-top: 0.5rem;">
                <a href="/article.html?id=${feat.id}" class="btn-primary" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
                  Read Complete Guide &rarr;
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        featuredWrapper.style.display = 'none';
        featuredWrapper.innerHTML = '';
      }
    }

    if (!gridContainer) return;

    if (list.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3 class="empty-title">No Articles in This Category Yet</h3>
          <p class="empty-desc">We are actively researching and drafting verified editorial guides for ${escapeHtml(category.name)}. Check back soon or browse our other sections.</p>
          <div style="margin-top: 1.5rem;">
            <a href="/category.html?c=freelancing" class="btn-secondary">Browse Freelancing Guides</a>
          </div>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    // Pagination slice
    const totalVisible = currentPage * itemsPerPage;
    const paginated = list.slice(0, totalVisible);

    gridContainer.innerHTML = paginated.map(art => `
      <article class="article-card">
        <a href="/article.html?id=${art.id}" class="card-media-wrapper" aria-label="${escapeHtml(art.title)}">
          <img src="${art.thumbnail}" alt="${escapeHtml(art.title)}" class="card-thumbnail" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
        </a>
        <div class="card-body">
          <div class="article-meta">
            <span class="meta-category">${escapeHtml(art.category)}</span>
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

    // Toggle Load More button
    if (loadMoreBtn) {
      if (totalVisible < list.length) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `Load More Articles (${list.length - totalVisible} remaining)`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  searchInput?.addEventListener('input', () => {
    currentPage = 1;
    renderCategoryArticles();
  });

  sortSelect?.addEventListener('change', () => {
    currentPage = 1;
    renderCategoryArticles();
  });

  loadMoreBtn?.addEventListener('click', () => {
    currentPage++;
    renderCategoryArticles();
  });

  renderCategoryArticles();
}
