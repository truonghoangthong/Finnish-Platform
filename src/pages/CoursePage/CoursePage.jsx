import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import axios from "axios";
import "aos/dist/aos.css";
import "./CoursePage.css";

const userId = "yugioh123";

const skillIcons = {
  vocabulary: "🧠",
  listening: "🎧",
  writing: "✍️",
  reading: "📖",
};

const CoursePage = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(
    parseInt(localStorage.getItem("activeLessonTab")) || 1
  );
  const [activeSkill, setActiveSkill] = useState(
    localStorage.getItem("activeSkillTab") || "vocabulary"
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    localStorage.setItem("activeLessonTab", activeLessonId);
  }, [activeLessonId]);

  useEffect(() => {
    localStorage.setItem("activeSkillTab", activeSkill);
  }, [activeSkill]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/learning/A1")
      .then((res) => {
        const lessonsData = res.data.result.map((item) => ({
          id: parseInt(item.lessonNumber),
          lessonName: item.lessonName,
          fullTitle: `Lesson ${item.lessonNumber} – ${formatTitle(item.lessonName)}`,
          shortTitle: formatTitle(item.lessonName),
          description: item.description,
          image: `/a1 (${item.lessonNumber}).jpg`,
          skills: {
            vocabulary: { status: 0 },
            listening: { status: 0 },
            writing: { status: 0 },
            reading: { status: 0 },
          },
        }));
        setLessons(lessonsData);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch lessons:", err.message);
        setError("Could not load lessons from backend.");
      });
  }, []);

  useEffect(() => {
    if (!lessons.length) return;

    const fetchProgress = async () => {
      try {
        const updated = await Promise.all(
          lessons.map(async (lesson) => {
            const res = await axios.get(
              `http://localhost:3000/api/progress/${userId}/A1/${lesson.lessonName}`
            );
            const p = res.data.result[lesson.lessonName];
            return {
              ...lesson,
              skills: {
                vocabulary: { status: parseProgress(p?.module1) },
                listening: { status: parseProgress(p?.module2) },
                writing: { status: parseProgress(p?.module3) },
                reading: { status: parseProgress(p?.module4) },
              },
            };
          })
        );
        setLessons(updated);
      } catch (err) {
        console.error("❌ Failed to fetch progress:", err.message);
      }
    };

    fetchProgress();
  }, [lessons.length]);

  const parseProgress = (val) => {
    if (!val) return 0;
    const percent = parseInt(val);
    return isNaN(percent) ? 0 : percent;
  };

  const formatTitle = (str) =>
    str
      .replace(/_/g, " ")
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  const progressPercent = activeLesson?.skills[activeSkill]?.status || 0;

  const handleSkillClick = (skill) => {
    setActiveSkill(skill);
    localStorage.setItem("activeSkillTab", skill);
    navigate(`/course/a1/lesson-${activeLesson.id}/${skill}`);
  };

  const handleLessonClick = (id) => {
    setActiveLessonId(id);
  };

  if (error) {
    return (
      <div className="course-container">
        <h2 className="course-heading">LEVEL A1</h2>
        <p className="course-slogan">⚠️ {error}</p>
      </div>
    );
  }

  if (!activeLesson)
    return (
      <div className="course-container">
        <p>Loading lessons...</p>
      </div>
    );

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
            onClick={() => handleLessonClick(lesson.id)}
          >
            0{lesson.id}
          </button>
        ))}
      </div>

      <div className="lesson-preview" data-aos="fade-up">
        <div className="lesson-card">
          <div className="lesson-header">
            <h3 className="lesson-title">Lesson {activeLesson.id}</h3>
            <div className="lesson-sub">{activeLesson.shortTitle}</div>
          </div>

          <img
            src={activeLesson.image}
            alt={activeLesson.fullTitle}
            className="lesson-image"
          />

          <div className="progress-bar">
            <div
              className="progress-bar-inner"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="progress-text">{progressPercent}% completed</p>

          <div className="skill-buttons">
            {["vocabulary", "listening", "writing", "reading"].map((skill) => (
              <button
                key={skill}
                className={`skill-tab ${activeSkill === skill ? "active" : ""}`}
                onClick={() => handleSkillClick(skill)}
              >
                {skillIcons[skill]} {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
  