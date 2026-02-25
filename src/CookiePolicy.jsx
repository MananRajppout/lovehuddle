import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function CookiePolicy() {
    return (
        <div className="legal-page animate-fade-in">
            <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
            <h1>Cookie Policy</h1>
            <p className="legal-updated">Last updated: 24 February 2026</p>

            <section>
                <h2>1. What Are Cookies?</h2>
                <p>Cookies are small text files stored on your device when you visit a website. They help websites function properly, improve performance, and remember certain preferences.</p>
                <p>LoveHuddle uses cookies to keep the platform secure, stable, and easy to use.</p>
            </section>

            <section>
                <h2>2. How We Use Cookies</h2>
                <p>LoveHuddle uses a minimal set of cookies. We do not use invasive tracking, cross‑site advertising cookies, or anything that follows you around the internet.</p>
                <p>We use cookies for:</p>

                <h3>Essential Functionality</h3>
                <p>These cookies are required for the platform to work, including:</p>
                <ul>
                    <li>Logging in</li>
                    <li>Keeping your session active</li>
                    <li>Security and fraud prevention</li>
                    <li>Identity verification flow</li>
                    <li>Basic site performance</li>
                </ul>
                <p>You cannot opt out of essential cookies because the platform won't function without them.</p>

                <h3>Analytics (Optional)</h3>
                <p>If enabled, we may use privacy‑friendly analytics to understand:</p>
                <ul>
                    <li>How people use the platform</li>
                    <li>Which features are popular</li>
                    <li>How to improve performance</li>
                </ul>
                <p>Analytics cookies are optional and only used with your consent.</p>

                <h3>We do not use:</h3>
                <ul>
                    <li>Advertising cookies</li>
                    <li>Behavioural tracking</li>
                    <li>Third‑party marketing cookies</li>
                </ul>
            </section>

            <section>
                <h2>3. Types of Cookies We Use</h2>
                <div className="legal-table-wrap">
                    <table>
                        <thead>
                            <tr><th>Cookie Type</th><th>Purpose</th><th>Required?</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Essential</td><td>Login, security, verification, platform stability</td><td>Yes</td></tr>
                            <tr><td>Analytics</td><td>Anonymous usage insights</td><td>Optional</td></tr>
                            <tr><td>Preference</td><td>Saves small settings like dark/light mode</td><td>Optional</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>4. Third‑Party Cookies</h2>
                <p>During identity verification, our trusted verification partner may use temporary cookies to:</p>
                <ul>
                    <li>Maintain the verification session</li>
                    <li>Prevent fraud</li>
                    <li>Ensure the process completes securely</li>
                </ul>
                <p>These cookies are controlled by the verification provider and are removed automatically after the process.</p>
            </section>

            <section>
                <h2>5. Managing Cookies</h2>
                <p>You can manage or delete cookies through your browser settings at any time.</p>
                <p>However:</p>
                <ul>
                    <li>Disabling essential cookies will prevent LoveHuddle from working</li>
                    <li>Disabling analytics cookies will not affect your ability to use the platform</li>
                </ul>
            </section>

            <section>
                <h2>6. Changes to This Policy</h2>
                <p>We may update this Cookie Policy as the platform evolves. Significant changes will be communicated to users.</p>
            </section>

            <section>
                <h2>7. Contact Us</h2>
                <p>For questions about cookies or privacy:</p>
                <div className="contact-block">
                    <p><strong>Kevin Peddie</strong> – Founder &amp; Director</p>
                    <p>19 Penrhiwtyn Street, Neath, South Wales, SA11 2HG, UK</p>
                    <p><a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></p>
                </div>
            </section>
        </div>
    );
}

export default CookiePolicy;
