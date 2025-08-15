import React from "react";
import "./AnswerPopup2.css";

/**
 * Giữ nguyên props & logic của Part 2:
 * - isCorrect
 * - popupScript
 * - showScript
 * - onShowScript (toggle)
 * - onNext (khi đúng)
 * - onRetry (khi sai)
 */
const AnswerPopup2 = ({
  isCorrect,
  popupScript,
  showScript,
  onShowScript,
  onNext,
  onRetry,
}) => {
  return (
    <div className="answer-popup">
      <div className={`popup-card ${isCorrect ? "correct" : "wrong"}`}>
        {/* Icon + tiêu đề */}
        <span className="popup-icon">{isCorrect ? "🎉" : "❌"}</span>
        <div className="popup-title">
          {isCorrect ? (
            <>
              <span style={{ color: "#22C55E" }}>✔</span> Oikein!
            </>
          ) : (
            <>Väärin!</>
          )}
        </div>

        {/* Script (toggle) */}
        {showScript && popupScript && (
          <div className="popup-script">
            <p>{popupScript}</p>
          </div>
        )}

        {/* Khu nút: giữ nút của Part 2 */}
        <div className="popup-actions">
          <button className="popup-btn" onClick={onShowScript}>
            {showScript ? "Piilota Teksti" : "Näytä Teksti"}
          </button>

          {isCorrect ? (
            <button className="popup-button" onClick={onNext}>
              Jatka →
            </button>
          ) : (
            <button className="popup-button" onClick={onRetry}>
              🔁 Yritä uudelleen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerPopup2;
