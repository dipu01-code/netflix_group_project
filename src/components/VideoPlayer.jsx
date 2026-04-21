import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './VideoPlayer.css';

/* ── Time formatter ─────────────────────────────────────────── */
function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

/* ── SVG icon helpers ───────────────────────────────────────── */
const IconPlay  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
const IconPause = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconVolumeHigh = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);
const IconVolumeMute = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);
const IconFullscreen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconSkipForward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
  </svg>
);
const IconSkipBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
  </svg>
);

/* ── No-source fallback ─────────────────────────────────────── */
function NoSourceFallback({ title, onClose }) {
  return (
    <div className="player-no-source">
      <svg width="90" height="90" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z" opacity="0"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
      <h3>No Trailer Available</h3>
      <p>
        A trailer for <strong>{title}</strong> couldn't be found on YouTube.
        Try visiting TMDB directly for more options.
      </p>
      <button className="btn-back-home" onClick={onClose}>Go Back</button>
    </div>
  );
}

/* ── Main VideoPlayer ────────────────────────────────────────── */
export default function VideoPlayer({ src, title, onClose }) {
  const videoRef    = useRef(null);
  const containerRef = useRef(null);
  const hideTimer   = useRef(null);

  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [volume,   setVolume]   = useState(1);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [ctrlVisible, setCtrlVisible] = useState(true);

  const isYouTube = src && src.includes('youtube.com');
  const hasSource = Boolean(src);

  /* Close on Escape */
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Auto-hide controls after 3s inactivity (only for native video) */
  const resetHideTimer = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    if (!isYouTube) {
      hideTimer.current = setTimeout(() => setCtrlVisible(false), 3000);
    }
  }, [isYouTube]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [resetHideTimer]);

  /* ── Native video helpers ── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };

  const skip = (delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v) setCurrent(v.currentTime);
  };

  const handleLoaded = () => {
    const v = videoRef.current;
    if (v) { setDuration(v.duration); v.play(); setPlaying(true); }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (v) v.currentTime = Number(e.target.value);
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) { videoRef.current.volume = val; }
    setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return createPortal(
    <div
      className="player-backdrop"
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      id="video-player"
    >
      {/* Top bar */}
      <div className={`player-topbar${isYouTube || !ctrlVisible ? '' : ''}`}>
        <button className="player-back-btn" onClick={onClose} id="player-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        {title && <span className="player-title">{title}</span>}
      </div>

      {/* Video area */}
      <div className="player-video-wrap">
        {!hasSource && <NoSourceFallback title={title} onClose={onClose} />}

        {hasSource && isYouTube && (
          <iframe
            className="player-iframe"
            src={`${src}?autoplay=1&rel=0&modestbranding=1`}
            title={title || 'Trailer'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {hasSource && !isYouTube && (
          <>
            <video
              ref={videoRef}
              className="player-video-el"
              src={src}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoaded}
              onEnded={() => setPlaying(false)}
              onClick={togglePlay}
            />

            {/* Custom controls for native video */}
            <div className={`player-controls${ctrlVisible ? '' : ' hidden'}`}>
              <input
                type="range"
                className="player-progress"
                min={0}
                max={duration || 100}
                step={0.1}
                value={current}
                onChange={handleSeek}
                aria-label="Seek"
              />
              <div className="player-controls-row">
                <button className="ctrl-btn" onClick={() => skip(-10)} aria-label="Rewind 10s" id="player-skip-back">
                  <IconSkipBack />
                </button>
                <button className="ctrl-btn ctrl-btn--lg" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} id="player-play-pause">
                  {playing ? <IconPause /> : <IconPlay />}
                </button>
                <button className="ctrl-btn" onClick={() => skip(10)} aria-label="Forward 10s" id="player-skip-fwd">
                  <IconSkipForward />
                </button>

                <span className="player-time">{fmtTime(current)} / {fmtTime(duration)}</span>

                <span className="player-title-small">{title}</span>

                <div className="volume-wrap">
                  <button className="ctrl-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} id="player-mute">
                    {muted || volume === 0 ? <IconVolumeMute /> : <IconVolumeHigh />}
                  </button>
                  <input
                    type="range"
                    className="volume-slider"
                    min={0} max={1} step={0.01}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    aria-label="Volume"
                  />
                </div>

                <button className="ctrl-btn" onClick={toggleFullscreen} aria-label="Fullscreen" id="player-fullscreen">
                  <IconFullscreen />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
