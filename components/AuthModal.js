'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
    const [mode, setMode] = useState(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    const router = useRouter();
    const supabase = createClient();
    const modalRef = useRef(null);

    useEffect(() => {
        setMode(initialMode);
        // Reset form when modal opens/closes
        setError('');
        setSuccess('');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setShowPassword(false);
    }, [initialMode, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    // Handle mouse events to prevent closing on drag
    const handleMouseDown = () => {
        setIsDragging(false);
    };

    const handleMouseMove = () => {
        setIsDragging(true);
    };

    const handleOverlayClick = (e) => {
        // Only close if it was a click (not a drag) and clicked on the overlay itself
        if (!isDragging && e.target === e.currentTarget) {
            onClose();
        }
        setIsDragging(false);
    };

    if (!isOpen) return null;

    const togglePassword = () => setShowPassword(!showPassword);

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
        setShowPassword(false);
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (error) {
                // Provide more helpful error messages
                if (error.message === 'Invalid login credentials') {
                    setError('Invalid email or password. Please check your credentials and try again.');
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Please verify your email address before signing in. Check your inbox for the confirmation link.');
                } else {
                    setError(error.message);
                }
            } else {
                setSuccess('Signed in successfully! Redirecting...');
                setTimeout(() => {
                    onClose();
                    router.push('/dashboard');
                    router.refresh();
                }, 1000);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            
            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else if (data?.user?.identities?.length === 0) {
                setError('An account with this email already exists. Please sign in instead.');
            } else {
                setSuccess('Account created! Please check your email to verify your account, then you can sign in.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess('Password reset email sent! Check your inbox for the reset link.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email.trim().toLowerCase(),
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess('Confirmation email resent! Please check your inbox.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
            }
            // If successful, the user will be redirected
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
            }
            // If successful, the user will be redirected
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleLinkedInSignIn = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'linkedin_oidc',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
            }
            // If successful, the user will be redirected
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div 
            className={`modal-overlay ${isOpen ? 'active' : ''}`} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleOverlayClick}
        >
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Decorative Glows */}
                <div className="modal-glow modal-glow-1"></div>
                <div className="modal-glow modal-glow-2"></div>

                {/* Close Button */}
                <button className="modal-close" onClick={onClose}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}</h2>
                        <p className="text-gray-400">{mode === 'signin' ? 'Sign in to continue building your career' : 'Start your journey to landing your dream job'}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="auth-error">
                            {error}
                            {error.includes('verify your email') && (
                                <button
                                    type="button"
                                    onClick={handleResendConfirmation}
                                    className="block mt-2 text-indigo-400 hover:text-indigo-300 underline text-sm"
                                >
                                    Resend confirmation email
                                </button>
                            )}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="auth-success">
                            {success}
                            {success.includes('check your email') && mode === 'signup' && (
                                <button
                                    type="button"
                                    onClick={handleResendConfirmation}
                                    className="block mt-2 text-green-400 hover:text-green-300 underline text-sm"
                                >
                                    Resend confirmation email
                                </button>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form className={`space-y-4 ${isLoading ? 'auth-loading' : ''}`} onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
                        {mode === 'signup' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        className="auth-input" 
                                        placeholder="John" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        className="auth-input" 
                                        placeholder="Doe" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                className="auth-input" 
                                placeholder="you@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="auth-input pr-12" 
                                    placeholder={mode === 'signin' ? 'Enter your password' : 'Create a strong password'} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    minLength={mode === 'signup' ? 6 : undefined}
                                />
                                <span className="password-toggle" onClick={togglePassword}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </span>
                            </div>
                            {mode === 'signup' && <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters</p>}
                        </div>

                        {mode === 'signin' ? (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent accent-indigo-500" />
                                    <span className="text-gray-400">Remember me</span>
                                </label>
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-indigo-400 hover:text-indigo-300 transition"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 mt-1 rounded border-gray-600 bg-transparent accent-indigo-500" required />
                                <span className="text-sm text-gray-400">I agree to the <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a></span>
                            </label>
                        )}

                        <button type="submit" className="btn-primary w-full py-4 rounded-xl font-semibold text-lg mt-6 flex items-center justify-center gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                                </>
                            ) : (
                                mode === 'signin' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider my-6">{mode === 'signin' ? 'or continue with' : 'or sign up with'}</div>

                    {/* Social Login */}
                    <div className="grid grid-cols-3 gap-3">
                        <button className="social-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="social-btn" onClick={handleGitHubSignIn} disabled={isLoading}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                        <button className="social-btn opacity-50 cursor-not-allowed relative" disabled={true} title="Coming soon">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2" />
                            </svg>
                            <span className="flex items-center gap-1">
                                LinkedIn
                                <span className="text-[10px] bg-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-300">Soon</span>
                            </span>
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                        <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchMode(mode === 'signin' ? 'signup' : 'signin'); }} className="text-indigo-400 hover:text-indigo-300 transition font-medium">
                            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
