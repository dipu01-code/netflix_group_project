import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import netflixLogo from '../assets/netflix-logo.svg';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tv-shows', label: 'TV Shows' },
  { to: '/movies', label: 'Movies' },
  { to: '/latest', label: 'New & Popular' },
  { to: '/my-list', label: 'My List' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };
  const navigateTo = (path) => {
    closeMenus();
    navigate(path);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const isSearch = location.pathname === '/search';
  const navClassName = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <>
      <nav className={`navbar${scrolled || isSearch ? ' navbar--scrolled' : ''}`} id="main-navbar">
        <div className="navbar__inner">
          <button
            type="button"
            className="navbar__hamburger"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className="navbar__logo"
            onClick={() => navigateTo('/')}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => event.key === 'Enter' && navigateTo('/')}
          >
            <img src={netflixLogo} alt="Netflix" />
          </div>

          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={navClassName} end={link.to === '/'} onClick={closeMenus}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <button
              className="navbar__search-btn"
              onClick={() => navigateTo('/search')}
              aria-label="Search"
              id="navbar-search-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            <button className="navbar__icon-btn" type="button" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M10 17a2 2 0 0 0 4 0" />
              </svg>
            </button>

            <div className="navbar__profile" ref={dropdownRef}>
              <button
                type="button"
                className="navbar__avatar"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((current) => !current)}
              >
                D
              </button>

              <div className={`navbar__dropdown${profileOpen ? ' navbar__dropdown--open' : ''}`} role="menu">
                <div className="navbar__dropdown-profile">
                  <span className="navbar__dropdown-avatar">D</span>
                  <div>
                    <p>Dipendra</p>
                    <span>Main Profile</span>
                  </div>
                </div>
                <button type="button" role="menuitem">Manage Profiles</button>
                <button type="button" role="menuitem" onClick={closeMenus}>Account</button>
                <button type="button" role="menuitem" onClick={closeMenus}>Help</button>
                <button type="button" role="menuitem" onClick={closeMenus}>Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`navbar-drawer${menuOpen ? ' navbar-drawer--open' : ''}`}>
        <button
          type="button"
          className="navbar-drawer__scrim"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />

        <aside className="navbar-drawer__panel">
          <div className="navbar-drawer__header">
            <img src={netflixLogo} alt="Netflix" />
            <button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav className="navbar-drawer__nav" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClassName} end={link.to === '/'} onClick={closeMenus}>
                {link.label}
              </NavLink>
            ))}
            <button type="button" className="navbar-drawer__search" onClick={() => navigateTo('/search')}>
              Search
            </button>
          </nav>
        </aside>
      </div>
    </>
  );
}
