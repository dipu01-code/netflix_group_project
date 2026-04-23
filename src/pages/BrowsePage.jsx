import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getActionMovies,
  getAiringTodayTV,
  getComedyMovies,
  getNetflixOriginals,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getTrending,
  getTrendingMovies,
  getTrendingTV,
  getUpcomingMovies,
  imgUrl,
} from '../api/tmdb';
import './BrowsePage.css';

const MY_LIST_KEY = 'nf_my_list';

const PAGE_CONFIG = {
  '/': {
    badge: 'Series Spotlight',
    heading: 'Home',
    description:
      'A cinematic homepage tuned for instant watching, from originals and trending stories to quick picks for tonight.',
    featuredKey: 'originals',
    rows: [
      { key: 'trending', title: 'Trending Now' },
      { key: 'originals', title: 'Only on Netflix' },
      { key: 'popularMovies', title: 'Blockbuster Movies' },
      { key: 'popularTV', title: 'Binge-Worthy TV' },
      { key: 'topRatedMovies', title: 'Award-Winning Movies' },
      { key: 'actionMovies', title: 'Action Reloaded' },
    ],
  },
  '/tv-shows': {
    badge: 'TV Universe',
    heading: 'TV Shows',
    description:
      'Episode-first browsing with originals, breakout series, and fresh shows airing right now.',
    featuredKey: 'popularTV',
    rows: [
      { key: 'popularTV', title: 'Popular TV' },
      { key: 'originals', title: 'Netflix Originals' },
      { key: 'trendingTV', title: 'Trending Series' },
      { key: 'topRatedTV', title: 'Top Rated Series' },
      { key: 'airingToday', title: 'Airing Today' },
    ],
  },
  '/movies': {
    badge: 'Movie Night',
    heading: 'Movies',
    description:
      'A wall of big-screen picks, from high-velocity action to comedy comfort and upcoming releases.',
    featuredKey: 'popularMovies',
    rows: [
      { key: 'popularMovies', title: 'Popular Movies' },
      { key: 'topRatedMovies', title: 'Top Rated Movies' },
      { key: 'actionMovies', title: 'Action Movies' },
      { key: 'comedyMovies', title: 'Comedy Movies' },
      { key: 'upcomingMovies', title: 'Coming Soon' },
      { key: 'trendingMovies', title: 'Trending Movies' },
    ],
  },
  '/latest': {
    badge: 'Fresh Drops',
    heading: 'New & Popular',
    description:
      'Hot arrivals and rising favorites, built around what audiences are discovering right now.',
    featuredKey: 'upcomingMovies',
    rows: [
      { key: 'upcomingMovies', title: 'New & Upcoming' },
      { key: 'trending', title: 'Popular This Week' },
      { key: 'trendingMovies', title: 'Movie Buzz' },
      { key: 'trendingTV', title: 'TV Buzz' },
      { key: 'popularMovies', title: 'Most Popular Movies' },
      { key: 'popularTV', title: 'Most Popular Series' },
    ],
  },
  '/my-list': {
    badge: 'Saved Picks',
    heading: 'My List',
    description:
      'Your personal queue lives here. Save a title anywhere in Browse and it appears instantly on this screen.',
    featuredKey: 'myList',
    rows: [{ key: 'myList', title: 'Saved for Later' }],
  },
};

function getSavedList() {
  try {
    return JSON.parse(localStorage.getItem(MY_LIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveList(items) {
  localStorage.setItem(MY_LIST_KEY, JSON.stringify(items));
}

function normalizeMediaType(item, fallbackType) {
  if (!item) return item;
  if (item.media_type) return item;
  if (fallbackType) return { ...item, media_type: fallbackType };
  return { ...item, media_type: item.title ? 'movie' : 'tv' };
}

function normalizeResults(items = [], fallbackType) {
  return items
    .filter(Boolean)
    .map((item) => normalizeMediaType(item, fallbackType))
    .filter((item) => item.backdrop_path || item.poster_path);
}

function getItemKey(item) {
  return `${item.media_type || 'unknown'}-${item.id}`;
}

function pickFeatured(items) {
  const withBackdrop = items.filter((item) => item.backdrop_path);
  if (withBackdrop.length === 0) return items[0] || null;
  return withBackdrop[Math.floor(Math.random() * withBackdrop.length)];
}

function formatMeta(item) {
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const vote = item.vote_average ? `${Math.round(item.vote_average * 10)}% Match` : null;
  const type = item.media_type === 'tv' ? 'Series' : 'Film';
  return [vote, year, type].filter(Boolean).join(' • ');
}

function MyListButton({ active, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`my-list-btn${active ? ' is-active' : ''}${compact ? ' my-list-btn--compact' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {active ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}
      {!compact && <span>{active ? 'In My List' : 'My List'}</span>}
    </button>
  );
}

function BrowseCard({ item, onSelectItem, inMyList, onToggleList }) {
  const title = item.title || item.name || 'Untitled';
  const image = imgUrl(item.backdrop_path || item.poster_path, 'w780');

  return (
    <article
      className="browse-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelectItem(item)}
      onKeyDown={(event) => event.key === 'Enter' && onSelectItem(item)}
      aria-label={`Open details for ${title}`}
    >
      {image ? (
        <img src={image} alt={title} loading="lazy" />
      ) : (
        <div className="browse-card__fallback">{title}</div>
      )}

      <div className="browse-card__overlay">
        <div>
          <h3>{title}</h3>
          <p>{formatMeta(item)}</p>
        </div>

        <div className="browse-card__actions">
          <button
            type="button"
            className="browse-card__info"
            onClick={(event) => {
              event.stopPropagation();
              onSelectItem(item);
            }}
          >
            More Info
          </button>

          <MyListButton
            compact
            active={inMyList}
            onClick={(event) => {
              event.stopPropagation();
              onToggleList(item);
            }}
          />
        </div>
      </div>
    </article>
  );
}

function BrowseRow({ title, items, onSelectItem, myListKeys, onToggleList }) {
  if (!items.length) return null;

  return (
    <section className="browse-row">
      <div className="browse-row__header">
        <h2>{title}</h2>
      </div>

      <div className="browse-row__track">
        {items.map((item) => (
          <BrowseCard
            key={getItemKey(item)}
            item={item}
            onSelectItem={onSelectItem}
            inMyList={myListKeys.has(getItemKey(item))}
            onToggleList={onToggleList}
          />
        ))}
      </div>
    </section>
  );
}

export default function BrowsePage({ onSelectItem }) {
  const location = useLocation();
  const config = PAGE_CONFIG[location.pathname] || PAGE_CONFIG['/'];

  const [catalog, setCatalog] = useState({});
  const [myList, setMyList] = useState(getSavedList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBrowsePage() {
      setLoading(true);
      setError('');

      try {
        const [
          trendingData,
          trendingMoviesData,
          trendingTVData,
          originalsData,
          popularMoviesData,
          popularTVData,
          topRatedMoviesData,
          topRatedTVData,
          actionMoviesData,
          comedyMoviesData,
          upcomingMoviesData,
          airingTodayData,
        ] = await Promise.all([
          getTrending(),
          getTrendingMovies(),
          getTrendingTV(),
          getNetflixOriginals(),
          getPopularMovies(),
          getPopularTV(),
          getTopRatedMovies(),
          getTopRatedTV(),
          getActionMovies(),
          getComedyMovies(),
          getUpcomingMovies(),
          getAiringTodayTV(),
        ]);

        if (cancelled) return;

        const nextCatalog = {
          trending: normalizeResults(trendingData.results),
          trendingMovies: normalizeResults(trendingMoviesData.results, 'movie'),
          trendingTV: normalizeResults(trendingTVData.results, 'tv'),
          originals: normalizeResults(originalsData.results, 'tv'),
          popularMovies: normalizeResults(popularMoviesData.results, 'movie'),
          popularTV: normalizeResults(popularTVData.results, 'tv'),
          topRatedMovies: normalizeResults(topRatedMoviesData.results, 'movie'),
          topRatedTV: normalizeResults(topRatedTVData.results, 'tv'),
          actionMovies: normalizeResults(actionMoviesData.results, 'movie'),
          comedyMovies: normalizeResults(comedyMoviesData.results, 'movie'),
          upcomingMovies: normalizeResults(upcomingMoviesData.results, 'movie'),
          airingToday: normalizeResults(airingTodayData.results, 'tv'),
        };

        setCatalog(nextCatalog);
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message || 'Unable to load Netflix browse content right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBrowsePage();
    return () => {
      cancelled = true;
    };
  }, []);

  const myListKeys = useMemo(() => new Set(myList.map((item) => getItemKey(item))), [myList]);

  const rows = useMemo(() => {
    const myListItems = normalizeResults(myList);
    return config.rows
      .map((row) => ({
        ...row,
        items: row.key === 'myList' ? myListItems : catalog[row.key] || [],
      }))
      .filter((row) => row.items.length > 0);
  }, [catalog, config.rows, myList]);

  const featured = useMemo(() => {
    const pool = config.featuredKey === 'myList' ? normalizeResults(myList) : catalog[config.featuredKey] || [];
    return pickFeatured(pool);
  }, [catalog, config.featuredKey, myList]);

  const toggleMyList = (item) => {
    const normalized = normalizeMediaType(item);

    setMyList((current) => {
      const exists = current.some((entry) => getItemKey(entry) === getItemKey(normalized));
      const next = exists
        ? current.filter((entry) => getItemKey(entry) !== getItemKey(normalized))
        : [normalized, ...current];

      saveList(next);
      return next;
    });
  };

  const emptyMyList = location.pathname === '/my-list' && !loading && rows.length === 0;
  const featuredImage = featured?.backdrop_path ? imgUrl(featured.backdrop_path, 'original') : null;
  const featuredTitle = featured?.title || featured?.name || config.heading;

  return (
    <div className="browse-page">
      <section
        className={`browse-hero${featuredImage ? '' : ' browse-hero--fallback'}`}
        style={featuredImage ? { backgroundImage: `linear-gradient(77deg, rgba(0,0,0,0.88) 22%, rgba(0,0,0,0.42) 58%, rgba(0,0,0,0.92) 100%), url(${featuredImage})` } : undefined}
      >
        <div className="browse-hero__content">
          <p className="browse-hero__badge">{config.badge}</p>
          <h1>{featuredTitle}</h1>
          <p className="browse-hero__meta">{featured ? formatMeta(featured) : 'Curated picks for your next watch'}</p>
          <p className="browse-hero__description">
            {featured?.overview || config.description}
          </p>

          <div className="browse-hero__actions">
            <button
              type="button"
              className="browse-hero__primary"
              onClick={() => featured && onSelectItem(featured)}
              disabled={!featured}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
              <span>Play</span>
            </button>

            <button
              type="button"
              className="browse-hero__secondary"
              onClick={() => featured && onSelectItem(featured)}
              disabled={!featured}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 10.5v5m0-8h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>More Info</span>
            </button>

            {featured && (
              <MyListButton
                active={myListKeys.has(getItemKey(featured))}
                onClick={() => toggleMyList(featured)}
              />
            )}
          </div>
        </div>
      </section>

      <main className="browse-main">
        {loading && (
          <div className="browse-status">
            <h2>Loading your Netflix homepage…</h2>
          </div>
        )}

        {!loading && error && (
          <div className="browse-status browse-status--error">
            <h2>Couldn’t load the browse rails.</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && emptyMyList && (
          <div className="browse-status">
            <h2>Your list is empty.</h2>
            <p>Add titles from any row with the plus button and they’ll show up here.</p>
          </div>
        )}

        {!loading && !error && rows.map((row) => (
          <BrowseRow
            key={row.key}
            title={row.title}
            items={row.items}
            onSelectItem={onSelectItem}
            myListKeys={myListKeys}
            onToggleList={toggleMyList}
          />
        ))}
      </main>
    </div>
  );
}
