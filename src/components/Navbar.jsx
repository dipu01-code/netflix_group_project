import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import netflixLogo from '../assets/netflix-logo.svg';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSearch = location.pathname === '/search';

  return (
    <nav className={`navbar${scrolled || isSearch ? ' navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => navigate('/')} role="link" tabIndex={0}>
          <img src={netflixLogo} alt="Netflix" />
        </div>

        <ul className="navbar__links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/search" className={isSearch ? 'active' : ''}>Search</Link></li>
        </ul>

        <div className="navbar__right">
          <button
            className="navbar__search-btn"
            onClick={() => navigate('/search')}
            aria-label="Search"
            id="navbar-search-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
