import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function Safety() {
    return (
        <div className="legal-page animate-fade-in">
            <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
            <h1>Safety &amp; Support</h1>
            <p className="legal-subtitle">Your safety is our priority</p>
            <p className="legal-updated">Last updated: 24 February 2026</p>

            <section>
                <h2>1. Our Commitment to Safety</h2>
                <p>LoveHuddle is designed as a calm, adult‑only, UK‑friendly space for genuine connection. Safety is central to how the platform operates.</p>
                <p>This policy explains:</p>
                <ul>
                    <li>How we keep the community safe</li>
                    <li>How users can report concerns</li>
                    <li>How we respond</li>
                    <li>What support is available</li>
                </ul>
            </section>

            <section>
                <h2>2. Mandatory Identity Verification</h2>
                <p>To protect the community:</p>
                <ul>
                    <li>All users must complete identity verification before accessing the platform</li>
                    <li>Verification is processed through a trusted third‑party provider</li>
                    <li>A verification fee is paid to LoveHuddle as part of joining</li>
                    <li>Unverified accounts cannot view profiles, message, call, or join Huddles</li>
                </ul>
                <p>This ensures LoveHuddle remains a genuine, human‑only community.</p>
            </section>

            <section>
                <h2>3. Platform Safety Measures</h2>
                <p>We use a combination of:</p>
                <ul>
                    <li>Identity verification</li>
                    <li>Automated safety tools</li>
                    <li>Human moderation</li>
                    <li>Behaviour monitoring</li>
                    <li>UK‑only access controls</li>
                </ul>

                <h3>We may restrict or remove accounts that:</h3>
                <ul>
                    <li>Fail verification</li>
                    <li>Provide false information</li>
                    <li>Harass or harm others</li>
                    <li>Upload harmful or illegal content</li>
                    <li>Attempt to misuse the platform</li>
                </ul>
            </section>

            <section>
                <h2>4. User Responsibilities</h2>
                <p>To help maintain a safe environment, users must:</p>
                <ul>
                    <li>Treat others with respect</li>
                    <li>Use accurate information</li>
                    <li>Avoid sharing sensitive personal details too quickly</li>
                    <li>Report harmful behaviour</li>
                    <li>Follow all <Link to="/terms" className="legal-link">Terms of Service</Link></li>
                </ul>
                <p>LoveHuddle is a community built on trust and calm interaction.</p>
            </section>

            <section>
                <h2>5. Reporting Harmful Behaviour</h2>
                <p>If you experience or witness:</p>
                <ul>
                    <li>Harassment</li>
                    <li>Abuse</li>
                    <li>Threats</li>
                    <li>Fake profiles</li>
                    <li>Suspicious behaviour</li>
                    <li>Safety concerns</li>
                </ul>
                <p>…you can report it directly through the platform or by contacting us.</p>

                <h3>How to report:</h3>
                <ul>
                    <li>Use the in‑app reporting tools</li>
                    <li>Or email us directly at <a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></li>
                </ul>
                <p>Reports are reviewed as quickly as possible.</p>
            </section>

            <section>
                <h2>6. How We Handle Reports</h2>
                <p>When a report is submitted:</p>
                <ol className="legal-ordered">
                    <li>We review the content and account involved</li>
                    <li>We may request additional information</li>
                    <li>We may temporarily restrict the reported account</li>
                    <li>We take appropriate action, which may include:
                        <ul>
                            <li>Warning the user</li>
                            <li>Removing content</li>
                            <li>Restricting features</li>
                            <li>Permanent account removal</li>
                            <li>Escalation to authorities if required by law</li>
                        </ul>
                    </li>
                </ol>
                <p>We do not disclose the identity of the person who submitted the report.</p>
            </section>

            <section>
                <h2>7. Support for Users</h2>
                <p>If you feel unsafe, uncomfortable, or unsure how to handle a situation, you can contact our support team.</p>
                <p>We can:</p>
                <ul>
                    <li>Provide guidance</li>
                    <li>Review interactions</li>
                    <li>Help you block or report users</li>
                    <li>Offer safety advice</li>
                </ul>
            </section>

            <section>
                <h2>8. Blocking</h2>
                <p>You can block any user at any time. Blocked users cannot:</p>
                <ul>
                    <li>View your profile</li>
                    <li>Message you</li>
                    <li>Call you</li>
                    <li>Interact with you in Huddles</li>
                </ul>
                <p>Blocking is immediate and silent.</p>
            </section>

            <section>
                <h2>9. Account Removal</h2>
                <p>We may remove accounts that:</p>
                <ul>
                    <li>Fail identity verification</li>
                    <li>Break our <Link to="/terms" className="legal-link">Terms of Service</Link></li>
                    <li>Pose safety risks</li>
                    <li>Engage in harmful behaviour</li>
                    <li>Attempt to bypass verification or restrictions</li>
                </ul>
                <p>Account removal decisions are final.</p>
            </section>

            <section>
                <h2>10. Updates to This Policy</h2>
                <p>We may update this policy as the platform evolves. Significant changes will be communicated to users.</p>
            </section>

            <section>
                <h2>11. Contact Us</h2>
                <p>For safety or support concerns:</p>
                <div className="contact-block">
                    <p><strong>Kevin Peddie</strong> – Founder &amp; Director</p>
                    <p>19 Penrhiwtyn Street, Neath, South Wales, SA11 2HG, UK</p>
                    <p><a href="mailto:hello@lovehuddle.com" className="legal-link">hello@lovehuddle.com</a></p>
                </div>
            </section>
        </div>
    );
}

export default Safety;
