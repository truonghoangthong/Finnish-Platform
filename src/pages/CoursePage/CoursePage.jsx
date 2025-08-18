import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CoursePage.css";
import Loader from "../../components/loader/loader";
import { useCourseStore } from "../../stores/courses";

const skillIcons = {
  vocabulary: "🧠",
  listening: "🎧",
  writing: "✍️",
  reading: "📖",
};

const CoursePage = () => {
  const navigate = useNavigate();
  const {
    lessons,
    activeLessonId,
    activeSkill,
    readyToStartSkill,
    error,
    loading,
    setActiveLessonId,
    setActiveSkill,
    setReadyToStartSkill,
    fetchInitialData,
  } = useCourseStore();

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchInitialData();
  }, [fetchInitialData]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  const progressPercent = activeLesson?.skills[activeSkill]?.status || 0;

  const handleSkillClick = (skill) => {
    if (readyToStartSkill === skill && activeSkill === skill) {
      let path = "";

      if (skill === "vocabulary" && activeLesson.id === 1) {
        path = "/course/a1/lesson-1/vocabulary";
      } else if (skill === "writing" && activeLesson.id === 1) {
        path = "/course/a1/lesson-1/writing";
      } else {
        path = `/course/a1/lesson-${activeLesson.id}/${skill}`;
      }

      navigate(path);
      setReadyToStartSkill(null);
    } else {
      setActiveSkill(skill);
      setReadyToStartSkill(skill);
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
        Discover Finnish from day one – greet, introduce yourself, and fall in
        love with a new language!
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
        <img
          src={activeLesson.image}
          alt={activeLesson.fullTitle}
          className="lesson-image"
        />

        <div className="lesson-card">
          <div className="lesson-header">
            <h3 className="lesson-title">Lesson {activeLesson.id}</h3>
            <div className="lesson-sub">{activeLesson.shortTitle}</div>
          </div>

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
                  {isActive && isReady
                    ? "Start Now"
                    : skill.charAt(0).toUpperCase() + skill.slice(1)}
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
