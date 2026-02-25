import React from 'react';

interface SpinWheelProps {
  isSpinning: boolean;
  prizeAmount: number | null;
}

export default function SpinWheel({ isSpinning, prizeAmount }: SpinWheelProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel container */}
      <div className="relative w-64 h-64">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-secondary" />
        </div>

        {/* Wheel image */}
        <div
          className={`w-full h-full rounded-full overflow-hidden border-4 border-secondary gold-glow ${
            isSpinning ? 'spin-animation' : ''
          }`}
          style={{ transformOrigin: 'center center' }}
        >
          <img
            src="/assets/generated/spin-wheel.dim_400x400.png"
            alt="Spin Wheel"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback: draw a colorful wheel
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Fallback wheel */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {[
                { color: '#22c55e', label: '৳5', startAngle: 0 },
                { color: '#f59e0b', label: '৳10', startAngle: 72 },
                { color: '#3b82f6', label: '৳15', startAngle: 144 },
                { color: '#ef4444', label: '৳20', startAngle: 216 },
                { color: '#8b5cf6', label: '৳25', startAngle: 288 },
              ].map((segment, i) => {
                const startRad = (segment.startAngle * Math.PI) / 180;
                const endRad = ((segment.startAngle + 72) * Math.PI) / 180;
                const x1 = 100 + 90 * Math.cos(startRad);
                const y1 = 100 + 90 * Math.sin(startRad);
                const x2 = 100 + 90 * Math.cos(endRad);
                const y2 = 100 + 90 * Math.sin(endRad);
                const midRad = ((segment.startAngle + 36) * Math.PI) / 180;
                const tx = 100 + 60 * Math.cos(midRad);
                const ty = 100 + 60 * Math.sin(midRad);
                return (
                  <g key={i}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#1a1a2e"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="12" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Prize display */}
      {prizeAmount !== null && !isSpinning && (
        <div className="mt-4 animate-bounce-in">
          <div className="bg-secondary/20 border border-secondary/40 rounded-2xl px-8 py-4 text-center gold-glow">
            <p className="text-xs text-muted-foreground mb-1">আপনি জিতেছেন!</p>
            <p className="text-4xl font-black text-gold">৳{prizeAmount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
