'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const res = await fetch(`https://cine-os-api.vercel.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        // Store token
        localStorage.setItem('cineos_token', data.token);
        localStorage.setItem('cineos_user', JSON.stringify(data.user));
        setMessage(mode === 'login' ? `Welcome back, ${data.user.name || data.user.email}!` : 'Account created! Welcome to CineOS!');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-cinema-void relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute w-[600px] h-[600px] bg-cinema-gold/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-cinema-gold/10 border border-cinema-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-cinema-gold" />
          </div>
          <h1 className="text-3xl font-black text-white">CINEOS<span className="text-cinema-gold">.</span></h1>
          <p className="text-cinema-muted text-sm mt-1">Your AI-powered cinema companion</p>
        </div>

        {/* Card */}
        <div className="bg-cinema-obsidian border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Mode tabs */}
          <div className="flex bg-cinema-void rounded-xl p-1 mb-8">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  mode === m ? 'bg-cinema-gold text-cinema-void' : 'text-cinema-muted hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - register only */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-xs font-semibold text-cinema-muted uppercase tracking-wider block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full bg-cinema-void border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-cinema-muted/60 outline-none focus:border-cinema-gold/50 transition-colors text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-cinema-muted uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-cinema-void border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-cinema-muted/60 outline-none focus:border-cinema-gold/50 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-cinema-muted uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="w-full bg-cinema-void border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-cinema-muted/60 outline-none focus:border-cinema-gold/50 transition-colors text-sm"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cinema-muted hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-cinema-gold text-cinema-void font-black py-3.5 rounded-xl hover:bg-cinema-gold/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In to CineOS' : 'Create My Account'}
            </motion.button>
          </form>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-4">
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-cinema-jade text-sm text-center bg-cinema-jade/10 border border-cinema-jade/20 rounded-lg py-2 px-4">
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
