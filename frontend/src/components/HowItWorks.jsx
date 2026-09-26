import React from 'react';
import { Film, Star, Cpu, Sparkles } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Film,
    title: 'Pick a Movie',
    desc: 'Search our 62,000+ title catalog for a movie you recently watched or enjoyed.',
    color: '#8b5cf6'
  },
  {
    step: '02',
    icon: Star,
    title: 'Rate It',
    desc: 'Rate your experience from 1 to 10 stars to establish your taste affinity benchmark.',
    color: '#fbbf24'
  },
  {
    step: '03',
    icon: Cpu,
    title: 'AI Analysis',
    desc: 'Our Tuned Random Forest model calculates feature interactions against 25M ratings.',
    color: '#ec4899'
  },
  {
    step: '04',
    icon: Sparkles,
    title: 'Discover Movies',
    desc: 'Get personalized, ranked recommendations complete with match scores & IMDb links.',
    color: '#10b981'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ margin: '5rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>
          Four Step Machine Learning Pipeline
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800 }}>
          How <span className="gradient-text">CineMatch AI</span> Works
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.75rem auto 0' }}>
          From your single movie impression to deep collaborative pattern recognition.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem 1.5rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(16, 16, 28, 0.7)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: `rgba(${parseInt(s.color.slice(1,3),16)}, ${parseInt(s.color.slice(3,5),16)}, ${parseInt(s.color.slice(5,7),16)}, 0.15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${s.color}40`
                    }}
                  >
                    <Icon size={22} color={s.color} />
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.15)', fontFamily: 'var(--font-heading)' }}>
                    {s.step}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--text-highlight)' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
