import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import axios from "axios";
import "aos/dist/aos.css";
import "./CoursePage.css";
import Loader from "../../components/loader/loader";

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
  const [readyToStartSkill, setReadyToStartSkill] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ loading state

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
        const lessonsData = res.data.result.map((item, index) => ({
          id: index + 1,
          lessonName: item.lessonName,
          fullTitle: `Lesson ${index + 1} – ${formatTitle(item.lessonName)}`,
          shortTitle: formatTitle(item.lessonName),
          description: item.description,
          image: item.imageLink,
          skills: {
            vocabulary: { status: 0 },
            listening: { status: 0 },
            writing: { status: 0 },
            reading: { status: 0 },
          },
        }));
        setLessons(lessonsData);
        setLoading(false); // ✅ done loading
      })
      .catch((err) => {
        console.error("❌ Failed to fetch lessons:", err.message);
        setError("Could not load lessons from backend.");
        setLoading(false); // ✅ stop loading even on error
      });
  }, []);

  useEffect(() => {
    if (!lessons.length) return;

    const isProgressFetched = lessons.every(
      (lesson) =>
        lesson.skills.vocabulary.status !== 0 ||
        lesson.skills.listening.status !== 0 ||
        lesson.skills.writing.status !== 0 ||
        lesson.skills.reading.status !== 0
    );

    if (isProgressFetched) return;

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
  }, [lessons]);

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
    if (readyToStartSkill === skill && activeSkill === skill) {
      if (skill === "vocabulary" && activeLesson.id === 1) {
        navigate("/course/a1/lesson-1/vocabulary");
      } else {
        navigate(`/course/a1/lesson-${activeLesson.id}/${skill}`);
      }
      setReadyToStartSkill(null);
    } else {
      setActiveSkill(skill);
      setReadyToStartSkill(skill);
      localStorage.setItem("activeSkillTab", skill);
    }
  };

  const handleLessonClick = (id) => {
    setActiveLessonId(id);
  };

  if (loading) {
    return (
      <div className="course-container loader-wrapper">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-container">
        <h2 className="course-heading">LEVEL A1</h2>
        <p className="course-slogan">⚠️ {error}</p>
      </div>
    );
  }

  if (!activeLesson) return null;

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
            {["vocabulary", "listening", "writing", "reading"].map((skill) => {
              const isActive = activeSkill === skill;
              const isReady = readyToStartSkill === skill;

              return (
                <button
                  key={skill}
                  className={`skill-tab ${isActive ? "active" : ""}`}
                  onClick={() => handleSkillClick(skill)}
                >
                  {skillIcons[skill]}{" "}
                  {isActive && isReady ? "Start Now" : skill.charAt(0).toUpperCase() + skill.slice(1)}
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
