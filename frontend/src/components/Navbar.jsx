import React, { useState, useEffect } from 'react';
import { Film, Sparkles, Activity, Info, BarChart3, Menu, X } from 'lucide-react';

export default function Navbar({
  backendHealth,
  isBackendReady,
  onOpenModelInfo,
  onOpenInsights,
  onScrollToRecommend
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        zIndex: 900,
        transition: 'all 0.3s ease',
        background: isScrolled ? 'rgba(7, 7, 13, 0.92)' : 'rgba(7, 7, 13, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent'
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)'
            }}
          >
            <Film size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>CineMatch</span>
              <span className="gradient-text">AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              MovieLens ML Engine
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          <a
            href="#hero"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Home
          </a>
          <a
            href="#recommend-section"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Recommendations
          </a>
          <button
            onClick={onOpenModelInfo}
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Info size={16} />
            About AI Model
          </button>
          <button
            onClick={onOpenInsights}
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <BarChart3 size={16} />
            Data Insights
          </button>
        </nav>

        {/* Right side: Status & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Health Indicator Badge */}
          <div
            title={isBackendReady ? `FastAPI Online (${backendHealth?.total_movies_cached || 0} movies cached)` : 'Connecting to FastAPI backend...'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isBackendReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isBackendReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isBackendReady ? '#34d399' : '#f87171'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isBackendReady ? '#10b981' : '#ef4444',
                boxShadow: isBackendReady ? '0 0 8px #10b981' : '0 0 8px #ef4444'
              }}
            />
            <span>{isBackendReady ? 'AI Engine Online' : 'Connecting...'}</span>
          </div>

          <button
            onClick={onScrollToRecommend}
            className="btn-primary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            <Sparkles size={16} />
            <span>Get Recommendations</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{ color: 'var(--text-primary)', padding: '0.5rem', display: 'none' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'rgba(10, 10, 18, 0.98)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backdropFilter: 'blur(20px)'
          }}
        >
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', padding: '0.5rem 0', color: 'var(--text-primary)' }}
          >
            Home
          </a>
          <a
            href="#recommend-section"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', padding: '0.5rem 0', color: 'var(--text-primary)' }}
          >
            Recommendations
          </a>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenModelInfo(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.5rem 0', color: 'var(--text-primary)', textAlign: 'left' }}
          >
            <Info size={18} /> About AI Model
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenInsights(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.5rem 0', color: 'var(--text-primary)', textAlign: 'left' }}
          >
            <BarChart3 size={18} /> Data Insights
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 859px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
