import { useState, useEffect } from 'react';
import '../styles/navbar.css';

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__logo">
                <svg
                    viewBox="0 0 111 30"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="111"
                    height="30"
                >
                    <g>
                        <path
                            d="M105.06696,14.672 C105.06696,23.382886 98.3068792,30.628155 90.0031156,30.628155 C81.6993521,30.628155 74.9292712,23.382886 74.9292712,14.672 C74.9292712,5.961114 81.6993521,0 90.0031156,0 C98.3068792,0 105.06696,5.961114 105.06696,14.672 Z"
                            fill="#E50914"
                        ></path>
                        <path
                            d="M0,0 L5.63973468,0 L5.63973468,25.6685437 L17.3564181,25.6685437 L17.3564181,30.3027149 L0,30.3027149 L0,0 Z M54.6986899,0 L60.5180624,0 L46.8336705,30.3027149 L40.8652446,30.3027149 L27.1808527,0 L33.0002252,0 L42.8474178,22.5869936 L54.6986899,0 Z M107.919941,13.7538905 C107.919941,10.3315233 105.939493,7.60894941 102.64014,7.60894941 C99.3407746,7.60894941 97.3603263,10.3315233 97.3603263,13.7538905 C97.3603263,17.1762577 99.3407746,19.8988316 102.64014,19.8988316 C105.939493,19.8988316 107.919941,17.1762577 107.919941,13.7538905 Z"
                            fill="#000000"
                        ></path>
                    </g>
                </svg>
            </div>
            <div className="navbar__menu">
                <a href="#" className="navbar__link">Home</a>
                <a href="#" className="navbar__link">TV Shows</a>
                <a href="#" className="navbar__link">Movies</a>
                <a href="#" className="navbar__link">New & Popular</a>
            </div>
        </nav>
    );
}

export default Navbar;
