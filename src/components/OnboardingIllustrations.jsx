import React from 'react';

/* -------------------------------------------------------------------------- */
/*  Onboarding 3D-Style Vector Artwork for Problamatic                         */
/*  Slide 1: Global Problem Solving & Idea Beacon                             */
/*  Slide 2: Trusted Quality & Community Moderation (Human / Peer Focus)      */
/*  Slide 3: Golden Respectadeo (RD Points) Token & +0.1 Reward               */
/* -------------------------------------------------------------------------- */

// Screen 1: Warm Gold (#FED053) — Problem Solving, Idea Beacon, Interlocking Puzzle
export function ProblemSolvingIllustration() {
  return (
    <svg viewBox="0 0 340 260" width="100%" height="220" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="bulb-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#B8860B" floodOpacity="0.35" />
        </filter>
        <filter id="puzzle-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.22" />
        </filter>

        <radialGradient id="bulb-glass" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FFF9B0" />
          <stop offset="70%" stopColor="#FFDE43" />
          <stop offset="100%" stopColor="#E5A600" />
        </radialGradient>
        <linearGradient id="metal-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E5E7EB" />
          <stop offset="40%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>

        <linearGradient id="puz-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="puz-coral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
        </linearGradient>
      </defs>

      {/* Global Connection Orbital Rings */}
      <g opacity="0.75">
        <ellipse cx="170" cy="140" rx="145" ry="46" fill="none" stroke="url(#orbit-grad)" strokeWidth="2.5" strokeDasharray="8 6" transform="rotate(-14 170 140)" />
        <ellipse cx="170" cy="140" rx="130" ry="38" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" transform="rotate(18 170 140)" />
      </g>

      {/* Ground Cast Shadow */}
      <ellipse cx="170" cy="225" rx="110" ry="18" fill="#D49A00" opacity="0.32" />

      {/* Interlocking Puzzle Piece 1: Left Cyan */}
      <g filter="url(#puzzle-shadow)">
        <path
          d="M 68 155 
             h 28 a 10 10 0 0 1 10 10 a 10 10 0 0 1 -10 10 h -28 
             v 26 a 10 10 0 0 0 10 10 a 10 10 0 0 0 10 -10 v -26
             h -20 a 12 12 0 0 1 -12 -12 v -34 a 12 12 0 0 1 12 -12 h 28 z"
          fill="url(#puz-cyan)"
        />
        <circle cx="88" cy="165" r="7" fill="rgba(255,255,255,0.4)" />
      </g>

      {/* Interlocking Puzzle Piece 2: Right Coral */}
      <g filter="url(#puzzle-shadow)">
        <path
          d="M 235 150 
             h 32 a 12 12 0 0 1 12 12 v 28 a 10 10 0 0 1 -10 10 a 10 10 0 0 1 -10 -10 v -16
             h -24 a 10 10 0 0 0 -10 10 a 10 10 0 0 0 10 10 h 24
             v 22 a 12 12 0 0 1 -12 12 h -32 a 12 12 0 0 1 -12 -12 v -54 a 12 12 0 0 1 12 -12 z"
          fill="url(#puz-coral)"
        />
      </g>

      {/* Floating Worldwide Nodes */}
      <g>
        <circle cx="50" cy="115" r="14" fill="#FFFFFF" filter="url(#puzzle-shadow)" />
        <path d="M 44 115 h 12 M 50 109 v 12" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />

        <circle cx="285" cy="110" r="15" fill="#FFFFFF" filter="url(#puzzle-shadow)" />
        <path d="M 279 110 l 4 4 l 8 -8" stroke="#BE123C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Center 3D Glowing Idea Lightbulb */}
      <g filter="url(#bulb-shadow)">
        <path
          d="M 132 108 
             C 118 84, 130 50, 156 36 
             C 184 22, 218 36, 224 68 
             C 228 88, 216 104, 206 118 
             C 200 126, 198 134, 198 142 
             H 140 
             C 140 134, 138 124, 132 108 Z"
          fill="url(#bulb-glass)"
        />

        <path
          d="M 152 138 v -28 c 0 -14, 10 -22, 17 -22 c 7 0, 17 8, 17 22 v 28"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        <circle cx="169" cy="88" r="9" fill="#FFFFFF" opacity="0.95" />
        <circle cx="169" cy="88" r="18" fill="#FFFBEB" opacity="0.45" />

        <path
          d="M 144 58 C 150 46, 168 38, 184 38"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
        />

        <rect x="144" y="142" width="50" height="8" rx="4" fill="url(#metal-base)" />
        <rect x="146" y="152" width="46" height="8" rx="4" fill="url(#metal-base)" />
        <rect x="148" y="162" width="42" height="8" rx="4" fill="url(#metal-base)" />
        <path d="M 154 170 h 30 a 6 6 0 0 1 -6 6 h -18 a 6 6 0 0 1 -6 -6 Z" fill="#374151" />
      </g>

      <g fill="#FFFFFF" opacity="0.9">
        <path d="M 169 12 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" />
        <path d="M 112 36 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 z" />
        <path d="M 232 40 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 z" />
      </g>
    </svg>
  );
}

// Screen 2: Aqua Cyan (#62D5E4) — Community Quality, Authenticity & Focused Discussions
export function CommunityQualityIllustration() {
  return (
    <svg viewBox="0 0 340 260" width="100%" height="220" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="trust-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#065F46" floodOpacity="0.32" />
        </filter>
        <filter id="sub-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#042F2E" floodOpacity="0.25" />
        </filter>

        <linearGradient id="shield-trust" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#A7F3D0" />
          <stop offset="70%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="avatar-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="avatar-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="avatar-teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#99F6E4" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="170" cy="226" rx="125" ry="18" fill="#115E59" opacity="0.28" />

      {/* Background Conversation Glow Rings */}
      <ellipse cx="170" cy="130" rx="135" ry="58" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="6 4" />
      <ellipse cx="170" cy="130" rx="105" ry="44" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

      {/* Peer Collaborator 1 (Left Avatar) */}
      <g filter="url(#sub-shadow)" transform="translate(56, 75)">
        <circle cx="28" cy="28" r="28" fill="url(#avatar-blue)" />
        <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        <path d="M 28 20 a 7 7 0 1 0 0.1 0 Z" fill="#FFFFFF" />
        <path d="M 16 42 c 0 -7 6 -11 12 -11 s 12 4 12 11 Z" fill="#FFFFFF" />
      </g>

      {/* Peer Collaborator 2 (Right Avatar) */}
      <g filter="url(#sub-shadow)" transform="translate(228, 75)">
        <circle cx="28" cy="28" r="28" fill="url(#avatar-amber)" />
        <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        <path d="M 28 20 a 7 7 0 1 0 0.1 0 Z" fill="#FFFFFF" />
        <path d="M 16 42 c 0 -7 6 -11 12 -11 s 12 4 12 11 Z" fill="#FFFFFF" />
      </g>

      {/* Connecting Conversation Stream */}
      <path d="M 116 102 Q 170 70 224 102" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.85" />

      {/* Center Quality Trust Badge */}
      <g filter="url(#trust-shadow)" transform="translate(120, 36)">
        {/* Shield Body */}
        <path
          d="M 50 0 
             C 90 0, 100 14, 100 52 
             C 100 96, 62 125, 50 138 
             C 38 125, 0 96, 0 52 
             C 0 14, 10 0, 50 0 Z"
          fill="url(#shield-trust)"
        />

        {/* Shield Inset Line */}
        <path
          d="M 50 8 
             C 82 8, 90 20, 90 52 
             C 90 90, 58 115, 50 126 
             C 42 115, 10 90, 10 52 
             C 10 20, 18 8, 50 8 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* Center Golden Certified Medal */}
        <circle cx="50" cy="58" r="24" fill="#FFFFFF" filter="url(#sub-shadow)" />
        <circle cx="50" cy="58" r="20" fill="#F59E0B" />
        <circle cx="50" cy="58" r="18" fill="#FBBF24" />

        {/* Big Crisp Checkmark */}
        <path
          d="M 40 58 l 7 7 l 16 -16"
          stroke="#78350F"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Floating Star */}
        <path d="M 50 96 l 3 6 l 7 1 l -5 5 l 1 7 l -6 -3 l -6 3 l 1 -7 l -5 -5 l 7 -1 z" fill="#FFFFFF" />
      </g>

      {/* Floating Positive Quality Labels */}
      <g transform="translate(30, 175)" opacity="0.9">
        <rect x="0" y="0" width="88" height="26" rx="13" fill="#FFFFFF" />
        <text x="44" y="17" textAnchor="middle" fill="#047857" fontSize="11" fontWeight="800">100% RELEVANT</text>
      </g>
      <g transform="translate(225, 175)" opacity="0.9">
        <rect x="0" y="0" width="88" height="26" rx="13" fill="#FFFFFF" />
        <text x="44" y="17" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="800">SPAM-FREE</text>
      </g>
    </svg>
  );
}

// Screen 3: Soft Rose (#F8BAC9) — Respectadeo (RD Points) Economy & +0.1 Reward
export function RespectadeoIllustration() {
  return (
    <svg viewBox="0 0 340 260" width="100%" height="220" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="coin-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#831843" floodOpacity="0.32" />
        </filter>
        <filter id="chip-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.2" />
        </filter>

        <radialGradient id="coin-face" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FDE68A" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id="coin-edge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="reward-chip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <ellipse cx="170" cy="226" rx="115" ry="17" fill="#9D174D" opacity="0.25" />

      {/* Center 3D Golden Respectadeo (RD) Coin */}
      <g filter="url(#coin-shadow)">
        <ellipse cx="170" cy="126" rx="72" ry="72" fill="url(#coin-edge)" />
        <ellipse cx="170" cy="120" rx="72" ry="72" fill="url(#coin-face)" />

        <circle cx="170" cy="120" r="64" fill="none" stroke="#D97706" strokeWidth="3" opacity="0.8" />
        <circle cx="170" cy="120" r="60" fill="none" stroke="#FEF3C7" strokeWidth="2" strokeDasharray="3 3" />

        <g fill="#B45309" opacity="0.85">
          <path d="M 124 100 C 122 108, 126 116, 132 120 C 126 120, 122 112, 124 100 Z" />
          <path d="M 126 124 C 124 132, 128 140, 136 142 C 128 142, 124 134, 126 124 Z" />
          <path d="M 136 144 C 138 152, 146 158, 154 158 C 146 160, 138 152, 136 144 Z" />

          <path d="M 216 100 C 218 108, 214 116, 208 120 C 214 120, 218 112, 216 100 Z" />
          <path d="M 214 124 C 216 132, 212 140, 204 142 C 212 142, 216 134, 214 124 Z" />
          <path d="M 204 144 C 202 152, 194 158, 186 158 C 194 160, 202 152, 204 144 Z" />
        </g>

        <path d="M 170 82 l 3 6 l 7 1 l -5 5 l 1 7 l -6 -3 l -6 3 l 1 -7 l -5 -5 l 7 -1 z" fill="#FFFFFF" />

        <text
          x="170"
          y="136"
          textAnchor="middle"
          fill="#78350F"
          fontSize="44"
          fontWeight="900"
          fontFamily="'Figtree', -apple-system, sans-serif"
          letterSpacing="-1.5px"
        >
          RD
        </text>

        <text
          x="170"
          y="156"
          textAnchor="middle"
          fill="#92400E"
          fontSize="9"
          fontWeight="800"
          letterSpacing="1.8px"
        >
          RESPECTADEO
        </text>
      </g>

      {/* Floating "+0.1 RD" Award Badge Chip */}
      <g filter="url(#chip-shadow)" transform="translate(200, 36)">
        <rect x="0" y="0" width="108" height="42" rx="21" fill="url(#reward-chip)" />
        <rect x="2" y="2" width="104" height="38" rx="19" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        <text x="54" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="800" letterSpacing="-0.3px">
          +0.1 RD ✓
        </text>
      </g>

      {/* Floating "Helpful Solution" Approval Heart Chip */}
      <g filter="url(#chip-shadow)" transform="translate(32, 160)">
        <rect x="0" y="0" width="118" height="36" rx="18" fill="#FFFFFF" />
        <path d="M 22 19 a 4.5 4.5 0 0 1 6.5 -3.5 a 4.5 4.5 0 0 1 6.5 3.5 c 0 5 -7 9 -7 9 s -7 -4 -7 -9 z" fill="#E11D48" />
        <text x="40" y="23" fill="#14181F" fontSize="12" fontWeight="700">
          Helpful Solved
        </text>
      </g>

      {/* Progress Metric Level Bar */}
      <g filter="url(#chip-shadow)" transform="translate(95, 204)">
        <rect x="0" y="0" width="150" height="26" rx="13" fill="#FFFFFF" />
        <rect x="4" y="4" width="112" height="18" rx="9" fill="#F59E0B" />
        <text x="75" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
          TIER: PROBLEM SOLVER
        </text>
      </g>

      <g fill="#FFFFFF" opacity="0.95">
        <path d="M 100 48 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 z" />
        <path d="M 285 130 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 z" />
      </g>
    </svg>
  );
}

// Bottom Left: Rotating Circular Problamatic Badge (Human community focus)
export function ProblamaticBadge() {
  return (
    <div
      style={{
        position: 'relative',
        width: 78,
        height: 78,
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
      }}
      aria-label="Problamatic Worldwide Community"
    >
      <svg
        viewBox="0 0 100 100"
        width="78"
        height="78"
        style={{
          animation: 'problamatic-spin 16s linear infinite',
          position: 'absolute',
          inset: 0,
        }}
      >
        <defs>
          <path
            id="badge-path"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="9.2"
          fontWeight="700"
          letterSpacing="2.2px"
          style={{ textTransform: 'uppercase', opacity: 0.85 }}
        >
          <textPath href="#badge-path" startOffset="0%">
            PROBLAMATIC • SHARE & SOLVE • 
          </textPath>
        </text>
      </svg>

      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
          zIndex: 2,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2.2" />
          <path
            d="M9 12l2 2l4-4"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <style>{`
        @keyframes problamatic-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export const NikitinBadge = ProblamaticBadge;
export const ThreeAgentsIllustration = CommunityQualityIllustration;
