import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function Contact() {
    return (
        <div className="legal-page animate-fade-in">
            <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
            <h1>Contact Us</h1>
            <p className="legal-subtitle">We'd love to hear from you</p>

            <section>
                <h2>Get in Touch</h2>
                <p>If you have any questions about LoveHuddle, our platform, or your data, don't hesitate to reach out.</p>

                <div className="contact-block">
                    <p><strong>Kevin Peddie</strong></p>
                    <p>Founder and Director, LoveHuddle Ltd</p>
                    <p><a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></p>
                </div>

                <div className="contact-details">
                    <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <div>
                            <strong>Address</strong>
                            <p>19 Penrhiwtyn Street<br />Neath, South Wales<br />SA11 2HG, UK</p>
                        </div>
                    </div>
                    <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <div>
                            <strong>Phone</strong>
                            <p><a href="tel:07907551655" className="legal-link">07907 551 655</a></p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2>About LoveHuddle</h2>
                <p>LoveHuddle is a solo‑founded, UK‑based dating platform being built in Wales. We're creating a calmer, more human alternative to the existing dating apps — no swiping, no paywalls, just real connection.</p>
                <p>We're currently in the build phase ahead of our Summer 2026 national launch. Join the waiting list on our <Link to="/" className="legal-link">homepage</Link> to be among the first to experience LoveHuddle.</p>
            </section>
        </div>
    );
}

export default Contact;
