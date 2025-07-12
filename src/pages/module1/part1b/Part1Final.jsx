// Part1Final.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './part1-final.css';
// import ResultPart1 from "../part1a/ResultPart1";
// import { updateProgress } from '../../../utils/api';
// import { calculateModule1Progress } from '../../../utils/calculateProgress';

const Part1Final = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // const { score, answers, questions, userId, part1aViewed, part1aCorrect } = location.state || {};

  // useEffect(() => {
  //   if (!userId || !questions) return;

  //   const progress = calculateModule1Progress({
  //     part1aViewed: part1aViewed || true,
  //     part1aCorrect: part1aCorrect || false,
  //     part1bViewed: true,
  //     part1bCorrect: score === questions.length
  //   });

  //   updateProgress({
  //     userId,
  //     level: 'A1',
  //     lesson: 'the_break_room',
  //     module: 'module1',
  //     progress: progress.toString()
  //   });
  // }, [score, questions, userId, part1aViewed, part1aCorrect]);

  // if (!questions || !answers || typeof score !== 'number') {
  //   return (
  //     <div className="final-container empty">
  //       <p>Ei tietoja saatavilla. Palaa ja yritä uudelleen.</p>
  //       <button onClick={() => navigate(-1)}>🔙 Palaa takaisin</button>
  //     </div>
  //   );
  // }

  return (
    <div className="final-container empty">
      <h2>🚧 Coming Soon</h2>
      <p className="coming-text">This result page is under construction and will be available in a future update.</p>
      <button onClick={() => navigate(-1)}>🔙 Back to lesson</button>
    </div>
  );
};

export default Part1Final;
