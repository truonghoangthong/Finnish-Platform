import React, { useEffect, useState, useRef } from "react";
import AnswerPopup2 from "./AnswerPopup2";
import QuestionBox from "./QuestionBox";
import FloatingMascot from "./FloatingMascot";
import AudioPlayer from "@/components/audioPlayer/AudioPlayer";
import confetti from "canvas-confetti";
import { updateProgress } from "@/utils/updateProgress";
import { calculateModule2Progress } from "@/utils/calculateProgress";

const Listening2B = ({ data }) => {
  const [phase, setPhase] = useState("intro");
  const [allQuestions, setAllQuestions] = useState([]);
  const [answeredCorrect, setAnsweredCorrect] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [popupScript, setPopupScript] = useState("");
  const [popupAudio, setPopupAudio] = useState(null);
  const [showScript, setShowScript] = useState(false);
  const [showPopupScript, setShowPopupScript] = useState(false);
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
    setShowScript(false);
    setShowPopupScript(false);

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
        part2bViewed: true,
        part2bCorrect: true,
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

  const handleRetry = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setAllQuestions(shuffled);
    setAnsweredCorrect([]);
    setCurrentQuestion(shuffled[0]);
    setCurrentIndex(0);
    setIsPracticeMode(true);
    setShowFinalPopup(false);
    setPhase("task");
  };

  useEffect(() => {
    if (currentIndex === 0 || !currentQuestion?.audioBase64) return;
    if (phase !== "task") return;

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
    <div className="listening2b-container">
      {(phase === "intro" || phase === "task") && (
        <div className="task-header oneline">
          <div className="audio-wrapper">
            <AudioPlayer
              src={`data:audio/mp3;base64,${data?.title?.audioBase64}`}
              size="small"
            />
          </div>
          <span className="task-title">Tehtävä 2B</span>
          <span className="task-description">{data?.title?.script}</span>
        </div>
      )}

      {phase === "intro" && (
        <div className="question-image-wrapper">
          <img src={data.imageLink} alt="lesson" className="question-img" />
          <div className="mascot-in-image">
            <FloatingMascot
              key={phase}
              audio={data.introduction?.audioBase64}
              script={data.introduction?.script}
              onNext={() => setPhase("task")}
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

          <div className="question-image-wrapper" style={{ position: "relative" }}>
            <img src={data.imageLink} alt="lesson" className="question-img" />
            {currentQuestion && (
              <QuestionBox
                data={currentQuestion}
                allBoxes={allQuestions}
                index={currentIndex}
                onAnswer={handleAnswer}
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
            <p className="popup-word">Hienoa!</p>
            <p className="popup-message success">Olet suorittanut osan 2B.</p>
            <p className="popup-ipa">Great work – keep going!</p>
            <button
              className="popup-button"
              onClick={() => {
                setShowFinalPopup(false);
                setPhase("conclusion");
              }}
            >
              ✅ OK
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
                key={phase}
                audio={data.conclusion?.audioBase64}
                script={data.conclusion?.script}
                isOutro={true}
                onNext={() => setPhase("task")}
                onRetry={handleRetry}
                autoPlay={true}
              />
            </div>
          </div>

          <div className="practice-again-wrapper">
            <button className="popup-button" onClick={handleRetry}>
              🔁 Harjoittele uudelleen
            </button>
          </div>
        </>
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
  );
};

export default Listening2B;