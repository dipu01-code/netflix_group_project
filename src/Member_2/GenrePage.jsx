import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import CategoryRow from './CategoryRow';
import { API_KEY_ERROR, normalizeTitle, tmdbFetch } from '../Member_3/tmdbApi';
import './member2.css';

const tabs = [
  { label: 'All', genres: '' },
  { label: 'Action', genres: '28' },
  { label: 'Comedy', genres: '35' },
  { label: 'Drama', genres: '18' },
  { label: 'Romance', genres: '10749' },
  { label: 'Horror', genres: '27' },
  { label: 'Documentary', genres: '99' },
];

export default function GenrePage() {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [genreName, setGenreName] = useState('genre');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    setGenreName(pathParts[pathParts.length - 1] || 'genre');
  }, []);

  useEffect(() => {
    async function loadItems() {
      setError('');

      try {
        const selectedTab = tabs.find((tab) => tab.label === activeTab);
        const data = await tmdbFetch('/discover/movie', {
          with_genres: selectedTab?.genres || '',
          sort_by: 'popularity.desc',
        });
        setItems((data.results || []).map(normalizeTitle));
      } catch (requestError) {
        setItems([]);
        setError(requestError.message || API_KEY_ERROR);
      }
    }

    loadItems();
  }, [activeTab, genreName]);

  return (
    <div className="page page-browse">
      <Navbar />
      <section className="genre-page-header">
        <h1>{genreName.replace('-', ' ')}</h1>
        <div className="genre-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`genre-tab ${activeTab === tab.label ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>
      {error ? <div className="page-error">{error}</div> : null}
      <CategoryRow title="Filtered Picks" items={items} />
    </div>
  );
}
