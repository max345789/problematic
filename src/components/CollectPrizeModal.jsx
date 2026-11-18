import React, { useState, useEffect } from 'react';
import Icon from './Icons';

export default function CollectPrizeModal({ amount = 1.0, taskName, newTotal, onClaim, onClose, showToast }) {
  const [animStage, setAnimStage] = useState('funneling'); // 'funneling' -> 'landed'
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Stage 1: Funnel stream particles down into the token for 1.4s
    const t1 = setTimeout(() => {
      setAnimStage('landed');
    }, 1400);
    return () => clearTimeout(t1);
  }, []);

  const handleShare = async () => {
    const text = `I just earned +${amount.toFixed(1)} Respectadeo (RD points) on Problamatic for contributing solutions and broadcasting problems!`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Respectadeo Milestone Reward',
          text,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        showToast?.('Achievement copied to clipboard!');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showToast?.('Could not share.');
    }
  };

  const handleFinish = async () => {
    setClaimed(true);
    await onClaim?.();
  };

  return (
    <div className="prize-modal-backdrop">
      {/* Background radial glow */}
      <div className="prize-modal-glow" />

      {/* Stream of Recollecting Cards Funneling Downwards (Pinterest Motion Reference) */}
      {animStage === 'funneling' && (
        <div className="prize-stream-container">
          {/* Card Stream 1: Left */}
          <div className="prize-stream-card card-1" />
          <div className="prize-stream-card card-2" />
          <div className="prize-stream-card card-3" />
          <div className="prize-stream-card card-4" />
          <div className="prize-stream-card card-5" />
          <div className="prize-stream-card card-6" />

          {/* Vertical Light Streaks / Motion Trails */}
          <svg className="prize-streaks-svg" viewBox="0 0 320 400">
            <line x1="80" y1="0" x2="160" y2="220" stroke="url(#streak-gold)" strokeWidth="3" strokeDasharray="40 120" className="streak-fast" />
            <line x1="240" y1="20" x2="160" y2="220" stroke="url(#streak-cyan)" strokeWidth="2.5" strokeDasharray="50 100" className="streak-med" />
            <line x1="160" y1="0" x2="160" y2="220" stroke="url(#streak-rose)" strokeWidth="4" strokeDasharray="60 140" className="streak-slow" />
            <defs>
              <linearGradient id="streak-gold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(254, 208, 83, 0)" />
                <stop offset="70%" stopColor="rgba(254, 208, 83, 0.8)" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="streak-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(98, 213, 228, 0)" />
                <stop offset="70%" stopColor="rgba(98, 213, 228, 0.8)" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="streak-rose" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(248, 186, 201, 0)" />
                <stop offset="70%" stopColor="rgba(248, 186, 201, 0.8)" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Main Prize Card */}
      <div className={`prize-card-container ${animStage === 'landed' ? 'landed' : ''}`}>
        {/* Top Dismiss Button */}
        <button className="prize-close-btn" onClick={onClose} aria-label="Close">
          <Icon.Close />
        </button>

        {/* Central 3D Embossed Golden RD Coin Token */}
        <div className="prize-coin-wrapper">
          <div className="prize-coin-pulse" />
          <svg viewBox="0 0 140 140" width="110" height="110" className="prize-coin-svg">
            <defs>
              <radialGradient id="p-coin-face" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="30%" stopColor="#FDE68A" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>
              <linearGradient id="p-coin-edge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            {/* Coin Rim & Face */}
            <ellipse cx="70" cy="74" rx="56" ry="56" fill="url(#p-coin-edge)" />
            <ellipse cx="70" cy="70" rx="56" ry="56" fill="url(#p-coin-face)" />
            <circle cx="70" cy="70" r="50" fill="none" stroke="#D97706" strokeWidth="2.5" opacity="0.8" />
            <circle cx="70" cy="70" r="46" fill="none" stroke="#FEF3C7" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Star Crown */}
            <path d="M 70 38 l 2.5 5 l 5.5 0.8 l -4 3.9 l 0.9 5.3 l -4.9 -2.6 l -4.9 2.6 l 0.9 -5.3 l -4 -3.9 l 5.5 -0.8 z" fill="#FFFFFF" />

            {/* Embossed RD Text */}
            <text
              x="70"
              y="84"
              textAnchor="middle"
              fill="#78350F"
              fontSize="34"
              fontWeight="900"
              fontFamily="'Figtree', -apple-system, sans-serif"
              letterSpacing="-1px"
            >
              RD
            </text>

            <text
              x="70"
              y="100"
              textAnchor="middle"
              fill="#92400E"
              fontSize="7.5"
              fontWeight="800"
              letterSpacing="1.2px"
            >
              RESPECTADEO
            </text>
          </svg>
        </div>

        {/* Amount Awarded */}
        <div className="prize-amount-pill">
          +{amount.toFixed(1)} RD Points
        </div>

        {/* Celebration Title */}
        <div className="prize-title">
          Points Collected!
        </div>

        {/* Task Milestone Reason */}
        <div className="prize-task-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="prize-check-icon">✓</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F6FC' }}>
                {taskName || '10 Problems Broadcasted Milestone'}
              </div>
              <div style={{ fontSize: 11, color: '#8B949E', marginTop: 1 }}>
                Platform activity reward added to balance
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>
              +{amount.toFixed(1)} RD
            </span>
          </div>
        </div>

        {/* Total Score After Collection */}
        <div className="prize-total-stat">
          <span style={{ color: '#8B949E', fontSize: 12 }}>New Respectadeo Total:</span>
          <span style={{ color: '#F0F6FC', fontSize: 14, fontWeight: 700 }}>
            {newTotal != null ? Number(newTotal).toFixed(1) : (amount + 1.4).toFixed(1)} RD
          </span>
        </div>

        {/* Actions Row */}
        <div className="prize-actions-row">
          <button className="prize-btn-share" onClick={handleShare}>
            <Icon.Share /> Share
          </button>
          <button className="prize-btn-primary" onClick={handleFinish} disabled={claimed}>
            {claimed ? 'Added to Balance ✓' : 'Claim to Balance'}
          </button>
        </div>
      </div>
    </div>
  );
}
