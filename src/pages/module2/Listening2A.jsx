import React, { useEffect, useState, useRef } from "react";
import AnswerPopup2 from "./AnswerPopup2";
import QuestionBox from "./QuestionBox";
import FloatingMascot from "./FloatingMascot";
import Title from "@/components/title/Title"; 
import confetti from "canvas-confetti";
import { updateProgress } from "@/utils/updateProgress";
import { calculateModule2Progress } from "@/utils/calculateProgress";

const Listening2A = ({ data, onScrollToPartB }) => {
  const [phase, setPhase] = useState("intro");
  const [allQuestions, setAllQuestions] = useState([]);
  const [answeredCorrect, setAnsweredCorrect] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [popupScript, setPopupScript] = useState("");
  const [popupAudio, setPopupAudio] = useState(null);
  const [showPopupScript, setShowPopupScript] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const autoAudioRef = useRef(null);

  const [isQPlaying, setIsQPlaying] = useState(false);
  const questionAudioRef = useRef(null);

  const [showIntroScript, setShowIntroScript] = useState(false);
  const [showOutroScript, setShowOutroScript] = useState(false);

  const introScriptRef = useRef(null);
  const taskScriptRef = useRef(null);
  const outroScriptRef = useRef(null);

  const stopAllAudio = () => {
    if (autoAudioRef.current) {
      autoAudioRef.current.pause();
      autoAudioRef.current = null;
    }
    if (window.currentGlobalAudio) {
      window.currentGlobalAudio.pause();
      window.currentGlobalAudio = null;
    }
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      setIsQPlaying(false);
    }
  };

  const toggleQuestionAudio = () => {
    if (!currentQuestion?.audioBase64) return;

    if (isQPlaying) {
      questionAudioRef.current?.pause();
      setIsQPlaying(false);
      return;
    }

    stopAllAudio();
    const audio = new Audio(
      `data:audio/mp3;base64,${currentQuestion.audioBase64}`,
    );
    questionAudioRef.current = audio;
    audio
      .play()
      .then(() => {
        setIsQPlaying(true);
        window.currentGlobalAudio = audio;
      })
      .catch(() => {});
    audio.onended = () => setIsQPlaying(false);
  };

  useEffect(() => {
    const qList = Object.entries(data)
      .filter(([k]) => k.startsWith("question"))
      .map(([_, v]) => v);
    const shuffled = qList.sort(() => Math.random() - 0.5);
    setAllQuestions(shuffled);
    setAnsweredCorrect([]);
    setCurrentQuestion(shuffled[0]);
    setCurrentIndex(0);
  }, [data]);

  const handleAnswer = (
    correct,
    correctAudio,
    wrongAudio,
    correctScript,
    wrongScript,
  ) => {
    stopAllAudio();
    setIsCorrect(correct);
    setPopupScript(correct ? correctScript : wrongScript);
    setPopupAudio(correct ? correctAudio : wrongAudio);
    setShowPopup(true);
    setShowPopupScript(false);
    setShowScript(false);

    const feedbackAudio = new Audio(
      `data:audio/mp3;base64,${correct ? correctAudio : wrongAudio}`,
    );
    feedbackAudio.play().catch(() => {});
    window.currentGlobalAudio = feedbackAudio;

    if (correct) {
      setAnsweredCorrect((prev) =>
        prev.includes(currentQuestion) ? prev : [...prev, currentQuestion],
      );
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    setShowScript(false);
    setShowPopupScript(false);

    if (answeredCorrect.length === allQuestions.length) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      const celebration = new Audio("/sounds/celebration.mp3");
      celebration.play();

      const userId = localStorage.getItem("userId");
      const progress = calculateModule2Progress({
        part2aViewed: true,
        part2aCorrect: true,
        part2bViewed: false,
        part2bCorrect: false,
      });
      updateProgress(
        userId,
        "A1",
        "the_break_room",
        "module2",
        progress.toString(),
      );

      setShowFinalPopup(true);
      return;
    }

    const unanswered = allQuestions.filter((q) => !answeredCorrect.includes(q));
    const currentIdx = unanswered.indexOf(currentQuestion);
    const nextIdx = (currentIdx + 1) % unanswered.length;
    const nextQ = unanswered[nextIdx];

    setCurrentQuestion(nextQ);
    setCurrentIndex(allQuestions.indexOf(nextQ));
  };

  const handleTabClick = (index) => {
    setCurrentQuestion(allQuestions[index]);
    setCurrentIndex(index);
  };

  const goToConclusion = () => {
    setShowFinalPopup(false);
    setPhase("conclusion");
  };

  const handleFinish = () => {
    if (onScrollToPartB) {
      onScrollToPartB();
    }
  };

  const handleRetry = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setAllQuestions(shuffled);
    setAnsweredCorrect([]);
    setCurrentQuestion(shuffled[0]);
    setCurrentIndex(0);
    setIsPracticeMode(true);
    setPhase("task");
  };

  const handleStartTask = () => {
    stopAllAudio();
    setPhase("task");
  };

  useEffect(() => {
    if (phase !== "task") return;
    if (currentIndex === 0 || !currentQuestion?.audioBase64) return;

    stopAllAudio();

    const newAudio = new Audio(
      `data:audio/mp3;base64,${currentQuestion.audioBase64}`,
    );
    newAudio.currentTime = 0;
    newAudio.play().catch(() => {});
    autoAudioRef.current = newAudio;

    return () => {
      stopAllAudio();
    };
  }, [currentIndex, phase]);

  useEffect(() => {
    if (showIntroScript) {
      setTimeout(() => {
        introScriptRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 120);
    }
  }, [showIntroScript]);

  useEffect(() => {
    if (showScript) {
      setTimeout(() => {
        taskScriptRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 120);
    }
  }, [showScript]);

  useEffect(() => {
    if (showOutroScript) {
      setTimeout(() => {
        outroScriptRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 120);
    }
  }, [showOutroScript]);

  return (
    <div className="listening2a-container">
      {(phase === "intro" || phase === "task") && (
        <Title
          audioBase64={data?.title?.audioBase64}
          script={data?.title?.script}
        />
      )}

      {phase === "intro" && (
        <>
          <div className="question-image-wrapper">
            <img src={data.imageLink} alt="lesson" className="question-img" />
            <div className="mascot-in-image">
              <FloatingMascot
                audio={data.introduction?.audioBase64}
                script={data.introduction?.script}
                onNext={handleStartTask}
                externalScript={true}
                isScriptVisible={showIntroScript}
                onToggleScript={() => setShowIntroScript((v) => !v)}
              />
            </div>
          </div>

          {showIntroScript && (
            <section className="transcript" ref={introScriptRef}>
              <p>📜 {data.introduction?.script}</p>
            </section>
          )}
        </>
      )}

      {phase === "task" && (
        <>
          <div className="question-tabs">
            {allQuestions.map((_, i) => (
              <div
                key={i}
                className={`tab ${i === currentIndex ? "active" : ""} ${
                  answeredCorrect.includes(allQuestions[i]) ? "correct" : ""
                }`}
                onClick={() => {
                  if (isPracticeMode) handleTabClick(i);
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>

          <div
            className="question-image-wrapper"
            style={{ position: "relative" }}
          >
            <img src={data.imageLink} alt="lesson" className="question-img" />
            {currentQuestion && (
              <QuestionBox
                data={currentQuestion}
                allBoxes={allQuestions}
                onAnswer={handleAnswer}
                index={currentIndex}
                isAnswered={answeredCorrect.includes(currentQuestion)}
              />
            )}

            {showPopup && (
              <AnswerPopup2
                isCorrect={isCorrect}
                popupScript={popupScript}
                showScript={showPopupScript}
                onShowScript={() => setShowPopupScript(true)}
                onNext={handleNext}
                onRetry={() => setShowPopup(false)}
              />
            )}
          </div>

          <div className="question-controls">
            <button
              className={`control-btn ${isQPlaying ? "playing" : ""}`}
              onClick={toggleQuestionAudio}
            >
              <span className="icon" aria-hidden>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02z" />
                </svg>
              </span>
              <span>Kuuntele kysymys</span>
              {isQPlaying && (
                <span className="audio-wave" aria-hidden>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
              )}
            </button>

            <button onClick={() => setShowScript(!showScript)}>
              📜 {showScript ? "Piilota Kysymys" : "Näytä Kysymys"}
            </button>
            <button onClick={handleNext}>➡️ Seuraava</button>
          </div>

          {showScript && currentQuestion?.script && (
            <section className="transcript" ref={taskScriptRef}>
              <p>📜 {currentQuestion.script}</p>
            </section>
          )}
        </>
      )}

      {showFinalPopup && (
        <div className="answer-popup">
          <div className="popup-card correct">
            <span className="popup-icon">🎉</span>
            <p className="popup-word">Hyvä!</p>
            <p className="popup-message success">Olet suorittanut osan 2A.</p>
            <p className="popup-ipa">Great job – keep it up!</p>
            <button className="popup-button" onClick={goToConclusion}>
              Jatka →
            </button>
          </div>
        </div>
      )}

      {phase === "conclusion" && (
        <>
          <div className="question-image-wrapper">
            <img src={data.imageLink} alt="lesson" className="question-img" />
            <div className="mascot-in-image">
              <FloatingMascot
                audio={data.conclusion?.audioBase64}
                script={data.conclusion?.script}
                isOutro={true}
                onNext={handleFinish}
                onRetry={handleRetry}
                autoPlay={true}
                externalScript={true}
                isScriptVisible={showOutroScript}
                onToggleScript={() => setShowOutroScript((v) => !v)}
              />
            </div>
          </div>

          {showOutroScript && (
            <section className="transcript" ref={outroScriptRef}>
              <p>📜 {data.conclusion?.script}</p>
            </section>
          )}
        </>
      )}

      {phase === "conclusion" && !showFinalPopup && (
        <div className="practice-again-wrapper">
          <button className="popup-button" onClick={handleRetry}>
            🔁 Harjoittele uudelleen
          </button>
        </div>
      )}
    </div>
  );
};

export default Listening2A;
