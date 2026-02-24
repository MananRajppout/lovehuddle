import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function TermsOfService() {
    return (
        <div className="legal-page animate-fade-in">
            <Link to="/" className="btn-primary legal-back">← Back to Home</Link>
            <h1>Terms of Service</h1>
            <p className="legal-updated">Last updated: 24 February 2026</p>

            <section>
                <h2>1. Introduction</h2>
                <p>Welcome to LoveHuddle ("we", "us", "our"). By creating an account or using LoveHuddle.com, you agree to these Terms of Service ("Terms"). If you do not agree, please do not use the platform.</p>
                <p>LoveHuddle is a UK‑friendly online connections platform designed for calm, adult‑only interaction.</p>
            </section>

            <section>
                <h2>2. Eligibility</h2>
                <p>To use LoveHuddle, you must:</p>
                <ul>
                    <li>Be 18 or older</li>
                    <li>Live in the United Kingdom</li>
                    <li>Create an account with accurate information</li>
                    <li>Complete mandatory identity verification through our trusted third‑party verification partner</li>
                    <li>Pay the small verification fee required by the verification provider</li>
                    <li>Not be legally prohibited from using online connection platforms</li>
                </ul>
                <p>Verification is required before accessing any part of the platform.</p>
            </section>

            <section>
                <h2>3. Your Account</h2>
                <p>You must complete third‑party identity verification before you can:</p>
                <ul>
                    <li>View profiles</li>
                    <li>Send or receive messages</li>
                    <li>Join Huddles</li>
                    <li>Make calls</li>
                    <li>Use any feature of the platform</li>
                </ul>
                <p>The verification fee is charged by the verification provider, not by LoveHuddle. This fee is non‑refundable once submitted.</p>

                <h3>You are responsible for:</h3>
                <ul>
                    <li>Keeping your login details secure</li>
                    <li>Ensuring your profile information is accurate</li>
                    <li>All activity that occurs under your account</li>
                </ul>

                <h3>We may suspend or remove accounts that:</h3>
                <ul>
                    <li>Fail verification</li>
                    <li>Provide false information</li>
                    <li>Pose safety risks</li>
                    <li>Break these Terms</li>
                </ul>
            </section>

            <section>
                <h2>4. What LoveHuddle Provides</h2>
                <p>LoveHuddle offers:</p>
                <ul>
                    <li>Free messaging</li>
                    <li>Free calls</li>
                    <li>Free profiles</li>
                    <li>Free matching</li>
                    <li>Daily Huddles</li>
                    <li>A UK‑only community</li>
                    <li>Optional paid features ("Boosts", "Priority", "Verification Badge", etc.)</li>
                </ul>
                <p>We may update or change features as the platform evolves.</p>
            </section>

            <section>
                <h2>5. User Behaviour</h2>
                <p>You agree not to:</p>
                <ul>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Send spam or unsolicited promotions</li>
                    <li>Impersonate another person</li>
                    <li>Upload illegal, explicit, or harmful content</li>
                    <li>Attempt to access accounts that are not yours</li>
                    <li>Use LoveHuddle for commercial or promotional purposes</li>
                    <li>Interfere with the platform's operation</li>
                </ul>
                <p>We reserve the right to remove content or accounts that violate these rules.</p>
            </section>

            <section>
                <h2>6. Content You Upload</h2>
                <p>You retain ownership of the content you upload (photos, bio, messages). By using LoveHuddle, you grant us a non‑exclusive licence to:</p>
                <ul>
                    <li>Display your content on the platform</li>
                    <li>Moderate it for safety</li>
                    <li>Remove it if it violates our rules</li>
                </ul>
                <p>We do not claim ownership of your content.</p>
            </section>

            <section>
                <h2>7. Safety</h2>
                <p>To maintain a safe environment:</p>
                <ul>
                    <li>All users must complete identity verification through our third‑party provider</li>
                    <li>Verification includes a small fee paid directly to the provider</li>
                    <li>Unverified or partially verified accounts cannot access the platform</li>
                    <li>We may request additional verification if suspicious activity is detected</li>
                    <li>Accounts may be restricted or removed if verification fails or appears fraudulent</li>
                </ul>
                <p>We use a combination of automated tools and human moderation to keep the platform safe.</p>
            </section>

            <section>
                <h2>8. Paid Features</h2>
                <p>LoveHuddle may offer optional paid features such as:</p>
                <ul>
                    <li>Profile boosts</li>
                    <li>Priority placement</li>
                    <li>Verification badges</li>
                    <li>Advanced filters</li>
                </ul>
                <p>Payments are processed by a secure third‑party provider. We do not store card details.</p>
                <p>Paid features are non‑refundable unless required by law.</p>
            </section>

            <section>
                <h2>9. Service Availability</h2>
                <p>We aim to keep LoveHuddle running smoothly, but we cannot guarantee:</p>
                <ul>
                    <li>Uninterrupted access</li>
                    <li>No bugs or errors</li>
                    <li>Perfect performance on all devices</li>
                </ul>
                <p>We may update, pause, or discontinue parts of the platform at any time.</p>
            </section>

            <section>
                <h2>10. Termination</h2>
                <p>You may delete your account at any time.</p>
                <p>We may suspend or terminate accounts that:</p>
                <ul>
                    <li>Break these Terms</li>
                    <li>Fail verification</li>
                    <li>Pose safety risks</li>
                    <li>Misuse the platform</li>
                </ul>
                <p>Once deleted, your data will be removed within our retention period.</p>
            </section>

            <section>
                <h2>11. Privacy</h2>
                <p>Your use of LoveHuddle is also governed by our <Link to="/privacy" className="legal-link">Privacy Policy</Link>, which explains what data we collect, how we use it, and your rights.</p>
            </section>

            <section>
                <h2>12. Limitation of Liability</h2>
                <p>To the fullest extent permitted by UK law:</p>
                <ul>
                    <li>We are not responsible for user behaviour</li>
                    <li>We are not liable for losses caused by misuse of the platform</li>
                    <li>We do not guarantee matches, outcomes, or results</li>
                </ul>
                <p>LoveHuddle is provided on an "as is" and "as available" basis.</p>
            </section>

            <section>
                <h2>13. Changes to These Terms</h2>
                <p>We may update these Terms as the platform evolves. If changes are significant, we will notify users.</p>
                <p>Continued use of LoveHuddle means you accept the updated Terms.</p>
            </section>

            <section>
                <h2>14. Contact Us</h2>
                <p>For questions about these Terms:</p>
                <div className="contact-block">
                    <p><strong>Kevin Peddie</strong> – Founder &amp; Director</p>
                    <p>19 Penrhiwtyn Street, Neath, South Wales, SA11 2HG, UK</p>
                </div>
            </section>
        </div>
    );
}

export default TermsOfService;
