import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  API_KEY_ERROR,
  fetchDetails,
  fetchSeasonEpisodes,
  getImageUrl,
  getTrailerKey,
  normalizeTitle,
} from './tmdbApi';
import './member3.css';

const STORAGE_KEY = 'netflix-clone-watchlist';

function readWatchlist() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch {
    return [];
  }
}

export default function DetailModal({ isOpen, contentId, mediaType = 'movie', onClose }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [details, setDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState('');
  const [watchlistItems, setWatchlistItems] = useState(() => readWatchlist().map(normalizeTitle));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlistItems));
  }, [watchlistItems]);

  useEffect(() => {
    function syncItems() {
      setWatchlistItems(readWatchlist().map(normalizeTitle));
    }

    window.addEventListener('storage', syncItems);
    window.addEventListener('watchlist-updated', syncItems);

    return () => {
      window.removeEventListener('storage', syncItems);
      window.removeEventListener('watchlist-updated', syncItems);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadDetails() {
      setError('');

      try {
        const data = await fetchDetails(contentId, mediaType);
        setDetails(data);
      } catch (requestError) {
        setDetails(null);
        setError(requestError.message || API_KEY_ERROR);
      }
    }

    loadDetails();
  }, [isOpen, contentId, mediaType]);

  useEffect(() => {
    if (!isOpen || !details || mediaType !== 'tv' || activeTab !== 'Episodes') {
      return;
    }

    async function loadEpisodes() {
      try {
        const seasonData = await fetchSeasonEpisodes(contentId, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (requestError) {
        setEpisodes([]);
        setError(requestError.message || API_KEY_ERROR);
      }
    }

    loadEpisodes();
  }, [activeTab, contentId, details, isOpen, mediaType, selectedSeason]);

  if (!isOpen) {
    return null;
  }

  const trailerKey = getTrailerKey(details?.videos || []);
  const visibleTabs =
    mediaType === 'tv' ? ['Overview', 'Episodes', 'More Like This'] : ['Overview', 'More Like This'];

  function isInWatchlist(id) {
    return watchlistItems.some((item) => item.id === id);
  }

  function toggleWatchlist(item) {
    setWatchlistItems((previous) => {
      if (previous.some((savedItem) => savedItem.id === item.id)) {
        return previous.filter((savedItem) => savedItem.id !== item.id);
      }

      return [...previous, normalizeTitle(item)];
    });

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('watchlist-updated'));
    }, 0);
  }

  return (
    <div className="detail-backdrop" onClick={onClose} role="presentation">
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        {details ? (
          <>
            <div className="detail-hero">
              <img
                src={
                  details.backdrop_path
                    ? getImageUrl(details.backdrop_path, 'original')
                    : details.backdropUrl
                }
                alt={details.title}
              />
              {trailerKey ? (
                <iframe
                  className="detail-trailer"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1`}
                  title={`${details.title} trailer`}
                  allow="autoplay; encrypted-media"
                />
              ) : null}
              <div className="detail-hero-overlay" />
              <button className="detail-close" onClick={onClose}>
                ✕
              </button>

              <div className="detail-hero-content">
                <h2>{details.title}</h2>
                <div className="detail-primary-actions">
                  <Link to={`/watch/${details.id}?type=${mediaType}`} className="play-button">
                    ▶ Play
                  </Link>
                  <button className="round-action" onClick={() => toggleWatchlist(details)}>
                    {isInWatchlist(details.id) ? '✓' : '+'}
                  </button>
                  <button className="round-action">👍</button>
                  <button className="round-action">👎</button>
                </div>

                <div className="detail-meta-line">
                  <span className="match-score">{details.matchScore}% Match</span>
                  <span>{details.year}</span>
                  <span className="age-badge">16+</span>
                  <span>{details.runtimeLabel}</span>
                  <span className="hd-badge">HD</span>
                </div>
              </div>
            </div>

            <div className="detail-tabs">
              {visibleTabs.map((tab) => (
                <button
                  key={tab}
                  className={`detail-tab ${activeTab === tab ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Overview' ? (
              <div className="detail-body">
                <div>
                  <p>{details.overview}</p>
                  <p>
                    <strong>Cast:</strong>{' '}
                    {details.cast.slice(0, 8).map((actor) => actor.name).join(', ')}
                  </p>
                </div>

                <aside>
                  <p>
                    <strong>Genres:</strong>{' '}
                    {details.genresDetailed.map((genre) => genre.name).join(', ')}
                  </p>
                  <p>
                    <strong>Available In:</strong> HD, 4K UHD, Dolby
                  </p>
                  <p>
                    <strong>Director:</strong> Various
                  </p>
                </aside>
              </div>
            ) : null}

            {activeTab === 'Episodes' && mediaType === 'tv' ? (
              <div className="episodes-panel">
                <select
                  value={selectedSeason}
                  onChange={(event) => setSelectedSeason(Number(event.target.value))}
                >
                  {Array.from({ length: details.number_of_seasons || 1 }).map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Season {index + 1}
                    </option>
                  ))}
                </select>

                <div className="episodes-list">
                  {episodes.map((episode) => (
                    <article key={episode.id} className="episode-row">
                      <img src={getImageUrl(episode.still_path, 'w500')} alt={episode.name} />
                      <div>
                        <strong>{episode.name}</strong>
                        <p>{episode.overview || 'Episode details are not available yet.'}</p>
                      </div>
                      <span>⬇</span>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'More Like This' ? (
              <div className="detail-similar-grid">
                {details.similar.slice(0, 6).map((item) => (
                  <article key={item.id} className="similar-card">
                    <img src={item.backdropUrl} alt={item.title} />
                    <strong>{item.title}</strong>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        ) : error ? (
          <div className="detail-loading">{error}</div>
        ) : (
          <div className="detail-loading">Loading...</div>
        )}
      </div>
    </div>
  );
}
