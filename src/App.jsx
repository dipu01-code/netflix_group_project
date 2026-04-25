import { useEffect, useState } from 'react';
import LandingPage from './Member_1/LandingPage';
import Navbar from './Member_2/Navbar';
import HeroBillboard from './Member_2/HeroBillboard';
import CategoryRow from './Member_2/CategoryRow';
import GenrePage from './Member_2/GenrePage';
import MyList from './Member_2/MyList';
import SearchPage from './Member_3/SearchPage';
import VideoPlayer from './Member_3/VideoPlayer';
import { fetchDetails, getTrailerKey, normalizeTitle, tmdbFetch } from './Member_3/tmdbApi';

const rowConfigs = [
  { id: 'trending', title: 'Trending Now', path: '/trending/all/week' },
  { id: 'popular', title: 'Popular on Netflix', path: '/movie/popular' },
  { id: 'top-rated', title: 'Top Rated', path: '/movie/top_rated' },
  { id: 'action', title: 'Action Thrillers', path: '/discover/movie', params: { with_genres: '28,53' } },
  { id: 'comedy', title: 'Comedies', path: '/discover/movie', params: { with_genres: '35' } },
  { id: 'scifi', title: 'Sci-Fi & Fantasy', path: '/discover/movie', params: { with_genres: '878,14' } },
  { id: 'docs', title: 'Documentaries', path: '/discover/movie', params: { with_genres: '99' } },
  { id: 'romance', title: 'Romance', path: '/discover/movie', params: { with_genres: '10749' } },
  { id: 'horror', title: 'Horror', path: '/discover/movie', params: { with_genres: '27' } },
  { id: 'anime', title: 'Anime', path: '/discover/tv', params: { with_genres: '16', with_origin_country: 'JP' } },
  { id: 'originals', title: 'Netflix Originals', path: '/discover/tv', params: { with_networks: '213' } },
];

const STORAGE_KEY = 'netflix-clone-watchlist';

function readWatchlist() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch {
    return [];
  }
}

function BrowseLayout() {
  const [rows, setRows] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
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
    let ignore = false;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const rowResults = await Promise.all(
          rowConfigs.map(async (row) => {
            const data = await tmdbFetch(row.path, row.params);
            return {
              id: row.id,
              title: row.title,
              items: (data.results || []).slice(0, 18).map(normalizeTitle),
            };
          })
        );

        const featuredIds = rowResults[0]?.items.slice(0, 5) || [];
        const featuredItems = await Promise.all(
          featuredIds.map(async (item) => {
            const details = await fetchDetails(item.id, item.media_type);
            return {
              ...details,
              trailerKey: getTrailerKey(details.videos),
            };
          })
        );

        if (!ignore) {
          setRows(rowResults);
          setFeatured(featuredItems);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Unable to load TMDB content right now.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="page page-browse">
      <Navbar />
      <HeroBillboard items={featured} loading={loading} />
      <main className="browse-shell">
        {watchlistItems.length > 0 ? (
          <CategoryRow
            title="My List"
            items={watchlistItems}
            isWatchlistRow
          />
        ) : null}
        {rows.map((row) => (
          <CategoryRow key={row.id} title={row.title} items={row.items} />
        ))}
        {error ? <div className="page-error">{error}</div> : null}
      </main>
    </div>
  );
}

export default function App() {
  const pathname = window.location.pathname;

  if (pathname === '/browse') {
    return <BrowseLayout />;
  }

  if (pathname.startsWith('/genre/')) {
    return <GenrePage />;
  }

  if (pathname === '/mylist') {
    return <MyList />;
  }

  if (pathname === '/search') {
    return <SearchPage />;
  }

  if (pathname.startsWith('/watch/')) {
    return <VideoPlayer />;
  }

  return <LandingPage />;
}
