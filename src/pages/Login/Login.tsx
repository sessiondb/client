import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, LogIn, Github } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import styles from './Login.module.css';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch Auth Config
    const { data: authConfig } = useQuery({
        queryKey: ['authConfig'],
        queryFn: async () => {
            try {
                const res = await apiClient.get('/config/auth');
                return res.data;
            } catch (e) {
                // Fallback to password auth if config endpoint fails
                return { type: 'password' };
            }
        },
        initialData: { type: 'password' }
    });

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(username, password);
        if (success) {
            navigate('/query');
        } else {
            setError('Invalid credentials or account inactive.');
        }
    };

    const handleSSOLogin = async () => {
        // For SSO, we might redirect to backend endpoint
        // window.location.href = `${API_URL}/auth/sso/github`;
        // For now, let's just try to login with a mock sso user if the backend supports it or just show alert
        alert("SSO Login would redirect to Identity Provider");
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.visualPane}>
                <div className={styles.overlay}>
                    <div className={styles.branding}>
                        <div className={styles.logoCircle}>
                            <Lock size={32} />
                        </div>
                        <div>
                            <h1 className={styles.brandName}>SessionDB</h1>
                            <p className={styles.brandTagline}>Enterprise Session Management & Access Control</p>
                        </div>
                    </div>
                </div>
                <img
                    src="/Users/mouli.b/.gemini/antigravity/brain/cc62b053-9220-442b-a622-c80531668b3e/sessiondb_login_visual_1770381524019.png"
                    alt="SessionDB Visual"
                    className={styles.bgImage}
                />
            </div>

            <div className={styles.formPane}>
                <div className={styles.formWrapper}>
                    <div className={styles.title}>Welcome Back</div>
                    <div className={styles.subtitle}>Log in to manage your database sessions.</div>

                    {error && (
                        <div className={styles.errorMsg}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {authConfig.type === 'password' ? (
                        <form className={styles.form} onSubmit={handlePasswordLogin}>
                            <div className={styles.inputGroup}>
                                <label>Username</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={18} className={styles.icon} />
                                    <input
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Password</label>
                                <div className={styles.inputWrapper}>
                                    <Lock size={18} className={styles.icon} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                <LogIn size={18} />
                                Sign In to Console
                            </button>
                        </form>
                    ) : (
                        <div className={styles.form}>
                            <button className={styles.ssoBtn} onClick={handleSSOLogin}>
                                <Github size={20} />
                                Sign in with Enterprise SSO
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                SSO is enforced for your organization's security.
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        New here? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Get Access</span>
                    </div>

                    <div className={styles.footerLinks}>
                        <span>Privacy Policy</span>
                        <span>•</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
