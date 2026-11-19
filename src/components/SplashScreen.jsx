import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Text animation runs from 0.3s to 1.3s; allow user to view final state before smooth fade
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1800);

    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 2150);

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
        {/* Brand Title */}
        <div className="text-container">
          <h1 className="brand-title">Problematic</h1>
        </div>
      </div>
    </div>
  );
}
