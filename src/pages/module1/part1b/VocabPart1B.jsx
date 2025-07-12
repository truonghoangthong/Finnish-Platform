import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './vocab-part1b.css';
import PopupScore from '../../../components/score/PopupScore';
import AudioPlayer from '../../../components/audioPlayer/AudioPlayer';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const VocabPart1B = ({ data }) => {
  const { title, ...rawQuestions } = data || {};

  const [questions, setQuestions] = useState([]);
  const [dragImages, setDragImages] = useState([]);
  const [audioRefs, setAudioRefs] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [dragItem, setDragItem] = useState(null);
  const [hasReviewedAnswers, setHasReviewedAnswers] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const questionList = Object.values(rawQuestions);
    const shuffled = shuffleArray(questionList);
    setQuestions(shuffled);
    setAudioRefs(
      shuffled.map(q => new Audio(`data:audio/mp3;base64,${q.audioBase64}`))
    );
    setDragImages(shuffleArray(shuffled.map(q => q.imageLink)));
  }, [data]);

  const handlePlayAudio = (index) => {
    if (!audioRefs[index]) return;

    if (playingIndex === index) {
      audioRefs[index].pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null && audioRefs[playingIndex]) audioRefs[playingIndex].pause();
      audioRefs[index].play();
      setPlayingIndex(index);
      audioRefs[index].onended = () => setPlayingIndex(null);
    }
  };

  const handleCardClick = (i, isCorrect) => {
    if (!hasReviewedAnswers) return;

    if (isCorrect) {
      handlePlayAudio(i);
    } else {
      setFlippedCards(prev => {
        const isNowFlipped = !prev[i];
        if (isNowFlipped) handlePlayAudio(i);
        return { ...prev, [i]: isNowFlipped };
      });
    }
  };

  const handleDragStart = (img) => setDragItem(img);

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragItem) {
      setAnswers(prev => ({ ...prev, [index]: dragItem }));
    }
  };

  const handleReset = () => {
    const questionList = Object.values(rawQuestions);
    const reshuffled = shuffleArray(questionList);
    setQuestions(reshuffled);
    setAudioRefs(
      reshuffled.map(q => new Audio(`data:audio/mp3;base64,${q.audioBase64}`))
    );
    setDragImages(shuffleArray(reshuffled.map(q => q.imageLink)));
    setAnswers({});
    setShowResult(false);
    setScore(0);
    setHasReviewedAnswers(false);
    setFlippedCards({});
  };

  const handleSubmit = () => {
    let tempScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.imageLink) tempScore++;
    });
    setScore(tempScore);
    setShowResult(true);
  };

  const handleReviewDone = () => {
    setShowResult(false);
    setHasReviewedAnswers(true);
  };

  const isCompleted = Object.keys(answers).length === questions.length;

  return (
    <div className="vocab1b-wrapper">
      {/* ✅ NEW: Uniform header like Part1A */}
      <div className="task-header oneline">
        <div className="audio-wrapper">
          <AudioPlayer src={`data:audio/mp3;base64,${title?.audioBase64}`} size="small" />
        </div>
        <span className="task-title">Tehtävä 1B</span>
        <span className="task-description">{title?.script}</span>
      </div>

      {/* Drop zone */}
      <div className="vocab1b-drop-area">
        <div className={`vocab1b-image-options ${questions.length < 7 ? 'center-flex' : 'grid-7'}`}>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.imageLink;
            const hasAnswered = answers[i];
            const isFlipped = flippedCards[i];
            const playingClass = playingIndex === i ? 'is-playing' : '';

            return (
              <div
                key={i}
                className={`vocab1b-drop-box ${hasReviewedAnswers ? (isCorrect ? 'correct' : 'incorrect') : ''} ${playingClass} ${isFlipped ? 'flipped' : ''}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, i)}
                onClick={() => handleCardClick(i, isCorrect)}
              >
                <AudioPlayer src={`data:audio/mp3;base64,${q.audioBase64}`} />
                <div className="vocab1b-drop-image">
                  {hasReviewedAnswers && !isCorrect && isFlipped ? (
                    <img src={q.imageLink} alt="correct-answer" />
                  ) : hasAnswered ? (
                    <img src={answers[i]} alt="selected" />
                  ) : (
                    <img src="/question-box.png" alt="?" />
                  )}
                </div>

                {hasReviewedAnswers && isCorrect && (
                  <div className="vocab1b-feedback">
                    <span className="tick">✅</span>
                    <p className="script">{q.script}</p>
                    {q.ipa && <p className="ipa">[{q.ipa}]</p>}
                  </div>
                )}

                {hasReviewedAnswers && !isCorrect && isFlipped && (
                  <div className="vocab1b-feedback">
                    <span className="tick">✅</span>
                    <p className="script">{q.script}</p>
                    {q.ipa && <p className="ipa">[{q.ipa}]</p>}
                  </div>
                )}

                {hasReviewedAnswers && !isCorrect && !isFlipped && hasAnswered && (
                  <div className="vocab1b-feedback">
                    <span className="cross">❌</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag zone */}
      <div className="vocab1b-drag-wrapper">
        <div className="vocab1b-drag-zone">
          {dragImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`option-${i}`}
              draggable
              onDragStart={() => handleDragStart(img)}
              className="vocab1b-drag-image"
            />
          ))}
        </div>
      </div>

     <div className="vocab1b-buttons">
  <button onClick={handleReset}>Yritä uudelleen</button>

  {!hasReviewedAnswers && isCompleted && (
    <button onClick={handleSubmit}>Lähetä</button>
  )}

  {hasReviewedAnswers && (
    <button onClick={() => navigate("/course/a1/lesson-1/vocabulary/1a/result")}>
      Seuraava
    </button>
  )}
</div>


      {showResult && (
        <PopupScore
          score={score}
          total={questions.length}
          onAnswersReviewed={handleReviewDone}
        />
      )}
    </div>
  );
};

export default VocabPart1B;
