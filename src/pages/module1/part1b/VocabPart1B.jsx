import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './vocab-part1b.css';
import PopupScore from '../../../components/score/PopupScore';
import AudioPlayer from '../../../components/audioPlayer/audioPlayer';
import Title from '../../../components/title/Title'; // ✅ Thêm Title component

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
      {/* ✅ Dùng Title component để hiển thị tiêu đề */}
      <Title
        taskLabel="Tehtävä 1B"
        script={title?.script}
        audioBase64={title?.audioBase64}
      />

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
                  <img
                    src={
                      hasReviewedAnswers && !isCorrect && isFlipped
                        ? q.imageLink
                        : hasAnswered
                        ? answers[i]
                        : '/question-box.png'
                    }
                    alt="option"
                  />
                </div>

                {hasReviewedAnswers && (
                  <div className="vocab1b-feedback">
                    <span className={isCorrect ? 'tick' : isFlipped ? 'tick' : 'cross'}>
                      {isCorrect || isFlipped ? <span style={{ color: "#4CAF50", fontWeight: "bold" }}>✔</span> : hasAnswered ? '❌' : ''}
                    </span>
                    <p className={`script ${!isCorrect && !isFlipped ? 'dimmed' : ''}`}>{q.script}</p>
                    {q.ipa && <p className={`ipa ${!isCorrect && !isFlipped ? 'dimmed' : ''}`}>[{q.ipa}]</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
        <button className='shared-btn' onClick={handleReset}>Yritä uudelleen</button>

        {!hasReviewedAnswers && isCompleted && (
          <button className='shared-btn' onClick={handleSubmit}>Lähetä</button>
        )}

        {hasReviewedAnswers && (
          <button className='shared-btn' onClick={() => navigate("/course/a1/lesson-1/listening")}>Seuraava</button>
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
