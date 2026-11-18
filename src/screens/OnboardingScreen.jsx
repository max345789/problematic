import React, { useState, useRef } from 'react';
import {
  ProblemSolvingIllustration,
  CommunityQualityIllustration,
  RespectadeoIllustration,
  ProblamaticBadge,
} from '../components/OnboardingIllustrations';

const SLIDES = [
  {
    id: 'problems',
    bg: 'radial-gradient(135deg, rgba(254, 208, 83, 0.5) 0%, rgba(245, 158, 11, 0.25) 50%, rgba(13, 27, 20, 0.4) 100%)',
    textColor: '#19150E',
    subColor: '#4A3F2C',
    accent: '#D97706',
    title: ['Share Problems,', 'Find Solutions'],
    subtitle: 'A borderless worldwide network where every challenge gets solved without follow gates.',
    illustration: <ProblemSolvingIllustration />,
  },
  {
    id: 'quality',
    bg: 'radial-gradient(135deg, rgba(98, 213, 228, 0.5) 0%, rgba(2, 132, 199, 0.25) 50%, rgba(13, 27, 20, 0.4) 100%)',
    textColor: '#0B2930',
    subColor: '#1E5059',
    accent: '#0284C7',
    title: ['Quality &', 'Spam-Free'],
    subtitle: 'Active community moderation keeps discussions authentic, focused, and free of noise.',
    illustration: <CommunityQualityIllustration />,
  },
  {
    id: 'respectadeo',
    bg: 'radial-gradient(135deg, rgba(248, 186, 201, 0.55) 0%, rgba(219, 39, 119, 0.28) 50%, rgba(13, 27, 20, 0.4) 100%)',
    textColor: '#2D121B',
    subColor: '#582736',
    accent: '#DB2777',
    title: ['Earn Respectadeo', '(RD Points)'],
    subtitle: 'Solve problems to earn 0.1 RD per approved answer. Irrelevant responses are disqualified by community moderation.',
    illustration: <RespectadeoIllustration />,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const touchStartX = useRef(null);

  const total = SLIDES.length;
  const current = SLIDES[step];

  const handleNext = () => {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = (step + 1) / total;
  const strokeDashoffset = circumference - circumference * progressRatio;

  return (
    <div
      className="onboarding-container"
      style={{
        background: current.bg,
        transition: 'background 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Brand Icon & Skip */}
      <div className="onboarding-top-bar">
        <div className="onboarding-brand-badge" aria-label="Brand logo">
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>P</span>
        </div>

        <button
          className="onboarding-skip-btn"
          style={{ color: current.textColor }}
          onClick={() => onComplete?.()}
        >
          Skip
        </button>
      </div>

      {/* Main Slides Carousel */}
      <div className="onboarding-slider">
        <div
          className="onboarding-track"
          style={{
            transform: `translateX(-${step * 100}%)`,
            transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {SLIDES.map((slide) => (
            <div className="onboarding-slide" key={slide.id}>
              <div className="onboarding-glass-card">
                <div className="onboarding-art-wrapper">
                  {slide.illustration}
                </div>

                <div className="onboarding-text-area">
                  <h1
                    className="onboarding-title"
                    style={{ color: slide.textColor }}
                  >
                    {slide.title.map((line, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        {line}
                      </span>
                    ))}
                  </h1>

                  <p
                    className="onboarding-subtitle"
                    style={{ color: slide.subColor }}
                  >
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Problamatic Badge + Next Button with Progress Ring */}
      <div className="onboarding-bottom-bar">
        <div className="onboarding-badge-slot" style={{ color: current.textColor }}>
          <ProblamaticBadge />
        </div>

        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
              style={{
                backgroundColor:
                  i === step ? current.textColor : 'rgba(0, 0, 0, 0.2)',
              }}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="onboarding-next-wrapper">
          <svg className="onboarding-ring-svg" viewBox="0 0 76 76">
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="2.5"
            />
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke={current.textColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
                transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease',
              }}
            />
          </svg>

          <button
            className="onboarding-next-btn"
            onClick={handleNext}
            aria-label={step === total - 1 ? 'Get Started' : 'Next Screen'}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#14181F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
