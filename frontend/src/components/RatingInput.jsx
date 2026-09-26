import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_DESCRIPTIONS = {
  1: { label: "Terrible", desc: "1 / 10 — Really disliked it 👎", color: "#ef4444" },
  2: { label: "Poor", desc: "2 / 10 — Disappointing watch", color: "#f87171" },
  3: { label: "Below Average", desc: "3 / 10 — Had major flaws", color: "#fb923c" },
  4: { label: "Mediocre", desc: "4 / 10 — Forgettable experience", color: "#facc15" },
  5: { label: "Average", desc: "5 / 10 — It was okay / Passable", color: "#eab308" },
  6: { label: "Decent", desc: "6 / 10 — Pretty good watch 🙂", color: "#a3e635" },
  7: { label: "Good", desc: "7 / 10 — Solid film, thoroughly enjoyed", color: "#4ade80" },
  8: { label: "Great", desc: "8 / 10 — Highly recommended! 😍", color: "#2dd4bf" },
  9: { label: "Superb", desc: "9 / 10 — Outstanding cinematic achievement", color: "#38bdf8" },
  10: { label: "Masterpiece", desc: "10 / 10 — Absolute masterpiece / All-time favorite! 🏆", color: "#ec4899" }
};

export default function RatingInput({ rating, onChangeRating }) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeVal = hoverRating || rating;
  const currentInfo = RATING_DESCRIPTIONS[activeVal] || RATING_DESCRIPTIONS[8];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
        <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
          2. How Much Did You Enjoy It?
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Star size={16} fill={currentInfo.color} color={currentInfo.color} />
          <span style={{ fontWeight: 800, color: currentInfo.color, fontSize: '0.95rem' }}>
            {activeVal} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>/ 10</span>
          </span>
        </div>
      </div>

      {/* 10 Star Button Grid */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(20, 20, 32, 0.65)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem', overflowX: 'auto', padding: '0.25rem 0' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
            const isFilled = starVal <= activeVal;
            const isExact = starVal === rating;
            return (
              <button
                key={starVal}
                type="button"
                onClick={() => onChangeRating(starVal)}
                onMouseEnter={() => setHoverRating(starVal)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  flex: 1,
                  minWidth: '32px',
                  height: '48px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.2rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isExact ? 'rgba(139, 92, 246, 0.25)' : (isFilled ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                  border: isExact ? '1px solid var(--accent-purple)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`${starVal} / 10`}
              >
                <Star
                  size={20}
                  fill={isFilled ? currentInfo.color : 'none'}
                  color={isFilled ? currentInfo.color : 'rgba(255, 255, 255, 0.2)'}
                  style={{ transition: 'transform 0.15s ease', transform: isExact ? 'scale(1.15)' : 'none' }}
                />
                <span style={{ fontSize: '0.65rem', color: isFilled ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {starVal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Sentiment Feedback Text */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.85rem', color: currentInfo.color, fontWeight: 600 }}>
            {currentInfo.desc}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Scale: 1 (Lowest) to 10 (Highest)
          </span>
        </div>
      </div>
    </div>
  );
}
