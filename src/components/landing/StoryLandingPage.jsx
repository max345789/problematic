import React, { useEffect, useState } from 'react';
import ActHero from './ActHero';
import ActPillars from './ActPillars';
import ActModeration from './ActModeration';
import ActResonance from './ActResonance';
import ActFooterCta from './ActFooterCta';
import { ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import './LandingPage.css';

export default function StoryLandingPage({ onEnterApp, onOpenLogin }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    document.body.classList.add('landing-scrollable');
    document.documentElement.classList.add('landing-scrollable');

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Check sections for active navigation state
      const sections = ['story-hero', 'story-pillars', 'story-moderation', 'story-resonance', 'story-cta'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('landing-scrollable');
      document.documentElement.classList.remove('landing-scrollable');
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="story-landing-page">
      {/* Top Scroll Progress Indicator */}
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Floating Story Navigation Header */}
      <header className="story-header">
        <div className="story-nav-inner">
          <div className="story-brand" onClick={() => scrollTo('story-hero')}>
            <span className="brand-glyph">〰</span>
            <div className="brand-text-wrap">
              <span className="brand-name">Problematic</span>
              <span className="brand-tag">Murmur Platform</span>
            </div>
          </div>

          <nav className="story-chapters" aria-label="Story Chapters">
            <button 
              type="button" 
              className={`chapter-link ${activeSection === 'story-hero' ? 'active' : ''}`}
              onClick={() => scrollTo('story-hero')}
            >
              <span>The Weight</span>
            </button>
            <button 
              type="button" 
              className={`chapter-link ${activeSection === 'story-pillars' ? 'active' : ''}`}
              onClick={() => scrollTo('story-pillars')}
            >
              <span>Three Harbors</span>
            </button>
            <button 
              type="button" 
              className={`chapter-link ${activeSection === 'story-moderation' ? 'active' : ''}`}
              onClick={() => scrollTo('story-moderation')}
            >
              <span>The Guardian Layer</span>
            </button>
            <button 
              type="button" 
              className={`chapter-link ${activeSection === 'story-resonance' ? 'active' : ''}`}
              onClick={() => scrollTo('story-resonance')}
            >
              <span>Resolutions</span>
            </button>
          </nav>

          <div className="story-header-actions">
            <button 
              type="button" 
              className="btn-header-login"
              onClick={onOpenLogin}
            >
              Log In
            </button>
            <button 
              type="button" 
              className="btn-header-launch"
              onClick={onEnterApp}
            >
              <span>Launch App</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Narrative Acts */}
      <main className="story-main">
        <ActHero 
          onEnterApp={onEnterApp} 
          onScrollToPillars={() => scrollTo('story-pillars')} 
        />

        <ActPillars 
          onEnterApp={onEnterApp} 
        />

        <ActModeration />

        <ActResonance />

        <ActFooterCta 
          onEnterApp={onEnterApp} 
          onOpenLogin={onOpenLogin} 
        />
      </main>
    </div>
  );
}
