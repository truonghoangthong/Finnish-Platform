import React, { useEffect } from 'react';
import './popup-score.css';
import confetti from 'canvas-confetti';

const PopupScore = ({ score, total, onAnswersReviewed }) => {
  const getEmoji = () => {
    if (score === total) return '🎯';
    if (score >= total * 0.7) return '🎉';
    if (score >= total * 0.4) return '👍';
    return '💪';
  };

  useEffect(() => {
    if (score >= total * 0.7) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      const sound = new Audio('/sounds/celebration.mp3');
      sound.play();
    }
  }, []);

  return (
    <div className="popup-score-overlay">
      <div className="popup-score-box">
        <h2>{getEmoji()} Pisteesi: {score} / {total}</h2>
        <p>
          {score === total
            ? 'Täydellistä työtä!'
            : 'Katso oikeat vastaukset ja opi virheistäsi.'}
        </p>

        <div className="popup-score-actions">
          <button className="next-btn" onClick={onAnswersReviewed}>
            Näytä vastaukset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupScore;
