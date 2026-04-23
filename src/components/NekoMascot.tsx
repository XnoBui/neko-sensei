export default function NekoMascot({ size = 160 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Neko Sensei mascot — a cute pink cat teacher"
    >
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4ec" />
        </radialGradient>
      </defs>
      {/* Ears */}
      <polygon points="45,60 70,20 90,70" fill="#ff94b4" />
      <polygon points="155,60 130,20 110,70" fill="#ff94b4" />
      <polygon points="55,55 70,35 82,60" fill="#ffc1d4" />
      <polygon points="145,55 130,35 118,60" fill="#ffc1d4" />
      {/* Face */}
      <circle cx="100" cy="110" r="65" fill="url(#faceGrad)" stroke="#f43f75" strokeWidth="3" />
      {/* Cheeks */}
      <circle cx="65" cy="125" r="9" fill="#ffc1d4" opacity="0.8" />
      <circle cx="135" cy="125" r="9" fill="#ffc1d4" opacity="0.8" />
      {/* Eyes */}
      <g fill="#2a1620">
        <ellipse cx="78" cy="105" rx="5" ry="8" />
        <ellipse cx="122" cy="105" rx="5" ry="8" />
        <circle cx="80" cy="102" r="2" fill="#fff" />
        <circle cx="124" cy="102" r="2" fill="#fff" />
      </g>
      {/* Nose */}
      <path d="M96,122 L104,122 L100,128 Z" fill="#f43f75" />
      {/* Mouth */}
      <path d="M90,130 Q100,140 110,130" stroke="#2a1620" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <g stroke="#2a1620" strokeWidth="1.5" strokeLinecap="round">
        <line x1="40" y1="125" x2="62" y2="128" />
        <line x1="40" y1="135" x2="62" y2="135" />
        <line x1="160" y1="125" x2="138" y2="128" />
        <line x1="160" y1="135" x2="138" y2="135" />
      </g>
      {/* Graduation cap */}
      <g>
        <rect x="60" y="40" width="80" height="10" rx="2" fill="#2a1620" />
        <polygon points="100,25 150,42 100,50 50,42" fill="#2a1620" />
        <line x1="130" y1="40" x2="155" y2="55" stroke="#f43f75" strokeWidth="2" />
        <circle cx="155" cy="57" r="3" fill="#f43f75" />
      </g>
    </svg>
  );
}
