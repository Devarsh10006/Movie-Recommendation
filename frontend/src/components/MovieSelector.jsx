import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Film, Star, X, Check, Loader2, Sparkles, Flame, ChevronRight, CornerDownLeft } from 'lucide-react';
import { searchMovies, FALLBACK_TOP_MOVIES } from '../services/api';

const QUICK_PICKS = [
  { title: 'Inception (2010)', query: 'Inception' },
  { title: 'The Dark Knight (2008)', query: 'Dark Knight' },
  { title: 'Interstellar (2014)', query: 'Interstellar' },
  { title: 'The Matrix (1999)', query: 'Matrix' },
  { title: 'Pulp Fiction (1994)', query: 'Pulp Fiction' },
  { title: 'Toy Story (1995)', query: 'Toy Story' },
  { title: 'Fight Club (1999)', query: 'Fight Club' }
];

function HighlightMatch({ text, query }) {
  if (!query || !query.trim() || !text) return <span>{text}</span>;
  const cleanQ = query.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(cleanQ);

  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <span
        style={{
          color: '#c4b5fd',
          background: 'rgba(139, 92, 246, 0.35)',
          padding: '0 3px',
          borderRadius: '4px',
          fontWeight: 700
        }}
      >
        {text.slice(idx, idx + cleanQ.length)}
      </span>
      {text.slice(idx + cleanQ.length)}
    </span>
  );
}

export default function MovieSelector({
  selectedMovie,
  onSelectMovie,
  searchQuery = '',
  onSearchQueryChange,
  onAutoSubmit
}) {
  const [internalQuery, setInternalQuery] = useState(searchQuery || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDefaultTrending, setIsDefaultTrending] = useState(false);

  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync internalQuery with external searchQuery if provided
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== internalQuery) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  const updateQuery = (val) => {
    setInternalQuery(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live suggestions with instant debouncing (130ms)
  const fetchSuggestions = useCallback(async (text) => {
    const trimmed = text.trim();
    setIsSearching(true);
    try {
      const data = await searchMovies(trimmed, 15);
      const items = data.results || [];
      setResults(items);
      setIsDefaultTrending(!trimmed);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to top curated list
      setResults(FALLBACK_TOP_MOVIES.slice(0, 10));
      setIsDefaultTrending(true);
      setIsOpen(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle Search input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    updateQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      // Load trending defaults
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions('');
      }, 100);
      return;
    }

    // Fast 130ms debounce for live search
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 130);
  };

  // On Focus, open suggestions or load trending
  const handleFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    } else {
      fetchSuggestions(internalQuery);
    }
  };

  const handlePickMovie = (movie) => {
    onSelectMovie(movie);
    updateQuery('');
    setIsOpen(false);
    setResults([]);
    setActiveIndex(-1);
  };

  const handleQuickPick = async (pick) => {
    setIsSearching(true);
    try {
      const data = await searchMovies(pick.query, 5);
      if (data.results && data.results.length > 0) {
        handlePickMovie(data.results[0]);
      } else {
        updateQuery(pick.query);
        if (onAutoSubmit) onAutoSubmit(pick.query);
      }
    } catch (err) {
      console.error('Quick pick error:', err);
      updateQuery(pick.query);
    } finally {
      setIsSearching(false);
    }
  };

  // Keyboard navigation through suggestions
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        if (internalQuery.trim()) {
          e.preventDefault();
          if (onAutoSubmit) {
            onAutoSubmit(internalQuery.trim());
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < results.length - 1 ? prev + 1 : 0;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : results.length - 1;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handlePickMovie(results[activeIndex]);
      } else if (results.length > 0 && internalQuery.trim()) {
        // Automatically pick best matching suggestion
        handlePickMovie(results[0]);
      } else if (internalQuery.trim()) {
        setIsOpen(false);
        if (onAutoSubmit) {
          onAutoSubmit(internalQuery.trim());
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const scrollActiveIntoView = (index) => {
    if (listRef.current) {
      const activeEl = listRef.current.children[index + 1]; // +1 because of header
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const handleClear = () => {
    updateQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
        <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
          1. Select a Movie You Watched
        </label>
        {selectedMovie && (
          <span className="badge badge-purple" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Check size={12} /> Movie Confirmed
          </span>
        )}
      </div>

      {/* Selected Movie Preview Card */}
      {selectedMovie ? (
        <div
          className="glass-panel animate-scale-up"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(22, 22, 38, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.45)',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 15px rgba(229, 9, 20, 0.3)'
              }}
            >
              <Film size={24} color="#fff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {selectedMovie.clean_title || selectedMovie.title}
                </h4>
                {selectedMovie.year && selectedMovie.year !== 'N/A' && (
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {selectedMovie.year}
                  </span>
                )}
                {selectedMovie.movie_avg_rating && (
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    ★ {selectedMovie.movie_avg_rating} / 5.0
                  </span>
                )}
              </div>

              {/* Genre chips */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                {(Array.isArray(selectedMovie.genres_list)
                  ? selectedMovie.genres_list
                  : (Array.isArray(selectedMovie.genres)
                    ? selectedMovie.genres
                    : (typeof selectedMovie.genres === 'string' ? selectedMovie.genres.split('|') : []))).map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.65rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    {typeof g === 'string' ? g : g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectMovie(null);
              updateQuery('');
              setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
              }, 50);
            }}
            title="Change selected movie"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <X size={15} />
            <span>Change</span>
          </button>
        </div>
      ) : (
        /* Search Box Input Container */
        <div ref={containerRef} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(20, 20, 32, 0.85)',
              border: isOpen ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 1.15rem',
              transition: 'all 0.2s ease',
              boxShadow: isOpen
                ? '0 0 25px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.1)'
                : '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Search
              size={20}
              color={isOpen ? 'var(--accent-purple)' : 'var(--text-muted)'}
              style={{ marginRight: '0.85rem', flexShrink: 0, transition: 'color 0.2s ease' }}
            />
            <input
              ref={inputRef}
              type="text"
              value={internalQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search by title (e.g. Inception, Dark Knight, Interstellar, Pulp Fiction)..."
              autoComplete="off"
              spellCheck="false"
              style={{
                width: '100%',
                padding: '0.85rem 0',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-highlight)',
                fontSize: '1.05rem',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
            />
            {isSearching && (
              <Loader2
                size={19}
                color="var(--accent-purple)"
                style={{ animation: 'spinSlow 0.8s linear infinite', marginRight: '0.5rem', flexShrink: 0 }}
              />
            )}
            {internalQuery && !isSearching && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                style={{
                  color: 'var(--text-muted)',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  border: 'none',
                  marginRight: '0.5rem',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={16} />
              </button>
            )}

            {/* Keyboard Enter Hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexShrink: 0,
                userSelect: 'none'
              }}
            >
              <span>Type / Select</span>
              <CornerDownLeft size={12} />
            </div>
          </div>

          {/* Autocomplete Dropdown with Live Search Suggestions */}
          {isOpen && results.length > 0 && (
            <div
              ref={listRef}
              className="glass-panel animate-scale-up"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                maxHeight: '380px',
                overflowY: 'auto',
                zIndex: 60,
                background: 'rgba(15, 15, 28, 0.98)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem'
              }}
            >
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.85rem 0.65rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '0.35rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isDefaultTrending ? '#fbbf24' : '#c084fc', fontWeight: 600 }}>
                  {isDefaultTrending ? <Flame size={14} /> : <Sparkles size={14} />}
                  <span>{isDefaultTrending ? 'Top Catalog Masterpieces (Click to Select)' : `Live Suggestions (${results.length} matches)`}</span>
                </div>
                <span>Use ↑ ↓ keys to navigate, Enter to choose</span>
              </div>

              {/* Result Items */}
              {results.map((m, index) => {
                const isSelected = index === activeIndex;
                return (
                  <div
                    key={m.movie_id}
                    onClick={() => handlePickMovie(m)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.08) 100%)'
                        : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-purple)' : '3px solid transparent',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: isSelected ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Film size={17} color={isSelected ? '#fff' : 'var(--accent-purple)'} />
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-highlight)', fontSize: '0.98rem' }}>
                          <HighlightMatch text={m.clean_title || m.title} query={internalQuery} />
                          {m.year && m.year !== 'N/A' && (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.45rem', fontSize: '0.85rem' }}>
                              ({m.year})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {(Array.isArray(m.genres) ? m.genres : (typeof m.genres === 'string' ? m.genres.split('|') : [])).slice(0, 4).join(' • ')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      {m.movie_avg_rating && (
                        <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                          ★ {m.movie_avg_rating}
                        </span>
                      )}
                      <span
                        style={{
                          color: isSelected ? '#fff' : 'var(--accent-purple)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          background: isSelected ? 'var(--accent-purple)' : 'rgba(139, 92, 246, 0.12)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Select</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Direct query submit helper row */}
              {internalQuery.trim() && (
                <div
                  onClick={() => {
                    if (onAutoSubmit) {
                      onAutoSubmit(internalQuery.trim());
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    marginTop: '0.35rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(236, 72, 153, 0.08)',
                    color: '#f472b6',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.08)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} />
                    <span>Search or recommend directly for: <em>"{internalQuery}"</em></span>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(236, 72, 153, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Press Enter
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Empty match message */}
          {isOpen && !isSearching && internalQuery.trim() && results.length === 0 && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                padding: '1.5rem',
                textAlign: 'center',
                zIndex: 60,
                background: 'rgba(15, 15, 28, 0.98)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                No catalog matches found for <strong>"{internalQuery}"</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onAutoSubmit) {
                    onAutoSubmit(internalQuery.trim());
                    setIsOpen(false);
                  }
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', margin: '0 auto' }}
              >
                <Sparkles size={15} />
                <span>Recommend with "{internalQuery}" anyway</span>
              </button>
            </div>
          )}

          {/* Quick Picks for easy 1-click testing */}
          <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Flame size={14} color="#fbbf24" />
              <span>Trending Quick Picks:</span>
            </span>
            {QUICK_PICKS.map((pick, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPick(pick)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {pick.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
