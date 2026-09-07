import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/images/logo.png';
import heroBg from './assets/images/hero-bg.png';
import walesStartupBadge from './assets/images/wales-startup-2026.jpeg';
import globalRecognitionBadge from './assets/images/global-recognition-2026.jpeg';
import greatBritishBadge from './assets/images/great-british-entrepreneur-2026.jpeg';
import oddaBadge from './assets/images/odda-badge.jpg';
import Recognition from './Recognition';
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

/* ─── Scroll to top / hash anchor handling on route change ─── */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id) || document.querySelector(`.${id}`) || document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
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
          <span className="launch-line-3 launch-soft-launch">
            U.K. and U.S.A. Soft Launch, Late October 2026
          </span>
        </h3>

        <p className="launch-sub">
          We're starting from zero, and launching this autumn. We're welcoming our first one thousand members in the UK and USA completely free for three months, as our thank you for joining us early. It might feel a little quiet at first, and that's by design. Unlike dating sites of the past, we're not filling this with fake bots or filler accounts. Every core feature is one hundred percent free, no paywalls, no hiding behind fake tables, just real profiles and real connection. Every single person here is real, and we're building this from the ground up together. So we're asking for a little patience in these early days, and if you're having fun, tell your friends, because that's how we grow into something genuinely special.
        </p>

        <div className="launch-highlight-badge">
          <div className="badge-glow" aria-hidden="true"></div>
          <span className="badge-text">
            Built by a solo founder who'd rather redefine the rulebook than clone somebody else's app.
          </span>
        </div>

        <button 
          className="btn-primary launch-claim-btn"
          onClick={() => {
            const formInput = document.querySelector('.join-form input');
            if (formInput) {
              formInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              formInput.focus();
            }
          }}
        >
          Sign up above to claim your spot.
        </button>
      </div>
    </div>
  );
}

/* ─── Landing Page Component ─── */
function Landing({ blogPosts, onJoinWaitlist, detectedCountry }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [waitlistMsg, setWaitlistMsg] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setJoined(false);
    
    // Auto-signup if country is detected as USA or UK, or if country is detected as international
    if (detectedCountry) {
      const result = await onJoinWaitlist(email, detectedCountry);
      setWaitlistMsg(result.message);
      setJoined(true);
      setEmail('');
      setIsSubmitting(false);
    } else {
      // Fallback: show modal if we couldn't detect country
      setPendingEmail(email);
      setShowRegionModal(true);
      setIsSubmitting(false);
    }
  };

  const handleSelectRegion = async (region) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const result = await onJoinWaitlist(pendingEmail, region);
    setWaitlistMsg(result.message);
    setJoined(true);
    setEmail('');
    setPendingEmail('');
    setShowRegionModal(false);
    setIsSubmitting(false);
  };

  const handleCloseModal = () => {
    setShowRegionModal(false);
    setPendingEmail('');
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
          <div className="hero-eyebrow">Beta Launching Autumn 2026</div>
          <h1 className="hero-title">The End of the <span className="gradient-text">Swipe Era</span>.</h1>
          <p className="hero-subtitle">No Catch. No Pressure. Just People.</p>
          <p className="hero-tagline">A New Kind of Hybrid Connection Platform.</p>
          <form className="join-form" onSubmit={handleJoin}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Join Waiting List'}
            </button>
          </form>
          {joined && <p className="success-msg" style={{ maxWidth: '600px', margin: '1rem auto', lineHeight: '1.5' }}>{waitlistMsg}</p>}
          <LaunchAnnounce />
          
          {/* ODDA Member Badge */}
          <div className="odda-badge-section">
            <a 
              href="https://www.onlinedatingassociation.org.uk/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="odda-badge-link"
              title="Online Dating & Discovery Association Member"
            >
              <img 
                src={oddaBadge} 
                alt="Online Dating & Discovery Association Member" 
                className="odda-badge-img" 
              />
            </a>
          </div>
        </div>
      </header>

      {/* Region Picker Modal */}
      {showRegionModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="region-modal-card glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">&times;</button>
            <div className="modal-glow"></div>
            
            <div className="modal-header">
              <h3>Choose Your Region</h3>
              <p>To help us customize your experience and track our 1,000 member soft launch cap, please select your country.</p>
            </div>

            <div className="region-options-grid">
              <button className="region-option-card" onClick={() => handleSelectRegion('UK')} disabled={isSubmitting}>
                <div className="region-flag">🇬🇧</div>
                <div className="region-details">
                  <span className="region-name">United Kingdom</span>
                  <span className="region-limit">Soft Launch Cap: 1,000</span>
                </div>
              </button>

              <button className="region-option-card" onClick={() => handleSelectRegion('USA')} disabled={isSubmitting}>
                <div className="region-flag">🇺🇸</div>
                <div className="region-details">
                  <span className="region-name">United States</span>
                  <span className="region-limit">Soft Launch Cap: 1,000</span>
                </div>
              </button>

              <button className="region-option-card" onClick={() => handleSelectRegion('Other')} disabled={isSubmitting}>
                <div className="region-flag">🌐</div>
                <div className="region-details">
                  <span className="region-name">Other / International</span>
                  <span className="region-limit">Launching Later</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recognised By Section */}
      <section className="recognised-section">
        <div className="section-container">
          <RevealSection>
            <h2 className="recognised-title">Recognised By</h2>
            <div className="recognised-badges">
              <div className="recognised-badge-item">
                <div className="recognised-badge-ring">
                  <img src={walesStartupBadge} alt="Wales StartUp Awards 2026 Finalist" className="recognised-badge-img" />
                </div>
                <span className="recognised-badge-caption">Wales StartUp Awards 2026 — Finalist</span>
              </div>
              <div className="recognised-badge-item">
                <div className="recognised-badge-ring">
                  <img src={globalRecognitionBadge} alt="Global Recognition Award 2026 Winner" className="recognised-badge-img" />
                </div>
                <span className="recognised-badge-caption">Global Recognition Award 2026 — Winner</span>
              </div>
              <div className="recognised-badge-item">
                <div className="recognised-badge-ring">
                  <img src={greatBritishBadge} alt="Great British Entrepreneur Awards 2026 Finalist" className="recognised-badge-img" />
                </div>
                <span className="recognised-badge-caption">Great British Entrepreneur Awards 2026 — Finalist</span>
              </div>
            </div>
            <div className="recognised-cta">
              <Link to="/recognition" className="recognised-link">See our recognition →</Link>
            </div>
          </RevealSection>
        </div>
      </section>

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
            <div className="feature-card feature-card-paywall">
              <div className="feature-icon">🚫</div>
              <h3>No Paywalls</h3>
              <p>We are ending the 'pay-to-socialize' era. Core features will never be locked away.</p>
              
              <div className="paywall-perk-box">
                <div className="paywall-perk-glow" aria-hidden="true"></div>
                <div className="paywall-perk-badge">
                  <span className="paywall-perk-spark">✨</span> Early Member Perk
                </div>
                <h4 className="paywall-perk-title">Real connection should be free.</h4>
                <p className="paywall-perk-text">
                  That's the belief LoveHuddle is built on. Our core experience — matching, chatting, connecting — is free.
                </p>
                <p className="paywall-perk-sub">
                  We've added a few optional, low-cost features to help keep LoveHuddle running and improving. As a thank-you for joining early, our first 1,000 members get all currently available optional features completely free for three months.
                </p>
              </div>
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
  const [detectedCountry, setDetectedCountry] = useState(null);

  /* ── Track unique visitor and detect country ── */
  useEffect(() => {
    const trackVisitorAndDetectCountry = async () => {
      let code = null;
      try {
        const res = await fetch('https://api.country.is');
        if (res.ok) {
          const data = await res.json();
          if (data && data.country) {
            code = data.country;
          }
        }
      } catch (err) {
        console.log('Failed to detect country via api.country.is, trying fallback...');
      }

      if (!code) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.country_code) {
              code = data.country_code;
            }
          }
        } catch (err) {
          console.log('Fallback country detection failed.');
        }
      }

      if (code) {
        setDetectedCountry(code);
      }

      // Check if visit is already logged for this device/browser
      const isLogged = localStorage.getItem('lh_visit_logged');
      if (!isLogged) {
        let visitorId = localStorage.getItem('lh_visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('lh_visitor_id', visitorId);
        }

        let countryName = 'Unknown';
        if (code) {
          try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            countryName = regionNames.of(code) || code;
          } catch (e) {
            countryName = code;
          }
        }

        try {
          const { error } = await supabase.from('site_visits').upsert({
            visitor_id: visitorId,
            country: countryName,
            country_code: code || 'XX'
          }, { onConflict: 'visitor_id' });
          
          if (!error) {
            localStorage.setItem('lh_visit_logged', 'true');
          }
        } catch (dbErr) {
          console.error('Failed to log site visit to database:', dbErr);
        }
      }
    };

    trackVisitorAndDetectCountry();
  }, []);

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

  const addToWaitlist = async (email, region) => {
    // Normalize region: if 'US' or 'USA' -> 'USA', if 'GB' or 'UK' -> 'UK'.
    let normalizedRegion = region;
    if (region === 'US' || region === 'USA') normalizedRegion = 'USA';
    if (region === 'GB' || region === 'UK') normalizedRegion = 'UK';

    const isUsaOrUk = normalizedRegion === 'USA' || normalizedRegion === 'UK';

    try {
      // 1. Fetch exact current combined count from Supabase to prevent race conditions
      let combinedCount = 0;
      if (isUsaOrUk) {
        const { count: dbCount, error: countErr } = await supabase
          .from('waitlist_entries')
          .select('id', { count: 'exact', head: true })
          .in('region', ['USA', 'UK']);
        if (!countErr && dbCount !== null) {
          combinedCount = dbCount;
        }
      }

      // 2. Perform insertion
      const entry = { 
        email, 
        region: normalizedRegion, 
        date: new Date().toLocaleString('en-GB') 
      };
      
      const { error: insertErr } = await supabase.from('waitlist_entries').insert([entry]);
      if (insertErr) throw insertErr;

      // Update state
      setWaitlist(prev => [entry, ...prev]);

      // 3. Return appropriate response
      if (!isUsaOrUk) {
        let countryName = normalizedRegion;
        if (normalizedRegion !== 'Other') {
          try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            countryName = regionNames.of(normalizedRegion) || normalizedRegion;
          } catch (e) {}
        } else {
          countryName = 'your country';
        }
        
        return {
          status: 'international',
          message: `Thank you for your interest! LoveHuddle is currently launching exclusively in the UK and USA. We have added you to our international waiting list and will let you know as soon as we launch in ${countryName}.`
        };
      } else if (combinedCount >= 1000) {
        return {
          status: 'exceeded',
          message: `Thank you so much for your interest! We are offering our free three-month trial to the first 1,000 members in the UK and USA combined, and this limit has now been reached. However, we have added you to our waiting list and will let you know as soon as we officially launch.`
        };
      } else {
        return {
          status: 'success',
          message: `✓ Welcome! You've successfully claimed one of our free soft launch spots for the first 1,000 members in the UK and USA. We'll be in touch soon!`
        };
      }
    } catch (err) {
      console.error('Failed to add to waitlist:', err);
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('duplicate') || err?.code === '23505') {
        return {
          status: 'duplicate',
          message: 'This email is already registered on our waiting list. Stay tuned for updates!'
        };
      }
      return {
        status: 'error',
        message: 'Something went wrong. Please check your connection and try again.'
      };
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
  const navigate = useNavigate();
  const isAdmin = location.pathname === '/admin';

  const handleJoinClick = () => {
    if (location.pathname !== '/') {
      navigate('/#join');
    } else {
      const el = document.querySelector('.join-form');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="app">
      {/* Navbar — hidden on admin */}
      {!isAdmin && (
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/"><img src={logo} alt="LoveHuddle" className="logo" /></Link>
            <div className="nav-links">
              <Link to="/#disruption">The Disruption</Link>
              <Link to="/#roadmap">The Roadmap</Link>
              <Link to="/recognition">Recognition</Link>
              <Link to="/blog">Blog</Link>
              <button className="btn-primary" onClick={handleJoinClick}>Join Waiting List</button>
            </div>
          </div>
        </nav>
      )}

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing blogPosts={blogPosts} onJoinWaitlist={addToWaitlist} detectedCountry={detectedCountry} />} />
        <Route path="/recognition" element={<Recognition />} />
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
            <div className="footer-col">
              <h4>Social</h4>
              <a href="https://www.facebook.com/lovehuddle" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.instagram.com/lovehuddleofficial" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@lovehuddle" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://www.youtube.com/@LoveHuddle" target="_blank" rel="noopener noreferrer">YouTube</a>
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
