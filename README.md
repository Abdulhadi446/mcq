# 🧠 Infinite MCQ Generator

A production-ready static HTML app that generates endless multiple-choice questions using **Sodeom AI**. No server required — just deploy and go!

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-brightgreen.svg)](#seo-features)

## ✨ Features

- **♾️ Infinite questions** — AI generates unique MCQs on any topic
- **🎯 Adaptive difficulty** — 7 levels from Beginner to Master
- **📚 Feed-style UI** — All questions stay visible for review
- **💡 Instant feedback** — Explanations after each answer
- **📊 Score tracking** — Track progress, streaks & accuracy
- **📱 PWA support** — Install as an app on any device
- **🌙 Dark/Light mode** — Respects system preference
- **♿ Accessible** — WCAG 2.1 compliant
- **🔍 SEO optimized** — Schema markup, meta tags, sitemap
- **⚡ Performance** — Service worker caching, lazy loading

## 🚀 Quick Start

### Local Development

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve . -p 8080

# Using PHP
php -S localhost:8080
```

Then open [http://localhost:8080](http://localhost:8080)

### Production Deployment

#### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

#### Deploy to Netlify

```bash
# Drag & drop the folder to netlify.com
# Or use CLI:
npm i -g netlify-cli
netlify deploy --prod
```

#### Deploy to GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select branch and save

#### Deploy to Cloudflare Pages

1. Connect your GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Build command: (none needed)
3. Output directory: `/`

## 📖 How It Works

1. **Enter a topic** (e.g., "JavaScript", "World History", "Biology")
2. **Click Start** to begin the quiz
3. **Select an answer** — see instant feedback with explanation
4. **Keep going** — questions auto-advance and difficulty adapts to your performance
5. **Review** — scroll up to see past questions anytime

### Difficulty System

| Level           | Requirement               |
| --------------- | ------------------------- |
| 🟦 Beginner     | Starting level            |
| 🟩 Easy         | 2+ streak, 50%+ accuracy  |
| 🟨 Medium       | 3+ streak, 60%+ accuracy  |
| 🟧 Intermediate | 4+ streak, 65%+ accuracy  |
| 🟥 Advanced     | 5+ streak, 70%+ accuracy  |
| 🟪 Expert       | 7+ streak, 75%+ accuracy  |
| 💗 Master       | 10+ streak, 80%+ accuracy |

## 🛠 Tech Stack

- **Frontend**: Pure HTML5, CSS3, ES6+ JavaScript
- **AI**: [Sodeom AI API](https://sodeom.com/ai)
- **Storage**: localStorage
- **PWA**: Service Worker + Web App Manifest

## 📁 Project Structure

```
mcq/
├── index.html              # Main page (SEO optimized)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── robots.txt              # Search engine directives
├── sitemap.xml             # XML sitemap
├── assets/
│   ├── css/
│   │   └── styles.css      # Production CSS
│   └── images/
│       ├── favicon.svg     # Vector favicon
│       ├── icon-*.png      # PWA icons (create these)
│       └── og-image.png    # Social share image (create this)
├── src/
│   ├── app.js              # Main app logic
│   ├── api.js              # Sodeom AI integration
│   └── storage.js          # localStorage helpers
└── README.md
```

## 🔍 SEO Features

- ✅ Semantic HTML5 structure
- ✅ Open Graph meta tags
- ✅ Twitter Card support
- ✅ JSON-LD structured data (WebApplication, FAQPage, HowTo)
- ✅ XML Sitemap
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Mobile-friendly responsive design

## 🗣 AEO (Answer Engine Optimization)

Optimized for voice search and AI assistants:

- FAQ schema for common questions
- HowTo schema for usage instructions
- Clear, concise content structure
- Question-based headings

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Skip to main content link
- High contrast mode support
- Reduced motion support
- Screen reader friendly

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file for custom settings:

```env
# Custom API endpoint (if self-hosting Sodeom)
VITE_API_URL=https://your-api.com/ai
```

### Customization

Edit `src/api.js` to modify:

- Question format and style
- Difficulty thresholds
- Duplicate detection sensitivity

Edit `assets/css/styles.css` for:

- Color scheme (CSS variables)
- Layout and spacing
- Animation preferences

## 📊 Analytics (Optional)

Add your analytics script to `index.html`:

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
></script>

<!-- Plausible (privacy-friendly) -->
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
></script>
```

## 🖼 Required Assets

Create these images for full PWA/SEO support:

| File             | Size     | Purpose      |
| ---------------- | -------- | ------------ |
| `icon-72.png`    | 72x72    | PWA icon     |
| `icon-96.png`    | 96x96    | PWA icon     |
| `icon-128.png`   | 128x128  | PWA icon     |
| `icon-144.png`   | 144x144  | PWA icon     |
| `icon-152.png`   | 152x152  | iOS icon     |
| `icon-192.png`   | 192x192  | PWA icon     |
| `icon-384.png`   | 384x384  | PWA icon     |
| `icon-512.png`   | 512x512  | PWA splash   |
| `og-image.png`   | 1200x630 | Social share |
| `favicon-16.png` | 16x16    | Favicon      |
| `favicon-32.png` | 32x32    | Favicon      |

Use the provided `favicon.svg` as the base for generating these.

## 🐛 Troubleshooting

### Questions not loading?

1. Check browser console for errors
2. Ensure you have internet connection (API requires it)
3. Try a different topic

### Service worker issues?

```javascript
// Clear SW and caches in browser console:
navigator.serviceWorker
  .getRegistrations()
  .then((regs) => regs.forEach((reg) => reg.unregister()));
caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
```

### PWA not installing?

- Must be served over HTTPS (or localhost)
- manifest.json must be valid
- At least one 192x192 and 512x512 icon required

## 📄 License

MIT — Use freely for personal and commercial projects.

---

Built with ❤️ using [Sodeom AI](https://sodeom.com)
