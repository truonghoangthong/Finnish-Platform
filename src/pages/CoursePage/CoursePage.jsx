import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CoursePage.css";

const lessons = [
  {
    id: 1,
    shortTitle: "Workplace Break Room",
    fullTitle: "Lesson 1 – Workplace Break Room",
    description: "Learn basic Finnish in the workplace context.",
    image: "/a1 (1).jpg",
    skills: {
      vocabulary: { status: "done" },
      listening: { status: "locked" },
      writing: { status: "in-progress" },
      reading: { status: "todo" },
    },
  },
  {
    id: 2,
    shortTitle: "Everyday Conversations",
    fullTitle: "Lesson 2 – Everyday Conversations",
    description: "Master common Finnish phrases for daily life.",
    image: "/a1 (2).jpg",
    skills: {
      vocabulary: { status: "todo" },
      listening: { status: "todo" },
      writing: { status: "todo" },
      reading: { status: "todo" },
    },
  },
  {
    id: 3,
    shortTitle: "Home & Family",
    fullTitle: "Lesson 3 – Home & Family",
    description: "Talk about your home and relatives in Finnish.",
    image: "/a1 (3).jpg",
    skills: {
      vocabulary: { status: "todo" },
      listening: { status: "todo" },
      writing: { status: "todo" },
      reading: { status: "todo" },
    },
  },
  {
    id: 4,
    shortTitle: "Hobbies & Free Time",
    fullTitle: "Lesson 4 – Hobbies & Free Time",
    description: "Describe your hobbies in Finnish.",
    image: "/a1 (4).jpg",
    skills: {
      vocabulary: { status: "todo" },
      listening: { status: "todo" },
      writing: { status: "todo" },
      reading: { status: "todo" },
    },
  },
];

const CoursePage = () => {
  const navigate = useNavigate();
  const [activeLessonId, setActiveLessonId] = useState(
    parseInt(localStorage.getItem("activeLessonTab")) || 1
  );
  const [activeSkill, setActiveSkill] = useState(
    localStorage.getItem("activeSkillTab") || "vocabulary"
  );

  useEffect(() => {
    localStorage.setItem("activeLessonTab", activeLessonId);
  }, [activeLessonId]);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId);

  const completedCount = Object.values(activeLesson.skills).filter(
    (s) => s.status === "done" || s.status === "in-progress"
  ).length;

  const progressPercent = (completedCount / 4) * 100;

  const handleSkillClick = (skill) => {
    setActiveSkill(skill);
    localStorage.setItem("activeSkillTab", skill);
    navigate(`/course/a1/lesson-${activeLesson.id}/${skill}`);
  };

  const getIcon = (status) => {
    switch (status) {
      case "done":
        return "🧠";
      case "locked":
        return "🎧";
      case "in-progress":
        return "✍️";
      default:
        return "📖";
    }
  };

  return (
    <div className="course-container">
      <h2 className="course-heading">LEVEL A1</h2>
      <p className="course-slogan">
        Discover Finnish from day one – greet, introduce yourself, and fall in love with a new language!
      </p>

      <div className="lesson-tabs">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            className={`tab-button ${lesson.id === activeLessonId ? "active" : ""}`}
            title={lesson.fullTitle}
            onClick={() => setActiveLessonId(lesson.id)}
          >
            0{lesson.id}
          </button>
        ))}
      </div>

      <div className="lesson-preview" data-aos="fade-up">
        <div className="lesson-card">
          <img
            src={activeLesson.image}
            alt={activeLesson.fullTitle}
            className="lesson-image"
          />
          <h3 className="lesson-title">
            Lesson {activeLesson.id}
            <div className="lesson-sub">{activeLesson.shortTitle}</div>
          </h3>
          <p className="lesson-description">{activeLesson.description}</p>

          {/* Progress Bar
          <div className="progress-bar">
            <div
              className="progress-bar-inner"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="progress-text">{Math.round(progressPercent)}% completed</p> */}

          <div className="skill-buttons">
            {["vocabulary", "listening", "writing", "reading"].map((skill) => {
              const status = activeLesson.skills[skill]?.status || "todo";
              const icon = getIcon(status);
              return (
                <button
                  key={skill}
                  className={`skill-tab ${activeSkill === skill ? "active" : ""}`}
                  onClick={() => handleSkillClick(skill)}
                >
                  {icon} {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
