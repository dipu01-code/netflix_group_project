import { useEffect, useState } from 'react';
import Navbar from '../Member_2/Navbar';
import MovieCard from '../Member_2/MovieCard';
import SkeletonCard from './SkeletonCard';
import { API_KEY_ERROR, normalizeTitle, tmdbFetch } from './tmdbApi';
import './member3.css';

const filterOptions = [
  { label: 'All', endpoint: '/search/multi' },
  { label: 'Movies', endpoint: '/search/movie' },
  { label: 'TV Shows', endpoint: '/search/tv' },
  { label: 'People', endpoint: '/search/person' },
];

const RECENT_KEY = 'netflix-clone-recent-searches';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function runSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const selectedFilter = filterOptions.find((item) => item.label === filter);
        const data = await tmdbFetch(selectedFilter.endpoint, { query: debouncedQuery });
        const mappedResults = (data.results || []).map((item) => ({
          ...normalizeTitle(item),
          resultType: item.media_type || filter.toLowerCase(),
        }));
        setResults(mappedResults);

        setRecentSearches((previous) => {
          const nextValues = [debouncedQuery, ...previous.filter((item) => item !== debouncedQuery)].slice(0, 6);
          localStorage.setItem(RECENT_KEY, JSON.stringify(nextValues));
          return nextValues;
        });
      } catch (requestError) {
        setResults([]);
        setError(requestError.message || API_KEY_ERROR);
      } finally {
        setIsLoading(false);
      }
    }

    runSearch();
  }, [debouncedQuery, filter]);

  return (
    <div className="page search-page">
      <Navbar />
      <section className="search-shell">
        <div className="search-input-shell">
          <span>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Titles, people, genres"
          />
          {query ? (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          ) : null}
        </div>

        <div className="search-filters">
          {filterOptions.map((option) => (
            <button
              key={option.label}
              className={`search-filter ${filter === option.label ? 'is-active' : ''}`}
              onClick={() => setFilter(option.label)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {!query && isFocused && recentSearches.length > 0 ? (
          <div className="recent-searches">
            {recentSearches.map((item) => (
              <button key={item} onClick={() => setQuery(item)}>
                {item}
              </button>
            ))}
          </div>
        ) : null}

        {debouncedQuery ? <h1>Top results for "{debouncedQuery}"</h1> : null}

        {error ? <div className="page-error">{error}</div> : null}

        {isLoading ? (
          <div className="search-grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && results.length > 0 ? (
          <div className="search-grid">
            {results.map((item) =>
              filter === 'People' || item.resultType === 'person' ? (
                <div key={item.id} className="person-card">
                  <img src={item.posterUrl} alt={item.title} />
                  <strong>{item.title}</strong>
                  <span>Person</span>
                </div>
              ) : (
                <MovieCard key={item.id} item={item} />
              )
            )}
          </div>
        ) : null}

        {!isLoading && debouncedQuery && results.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-icon">⌕</div>
            <p>
              Your search for {debouncedQuery} did not have any results. Try another search.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
