/**
 * Digital Kamai Pakistan - Main Application Entrypoint
 * Controls the home page and bootstraps global components.
 */

import { ARTICLES, CATEGORIES } from './data/articles.js';
import { initTheme } from './theme.js';
import { initNavigation, escapeHtml } from './navigation.js';

export function initHomePage() {
  initTheme();
  initNavigation();

  renderFeaturedArticle();
  renderCategoryCards();
  renderLatestArticles();
  renderPopularGuides();
  initNewsletterForm();
}

function renderFeaturedArticle() {
  const container = document.getElementById('featuredArticleContainer');
  if (!container) return;

  const feat = ARTICLES.find(a => a.featured) || ARTICLES[0];
  if (!feat) return;

  container.innerHTML = `
    <div class="featured-card">
      <a href="/article.html?id=${feat.id}" class="featured-media" aria-label="${escapeHtml(feat.title)}">
        <img src="${feat.thumbnail}" alt="${escapeHtml(feat.title)}" class="featured-img" loading="eager" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
      </a>
      <div class="featured-content">
        <div class="article-meta">
          <a href="/category.html?c=${feat.categorySlug}" class="meta-category">${escapeHtml(feat.category)}</a>
          <span class="meta-dot">·</span>
          <time datetime="${feat.publishedAt}">${feat.publishedAt}</time>
          <span class="meta-dot">·</span>
          <span>${feat.readingTime} min read</span>
        </div>
        <h2 class="featured-title">
          <a href="/article.html?id=${feat.id}">${escapeHtml(feat.title)}</a>
        </h2>
        <p class="featured-excerpt">${escapeHtml(feat.excerpt)}</p>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem;">
          <span style="font-size: 0.8125rem; color: var(--text-faint);">By ${escapeHtml(feat.author)}</span>
          <a href="/article.html?id=${feat.id}" class="btn-primary" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
            Read Complete Guide &rarr;
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryCards() {
  const container = document.getElementById('categoriesGridContainer');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    // Count articles in this category
    const count = ARTICLES.filter(a => a.categorySlug === cat.slug || a.category.toLowerCase().includes(cat.name.toLowerCase())).length;
    return `
      <a href="/category.html?c=${cat.slug}" class="category-card">
        <div class="category-card-title">${escapeHtml(cat.name)}</div>
        <p class="category-card-desc">${escapeHtml(cat.description)}</p>
        <div style="margin-top: 0.75rem; font-size: 0.75rem; font-weight: 600; color: var(--brand-emerald);">
          ${count} ${count === 1 ? 'guide' : 'guides'} &rarr;
        </div>
      </a>
    `;
  }).join('');
}

function renderLatestArticles() {
  const container = document.getElementById('latestArticlesGrid');
  if (!container) return;

  // Show latest 6 articles
  const latest = [...ARTICLES]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 6);

  container.innerHTML = latest.map(art => `
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
        <h3 class="card-title">
          <a href="/article.html?id=${art.id}">${escapeHtml(art.title)}</a>
        </h3>
        <p class="card-excerpt">${escapeHtml(art.excerpt)}</p>
        <div class="card-footer">
          <span>By ${escapeHtml(art.author)}</span>
          <a href="/article.html?id=${art.id}" style="color: var(--brand-emerald); font-weight: 600;">Read Guide &rarr;</a>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPopularGuides() {
  const container = document.getElementById('popularGuidesGrid');
  if (!container) return;

  // Selected evergreen tutorials
  const evergreenIds = [
    'best-freelancing-skills-beginners',
    'payment-methods-withdrawals-pakistani-freelancers',
    'recognize-online-earning-scams',
    'find-legitimate-remote-jobs'
  ];

  const popular = ARTICLES.filter(a => evergreenIds.includes(a.id));

  container.innerHTML = popular.map(art => `
    <article class="article-card">
      <a href="/article.html?id=${art.id}" class="card-media-wrapper" aria-label="${escapeHtml(art.title)}">
        <img src="${art.thumbnail}" alt="${escapeHtml(art.title)}" class="card-thumbnail" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
      </a>
      <div class="card-body">
        <div class="article-meta">
          <span class="meta-category">${escapeHtml(art.category)}</span>
          <span class="meta-dot">·</span>
          <span>Evergreen Guide</span>
        </div>
        <h3 class="card-title">
          <a href="/article.html?id=${art.id}">${escapeHtml(art.title)}</a>
        </h3>
        <p class="card-excerpt">${escapeHtml(art.excerpt)}</p>
        <div class="card-footer">
          <span>${art.readingTime} min read</span>
          <a href="/article.html?id=${art.id}" style="color: var(--brand-emerald); font-weight: 600;">Read Now &rarr;</a>
        </div>
      </div>
    </article>
  `).join('');
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const msg = document.getElementById('newsletterMessage');

  if (!form || !input || !msg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    // Basic RFC 5322 validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      msg.textContent = 'Please enter a valid email address (e.g., name@example.com).';
      msg.className = 'newsletter-msg error';
      return;
    }

    // Honest feedback without fabricating persistent subscription backend
    msg.textContent = `Thank you for your interest! (Demonstration: in production, this connects to your Mailchimp, ConvertKit, or newsletter backend via API webhook).`;
    msg.className = 'newsletter-msg success';
    input.value = '';
  });
}
