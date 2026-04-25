import { useEffect, useState } from 'react';
import DetailModal from '../Member_3/DetailModal';
import { normalizeTitle } from '../Member_3/tmdbApi';
import './member2.css';

const STORAGE_KEY = 'netflix-clone-watchlist';

function readWatchlist() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch {
    return [];
  }
}

export default function MovieCard({ item }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandDirection, setExpandDirection] = useState('center');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardElement, setCardElement] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState(() => readWatchlist().map(normalizeTitle));

  useEffect(() => {
    return () => window.clearTimeout(hoverTimer);
  }, [hoverTimer]);

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

  const cardClassName = `movie-card ${isExpanded ? `is-expanded expand-${expandDirection}` : ''}`;

  function handleMouseEnter() {
    const timerId = window.setTimeout(() => {
      if (!cardElement) {
        return;
      }

      const bounds = cardElement.getBoundingClientRect();

      if (bounds.left < 120) {
        setExpandDirection('right');
      } else if (window.innerWidth - bounds.right < 120) {
        setExpandDirection('left');
      } else {
        setExpandDirection('center');
      }

      setIsExpanded(true);
    }, 400);

    setHoverTimer(timerId);
  }

  function handleMouseLeave() {
    window.clearTimeout(hoverTimer);
    setIsExpanded(false);
  }

  function isInWatchlist(id) {
    return watchlistItems.some((savedItem) => savedItem.id === id);
  }

  function toggleWatchlist(nextItem) {
    setWatchlistItems((previous) => {
      if (previous.some((savedItem) => savedItem.id === nextItem.id)) {
        return previous.filter((savedItem) => savedItem.id !== nextItem.id);
      }

      return [...previous, normalizeTitle(nextItem)];
    });

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('watchlist-updated'));
    }, 0);
  }

  return (
    <>
      <article
        ref={setCardElement}
        className={cardClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={item.backdropUrl} alt={item.title} />

        {isExpanded ? (
          <div className="movie-card-expanded">
            <img src={item.backdropUrl} alt={item.title} />
            <div className="movie-card-body">
              <h3>{item.title}</h3>
              <div className="movie-card-meta">
                <span className="match-score">{item.matchScore}% Match</span>
                <span>{item.year}</span>
                <span>{item.runtimeLabel}</span>
                <span className="hd-badge">HD</span>
              </div>

              <div className="movie-card-actions">
                <a href={`/watch/${item.id}?type=${item.media_type}`} className="round-action">
                  ▶
                </a>
                <button
                  className="round-action"
                  onClick={() => toggleWatchlist(item)}
                >
                  {isInWatchlist(item.id) ? '✓' : '+'}
                </button>
                <button className="round-action">👍</button>
                <button className="round-action">👎</button>
                <button className="round-action" onClick={() => setIsModalOpen(true)}>
                  ⌄
                </button>
              </div>

              <div className="movie-card-tags">
                {item.genreNames.slice(0, 3).map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </article>

      <DetailModal
        isOpen={isModalOpen}
        contentId={item.id}
        mediaType={item.media_type}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
