import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/images/logo.png';
import heroBg from './assets/images/hero-bg.png';
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
          <div className="hero-eyebrow">Beta Launching Summer 2026</div>
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
        </div>
        <div className="hero-scroll-hint">
          <span>Discover More</span>
          <div className="scroll-arrow"></div>
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
                  <h3>Summer 2026: National Rollout</h3>
                  <p>The dawn of a new era. LoveHuddle launches across the UK.</p>
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

/* ─── Main App with Router ─── */
function App() {
  const [waitlist, setWaitlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lh_waitlist')) || [];
    } catch { return []; }
  });

  const [activeBlog, setActiveBlog] = useState(null);

  const [blogPosts, setBlogPosts] = useState([
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
      id: 1,
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
      title: "The Summer 2026 Vision",
      excerpt: "What to expect when we launch nationally.",
      content: `Launching a platform without paywalls is a bold move. Here is the roadmap for how we will reach every corner of the UK by Summer 2026, ensuring safety and authenticity with every connection.

Our vision is simple but ambitious: create the UK's most trusted, most human dating platform — one that puts people before profit.

Phase 1 is our closed beta, where our founding 500 members will shape the platform's future. Phase 2 expands to major UK cities. Phase 3 is the full national rollout.

At every stage, safety comes first. Our one-time verification process ensures that every person on LoveHuddle is exactly who they say they are.

Stay tuned for more updates as we approach the build phase in March 2026.`,
      date: "Feb 15, 2026"
    }
  ]);

  const addToWaitlist = (email) => {
    const entry = { email, date: new Date().toLocaleString('en-GB') };
    const updated = [entry, ...waitlist];
    setWaitlist(updated);
    localStorage.setItem('lh_waitlist', JSON.stringify(updated));
  };

  const addPost = (newPost) => {
    setBlogPosts([newPost, ...blogPosts]);
  };

  const deletePost = (id) => {
    setBlogPosts(blogPosts.filter(p => p.id !== id));
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/"><img src={logo} alt="LoveHuddle" className="logo" /></Link>
          <div className="nav-links">
            <a href="/#disruption">The Disruption</a>
            <a href="/#roadmap">The Roadmap</a>
            <a href="/#articles">Articles</a>
            <button className="btn-primary" onClick={() => { const el = document.querySelector('.join-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Join Waiting List</button>
          </div>
        </div>
      </nav>

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing blogPosts={blogPosts} activeBlog={activeBlog} setActiveBlog={setActiveBlog} onJoinWaitlist={addToWaitlist} />} />
        <Route path="/admin" element={<Admin posts={blogPosts} onAddPost={addPost} onDeletePost={deletePost} waitlist={waitlist} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {/* Footer */}
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
    </div>
  );
}

export default App;
