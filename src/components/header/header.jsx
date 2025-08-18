import "./header.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const [activeLink, setActiveLink] = useState("#home");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sections = ["#home", "#courses", "#contact"];
    const sectionElements = sections.map((id) => document.querySelector(id));
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    }, options);

    sectionElements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      sectionElements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    setActiveLink(id);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="header">
      <nav className="nav-links">
        <ul>
          <li>
            <a
              href="#home"
              className={activeLink === "#home" ? "active" : ""}
              onClick={(e) => handleClick(e, "#home")}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#courses"
              className={activeLink === "#courses" ? "active" : ""}
              onClick={(e) => handleClick(e, "#courses")}
            >
              Courses
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
