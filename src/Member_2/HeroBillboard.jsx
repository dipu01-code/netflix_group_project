import { useEffect, useState } from 'react';
import DetailModal from '../Member_3/DetailModal';
import { getImageUrl } from '../Member_3/tmdbApi';
import './member2.css';

export default function HeroBillboard({ items, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmbeddedTrailer, setShowEmbeddedTrailer] = useState(true);

  useEffect(() => {
    if (!items.length) {
      return undefined;
    }

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % items.length);
    }, 8000);

    return () => window.clearInterval(rotationTimer);
  }, [items]);

  useEffect(() => {
    setShowTrailer(false);
    setShowEmbeddedTrailer(true);
    const trailerTimer = window.setTimeout(() => setShowTrailer(true), 3000);
    return () => window.clearTimeout(trailerTimer);
  }, [activeIndex]);

  const activeItem = items[activeIndex];

  if (loading || !activeItem) {
    return <section className="billboard billboard-loading" />;
  }

  const genres = activeItem.genresDetailed?.slice(0, 3).map((genre) => genre.name)
    || activeItem.genreNames?.slice(0, 3)
    || [];

  return (
    <section className="billboard">
      <div className="billboard-background">
        <img
          src={
            activeItem.backdrop_path
              ? getImageUrl(activeItem.backdrop_path, 'original')
              : activeItem.backdropUrl
          }
          alt={activeItem.title}
        />
        <div className="billboard-gradient" />

        {showTrailer && activeItem.demoVideoUrl ? (
          <video
            className="billboard-trailer"
            src={activeItem.demoVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
        ) : null}

        {showTrailer && !activeItem.demoVideoUrl && showEmbeddedTrailer && activeItem.trailerKey ? (
          <iframe
            className="billboard-trailer"
            src={`https://www.youtube.com/embed/${activeItem.trailerKey}?autoplay=1&mute=${
              isMuted ? 1 : 0
            }&controls=0&loop=1&playlist=${activeItem.trailerKey}&modestbranding=1&playsinline=1`}
            title={`${activeItem.title} trailer`}
            allow="autoplay; encrypted-media"
            onError={() => setShowEmbeddedTrailer(false)}
          />
        ) : null}
      </div>

      <div className="billboard-content">
        {activeItem.logoPath ? (
          <img className="billboard-logo" src={activeItem.logoPath} alt={activeItem.title} />
        ) : (
          <h1>{activeItem.title}</h1>
        )}

        <div className="billboard-meta">
          {genres.map((genre) => (
            <span key={genre} className="genre-pill">
              {genre}
            </span>
          ))}
          <span>{Math.round(activeItem.vote_average || 8.4)}/10</span>
          <span>{activeItem.year}</span>
          <span>{activeItem.runtimeLabel}</span>
        </div>

        <p>{activeItem.overview}</p>

        <div className="billboard-actions">
          <a className="play-button" href={`/watch/${activeItem.id}?type=${activeItem.media_type}`}>
            ▶ Play
          </a>
          <button className="more-info-button" onClick={() => setIsModalOpen(true)}>
            ⓘ More Info
          </button>
        </div>
      </div>

      <button className="mute-button" onClick={() => setIsMuted((value) => !value)}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      <DetailModal
        isOpen={isModalOpen}
        contentId={activeItem.id}
        mediaType={activeItem.media_type}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
