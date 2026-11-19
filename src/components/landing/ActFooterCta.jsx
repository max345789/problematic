import React from 'react';
import { ArrowRight, ShieldCheck, Lock, HeartHandshake, Sparkles, Feather } from 'lucide-react';

export default function ActFooterCta({ onEnterApp, onOpenLogin }) {
  return (
    <section id="story-cta" className="story-act cta-act">
      <div className="section-container">
        <div className="cta-card">
          <div className="cta-glow-circle" />

          <div className="cta-header">
            <div className="cta-badge">
              <Sparkles size={14} className="text-emerald" />
              <span>Act V • The Harbor Awaits</span>
            </div>

            <h2 className="cta-title">
              You don’t have to carry it <br />
              <span className="text-gradient">by yourself anymore.</span>
            </h2>

            <p className="cta-desc">
              Step into a space where vulnerability is met with human empathy, 
              engineering problems are untangled with precision, and every voice is protected.
            </p>
          </div>

          <div className="cta-actions">
            <button
              type="button"
              className="btn-story-primary btn-cta-large"
              onClick={onEnterApp}
            >
              <span>Launch Problematic App</span>
              <ArrowRight size={20} />
            </button>

            <button
              type="button"
              className="btn-story-secondary btn-cta-large"
              onClick={onOpenLogin}
            >
              <Feather size={18} />
              <span>Create Account or Log In</span>
            </button>
          </div>

          <div className="cta-trust-row">
            <div className="trust-pill">
              <ShieldCheck size={16} className="text-emerald" />
              <span>Certified Human Moderation</span>
            </div>
            <div className="trust-pill">
              <Lock size={16} className="text-violet" />
              <span>Anonymous Whisper Posting</span>
            </div>
            <div className="trust-pill">
              <HeartHandshake size={16} className="text-cyan" />
              <span>Zero Toxic Algorithms</span>
            </div>
          </div>
        </div>

        <footer className="story-footer">
          <div className="footer-left">
            <div className="footer-logo">
              <span className="logo-symbol">〰</span>
              <span className="logo-name">Problematic</span>
              <span className="logo-sub">Murmur Safe-Harbor</span>
            </div>
            <p className="footer-tagline">
              A calm, verified social sanctuary for mental, technology, and physical challenges.
            </p>
          </div>

          <div className="footer-right">
            <div className="footer-links">
              <span className="footer-link" onClick={onEnterApp}>Feed</span>
              <span className="footer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top of Story</span>
              <span className="footer-link" onClick={onOpenLogin}>Sign In</span>
            </div>
            <div className="footer-copy">
              © 2026 Problematic (Murmur). Built with empathy, verified by human stewards.
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
