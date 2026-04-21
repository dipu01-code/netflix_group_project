import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getMovieDetail, getTVDetail, getPersonDetail, imgUrl } from '../api/tmdb';
import './MovieDetailModal.css';

/* ── Skeleton while loading ─────────────────────────────────── */
function ModalSkeleton() {
  return (
    <div className="modal-skeleton">
      <div className="sk-bar" style={{ width: '60%', height: 28 }} />
      <div className="sk-bar" style={{ width: '40%' }} />
      <div className="sk-bar" style={{ width: '100%', height: 80 }} />
      <div className="sk-bar" style={{ width: '80%' }} />
      <div className="sk-bar" style={{ width: '55%' }} />
    </div>
  );
}

/* ── Cast row ───────────────────────────────────────────────── */
function CastRow({ cast = [] }) {
  if (!cast.length) return null;
  const top = cast.slice(0, 12);
  return (
    <>
      <h3 className="modal-section-title">Cast</h3>
      <div className="cast-scroll">
        {top.map(member => (
          <div key={member.credit_id} className="cast-card">
            {member.profile_path
              ? <img src={imgUrl(member.profile_path, 'w185')} alt={member.name} loading="lazy" />
              : <div className="cast-card__avatar-placeholder">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>}
            <p className="cast-card__name">{member.name}</p>
            {member.character && <p className="cast-card__char">{member.character}</p>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Similar titles ─────────────────────────────────────────── */
function SimilarRow({ items = [], onSelect }) {
  if (!items.length) return null;
  const top = items.slice(0, 6);
  return (
    <>
      <h3 className="modal-section-title">More Like This</h3>
      <div className="similar-grid">
        {top.map(item => (
          <div key={item.id} className="similar-card" onClick={() => onSelect(item)}
               role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onSelect(item)}>
            {(item.backdrop_path || item.poster_path)
              ? <img src={imgUrl(item.backdrop_path || item.poster_path, 'w500')} alt={item.title || item.name} loading="lazy" />
              : <div style={{ aspect:'16/9', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', color:'#666', padding:'8px', fontSize:'0.75rem' }}>
                  {item.title || item.name}
                </div>}
            <div className="similar-card__info">
              <p className="similar-card__title">{item.title || item.name}</p>
              {item.overview && <p className="similar-card__overview">{item.overview}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Person modal content ───────────────────────────────────── */
function PersonContent({ data, onSelectCredit }) {
  const credits = data.combined_credits?.cast?.slice(0, 12) || [];
  return (
    <>
      <div className="person-modal-hero">
        {data.profile_path
          ? <img className="person-modal-avatar" src={imgUrl(data.profile_path, 'w185')} alt={data.name} />
          : <div className="person-modal-avatar-placeholder">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>}
        <div className="person-modal-info">
          <h2>{data.name}</h2>
          {data.known_for_department && <span className="dept-badge">{data.known_for_department}</span>}
          {data.biography
            ? <p className="person-modal-bio">{data.biography}</p>
            : <p className="person-modal-bio" style={{ fontStyle:'italic' }}>No biography available.</p>}
        </div>
      </div>
      {credits.length > 0 && (
        <div className="modal-body">
          <h3 className="modal-section-title">Known For</h3>
          <div className="similar-grid">
            {credits.map(item => (
              <div key={`${item.id}-${item.credit_id}`} className="similar-card"
                   onClick={() => onSelectCredit({ ...item, media_type: item.media_type })}
                   role="button" tabIndex={0}>
                {(item.backdrop_path || item.poster_path)
                  ? <img src={imgUrl(item.backdrop_path || item.poster_path, 'w500')} alt={item.title || item.name} loading="lazy" />
                  : <div style={{ aspectRatio:'16/9', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', color:'#777', fontSize:'0.75rem', padding:'8px' }}>
                      {item.title || item.name}
                    </div>}
                <div className="similar-card__info">
                  <p className="similar-card__title">{item.title || item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Movie / TV modal content ───────────────────────────────── */
function MediaContent({ data, type, onPlay, onSelectSimilar }) {
  const backdrop = imgUrl(data.backdrop_path, 'original');
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const runtime = type === 'movie'
    ? data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null
    : null;
  const seasons = type === 'tv'
    ? data.number_of_seasons ? `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}` : null
    : null;

  const cast    = data.credits?.cast || [];
  const similar = data.similar?.results || [];
  const genres  = data.genres || [];
  const director = data.credits?.crew?.find(c => c.job === 'Director');

  const votePercent = data.vote_average ? Math.round(data.vote_average * 10) : null;

  return (
    <>
      {/* Hero */}
      <div className="modal-hero">
        {backdrop
          ? <img src={backdrop} alt={data.title || data.name} />
          : <div style={{ width:'100%', height:'100%', background:'#222' }} />}
        <div className="modal-hero__gradient" />
        <div className="modal-hero__play">
          <button className="btn-play-hero" onClick={() => onPlay(data)} id="modal-play-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Play
          </button>
          <button className="btn-more-info" id="modal-more-info-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            More Info
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="modal-body">
        <h2 style={{ fontSize:'1.6rem', fontWeight:700, marginBottom:'var(--space-sm)' }}>
          {data.title || data.name}
        </h2>

        <div className="modal-info-row">
          {votePercent && <span className="modal-match">{votePercent}% Match</span>}
          {year && <span className="modal-year">{year}</span>}
          {runtime  && <span className="modal-runtime">{runtime}</span>}
          {seasons  && <span className="modal-seasons">{seasons}</span>}
          <span className="modal-hd">HD</span>
        </div>

        <div className="modal-columns">
          <p className="modal-overview">{data.overview || 'No overview available.'}</p>
          <div className="modal-meta-list">
            {genres.length > 0 && (
              <div className="modal-meta-item">
                <strong>Genres: </strong>{genres.map(g => g.name).join(', ')}
              </div>
            )}
            {director && (
              <div className="modal-meta-item">
                <strong>Director: </strong>{director.name}
              </div>
            )}
            {data.status && (
              <div className="modal-meta-item">
                <strong>Status: </strong>{data.status}
              </div>
            )}
            {data.original_language && (
              <div className="modal-meta-item">
                <strong>Language: </strong>{data.original_language.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {genres.length > 0 && (
          <div className="genre-tags">
            {genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
          </div>
        )}

        <CastRow cast={cast} />
        <SimilarRow items={similar} onSelect={onSelectSimilar} />
      </div>
    </>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function MovieDetailModal({ item, onClose, onPlayVideo }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [current, setCurrent] = useState(item);

  const load = useCallback((it) => {
    if (!it) return;
    setLoading(true);
    setError(null);
    setData(null);
    const type = it.media_type;
    const fetcher =
      type === 'movie'  ? getMovieDetail  :
      type === 'tv'     ? getTVDetail     :
      type === 'person' ? getPersonDetail :
      getMovieDetail;

    fetcher(it.id)
      .then(d => setData(d))
      .catch(() => setError('Failed to load details.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(current); }, [current, load]);

  /* close on backdrop click */
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePlay = (d) => {
    const trailer = d.videos?.results?.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    onPlayVideo?.(trailer ? `https://www.youtube.com/embed/${trailer.key}` : null, d);
  };

  const handleSelectSimilar = (it) => {
    setCurrent({ ...it, media_type: current.media_type });
  };

  const handleSelectCredit = (it) => {
    setCurrent(it);
  };

  const type = current?.media_type;

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Detail modal">
      <div className="modal-box" id="detail-modal">
        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Close modal" id="modal-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {loading && <ModalSkeleton />}
        {error   && <div style={{ padding:'var(--space-xl)', color:'var(--netflix-red)' }}>{error}</div>}

        {!loading && !error && data && (
          type === 'person'
            ? <PersonContent data={data} onSelectCredit={handleSelectCredit} />
            : <MediaContent  data={data} type={type} onPlay={handlePlay} onSelectSimilar={handleSelectSimilar} />
        )}
      </div>
    </div>,
    document.body
  );
}
