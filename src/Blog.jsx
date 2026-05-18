import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from './supabaseClient';
import './Blog.css';

const SITE_URL = 'https://lovehuddle.co.uk';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

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

/** Embed helpers — accepts a YouTube or Vimeo URL and returns an iframe URL */
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
   Premium content blocks
   Stored as fenced code in markdown — e.g. ```qa … ```
   so the admin can insert them with a single button.
   ──────────────────────────────────────────────── */

const BLOCK_LANGS = new Set(['qa', 'quote', 'gallery', 'callout', 'quiz']);

function splitLines(raw) {
  return String(raw || '').replace(/\r\n/g, '\n').split('\n');
}

/* ── Q&A: alternating "Q:" and "A:" lines ── */
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

/* ── Pull quote with optional attribution ── */
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

/* ── Photo gallery: one image per line, "url | optional caption" ── */
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

/* ── Callout box (boxed highlight, no attribution) ── */
function Callout({ raw }) {
  const text = String(raw || '').trim();
  if (!text) return null;
  return (
    <aside className="blog-block-callout">
      {text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para.trim()}</p>)}
    </aside>
  );
}

/* ── Quiz: question, "- option" lines, optional "Result:" reveal ── */
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
      if (resMatch) {
        r = resMatch[1].trim();
        mode = 'r';
      } else if (mode === 'r') {
        r += ' ' + trimmed;
      } else if (optMatch) {
        opts.push(optMatch[1].trim());
        mode = 'opts';
      } else if (mode === 'q') {
        q = q ? q + ' ' + trimmed : trimmed;
      }
    }
    return { question: q, options: opts, result: r };
  }, [raw]);

  const [picked, setPicked] = useState(null);

  if (!question || options.length === 0) return null;
  return (
    <div className="blog-block-quiz">
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
  );
}

/* ────────────────────────────────────────────────
   Custom markdown renderers (safe, brand-styled)
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
    return <code className={className} {...props}>{children}</code>;
  },
};

export { mdComponents };

/* ────────────────────────────────────────────────
   <BlogIndex /> — public listing at /blog
   ──────────────────────────────────────────────── */

export function BlogIndex({ fallbackPosts = [] }) {
  const [posts, setPosts] = useState(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const title = 'Blog — LoveHuddle';
    const description =
      'Founder stories, design philosophy, safety principles and updates from the team building LoveHuddle — the UK Social/Dating platform launching September 2026.';
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .select('id, slug, title, subtitle, excerpt, cover_image_url, date, created_at, published')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (err) throw err;
        const visible = (data || []).filter(p => p.published !== false);
        if (visible.length > 0) {
          setPosts(visible);
        }
      } catch (e) {
        if (!cancelled) setError('Could not load the latest posts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="blog-page">
      <header className="blog-hero">
        <p className="blog-hero-eyebrow">The LoveHuddle Journal</p>
        <h1 className="blog-hero-title">
          Stories from the build of a <span className="gradient-text">Social/Dating</span> platform.
        </h1>
        <p className="blog-hero-sub">
          Founder notes, design principles, safety philosophy, and the people, places and ideas
          shaping LoveHuddle ahead of our September 2026 beta.
        </p>
      </header>

      <section className="blog-grid-wrap">
        {loading && posts.length === 0 ? (
          <div className="blog-empty">Loading the journal…</div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            New stories are on the way. Check back soon.
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => {
              const slug = post.slug || slugify(post.title);
              return (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${slug}`} className="blog-card-link" aria-label={post.title}>
                    <div className="blog-card-media">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="blog-card-media-placeholder" aria-hidden="true">
                          <span>LH</span>
                        </div>
                      )}
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">{formatDate(post)}</div>
                      <h2 className="blog-card-title">{post.title}</h2>
                      {(post.subtitle || post.excerpt) && (
                        <p className="blog-card-sub">{post.subtitle || extractExcerpt(post, 140)}</p>
                      )}
                      <span className="blog-card-read">Read more →</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
        {error && <p className="blog-error">{error}</p>}
      </section>
    </main>
  );
}

/* ────────────────────────────────────────────────
   <BlogPost /> — single post at /blog/:slug
   ──────────────────────────────────────────────── */

export function BlogPost({ fallbackPosts = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');

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

        const { data: more } = await supabase
          .from('blog_posts')
          .select('id, slug, title, subtitle, cover_image_url, date, created_at, published')
          .neq('slug', slug)
          .order('created_at', { ascending: false })
          .limit(3);
        if (!cancelled) setRelated((more || []).filter(p => p.published !== false));
      } catch (e) {
        const fb = fallbackPosts.find(p => (p.slug || slugify(p.title)) === slug);
        if (fb) { setPost(fb); setStatus('ready'); }
        else if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [slug, fallbackPosts]);

  /* ── SEO meta updates ── */
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

  if (status === 'loading') {
    return (
      <main className="blog-page">
        <div className="blog-empty">Loading…</div>
      </main>
    );
  }

  if (status === 'not-found' || !post) {
    return (
      <main className="blog-page">
        <div className="blog-not-found">
          <p className="blog-hero-eyebrow">404</p>
          <h1 className="blog-hero-title">We can't find that story.</h1>
          <p className="blog-hero-sub">It may have been moved, renamed, or it's still in the drafts.</p>
          <div className="blog-not-found-actions">
            <Link to="/blog" className="btn-primary">Back to the blog</Link>
            <Link to="/" className="btn-secondary-link">Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="blog-page">
      <article className="blog-article">
        <div className="blog-article-back">
          <button
            type="button"
            className="blog-back-link"
            onClick={() => navigate('/blog')}
          >
            ← All stories
          </button>
        </div>

        {post.cover_image_url && (
          <figure className="blog-article-cover">
            <img src={post.cover_image_url} alt="" />
          </figure>
        )}

        <header className="blog-article-header">
          <div className="blog-article-meta">
            <span>{formatDate(post)}</span>
            <span className="blog-article-dot" aria-hidden="true">•</span>
            <span>LoveHuddle Journal</span>
          </div>
          <h1 className="blog-article-title">{post.title}</h1>
          {post.subtitle && (
            <p className="blog-article-subtitle">{post.subtitle}</p>
          )}
        </header>

        {embedUrl && (
          <div className="blog-article-video">
            <iframe
              src={embedUrl}
              title={`${post.title} — video`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="blog-article-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={mdComponents}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        <footer className="blog-article-footer">
          <p className="blog-article-cta">
            LoveHuddle is the UK's Social/Dating platform launching September 2026.
          </p>
          <div className="blog-article-cta-actions">
            <Link to="/#join" className="btn-primary">Join the waiting list</Link>
            <Link to="/safety" className="btn-secondary-link">How we keep it real</Link>
          </div>
        </footer>
      </article>

      {related.length > 0 && (
        <section className="blog-related">
          <h2 className="blog-related-title">More from the journal</h2>
          <div className="blog-grid">
            {related.map((r) => {
              const rslug = r.slug || slugify(r.title);
              return (
                <article key={r.id} className="blog-card">
                  <Link to={`/blog/${rslug}`} className="blog-card-link">
                    <div className="blog-card-media">
                      {r.cover_image_url ? (
                        <img src={r.cover_image_url} alt="" loading="lazy" />
                      ) : (
                        <div className="blog-card-media-placeholder" aria-hidden="true"><span>LH</span></div>
                      )}
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">{formatDate(r)}</div>
                      <h2 className="blog-card-title">{r.title}</h2>
                      {r.subtitle && <p className="blog-card-sub">{r.subtitle}</p>}
                      <span className="blog-card-read">Read more →</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export { slugify };
