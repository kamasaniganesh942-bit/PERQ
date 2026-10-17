import React from 'react';

/**
 * Dynamic, high-visibility monochrome flowing wave & ribbon background
 * for the centered PERQ authentication card.
 * Uses pure black, charcoal, neutral grey, silver, and white curved SVG wave layers
 * moving in counter-flowing directions and speeds, with a protective center scrim
 * behind the login card and full prefers-reduced-motion support.
 */
export const AuthAnimatedBackground: React.FC = () => {
  return (
    <div
      data-testid="auth-animated-background"
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#080808]"
    >
      {/* Ambient monochrome luminance fields */}
      <div className="absolute -top-[18%] -left-[8%] w-[62vw] h-[62vw] max-w-[760px] max-h-[760px] rounded-full blur-3xl auth-orb-drift-slow" />
      <div className="absolute -bottom-[20%] -right-[8%] w-[66vw] h-[66vw] max-w-[820px] max-h-[820px] rounded-full blur-3xl auth-orb-drift-reverse" />

      {/* Multi-layer flowing monochrome waves & silver ribbons */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Bright white-silver crest gradient */}
          <linearGradient id="perqSilverCrest" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#080808" stopOpacity="0" />
            <stop offset="15%" stopColor="#858585" stopOpacity="0.45" />
            <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.82" />
            <stop offset="62%" stopColor="#E5E5E5" stopOpacity="0.72" />
            <stop offset="85%" stopColor="#858585" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0" />
          </linearGradient>

          {/* Soft neutral grey secondary ribbon gradient */}
          <linearGradient id="perqGreyRibbon" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#080808" stopOpacity="0" />
            <stop offset="18%" stopColor="#525252" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#B8B8B8" stopOpacity="0.62" />
            <stop offset="82%" stopColor="#525252" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0" />
          </linearGradient>

          {/* Deep charcoal & silver liquid wave body fill */}
          <linearGradient id="perqCharcoalWaveBody" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <stop offset="32%" stopColor="#303030" stopOpacity="0.34" />
            <stop offset="70%" stopColor="#151515" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0" />
          </linearGradient>

          {/* Counter-wave translucent silver mist fill */}
          <linearGradient id="perqSilverMistFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#080808" stopOpacity="0" />
            <stop offset="30%" stopColor="#B8B8B8" stopOpacity="0.12" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="80%" stopColor="#303030" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0" />
          </linearGradient>

          {/* Subtle soft glow filter for primary silver wave crests */}
          <filter id="perqSoftWaveGlow" x="-10%" y="-20%" width="120%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: Upper sweeping charcoal wave & glowing silver crest */}
        <g className="auth-wave-flow-1">
          <path
            d="M-320 175 C 80 10, 460 340, 860 155 C 1220 -10, 1520 270, 1820 125 L 1820 960 L -320 960 Z"
            fill="url(#perqCharcoalWaveBody)"
          />
          <path
            d="M-320 175 C 80 10, 460 340, 860 155 C 1220 -10, 1520 270, 1820 125"
            stroke="url(#perqSilverCrest)"
            strokeWidth="2.4"
            filter="url(#perqSoftWaveGlow)"
          />
          <path
            d="M-320 205 C 110 42, 490 368, 890 185 C 1245 22, 1540 298, 1820 155"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="1.4"
          />
          <path
            d="M-320 235 C 140 75, 520 395, 920 215 C 1270 54, 1560 326, 1820 185"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="0.9"
            strokeOpacity="0.7"
          />
        </g>

        {/* Layer 2: Upper-mid counter-flowing silver ribbon harmonic */}
        <g className="auth-wave-flow-2">
          <path
            d="M-320 350 C 140 520, 540 180, 960 370 C 1320 530, 1580 260, 1820 385 L 1820 960 L -320 960 Z"
            fill="url(#perqSilverMistFill)"
          />
          <path
            d="M-320 350 C 140 520, 540 180, 960 370 C 1320 530, 1580 260, 1820 385"
            stroke="url(#perqSilverCrest)"
            strokeWidth="2.1"
          />
          <path
            d="M-320 382 C 165 548, 565 212, 985 402 C 1345 558, 1600 292, 1820 415"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="1.25"
          />
          <path
            d="M-320 414 C 190 576, 590 244, 1010 434 C 1370 586, 1620 324, 1820 445"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="0.85"
            strokeDasharray="8 12"
          />
        </g>

        {/* Layer 3: Center-spanning liquid ribbon waves flowing behind the card */}
        <g className="auth-wave-flow-4">
          <path
            d="M-320 520 C 90 360, 510 660, 930 490 C 1290 340, 1560 590, 1820 470"
            stroke="url(#perqSilverCrest)"
            strokeWidth="2.2"
            filter="url(#perqSoftWaveGlow)"
          />
          <path
            d="M-320 552 C 120 392, 535 690, 955 522 C 1315 372, 1580 620, 1820 502"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="1.3"
          />
          <path
            d="M-320 584 C 150 424, 560 720, 980 554 C 1340 404, 1600 650, 1820 534"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="0.9"
          />
        </g>

        {/* Layer 4: Lower sweeping charcoal wave sheet & luminous silver edge */}
        <g className="auth-wave-flow-3">
          <path
            d="M-320 700 C 180 530, 610 850, 1050 665 C 1370 530, 1610 735, 1820 640 L 1820 980 L -320 980 Z"
            fill="url(#perqCharcoalWaveBody)"
          />
          <path
            d="M-320 700 C 180 530, 610 850, 1050 665 C 1370 530, 1610 735, 1820 640"
            stroke="url(#perqSilverCrest)"
            strokeWidth="2.5"
            filter="url(#perqSoftWaveGlow)"
          />
          <path
            d="M-320 734 C 210 564, 635 882, 1075 698 C 1395 564, 1630 768, 1820 674"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="1.35"
          />
          <path
            d="M-320 766 C 240 598, 660 912, 1100 730 C 1420 598, 1650 800, 1820 706"
            stroke="url(#perqGreyRibbon)"
            strokeWidth="0.9"
          />
        </g>

        {/* Subtle monochrome luminous nodes along the wave paths */}
        <g className="auth-shimmer-drift">
          <circle cx="160" cy="145" r="2.2" fill="#FFFFFF" fillOpacity="0.55" />
          <circle cx="340" cy="240" r="1.6" fill="#E5E5E5" fillOpacity="0.4" />
          <circle cx="1110" cy="135" r="2.4" fill="#FFFFFF" fillOpacity="0.52" />
          <circle cx="1310" cy="220" r="1.8" fill="#B8B8B8" fillOpacity="0.45" />
          <circle cx="195" cy="435" r="1.9" fill="#FFFFFF" fillOpacity="0.45" />
          <circle cx="1265" cy="445" r="2.1" fill="#FFFFFF" fillOpacity="0.48" />
          <circle cx="170" cy="665" r="2.2" fill="#E5E5E5" fillOpacity="0.5" />
          <circle cx="420" cy="735" r="1.7" fill="#B8B8B8" fillOpacity="0.4" />
          <circle cx="1060" cy="675" r="2.3" fill="#FFFFFF" fillOpacity="0.52" />
          <circle cx="1320" cy="630" r="1.8" fill="#E5E5E5" fillOpacity="0.45" />
        </g>
      </svg>

      {/* Protective radial center scrim so the login card stays high-contrast while surrounding waves shine */}
      <div className="absolute inset-0 auth-center-scrim" />
    </div>
  );
};
