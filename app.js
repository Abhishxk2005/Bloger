(() => {
        const fallbackCover = window.AKCWebCraftStore.fallbackCover;

        let posts = window.AKCWebCraftStore.readPosts();
        let selectedCategory = 'All notes';
        let searchTerm = '';
        let toastTimer;

        function escapeHtml(value) {
            const text = value === null || value === undefined ? '' : value;
            return String(text).replace(/[&<>"']/g, (character) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[character]);
        }

        function formatDate(value) {
            if (!value) return 'Undated';
            const date = new Date(`${value}T12:00:00`);
            if (Number.isNaN(date.getTime())) return 'Undated';
            return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
        }

        function readingTime(body) {
            return Math.max(1, Math.ceil(String(body || '').trim().split(/\s+/).filter(Boolean).length / 210));
        }

        function publishedPosts() {
            return posts.filter((post) => post.status === 'published').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        }

        function header() {
            return `<header class="site-header">
    <a class="brand" href="#/" aria-label="AKC WebCraft Blogger home"><span class="brand-mark">A</span> AKC WebCraft Blogger</a>
    <nav class="header-nav" aria-label="Main navigation">
      <a href="#notes-title">Journal</a>
    </nav>
  </header>`;
        }

        function cardMarkup(post) {
            return `<article class="post-card">
    <a class="post-card-image" href="#/post/${encodeURIComponent(post.id)}" aria-label="Read ${escapeHtml(post.title)}">
      <img src="${escapeHtml(post.cover || fallbackCover)}" alt="${escapeHtml(post.alt || post.title)}" loading="lazy">
      <span class="category-stamp">${escapeHtml(post.category)}</span>
    </a>
    <div class="post-card-copy">
      <div class="post-card-meta"><span>${escapeHtml(formatDate(post.date))}</span><span>·</span><span>${readingTime(post.body)} min read</span></div>
      <h3><a href="#/post/${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
    </div>
  </article>`;
        }

        function featureMarkup(post) {
            if (!post) return '';
            return `<section class="featured" aria-label="Featured article">
    <div class="featured-copy">
      <div>
        <span class="eyebrow">This week’s fieldnote</span>
        <h2>${escapeHtml(post.title)}</h2>
        <p class="featured-description">${escapeHtml(post.excerpt)}</p>
      </div>
      <div class="featured-bottom">
        <span class="meta">${escapeHtml(formatDate(post.date))} &nbsp;·&nbsp; ${readingTime(post.body)} min read</span>
        <a class="button button-light" href="#/post/${encodeURIComponent(post.id)}">Read the story <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <a class="featured-image" href="#/post/${encodeURIComponent(post.id)}" aria-label="Read ${escapeHtml(post.title)}">
      <img src="${escapeHtml(post.cover || fallbackCover)}" alt="${escapeHtml(post.alt || post.title)}">
      <span class="featured-caption">${escapeHtml(post.category)} · AKC WebCraft Blogger</span>
    </a>
  </section>`;
        }

        function renderHome() {
            const categories = ['All notes', ...new Set(publishedPosts().map((post) => post.category).filter(Boolean))];
            document.title = 'AKC WebCraft Blogger — A journal for noticing';
            document.getElementById('app').innerHTML = `${header()}
    <main class="page-shell">
      <section class="home-intro">
        <div><span class="eyebrow">Stories for the curious</span><h1 class="home-title">A journal for <em>noticing.</em></h1></div>
        <p class="intro-aside"><strong>AKC WebCraft Blogger is a collection of stories</strong> on place, practice, and the lovely details we almost miss.</p>
      </section>
      <div id="featured-wrap"></div>
      <section aria-labelledby="notes-title">
        <div class="section-head"><h2 id="notes-title">The journal</h2><span class="section-kicker">A little something to sit with</span></div>
        <div class="journal-tools">
          <div class="filter-row" aria-label="Filter by category">${categories.map((category) => `<button class="filter-chip" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === selectedCategory}">${escapeHtml(category)}</button>`).join('')}</div>
          <label class="search-label"><span class="visually-hidden">Search journal</span><input class="admin-search" id="journal-search" type="search" placeholder="Search stories" value="${escapeHtml(searchTerm)}"></label>
        </div>
        <div class="post-grid" id="post-results"></div>
      </section>
      <section class="newsletter">
        <div><span class="section-kicker">A journal grows one story at a time</span><h2>Have something on your mind?</h2><p>Make a little room for it. Your next note can start here.</p></div>
        <a class="button button-primary newsletter-action" href="#notes-title">Explore stories <span aria-hidden="true">↗</span></a>
      </section>
      ${footer()}
    </main>`;

  const updateResults = () => {
    const all = publishedPosts();
    const term = searchTerm.trim().toLocaleLowerCase();
    const matches = all.filter((post) => {
      const text = `${post.title} ${post.excerpt} ${post.category} ${(post.tags || []).join(' ')}`.toLocaleLowerCase();
      return (selectedCategory === 'All notes' || post.category === selectedCategory) && (!term || text.includes(term));
    });
    const showFeature = !term && selectedCategory === 'All notes';
    const feature = showFeature ? all.find((post) => post.featured) || all[0] : null;
    document.getElementById('featured-wrap').innerHTML = featureMarkup(feature);
    const cards = feature && matches.length > 1 ? matches.filter((post) => post.id !== feature.id) : matches;
    document.getElementById('post-results').innerHTML = cards.length
      ? cards.map(cardMarkup).join('')
      : '<div class="empty-state"><h3>No notes found</h3><p>Try a different search, or choose another category.</p></div>';
    document.querySelectorAll('[data-category]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.category === selectedCategory));
    });
  };

  document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    updateResults();
  }));
  document.getElementById('journal-search').addEventListener('input', (event) => {
    searchTerm = event.currentTarget.value;
    updateResults();
    const input = document.getElementById('journal-search');
    input.focus();
    input.setSelectionRange(searchTerm.length, searchTerm.length);
  });
  updateResults();
}

function footer() {
  return `<footer class="site-footer"><span>AKC WebCraft Blogger · Made with care</span><span>© ${new Date().getFullYear()} · A little room to notice</span></footer>`;
}

function renderArticle(id) {
  const post = publishedPosts().find((item) => item.id === id);
  if (!post) return renderNotFound();
  document.title = `${post.title} — AKC WebCraft Blogger`;
  const paragraphs = String(post.body || '').split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('');
  document.getElementById('app').innerHTML = `${header()}
    <main class="article-shell">
      <a class="article-back" href="#/">← &nbsp; Back to the journal</a>
      <header class="article-header"><span class="eyebrow">${escapeHtml(post.category)}</span><h1 class="article-title">${escapeHtml(post.title)}</h1><p class="article-deck">${escapeHtml(post.excerpt)}</p><div class="article-byline"><span>AKC WebCraft Blogger</span><span>·</span><time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time><span>·</span><span>${readingTime(post.body)} min read</span></div></header>
      <img class="article-cover" src="${escapeHtml(post.cover || fallbackCover)}" alt="${escapeHtml(post.alt || post.title)}">
      <div class="article-content">${paragraphs}</div>
      <div class="article-tags">${(post.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      ${footer()}
    </main>`;

  }

  function renderAdmin() {
    // Admin rendering logic here
  }
function renderNotFound() {
  document.title = 'Note not found — AKC WebCraft Blogger';
  document.getElementById('app').innerHTML = `${header()}<main class="article-shell"><div class="empty-state" style="margin-top: 65px"><h3>This note has wandered off</h3><p>It may be a draft, or the link may have changed.</p><a class="article-back" href="#/">Return to the journal</a></div></main>`;
}

  function renderNotFound() {
    document.title = 'Note not found — AKC WebCraft Blogger';
    document.getElementById('app').innerHTML = `${header()}<main class="article-shell"><div class="empty-state" style="margin-top: 65px"><h3>This note has wandered off</h3><p>It may be a draft, or the link may have changed.</p><a class="article-back" href="#/">Return to the journal</a></div></main>`;
  }
function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.remove(), 2800);
}

function route() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  if (parts[0] === 'post' && parts[1]) return renderArticle(parts[1]);
  selectedCategory = 'All notes';
  searchTerm = '';
  renderHome();
}

window.addEventListener('hashchange', route);
route();
})();