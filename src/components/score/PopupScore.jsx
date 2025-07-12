// ✅ PopupScore.jsx – phiên bản đơn giản chỉ hiển thị điểm và 1 nút 'Näytä vastaukset'
import React from 'react';
import './popup-score.css';

const PopupScore = ({ score, total, onAnswersReviewed }) => {
  const getEmoji = () => {
    if (score === total) return '🎯';
    if (score >= total * 0.7) return '🎉';
    if (score >= total * 0.4) return '👍';
    return '💪';
  };

  return (
    <div className="popup-score-overlay">
      <div className="popup-score-box">
        <h2>{getEmoji()} Pisteesi: {score} / {total}</h2>
        <p>{score === total ? 'Täydellistä työtä!' : 'Katso oikeat vastaukset ja opi virheistäsi.'}</p>

        <div className="popup-score-actions">
          <button className="next-btn" onClick={onAnswersReviewed}>Näytä vastaukset</button>
        </div>
      </div>
    </div>
  );
};

export default PopupScore;
