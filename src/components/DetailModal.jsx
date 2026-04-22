import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getMovieDetail,
  getTVDetail,
  getTVSeason,
  imgUrl,
} from '../api/tmdb';
import './DetailModal.css';

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const fmtRuntime = (min) => {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getYear = (data) =>
  (data?.release_date || data?.first_air_date || '').slice(0, 4);

const getTrailerKey = (videos) => {
  const list = videos?.results || [];
  return (
    list.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    list.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
    list.find((v) => v.site === 'YouTube')
  )?.key || null;
};

const getMatchPct = (vote) =>
  vote ? `${Math.round(vote * 10)}% Match` : null;

/* ════════════════════════════════════════════════════════════
   SVG icons (self-contained, no external lib needed)
   ════════════════════════════════════════════════════════════ */
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconThumbUp = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const IconThumbDown = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ════════════════════════════════════════════════════════════
   Hero section — contains trailer iframe OR backdrop image,
   overlaid gradient, title strip, meta row, and action buttons.
   All positioned absolutely within the 16:9 aspect-ratio box.
   ════════════════════════════════════════════════════════════ */
function HeroSection({
  data,
  trailerKey,
  onClose,
  onPlay,
  inList,
  onListToggle,
  liked,
  disliked,
  onLike,
  onDislike,
  isTV,
}) {
  const backdropUrl = imgUrl(data?.backdrop_path, 'original');
  const title       = data?.title || data?.name || '';
  const year        = getYear(data);
  const match       = getMatchPct(data?.vote_average);
  const runtime     = data?.runtime ? fmtRuntime(data.runtime) : null;
  const ageRating   = data?.adult ? '18+' : 'PG-13';

  const iframeSrc = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&showinfo=0&modestbranding=1&enablejsapi=0`
    : null;

  return (
    <div className="dm-hero">
      {/* ── Background: autoplay muted trailer or backdrop ── */}
      {iframeSrc ? (
        <iframe
          className="dm-hero__iframe"
          src={iframeSrc}
          title="trailer"
          allow="autoplay"
          allowFullScreen={false}
        />
      ) : (
        backdropUrl && (
          <img
            className="dm-hero__backdrop"
            src={backdropUrl}
            alt={title}
          />
        )
      )}

      {/* Gradient overlay — fades bottom of hero into card bg */}
      <div className="dm-hero__gradient" />

      {/* ✕ Close button — top-right */}
      <button
        className="dm-close"
        onClick={onClose}
        aria-label="Close"
        id="dm-close-btn"
      >
        <IconClose />
      </button>

      {/* ── Bottom overlay: title + meta + action buttons ── */}
      <div className="dm-hero__bottom">
        {/* Title */}
        {title && <h2 className="dm-hero__title">{title}</h2>}

        {/* Meta row: match %, year, age badge, runtime, HD badge */}
        <div className="dm-hero__meta">
          {match   && <span className="dm-match">{match}</span>}
          {year    && <span className="dm-year">{year}</span>}
          <span className="dm-badge">{ageRating}</span>
          {runtime && <span className="dm-runtime">{runtime}</span>}
          {isTV && data?.number_of_seasons > 0 && (
            <span className="dm-runtime">
              {data.number_of_seasons} Season{data.number_of_seasons > 1 ? 's' : ''}
            </span>
          )}
          <span className="dm-badge dm-badge--hd">HD</span>
        </div>

        {/* Action buttons row */}
        <div className="dm-hero__actions">
          {/* ▶ Play */}
          <button
            className="dm-btn-play"
            onClick={onPlay}
            id="dm-play-btn"
          >
            <IconPlay /> Play
          </button>

          {/* + My List */}
          <button
            className={`dm-btn-circle${inList ? ' active' : ''}`}
            onClick={onListToggle}
            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
            id="dm-list-btn"
          >
            {inList ? <IconCheck /> : <IconPlus />}
            <span className="dm-tooltip">
              {inList ? 'Remove from List' : 'Add to My List'}
            </span>
          </button>

          {/* 👍 */}
          <button
            className={`dm-btn-circle${liked ? ' active' : ''}`}
            onClick={onLike}
            aria-label="I like this"
            id="dm-like-btn"
          >
            <IconThumbUp />
            <span className="dm-tooltip">I like this</span>
          </button>

          {/* 👎 */}
          <button
            className={`dm-btn-circle${disliked ? ' active' : ''}`}
            onClick={onDislike}
            aria-label="Not for me"
            id="dm-dislike-btn"
          >
            <IconThumbDown />
            <span className="dm-tooltip">Not for me</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Tab bar — animated underline indicator
   ════════════════════════════════════════════════════════════ */
const TABS_MOVIE = ['Overview', 'More Like This'];
const TABS_TV    = ['Overview', 'Episodes', 'More Like This'];

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="dm-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={active === t}
          className={`dm-tab${active === t ? ' active' : ''}`}
          onClick={() => onChange(t)}
          id={`dm-tab-${t.toLowerCase().replace(/\s/g, '-')}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Overview tab — two-column layout (65% / 35%)
   Left:  overview paragraph + cast
   Right: genres pills, availability, director, status, language
   ════════════════════════════════════════════════════════════ */
function OverviewTab({ data }) {
  const cast     = (data?.credits?.cast || []).slice(0, 8).map((c) => c.name).join(', ');
  const genres   = data?.genres || [];
  const director = data?.credits?.crew?.find((c) => c.job === 'Director');

  return (
    <div className="dm-tab-body">
      <div className="dm-two-col">
        {/* ── Left 65% ── */}
        <div>
          <p className="dm-overview-text">
            {data?.overview || 'No overview available.'}
          </p>
          {cast && (
            <p className="dm-label">
              <strong>Cast: </strong>{cast}
            </p>
          )}
        </div>

        {/* ── Right 35% ── */}
        <div className="dm-right-col">
          {genres.length > 0 && (
            <div className="dm-right-item">
              <strong>Genres</strong>
              <div className="dm-genres">
                {genres.map((g) => (
                  <span key={g.id} className="dm-genre-pill">{g.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="dm-right-item">
            <strong>Available In</strong>
            <div className="dm-avail">
              {['HD', '4K UHD', 'Dolby Atmos'].map((tag) => (
                <span key={tag} className="dm-avail-tag">{tag}</span>
              ))}
            </div>
          </div>

          {director && (
            <div className="dm-right-item">
              <strong>Director: </strong>{director.name}
            </div>
          )}

          {data?.status && (
            <div className="dm-right-item">
              <strong>Status: </strong>{data.status}
            </div>
          )}

          {data?.original_language && (
            <div className="dm-right-item">
              <strong>Language: </strong>
              {data.original_language.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   More Like This tab — 3-column grid of related title cards
   Clicking a card drills into a new detail fetch for that title.
   ════════════════════════════════════════════════════════════ */
function MoreLikeThisTab({ similar = [], mediaType, onSelect }) {
  if (!similar.length) {
    return (
      <div className="dm-tab-body">
        <p className="dm-empty">No similar titles found.</p>
      </div>
    );
  }

  return (
    <div className="dm-tab-body">
      <div className="dm-similar-grid">
        {similar.slice(0, 9).map((item) => {
          const thumb = imgUrl(item.backdrop_path || item.poster_path, 'w500');
          const year  = (item.release_date || item.first_air_date || '').slice(0, 4);
          const match = item.vote_average
            ? `${Math.round(item.vote_average * 10)}%`
            : null;

          return (
            <div
              key={item.id}
              className="dm-sim-card"
              onClick={() => onSelect({ ...item, media_type: mediaType })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' && onSelect({ ...item, media_type: mediaType })
              }
            >
              <div className="dm-sim-card__thumb">
                {thumb
                  ? <img src={thumb} alt={item.title || item.name} loading="lazy" />
                  : <div className="no-thumb">{item.title || item.name}</div>}
                {match && (
                  <span className="dm-sim-card__rating">{match} Match</span>
                )}
              </div>
              <div className="dm-sim-card__info">
                <div className="dm-sim-card__head">
                  <p className="dm-sim-card__title">{item.title || item.name}</p>
                  {year && <span className="dm-sim-card__year">{year}</span>}
                </div>
                {item.overview && (
                  <p className="dm-sim-card__overview">{item.overview}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Episodes tab (TV only)
   — Season selector dropdown
   — Episode list with 120×68px thumbnail, title, runtime,
     description, and per-row download button
   — Skeleton while fetching season data
   ════════════════════════════════════════════════════════════ */
function EpisodesTab({ tvId, seasons = [] }) {
  const realSeasons = seasons.filter((s) => s.season_number > 0);
  const [seasonNum, setSeasonNum] = useState(
    realSeasons[0]?.season_number ?? 1
  );
  const [episodes, setEpisodes] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    getTVSeason(tvId, seasonNum)
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [tvId, seasonNum]);

  return (
    <div className="dm-tab-body">
      {/* Season selector */}
      <div className="dm-season-select-wrap">
        <span className="dm-season-label">Season</span>
        <select
          className="dm-season-select"
          value={seasonNum}
          onChange={(e) => setSeasonNum(Number(e.target.value))}
          aria-label="Select season"
          id="dm-season-select"
        >
          {realSeasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              Season {s.season_number}
            </option>
          ))}
        </select>
        {!loading && (
          <span className="dm-season-ep-count">
            {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="dm-ep-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="dm-ep-skel-row">
              <div className="dm-ep-skel-num" />
              <div className="dm-ep-skel-img" />
              <div className="dm-ep-skel-info">
                <div className="dm-ep-skel-bar" style={{ width: '60%' }} />
                <div className="dm-ep-skel-bar" style={{ width: '90%' }} />
                <div className="dm-ep-skel-bar" style={{ width: '75%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dm-episode-list">
          {episodes.map((ep, idx) => {
            const thumb = imgUrl(ep.still_path, 'w300');
            const rt    = ep.runtime ? `${ep.runtime}m` : null;

            return (
              <div
                key={ep.id}
                className="dm-episode"
                role="button"
                tabIndex={0}
              >
                {/* Episode number */}
                <span className="dm-ep-number">{idx + 1}</span>

                {/* 120×68 thumbnail */}
                <div className="dm-ep-thumb">
                  {thumb
                    ? <img src={thumb} alt={ep.name} loading="lazy" />
                    : (
                      <div className="no-thumb">
                        <svg
                          width="24" height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          opacity="0.3"
                        >
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    )}
                  <div className="dm-ep-play-icon">
                    <svg
                      width="28" height="28"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>

                {/* Episode info */}
                <div className="dm-ep-info">
                  <div className="dm-ep-head">
                    <span className="dm-ep-title">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </span>
                    <div className="dm-ep-actions">
                      {rt && <span className="dm-ep-runtime">{rt}</span>}
                      <button
                        className="dm-ep-download"
                        aria-label="Download episode"
                        onClick={(e) => e.stopPropagation()}
                        id={`dm-ep-download-${ep.id}`}
                      >
                        <IconDownload />
                      </button>
                    </div>
                  </div>
                  {ep.overview && (
                    <p className="dm-ep-desc">{ep.overview}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Skeleton shown while the main modal data is loading
   ════════════════════════════════════════════════════════════ */
function ModalLoadingSkeleton() {
  return (
    <>
      <div className="dm-hero-skeleton" />
      <div className="dm-body-skeleton">
        {[70, 45, 100, 80, 55].map((w, i) => (
          <div
            key={i}
            className="dm-skel-bar"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Main export — DetailModal
   Props:
     item        – TMDB item object (must have .id and .media_type)
     onClose     – callback to close the modal
     onPlayVideo – callback(youtubeSrc, data) to open VideoPlayer
   ════════════════════════════════════════════════════════════ */
export default function DetailModal({ item, onClose, onPlayVideo }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* Interactive state */
  const [inList,    setInList]    = useState(false);
  const [liked,     setLiked]     = useState(false);
  const [disliked,  setDisliked]  = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  /* Track "current" item — starts as the prop, can be replaced via
     More Like This drill-down */
  const [current, setCurrent] = useState(item);

  /* Ref to the scrollable card — used to reset scroll on drill-down */
  const overlayRef = useRef(null);

  const isTV = current?.media_type === 'tv';
  const tabs = isTV ? TABS_TV : TABS_MOVIE;

  /* ── Fetch detail whenever current item changes ── */
  const load = useCallback((it) => {
    if (!it) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveTab('Overview');
    const fetcher = it.media_type === 'tv' ? getTVDetail : getMovieDetail;
    fetcher(it.id)
      .then((d) => setData(d))
      .catch(() =>
        setError('Could not load details. Please check your TMDB API key.')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(current);
  }, [current, load]);

  /* ── Keyboard: Escape closes; body scroll lock ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  /* ── Click outside card to close ── */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* ── Play button → open VideoPlayer with YouTube embed ── */
  const handlePlay = () => {
    if (!data) return;
    const key = getTrailerKey(data.videos);
    const src = key
      ? `https://www.youtube.com/embed/${key}`
      : null;
    onPlayVideo?.(src, data);
  };

  /* ── Like / dislike (mutually exclusive) ── */
  const handleLike    = () => { setLiked((p) => !p); setDisliked(false); };
  const handleDislike = () => { setDisliked((p) => !p); setLiked(false); };

  /* ── More Like This card click ── */
  const handleSelectSimilar = (it) => {
    setCurrent(it);
    /* Scroll the overlay back to top so the hero is visible */
    overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Derived values ── */
  const trailerKey = data ? getTrailerKey(data.videos) : null;
  const seasons    = data?.seasons || [];
  const similar    = data?.similar?.results || [];

  return createPortal(
    <div
      className="dm-overlay"
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Title detail"
      id="detail-modal-overlay"
    >
      <div className="dm-card" id="detail-modal-card">

        {/* ── Loading skeleton ── */}
        {loading && <ModalLoadingSkeleton />}

        {/* ── Error state ── */}
        {error && !loading && (
          <div
            style={{
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              color: 'var(--netflix-red)',
            }}
          >
            <p style={{ marginBottom: 12 }}>{error}</p>
            <button
              style={{
                padding: '8px 20px',
                background: 'var(--netflix-red)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'var(--font-netflix)',
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && data && (
          <>
            {/* ── Hero: trailer/backdrop + title + meta + actions ── */}
            <HeroSection
              data={data}
              trailerKey={trailerKey}
              onClose={onClose}
              onPlay={handlePlay}
              inList={inList}
              onListToggle={() => setInList((p) => !p)}
              liked={liked}
              disliked={disliked}
              onLike={handleLike}
              onDislike={handleDislike}
              isTV={isTV}
            />

            {/* ── Tab bar ── */}
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {/* ── Tab bodies ── */}
            {activeTab === 'Overview' && (
              <OverviewTab data={data} />
            )}

            {activeTab === 'Episodes' && isTV && (
              <EpisodesTab tvId={current.id} seasons={seasons} />
            )}

            {activeTab === 'More Like This' && (
              <MoreLikeThisTab
                similar={similar}
                mediaType={current.media_type}
                onSelect={handleSelectSimilar}
              />
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
