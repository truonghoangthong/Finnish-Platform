import { useState, useEffect, useRef } from "react";
import "./module3.css";
import "../../components/loader/loader.css";
import Loader from "../../components/loader/loader";

const VerbMatchingGame = ({ questions, verbs, showResults, results, onStateChange }) => {
  const [userInputs, setUserInputs] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setLoading(false);
    }
  }, [questions]);

  useEffect(() => {
    if (showResults && results) {
      const newStatusMap = {};
      Object.keys(results).forEach((pairId) => {
        newStatusMap[pairId] = results[pairId] ? "correct" : "incorrect";
      });
      setStatusMap(newStatusMap);
    } else {
      setStatusMap({});
    }
  }, [showResults, results]);

  useEffect(() => {
    onStateChange({
      userInputs,
      questions
    });
  }, [userInputs, questions, onStateChange]);

  const handleInputChange = (pairId, value) => {
    setUserInputs((prev) => ({
      ...prev,
      [pairId]: value
    }));
    setStatusMap((prev) => {
      const newStatus = { ...prev };
      delete newStatus[pairId];
      return newStatus;
    });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const playAudio = (audioBase64) => {
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play().catch((e) => console.error("Audio play failed:", e));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="module3-wrapper">
      <div className="module3-verbs-list">
        <div className="module3-verbs-container">
          {verbs.map((v) => (
            <div
              key={v.id}
              className="module3-verb-tag"
              onClick={() => {
                if (!showResults || statusMap[v.id] === "correct") {
                  playAudio(v.audioBase64);
                }
              }}
              style={{
                cursor:
                  (!showResults || statusMap[v.id] === "correct") && v.audioBase64
                    ? "pointer"
                    : "default",
              }}
            >
              {v.script} – {v.meaning}
            </div>
          ))}
        </div>
      </div>

      {/* MATCHING SECTION */}
      <div className="module3-matching-section part3c">
        <div className="module3-input-column">
          {questions.map((q, index) => (
            <div
              key={`left-${q.pairId}`}
              className={`module3-input-card ${statusMap[q.pairId] || ""}`}
            >
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={userInputs[q.pairId] || ""}
                onChange={(e) => handleInputChange(q.pairId, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="Type verb..."
                className="module3-verb-input"
              />
            </div>
          ))}
        </div>

        <div className="module3-matching-column">
          {questions.map((q) => (
            <div
              key={`right-${q.pairId}`}
              className="module3-matching-card"
              onClick={() => {
                if (!showResults || statusMap[q.pairId] === "correct") {
                  playAudio(q.audioBase64);
                }
              }}
              style={{
                cursor:
                  (!showResults || statusMap[q.pairId] === "correct") && q.audioBase64
                    ? "pointer"
                    : "default",
              }}
            >
              {q.sentence}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerbMatchingGame;
