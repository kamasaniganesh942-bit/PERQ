import React from 'react';

interface PerqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const PerqLogo: React.FC<PerqLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const dimensions = {
    sm: 28,
    md: 36,
    lg: 44,
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer geometric squircle frame */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="8"
          fill="#151515"
          stroke="#303030"
          strokeWidth="1.5"
        />
        {/* Stylized geometric letter P stem and loop */}
        <path
          d="M10.5 8.5H19.5C23.6421 8.5 27 11.8579 27 16C27 20.1421 23.6421 23.5 19.5 23.5H15.5V28H10.5V8.5Z"
          fill="#FFFFFF"
        />
        {/* Monochrome geometric counter & Q-tail accent */}
        <circle cx="19.5" cy="16" r="3.25" fill="#151515" />
        <path d="M20.5 24.2L26.8 28H20.5V24.2Z" fill="#B8B8B8" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-[#FFFFFF] text-lg leading-none">
            PERQ
          </span>
          {showTagline && (
            <span className="text-[11px] text-[#858585] tracking-normal mt-1 leading-none">
              Smarter Cards. Bigger Rewards.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
