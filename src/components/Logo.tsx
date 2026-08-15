export default function Logo({ size = 40, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 512 512"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: "#FF3366", stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: "#9933FF", stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: "#33CCFF", stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: "#FF9933", stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: "#FF3366", stopOpacity: 1}} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g transform="translate(10, 10) scale(0.96)">
          <rect width="512" height="512" rx="120" fill="transparent" />
          <g transform="translate(100, 100) scale(0.6)" filter="url(#glow)">
            <path d="M433.5,67.5C389.1,23.1,316.9,23.1,272.5,67.5L256,84.1L239.5,67.5C195.1,23.1,122.9,23.1,78.5,67.5c-44.4,44.4-44.4,116.6,0,161l177.5,177.5l177.5-177.5C477.9,184.1,477.9,111.9,433.5,67.5z" fill="url(#grad1)" opacity="0.85"/>
            <path d="M256,406L78.5,228.5c-44.4-44.4-44.4-116.6,0-161C108,38,148.1,26.7,187,35.3c0,0-50.5,107.5,12.5,236.2S433.5,67.5,433.5,67.5c38.9,8.6,79,34.8,107.6,72.6c0,0-44.4,44.4-107.6,107.6L256,406z" fill="url(#grad2)" opacity="0.9"/>
          </g>
        </g>
      </svg>
      <span className="text-aura" style={{ fontSize: size * 0.8, fontWeight: 700, letterSpacing: "-0.05em" }}>
        Synqra
      </span>
    </div>
  );
}
