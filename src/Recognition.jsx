import React from 'react';
import { Link } from 'react-router-dom';
import walesStartupBadge from './assets/images/wales-startup-2026.jpeg';
import globalRecognitionBadge from './assets/images/global-recognition-2026.jpeg';
import greatBritishBadge from './assets/images/great-british-entrepreneur-2026.jpeg';
import './Recognition.css';

function Recognition() {
  return (
    <div className="recognition-page">
      <div className="recognition-back-wrap">
        <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
      </div>

      <header className="recognition-header">
        <h1>Our Recognition</h1>
        <p className="recognition-lead">
          LoveHuddle Ltd is proud to be recognized by leading national and global industry bodies for our innovative architecture, community-first values, and bold mission to disrupt the dating industry.
        </p>
      </header>

      <div className="recognition-grid">
        {/* Global Recognition Award */}
        <div className="recognition-card winner">
          <div className="recognition-img-wrap">
            <img 
              src={globalRecognitionBadge} 
              alt="Global Recognition Award 2026 Winner" 
              className="recognition-badge-img" 
            />
          </div>
          <span className="recognition-type-pill">Winner</span>
          <h2 className="recognition-title">Global Recognition Award 2026</h2>
          <div className="recognition-org">Global Recognition Awards</div>
          <p className="recognition-desc">
            LoveHuddle was honored with a 2026 Global Recognition Award. This prestigious international award recognises our breakthrough architecture and commitment to establishing a fairer, paywall-free environment that prioritizes authentic human connection and platform safety.
          </p>
        </div>

        {/* Wales StartUp Awards */}
        <div className="recognition-card finalist">
          <div className="recognition-img-wrap">
            <img 
              src={walesStartupBadge} 
              alt="Wales StartUp Awards 2026 Finalist" 
              className="recognition-badge-img" 
            />
          </div>
          <span className="recognition-type-pill">Finalist</span>
          <h2 className="recognition-title">Innovative StartUp of the Year</h2>
          <div className="recognition-org">Wales StartUp Awards 2026</div>
          <p className="recognition-desc">
            Before development had even commenced, LoveHuddle was officially announced as a Finalist for the prestigious Wales StartUp Awards 2026. This early recognition is a powerful testament to our core philosophy: a bold idea, visionary architecture, and an unwavering commitment to disrupting the status quo can resonate profoundly—even before the platform launches.
          </p>
        </div>

        {/* Great British Entrepreneur Awards */}
        <div className="recognition-card finalist">
          <div className="recognition-img-wrap">
            <img 
              src={greatBritishBadge} 
              alt="Great British Entrepreneur Awards 2026 Finalist" 
              className="recognition-badge-img" 
            />
          </div>
          <span className="recognition-type-pill">Finalist</span>
          <h2 className="recognition-title">Start-Up Entrepreneur of the Year</h2>
          <div className="recognition-org">Great British Entrepreneur Awards 2026 (Wales)</div>
          <p className="recognition-desc">
            Founder Kevin Peddie was shortlisted as a Finalist for the Great British Entrepreneur Awards 2026. Often described as the "Grammys of Entrepreneurship," this nomination highlights LoveHuddle's position as a solo-founded disruptor proving that the future of tech belongs to the community.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Recognition;
