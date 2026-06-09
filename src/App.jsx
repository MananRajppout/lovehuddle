import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/images/logo.png';
import heroBg from './assets/images/hero-bg.png';
import finalistBadge from './assets/images/badge.jpeg';
import aiHuddleCore from './assets/images/aihuddlecore.png';
import Admin from './Admin';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import Safety from './Safety';
import CookiePolicy from './CookiePolicy';
import Contact from './Contact';
import { BlogIndex, BlogPost, slugify } from './Blog';

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Scroll to top on route change ─── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RevealSection({ children, className = '', ...props }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ─── Powered by AI-Huddle-Core ─── */
function PoweredByCore() {
  const ref = useReveal();
  return (
    <a
      ref={ref}
      href="https://aihuddlecore.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="powered-by-core"
      aria-label="Visit AI-Huddle-Core"
    >
      <div className="powered-by-glow" aria-hidden="true"></div>
      <div className="powered-by-inner">
        <img
          src={aiHuddleCore}
          alt="AI-Huddle-Core"
          className="powered-by-logo"
        />
        <div className="powered-by-divider" aria-hidden="true"></div>
        <p className="powered-by-text">
          Powered by <span className="powered-by-name">AI&#8209;Huddle&#8209;Core&trade;</span>
          {' '}— the calm intelligence behind every safe 1&#8209;to&#8209;1 Huddle.
        </p>
      </div>
    </a>
  );
}

/* ─── PFN (People's First Network) Box ─── */
function PeopleFirstNetwork() {
  const ref = useReveal();
  return (
    <div ref={ref} className="pfn-box">
      <div className="pfn-glow" aria-hidden="true"></div>
      <div className="pfn-inner">
        <div className="pfn-badge">PFN</div>
        <div className="pfn-divider" aria-hidden="true"></div>
        <div className="pfn-content">
          <h4 className="pfn-title">
            PFN - People's First Network
          </h4>
          <p className="pfn-text">
            LoveHuddle is built on one rule: people come first.<br />
            Everything is designed to feel calm, respectful, and human.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Launch Announcement ─── */
function LaunchAnnounce() {
  const ref = useReveal();
  return (
    <div ref={ref} className="launch-announce">
      {/* Fire curtains — sweep in from both sides */}
      <div className="fire-curtain fire-left" aria-hidden="true">
        <div className="fire-layer fire-layer-1"></div>
        <div className="fire-layer fire-layer-2"></div>
        <div className="fire-layer fire-layer-3"></div>
      </div>
      <div className="fire-curtain fire-right" aria-hidden="true">
        <div className="fire-layer fire-layer-1"></div>
        <div className="fire-layer fire-layer-2"></div>
        <div className="fire-layer fire-layer-3"></div>
      </div>
      <div className="fire-collision" aria-hidden="true"></div>
      <div className="fire-shockwave" aria-hidden="true"></div>

      {/* Ambient embers */}
      <div className="launch-embers" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span>
      </div>
      <div className="launch-flame-glow" aria-hidden="true"></div>

      {/* Content */}
      <div className="launch-content">
        <div className="launch-status">
          <span className="launch-flame-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2s4 4.5 4 8a4 4 0 1 1-8 0c0-1.5.8-2.8 1.6-3.5C10.3 8.8 10 10 11 11c-.5-2 .5-4 1-5 .3-.6 0-2 0-4z" fill="url(#flame-g)"/>
              <path d="M12 9s2 2 2 4a2 2 0 1 1-4 0c0-.8.4-1.4.8-1.8-.1.6 0 1 .4 1.3-.2-1 .3-2 .8-2.5.1-.3 0-.6 0-1z" fill="#fff4c2"/>
              <defs>
                <linearGradient id="flame-g" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffd27a"/>
                  <stop offset="0.45" stopColor="#ff6a2d"/>
                  <stop offset="1" stopColor="#e8001d"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="launch-status-text">The Spark Has Been Lit</span>
        </div>

        <h3 className="launch-heading">
          <span className="launch-line-1">A New Era of Social/Dating</span>
          <span className="launch-ignite-wrap">
            <span className="launch-ignite">Ignites</span>
          </span>
          <span className="launch-line-3">
            <span className="launch-month">September</span>
            <span className="launch-dot" aria-hidden="true"></span>
            <span className="launch-year">2026</span>
          </span>
        </h3>

        <p className="launch-sub">
          The official build is underway — where dating and real-world social connection finally come together.
        </p>
      </div>
    </div>
  );
}

/* ─── Landing Page Component ─── */
function Landing({ blogPosts, onJoinWaitlist }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (email) {
      onJoinWaitlist(email);
      setJoined(true);
      setEmail('');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-bg-wrapper">
          <img src={heroBg} alt="" className="hero-bg-img" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content animate-fade-in">
          <div className="hero-eyebrow">Beta Launching September 2026</div>
          <h1 className="hero-title">The End of the <span className="gradient-text">Swipe Era</span>.</h1>
          <p className="hero-subtitle">No Paywalls. No Pressure. Just People.</p>
          <p className="hero-tagline">A New Kind of Hybrid Connection Platform.</p>
          <form className="join-form" onSubmit={handleJoin}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Join Waiting List</button>
          </form>
          {joined && <p className="success-msg">✓ Welcome to the inner circle. Stay tuned.</p>}
          <LaunchAnnounce />
        </div>
      </header>

      {/* PFN (People's First Network) Section */}
      <section className="pfn-section">
        <PeopleFirstNetwork />
      </section>

      {/* Powered by AI-Huddle-Core (between hero and disruption) */}
      <section className="powered-by-section">
        <PoweredByCore />
      </section>

      {/* Disruption Section */}
      <section id="disruption" className="section-container section-disruption">
        <RevealSection>
          <div className="section-header">
            <h2 className="section-title">The <span className="gradient-text">Disruption</span></h2>
            <p className="section-desc">The era of endless scrolling and subscription traps is over. LoveHuddle Ltd is building a radically different model that replaces the algorithm with real‑world interaction.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚫</div>
              <h3>No Paywalls</h3>
              <p>We are ending the 'pay-to-socialize' era. Core features will never be locked away.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Real Interaction</h3>
              <p>Moving beyond the screen. Trademarked architecture built for real‑world connection.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Bot-Free</h3>
              <p>Free launch‑phase verification to keep LoveHuddle real.</p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Founder's Offer */}
      <section className="founders-offer">
        <div className="section-container">
          <RevealSection>
            <div className="offer-content">
              <h2>The Founder's <span className="gradient-text">Offer</span></h2>
              <p>LoveHuddle is a solo-founded disruptor proving that the future of tech doesn't belong to Silicon Valley—it belongs to the community.</p>
              <div className="offer-box">
                <h3>LOVEHUDDLE — Founder’s Thank‑You Offer</h3>
                <div className="offer-sections">
                  <div className="offer-section">
                    <h4>Why It’s Free</h4>
                    <p>We’re starting from zero, and it takes time to attract users. This is our thank‑you for being patient while the community grows and for supporting LoveHuddle in its earliest days.</p>
                  </div>
                  <div className="offer-section">
                    <h4>What You Get</h4>
                    <p>The core of LoveHuddle is always free.</p>
                    <p>As one of the first 2,000 members, you’ll also get 90% of all premium features free, just for joining early.</p>
                  </div>
                </div>
              </div>
              <div className="confidentiality-notice">
                <p><small><b>Confidentiality:</b> To protect our world‑first architecture, mechanics remain under wraps until launch. Founding members get the first exclusive look.</small></p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="roadmap-section">
        <div className="section-container">
          <RevealSection>
            <h2 className="section-title text-center">The <span className="gradient-text">Roadmap</span></h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>2025: Blueprint</h3>
                  <p>A full year of strategy, UX, and architectural design completed. Ready for the future.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot active"></div>
                <div className="timeline-content pulse">
                  <h3>March 2026: Active Build</h3>
                  <p>The construction phase begins. Our world‑first architecture comes to life.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>Late Summer Launch 2026: National Rollout</h3>
                  <p>The dawn of a new era. LoveHuddle launches across the UK.</p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="achievements-section">
        <div className="section-container">
          <RevealSection>
            <div className="achievements-inner">
              <div className="achievements-badge-col">
                <a
                  href="https://walesstartupwards.wales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="achievements-badge-link"
                >
                  <div className="achievements-badge-ring">
                    <img src={finalistBadge} alt="Wales StartUp Awards 2026 Finalist" className="achievements-badge-img" />
                  </div>
                </a>
                <span className="achievements-badge-caption">Wales StartUp Awards 2026</span>
              </div>
              <div className="achievements-copy">
                <p className="achievements-eyebrow">✨ Our Achievements</p>
                <h2 className="achievements-headline">
                  Named a Finalist <span className="gradient-text">Before a Single Line of Code Was Written</span>
                </h2>
                <p className="achievements-desc">
                  In early 2026, before development had even commenced, LoveHuddle was officially announced as a <strong>Finalist</strong> for the prestigious <strong>Wales StartUp Awards 2026</strong> in the highly competitive <strong>Innovative StartUp of the Year</strong> category.
                </p>
                <p className="achievements-desc">
                  This early recognition is a powerful testament to our core philosophy: a bold idea, visionary architecture, and an unwavering commitment to disrupting the status quo can resonate profoundly—even before the platform launches. It proves the industry is hungry for a revolution in human connection.
                </p>
                <p className="achievements-desc">
                  <strong>Built solo. Created in Wales. Already turning heads.</strong>
                </p>
                <div className="achievements-stats">
                  <div className="achievement-stat">
                    <span className="achievement-stat-num">2026</span>
                    <span className="achievement-stat-label">Shortlist Year</span>
                  </div>
                  <div className="achievement-stat">
                    <span className="achievement-stat-num">#1</span>
                    <span className="achievement-stat-label">Solo Founder</span>
                  </div>
                  <div className="achievement-stat">
                    <span className="achievement-stat-num">Wales</span>
                    <span className="achievement-stat-label">Created &amp; Built</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Articles Section — preview of latest journal posts */}
      <section id="articles" className="section-container">
        <RevealSection>
          <h2 className="section-title">LoveHuddle <span className="gradient-text">Journal</span></h2>
          <div className="articles-grid">
            {blogPosts.filter(p => p.published !== false).slice(0, 3).map((post, i) => {
              const slug = post.slug || slugify(post.title);
              return (
                <Link
                  key={post.id}
                  to={`/blog/${slug}`}
                  className="article-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="article-date">{post.date}</div>
                  <h3>{post.title}</h3>
                  <p>{post.subtitle || post.excerpt}</p>
                  <span className="read-more">Read Article →</span>
                </Link>
              );
            })}
          </div>
          <div className="articles-cta">
            <Link to="/blog" className="btn-secondary-link">View all stories →</Link>
          </div>
        </RevealSection>
      </section>




    </>
  );
}

/* ─── Default blog posts (empty — content is managed via /admin and stored in Supabase) ─── */
const DEFAULT_BLOG_POSTS = [];

/* ─── Main App with Router ─── */
function App() {
  const [waitlist, setWaitlist] = useState([]);
  const [blogPosts, setBlogPosts] = useState(DEFAULT_BLOG_POSTS);

  /* ── Fetch blog posts from Supabase on mount ── */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) setBlogPosts(data);
      } catch (err) {
        console.log('Using default posts (Supabase unavailable)');
      }
    };
    fetchPosts();
  }, []);

  /* ── Fetch waitlist from Supabase on mount ── */
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const { data, error } = await supabase
          .from('waitlist_entries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) setWaitlist(data);
      } catch (err) {
        console.log('Waitlist fetch skipped (Supabase unavailable)');
      }
    };
    fetchWaitlist();
  }, []);

  const addToWaitlist = async (email) => {
    const entry = { email, date: new Date().toLocaleString('en-GB') };
    try {
      await supabase.from('waitlist_entries').insert([entry]);
      setWaitlist(prev => [entry, ...prev]);
    } catch (err) {
      console.error('Failed to add to waitlist:', err);
    }
  };

  const addPost = async (newPost) => {
    try {
      const payload = {
        title: newPost.title,
        slug: newPost.slug || slugify(newPost.title),
        subtitle: newPost.subtitle || null,
        excerpt: newPost.excerpt,
        content: newPost.content,
        cover_image_url: newPost.cover_image_url || null,
        meta_description: newPost.meta_description || null,
        video_embed_url: newPost.video_embed_url || null,
        category: newPost.category || 'Founder Notes',
        featured: newPost.featured === true,
        published: newPost.published !== false,
        date: newPost.date,
      };
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([payload])
        .select()
        .single();
      if (!error && data) setBlogPosts(prev => [data, ...prev]);
      if (error) throw error;
      return { data, error };
    } catch (err) {
      console.error('Failed to add post:', err);
      return { error: err };
    }
  };

  const editPost = async (updatedPost) => {
    try {
      const payload = {
        title: updatedPost.title,
        slug: updatedPost.slug || slugify(updatedPost.title),
        subtitle: updatedPost.subtitle || null,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        cover_image_url: updatedPost.cover_image_url || null,
        meta_description: updatedPost.meta_description || null,
        video_embed_url: updatedPost.video_embed_url || null,
        category: updatedPost.category || 'Founder Notes',
        featured: updatedPost.featured === true,
        published: updatedPost.published !== false,
      };
      const { data, error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', updatedPost.id)
        .select()
        .single();
      if (!error && data) setBlogPosts(prev => prev.map(p => p.id === data.id ? data : p));
      if (error) throw error;
      return { data, error };
    } catch (err) {
      console.error('Failed to edit post:', err);
      return { error: err };
    }
  };

  const deletePost = async (id) => {
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      setBlogPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="app">
      {/* Navbar — hidden on admin */}
      {!isAdmin && (
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/"><img src={logo} alt="LoveHuddle" className="logo" /></Link>
            <div className="nav-links">
              <a href="/#disruption">The Disruption</a>
              <a href="/#roadmap">The Roadmap</a>
              <a href="/#achievements">Achievements</a>
              <Link to="/blog">Blog</Link>
              <button className="btn-primary" onClick={() => { const el = document.querySelector('.join-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Join Waiting List</button>
            </div>
          </div>
        </nav>
      )}

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing blogPosts={blogPosts} onJoinWaitlist={addToWaitlist} />} />
        <Route path="/blog" element={<BlogIndex fallbackPosts={blogPosts} />} />
        <Route path="/blog/:slug" element={<BlogPost fallbackPosts={blogPosts} />} />
        <Route path="/admin" element={<Admin posts={blogPosts} onAddPost={addPost} onEditPost={editPost} onDeletePost={deletePost} waitlist={waitlist} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {/* Footer — hidden on admin */}
      {!isAdmin && (
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src={logo} alt="LoveHuddle" className="footer-logo" />
              <p className="footer-tagline">A calmer, more human way to meet people.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/#disruption">The Disruption</Link>
              <Link to="/#roadmap">The Roadmap</Link>
              <Link to="/blog">Blog</Link>
            </div>
            <div className="footer-col">
              <h4>Legal &amp; Info</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/safety">Safety &amp; Support</Link>
              <Link to="/cookies">Cookie Policy</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-bottom-bar">
            <p>© 2026 LoveHuddle Ltd. All Rights Reserved.</p>
            <p className="footer-legal-small">Registered in England &amp; Wales | Company No: 16971133 | LoveHuddle™ is a trademark of LoveHuddle Ltd.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
