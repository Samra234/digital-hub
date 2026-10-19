# Digital Kamai Pakistan – Complete Blog Platform

> **Tagline:** Learn Digital Skills. Build Online Income.  
> An educational publication covering freelancing, online business, remote careers, digital skills, e-commerce, and legitimate digital platforms in Pakistan.

---

## 1. Project Overview & Architecture

Digital Kamai Pakistan is built with a pure, high-performance static web stack:
- **HTML5:** Semantic, accessible page structures with Schema.org JSON-LD structured data.
- **CSS3:** Custom design tokens, light & dark theme modes, reading progress indicator, zero-pill metadata typography, and print-friendly styles.
- **Vanilla JavaScript (ES Modules):** Modular components for navigation, theme persistence (`localStorage`), client-side instant search, dynamic filtering, safe DOM content rendering, and table of contents generation.
- **Data Architecture (`assets/js/data/articles.js`):** Extensible schema containing vetted educational guides, metadata, source links, and verification dates.

---

## 2. Running the Site Locally

### Option A: Using Any Static HTTP Server (No Build Step Required)
Because the codebase uses standard ES Modules and static HTML, you can run it with any local server:

```bash
# Using Python 3:
python3 -m http.server 3000

# Using Node npx serve:
npx serve . -p 3000

# Using VS Code Live Server extension:
# Right-click index.html -> "Open with Live Server"
```

### Option B: Using the Included Vite Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. How to Add New Articles

Articles are stored in `assets/js/data/articles.js`. To add a new article:

1. Open `assets/js/data/articles.js`.
2. Add an object to the `ARTICLES` array adhering to the schema:

```javascript
{
  id: "your-article-slug",
  title: "Your Article Title",
  slug: "your-article-slug",
  category: "Freelancing", // Must match a category name
  categorySlug: "freelancing",
  excerpt: "A concise 1-2 sentence summary of the guide.",
  thumbnail: "/assets/images/your-thumbnail.jpg",
  author: "Editorial Team",
  authorBio: "Specialist research group reviewing digital commerce in South Asia.",
  publishedAt: "2026-10-19",
  updatedAt: "2026-10-19",
  readingTime: 6,
  tags: ["freelancing", "beginners"],
  featured: false,
  verifiedAt: "2026-10-19",
  sources: [
    { title: "Official Source Name", url: "https://example.com" }
  ],
  seoTitle: "Search Engine Title (50-60 chars)",
  metaDescription: "Concise search snippet (140-160 chars)",
  content: [
    { type: "paragraph", text: "Opening introduction..." },
    { type: "heading", level: 2, id: "section-id", text: "Main Section Heading" },
    { type: "paragraph", text: "Explaining concepts with clarity..." },
    { type: "callout", tone: "info", title: "Key Rule", text: "Crucial rule to follow." },
    { type: "table", headers: ["Col 1", "Col 2"], rows: [["Val A", "Val B"]] },
    { type: "key_takeaways", items: ["Key point 1", "Key point 2"] },
    { type: "faq", items: [{ q: "Common question?", a: "Direct factual answer." }] }
  ]
}
```

3. Add the URL to `sitemap.xml`.

---

## 4. Creating & Optimizing Article Thumbnails

- **Dimensions:** 1200 x 900 px (4:3 ratio) or 1200 x 675 px (16:9 ratio).
- **Format:** Modern WebP or compressed JPG (keep file size under 120 KB).
- **Aesthetic Direction:** Use editorial, natural documentary-style photography (workspaces, laptops, notebooks, clean Pakistani or South Asian home office environments). Avoid tacky neon cyberpunk backgrounds or stock photo handshakes.
- **Storage:** Place image files inside `/assets/images/`.

---

## 5. Deploying to Netlify (or Vercel / GitHub Pages)

### Deploying to Netlify via Git:
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into [Netlify](https://app.netlify.com).
3. Click **"Add new site"** &rarr; **"Import an existing project"**.
4. Select your repository.
5. In the build settings:
   - **Build command:** (Leave empty, or use `npm run build` if building through Vite)
   - **Publish directory:** `.` (the project root, or `dist` if running `npm run build`)
6. Click **Deploy Site**.

### Deploying via Netlify Drop:
Drag and drop the entire project folder directly into [app.netlify.com/drop](https://app.netlify.com/drop) for instant deployment in seconds.

### Enabling Form Submissions on Netlify:
In `contact.html`, Netlify Forms works natively. Add `data-netlify="true"` and `name="contact"` to the `<form>` tag. Netlify will capture incoming emails automatically in your dashboard.

---

## 6. Configuring Production Domain and Canonical URLs

1. On Netlify, go to **Domain management** &rarr; **Add custom domain** (e.g., `digitalkamai.pk` or `digitalkamai.com`).
2. Add the corresponding `A` record or `CNAME` in your DNS registrar (PKNIC, GoDaddy, Namecheap).
3. Update the canonical domain in:
   - `index.html`, `category.html`, `article.html`, `search.html`, `about.html`, etc.
   - `sitemap.xml`
   - `robots.txt`
   Change `https://digitalkamai.pk/` to your registered domain.

---

## 7. Generating & Submitting Sitemap to Google Search Console

1. Ensure all published article slugs and categories are listed in `/sitemap.xml`.
2. Verify domain ownership in [Google Search Console](https://search.google.com/search-console).
3. In the left navigation, click **Sitemaps**.
4. Under **"Add a new sitemap"**, enter `sitemap.xml` and click **Submit**.
5. Google will crawl and index your canonical URLs within 24 to 72 hours.

---

## 8. Transitioning to a Headless CMS or Database Later

While the initial static JSON/JS setup is zero-maintenance and loads instantaneously, you can easily integrate a persistent backend:

- **Option 1: Supabase / Cloud SQL (PostgreSQL):**
  Create an `articles` table with matching columns (`title`, `slug`, `category`, `content_json`, `published_at`). In `assets/js/data/articles.js`, replace the static array export with an asynchronous `fetch()` call to your API endpoint or Supabase client.
- **Option 2: Headless CMS (Strapi, Sanity, or Ghost):**
  Use the headless CMS to provide an administrative publishing interface with roles and image uploads. Fetch the published JSON payload on the client or during static site generation.

---

## 9. Google AdSense Approval Guidelines

Do not apply for Google AdSense on an unfinished website. To secure approval:
1. Ensure at least 20 to 30 original, high-value articles are published (the 15 provided establish a strong foundation).
2. Confirm all utility pages are present and reachable: `About Us`, `Contact Us`, `Privacy Policy`, `Earnings Disclaimer`, and `Terms & Conditions`.
3. Have your custom domain connected with active HTTPS SSL.
4. Ensure no copyrighted or scraped content is present.
5. In `privacy-policy.html`, keep the third-party cookie and DoubleClick disclosure intact.

---

## 10. License & Copyright
&copy; 2026 Digital Kamai Pakistan. All rights reserved.
Educational and informational use only.
