import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function PrivacyPolicy() {
    return (
        <div className="legal-page animate-fade-in">
            <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
            <h1>Privacy Policy</h1>
            <p className="legal-subtitle">UK GDPR Compliant</p>
            <p className="legal-updated">Last updated: 24 February 2026</p>

            <section>
                <h2>1. Who We Are</h2>
                <p>LoveHuddle.com ("LoveHuddle", "we", "us") is a UK‑friendly online connections platform. We are the data controller for all personal data collected through our website and app.</p>
                <div className="contact-block">
                    <p><strong>Contact:</strong></p>
                    <p>Kevin Peddie (Founder and Director)</p>
                    <p>19 Penrhiwtyn Street, Neath, South Wales, SA11 2HG, UK</p>
                    <p><a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></p>
                </div>
            </section>

            <section>
                <h2>2. What Personal Data We Collect</h2>

                <h3>Account &amp; Identity Data</h3>
                <ul>
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number (+44 verification)</li>
                    <li>Date of birth</li>
                    <li>Profile information (photos, bio, preferences)</li>
                </ul>

                <h3>Usage Data</h3>
                <ul>
                    <li>Log‑in activity</li>
                    <li>Interactions on the platform (messages, calls, likes)</li>
                    <li>Device information (browser, IP address, OS)</li>
                </ul>

                <h3>Verification Data</h3>
                <ul>
                    <li>Phone verification</li>
                    <li>Optional identity verification (via third‑party provider)</li>
                </ul>

                <h3>Payment Data (if applicable)</h3>
                <ul>
                    <li>Only processed by our payment provider</li>
                    <li>We do not store card details</li>
                </ul>

                <h3>Cookies &amp; Tracking</h3>
                <ul>
                    <li>Essential cookies for login and security</li>
                    <li>Analytics cookies (optional, user‑controlled)</li>
                </ul>
            </section>

            <section>
                <h2>3. How We Collect Your Data</h2>
                <ul>
                    <li>Directly from you when you create an account</li>
                    <li>Automatically through your device when using the platform</li>
                    <li>Through third‑party verification partners</li>
                    <li>Through payment processors (for optional paid features)</li>
                </ul>
            </section>

            <section>
                <h2>4. Why We Use Your Data (Purposes &amp; Lawful Bases)</h2>
                <p>Under UK GDPR, we must have a lawful basis for each use:</p>
                <div className="legal-table-wrap">
                    <table>
                        <thead>
                            <tr><th>Purpose</th><th>Lawful Basis</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Creating and managing your account</td><td>Contract</td></tr>
                            <tr><td>Enabling messaging and calls</td><td>Contract</td></tr>
                            <tr><td>Safety, moderation, fraud prevention</td><td>Legitimate interests</td></tr>
                            <tr><td>Identity verification</td><td>Legitimate interests / Consent</td></tr>
                            <tr><td>Analytics to improve the platform</td><td>Legitimate interests</td></tr>
                            <tr><td>Sending service emails</td><td>Legitimate interests</td></tr>
                            <tr><td>Optional marketing</td><td>Consent</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>5. Who We Share Your Data With</h2>
                <p>We only share data with:</p>
                <ul>
                    <li>Identity verification provider (for optional verification)</li>
                    <li>Payment processor (for optional paid features)</li>
                    <li>Hosting provider (secure UK/EU servers)</li>
                    <li>Moderation &amp; safety tools</li>
                    <li>Law enforcement (only when legally required)</li>
                </ul>
                <p className="legal-highlight">We never sell your data.</p>
            </section>

            <section>
                <h2>6. International Transfers</h2>
                <p>If any partner processes data outside the UK/EU, we ensure:</p>
                <ul>
                    <li>Adequacy regulations, or</li>
                    <li>ICO‑approved Standard Contractual Clauses (SCCs)</li>
                </ul>
            </section>

            <section>
                <h2>7. How Long We Keep Your Data</h2>
                <ul>
                    <li><strong>Account data:</strong> kept while your account is active</li>
                    <li><strong>Messages/calls:</strong> retained for safety for a limited period</li>
                    <li><strong>Deleted accounts:</strong> fully removed within 30–90 days</li>
                    <li><strong>Verification data:</strong> stored only as long as required by the provider</li>
                </ul>
            </section>

            <section>
                <h2>8. Your Rights</h2>
                <p>Under UK GDPR, you have the right to:</p>
                <ul>
                    <li>Access your data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your data</li>
                    <li>Restrict processing</li>
                    <li>Object to processing</li>
                    <li>Port your data</li>
                    <li>Withdraw consent (for marketing or optional verification)</li>
                </ul>
            </section>

            <section>
                <h2>9. Security Measures</h2>
                <p>We use:</p>
                <ul>
                    <li>Encrypted data transmission (HTTPS/TLS)</li>
                    <li>Secure UK/EU hosting</li>
                    <li>Access controls and monitoring</li>
                    <li>Regular security reviews</li>
                    <li>Phone verification and anti‑fraud systems</li>
                </ul>
            </section>

            <section>
                <h2>10. Direct Marketing</h2>
                <p>We only send marketing if you opt in. You can unsubscribe at any time.</p>
            </section>

            <section>
                <h2>11. Updates to This Policy</h2>
                <p>We may update this policy to reflect changes in law or platform features. We will notify users of significant changes.</p>
            </section>

            <section>
                <h2>12. Contact Us</h2>
                <p>For privacy questions or concerns:</p>
                <div className="contact-block">
                    <p><strong>Kevin Peddie</strong></p>
                    <p>Founder and Director, LoveHuddle Ltd</p>
                    <p>19 Penrhiwtyn Street, Neath, South Wales, SA11 2HG, UK</p>
                    <p><a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></p>
                </div>
            </section>
        </div>
    );
}

export default PrivacyPolicy;
