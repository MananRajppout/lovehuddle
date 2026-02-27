import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import './Admin.css';

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
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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

    /* ── Submit blog post (create or edit) ── */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        if (editingPost) {
            onEditPost({
                ...editingPost,
                title: title.trim(),
                excerpt: excerpt.trim() || content.trim().substring(0, 100) + '...',
                content: content.trim()
            });
            setEditingPost(null);
            showToast('Article updated successfully!');
        } else {
            onAddPost({
                id: Date.now(),
                title: title.trim(),
                excerpt: excerpt.trim() || content.trim().substring(0, 100) + '...',
                content: content.trim(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            showToast('Article published successfully!');
        }
        setTitle('');
        setExcerpt('');
        setContent('');
        setShowPreview(false);
    };

    /* ── Start editing ── */
    const startEdit = (post) => {
        setEditingPost(post);
        setTitle(post.title);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setActiveTab('articles');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setTitle('');
        setExcerpt('');
        setContent('');
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
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Article Title"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Excerpt (Optional)</label>
                                    <input
                                        type="text"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Short summary for the card"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Content <span className="char-count">{content.length} characters</span></label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write the full article here...&#10;&#10;Use double line breaks to separate paragraphs."
                                        rows="10"
                                        required
                                    ></textarea>
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
                                    <button type="submit" className="btn-primary">
                                        {editingPost ? 'Update Article' : 'Publish Article'}
                                    </button>
                                </div>
                            </form>

                            {/* Preview */}
                            {showPreview && content.trim() && (
                                <div className="admin-preview">
                                    <h4>Preview</h4>
                                    <div className="admin-preview-content">
                                        <div className="article-date">
                                            {editingPost ? editingPost.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <h3>{title || 'Untitled'}</h3>
                                        {content.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
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
