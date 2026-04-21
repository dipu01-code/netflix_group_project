import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import {
  searchMulti,
  searchMovies,
  searchTV,
  searchPeople,
  getTrending,
  imgUrl,
} from '../api/tmdb';
import './SearchPage.css';

/* ── constants ─────────────────────────────────────────────── */
const FILTERS = ['All', 'Movies', 'TV Shows', 'People'];
const LS_KEY  = 'nf_recent_searches';
const MAX_RECENT = 8;

/* ── helpers ────────────────────────────────────────────────── */
function getRecent() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function saveRecent(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}
function addRecent(term) {
  if (!term.trim()) return;
  const next = [term, ...getRecent().filter(t => t !== term)];
  saveRecent(next);
}

function getBadge(item) {
  const t = item.media_type;
  if (t === 'movie') return { label: 'Movie', cls: 'badge--movie' };
  if (t === 'tv')    return { label: 'TV',    cls: 'badge--tv'    };
  if (t === 'person') return { label: 'Person', cls: 'badge--person' };
  return null;
}

function getYear(item) {
  const d = item.release_date || item.first_air_date;
  return d ? d.slice(0, 4) : '';
}

/* ── Skeleton grid ──────────────────────────────────────────── */
function SkeletonGrid({ count = 12, people = false }) {
  return (
    <div className={`skeleton-grid${people ? ' results-grid--people' : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-card${people ? ' skeleton-card--person' : ''}`} />
      ))}
    </div>
  );
}

/* ── Media card (Movie / TV) ────────────────────────────────── */
function MediaCard({ item, onClick }) {
  const badge = getBadge(item);
  const year  = getYear(item);
  const title = item.title || item.name || 'Untitled';
  const thumb = imgUrl(item.backdrop_path || item.poster_path, 'w500');

  return (
    <div className="media-card" onClick={() => onClick(item)} tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && onClick(item)}
         role="button" aria-label={`View details for ${title}`}>
      {thumb
        ? <img src={thumb} alt={title} loading="lazy" />
        : <div className="no-image">{title}</div>}
      <div className="media-card__overlay">
        <p className="media-card__title">{title}</p>
        <div className="media-card__meta">
          {year && <span className="media-card__year">{year}</span>}
          {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Person card ─────────────────────────────────────────────── */
function PersonCard({ item, onClick }) {
  const avatar = imgUrl(item.profile_path, 'w185');
  return (
    <div className="person-card" onClick={() => onClick(item)} tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && onClick(item)}
         role="button" aria-label={`View details for ${item.name}`}>
      {avatar
        ? <img className="person-card__avatar" src={avatar} alt={item.name} loading="lazy" />
        : (
          <div className="person-card__avatar-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        )}
      <p className="person-card__name">{item.name}</p>
      {item.known_for_department && (
        <p className="person-card__dept">{item.known_for_department}</p>
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ query }) {
  return (
    <div className="empty-state">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <h3>No results found</h3>
      <p>
        Your search for <strong>"{query}"</strong> did not have any results.
        Try another search.
      </p>
    </div>
  );
}

/* ── Main SearchPage ─────────────────────────────────────────── */
export default function SearchPage({ onSelectItem }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query,       setQuery]       = useState(initialQ);
  const [filter,      setFilter]      = useState('All');
  const [results,     setResults]     = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [recent,      setRecent]      = useState(getRecent);
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef  = useRef(null);
  const debounced = useDebounce(query, 300);

  /* auto-focus on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* load trending on first render */
  useEffect(() => {
    getTrending().then(d => setTrending(d.results || [])).catch(() => {});
  }, []);

  /* fire search when debounced value or filter changes */
  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setSearched(false);
      setSearchParams({});
      return;
    }

    setSearchParams({ q: debounced });
    setLoading(true);
    setSearched(false);

    const fetchFn =
      filter === 'Movies'   ? searchMovies :
      filter === 'TV Shows' ? searchTV     :
      filter === 'People'   ? searchPeople :
      searchMulti;

    fetchFn(debounced)
      .then(d => {
        let items = d.results || [];
        // for searchMulti keep all; for specific endpoints inject media_type
        if (filter === 'Movies')   items = items.map(i => ({ ...i, media_type: 'movie'  }));
        if (filter === 'TV Shows') items = items.map(i => ({ ...i, media_type: 'tv'     }));
        if (filter === 'People')   items = items.map(i => ({ ...i, media_type: 'person' }));
        setResults(items);
      })
      .catch(() => setResults([]))
      .finally(() => { setLoading(false); setSearched(true); });
  }, [debounced, filter]);

  /* save to recent on explicit search (Enter) */
  const handleSearch = useCallback((term) => {
    if (!term.trim()) return;
    addRecent(term);
    setRecent(getRecent());
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const removeRecent = (e, term) => {
    e.stopPropagation();
    const next = getRecent().filter(t => t !== term);
    saveRecent(next);
    setRecent(next);
  };

  const isPeople = filter === 'People';
  const showRecent = inputFocused && !query.trim() && recent.length > 0;

  return (
    <div className="search-page">
      {/* ── Sticky header ── */}
      <div className="search-header">
        {/* Input */}
        <div className="search-input-wrap">
          {/* Magnifier icon */}
          <svg className="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>

          <input
            ref={inputRef}
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Search movies, shows, people…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 150)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            autoComplete="off"
            aria-label="Search"
          />

          {query && (
            <button className="btn-clear" onClick={handleClear} aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Recent searches pills */}
        {showRecent && (
          <div className="recent-searches">
            <span className="recent-label">Recent:</span>
            {recent.map(term => (
              <div key={term} className="recent-pill" onClick={() => handleRecentClick(term)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                </svg>
                {term}
                <span className="pill-remove" onClick={e => removeRecent(e, term)} role="button" aria-label={`Remove ${term}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Filter row */}
        <div className="filter-row" role="group" aria-label="Filter search results">
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.replace(/\s+/g, '-').toLowerCase()}`}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="search-results">
        {/* LOADING — skeleton */}
        {loading && (
          <>
            <p className="results-heading">Searching…</p>
            <SkeletonGrid count={12} people={isPeople} />
          </>
        )}

        {/* RESULTS */}
        {!loading && searched && (
          <>
            {results.length > 0 ? (
              <>
                <p className="results-heading">
                  Top results for <span>"{debounced}"</span>
                </p>
                <div className={`results-grid${isPeople ? ' results-grid--people' : ''}`}>
                  {results.map(item => (
                    isPeople
                      ? <PersonCard key={item.id} item={item} onClick={onSelectItem} />
                      : <MediaCard  key={item.id} item={item} onClick={onSelectItem} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState query={debounced} />
            )}
          </>
        )}

        {/* HOME — trending when no query */}
        {!loading && !searched && trending.length > 0 && (
          <div className="search-home">
            <h2>Trending Now</h2>
            <div className="results-grid">
              {trending.map(item => (
                <MediaCard key={item.id} item={item} onClick={onSelectItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
