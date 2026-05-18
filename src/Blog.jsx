import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from './supabaseClient';
import './Blog.css';

const SITE_URL = 'https://lovehuddle.co.uk';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const POSTS_PER_PAGE = 6;

/* ─── Category list (matches the journal mockup) ─── */
export const BLOG_CATEGORIES = [
  'Founder Notes',
  'Dating Culture',
  'Safety & Trust',
  'AI & Design',
  'LoveHuddle News',
  'Quizzes',
  'Real Connections',
];

/** Map a category name to a CSS modifier for the coloured tag */
function categoryClass(cat = '') {
  const c = cat.toLowerCase();
  if (c.includes('safety')) return 'safety';
  if (c.includes('ai')) return 'ai';
  if (c.includes('news')) return 'news';
  return '';
}

/* ────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────── */

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(post) {
  if (post?.date) return post.date;
  if (post?.created_at) {
    try {
      return new Date(post.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { /* ignore */ }
  }
  return '';
}

function extractExcerpt(post, max = 180) {
  const source = post?.excerpt || post?.subtitle || (post?.content || '');
  const stripped = source.replace(/[#*_`>!\[\]()]/g, '').replace(/\s+/g, ' ').trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max).trim() + '…';
}

/** Rough reading time (~225 words per minute). Returns a string like "5 min read" */
function readingTime(post) {
  const text = (post?.content || '') + ' ' + (post?.subtitle || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min read`;
}

function hasQuiz(post) {
  return /```\s*quiz/i.test(post?.content || '');
}

function setMeta(name, value, attr = 'name') {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function toEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace('www.', '');
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith('youtube.com')) {
      const id = url.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (url.pathname.startsWith('/embed/')) return rawUrl;
    }
    if (host.endsWith('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────
   Premium content blocks (Q&A, pull quote,
   gallery, callout, quiz, safety panel)
   ──────────────────────────────────────────────── */

const BLOCK_LANGS = new Set(['qa', 'quote', 'gallery', 'callout', 'quiz', 'safety']);

function splitLines(raw) {
  return String(raw || '').replace(/\r\n/g, '\n').split('\n');
}

function QABlock({ raw }) {
  const items = useMemo(() => {
    const lines = splitLines(raw);
    const out = [];
    let cur = null;
    for (const line of lines) {
      const qm = line.match(/^\s*Q\s*[:\-—]\s*(.*)$/i);
      const am = line.match(/^\s*A\s*[:\-—]\s*(.*)$/i);
      if (qm) {
        if (cur) out.push(cur);
        cur = { q: qm[1].trim(), a: '' };
      } else if (am && cur) {
        cur.a = (cur.a ? cur.a + ' ' : '') + am[1].trim();
      } else if (cur && line.trim()) {
        if (cur.a) cur.a += ' ' + line.trim();
        else cur.q += ' ' + line.trim();
      }
    }
    if (cur) out.push(cur);
    return out.filter(p => p.q || p.a);
  }, [raw]);

  if (items.length === 0) return null;
  return (
    <div className="blog-block-qa">
      {items.map((it, i) => (
        <div className="blog-qa-item" key={i}>
          <p className="blog-qa-q"><span className="blog-qa-marker">Q</span>{it.q}</p>
          {it.a && <p className="blog-qa-a"><span className="blog-qa-marker">A</span>{it.a}</p>}
        </div>
      ))}
    </div>
  );
}

function PullQuote({ raw }) {
  const { text, by } = useMemo(() => {
    const lines = splitLines(raw).map(l => l.trim()).filter(Boolean);
    const attrIdx = lines.findIndex(l => /^[—–-]\s+/.test(l));
    if (attrIdx >= 0) {
      return {
        text: lines.slice(0, attrIdx).join(' '),
        by: lines[attrIdx].replace(/^[—–-]\s+/, '').trim(),
      };
    }
    return { text: lines.join(' '), by: '' };
  }, [raw]);
  if (!text) return null;
  return (
    <figure className="blog-block-pullquote">
      <blockquote>{text}</blockquote>
      {by && <figcaption>— {by}</figcaption>}
    </figure>
  );
}

function Gallery({ raw }) {
  const items = useMemo(() => {
    return splitLines(raw)
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const [url, ...rest] = l.split('|');
        return { url: (url || '').trim(), caption: rest.join('|').trim() };
      })
      .filter(it => it.url);
  }, [raw]);
  if (items.length === 0) return null;
  const cls = `blog-block-gallery blog-gallery-${Math.min(items.length, 4)}`;
  return (
    <div className={cls}>
      {items.map((it, i) => (
        <figure className="blog-gallery-item" key={i}>
          <img src={it.url} alt={it.caption || ''} loading="lazy" />
          {it.caption && <figcaption>{it.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function Callout({ raw }) {
  const text = String(raw || '').trim();
  if (!text) return null;
  return (
    <aside className="blog-block-callout">
      {text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para.trim()}</p>)}
    </aside>
  );
}

function Quiz({ raw }) {
  const { question, options, result } = useMemo(() => {
    const lines = splitLines(raw);
    let q = '';
    const opts = [];
    let r = '';
    let mode = 'q';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const optMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      const resMatch = trimmed.match(/^Result\s*[:\-—]\s*(.*)$/i);
      if (resMatch) { r = resMatch[1].trim(); mode = 'r'; }
      else if (mode === 'r') { r += ' ' + trimmed; }
      else if (optMatch) { opts.push(optMatch[1].trim()); mode = 'opts'; }
      else if (mode === 'q') { q = q ? q + ' ' + trimmed : trimmed; }
    }
    return { question: q, options: opts, result: r };
  }, [raw]);
  const [picked, setPicked] = useState(null);
  if (!question || options.length === 0) return null;
  return (
    <div className="blog-block-quiz">
      <div className="blog-quiz-head">
        <span className="quiz-icon" aria-hidden="true">🤔</span>
        <div>
          <h3>Quick Quiz</h3>
          <p>Test what you just read</p>
        </div>
      </div>
      <div className="blog-quiz-body">
        <p className="blog-quiz-question">{question}</p>
        <div className="blog-quiz-options">
          {options.map((opt, i) => (
            <button
              type="button"
              key={i}
              className={`blog-quiz-option ${picked === i ? 'picked' : ''}`}
              onClick={() => setPicked(i)}
            >
              <span className="blog-quiz-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        {picked !== null && result && (
          <div className="blog-quiz-reveal">
            <span className="blog-quiz-reveal-label">Reflection</span>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Safety panel — boxed list of safety items (icon + label + sub).
   Format inside the fence:
     Title: LoveHuddle Safety — While You Read
     Subtitle: How we protect every user, every Huddle
     - 🛡 Identity Verification | Every profile is verified before they can Huddle.
     - 🧠 AI-Huddle-Core™ Shield | Proactive AI monitoring flags unsafe behaviour.
*/
function SafetyPanel({ raw }) {
  const { title, subtitle, items } = useMemo(() => {
    let t = 'LoveHuddle Safety — While You Read';
    let s = 'How we protect every user, every Huddle';
    const list = [];
    for (const line of splitLines(raw)) {
      const trim = line.trim();
      if (!trim) continue;
      const tm = trim.match(/^Title\s*[:\-—]\s*(.*)$/i);
      const sm = trim.match(/^Subtitle\s*[:\-—]\s*(.*)$/i);
      const im = trim.match(/^[-*•]\s+(.*)$/);
      if (tm) { t = tm[1].trim(); continue; }
      if (sm) { s = sm[1].trim(); continue; }
      if (im) {
        const body = im[1].trim();
        // Split on first " | " for label / description
        const pipe = body.indexOf('|');
        let label = pipe >= 0 ? body.slice(0, pipe).trim() : body;
        let desc = pipe >= 0 ? body.slice(pipe + 1).trim() : '';
        // Detect leading emoji/icon (1-2 characters)
        const iconMatch = label.match(/^(\p{Extended_Pictographic}️?|.)\s+(.*)$/u);
        let icon = '✓';
        if (iconMatch && /\p{Extended_Pictographic}/u.test(iconMatch[1])) {
          icon = iconMatch[1];
          label = iconMatch[2];
        }
        list.push({ icon, label, desc });
      }
    }
    return { title: t, subtitle: s, items: list };
  }, [raw]);

  if (items.length === 0) return null;
  return (
    <aside className="blog-block-safety">
      <div className="blog-safety-head">
        <div className="blog-safety-shield" aria-hidden="true">🛡️</div>
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="blog-safety-items">
        {items.map((it, i) => (
          <div className="blog-safety-item" key={i}>
            <div className="blog-safety-icon" aria-hidden="true">{it.icon}</div>
            <div className="blog-safety-item-text">
              <p>{it.label}</p>
              {it.desc && <span>{it.desc}</span>}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────
   Markdown renderer config — reused by the public
   blog AND the admin preview
   ──────────────────────────────────────────────── */

const mdComponents = {
  h1: ({ node, ...props }) => <h2 className="blog-post-h2" {...props} />,
  h2: ({ node, ...props }) => <h2 className="blog-post-h2" {...props} />,
  h3: ({ node, ...props }) => <h3 className="blog-post-h3" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="blog-post-quote" {...props} />,
  img: ({ node, ...props }) => (
    <span className="blog-post-figure">
      <img loading="lazy" {...props} alt={props.alt || ''} />
      {props.alt && <span className="blog-post-figcaption">{props.alt}</span>}
    </span>
  ),
  a: ({ node, href, ...props }) => {
    const internal = href && (href.startsWith('/') || href.startsWith('#'));
    if (internal) return <Link to={href} {...props} />;
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  },
  hr: () => <hr className="blog-post-divider" />,
  pre: ({ node, children, ...props }) => {
    const child = React.Children.toArray(children)[0];
    const cls = child && child.props && child.props.className;
    const m = cls && /language-(\w+)/.exec(cls);
    if (m && BLOCK_LANGS.has(m[1])) return <>{children}</>;
    return <pre {...props}>{children}</pre>;
  },
  code: ({ node, inline, className, children, ...props }) => {
    const m = /language-(\w+)/.exec(className || '');
    const lang = m && m[1];
    const raw = Array.isArray(children) ? children.join('') : String(children || '');
    if (lang === 'qa') return <QABlock raw={raw} />;
    if (lang === 'quote') return <PullQuote raw={raw} />;
    if (lang === 'gallery') return <Gallery raw={raw} />;
    if (lang === 'callout') return <Callout raw={raw} />;
    if (lang === 'quiz') return <Quiz raw={raw} />;
    if (lang === 'safety') return <SafetyPanel raw={raw} />;
    return <code className={className} {...props}>{children}</code>;
  },
};

export { mdComponents };

/* ────────────────────────────────────────────────
   Sidebar (shared by BlogIndex)
   ──────────────────────────────────────────────── */

function Sidebar({ posts, activeCategory, onCategory }) {
  const [email, setEmail] = useState('');
  const [nlState, setNlState] = useState({ status: 'idle', msg: '' });

  /* Topic counts from current dataset */
  const topicCounts = useMemo(() => {
    const map = new Map(BLOG_CATEGORIES.map(c => [c, 0]));
    for (const p of posts) {
      const c = p?.category || 'Founder Notes';
      if (map.has(c)) map.set(c, map.get(c) + 1);
    }
    return Array.from(map.entries());
  }, [posts]);

  const subscribe = async (e) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setNlState({ status: 'error', msg: 'Please enter a valid email.' });
      return;
    }
    setNlState({ status: 'loading', msg: '' });
    try {
      const { error } = await supabase.from('waitlist_entries').insert([{
        email: v,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }]);
      if (error && !String(error.message).toLowerCase().includes('duplicate')) throw error;
      setEmail('');
      setNlState({ status: 'ok', msg: 'You\'re in. We\'ll write soon.' });
    } catch (err) {
      setNlState({ status: 'error', msg: 'Could not subscribe. Try again later.' });
    }
  };

  return (
    <aside className="sidebar">
      <div className="widget widget-launch">
        <div className="widget-title">Launch Status</div>
        <div className="launch-date">September 2026</div>
        <div className="launch-sub">UK Launch · Build in progress</div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: '64%' }} /></div>
      </div>

      <div className="widget founder-widget">
        <div className="widget-title">About This Journal</div>
        <div className="founder-av" aria-hidden="true">LH</div>
        <h4>The LoveHuddle Founder</h4>
        <p>Honest writing from the solo founder building LoveHuddle. No PR spin. Just the real story.</p>
      </div>

      <div className="widget widget-safe">
        <div className="widget-title">Platform Safety</div>
        <div className="safe-items">
          <div className="safe-item"><span className="safe-check">✓</span> Identity verified profiles only</div>
          <div className="safe-item"><span className="safe-check">✓</span> AI safety screening on every Huddle</div>
          <div className="safe-item"><span className="safe-check">✓</span> Zero tolerance abuse policy</div>
          <div className="safe-item"><span className="safe-check">✓</span> 24/7 Shield Protocol active</div>
          <div className="safe-item"><span className="safe-check">✓</span> End-to-end encrypted messaging</div>
        </div>
        <div className="powered-by">Powered by <strong>AI-Huddle-Core™</strong></div>
      </div>

      <div className="widget">
        <div className="widget-title">Browse Topics</div>
        <div className="topic-list">
          <button
            type="button"
            className={`topic-item ${activeCategory === 'All Posts' ? 'active' : ''}`}
            onClick={() => onCategory('All Posts')}
          >
            All Posts <span className="topic-count">{posts.length}</span>
          </button>
          {topicCounts.map(([name, count]) => (
            <button
              type="button"
              key={name}
              className={`topic-item ${activeCategory === name ? 'active' : ''}`}
              onClick={() => onCategory(name)}
            >
              {name} <span className="topic-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="widget widget-newsletter">
        <div className="widget-title">Stay Close</div>
        <h4>Get the Journal</h4>
        <p>New posts, launch updates, founder reflections. No noise, no spam.</p>
        <form onSubmit={subscribe}>
          <input
            type="email"
            className="nl-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={nlState.status === 'loading'}
          />
          <button type="submit" className="btn-sub" disabled={nlState.status === 'loading'}>
            {nlState.status === 'loading' ? 'Subscribing…' : 'Subscribe →'}
          </button>
          {nlState.msg && (
            <p className={`nl-msg ${nlState.status === 'error' ? 'error' : ''}`}>{nlState.msg}</p>
          )}
        </form>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────
   <BlogIndex /> — public listing at /blog
   ──────────────────────────────────────────────── */

export function BlogIndex({ fallbackPosts = [] }) {
  const [posts, setPosts] = useState(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Posts');
  const [page, setPage] = useState(1);

  /* SEO */
  useEffect(() => {
    const title = 'The Journal — LoveHuddle';
    const description =
      'Founder thoughts, dating culture, safety insights, and how we\'re building LoveHuddle — the UK Social/Dating platform launching September 2026.';
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', `${SITE_URL}/blog`, 'property');
    setMeta('og:image', DEFAULT_OG_IMAGE, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setCanonical(`${SITE_URL}/blog`);
  }, []);

  /* Fetch posts — select('*') so missing optional columns (category/featured) can't break the page */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (err) throw err;
        const visible = (data || []).filter(p => p.published !== false);
        setPosts(visible);
      } catch (e) {
        if (!cancelled) {
          const detail = e?.message || 'Unknown error';
          setError(`Could not load the latest posts. (${detail})`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Search + category filter */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      if (category !== 'All Posts' && (p.category || 'Founder Notes') !== category) return false;
      if (!q) return true;
      const hay = `${p.title || ''} ${p.subtitle || ''} ${p.excerpt || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, search, category]);

  /* Featured = explicit `featured` flag, else most recent */
  const featured = useMemo(() => {
    const explicit = filtered.find(p => p.featured === true);
    return explicit || filtered[0] || null;
  }, [filtered]);

  const restList = useMemo(() => {
    if (!featured) return filtered;
    return filtered.filter(p => p.id !== featured.id);
  }, [filtered, featured]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(restList.length / POSTS_PER_PAGE));
  const paged = restList.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  /* Reset page when filter changes */
  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div className="blog-theme">
      <div className="blog-hero">
        <p className="hero-eyebrow">✦ The LoveHuddle Journal</p>
        <h1>Social/Dating, <em>Differently.</em><br />Written Honestly.</h1>
        <p>Founder thoughts, dating culture, safety insights, and how we're building something that actually works.</p>
        <div className="hero-search">
          <input
            type="text"
            placeholder="Search the journal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search the journal"
          />
          <div className="hero-search-icon" aria-hidden="true">⌕</div>
        </div>
      </div>

      <div className="categories" role="tablist" aria-label="Filter posts by category">
        <button
          type="button"
          className={`pill ${category === 'All Posts' ? 'active' : ''}`}
          onClick={() => setCategory('All Posts')}
        >
          All Posts
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="page-wrap">
        {/* Featured card */}
        {featured && (
          <div className="featured-wrap">
            <div className="section-label">Featured Post</div>
            <Link className="featured-card" to={`/blog/${featured.slug || slugify(featured.title)}`}>
              <div className="featured-photo">
                <div className="featured-tag">Featured</div>
                {featured.cover_image_url ? (
                  <img src={featured.cover_image_url} alt="" loading="lazy" />
                ) : (
                  <div className="photo-placeholder">
                    <div className="icon" aria-hidden="true">✦</div>
                    <p>LoveHuddle Journal</p>
                  </div>
                )}
              </div>
              <div className="featured-body">
                <div className="featured-meta">
                  <span>{featured.category || 'Founder Notes'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(featured)}</span>
                  <span className="reading-time">{readingTime(featured)}</span>
                </div>
                <h2>{featured.title}</h2>
                {(featured.subtitle || featured.excerpt) && (
                  <p>{featured.subtitle || extractExcerpt(featured, 180)}</p>
                )}
                <span className="btn-read">Read the Story →</span>
              </div>
            </Link>
          </div>
        )}

        {/* Post list */}
        <div className="posts-col">
          <div className="section-label">{category === 'All Posts' ? 'Latest Posts' : category}</div>

          {loading && posts.length === 0 ? (
            <div className="blog-empty">Loading the journal…</div>
          ) : paged.length === 0 ? (
            <div className="blog-empty">
              {search ? 'No posts match your search.' : 'New stories are on the way. Check back soon.'}
            </div>
          ) : (
            paged.map((post) => {
              const slug = post.slug || slugify(post.title);
              const cat = post.category || 'Founder Notes';
              const tagCls = categoryClass(cat);
              const isVideo = !!toEmbedUrl(post.video_embed_url);
              const isQuiz = hasQuiz(post);
              return (
                <Link key={post.id} className="post-card" to={`/blog/${slug}`}>
                  <div className="post-thumb">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt="" loading="lazy" />
                    ) : (
                      <span className="thumb-icon" aria-hidden="true">✦</span>
                    )}
                    {isVideo && <span className="video-badge">VIDEO</span>}
                    {!isVideo && isQuiz && <span className="quiz-badge">QUIZ</span>}
                  </div>
                  <div className="post-info">
                    <div className={`post-tag ${tagCls}`}>{cat}</div>
                    <h3>{post.title}</h3>
                    {(post.subtitle || post.excerpt) && (
                      <p>{post.subtitle || extractExcerpt(post, 140)}</p>
                    )}
                    <div className="post-footer">
                      <span>{formatDate(post)}</span>
                      <span className="dot" aria-hidden="true">·</span>
                      <span>{readingTime(post)}</span>
                      {isVideo && <>
                        <span className="dot" aria-hidden="true">·</span>
                        <span>▶ Includes video</span>
                      </>}
                      {isQuiz && <>
                        <span className="dot" aria-hidden="true">·</span>
                        <span>Includes quiz</span>
                      </>}
                    </div>
                  </div>
                </Link>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`page-btn ${n === page ? 'active' : ''}`}
                  onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          )}

          {error && <p className="blog-error">{error}</p>}
        </div>

        <Sidebar posts={posts} activeCategory={category} onCategory={setCategory} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   <BlogPost /> — single post at /blog/:slug
   ──────────────────────────────────────────────── */

export function BlogPost({ fallbackPosts = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      setPost(null);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        if (data && data.published !== false) {
          setPost(data);
          setStatus('ready');
        } else {
          const fb = fallbackPosts.find(p => (p.slug || slugify(p.title)) === slug);
          if (fb) { setPost(fb); setStatus('ready'); }
          else setStatus('not-found');
        }
      } catch (e) {
        const fb = fallbackPosts.find(p => (p.slug || slugify(p.title)) === slug);
        if (fb) { setPost(fb); setStatus('ready'); }
        else if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [slug, fallbackPosts]);

  /* SEO meta updates */
  useEffect(() => {
    if (!post) return;
    const title = `${post.title} — LoveHuddle`;
    const description =
      post.meta_description ||
      post.subtitle ||
      extractExcerpt(post, 200);
    const url = `${SITE_URL}/blog/${post.slug || slugify(post.title)}`;
    const image = post.cover_image_url || DEFAULT_OG_IMAGE;
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', post.title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'article', 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:image', image, 'property');
    setMeta('twitter:title', post.title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setCanonical(url);
  }, [post]);

  const embedUrl = useMemo(() => toEmbedUrl(post?.video_embed_url), [post]);
  const postUrl = useMemo(() => {
    if (!post) return '';
    return `${SITE_URL}/blog/${post.slug || slugify(post.title)}`;
  }, [post]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopyState('ok');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  if (status === 'loading') {
    return (
      <div className="blog-theme">
        <div className="post-view-wrap">
          <div className="blog-empty">Loading…</div>
        </div>
      </div>
    );
  }

  if (status === 'not-found' || !post) {
    return (
      <div className="blog-theme">
        <div className="blog-not-found">
          <p className="hero-eyebrow">404</p>
          <h1>We can't find that story.</h1>
          <p>It may have been moved, renamed, or it's still in the drafts.</p>
          <div className="blog-not-found-actions">
            <Link to="/blog" className="btn-read">Back to the journal</Link>
          </div>
        </div>
      </div>
    );
  }

  const cat = post.category || 'Founder Notes';
  const tagCls = categoryClass(cat);

  return (
    <div className="blog-theme">
      <div className="post-view-wrap">
        <button type="button" className="post-back" onClick={() => navigate('/blog')}>
          ← All stories
        </button>

        <article className="post-view">
          <div className="post-hero-img">
            {post.cover_image_url ? (
              <img src={post.cover_image_url} alt="" />
            ) : (
              <div className="post-hero-placeholder">
                <div className="big-icon" aria-hidden="true">✦</div>
                <p>LoveHuddle Journal</p>
              </div>
            )}
          </div>

          <div className="post-content">
            <header className="post-header">
              <div className="post-category-bar">
                <span className={`post-cat-tag ${tagCls}`}>{cat}</span>
                <div className="post-date-rt">
                  <span>{formatDate(post)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime(post)}</span>
                </div>
              </div>
              <h1>{post.title}</h1>
              {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}
            </header>

            <div className="author-row">
              <div className="author-avatar" aria-hidden="true">LH</div>
              <div className="author-info">
                <p>The LoveHuddle Founder</p>
                <span>Founder · LoveHuddle</span>
              </div>
            </div>

            {embedUrl && (
              <div className="video-embed">
                <iframe
                  src={embedUrl}
                  title={`${post.title} — video`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="body-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {post.content || ''}
              </ReactMarkdown>
            </div>

            <div className="share-row">
              <span className="share-label">Share:</span>
              <a
                className="share-btn"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 LinkedIn
              </a>
              <a
                className="share-btn"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                𝕏 Twitter
              </a>
              <button type="button" className="share-btn" onClick={copyLink}>
                {copyState === 'ok' ? '✓ Copied' : copyState === 'error' ? '✗ Failed' : '📋 Copy link'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export { slugify };
