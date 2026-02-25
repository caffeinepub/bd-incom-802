import React from 'react';

const NOTICE_TEXT =
  'নোটিশঃ সবাইকে মাহে রমদান এর শুভেচ্ছা 🌙 আমাদের সাইটের শুভ উদ্বোধন উপলক্ষে ৩ দিনব্যাপী একাউন্ট এক্টিভেশন মাএ ২৫ টাকা সাথে ২৫ টাকা বোনাস 🎉';

export default function NoticeBanner() {
  return (
    <div
      className="w-full overflow-hidden bg-gold-dark border-b border-gold/40 py-1.5"
      style={{ backgroundColor: 'oklch(0.30 0.12 65)' }}
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate text for seamless loop */}
        <span
          className="inline-block px-8 text-sm font-semibold font-bangla"
          style={{ color: 'oklch(0.96 0.14 80)' }}
        >
          {NOTICE_TEXT}
        </span>
        <span
          className="inline-block px-8 text-sm font-semibold font-bangla"
          style={{ color: 'oklch(0.96 0.14 80)' }}
        >
          {NOTICE_TEXT}
        </span>
        <span
          className="inline-block px-8 text-sm font-semibold font-bangla"
          style={{ color: 'oklch(0.96 0.14 80)' }}
        >
          {NOTICE_TEXT}
        </span>
      </div>
    </div>
  );
}
