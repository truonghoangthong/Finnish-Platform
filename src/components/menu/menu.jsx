import { useNavigate, useLocation } from "react-router-dom";
import "./menu.css";

const skillLabels = {
  vocabulary: "Vocabulary",
  listening: "Listening",
  writing: "Writing",
  reading: "Reading",
};

const skillOrder = ["vocabulary", "listening", "writing", "reading"];

const Menu = ({ lessonNumber }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSkill = location.pathname.split("/")[4];
  const lessonPath = `/course/a1/lesson-${lessonNumber}`;

  const handleSkillClick = (skill) => {
    navigate(`${lessonPath}/${skill}`);
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2 className="menu-header-title">LEVEL A1</h2>
      </div>

      <div className="menu-tabs">
        {skillOrder.map((skill, index) => (
          <div
            key={skill}
            className={`menu-tab ${currentSkill === skill ? "menu-active" : ""}`}
            onClick={() => handleSkillClick(skill)}
          >
            <div className="menu-tab-number">0{index + 1}</div>
            <div className="menu-tab-label">{skillLabels[skill]}</div>
          </div>
        ))}
      </div>

      <div className="menu-title-section">
        <h3 className="menu-main-title">Lesson {lessonNumber}</h3>
        <div className="menu-sub-title">The Break Room</div>
      </div>
    </div>
  );
};

export default Menu;