import { useEffect, useState } from 'react';
import './member2.css';

const navItems = [
  { label: 'Home', to: '/browse' },
  { label: 'TV Shows', to: '/genre/tv' },
  { label: 'Movies', to: '/genre/movies' },
  { label: 'New & Popular', to: '/genre/new-popular' },
  { label: 'My List', to: '/mylist' },
];

function NavItems({ onClickLink }) {
  const pathname = window.location.pathname;

  return navItems.map((item) => (
    <a
      key={item.label}
      href={item.to}
      className={`browse-link ${pathname === item.to ? 'is-active' : ''}`}
      onClick={onClickLink}
    >
      {item.label}
    </a>
  ));
}

export default function Navbar() {
  const [isSolid, setIsSolid] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsSolid(window.scrollY > 80);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`browse-navbar ${isSolid ? 'is-solid' : ''}`}>
        <div className="browse-navbar-left">
          <button
            className="hamburger-button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="browse-logo">NETFLIX</div>
          <nav className="browse-nav-links">
            <NavItems />
          </nav>
        </div>

        <div className="browse-navbar-right">
          <button
            className="icon-button"
            onClick={() => {
              window.location.href = '/search';
            }}
          >
            ⌕
          </button>
          <button className="icon-button">🔔</button>
          <div className="avatar-menu">
            <button className="avatar-circle" onClick={() => setIsDropdownOpen((value) => !value)}>
              D
            </button>
            {isDropdownOpen ? (
              <div className="avatar-dropdown">
                <span>Dipendra</span>
                <button>Manage Profiles</button>
                <button>Account</button>
                <button>Help</button>
                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${isDrawerOpen ? 'is-open' : ''}`}>
        <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
          ×
        </button>
        <nav className="drawer-links">
          <NavItems onClickLink={() => setIsDrawerOpen(false)} />
        </nav>
      </div>
    </>
  );
}
