import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/images/logo.png';
import heroBg from './assets/images/hero-bg.png';
import finalistBadge from './assets/images/badge.jpeg';
import Admin from './Admin';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import Safety from './Safety';
import CookiePolicy from './CookiePolicy';
import Contact from './Contact';

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
          <span className="launch-line-1">A New Era of Dating</span>
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
          The official build is underway — a bold new way to meet and connect is almost here.
        </p>
      </div>
    </div>
  );
}

/* ─── Landing Page Component ─── */
function Landing({ blogPosts, activeBlog, setActiveBlog, onJoinWaitlist }) {
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

  /* ── Open blog: push a history entry so Back closes the modal ── */
  const openBlog = (post) => {
    setActiveBlog(post);
    window.history.pushState({ blog: true }, '');
  };

  /* ── Close blog: go back in history to pop the entry we pushed ── */
  const closeBlog = () => {
    if (activeBlog) {
      window.history.back();   // triggers popstate → clears activeBlog
    }
  };

  /* ── Listen for browser Back button to close the modal ── */
  useEffect(() => {
    const onPopState = () => {
      setActiveBlog(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setActiveBlog]);

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
              <p>A one‑time small £4 verification fee ensures safety and a community of real humans. First 500 are FREE.</p>
            </div>
          </div>
        </RevealSection>
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

      {/* Articles Section */}
      <section id="articles" className="section-container">
        <RevealSection>
          <h2 className="section-title">LoveHuddle <span className="gradient-text">Articles</span></h2>
          <div className="articles-grid">
            {blogPosts.map((post, i) => (
              <div key={post.id} className="article-card" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => openBlog(post)}>
                <div className="article-date">{post.date}</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="read-more">Read Article →</span>
              </div>
            ))}
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
                <h3>100% Free Core Use</h3>
                <p>Optional premium add-ons may come later, but the heart of LoveHuddle will always be free. We are giving away the first <b>500 verifications for FREE</b>.</p>
              </div>
              <div className="confidentiality-notice">
                <p><small><b>Confidentiality:</b> To protect our world‑first architecture, mechanics remain under wraps until launch. Founding members get the first exclusive look.</small></p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>


      {/* Blog Modal */}
      {activeBlog && (
        <div className="modal-overlay" onClick={closeBlog}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeBlog}>&times;</button>
            <div className="article-date">{activeBlog.date}</div>
            <h2>{activeBlog.title}</h2>
            <div className="article-body">
              {activeBlog.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Default blog posts ─── */
const DEFAULT_BLOG_POSTS = [
  {
    id: 0,
    title: "Why I'm Building a Dating Platform Without Swiping or Paywalls",
    excerpt: "Dating apps were created to help people connect — but somewhere along the way, they became noisy, rushed, and transactional.",
    content: `Dating apps were created to help people connect — but somewhere along the way, they became noisy, rushed, and transactional. Swipe left, swipe right, repeat. Paywalls everywhere. Matches that go nowhere. Conversations that never start. It's a system built for speed, not for people.

Living here in Wales, I've seen the same frustration that many adults across the UK feel: dating apps have become exhausting. They push you to scroll, judge quickly, and move on even faster. They're designed to keep you hooked, not to help you meet someone meaningful.

So I decided to build something different.

LoveHuddle is a new kind of dating platform — a calm, human‑centred alternative for adults who want real connection without the pressure. No swiping. No paywalls. No tricks. Just a slower, more intentional way to meet someone who genuinely fits your life.

The problem with swiping

Swiping looks simple, but it creates a fast, disposable mindset. You're encouraged to make instant decisions based on a photo and a split‑second reaction. It's addictive, but it's not meaningful.

LoveHuddle removes swiping entirely. Instead of chasing matches, you build connection through small, thoughtful daily questions — simple prompts that help people open up naturally. Not interviews. Not forms. Just real conversation, one step at a time.

Why there are no paywalls

Most dating apps hide the best features behind subscriptions. Want to see who liked you? Pay. Want to message someone? Pay. Want to boost your profile? Pay again.

LoveHuddle is different. There are no hidden fees and no premium tiers. Everyone gets the same experience. Everyone has the same chance to connect. Because connection shouldn't be something you have to unlock.

A calmer, more human way to meet people

LoveHuddle is built for adults who want something real — people who are tired of the noise, the pressure, and the endless scrolling. It's for those who value depth over speed, honesty over performance, and conversation over algorithms.

This platform is being built intentionally, step by step, with a simple mission: Create a space where adults can connect without being rushed, pushed, or sold to.

If that resonates with you, you're in the right place. LoveHuddle is for people who want connection that feels human again — and this is just the beginning.`,
    date: "Feb 24, 2026"
  },
  {
    id: 4,
    title: "Shortlisted Before Launch: LoveHuddle Makes the Wales StartUp Awards 2026",
    excerpt: "Before a single line of code was written, LoveHuddle was officially shortlisted for Innovative StartUp of the Year at the Wales StartUp Awards 2026.",
    content: `There's a moment every founder dreams about — the moment someone outside your own head believes in what you're building.

For LoveHuddle, that moment came early. Before our platform was built. Before our app existed. Before we had even written a single line of production code.

In early 2026, LoveHuddle was officially shortlisted for the Wales StartUp Awards 2026 in the category of Innovative StartUp of the Year.

Let that sink in for a moment.

A solo-founded startup, conceived and built in South Wales, was recognised on a national stage — not because of millions in funding or a team of fifty engineers — but because of an idea. A vision. A refusal to accept that the dating app industry couldn't be done better.

What does this mean?

This shortlisting is more than an award nomination. It's validation. It tells us that the world is ready for something different. That people — judges, industry professionals, entrepreneurs — can see the gap in the market that we've been talking about.

Dating apps have been broken for years. Swipe culture, paywalls, bots, fake profiles, endless subscriptions. LoveHuddle set out to tear all of that down and replace it with something genuinely human.

And before we even launched, the Welsh startup community agreed.

Why Wales?

Wales often gets overlooked in the UK tech conversation. The spotlight usually falls on London, Manchester, or Edinburgh. But some of the most innovative thinking in the UK is happening right here — in communities that understand people, that value authenticity, and that build things that matter.

LoveHuddle was always going to be built here. Not because of circumstance, but by design. We believe that the future of tech doesn't belong to Silicon Valley. It belongs to communities. And this shortlisting proves that Welsh innovation can compete on any stage.

What's next?

We're now in active development. The platform is being built. The waitlist is growing. Late Summer Launch 2026 is the target.

This shortlisting lights a fire under everything we're doing. It's a reminder that the idea was always worth fighting for — and now, it's time to build it.

If you haven't joined the waiting list yet, now is the time. Be part of something that was recognised as innovative before it even launched.`,
    date: "Apr 1, 2026"
  },
  {
    id: 0,
    title: "The Death of the Algorithm",
    excerpt: "Why swiping is killing human connection and how we're fixing it.",
    content: `For too long, our social lives have been dictated by algorithms designed to keep us scrolling rather than meeting. LoveHuddle is stripping away the digital barriers to bring back genuine human moments.

The dating industry has become a machine — one that profits from loneliness, not from love. Every time you swipe, you feed the algorithm. Every paywall you encounter is designed to exploit your desire for connection.

We believe that meaningful relationships start with meaningful conversations. Not with a split-second swipe based on a heavily filtered photo.

LoveHuddle's approach is fundamentally different. We're building technology that gets out of the way — that facilitates real human interaction rather than replacing it with an addictive digital substitute.

Stay tuned for more updates as we approach the build phase in March 2026.`,
    date: "Feb 24, 2026"
  },
  {
    id: 2,
    title: "Built in Wales, for the UK",
    excerpt: "The journey of a solo founder disrupting Silicon Valley.",
    content: `Tech doesn't just belong to big corporations in California. LoveHuddle is architected in Wales, built with the UK community at its heart. We believe in ethical, local impact over distant profit.

The UK dating scene deserves better than recycled Silicon Valley products. We deserve platforms that understand our culture, our values, and our way of life.

As a solo founder based in Wales, I've seen firsthand how technology can either bring communities together or tear them apart. LoveHuddle is my answer to the question: what would a dating platform look like if it were built by someone who actually cared about the people using it?

Every design decision, every feature, every policy is made with one question in mind: does this help real people make real connections?

Stay tuned for more updates as we approach the build phase in March 2026.`,
    date: "Feb 20, 2026"
  },
  {
    id: 3,
    title: "The Late Summer Launch 2026 Vision",
    excerpt: "What to expect when we launch nationally.",
    content: `Launching a platform without paywalls is a bold move. Here is the roadmap for how we will reach every corner of the UK by Late Summer Launch 2026, ensuring safety and authenticity with every connection.

Our vision is simple but ambitious: create the UK's most trusted, most human dating platform — one that puts people before profit.

Phase 1 is our closed beta, where our founding 500 members will shape the platform's future. Phase 2 expands to major UK cities. Phase 3 is the full national rollout.

At every stage, safety comes first. Our one-time verification process ensures that every person on LoveHuddle is exactly who they say they are.

Stay tuned for more updates as we approach the build phase in March 2026.`,
    date: "Feb 15, 2026"
  }
];

/* ─── Main App with Router ─── */
function App() {
  const [waitlist, setWaitlist] = useState([]);
  const [activeBlog, setActiveBlog] = useState(null);
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
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content,
          date: newPost.date
        }])
        .select()
        .single();
      if (!error && data) setBlogPosts(prev => [data, ...prev]);
    } catch (err) {
      console.error('Failed to add post:', err);
    }
  };

  const editPost = async (updatedPost) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title: updatedPost.title,
          excerpt: updatedPost.excerpt,
          content: updatedPost.content
        })
        .eq('id', updatedPost.id)
        .select()
        .single();
      if (!error && data) setBlogPosts(prev => prev.map(p => p.id === data.id ? data : p));
    } catch (err) {
      console.error('Failed to edit post:', err);
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
              <a href="/#articles">Articles</a>
              <button className="btn-primary" onClick={() => { const el = document.querySelector('.join-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Join Waiting List</button>
            </div>
          </div>
        </nav>
      )}

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing blogPosts={blogPosts} activeBlog={activeBlog} setActiveBlog={setActiveBlog} onJoinWaitlist={addToWaitlist} />} />
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
              <Link to="/#articles">Articles</Link>
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
