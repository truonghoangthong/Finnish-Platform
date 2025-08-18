import "./main.css";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();

  const coursesData = [
    {
      id: 1,
      level: "LEVEL A1",
      image: "course-a1.png",
      description:
        "A1 Level – Start your Finnish journey with fun basics. Speak and understand the basics of Finnish – fast!",
      path: "/course/a1",
    },
    {
      id: 2,
      level: "LEVEL A2",
      image: "course-a2.png",
      description:
        "A2 Level – Learn to speak confidently in daily life. Build fluency for real-life situations and simple conversations.",
    },
    {
      id: 3,
      level: "LEVEL B1",
      image: "course-b1.png",
      description:
        "B1 Level – Share your ideas, tell stories, connect naturally. Master conversations in daily life, work, and social settings.",
    },
    {
      id: 4,
      level: "LEVEL B2",
      image: "course-b2.png",
      description:
        "B2 Level – Communicate fluently in real conversations. Communicate fluently in most situations — from work meetings to friendships.",
    },
  ];

  return (
    <>
      <section id="home" className="home-section">
        <div className="home-container">
          <div className="lottie-animation left-animation">
            <dotlottie-player
              src="https://lottie.host/2a4225b7-4423-41c2-89e4-d6eac33167d5/qN5L1XzktS.lottie"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></dotlottie-player>
          </div>
          <div className="home-content">
            <h1>
              <span className="highlight-text">Explore</span> Your Language
              Journey
            </h1>
            <h2>with Online Finnish Language Courses</h2>
            <p>Learn with Us and Enhance Your Skills.</p>
            <img
              src="labmain.png"
              alt="LAB University of Applied Sciences"
              className="home-image"
            />
            <button>Explore Courses</button>
          </div>
          <div className="lottie-animation right-animation">
            <dotlottie-player
              src="https://lottie.host/05b02abf-b5d3-4f28-aa89-2b8adfad6f7b/67IqU6xNFN.lottie"
              background="transparent"
              speed="1"
              loop
              autoplay
            ></dotlottie-player>
          </div>
        </div>
      </section>

      <section id="courses" className="courses-section">
        <h2>Our Courses</h2>
        <div className="courses-grid">
          {coursesData.map((course) => (
            <div className="course-card" key={course.id}>
              <img src={course.image} alt={course.level} />
              <h3>{course.level}</h3>
              <p>{course.description}</p>
              <button onClick={() => navigate(course.path)}>Start Now</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Main;
