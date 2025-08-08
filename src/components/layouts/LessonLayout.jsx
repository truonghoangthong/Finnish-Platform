import { useNavigate, useLocation } from "react-router-dom";
import "./lesson-layout.css";

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
  progress,
  imageChildren,
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
      <div className="lesson-header-container">
        <h2 className="lesson-level-title">LEVEL {level.toUpperCase()}</h2>
      </div>

      <div className="lesson-tabs-container">
        {skillOrder.map((skill, index) => (
          <div
            key={skill}
            className={`lesson-tab ${currentSkill === skill ? "active" : ""}`}
            onClick={() => handleSkillClick(skill)}
          >
            <div className="lesson-tab-number">0{index + 1}</div>
            <div className="lesson-tab-label">{skillLabels[skill]}</div>
          </div>
        ))}
      </div>

      <div className="lesson-title-container">
        <h3 className="lesson-main-title">Lesson {lessonNumber}</h3>
        <div className="lesson-sub-title">{title}</div>
      </div>

      {showImage && (
        <div className="lesson-image-wrapper">
          <img src={imageSrc} className="lesson-image" alt="lesson" />
          {imageChildren}
        </div>
      )}

      <div className="lesson-preview-container">
        <div className="lesson-card">
          {progress !== undefined && (
            <>
              <div className="lesson-progress-bar">
                <div className="lesson-progress-bar-inner" style={{ width: `${progress}%` }} />
              </div>
              <p className="lesson-progress-text">{progress}% completed</p>
            </>
          )}

          <div className="lesson-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default LessonLayout;