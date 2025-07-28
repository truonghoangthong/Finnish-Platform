import React from "react";
import "./AnswerPopup2.css";

const AnswerPopup2 = ({
  isCorrect,
  popupScript,
  showScript,
  onShowScript,
  onNext,
  onRetry,
}) => {
  return (
    <div className={`popup ${!isCorrect ? "shake" : ""}`}>
      <div className="popup-title">
        {isCorrect ? (
          <>
            <span style={{ fontSize: "2rem" }}>✅</span> Oikein!
          </>
        ) : (
          <>
            <span style={{ fontSize: "2rem" }}>❌</span> Väärin!
          </>
        )}
      </div>

      {showScript && (
        <div className="popup-script">
          <p>{popupScript}</p>
        </div>
      )}

      <div className="popup-buttons">
        <button className="popup-btn" onClick={onShowScript}>
          📜 {showScript ? "Piilota Teksti" : "Näytä Teksti"}
        </button>

        {isCorrect ? (
          <button className="popup-btn" onClick={onNext}>
            ➡️ Seuraava
          </button>
        ) : (
          <button className="popup-btn" onClick={onRetry}>
            🔁 Yritä uudelleen
          </button>
        )}
      </div>
    </div>
  );
};

export default AnswerPopup2;
