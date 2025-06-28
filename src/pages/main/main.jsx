import './main.css';

function Main() {
    const coursesData = [
      {
        id: 1,
        level: "LEVEL A1",
        image: "course-a1.jpg",
        description: "A1 Level – Start your Finnish journey with fun basics. Speak and understand the basics of Finnish – fast!",
        buttonText: "Start Now"
      },
      {
        id: 2,
        level: "LEVEL A2",
        image: "course-a2.jpg",
        description: "A2 Level – Learn to speak confidently in daily life. Build fluency for real-life situations and simple conversations.",
        buttonText: "Start Now"
      },
      {
        id: 3,
        level: "LEVEL B1",
        image: "course-b1.jpg",
        description: "B1 Level – Share your ideas, tell stories, connect naturally. Master conversations in daily life, work, and social settings.",
        buttonText: "Start Now"
      },
      {
        id: 4,
        level: "LEVEL B2",
        image: "course-b2.jpg",
        description: "B2 Level – Communicate fluently in real conversations. Communicate fluently in most situations — from work meetings to friendships.",
        buttonText: "Start Now"
      }
];
  return (
    <>
      <section id="home" className="home-section">
        <h1><span className="highlight-text">Explore</span> Your Language Journey</h1>
        <h2>with Online Finnish Language Courses</h2>
        <p>Learn with Us and Enhance Your Skills.</p>
        <img
          src="labmain.png" 
          alt="LAB University of Applied Sciences"
          className="home-image"
        />
        <button>Explore Courses</button>
      </section>

      <section id="courses" className="courses-section">
        <h2>Our Courses</h2>
        <div className="courses-grid">
          {coursesData.map(course => (
            <div className="course-card" key={course.id}>
              <img src={course.image} alt={course.level} />
              <h3>{course.level}</h3>
              <p>{course.description}</p>
              <button>{course.buttonText}</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Main;
