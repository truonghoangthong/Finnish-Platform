import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultPart1 from '../part1a/ResultPart1';
import "./result-Part1.css"; 
import { updateProgress } from '../../../utils/api';
import { calculateModule1Progress } from '../../../utils/calculateProgress';

const Part1Final = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, answers, questions, userId, part1aViewed, part1aCorrect } = location.state || {};

  useEffect(() => {
    if (!userId || !questions) return;

    const progress = calculateModule1Progress({
      part1aViewed: part1aViewed || true,
      part1aCorrect: part1aCorrect || false,
      part1bViewed: true,
      part1bCorrect: score === questions.length,
    });

    updateProgress({
      userId,
      level: 'A1',
      lesson: 'the_break_room',
      module: 'module1',
      progress: progress.toString(),
    });
  }, [score, questions, userId, part1aViewed, part1aCorrect]);

  // ✅ Nếu chưa có dữ liệu: hiển thị Coming soon
  if (!questions || !answers || typeof score !== 'number') {
    return (
      <div className="final-container empty">
        <h2>🚧 Coming soon!</h2>
        <p>Osa on vielä kehitteillä. Palaa myöhemmin.</p>
        <button onClick={() => navigate(-1)}>🔙 Palaa takaisin</button>
      </div>
    );
  }

  return (
    <div className="final-container">
      <h2>🎯 Lopputulos</h2>
      <p className="score">Pisteesi: {score} / {questions.length}</p>

      <div className="final-results">
        {questions.map((q, i) => (
          <div key={i} className={`final-box ${answers[i] === q.imageLink ? 'correct' : 'incorrect'}`}>
            <img src={answers[i]} alt={`answer-${i}`} className="final-image" />
            <ResultPart1
              question={q}
              userAnswer={answers[i]}
              isCorrect={answers[i] === q.imageLink}
            />
          </div>
        ))}
      </div>

      <div className="final-buttons">
        <button onClick={() => navigate(-1)}>🔁 Tee uudelleen</button>
        <button onClick={() => navigate('/course/a1')}>🏠 Takaisin kurssille</button>
      </div>
    </div>
  );
};

export default Part1Final;
