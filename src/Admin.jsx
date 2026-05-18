import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from './supabaseClient';
import AdminLogin from './AdminLogin';
import { slugify, mdComponents, BLOG_CATEGORIES } from './Blog';
import './Admin.css';
import './Blog.css';

/* ─── Templates inserted by the "Add block" toolbar ─── */
const BLOCK_TEMPLATES = {
  qa: '\n\n```qa\nQ: Replace with your question.\nA: Replace with your answer.\n\nQ: Add another question?\nA: …and another answer.\n```\n\n',
  quote: '\n\n```quote\nA short, memorable line worth pausing on.\n— Optional attribution\n```\n\n',
  gallery: '\n\n```gallery\nhttps://image-url-1.jpg | Optional caption\nhttps://image-url-2.jpg | Optional caption\nhttps://image-url-3.jpg\n```\n\n',
  callout: '\n\n```callout\nA highlighted thought you want the reader to sit with for a moment.\n```\n\n',
  quiz: '\n\n```quiz\nWhat matters most to you in a connection?\n- Honesty above all\n- Shared sense of humour\n- Being deeply seen\n- Quiet companionship\nResult: There is no wrong answer — but the way you answer says something about how you might show up on LoveHuddle.\n```\n\n',
  safety: '\n\n```safety\nTitle: LoveHuddle Safety — While You Read\nSubtitle: How we protect every user, every Huddle\n- ✅ Identity Verification | Every profile is verified before they can Huddle.\n- 🧠 AI-Huddle-Core™ Shield | Proactive AI monitoring flags unsafe behaviour.\n- 🔒 End-to-End Encryption | Your conversations are private. Always.\n- 🚨 One-Tap Report & Block | Instant action, reviewed within 2 hours.\n```\n\n',
};

/* ─── Simple hash function (mirrors AdminLogin) ─── */
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_EMAIL_HASH = '64ed0ba515499df72d7189b86918eb14c3bb8ade485b22b1a765244e0bf7394c';
const DEFAULT_PASS_HASH = '2a0d7f9051e18f1e1c051a0e8858de9ba4f813fbadebcd50e468fd6cbb78edbd';

/* ─── Toast Component ─── */
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`admin-toast admin-toast-${type}`}>
            <span>{type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <p>{message}</p>
        </div>
    );
}

function Admin({ posts, onAddPost, onDeletePost, onEditPost, waitlist = [] }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('articles');
    const [toast, setToast] = useState(null);

    /* ── Blog form state ── */
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    const [subtitle, setSubtitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
    const [category, setCategory] = useState('Founder Notes');
    const [featured, setFeatured] = useState(false);
    const [published, setPublished] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    /* ── Auto-generate slug from title until user edits it ── */
    useEffect(() => {
        if (!slugTouched) setSlug(slugify(title));
    }, [title, slugTouched]);

    /* ── Content textarea ref + cursor-aware insert ── */
    const contentRef = useRef(null);
    const insertAtCursor = (text) => {
        const ta = contentRef.current;
        if (!ta) {
            setContent(prev => (prev ? prev + text : text));
            return;
        }
        const start = ta.selectionStart ?? content.length;
        const end = ta.selectionEnd ?? content.length;
        const next = content.slice(0, start) + text + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + text.length;
            ta.setSelectionRange(pos, pos);
        });
    };

    /* ── Upload an image directly into the article body ── */
    const handleInlineImageUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please choose an image file.', 'error');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            showToast('Image must be under 8MB.', 'error');
            return;
        }
        setUploading(true);
        try {
            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
            const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(safeName, file, {
                    cacheControl: '31536000',
                    upsert: false,
                    contentType: file.type,
                });
            if (uploadError) throw uploadError;
            const { data: publicUrl } = supabase.storage
                .from('blog-images')
                .getPublicUrl(safeName);
            insertAtCursor(`\n\n![Describe this image](${publicUrl.publicUrl})\n\n`);
            showToast('Image added to your article.');
        } catch (err) {
            const msg = err?.message || 'Upload failed.';
            showToast(msg.includes('bucket') ? 'Storage bucket "blog-images" missing — run the latest supabase-setup.sql in Supabase.' : msg, 'error');
        }
        setUploading(false);
    };

    /* ── Password change state ── */
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState('');

    /* ── Waitlist search ── */
    const [searchQuery, setSearchQuery] = useState('');

    /* ── Check session on mount ── */
    useEffect(() => {
        try {
            const session = JSON.parse(localStorage.getItem('lh_admin_session'));
            if (session && session.authenticated && session.expiry > Date.now()) {
                setIsAuthenticated(true);
            }
        } catch { /* invalid session */ }
    }, []);

    /* ── Show login if not authenticated ── */
    if (!isAuthenticated) {
        return <AdminLogin onLogin={setIsAuthenticated} />;
    }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    /* ── Logout ── */
    const handleLogout = () => {
        localStorage.removeItem('lh_admin_session');
        setIsAuthenticated(false);
    };

    /* ── Reset all blog form fields ── */
    const resetForm = () => {
        setTitle('');
        setSlug('');
        setSlugTouched(false);
        setSubtitle('');
        setExcerpt('');
        setContent('');
        setCoverImageUrl('');
        setMetaDescription('');
        setVideoEmbedUrl('');
        setCategory('Founder Notes');
        setFeatured(false);
        setPublished(true);
        setShowPreview(false);
    };

    /* ── Submit blog post (create or edit) ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        const finalSlug = (slug.trim() || slugify(title)).trim();
        const finalExcerpt = excerpt.trim() || subtitle.trim() || content.trim().replace(/[#*_`>]/g, '').substring(0, 160).trim() + '…';

        const payload = {
            title: title.trim(),
            slug: finalSlug,
            subtitle: subtitle.trim(),
            excerpt: finalExcerpt,
            content: content.trim(),
            cover_image_url: coverImageUrl.trim(),
            meta_description: metaDescription.trim(),
            video_embed_url: videoEmbedUrl.trim(),
            category,
            featured,
            published,
        };

        try {
            if (editingPost) {
                const result = await onEditPost({ ...editingPost, ...payload });
                if (result && result.error) throw result.error;
                showToast('Article updated successfully!');
            } else {
                const result = await onAddPost({
                    id: Date.now(),
                    ...payload,
                    date: new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }),
                });
                if (result && result.error) throw result.error;
                showToast('Article published successfully!');
            }
            setEditingPost(null);
            resetForm();
        } catch (err) {
            const msg = err?.message || 'Failed to save article.';
            showToast(msg.includes('duplicate') ? 'That slug already exists. Choose another.' : msg, 'error');
        }
    };

    /* ── Image upload (Supabase Storage → blog-images bucket) ── */
    const handleImageUpload = async (file, setter) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please choose an image file.', 'error');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            showToast('Image must be under 8MB.', 'error');
            return;
        }
        setUploading(true);
        try {
            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
            const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(safeName, file, {
                    cacheControl: '31536000',
                    upsert: false,
                    contentType: file.type,
                });
            if (uploadError) throw uploadError;
            const { data: publicUrl } = supabase.storage
                .from('blog-images')
                .getPublicUrl(safeName);
            setter(publicUrl.publicUrl);
            showToast('Image uploaded.');
        } catch (err) {
            const msg = err?.message || 'Upload failed.';
            showToast(msg.includes('bucket') ? 'Storage bucket "blog-images" missing — run the latest supabase-setup.sql in Supabase.' : msg, 'error');
        }
        setUploading(false);
    };

    /* ── Start editing ── */
    const startEdit = (post) => {
        setEditingPost(post);
        setTitle(post.title || '');
        setSlug(post.slug || slugify(post.title || ''));
        setSlugTouched(true);
        setSubtitle(post.subtitle || '');
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setCoverImageUrl(post.cover_image_url || '');
        setMetaDescription(post.meta_description || '');
        setVideoEmbedUrl(post.video_embed_url || '');
        setCategory(post.category || 'Founder Notes');
        setFeatured(post.featured === true);
        setPublished(post.published !== false);
        setActiveTab('articles');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingPost(null);
        resetForm();
    };

    /* ── Delete with confirmation ── */
    const handleDelete = (id) => {
        onDeletePost(id);
        setDeleteConfirm(null);
        showToast('Article deleted.');
    };

    /* ── Change password ── */
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassError('');

        if (newPass.length < 8) {
            setPassError('New password must be at least 8 characters.');
            return;
        }
        if (newPass !== confirmPass) {
            setPassError('New passwords do not match.');
            return;
        }

        setPassLoading(true);
        try {
            const currentHash = await hashString(currentPass);
            const storedPassHash = localStorage.getItem('lh_admin_pass_hash') || DEFAULT_PASS_HASH;

            if (currentHash !== storedPassHash) {
                setPassError('Current password is incorrect.');
                setPassLoading(false);
                return;
            }

            const newHash = await hashString(newPass);
            localStorage.setItem('lh_admin_pass_hash', newHash);

            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
            showToast('Password changed successfully!');
        } catch {
            setPassError('Failed to change password. Please try again.');
        }
        setPassLoading(false);
    };

    /* ── Export waitlist ── */
    const exportWaitlist = () => {
        if (waitlist.length === 0) {
            showToast('No signups to export.', 'error');
            return;
        }
        const header = 'Email,Date Joined\n';
        const rows = waitlist.map(e => `"${e.email}","${e.date}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lovehuddle-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Waitlist exported as CSV!');
    };

    /* ── Filtered waitlist ── */
    const filteredWaitlist = waitlist.filter(e =>
        e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-dashboard animate-fade-in">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-row">
                    <Link to="/" className="btn-back">← Back to Site</Link>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
                <h2>Admin Dashboard</h2>
                <p>Manage LoveHuddle Articles, Waitlist & Settings</p>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('articles')}
                >
                    📝 Articles
                </button>
                <button
                    className={`admin-tab ${activeTab === 'waitlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('waitlist')}
                >
                    📋 Waitlist ({waitlist.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
            </div>

            <div className="admin-content">
                {/* ═══════ ARTICLES TAB ═══════ */}
                {activeTab === 'articles' && (
                    <>
                        {/* Create / Edit Form */}
                        <section className="admin-section glass">
                            <h3>{editingPost ? 'Edit Article' : 'Create New Article'}</h3>
                            <form className="admin-form" onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Title <span className="char-count">required</span></label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Article title"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        URL slug
                                        <span className="char-count">/blog/{slug || 'auto-generated'}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                                        placeholder="auto-generated from title"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Subtitle (optional)</label>
                                    <input
                                        type="text"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        placeholder="A short, evocative line shown under the title"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Category <span className="char-count">colours the post tag on /blog</span></label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {BLOG_CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Cover image</label>
                                    {coverImageUrl && (
                                        <div className="admin-cover-preview">
                                            <img src={coverImageUrl} alt="Cover preview" />
                                            <button type="button" className="btn-secondary" onClick={() => setCoverImageUrl('')}>
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    <div className="admin-upload-row">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files?.[0], setCoverImageUrl)}
                                            disabled={uploading}
                                        />
                                        <input
                                            type="url"
                                            value={coverImageUrl}
                                            onChange={(e) => setCoverImageUrl(e.target.value)}
                                            placeholder="…or paste an image URL"
                                        />
                                    </div>
                                    {uploading && <p className="admin-help">Uploading…</p>}
                                </div>

                                <div className="input-group">
                                    <label>Video embed URL (optional)</label>
                                    <input
                                        type="url"
                                        value={videoEmbedUrl}
                                        onChange={(e) => setVideoEmbedUrl(e.target.value)}
                                        placeholder="YouTube or Vimeo URL — appears under the title"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        Content
                                        <span className="char-count">{content.length} chars</span>
                                    </label>

                                    <div className="admin-block-toolbar" role="toolbar" aria-label="Insert a content block">
                                        <span className="admin-block-toolbar-label">Add a block:</span>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.qa)}>
                                            <span aria-hidden="true">💬</span> Q&amp;A
                                        </button>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.quote)}>
                                            <span aria-hidden="true">❝</span> Pull quote
                                        </button>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.gallery)}>
                                            <span aria-hidden="true">🖼</span> Photo gallery
                                        </button>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.callout)}>
                                            <span aria-hidden="true">✦</span> Callout
                                        </button>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.quiz)}>
                                            <span aria-hidden="true">◎</span> Quiz
                                        </button>
                                        <button type="button" className="admin-block-btn" onClick={() => insertAtCursor(BLOCK_TEMPLATES.safety)}>
                                            <span aria-hidden="true">🛡</span> Safety panel
                                        </button>
                                        <label className={`admin-block-btn admin-block-upload ${uploading ? 'is-uploading' : ''}`}>
                                            <span aria-hidden="true">📷</span> {uploading ? 'Uploading…' : 'Upload image'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    handleInlineImageUpload(e.target.files?.[0]);
                                                    e.target.value = '';
                                                }}
                                                disabled={uploading}
                                                hidden
                                            />
                                        </label>
                                    </div>

                                    <textarea
                                        ref={contentRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder={'Start writing your story.\n\nUse the buttons above to add Q&A, photo galleries, pull quotes, callouts or a quiz — they drop in pre-filled templates you can type over.\n\nFor a heading, start a line with ##\nFor a subheading, use ###\nFor a divider, use ---\n\nLeave a blank line between paragraphs.'}
                                        rows="16"
                                        required
                                    ></textarea>
                                    <p className="admin-help">
                                        Click an "Add a block" button above to insert a Q&amp;A, pull quote, photo gallery, callout or quiz — just type over the placeholder text. "Upload image" drops a picture straight into your story at the cursor.
                                    </p>
                                </div>

                                <div className="input-group">
                                    <label>Excerpt (optional, used on card)</label>
                                    <input
                                        type="text"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Short summary for the article card (auto-filled if empty)"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        Meta description (SEO)
                                        <span className="char-count">{metaDescription.length}/160</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder="Shown in Google search results. Keep under 160 characters."
                                        maxLength={300}
                                    />
                                </div>

                                <div className="input-group admin-toggle-row">
                                    <label className="admin-toggle">
                                        <input
                                            type="checkbox"
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                        />
                                        <span>Featured (pin to the top of /blog)</span>
                                    </label>
                                </div>

                                <div className="input-group admin-toggle-row">
                                    <label className="admin-toggle">
                                        <input
                                            type="checkbox"
                                            checked={published}
                                            onChange={(e) => setPublished(e.target.checked)}
                                        />
                                        <span>Published (visible at /blog)</span>
                                    </label>
                                </div>

                                <div className="admin-form-actions">
                                    {content.trim() && (
                                        <button type="button" className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
                                            {showPreview ? 'Hide Preview' : 'Preview'}
                                        </button>
                                    )}
                                    {editingPost && (
                                        <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                            Cancel Editing
                                        </button>
                                    )}
                                    <button type="submit" className="btn-primary" disabled={uploading}>
                                        {editingPost ? 'Update Article' : (published ? 'Publish Article' : 'Save Draft')}
                                    </button>
                                </div>
                            </form>

                            {/* Preview — renders inside .blog-theme so it matches the published post exactly */}
                            {showPreview && content.trim() && (
                                <div className="admin-preview">
                                    <h4>Live Preview</h4>
                                    <div className="blog-theme admin-preview-theme">
                                        <div className="post-view admin-preview-card">
                                            {coverImageUrl && (
                                                <div className="post-hero-img">
                                                    <img src={coverImageUrl} alt="" />
                                                </div>
                                            )}
                                            <div className="post-content">
                                                <header className="post-header">
                                                    <div className="post-category-bar">
                                                        <span className="post-cat-tag">{category}</span>
                                                        <div className="post-date-rt">
                                                            <span>
                                                                {editingPost ? editingPost.date : new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <h1>{title || 'Untitled'}</h1>
                                                    {subtitle && <p className="post-subtitle">{subtitle}</p>}
                                                </header>
                                                <div className="body-text">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                                        {content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Existing Posts */}
                        <section className="admin-section">
                            <h3>Current Articles ({posts.length})</h3>
                            <div className="admin-posts-list">
                                {posts.length === 0 ? (
                                    <p className="empty-state">No articles found. Create your first article above.</p>
                                ) : (
                                    posts.map(post => (
                                        <div key={post.id} className="admin-post-item glass">
                                            <div className="post-info">
                                                <h4>{post.title}</h4>
                                                <span>{post.date}</span>
                                            </div>
                                            <div className="post-actions">
                                                <button className="btn-edit" onClick={() => startEdit(post)}>Edit</button>
                                                {deleteConfirm === post.id ? (
                                                    <div className="delete-confirm">
                                                        <span>Sure?</span>
                                                        <button className="btn-delete-yes" onClick={() => handleDelete(post.id)}>Yes</button>
                                                        <button className="btn-delete-no" onClick={() => setDeleteConfirm(null)}>No</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn-delete" onClick={() => setDeleteConfirm(post.id)}>Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

                {/* ═══════ WAITLIST TAB ═══════ */}
                {activeTab === 'waitlist' && (
                    <section className="admin-section glass">
                        <h3>Waiting List Signups</h3>
                        <div className="waitlist-stats">
                            <div className="stat-card">
                                <span className="stat-number">{waitlist.length}</span>
                                <span className="stat-label">Total Signups</span>
                            </div>
                        </div>

                        <div className="waitlist-controls">
                            <input
                                type="text"
                                className="waitlist-search"
                                placeholder="Search by email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn-export" onClick={exportWaitlist}>
                                📥 Export CSV
                            </button>
                        </div>

                        <div className="admin-posts-list">
                            {filteredWaitlist.length === 0 ? (
                                <p className="empty-state">
                                    {searchQuery ? 'No matching signups found.' : 'No signups yet. People who join the waiting list will appear here.'}
                                </p>
                            ) : (
                                filteredWaitlist.map((entry, i) => (
                                    <div key={i} className="admin-post-item glass">
                                        <div className="post-info">
                                            <h4>{entry.email}</h4>
                                            <span>Joined: {entry.date}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* ═══════ SETTINGS TAB ═══════ */}
                {activeTab === 'settings' && (
                    <section className="admin-section glass">
                        <h3>Change Password</h3>
                        <form className="admin-form" onSubmit={handlePasswordChange}>
                            {passError && <div className="admin-pass-error">{passError}</div>}

                            <div className="input-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPass}
                                    onChange={(e) => setCurrentPass(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="input-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="input-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    placeholder="Re-enter new password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={passLoading}>
                                {passLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Admin;
