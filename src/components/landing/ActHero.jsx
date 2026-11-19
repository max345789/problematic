import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { HERO_WHISPERS } from './landingData';

export default function ActHero({ onEnterApp, onScrollToPillars }) {
  const [activeWhisper, setActiveWhisper] = useState(0);

  return (
    <section id="story-hero" className="story-act hero-act">
      {/* Ambient background glow orbs */}
      <div className="hero-glow hero-glow-violet" />
      <div className="hero-glow hero-glow-cyan" />
      <div className="hero-glow hero-glow-emerald" />

      <div className="hero-content">
        <div className="hero-badge animate-fade-in">
          <ShieldCheck size={16} className="text-emerald" />
          <span>A Safe-Harbor Social Platform • 100% Moderated & Verified</span>
        </div>

        <h1 className="hero-title animate-fade-in-up">
          The heaviest problems are the ones <br />
          <span className="hero-title-highlight">we never speak out loud.</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up-delay">
          Social feeds demand highlight reels. Problematic is where you untangle real struggles—
          <strong>mental exhaustion</strong>, <strong>engineering roadblocks</strong>, and <strong>physical pain</strong>.
          Protected by certified human moderators and domain-verified guidance.
        </p>

        <div className="hero-actions animate-fade-in-up-delay-2">
          <button 
            type="button" 
            className="btn-story-primary"
            onClick={onEnterApp}
          >
            <span>Enter the Safe Harbor</span>
            <ArrowRight size={18} />
          </button>

          <button 
            type="button" 
            className="btn-story-secondary"
            onClick={onScrollToPillars}
          >
            <span>See How It Works</span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Floating Whispers Carousel / Cloud */}
        <div className="whispers-container animate-fade-in-delay-3">
          <div className="whispers-header">
            <span className="whispers-label">
              <Sparkles size={14} className="text-violet" />
              <span>Real whispers shared today in safe anonymity:</span>
            </span>
            <div className="whispers-dots">
              {HERO_WHISPERS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`whisper-dot ${idx === activeWhisper ? 'active' : ''}`}
                  onClick={() => setActiveWhisper(idx)}
                  aria-label={`Show whisper ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="whisper-card-wrapper">
            {HERO_WHISPERS.map((whisper, idx) => {
              const isCurrent = idx === activeWhisper;
              return (
                <div 
                  key={whisper.id}
                  className={`whisper-card ${isCurrent ? 'active' : 'inactive'} category-${whisper.category}`}
                  onClick={() => setActiveWhisper((idx + 1) % HERO_WHISPERS.length)}
                >
                  <div className="whisper-card-top">
                    <span className="whisper-category-pill">{whisper.categoryLabel}</span>
                    <span className="whisper-tag">{whisper.tag}</span>
                  </div>
                  <p className="whisper-text">“{whisper.text}”</p>
                  <div className="whisper-card-bottom">
                    <span className="whisper-author">From: {whisper.authorRole}</span>
                    <span className="whisper-hint">Click next whisper →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={onScrollToPillars}>
          <span>Scroll down for the story</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
        </div>
      </div>
    </section>
  );
}
