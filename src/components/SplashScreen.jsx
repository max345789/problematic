import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Splash animation from original template:
    // 0.5s - 1.7s: Text enters (textIn)
    // 2.5s - 3.3s: Text morphs out (textOut)
    // 2.7s - 3.7s: Geometric logo pops & rotates in (logoIn)
    // 4.0s - 5.2s: Logo zooms 300x into solid black (logoZoom)
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 5150);

    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 5350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      onFinish?.();
    }, 180);
  };

  return (
    <div
      id="splash-screen"
      className={fadingOut ? 'splash-fade-out' : ''}
      onClick={handleSkip}
      role="region"
      aria-label="Problematic Splash Screen"
    >
      <div className="center-wrapper">
        {/* Phase 1: Brand Title */}
        <div className="text-container">
          <h1 className="brand-title">Problematic</h1>
        </div>

        {/* Phase 2: Morph to Logo & Zoom */}
        <div className="logo-wrapper">
          <div className="logo-zoom-container">
            <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Mathematically perfect 45-degree geometric chevron */}
                <path id="chevron" fill="var(--logo-color, #050505)" d="M 110 90 L 80 60 L 95 45 L 110 60 L 145 25 L 160 40 Z" />
              </defs>
              <use href="#chevron" />
              <use href="#chevron" transform="rotate(90 100 100)" />
              <use href="#chevron" transform="rotate(180 100 100)" />
              <use href="#chevron" transform="rotate(270 100 100)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
