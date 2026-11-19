import React, { useState, useRef } from 'react';
import Icon from '../components/Icons';

const SLIDES = [
  {
    id: 'problems',
    stepNumber: '01',
    title: ['SHARE PROBLEMS,', 'FIND SOLUTIONS'],
    subtitle: 'A borderless worldwide network where every challenge gets solved without follow gates.',
  },
  {
    id: 'quality',
    stepNumber: '02',
    title: ['QUALITY &', 'SPAM-FREE'],
    subtitle: 'Active community moderation keeps discussions authentic, focused, and free of noise.',
  },
  {
    id: 'solutions',
    stepNumber: '03',
    title: ['HELP OTHERS,', 'SHARE KNOWLEDGE'],
    subtitle: 'Collaborate to solve real-world challenges. When problem authors accept your answer, it is marked as the verified solution.',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const touchStartX = useRef(null);

  const total = SLIDES.length;
  const current = SLIDES[step];

  const handleNext = () => {
    if (step >= total - 1) {
      onComplete?.();
    } else {
      setStep((prev) => Math.min(total - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1));
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
      style={{ background: '#000000', color: '#FFFFFF' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Brand Icon & Skip */}
      <div className="onboarding-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.BrandMark size={26} style={{ color: '#FFFFFF' }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: '#FFFFFF' }}>
            Problematic
          </span>
        </div>

        <button
          className="onboarding-skip-btn"
          style={{ color: '#A1A1AA' }}
          onClick={() => onComplete?.()}
          aria-label="Skip onboarding"
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
            transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {SLIDES.map((slide) => (
            <div className="onboarding-slide" key={slide.id}>
              <div className="onboarding-black-card">
                <div className="onboarding-step-pill">
                  STEP {slide.stepNumber} / 03
                </div>

                <div className="onboarding-text-area">
                  <h1 className="onboarding-title">
                    {slide.title.map((line, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        {line}
                      </span>
                    ))}
                  </h1>

                  <p className="onboarding-subtitle">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Monochrome Dots + Next Button with Progress Ring */}
      <div className="onboarding-bottom-bar">
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
              style={{
                backgroundColor: i === step ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)',
              }}
              onClick={() => setStep(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="onboarding-next-wrapper">
          <svg className="onboarding-ring-svg" viewBox="0 0 76 76" aria-hidden="true">
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2.5"
            />
            <circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
                transition: 'stroke-dashoffset 0.38s ease',
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
              stroke="#FFFFFF"
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
