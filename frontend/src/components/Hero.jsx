import React from 'react';
import { Sparkles, ArrowRight, Play, Star, ShieldCheck, Film, Zap } from 'lucide-react';

export default function Hero({ onGetStarted, onExploreHowItWorks }) {
  return (
    <section id="hero" style={{ position: 'relative', paddingTop: 'calc(var(--header-height) + 3rem)', paddingBottom: '4rem', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Left Column: Headlines & Call to Action */}
          <div>
            {/* Tag Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#c4b5fd',
                marginBottom: '1.5rem',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)'
              }}
            >
              <Sparkles size={16} color="#a78bfa" />
              <span>Tuned Random Forest Recommendation Engine</span>
            </div>

            {/* Main Heading */}
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800 }}>
              Find Movies <br />
              You'll <span className="gradient-text">Actually Love.</span>
            </h1>

            {/* Subheading */}
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2.25rem', maxWidth: '540px' }}>
              Tell us what you watched and how much you enjoyed it. Our AI-powered recommendation engine analyzes deep rating patterns across 25 million data points to curate movies tailored directly to your taste.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <button
                onClick={onGetStarted}
                className="btn-primary"
                style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
              >
                <Film size={20} />
                <span>Get Recommendations</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={onExploreHowItWorks}
                className="btn-secondary"
                style={{ fontSize: '1.05rem', padding: '1rem 1.75rem' }}
              >
                <Play size={18} color="#ec4899" fill="#ec4899" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#10b981" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  MovieLens 25M Verified
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} color="#8b5cf6" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Instant Sub-100ms Inference
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Cinematic Cards Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Main Interactive Showcase Card */}
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '1.75rem',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                animation: 'floatCard 6s ease-in-out infinite'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-purple">AI Recommended Match</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MovieLens 25M</span>
              </div>

              {/* Movie Backdrop Artwork Simulation */}
              <div
                style={{
                  height: '200px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #1e1035 0%, #111827 50%, #2e0818 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#fbbf24'
                  }}
                >
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span>★ 4.43 / 5.0</span>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1994 • Crime • Drama
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    The Shawshank Redemption
                  </h3>
                </div>
              </div>

              {/* Match Score Bar */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Algorithm Confidence</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>95% Match</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '95%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              {/* AI Insight Snippet */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
                "High audience consensus and stellar emotional narrative align closely with your 5-star preference."
              </p>
            </div>

            {/* Background Secondary Floating Pill Card */}
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-10px',
                padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(26, 20, 48, 0.9)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 3
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Inception (2010)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>92% Predicted Like</div>
              </div>
            </div>

            {/* Background Tertiary Floating Pill Card */}
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '-15px',
                padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(20, 28, 48, 0.9)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 3
              }}
            >
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>The Dark Knight</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>★ 4.24 / 5.0 Rating</div>
              </div>
            </div>
          </div>

        </div>

        {/* Global Stats Strip */}
        <div
          className="glass-panel"
          style={{
            marginTop: '4.5rem',
            padding: '1.75rem 2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-highlight)', fontFamily: 'var(--font-heading)' }}>
              62,400+
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Full Movie Catalog
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', fontFamily: 'var(--font-heading)' }}>
              25 Million
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              MovieLens Training Ratings
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', fontFamily: 'var(--font-heading)' }}>
              0.806
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Random Forest ROC-AUC
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              &lt; 50ms
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              FastAPI Vectorized Latency
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
