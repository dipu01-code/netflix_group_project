import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import MovieCard from './MovieCard';
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

export default function MyList() {
  const [items, setItems] = useState(() => readWatchlist().map(normalizeTitle));

  useEffect(() => {
    function syncItems() {
      setItems(readWatchlist().map(normalizeTitle));
    }

    window.addEventListener('storage', syncItems);
    window.addEventListener('watchlist-updated', syncItems);

    return () => {
      window.removeEventListener('storage', syncItems);
      window.removeEventListener('watchlist-updated', syncItems);
    };
  }, []);

  return (
    <div className="page page-browse">
      <Navbar />
      <section className="my-list-page">
        <h1>My List</h1>
        {items.length === 0 ? (
          <p className="my-list-empty">Your watchlist is empty. Add titles from the browse page.</p>
        ) : (
          <div className="my-list-grid">
            {items.map((item) => (
              <MovieCard key={`watchlist-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
