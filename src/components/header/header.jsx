import './header.css';
import { useState, useEffect } from 'react';

function Header() {
  const [activeLink, setActiveLink] = useState('#home');

  useEffect(() => {
    const sections = ['#home', '#courses', '#contact'];
    const sectionElements = sections.map(id => document.querySelector(id));

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let found = false;
      sectionElements.forEach((element, idx) => {
        if (element && !found) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveLink(sections[idx]);
            found = true;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header">
      <nav className="nav-links">
        <ul>
          <li>
            <a
              href="#home"
              className={activeLink === '#home' ? 'active' : ''}
              onClick={() => setActiveLink('#home')}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#courses"
              className={activeLink === '#courses' ? 'active' : ''}
              onClick={() => setActiveLink('#courses')}
            >
              Courses
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className={activeLink === '#contact' ? 'active' : ''}
              onClick={() => setActiveLink('#contact')}
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;