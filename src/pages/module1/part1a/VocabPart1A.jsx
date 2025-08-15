import React, { useEffect, useState, useMemo } from 'react';
import AnswerPopup from './AnswerPopup';
import './vocab-part1a.css';
import { updateProgress } from '../../../utils/api';
import { calculateModule1Progress } from '../../../utils/calculateProgress';
import confetti from 'canvas-confetti';
import AudioPlayer from '../../../components/audioPlayer/audioPlayer';
import Title from '../../../components/title/Title'; // ✅ dùng Title component

const VocabPart1A = ({ data }) => {
  const { title, ...questionsRaw } = data;
  const allQuestions = Object.values(questionsRaw);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingIndexes, setRemainingIndexes] = useState(allQuestions.map((_, idx) => idx));
  const [audio, setAudio] = useState(null);
  const [titleAudio, setTitleAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [answerStatus, setAnswerStatus] = useState({});
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [questionChangeKey, setQuestionChangeKey] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const allImages = useMemo(() => {
    return allQuestions.map((q) => q.imageLink).filter(Boolean);
  }, [data]);

  const currentQuestion = allQuestions[remainingIndexes[currentIndex]];

  useEffect(() => {
    const shuffled = allQuestions.map((_, idx) => idx).sort(() => Math.random() - 0.5);
    setRemainingIndexes(shuffled);
    setCurrentIndex(0);
    setQuestionChangeKey(0);
  }, [data]);

  useEffect(() => {
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
  }, [questionChangeKey]);

  // ✅ ĐÃ CHỈNH – không autoplay câu đầu tiên
  useEffect(() => {
    if (!currentQuestion?.audioBase64) return;
    const audioEl = new Audio(`data:audio/mp3;base64,${currentQuestion.audioBase64}`);
    setAudio(audioEl);

    const tryPlay = async () => {
      if (questionChangeKey === 0) return; // ❌ không phát câu đầu
      try {
        audioEl.currentTime = 0;
        await audioEl.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    tryPlay();
    return () => audioEl.pause();
  }, [questionChangeKey]);

  useEffect(() => {
    if (!title?.audioBase64) return;
    const audioEl = new Audio(`data:audio/mp3;base64,${title.audioBase64}`);
    setTitleAudio(audioEl);
  }, [title]);

  const toggleAudio = () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleTitleAudio = () => {
    if (titleAudio) titleAudio.play();
  };

  const handleImageClick = (imgSrc) => {
    if (showPopup || isLoading) return;

    const correct = imgSrc === currentQuestion.imageLink;
    setIsCorrect(correct);
    setShowPopup(true);

    if (correct) {
      setAnsweredCorrectly((prev) => [...prev, remainingIndexes[currentIndex]]);
    }

    setAnswerStatus((prev) => ({
      ...prev,
      [remainingIndexes[currentIndex]]: correct ? 'correct' : 'wrong',
    }));
  };

  useEffect(() => {
    if (showPopup && isCorrect === false) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showPopup, isCorrect]);

  const handleNext = () => {
    setShowPopup(false);
    setIsLoading(true);
    audio?.pause();
    setIsPlaying(false);

    setTimeout(() => {
      const remaining = remainingIndexes.filter((idx) => !answeredCorrectly.includes(idx));

      if (remaining.length === 0) {
        setIsDone(true);
        const userId = localStorage.getItem('userId');
        const progress = calculateModule1Progress({
          part1aViewed: true,
          part1aCorrect: true,
          part1bViewed: false,
          part1bCorrect: false,
        });

        updateProgress({
          userId,
          level: 'A1',
          lesson: 'the_break_room',
          module: 'module1',
          progress: progress.toString(),
        });

        setIsLoading(false);
        return;
      }

      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      setRemainingIndexes(shuffled);
      setCurrentIndex(0);
      setQuestionChangeKey((prev) => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (isDone && answeredCorrectly.length === allQuestions.length) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      const celebration = new Audio('/sounds/celebration.mp3');
      celebration.play();
      setShowFinalPopup(true);
    }
  }, [isDone]);

  const handleGoToPart1B = () => {
    setShowFinalPopup(false);
    const bSection = document.getElementById('part1b');
    if (bSection) bSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetPractice = () => {
    setIsPracticeMode(true);
    setAnsweredCorrectly([]);
    setAnswerStatus({});
    setShowFinalPopup(false);
    setIsDone(false);
    const indexes = allQuestions.map((_, idx) => idx);
    setRemainingIndexes(indexes);
    setCurrentIndex(0);
    setQuestionChangeKey((prev) => prev + 1);
  };

  return (
    <div className="vocab1a-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* ✅ Dùng Title component thay vì viết lại HTML */}
      <Title
        audioBase64={title?.audioBase64}
        // taskLabel={title?.taskLabel || 'Tehtävä 1A'}
        script={title?.script}
      />

      <div className="question-tabs">
        {allQuestions.map((_, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (isPracticeMode) {
                const newIdx = remainingIndexes.indexOf(idx);
                if (newIdx !== -1) {
                  setCurrentIndex(newIdx);
                  setQuestionChangeKey((prev) => prev + 1);
                }
              }
            }}
            className={`tab 
              ${remainingIndexes[currentIndex] === idx ? 'active' : ''} 
              ${answerStatus[idx] === 'correct' ? 'correct' : ''} 
              ${answerStatus[idx] === 'wrong' ? 'wrong' : ''}`}
            style={{ cursor: isPracticeMode ? 'pointer' : 'default' }}
          >
            {String(idx + 1).padStart(2, '0')}
          </div>
        ))}
      </div>

      <div className="question-audio">
        <AudioPlayer src={`data:audio/mp3;base64,${currentQuestion?.audioBase64}`} size="medium" />
      </div>

      <div className="image-container">
        <div className="image-options">
          {shuffledImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`option-${idx}`}
              onClick={() => handleImageClick(img)}
              className="option-img"
            />
          ))}
        </div>
      </div>

      {showPopup && (
        <AnswerPopup
          isCorrect={isCorrect}
          image={currentQuestion.imageLink}
          script={currentQuestion.script}
          ipa={currentQuestion.ipa}
          onClose={handleNext}
        />
      )}

      {showFinalPopup && (
        <div className="answer-popup">
          <div className="popup-card correct">
            <span className="popup-icon">🎉</span>
            <p className="popup-word">Hyvä!</p>
            <p className="popup-message success">Olet suorittanut osan 1A.</p>
            <p className="popup-ipa">Great job – keep it up!</p>
            <button className="popup-button" onClick={handleGoToPart1B}>
              Jatka osaan 1B →
            </button>
          </div>
        </div>
      )}

      {isDone && !showFinalPopup && (
        <div className="practice-again-wrapper">
          <button className="popup-button" onClick={handleResetPractice}>
            🔁 Harjoittele uudelleen
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabPart1A;
