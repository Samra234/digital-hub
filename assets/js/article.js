/**
 * Digital Kamai Pakistan - Individual Article Reader Controller
 * Safe DOM construction, Table of Contents, Reading Progress, Social Share, and Related Articles.
 */

import { ARTICLES } from './data/articles.js';
import { escapeHtml } from './navigation.js';

export function initArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id') || params.get('slug');

  const article = ARTICLES.find(a => a.id === articleId || a.slug === articleId);

  if (!article) {
    renderArticle404();
    return;
  }

  // Update SEO metadata & JSON-LD
  updateArticleSEO(article);

  // Render Header
  renderArticleHeader(article);

  // Render Featured Image
  renderArticleMedia(article);

  // Render Structured Content Blocks
  renderArticleBody(article);

  // Generate Table of Contents
  generateTableOfContents();

  // Initialize Reading Progress Indicator
  initReadingProgressBar();

  // Initialize Social Share Buttons
  initShareButtons(article);

  // Render Post Navigation (Prev / Next)
  renderPostNavigation(article);

  // Render Related Articles Grid
  renderRelatedArticles(article);

  // Initialize Back to Top Button
  initBackToTop();
}

function updateArticleSEO(article) {
  document.title = `${article.seoTitle || article.title} – Digital Kamai Pakistan`;
  
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', article.metaDescription || article.excerpt);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', article.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', article.excerpt);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', window.location.href);

  // Canonical link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', window.location.origin + window.location.pathname + `?id=${article.id}`);

  // Inject JSON-LD Schema
  let schemaScript = document.getElementById('articleJsonLd');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'articleJsonLd';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": [window.location.origin + article.thumbnail],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": article.author,
      "url": window.location.origin + "/about.html"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Digital Kamai Pakistan",
      "url": window.location.origin,
      "logo": {
        "@type": "ImageObject",
        "url": window.location.origin + "/assets/images/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  schemaScript.textContent = JSON.stringify(schemaData);
}

function renderArticleHeader(article) {
  const breadcrumbsEl = document.getElementById('articleBreadcrumbs');
  if (breadcrumbsEl) {
    breadcrumbsEl.innerHTML = `
      <a href="/index.html">Home</a>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <a href="/category.html?c=${article.categorySlug}">${escapeHtml(article.category)}</a>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(article.title)}</span>
    `;
  }

  const headerContainer = document.getElementById('articleHeaderContent');
  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="article-header-meta">
        <a href="/category.html?c=${article.categorySlug}" class="meta-category">${escapeHtml(article.category)}</a>
        <span class="meta-dot">·</span>
        <time datetime="${article.publishedAt}">Published ${article.publishedAt}</time>
        ${article.updatedAt ? `<span class="meta-dot">·</span><span>Updated ${article.updatedAt}</span>` : ''}
        <span class="meta-dot">·</span>
        <span>${article.readingTime} min read</span>
      </div>
      <h1 class="article-header-title">${escapeHtml(article.title)}</h1>
      <p class="article-lead">${escapeHtml(article.excerpt)}</p>
      <div class="article-author-card">
        <div class="author-avatar" aria-hidden="true">DK</div>
        <div>
          <div class="author-info-name">${escapeHtml(article.author)}</div>
          <div class="author-info-bio">${escapeHtml(article.authorBio)}</div>
        </div>
      </div>
    `;
  }
}

function renderArticleMedia(article) {
  const mediaContainer = document.getElementById('articleFeaturedMedia');
  if (mediaContainer) {
    mediaContainer.innerHTML = `
      <img src="${article.thumbnail}" alt="${escapeHtml(article.title)}" class="article-featured-img" loading="eager" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
    `;
  }
}

/**
 * Safe DOM construction: renders structured blocks without untrusted raw innerHTML.
 */
function renderArticleBody(article) {
  const bodyContainer = document.getElementById('articleBody');
  if (!bodyContainer) return;
  bodyContainer.innerHTML = '';

  const blocks = article.content || [];

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading': {
        const heading = document.createElement(`h${block.level || 2}`);
        heading.id = block.id || slugify(block.text);
        heading.textContent = block.text;
        bodyContainer.appendChild(heading);
        break;
      }

      case 'paragraph': {
        const p = document.createElement('p');
        p.textContent = block.text;
        bodyContainer.appendChild(p);
        break;
      }

      case 'callout': {
        const callout = document.createElement('div');
        callout.className = `callout-box tone-${block.tone || 'info'}`;
        const title = document.createElement('div');
        title.className = 'callout-title';
        title.textContent = block.title;
        const text = document.createElement('div');
        text.className = 'callout-text';
        text.textContent = block.text;
        callout.appendChild(title);
        callout.appendChild(text);
        bodyContainer.appendChild(callout);
        break;
      }

      case 'list': {
        const ul = document.createElement('ul');
        ul.style.paddingLeft = '1.5rem';
        ul.style.marginBottom = '1.6rem';
        (block.items || []).forEach(itemText => {
          const li = document.createElement('li');
          li.style.marginBottom = '0.5rem';
          li.textContent = itemText;
          ul.appendChild(li);
        });
        bodyContainer.appendChild(ul);
        break;
      }

      case 'table': {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        const table = document.createElement('table');
        table.className = 'article-table';

        if (block.headers && block.headers.length) {
          const thead = document.createElement('thead');
          const tr = document.createElement('tr');
          block.headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            tr.appendChild(th);
          });
          thead.appendChild(tr);
          table.appendChild(thead);
        }

        if (block.rows && block.rows.length) {
          const tbody = document.createElement('tbody');
          block.rows.forEach(rowData => {
            const tr = document.createElement('tr');
            rowData.forEach(cell => {
              const td = document.createElement('td');
              td.textContent = cell;
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          table.appendChild(tbody);
        }

        wrapper.appendChild(table);
        bodyContainer.appendChild(wrapper);
        break;
      }

      case 'key_takeaways': {
        const box = document.createElement('div');
        box.className = 'takeaways-box';
        const title = document.createElement('div');
        title.className = 'takeaways-title';
        title.textContent = 'Key Takeaways';
        const ul = document.createElement('ul');
        ul.className = 'takeaways-list';
        (block.items || []).forEach(item => {
          const li = document.createElement('li');
          li.className = 'takeaway-item';
          li.textContent = item;
          ul.appendChild(li);
        });
        box.appendChild(title);
        box.appendChild(ul);
        bodyContainer.appendChild(box);
        break;
      }

      case 'pros_cons': {
        const grid = document.createElement('div');
        grid.className = 'pros-cons-grid';

        const prosCard = document.createElement('div');
        prosCard.className = 'pros-card';
        const prosTitle = document.createElement('div');
        prosTitle.className = 'pros-title';
        prosTitle.textContent = 'Advantages / Opportunities';
        const prosUl = document.createElement('ul');
        prosUl.className = 'pros-list';
        (block.pros || []).forEach(p => {
          const li = document.createElement('li');
          li.textContent = p;
          prosUl.appendChild(li);
        });
        prosCard.appendChild(prosTitle);
        prosCard.appendChild(prosUl);

        const consCard = document.createElement('div');
        consCard.className = 'cons-card';
        const consTitle = document.createElement('div');
        consTitle.className = 'cons-title';
        consTitle.textContent = 'Risks / Considerations';
        const consUl = document.createElement('ul');
        consUl.className = 'cons-list';
        (block.cons || []).forEach(c => {
          const li = document.createElement('li');
          li.textContent = c;
          consUl.appendChild(li);
        });
        consCard.appendChild(consTitle);
        consCard.appendChild(consUl);

        grid.appendChild(prosCard);
        grid.appendChild(consCard);
        bodyContainer.appendChild(grid);
        break;
      }

      case 'faq': {
        const faqSection = document.createElement('div');
        faqSection.className = 'faq-section';
        const h3 = document.createElement('h3');
        h3.id = 'frequently-asked-questions';
        h3.textContent = 'Frequently Asked Questions';
        faqSection.appendChild(h3);

        (block.items || []).forEach(item => {
          const faqItem = document.createElement('div');
          faqItem.className = 'faq-item';

          const questionBtn = document.createElement('button');
          questionBtn.className = 'faq-question';
          questionBtn.innerHTML = `<span>${escapeHtml(item.q)}</span><span style="font-size: 1.25rem;">+</span>`;
          
          const answerDiv = document.createElement('div');
          answerDiv.className = 'faq-answer';
          answerDiv.textContent = item.a;

          questionBtn.addEventListener('click', () => {
            const isOpen = faqItem.classList.contains('open');
            faqItem.classList.toggle('open', !isOpen);
            questionBtn.querySelector('span:last-child').textContent = isOpen ? '+' : '−';
          });

          faqItem.appendChild(questionBtn);
          faqItem.appendChild(answerDiv);
          faqSection.appendChild(faqItem);
        });

        bodyContainer.appendChild(faqSection);
        break;
      }
    }
  });

  // Render Verification & Official Sources Box if sources exist
  if (article.sources && article.sources.length) {
    const vBox = document.createElement('div');
    vBox.className = 'verification-box';
    vBox.innerHTML = `
      <div class="verification-heading">Official References & Fact Checking</div>
      <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: 0.5rem;">
        This article was reviewed on <strong>${article.verifiedAt || article.publishedAt}</strong> against official documentation and regulatory frameworks.
      </p>
      <ul class="sources-list">
        ${article.sources.map(s => `
          <li class="source-item">
            &bull; <a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>
          </li>
        `).join('')}
      </ul>
    `;
    bodyContainer.appendChild(vBox);
  }
}

function generateTableOfContents() {
  const bodyContainer = document.getElementById('articleBody');
  const tocContainer = document.getElementById('articleTocList');
  if (!bodyContainer || !tocContainer) return;

  const headings = bodyContainer.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    const rail = document.querySelector('.article-toc-rail');
    if (rail) rail.style.display = 'none';
    return;
  }

  tocContainer.innerHTML = '';
  headings.forEach(h => {
    const id = h.id || slugify(h.textContent);
    h.id = id;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.className = `toc-link ${h.tagName.toLowerCase()}`;
    a.textContent = h.textContent;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    });
    li.appendChild(a);
    tocContainer.appendChild(li);
  });

  // Track active heading on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        document.querySelectorAll('.toc-link').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
      }
    });
  }, { rootMargin: '0px 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

function initReadingProgressBar() {
  const bar = document.querySelector('.reading-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }, { passive: true });
}

function initShareButtons(article) {
  const currentUrl = window.location.href;
  const title = article.title;

  const waBtn = document.getElementById('shareWhatsAppBtn');
  const fbBtn = document.getElementById('shareFacebookBtn');
  const copyBtn = document.getElementById('shareCopyLinkBtn');

  waBtn?.addEventListener('click', () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + currentUrl)}`, '_blank');
  });

  fbBtn?.addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<span>✓ Copied!</span>`;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch {
      alert('Article link: ' + currentUrl);
    }
  });
}

function renderPostNavigation(currentArticle) {
  const container = document.getElementById('postNavigation');
  if (!container) return;

  const currentIndex = ARTICLES.findIndex(a => a.id === currentArticle.id);
  const prevArticle = currentIndex > 0 ? ARTICLES[currentIndex - 1] : null;
  const nextArticle = currentIndex < ARTICLES.length - 1 ? ARTICLES[currentIndex + 1] : null;

  container.innerHTML = `
    ${prevArticle ? `
      <a href="/article.html?id=${prevArticle.id}" class="post-nav-card" style="text-align: left;">
        <span class="post-nav-direction">&larr; Previous Article</span>
        <span class="post-nav-title">${escapeHtml(prevArticle.title)}</span>
      </a>
    ` : '<div></div>'}
    ${nextArticle ? `
      <a href="/article.html?id=${nextArticle.id}" class="post-nav-card" style="text-align: right;">
        <span class="post-nav-direction">Next Article &rarr;</span>
        <span class="post-nav-title">${escapeHtml(nextArticle.title)}</span>
      </a>
    ` : '<div></div>'}
  `;
}

function renderRelatedArticles(currentArticle) {
  const container = document.getElementById('relatedArticlesGrid');
  if (!container) return;

  const related = ARTICLES.filter(a => a.id !== currentArticle.id && (
    a.categorySlug === currentArticle.categorySlug ||
    a.tags.some(t => currentArticle.tags.includes(t))
  )).slice(0, 3);

  if (related.length === 0) {
    document.getElementById('relatedArticlesSection')?.remove();
    return;
  }

  container.innerHTML = related.map(art => `
    <article class="article-card">
      <a href="/article.html?id=${art.id}" class="card-media-wrapper" aria-label="${escapeHtml(art.title)}">
        <img src="${art.thumbnail}" alt="${escapeHtml(art.title)}" class="card-thumbnail" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/hero.jpg';">
      </a>
      <div class="card-body">
        <div class="article-meta">
          <span class="meta-category">${escapeHtml(art.category)}</span>
          <span class="meta-dot">·</span>
          <span>${art.readingTime} min read</span>
        </div>
        <h3 class="card-title">
          <a href="/article.html?id=${art.id}">${escapeHtml(art.title)}</a>
        </h3>
        <p class="card-excerpt">${escapeHtml(art.excerpt)}</p>
      </div>
    </article>
  `).join('');
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function renderArticle404() {
  document.title = 'Article Not Found – Digital Kamai Pakistan';
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div class="container" style="padding: 6rem 1.5rem; text-align: center;">
        <div class="empty-state">
          <h1 class="empty-title" style="font-size: 2rem;">Article Not Found</h1>
          <p class="empty-desc">The educational guide you are looking for may have been moved, renamed, or is currently under editorial revision.</p>
          <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="/index.html" class="btn-primary">Return to Home</a>
            <a href="/category.html?c=freelancing" class="btn-secondary">Browse Freelance Guides</a>
          </div>
        </div>
      </div>
    `;
  }
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
