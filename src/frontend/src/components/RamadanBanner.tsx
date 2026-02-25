import React from 'react';

export default function RamadanBanner() {
  return (
    <div
      className="w-full text-center py-1 px-4 text-xs font-semibold tracking-widest"
      style={{
        background: 'linear-gradient(90deg, oklch(0.18 0.06 145), oklch(0.22 0.08 145), oklch(0.18 0.06 145))',
        color: 'oklch(0.88 0.16 75)',
        borderBottom: '1px solid oklch(0.78 0.16 75 / 0.3)',
        letterSpacing: '0.15em',
      }}
    >
      🌙 রমজান মোবারক 🌙
    </div>
  );
}
