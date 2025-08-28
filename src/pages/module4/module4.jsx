import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./module4.css";
import "../../components/loader/loader.css";
import Mascot from "../../components/mascot/Mascot";
import Menu from "../../components/menu/menu";
import Title from "../../components/title/Title";

const API = "https://finnish-platform-thong-truongs-projects.vercel.app/api";

// Comment hàm parseFeedback vì không dùng đến phần 4b
/*
const parseFeedback = (feedback) => {
  try {
    const clean = feedback
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch {
    return {
      grammar_feedback: feedback,
      vocabulary_feedback: "",
      overall_feedback: "",
      encouragement: "",
    };
  }
};
*/

const extractQuestions = (data, part, count, hasAnswer = false) =>
  Array.from({ length: count }, (_, i) => {
    const q = data?.result?.[part]?.[`question${i + 1}`];
    return q
      ? {
          id: `${part}-${i + 1}`,
          text: q.script,
          audio: q.audioBase64,
          ...(hasAnswer ? { answer: q.answer } : {}),
        }
      : null;
  }).filter(Boolean);

const toggleAudio = (
  part,
  index,
  questions,
  activeAudio,
  setActiveAudio,
  currentAudio,
  setCurrentAudio,
) => {
  if (
    activeAudio?.part === part &&
    activeAudio?.index === index &&
    currentAudio
  ) {
    currentAudio.pause();
    setCurrentAudio(null);
    setActiveAudio(null);
    return;
  }
  const base64 = questions[index]?.audio;
  if (base64) {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    setCurrentAudio(audio);
    setActiveAudio({ part, index });
    audio.play();
  }
};

const Module4 = () => {
  const location = useLocation();
  const [moduleData, setModuleData] = useState({
    part4a: {},
    // part4b: {},
    part4c: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [translations, setTranslations] = useState({});
  const [answers, setAnswers] = useState({});
  const [currentAudio, setCurrentAudio] = useState(null);
  const [activeAudio, setActiveAudio] = useState(null);
  const [showFinnishInstruction, setShowFinnishInstruction] = useState(false);
  const [checkingAnswers, setCheckingAnswers] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    // part4b: [],
    part4c: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const pathParts = location.pathname.split("/");
        const level = pathParts[pathParts.indexOf("course") + 1] || "a1";
        const moduleName = location.pathname.includes("lesson-2")
          ? "another_module"
          : "the_break_room";

        const [a, c] = await Promise.all([
          axios.get(
            `${API}/studying/${level.toUpperCase()}/${moduleName}/module4/part4a`,
          ),
          /*
          axios.get(
            `${API}/studying/${level.toUpperCase()}/${moduleName}/module4/part4b`,
          ),
          */
          axios.get(
            `${API}/studying/${level.toUpperCase()}/${moduleName}/module4/part4c`,
          ),
        ]);

        setModuleData({
          part4a: {
            title: a.data.result.part4a.title,
            imgLink: a.data.result.part4a.imageLink,
            description: a.data.result.part4a.description,
            questions: extractQuestions(a.data, "part4a", 6),
          },
          /*
          part4b: {
            title: b.data.result.part4b.title,
            questions: extractQuestions(b.data, "part4b", 3),
          },
          */
          part4c: {
            title: c.data.result.part4c.title,
            questions: extractQuestions(c.data, "part4c", 5, true),
          },
        });

        setLoading(false);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };
    loadData();
  }, [location.pathname]);

  useEffect(() => {
    if (showFinnishInstruction) {
      const t = setTimeout(() => setShowFinnishInstruction(false), 15000);
      return () => clearTimeout(t);
    }
  }, [showFinnishInstruction]);

  /*
  const handleTranslationChange = (id, v) =>
    setTranslations((p) => ({ ...p, [id]: v }));
  */
  const handleAnswerSelect = (id, v) => setAnswers((p) => ({ ...p, [id]: v }));

  const checkAnswers = async () => {
    try {
      setCheckingAnswers(true);
      const part4cResults = moduleData.part4c.questions.map((q) => ({
        question: q.text,
        userAnswer: answers[q.id],
        correctAnswer: q.answer,
        isCorrect: answers[q.id] === q.answer,
      }));

      /*
      const part4bResults = await Promise.all(
        moduleData.part4b.questions.map(async (q) => {
          try {
            const res = await axios.post(`${API}/evaluate`, {
              finnishSentence: q.text,
              userTranslation: translations[q.id] || "",
            });
            return {
              question: q.text,
              userTranslation: translations[q.id] || "",
              feedback: res.data.feedback,
            };
          } catch (e) {
            return {
              question: q.text,
              userTranslation: translations[q.id] || "",
              feedback: `Error: ${e.message}`,
            };
          }
        }),
      );
      */

      setFeedbackModal({
        show: true,
        // part4b: part4bResults, 
        part4c: part4cResults,
      });
    } finally {
      setCheckingAnswers(false);
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  if (error) return <div className="module4-error">{error}</div>;

  return (
    <div className="module4-wrapper">
      <div className="module4-image-section">
        {moduleData.part4a.imgLink && (
          <img
            src={moduleData.part4a.imgLink}
            alt="Module 4 Listening"
            className="module4-fixed-image"
            onError={(e) =>
              (e.target.src = "/path-to-default-image/default-image.jpg")
            }
          />
        )}
        <div className="module4-mascot-container">
          <div
            className="module4-mascot"
            onClick={() => setShowFinnishInstruction(!showFinnishInstruction)}
          >
            <Mascot />
          </div>
          {showFinnishInstruction && (
            <div className="module4-instruction-box">
              <div className="module4-instruction-text">
                Klikkaa tekstiä kuunnellaksesi
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="module4-content-section">
        <Menu lessonNumber={1} />
        <div className="module4-scroll-container">
          <Title
            script={moduleData.part4a.title?.script}
            audioBase64={moduleData.part4a.title?.audioBase64}
          />
          {moduleData.part4a.description?.script && (
            <p className="module4-description">
              {moduleData.part4a.description.script}
            </p>
          )}
          <div className="module4-audio-list">
            {moduleData.part4a.questions?.map((q, i) => (
              <div
                key={q.id}
                className={`module4-audio-item ${activeAudio?.part === "4a" && activeAudio?.index === i ? "module4-active-audio" : ""}`}
                onClick={() =>
                  toggleAudio(
                    "4a",
                    i,
                    moduleData.part4a.questions,
                    activeAudio,
                    setActiveAudio,
                    currentAudio,
                    setCurrentAudio,
                  )
                }
              >
                <span>{q.text}</span>
              </div>
            ))}
          </div>

          {/*
          <Title
            script={moduleData.part4b.title?.script}
            audioBase64={moduleData.part4b.title?.audioBase64}
          />
          <p>Kirjoita jokaisen lauseen käännös alla olevaan kenttään:</p>
          <div className="module4-translation-exercise">
            {moduleData.part4b.questions?.map((q, i) => (
              <div
                key={q.id}
                className={`module4-translation-item ${activeAudio?.part === "4b" && activeAudio?.index === i ? "module4-active-audio" : ""}`}
                onClick={() =>
                  toggleAudio(
                    "4b",
                    i,
                    moduleData.part4b.questions,
                    activeAudio,
                    setActiveAudio,
                    currentAudio,
                    setCurrentAudio,
                  )
                }
              >
                <p className="module4-clickable-text">{q.text}</p>
                <input
                  type="text"
                  value={translations[q.id] || ""}
                  onChange={(e) =>
                    handleTranslationChange(q.id, e.target.value)
                  }
                  placeholder="Kirjoita käännös tähän..."
                  className="module4-translation-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
          */}

          <Title
            script={moduleData.part4c.title?.script}
            audioBase64={moduleData.part4c.title?.audioBase64}
          />
          <p>Valitse onko väite oikein vai väärin:</p>
          <div className="module4-quiz-section">
            {moduleData.part4c.questions?.map((q, i) => (
              <div
                key={q.id}
                className={`module4-question-item ${activeAudio?.part === "4c" && activeAudio?.index === i ? "module4-active-audio" : ""}`}
                onClick={() =>
                  toggleAudio(
                    "4c",
                    i,
                    moduleData.part4c.questions,
                    activeAudio,
                    setActiveAudio,
                    currentAudio,
                    setCurrentAudio,
                  )
                }
              >
                <p className="module4-clickable-text">{q.text}</p>
                <div
                  className="module4-answer-buttons"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleAnswerSelect(q.id, true)}
                    className={`module4-answer-button module4-true-button ${answers[q.id] === true ? "module4-selected-true" : ""}`}
                  >
                    Oikein
                  </button>
                  <button
                    onClick={() => handleAnswerSelect(q.id, false)}
                    className={`module4-answer-button module4-false-button ${answers[q.id] === false ? "module4-selected-false" : ""}`}
                  >
                    Väärin
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="module4-check-button"
            onClick={checkAnswers}
            disabled={checkingAnswers}
          >
            {checkingAnswers ? (
              <>
                <span className="module4-spinner"></span> Tarkistetaan...
              </>
            ) : (
              "Tarkista vastaukset"
            )}
          </button>
        </div>
      </div>

      {feedbackModal.show && (
        <div className="module4-feedback-modal">
          <div className="module4-feedback-content">
            <h2>Vastauksesi tulokset</h2>

            {/*
            <div className="module4-feedback-section">
              <h3>Task 4b. Translations</h3>
              {feedbackModal.part4b.map((q, i) => {
                const fb = parseFeedback(q.feedback);
                return (
                  <div key={`fb-4b-${i}`} className="module4-feedback-item">
                    <p>
                      <strong>Lause:</strong> {q.question}
                    </p>
                    <p>
                      <strong>Sinun käännöksesi:</strong>{" "}
                      {q.userTranslation || "(ei vastausta)"}
                    </p>
                    {fb.grammar_feedback && (
                      <p>
                        <strong>Grammar:</strong> {fb.grammar_feedback}
                      </p>
                    )}
                    {fb.vocabulary_feedback && (
                      <p>
                        <strong>Vocabulary:</strong> {fb.vocabulary_feedback}
                      </p>
                    )}
                    {fb.overall_feedback && (
                      <p>
                        <strong>Overall:</strong> {fb.overall_feedback}
                      </p>
                    )}
                    {fb.encouragement && (
                      <p className="module4-encouragement">
                        {fb.encouragement}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            */}

            <div className="module4-feedback-section">
              <h3>Task 4c. True/False</h3>
              <p className="module4-score">
                Your score:{" "}
                {feedbackModal.part4c.filter((r) => r.isCorrect).length}/
                {feedbackModal.part4c.length}
              </p>
              {feedbackModal.part4c.map((q, i) => (
                <div
                  key={`fb-4c-${i}`}
                  className={`module4-feedback-item ${q.isCorrect ? "module4-correct" : "module4-incorrect"}`}
                >
                  <p>
                    <strong>Question:</strong> {q.question}
                  </p>
                  <p>
                    <strong>Your answer:</strong>{" "}
                    {q.userAnswer ? "True" : "False"} |{" "}
                    <strong>Correct:</strong>{" "}
                    {q.correctAnswer ? "True" : "False"}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="module4-close-feedback"
              onClick={() =>
                setFeedbackModal({ show: false, part4c: [] })
              }
            >
              Sulje
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module4;