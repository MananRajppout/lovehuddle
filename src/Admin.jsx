import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

function Admin({ posts, onAddPost, onDeletePost, waitlist = [] }) {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && content) {
            onAddPost({
                id: Date.now(),
                title,
                excerpt: excerpt || content.substring(0, 100) + '...',
                content,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            setTitle('');
            setExcerpt('');
            setContent('');
        }
    };

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="admin-header">
                <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>← Back to Site</Link>
                <h2>Admin Dashboard</h2>
                <p>Manage LoveHuddle Articles & Waitlist</p>
            </div>

            <div className="admin-content">
                {/* Waitlist Panel */}
                <section className="admin-section glass">
                    <h3>Waiting List Signups</h3>
                    <div className="waitlist-stats">
                        <div className="stat-card">
                            <span className="stat-number">{waitlist.length}</span>
                            <span className="stat-label">Total Signups</span>
                        </div>
                    </div>
                    <div className="admin-posts-list">
                        {waitlist.length === 0 ? (
                            <p className="empty-state">No signups yet. People who join the waiting list will appear here.</p>
                        ) : (
                            waitlist.map((entry, i) => (
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

                {/* Create Post Form */}
                <section className="admin-section glass">
                    <h3>Create New Article</h3>
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
                            <label>Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write the full article here..."
                                rows="8"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Publish Article</button>
                    </form>
                </section>

                {/* Existing Posts List */}
                <section className="admin-section">
                    <h3>Current Articles</h3>
                    <div className="admin-posts-list">
                        {posts.length === 0 ? (
                            <p className="empty-state">No articles found.</p>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="admin-post-item glass">
                                    <div className="post-info">
                                        <h4>{post.title}</h4>
                                        <span>{post.date}</span>
                                    </div>
                                    <button className="btn-delete" onClick={() => onDeletePost(post.id)}>Delete</button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Admin;
