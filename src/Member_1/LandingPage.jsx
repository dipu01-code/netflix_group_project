import { useEffect, useState } from 'react';
import faqData from './faqData';
import AuthModal from './AuthModal';
import './member1.css';

const featureSections = [
  {
    title: 'Enjoy on your TV',
    description:
      'Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.',
    image:
      'https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/tv.png',
  },
  {
    title: 'Download your shows to watch offline',
    description:
      'Save your favorites easily and always have something to watch.',
    image:
      'https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/mobile-0819.jpg',
  },
  {
    title: 'Watch everywhere',
    description:
      'Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.',
    image: '',
    mockup: true,
  },
  {
    title: 'Create profiles for kids',
    description:
      'Send kids on adventures with their favorite characters in a space made just for them.',
    image:
      'https://occ-0-4992-2164.1.nflxso.net/dnm/api/v6/j7gS1f2A7n6kWv3D7szf7IHt8k4/AAAABY6QqLBwRKIYYNP6calKZYpFQZUCDq5ZPkNcaUVbn8NKiWkjOfE7wsBhb1kKEuWiRiwXQDq6rYmQXVc3k5iADG7n2AFD0w.png?r=63e',
  },
];

const footerLinks = [
  'FAQ',
  'Help Centre',
  'Account',
  'Investor Relations',
  'Media Centre',
  'Jobs',
  'Ways to Watch',
  'Terms of Use',
  'Privacy',
  'Cookie Preferences',
  'Corporate Information',
  'Contact Us',
  'Speed Test',
  'Legal Notices',
  'Only on Netflix',
  'Redeem Gift Cards',
];

function RevealSection({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    const element = document.querySelector(`[data-reveal-id="${className}"]`);

    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [className]);

  return (
    <section
      data-reveal-id={className}
      className={`feature-row ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

export default function LandingPage() {
  const [isNavSolid, setIsNavSolid] = useState(false);
  const [modalMode, setModalMode] = useState('signIn');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    function handleScroll() {
      setIsNavSolid(window.scrollY > 80);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function openModal(mode) {
    setModalMode(mode);
    setIsModalOpen(true);
  }

  return (
    <div className="landing-page">
      <header className={`landing-nav ${isNavSolid ? 'is-solid' : ''}`}>
        <div className="netflix-wordmark">NETFLIX</div>
        <button className="sign-in-button" onClick={() => openModal('signIn')}>
          Sign In
        </button>
      </header>

      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=80"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-man-watching-tv-1564323495297?download=1080p"
            type="video/mp4"
          />
        </video>
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>Unlimited movies, TV shows, and more</h1>
          <p className="hero-subheading">Watch anywhere. Cancel anytime.</p>
          <p className="hero-caption">
            Ready to watch? Enter your email to create or restart your membership.
          </p>

          <div className="hero-form">
            <input
              type="email"
              value={heroEmail}
              onChange={(event) => setHeroEmail(event.target.value)}
              placeholder="Email address"
            />
            <button
              className="hero-cta"
              onClick={() => {
                window.location.href = '/browse';
              }}
            >
              Get Started &gt;
            </button>
          </div>
        </div>
      </section>

      <div className="landing-sections">
        {featureSections.map((section, index) => (
          <RevealSection
            key={section.title}
            className={`feature-${index + 1} ${index % 2 === 1 ? 'is-reversed' : ''}`}
          >
            <div className="feature-copy">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>

            <div className="feature-media">
              {section.mockup ? (
                <div className="device-showcase">
                  <div className="device device-tv" />
                  <div className="device device-tablet" />
                  <div className="device device-phone" />
                </div>
              ) : (
                <img src={section.image} alt={section.title} />
              )}
            </div>
          </RevealSection>
        ))}
      </div>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqData.map((item, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <article key={item.question} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <div>{item.answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <p>Questions? Call 000-800-919-1694</p>
        <div className="footer-grid">
          {footerLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replaceAll(' ', '-')}`}>
              {link}
            </a>
          ))}
        </div>

        <div className="footer-controls">
          <select defaultValue="English">
            <option>English</option>
            <option>Hindi</option>
          </select>
          <span>Netflix India</span>
        </div>
      </footer>

      <AuthModal
        isOpen={isModalOpen}
        mode={modalMode}
        defaultEmail={heroEmail}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
