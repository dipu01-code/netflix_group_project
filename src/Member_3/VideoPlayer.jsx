import { useEffect, useState } from 'react';
import { API_KEY_ERROR, fetchDetails, getTrailerKey } from './tmdbApi';
import './member3.css';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function VideoPlayer() {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(900);
  const [showControls, setShowControls] = useState(true);
  const [toast, setToast] = useState('');
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [playerContainerElement, setPlayerContainerElement] = useState(null);
  const [playerInstance, setPlayerInstance] = useState(null);
  const [nativeVideoElement, setNativeVideoElement] = useState(null);
  const [contentId, setContentId] = useState('');
  const [mediaType, setMediaType] = useState('movie');

  const trailerKey = getTrailerKey(details?.videos || []);
  const demoVideoUrl = details?.demoVideoUrl || '';
  const usingNativeVideo = Boolean(demoVideoUrl);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const nextId = pathParts[pathParts.length - 1] || '';
    const nextParams = new URLSearchParams(window.location.search);

    setContentId(nextId);
    setMediaType(nextParams.get('type') || 'movie');
  }, []);

  useEffect(() => {
    async function loadDetails() {
      if (!contentId) {
        return;
      }

      setError('');

      try {
        const data = await fetchDetails(contentId, mediaType);
        setDetails(data);
        setProgress(0);
        setShowNextEpisode(false);
      } catch (requestError) {
        setDetails(null);
        setError(requestError.message || API_KEY_ERROR);
      }
    }

    loadDetails();
  }, [contentId, mediaType]);

  useEffect(() => {
    if (usingNativeVideo || !trailerKey) {
      return;
    }

    function createPlayer() {
      if (!window.YT || !playerContainerElement) {
        return;
      }

      const nextPlayer = new window.YT.Player(playerContainerElement, {
        videoId: trailerKey,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            event.target.setVolume(volume);
            setDuration(event.target.getDuration() || 900);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });

      setPlayerInstance(nextPlayer);
    }

    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      setPlayerInstance((currentPlayer) => {
        currentPlayer?.destroy?.();
        return null;
      });
    };
  }, [playerContainerElement, trailerKey, usingNativeVideo, volume]);

  useEffect(() => {
    if (!usingNativeVideo) {
      return;
    }

    const video = nativeVideoElement;

    if (!video) {
      return;
    }

    video.volume = volume / 100;
    video.muted = isMuted;

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    function syncProgress() {
      setProgress(video.currentTime || 0);
      setDuration(video.duration || 900);
      setIsPlaying(!video.paused);

      if ((video.duration || 0) - (video.currentTime || 0) < 5) {
        setShowNextEpisode(true);
      }
    }

    function handleEnded() {
      setShowNextEpisode(true);
      setIsPlaying(false);
    }

    video.addEventListener('timeupdate', syncProgress);
    video.addEventListener('loadedmetadata', syncProgress);
    video.addEventListener('play', syncProgress);
    video.addEventListener('pause', syncProgress);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.pause();
      video.removeEventListener('timeupdate', syncProgress);
      video.removeEventListener('loadedmetadata', syncProgress);
      video.removeEventListener('play', syncProgress);
      video.removeEventListener('pause', syncProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, [demoVideoUrl, isMuted, nativeVideoElement, usingNativeVideo, volume]);

  useEffect(() => {
    if (!usingNativeVideo) {
      return;
    }

    setPlayerInstance((currentPlayer) => {
      currentPlayer?.destroy?.();
      return null;
    });
  }, [usingNativeVideo]);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      const player = playerInstance;

      if (!player?.getCurrentTime) {
        return;
      }

      const currentTime = player.getCurrentTime();
      const nextDuration = player.getDuration?.() || duration;
      setProgress(currentTime);
      setDuration(nextDuration);

      if (nextDuration - currentTime < 5) {
        setShowNextEpisode(true);
      }
    }, 1000);

    return () => window.clearInterval(progressTimer);
  }, [duration, playerInstance]);

  useEffect(() => {
    let timerId;

    function showPlayerControls() {
      setShowControls(true);
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setShowControls(false), 3000);
    }

    showPlayerControls();
    window.addEventListener('mousemove', showPlayerControls);
    return () => {
      window.removeEventListener('mousemove', showPlayerControls);
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    function handleKeydown(event) {
      const nativeVideo = nativeVideoElement;
      const youtubePlayer = playerInstance;

      if (!nativeVideo && !youtubePlayer) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        if (usingNativeVideo) {
          if (nativeVideo?.paused) {
            nativeVideo.play();
            setToast('▶ Playing');
          } else {
            nativeVideo?.pause();
            setToast('⏸ Paused');
          }
        } else if (isPlaying) {
          youtubePlayer.pauseVideo();
          setToast('⏸ Paused');
        } else {
          youtubePlayer.playVideo();
          setToast('▶ Playing');
        }
      }

      if (event.key.toLowerCase() === 'm') {
        if (usingNativeVideo && nativeVideo) {
          nativeVideo.muted = !nativeVideo.muted;
        } else if (youtubePlayer) {
          youtubePlayer.isMuted() ? youtubePlayer.unMute() : youtubePlayer.mute();
        }
        setIsMuted((value) => !value);
        setToast(isMuted ? '🔊 Unmuted' : '🔇 Muted');
      }

      if (event.key.toLowerCase() === 'f') {
        document.documentElement.requestFullscreen?.();
        setToast('⛶ Fullscreen');
      }

      if (event.key === 'ArrowRight') {
        if (usingNativeVideo && nativeVideo) {
          nativeVideo.currentTime += 10;
        } else {
          youtubePlayer.seekTo(youtubePlayer.getCurrentTime() + 10, true);
        }
        setToast('⏩ +10s');
      }

      if (event.key === 'ArrowLeft') {
        if (usingNativeVideo && nativeVideo) {
          nativeVideo.currentTime = Math.max(nativeVideo.currentTime - 10, 0);
        } else {
          youtubePlayer.seekTo(Math.max(youtubePlayer.getCurrentTime() - 10, 0), true);
        }
        setToast('⏪ -10s');
      }

      if (event.key === 'ArrowUp') {
        setVolume((previous) => Math.min(previous + 10, 100));
        setToast('🔊 Volume up');
      }

      if (event.key === 'ArrowDown') {
        setVolume((previous) => Math.max(previous - 10, 0));
        setToast('🔉 Volume down');
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isMuted, isPlaying, nativeVideoElement, playerInstance, usingNativeVideo]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(''), 1400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function togglePlayPause() {
    if (usingNativeVideo) {
      if (!nativeVideoElement) {
        return;
      }

      if (nativeVideoElement.paused) {
        nativeVideoElement.play();
      } else {
        nativeVideoElement.pause();
      }
      return;
    }

    if (!playerInstance) {
      return;
    }

    if (isPlaying) {
      playerInstance.pauseVideo();
    } else {
      playerInstance.playVideo();
    }
  }

  function handleSeek(event) {
    const nextTime = Number(event.target.value);
    setProgress(nextTime);
    if (usingNativeVideo) {
      if (nativeVideoElement) {
        nativeVideoElement.currentTime = nextTime;
      }
      return;
    }

    playerInstance?.seekTo(nextTime, true);
  }

  function handleVolumeChange(event) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (usingNativeVideo) {
      if (nativeVideoElement) {
        nativeVideoElement.volume = nextVolume / 100;
      }
      return;
    }

    playerInstance?.setVolume(nextVolume);
  }

  return (
    <div className="video-player-page">
      {usingNativeVideo ? (
        <video
          ref={setNativeVideoElement}
          className="video-player-embed"
          src={demoVideoUrl}
          autoPlay
          muted={isMuted}
          playsInline
        />
      ) : (
        <div ref={setPlayerContainerElement} className="video-player-embed" />
      )}

      {error ? <div className="page-error video-player-error">{error}</div> : null}

      <div className={`video-controls ${showControls ? 'is-visible' : ''}`}>
        <div className="video-top-bar">
          <a href="/browse">← Back to browsing</a>
        </div>

        <div className="video-bottom-bar">
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleSeek}
          />
          <div className="video-bottom-row">
            <div className="video-left-controls">
              <button onClick={togglePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
              <button>⏭</button>
              <div className="volume-control">
                <button onClick={() => setIsMuted((value) => !value)}>{isMuted ? '🔇' : '🔊'}</button>
                <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} />
              </div>
              <span>
                {formatTime(progress)} / {formatTime(duration)}
              </span>
            </div>

            <div className="video-right-controls">
              <button>💬</button>
              <button>⚙</button>
              <button onClick={() => document.documentElement.requestFullscreen?.()}>⛶</button>
            </div>
          </div>

          <div className="video-title-strip">
            <strong>{details?.title || 'Now Playing'}</strong>
            <span>Featured trailer</span>
          </div>
        </div>
      </div>

      {showNextEpisode ? (
        <div className="next-episode-card">
          <div className="countdown-ring">5</div>
          <div>
            <strong>Next Episode</strong>
            <p>Autoplay will continue shortly.</p>
          </div>
        </div>
      ) : null}

      {toast ? <div className="player-toast">{toast}</div> : null}
    </div>
  );
}
