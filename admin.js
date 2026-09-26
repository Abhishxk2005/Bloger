const store = window.AKCWebCraftStore;
let posts = store.readPosts();
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

function todayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readingTime(body) {
    return Math.max(1, Math.ceil(String(body || '').trim().split(/\s+/).filter(Boolean).length / 210));
}

function showToast(message) {
    const previousToast = document.querySelector('.toast');
    if (previousToast) previousToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.remove(), 2800);
}

function header() {
    return `<header class="site-header admin-site-header">
    <a class="brand" href="admin.html" aria-label="AKC WebCraft Blogger admin home"><span class="brand-mark">A</span> AKC WebCraft Blogger <span class="header-note">admin studio</span></a>
    <nav class="header-nav" aria-label="Admin navigation"><a class="button-link" href="index.html">View website</a></nav>
  </header>`;
}

function renderDashboard() {
    document.title = 'AKC WebCraft Blogger | Admin';
    document.getElementById('admin-app').innerHTML = `${header()}
    <main class="admin-shell"><div class="admin-main">
      <div class="admin-heading"><div><span class="eyebrow">Your writing desk</span><h1>The studio</h1><p>Shape a thought, save it for later, or send it out into the world.</p></div><div class="admin-actions"><label class="button button-quiet backup-button">Restore backup<input class="visually-hidden" id="restore-backup" type="file" accept="application/json,.json"></label><button class="button button-quiet" id="export-backup" type="button">Download backup <span aria-hidden="true">↓</span></button><a class="button button-primary" href="admin.html#/write">＋ &nbsp; New post</a></div></div>
      <section class="stats-grid" aria-label="Publishing overview"><div class="stat"><span class="stat-label">Published</span><strong class="stat-value">${posts.filter((post) => post.status === 'published').length}</strong></div><div class="stat"><span class="stat-label">Drafts</span><strong class="stat-value">${posts.filter((post) => post.status === 'draft').length}</strong></div><div class="stat"><span class="stat-label">Total notes</span><strong class="stat-value">${posts.length}</strong></div></section>
      <div class="admin-toolbar"><label class="visually-hidden" for="admin-search">Search posts</label><input class="admin-search" id="admin-search" type="search" placeholder="Search your posts"><label class="visually-hidden" for="status-filter">Filter by status</label><select class="filter-select" id="status-filter"><option value="all">All posts</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>
      <div class="table-wrap"><table class="posts-table"><thead><tr><th scope="col">Title</th><th scope="col">Status</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead><tbody id="admin-post-rows"></tbody></table></div>
      <p class="admin-note">Posts and uploaded covers are saved in this browser on this device. Download a backup before clearing browser data.</p>
    </div></main>`;

    const updateRows = () => {
        const query = document.getElementById('admin-search').value.trim().toLowerCase();
        const status = document.getElementById('status-filter').value;
        const filtered = posts.filter((post) => {
            const matchesText = `${post.title} ${post.category} ${post.excerpt}`.toLowerCase().includes(query);
            return matchesText && (status === 'all' || post.status === status);
        }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const tbody = document.getElementById('admin-post-rows');
        tbody.innerHTML = filtered.length ? filtered.map((post) => `<tr>
      <td class="post-cell-title">${escapeHtml(post.title)}<small>${readingTime(post.body)} min read</small></td>
      <td><span class="status-pill ${post.status === 'published' ? 'is-published' : ''}">${escapeHtml(post.status)}</span></td>
      <td>${escapeHtml(post.category)}</td><td>${escapeHtml(formatDate(post.date))}</td>
      <td><div class="row-actions"><button class="row-action" type="button" data-edit="${escapeHtml(post.id)}">Edit</button><button class="row-action" type="button" data-toggle="${escapeHtml(post.id)}">${post.status === 'published' ? 'Unpublish' : 'Publish'}</button><button class="row-action is-danger" type="button" data-delete="${escapeHtml(post.id)}">Delete</button></div></td>
    </tr>`).join('') : '<tr><td colspan="5"><div class="empty-state"><h3>No posts here</h3><p>Try another filter or write something new.</p></div></td></tr>';
    };

    document.getElementById('admin-search').addEventListener('input', updateRows);
    document.getElementById('status-filter').addEventListener('change', updateRows);
    document.getElementById('export-backup').addEventListener('click', () => {
        const backup = new Blob([JSON.stringify({ version: 1, posts }, null, 2)], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(backup);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `akc-webcraft-blogger-backup-${todayDate()}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        showToast('Your backup is ready.');
    });
    document.getElementById('restore-backup').addEventListener('change', async(event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;
        try {
            const backup = JSON.parse(await file.text());
            const restoredPosts = Array.isArray(backup) ? backup : backup && backup.posts;
            const valid = Array.isArray(restoredPosts) && restoredPosts.every((post) => post && typeof post.id === 'string' && typeof post.title === 'string' && typeof post.body === 'string' && (post.status === 'draft' || post.status === 'published'));
            if (!valid) throw new Error('Invalid post backup');
            store.savePosts(restoredPosts);
            posts = restoredPosts;
            renderDashboard();
            showToast('Backup restored.');
        } catch {
            showToast('That backup could not be read.');
        }
    });
    document.getElementById('admin-post-rows').addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        if (target.dataset.edit) {
            window.location.hash = `#/edit/${encodeURIComponent(target.dataset.edit)}`;
            return;
        }
        if (target.dataset.toggle) {
            const post = posts.find((item) => item.id === target.dataset.toggle);
            if (!post) return;
            const updatedPosts = posts.map((item) => item.id === post.id ? {...item, status: item.status === 'published' ? 'draft' : 'published', date: item.date || todayDate() } : item);
            try {
                store.savePosts(updatedPosts);
                posts = updatedPosts;
                renderDashboard();
                showToast(post.status === 'published' ? 'Note moved back to drafts.' : 'Your note is now published.');
            } catch {
                showToast('Could not save this change. Download a backup and try again.');
            }
            return;
        }
        if (target.dataset.delete) {
            const post = posts.find((item) => item.id === target.dataset.delete);
            if (!post || !window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
            const updatedPosts = posts.filter((item) => item.id !== post.id);
            try {
                store.savePosts(updatedPosts);
                posts = updatedPosts;
                renderDashboard();
                showToast('Post deleted.');
            } catch {
                showToast('Could not save this change. Download a backup and try again.');
            }
        }
    });
    updateRows();
}

function optimizeCover(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('The selected image could not be opened.'));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('The selected image could not be opened.'));
            image.onload = () => {
                const maxDimension = 1800;
                const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext('2d');
                if (!context) return reject(new Error('Image processing is unavailable in this browser.'));
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/webp', 0.82);
                if (imageData.length > 3200000) return reject(new Error('This image is too large after resizing. Choose a smaller image.'));
                resolve(imageData);
            };
            image.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}

function renderEditor(id) {
    const editing = Boolean(id);
    const post = editing ? posts.find((item) => item.id === id) : null;
    if (editing && !post) return renderNotFound();
    let selectedCover = post && post.cover && post.cover.startsWith('data:image/') ? post.cover : '';
    document.title = `${editing ? 'Edit post' : 'New post'} — AKC WebCraft Blogger`;
    document.getElementById('admin-app').innerHTML = `${header()}
    <main class="editor-shell">
      <div class="editor-top"><div><span class="eyebrow">${editing ? 'Keep shaping it' : 'A blank page'}</span><h1>${editing ? 'Edit your note' : 'Write a new note'}</h1></div><a class="button button-quiet" href="admin.html">← &nbsp; Studio</a></div>
      <form id="post-form">
        <div class="editor-fields">
          <div class="field field-full"><label for="post-title">Title</label><input id="post-title" name="title" type="text" maxlength="100" placeholder="Give this note a name" value="${escapeHtml(post && post.title)}" required></div>
          <div class="field"><label for="post-category">Category</label><input id="post-category" name="category" type="text" maxlength="30" list="category-options" placeholder="For example, Travel" value="${escapeHtml(post && post.category)}" required><datalist id="category-options"><option>Travel</option><option>Rituals</option><option>Objects</option><option>Culture</option><option>Food</option></datalist></div>
          <div class="field"><label for="post-date">Publish date</label><input id="post-date" name="date" type="date" value="${escapeHtml(post && post.date || todayDate())}" required></div>
          <div class="field field-full"><label for="post-excerpt">Short introduction</label><textarea id="post-excerpt" name="excerpt" maxlength="240" placeholder="A sentence or two to invite someone in" required>${escapeHtml(post && post.excerpt)}</textarea><span class="field-hint">This appears on the journal and below your title.</span></div>
          <div class="field field-full"><label for="cover-file">Upload cover image</label><input id="cover-file" name="coverFile" type="file" accept="image/*"><span class="field-hint">Choose a photo from this computer. It will be resized for faster loading and saved with this post.</span><img class="cover-preview" id="cover-preview" src="${escapeHtml(post && post.cover)}" alt="Selected cover preview" ${post && post.cover ? '' : 'hidden'}><p class="form-message" id="image-message" role="status"></p></div>
          <div class="field field-full"><label for="post-cover">Or use an image URL</label><input id="post-cover" name="cover" type="url" placeholder="https://…" value="${escapeHtml(post && post.cover && !post.cover.startsWith('data:image/') ? post.cover : '')}"><span class="field-hint">A URL replaces any image selected from your computer.</span></div>
          <div class="field field-full"><label for="post-alt">Image description</label><input id="post-alt" name="alt" type="text" maxlength="180" placeholder="Describe the image for readers using a screen reader" value="${escapeHtml(post && post.alt)}"></div>
          <div class="field field-full"><label for="post-body">Your story</label><textarea class="body-input" id="post-body" name="body" placeholder="Write your story here. Leave a blank line between paragraphs." required>${escapeHtml(post && post.body)}</textarea><span class="field-hint">Separate paragraphs with a blank line. Reading time is estimated automatically.</span></div>
          <div class="field field-full"><label for="post-tags">Tags</label><input id="post-tags" name="tags" type="text" placeholder="Travel, Notes, Slowing down" value="${escapeHtml(post && Array.isArray(post.tags) ? post.tags.join(', ') : '')}"><span class="field-hint">Separate tags with commas.</span></div>
          <label class="featured-toggle"><input name="featured" type="checkbox" ${post && post.featured ? 'checked' : ''}><span>Feature this note at the top of the journal</span></label>
        </div>
        <p class="form-message" id="form-message" role="alert"></p>
        <div class="editor-actions"><button class="button" type="button" id="cancel-editor">Cancel</button><div class="editor-actions-right"><button class="button" type="submit" data-status="draft">Save draft</button><button class="button button-primary" type="submit" data-status="published">${post && post.status === 'published' ? 'Save changes' : 'Publish note'} <span aria-hidden="true">↗</span></button></div></div>
      </form>
    </main>`;

    const coverFile = document.getElementById('cover-file');
    const coverUrl = document.getElementById('post-cover');
    const preview = document.getElementById('cover-preview');
    coverFile.addEventListener('change', async(event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;
        const message = document.getElementById('image-message');
        message.textContent = '';
        if (!file.type.startsWith('image/')) {
            message.textContent = 'Choose an image file.';
            coverFile.value = '';
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            message.textContent = 'Choose an image smaller than 15 MB.';
            coverFile.value = '';
            return;
        }
        try {
            selectedCover = await optimizeCover(file);
            coverUrl.value = '';
            preview.src = selectedCover;
            preview.hidden = false;
        } catch (error) {
            selectedCover = '';
            message.textContent = error.message;
            coverFile.value = '';
        }
    });
    coverUrl.addEventListener('input', () => {
        if (!coverUrl.value.trim()) return;
        selectedCover = '';
        coverFile.value = '';
        preview.src = coverUrl.value;
        preview.hidden = false;
    });
    document.getElementById('cancel-editor').addEventListener('click', () => { window.location.hash = '#/'; });
    document.getElementById('post-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const values = new FormData(form);
        const title = String(values.get('title')).trim();
        const coverUrlValue = String(values.get('cover')).trim();
        if (coverUrlValue && !/^https?:\/\//i.test(coverUrlValue)) {
            document.getElementById('form-message').textContent = 'Please use an image address starting with http:// or https://.';
            return;
        }
        const existing = editing ? posts.find((item) => item.id === id) : null;
        const status = event.submitter && event.submitter.dataset.status || 'draft';
        const updated = {
            id: existing && existing.id || `note-${Date.now().toString(36)}`,
            title,
            category: String(values.get('category')).trim(),
            date: String(values.get('date')),
            excerpt: String(values.get('excerpt')).trim(),
            cover: selectedCover || coverUrlValue || store.fallbackCover,
            alt: String(values.get('alt')).trim() || title,
            body: String(values.get('body')).trim(),
            tags: String(values.get('tags')).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
            status,
            featured: form.elements.featured.checked
        };
        let updatedPosts = existing ? posts.map((item) => item.id === id ? updated : item) : [updated, ...posts];
        if (updated.featured) updatedPosts = updatedPosts.map((item) => item.id === updated.id ? item : {...item, featured: false });
        try {
            store.savePosts(updatedPosts);
            posts = updatedPosts;
            window.location.hash = '#/';
            showToast(status === 'published' ? 'Your note is published.' : 'Draft saved on this device.');
        } catch {
            document.getElementById('form-message').textContent = 'This browser could not save the post. Download a backup or use a smaller cover image.';
        }
    });
}

function renderNotFound() {
    document.title = 'Note not found — AKC WebCraft Blogger';
    document.getElementById('admin-app').innerHTML = `${header()}<main class="article-shell"><div class="empty-state" style="margin-top: 65px"><h3>This note has wandered off</h3><p>It may have been deleted.</p><a class="article-back" href="admin.html">Return to the studio</a></div></main>`;
}

function route() {
    const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((part) => decodeURIComponent(part));
    if (parts[0] === 'write') return renderEditor();
    if (parts[0] === 'edit' && parts[1]) return renderEditor(parts[1]);
    renderDashboard();
}

window.addEventListener('hashchange', route);
route();