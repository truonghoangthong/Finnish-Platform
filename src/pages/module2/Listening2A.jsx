import React, { useEffect, useState, useRef } from "react";
import AnswerPopup2 from "./AnswerPopup2";
import QuestionBox from "./QuestionBox";
import FloatingMascot from "./FloatingMascot";
import useAudioPlayer from "@/utils/useAudioPlayer";
import AudioPlayer from "@/components/audioPlayer/AudioPlayer";
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
  const [showPopupScript, setShowPopupScript] = useState(false); // ✅ tách script popup
  const [showScript, setShowScript] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const autoAudioRef = useRef(null);

  const stopAllAudio = () => {
    if (autoAudioRef.current) {
      autoAudioRef.current.pause();
      autoAudioRef.current = null;
    }
    if (window.currentGlobalAudio) {
      window.currentGlobalAudio.pause();
      window.currentGlobalAudio = null;
    }
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
    wrongScript
  ) => {
    stopAllAudio();
    setIsCorrect(correct);
    setPopupScript(correct ? correctScript : wrongScript);
    setPopupAudio(correct ? correctAudio : wrongAudio);
    setShowPopup(true);
    setShowPopupScript(false); // ✅ reset popup script
    setShowScript(false); // ✅ reset script
    const feedbackAudio = new Audio(
      `data:audio/mp3;base64,${correct ? correctAudio : wrongAudio}`
    );
    feedbackAudio.play().catch(() => {});
    window.currentGlobalAudio = feedbackAudio;

    if (correct) {
      setAnsweredCorrect((prev) =>
        prev.includes(currentQuestion) ? prev : [...prev, currentQuestion]
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
      updateProgress(userId, "A1", "the_break_room", "module2", progress.toString());

      setShowFinalPopup(true);
      return;
    }

    const unanswered = allQuestions.filter(
      (q) => !answeredCorrect.includes(q)
    );
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
      `data:audio/mp3;base64,${currentQuestion.audioBase64}`
    );
    newAudio.currentTime = 0;
    newAudio.play().catch(() => {});
    autoAudioRef.current = newAudio;

    return () => {
      stopAllAudio();
    };
  }, [currentIndex, phase]);

  return (
    <div className="listening2a-container">
      {(phase === "intro" || phase === "task") && (
        <div className="task-header oneline">
          <div className="audio-wrapper">
            <AudioPlayer
              src={`data:audio/mp3;base64,${data?.title?.audioBase64}`}
              size="small"
            />
          </div>
          <span className="task-title">Tehtävä 2A</span>
          <span className="task-description">{data?.title?.script}</span>
        </div>
      )}

      {phase === "intro" && (
        <div className="question-image-wrapper">
          <img src={data.imageLink} alt="lesson" className="question-image" />
          <div className="mascot-in-image">
            <FloatingMascot
              audio={data.introduction?.audioBase64}
              script={data.introduction?.script}
              onNext={handleStartTask}
             
            />
          </div>
        </div>
      )}

      {phase === "task" && (
        <>
          <div className="question-tabs">
            {allQuestions.map((_, i) => (
              <div
                key={i}
                className={`question-tab ${i === currentIndex ? "active" : ""} ${
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

          <div className="question-image-wrapper">
            <img src={data.imageLink} alt="lesson" className="question-image" />
            {currentQuestion && (
              <QuestionBox
                data={currentQuestion}
                allBoxes={allQuestions}
                onAnswer={handleAnswer}
                index={currentIndex}
                isAnswered={answeredCorrect.includes(currentQuestion)}
              />
            )}
          </div>

          <div className="question-controls">
            <button
              onClick={() => {
                stopAllAudio();
                const manualAudio = new Audio(
                  `data:audio/mp3;base64,${currentQuestion?.audioBase64}`
                );
                manualAudio.play().catch(() => {});
                window.currentGlobalAudio = manualAudio;
              }}
            >
              🔊 Kuuntele kysymys
            </button>
            <button onClick={() => setShowScript(!showScript)}>
              📜 {showScript ? "Piilota Kysymys" : "Näytä Kysymys"}
            </button>
            <button onClick={handleNext}>➡️ Seuraava</button>
          </div>

          {showScript && currentQuestion?.script && (
            <div className="script-box">
              <p>{currentQuestion.script}</p>
            </div>
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
              Jatka osaan 2B →
            </button>
          </div>
        </div>
      )}

      {phase === "conclusion" && (
        <div className="question-image-wrapper">
          <img src={data.imageLink} alt="lesson" className="question-image" />
          <div className="mascot-in-image">
            <FloatingMascot
              audio={data.conclusion?.audioBase64}
              script={data.conclusion?.script}
              isOutro={true}
              onNext={handleFinish}
              onRetry={handleRetry}
              autoPlay={true}
            />
          </div>
        </div>
      )}

      {phase === "conclusion" && !showFinalPopup && (
        <div className="practice-again-wrapper">
          <button className="popup-button" onClick={handleRetry}>
            🔁 Harjoittele uudelleen
          </button>
        </div>
      )}

      {showPopup && (
        <AnswerPopup2
          isCorrect={isCorrect}
          popupScript={popupScript}
          showScript={showPopupScript} // ✅ tách script popup riêng
          onShowScript={() => setShowPopupScript(true)} // ✅ toggle riêng popup
          onNext={handleNext}
          onRetry={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default Listening2A;
