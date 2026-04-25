import { useState } from 'react';
import MovieCard from './MovieCard';
import './member2.css';

export default function CategoryRow({ title, items, isWatchlistRow = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rowElement, setRowElement] = useState(null);

  function scrollRow(direction) {
    if (!rowElement) {
      return;
    }

    rowElement.scrollBy({
      left: direction === 'left' ? -920 : 920,
      behavior: 'smooth',
    });
  }

  return (
    <section
      className="category-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2>{title}</h2>

      <div className="row-shell">
        {isHovered ? (
          <>
            <button className="row-arrow left" onClick={() => scrollRow('left')}>
              ‹
            </button>
            <button className="row-arrow right" onClick={() => scrollRow('right')}>
              ›
            </button>
          </>
        ) : null}

        <div className="row-track" ref={setRowElement}>
          {items.map((item) => (
            <MovieCard key={`${title}-${item.id}`} item={item} isWatchlistRow={isWatchlistRow} />
          ))}
        </div>
      </div>
    </section>
  );
}
