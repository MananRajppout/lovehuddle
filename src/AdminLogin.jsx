import React, { useState } from 'react';
import './AdminLogin.css';

/* ─── Simple hash function for client-side credential check ─── */
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Default credential hashes (lovehuddleuk@gmail.com / Missionhuddle7685) */
const DEFAULT_EMAIL_HASH = '64ed0ba515499df72d7189b86918eb14c3bb8ade485b22b1a765244e0bf7394c';
const DEFAULT_PASS_HASH = '2a0d7f9051e18f1e1c051a0e8858de9ba4f813fbadebcd50e468fd6cbb78edbd';

function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const emailHash = await hashString(email.toLowerCase().trim());
            const passHash = await hashString(password);

            /* Check against stored custom credentials or defaults */
            const storedEmailHash = localStorage.getItem('lh_admin_email_hash') || DEFAULT_EMAIL_HASH;
            const storedPassHash = localStorage.getItem('lh_admin_pass_hash') || DEFAULT_PASS_HASH;

            if (emailHash === storedEmailHash && passHash === storedPassHash) {
                const session = {
                    authenticated: true,
                    timestamp: Date.now(),
                    expiry: Date.now() + (24 * 60 * 60 * 1000) /* 24 hours */
                };
                localStorage.setItem('lh_admin_session', JSON.stringify(session));
                onLogin(true);
            } else {
                setError('Invalid email or password.');
            }
        } catch {
            setError('Authentication failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-icon">🔐</div>
                    <h2>Admin Access</h2>
                    <p>Sign in to manage LoveHuddle</p>
                </div>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    {error && <div className="admin-login-error">{error}</div>}

                    <div className="admin-login-field">
                        <label htmlFor="admin-email">Email</label>
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter admin email"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="admin-login-field">
                        <label htmlFor="admin-password">Password</label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>© 2026 LoveHuddle Ltd</p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
