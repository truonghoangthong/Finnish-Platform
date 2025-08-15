import React, { useEffect } from 'react';
import './answer-popup.css';

const AnswerPopup = ({ isCorrect, image, script, ipa, onClose }) => {
  // ✅ Tự động đóng popup sau 1.2s nếu sai (GIỮ NGUYÊN LOGIC)
  useEffect(() => {
    if (!isCorrect) {
      const timeout = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isCorrect, onClose]);

  return (
    <div className="answer-popup">
      <div className={`popup-card ${isCorrect ? 'correct' : 'wrong'}`}>
        <div className="popup-header">
          <span className="popup-icon">{isCorrect ? '🎉' : '❌'}</span>
        </div>

        {/* ✅ Nội dung hiển thị tùy theo đúng/sai (GIỮ NGUYÊN) */}
        {isCorrect ? (
          <>
            <p className="popup-message success">
              <span style={{ color: "#4CAF50" }}>✔</span> Oikein! Hienoa työtä <span className="popup-celebrate"></span>
            </p>
            <img src={image} alt="Answer" className="popup-image" />
            <p className="popup-word">{script}</p>
            {ipa && <p className="popup-ipa">/{ipa}/</p>}
          </>
        ) : (
          <p className="popup-message fail">Väärin, yritä uudelleen</p>
        )}

        {/* ✅ Chỉ hiện nút nếu đúng (GIỮ NGUYÊN) */}
        {isCorrect && (
          <button className="popup-button" onClick={onClose}>
            Jatka →
          </button>
        )}
      </div>
    </div>
  );
};

export default AnswerPopup;
