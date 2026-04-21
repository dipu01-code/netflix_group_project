import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';

import Navbar            from './components/Navbar';
import Banner            from './components/Banner';
import SearchPage        from './pages/SearchPage';
import DetailModal       from './components/DetailModal';
import VideoPlayer       from './components/VideoPlayer';

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);   // opens detail modal
  const [videoSrc,     setVideoSrc]     = useState(null);   // opens video player
  const [videoTitle,   setVideoTitle]   = useState('');

  /* called from cards (SearchPage, Banner, etc.) */
  const handleSelectItem = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  /* called from detail modal "Play" button */
  const handlePlayVideo = useCallback((src, data) => {
    setVideoSrc(src);
    setVideoTitle(data?.title || data?.name || '');
    setSelectedItem(null);       // close the modal while playing
  }, []);

  const closeModal  = useCallback(() => setSelectedItem(null), []);
  const closePlayer = useCallback(() => { setVideoSrc(null); setVideoTitle(''); }, []);

  return (
    <>
      <Routes>
        {/* Home — Member 1 Banner */}
        <Route
          path="/"
          element={
            <div className="bg-black min-h-screen">
              <Banner />
            </div>
          }
        />

        {/* Search — Member 3 */}
        <Route
          path="/search"
          element={
            <>
              <Navbar />
              <SearchPage onSelectItem={handleSelectItem} />
            </>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'16px' }}>
            <h2 style={{ fontSize:'2rem', color:'var(--netflix-text)' }}>404</h2>
            <p style={{ color:'var(--netflix-muted)' }}>Page not found.</p>
          </div>
        } />
      </Routes>

      {/* Global modals — portalled to document.body */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={closeModal}
          onPlayVideo={handlePlayVideo}
        />
      )}

      {videoTitle && (
        <VideoPlayer
          src={videoSrc}
          title={videoTitle}
          onClose={closePlayer}
        />
      )}
    </>
  );
}
