// ✅ LessonLayout.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./lesson-layout.css";
import Mascot from "../mascot/Mascot";

const skillLabels = {
  vocabulary: "Vocabulary",
  listening: "Listening",
  writing: "Writing",
  reading: "Reading",
};

const skillOrder = ["vocabulary", "listening", "writing", "reading"];

const LessonLayout = ({
  level,
  lessonNumber,
  title,
  showImage = false,
  imageSrc,
  showMascot = false,
  progress,
  imageChildren, // ✅ dùng cho mascot nằm trong ảnh
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSkill = location.pathname.split("/")[4];
  const lessonPath = `/course/${(level || "").toLowerCase()}/lesson-${lessonNumber}`;

  const handleSkillClick = (skill) => {
    navigate(`${lessonPath}/${skill}`);
  };

  return (
    <div className="lesson-layout">
      <div className="layout-header">
        <h2 className="level-title">LEVEL {level.toUpperCase()}</h2>
        <p className="layout-slogan">
          Discover Finnish from day one – greet, introduce yourself, and fall in love with a new language!
        </p>
      </div>

      <div className="layout-tabs">
        {skillOrder.map((skill, index) => (
          <div
            key={skill}
            className={`layout-tab ${currentSkill === skill ? "active" : ""}`}
            onClick={() => handleSkillClick(skill)}
          >
            <div className="tab-number">0{index + 1}</div>
            <div className="tab-label">{skillLabels[skill]}</div>
          </div>
        ))}
      </div>

      <div className="lesson-preview">
        <div className="lesson-card">
          <div className="lesson-header">
            <h3 className="lesson-title">Lesson {lessonNumber}</h3>
            <div className="lesson-subtitle">{title}</div>
          </div>

          {/* ✅ Phần ảnh có mascot nằm trong wrapper */}
          {showImage && (
            <div className="lesson-image-wrapper">
              <img src={imageSrc} className="lesson-image" alt="lesson" />
              {imageChildren} {/* 🎯 Mascot và bubble nằm trong ảnh, không bị rơi */}
            </div>
          )}

          {/* (Không cần showMascot ở đây nữa) */}

          {progress !== undefined && (
            <>
              <div className="progress-bar">
                <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-text">{progress}% completed</p>
            </>
          )}

          {/* ✅ Nội dung bài học như transcript, audio... */}
          <div className="lesson-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default LessonLayout;
