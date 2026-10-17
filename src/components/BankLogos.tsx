import React from 'react';
import { BankIssuer, PaymentNetwork } from '../utils/finance';

interface BankIssuerLogoProps {
  issuer: BankIssuer;
  className?: string;
}

export const BankIssuerLogo: React.FC<BankIssuerLogoProps> = ({
  issuer,
  className = '',
}) => {
  switch (issuer) {
    case 'SBI':
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="SBI Bank Logo"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="14" fill="#00A9E0" />
            <circle cx="16" cy="14.5" r="4.5" fill="#051A42" />
            <rect x="14.2" y="17.5" width="3.6" height="13" fill="#051A42" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white">
              SBI <span className="font-semibold text-[#7DD3FC]">Card</span>
            </span>
          </div>
        </div>
      );

    case 'HDFC Bank':
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="HDFC Bank Logo"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="28" height="28" rx="2" fill="#E31837" />
            <rect x="7" y="7" width="18" height="18" fill="#FFFFFF" />
            <rect x="14" y="2" width="4" height="28" fill="#FFFFFF" />
            <rect x="2" y="14" width="28" height="4" fill="#FFFFFF" />
            <rect x="10.5" y="10.5" width="11" height="11" fill="#004C8F" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-wider text-white">
              HDFC BANK
            </span>
          </div>
        </div>
      );

    case 'ICICI Bank':
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="ICICI Bank Logo"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="28" height="28" rx="6" fill="#F37021" />
            <path
              d="M9 24L15 8H20L14 24H9Z"
              fill="#FFFFFF"
            />
            <circle cx="19.5" cy="9.5" r="2.5" fill="#97144D" />
            <path d="M16 24L20 14H24L20 24H16Z" fill="#97144D" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white italic">
              ICICI <span className="not-italic font-semibold text-[#FDBA74]">Bank</span>
            </span>
          </div>
        </div>
      );

    case 'Axis Bank':
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="Axis Bank Logo"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="28" height="28" rx="5" fill="#97144D" />
            <path d="M16 6L26 24H20.8L16 15.2L11.2 24H6L16 6Z" fill="#FFFFFF" />
            <rect x="12.5" y="20.5" width="7" height="3.5" fill="#FFFFFF" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-wider text-white">
              AXIS BANK
            </span>
          </div>
        </div>
      );

    case 'Kotak Mahindra Bank':
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="Kotak Mahindra Bank Logo"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="28" height="28" rx="7" fill="#ED1C24" />
            <circle
              cx="12"
              cy="16"
              r="4.5"
              stroke="#FFFFFF"
              strokeWidth="2.6"
            />
            <circle
              cx="20"
              cy="16"
              r="4.5"
              stroke="#FFFFFF"
              strokeWidth="2.6"
            />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white">
              kotak
            </span>
          </div>
        </div>
      );

    case 'American Express':
    default:
      return (
        <div
          className={`inline-flex items-center gap-2 select-none ${className}`}
          aria-label="American Express Logo"
        >
          <svg
            width="28"
            height="26"
            viewBox="0 0 36 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="2"
              width="34"
              height="28"
              rx="3"
              fill="#006FCF"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <text
              x="18"
              y="14.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="800"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              AMERICAN
            </text>
            <text
              x="18"
              y="23"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="800"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              EXPRESS
            </text>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-xs tracking-wider text-white uppercase">
              American Express
            </span>
          </div>
        </div>
      );
  }
};

interface PaymentNetworkLogoProps {
  network: PaymentNetwork;
  className?: string;
}

export const PaymentNetworkLogo: React.FC<PaymentNetworkLogoProps> = ({
  network,
  className = '',
}) => {
  if (network === 'Visa') {
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        aria-label="Visa Network"
      >
        <svg
          width="48"
          height="18"
          viewBox="0 0 64 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <text
            x="62"
            y="19"
            textAnchor="end"
            fill="#FFFFFF"
            fontStyle="italic"
            fontWeight="800"
            fontSize="21"
            fontFamily="Plus Jakarta Sans, sans-serif"
            letterSpacing="1"
          >
            VISA
          </text>
          <path d="M8 4H18L20 7.5L8 4Z" fill="#F7B600" />
        </svg>
      </div>
    );
  }

  if (network === 'Mastercard') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 select-none ${className}`}
        aria-label="Mastercard Network"
      >
        <svg
          width="36"
          height="22"
          viewBox="0 0 44 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="16" cy="14" r="10" fill="#EB001B" />
          <circle cx="28" cy="14" r="10" fill="#F79E1B" fillOpacity="0.92" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      aria-label="Amex Network"
    >
      <span className="px-2 py-0.5 rounded border border-white/60 bg-[#006FCF]/80 text-[11px] font-extrabold tracking-widest text-white uppercase">
        AMEX
      </span>
    </div>
  );
};

/**
 * Draws the realistic Bank / Issuer Logo at top-left of the 3D Card Canvas
 * and small neat PERQ label without any circular PERQ emblem.
 */
export function drawBankLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  issuer: BankIssuer,
  x: number,
  y: number
) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (issuer === 'SBI') {
    // SBI Blue Keyhole Circle
    const cx = x + 30;
    const cy = y + 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#00A9E0';
    ctx.fill();

    // Inner dark keyhole circle
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = '#072252';
    ctx.fill();

    // Vertical bottom keyhole slot
    ctx.fillStyle = '#072252';
    ctx.fillRect(cx - 3.6, cy + 4, 7.2, 25);

    // SBI Card Wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SBI', x + 72, y + 44);

    ctx.fillStyle = '#7DD3FC';
    ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Card', x + 148, y + 44);
  } else if (issuer === 'HDFC Bank') {
    // HDFC Red & White Bracket Square with Central Blue Square
    ctx.fillStyle = '#E31837';
    ctx.fillRect(x, y + 2, 56, 56);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 12, 36, 36);
    // Cross notches
    ctx.fillRect(x + 24, y + 2, 8, 56);
    ctx.fillRect(x, y + 26, 56, 8);

    // Central Blue Core
    ctx.fillStyle = '#004C8F';
    ctx.fillRect(x + 17, y + 19, 22, 22);

    // HDFC BANK Wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('HDFC BANK', x + 74, y + 44);
  } else if (issuer === 'ICICI Bank') {
    // ICICI Orange Crest Badge
    ctx.fillStyle = '#F37021';
    ctx.beginPath();
    ctx.roundRect(x, y + 2, 56, 56, 12);
    ctx.fill();

    // Dynamic white & burgundy crest slashes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 48);
    ctx.lineTo(x + 27, y + 14);
    ctx.lineTo(x + 36, y + 14);
    ctx.lineTo(x + 24, y + 48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#97144D';
    ctx.beginPath();
    ctx.arc(x + 36, y + 16, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 29, y + 48);
    ctx.lineTo(x + 37, y + 26);
    ctx.lineTo(x + 45, y + 26);
    ctx.lineTo(x + 37, y + 48);
    ctx.closePath();
    ctx.fill();

    // ICICI Bank Wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ICICI', x + 74, y + 44);
    ctx.fillStyle = '#FDBA74';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Bank', x + 175, y + 44);
  } else if (issuer === 'Axis Bank') {
    // Axis Bank Burgundy Geometric 'A' Badge
    ctx.fillStyle = '#97144D';
    ctx.beginPath();
    ctx.roundRect(x, y + 2, 56, 56, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 11);
    ctx.lineTo(x + 47, y + 46);
    ctx.lineTo(x + 37, y + 46);
    ctx.lineTo(x + 28, y + 28);
    ctx.lineTo(x + 19, y + 46);
    ctx.lineTo(x + 9, y + 46);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(x + 22, y + 39, 12, 7);

    // AXIS BANK Wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AXIS BANK', x + 74, y + 44);
  } else if (issuer === 'Kotak Mahindra Bank') {
    // Kotak Red Twin-Loop Infinity Emblem
    ctx.fillStyle = '#ED1C24';
    ctx.beginPath();
    ctx.roundRect(x, y + 2, 58, 56, 14);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(x + 21, y + 30, 9.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 37, y + 30, 9.5, 0, Math.PI * 2);
    ctx.stroke();

    // kotak Mahindra Bank Wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('kotak', x + 76, y + 43);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Mahindra Bank', x + 196, y + 42);
  } else {
    // American Express Blue Box Emblem
    ctx.fillStyle = '#006FCF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y + 2, 74, 56, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AMERICAN', x + 37, y + 26);
    ctx.fillText('EXPRESS', x + 37, y + 43);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AMERICAN EXPRESS', x + 92, y + 42);
  }

  ctx.restore();
}

/**
 * Draws the Payment Network Logo (Visa, Mastercard, or Amex) at top-right of the 3D Card Canvas
 */
export function drawNetworkLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  network: PaymentNetwork,
  rightX: number,
  topY: number
) {
  ctx.save();

  if (network === 'Visa') {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 800 48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VISA', rightX, topY + 46);

    // Subtle Visa gold flick on top-left of V
    ctx.fillStyle = '#F7B600';
    ctx.beginPath();
    ctx.moveTo(rightX - 122, topY + 11);
    ctx.lineTo(rightX - 96, topY + 11);
    ctx.lineTo(rightX - 91, topY + 21);
    ctx.closePath();
    ctx.fill();
  } else if (network === 'Mastercard') {
    // Dual interlocking circles (Red left, Amber right)
    const r = 24;
    const leftCx = rightX - 66;
    const rightCx = rightX - 34;
    const cy = topY + 26;

    ctx.beginPath();
    ctx.arc(leftCx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#EB001B';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightCx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(247, 158, 27, 0.92)';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('mastercard', (leftCx + rightCx) / 2, topY + 66);
  } else {
    // Amex Network Badge
    const boxW = 116;
    const boxH = 44;
    const boxX = rightX - boxW;
    const boxY = topY + 6;

    ctx.fillStyle = 'rgba(0, 111, 207, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AMEX', boxX + boxW / 2, boxY + 31);
  }

  ctx.restore();
}
