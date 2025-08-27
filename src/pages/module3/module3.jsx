import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MatchingGame from "./MatchingGame";
import VerbMatchingGame from "./VerbMatchingGame";
import "./module3.css";
import "../../components/loader/loader.css";
import "../../components/variables.css";
import LessonLayout from "../../components/layouts/LessonLayout";
import Title from "../../components/title/Title";
import Loader from "../../components/loader/loader";

const BASE_URL =
  "https://finnish-platform-thong-truongs-projects.vercel.app/api";

const Module3 = () => {
  const location = useLocation();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [pairs3c, setPairs3c] = useState({ questions: [], verbs: [] });

  const [results3a, setResults3a] = useState({});
  const [results3b, setResults3b] = useState({});
  const [results3c, setResults3c] = useState({});
  
  const [showResults3a, setShowResults3a] = useState(false);
  const [showResults3b, setShowResults3b] = useState(false);
  const [showResults3c, setShowResults3c] = useState(false);

  const pairs3aRef = useRef({ left: [], right: [] });
  const pairs3bRef = useRef({ left: [], right: [] });
  const pairs3cRef = useRef({ userInputs: {}, matches: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const pathParts = location.pathname.split("/");
        const level = pathParts[pathParts.indexOf("course") + 1] || "A1";
        const moduleName = location.pathname.includes("lesson-2")
          ? "another_module"
          : "the_break_room";
        const moduleNumber = 3;

        const partsToFetch = ["part3a", "part3b", "part3c"];
        const responses = await Promise.all(
          partsToFetch.map((part) =>
            axios.get(
              `${BASE_URL}/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/${part}`,
            ),
          ),
        );

        const data = {};
        partsToFetch.forEach((part, index) => {
          data[part] = responses[index]?.data?.result?.[part] || {};
        });

        setModuleData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.pathname]);

  useEffect(() => {
    if (moduleData) {
      const processRegularPart = (partData) => {
        return Object.entries(partData)
          .filter(
            ([key, value]) =>
              key.startsWith("question") && value?.script?.includes("/"),
          )
          .map(([key, question]) => {
            const [left, right] = question.script
              .split("/")
              .map((s) => s.trim());
            return {
              pairId: key,
              left,
              right,
              audioBase64: question.audioBase64,
            };
          });
      };

      const processVerbMatchingPart = (partData) => {
        const questions = Object.entries(partData)
          .filter(
            ([key, value]) =>
              key.startsWith("question") && typeof value?.script === "string",
          )
          .map(([key, question]) => {
            const verbMatch = question.script.match(/\[(.*?)\]/);
            const conjugatedVerb = verbMatch ? verbMatch[1] : "";
            const sentence = question.script.replace(/\[.*?\]/, "______");
            return {
              pairId: key,
              conjugatedVerb,
              sentence,
              audioBase64: question.audioBase64,
            };
          });
        const verbs = Object.entries(partData)
          .filter(
            ([key, value]) =>
              key.startsWith("vocabulary") && typeof value?.script === "string",
          )
          .map(([key, vocab]) => ({
            id: key,
            script: vocab.script,   
            audioBase64: vocab.audioBase64,
          }));
        return { questions, verbs };
      };

      setPairs3a(processRegularPart(moduleData.part3a || {}));
      setPairs3b(processRegularPart(moduleData.part3b || {}));
      setPairs3c(processVerbMatchingPart(moduleData.part3c || {}));
    }
  }, [moduleData]);

  const checkRegularAnswers = (leftItems, rightItems, correctPairs) => {
    const partResults = {};
    leftItems.forEach((leftItem, index) => {
      const rightItem = rightItems[index];
      partResults[leftItem.pairId] = correctPairs.some(
        (p) => p.pairId === leftItem.pairId && p.right === rightItem.text,
      );
    });
    return partResults;
  };

  const checkVerbAnswers = ({ userInputs, questions }) => {
    const results = {};
    questions.forEach((q) => {
      const correctAnswer = (q.conjugatedVerb || "").trim().toLowerCase();
      const userInput = (userInputs[q.pairId] || "").trim().toLowerCase();
      const isCorrect = userInput === correctAnswer;
      results[q.pairId] = isCorrect;
    });
    return results;
  };

  const handleCheckPart3a = () => {
    const part3aResults = checkRegularAnswers(
      pairs3aRef.current.left,
      pairs3aRef.current.right,
      pairs3a,
    );
    setResults3a(part3aResults);
    setShowResults3a(true);
  };

  const handleCheckPart3b = () => {
    const part3bResults = checkRegularAnswers(
      pairs3bRef.current.left,
      pairs3bRef.current.right,
      pairs3b,
    );
    setResults3b(part3bResults);
    setShowResults3b(true);
  };

  const handleCheckPart3c = () => {
    const part3cResults = checkVerbAnswers({
      userInputs: pairs3cRef.current.userInputs,
      matches: pairs3cRef.current.matches,
      leftItems: pairs3c.verbs,
      rightItems: pairs3c.questions,
      questions: pairs3c.questions,
    });
    setResults3c(part3cResults);
    setShowResults3c(true);
  };

  const getCorrectCount3a = () => Object.values(results3a).filter(Boolean).length;
  const getCorrectCount3b = () => Object.values(results3b).filter(Boolean).length;
  const getCorrectCount3c = () => Object.values(results3c).filter(Boolean).length;

  const totalQuestions =
    pairs3a.length + pairs3b.length + pairs3c.questions.length;

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="module3-error">{error}</div>;
  }

  const correctAnswers = 
    getCorrectCount3a() + getCorrectCount3b() + getCorrectCount3c();

  return (
    <LessonLayout
      level="A1"
      lessonNumber={1}
      title="The Break Room"
      showImage={false}
    >
      <div className="module3-container">
        <DndProvider backend={HTML5Backend}>
          <div className="module3-verbs-section">
            <Title
              script={moduleData.part3a.title?.script}
              audioBase64={moduleData.part3a.title?.audioBase64}
            />
            <MatchingGame
              pairs={pairs3a}
              showResults={showResults3a}
              results={results3a}
              onStateChange={(left, right) => {
                pairs3aRef.current = { left, right };
              }}
            />
            <div style={{ textAlign: "center"}}>
              <button
                className="shared-btn"
                onClick={handleCheckPart3a}
                disabled={showResults3a && getCorrectCount3a() === pairs3a.length}
              >
                {showResults3a ? "Tarkista uudelleen" : "Tarkista vastaukset"}
              </button>
              {showResults3a && (
                <div className="module3-results-summary">
                  <p>
                    Oikein: {getCorrectCount3a()} / {pairs3a.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="module3-verbs-section">
            <Title
              script={moduleData.part3b.title?.script}
              audioBase64={moduleData.part3b.title?.audioBase64}
            />
            <MatchingGame
              pairs={pairs3b}
              showResults={showResults3b}
              results={results3b}
              onStateChange={(left, right) => {
                pairs3bRef.current = { left, right };
              }}
            />
            <div style={{ textAlign: "center" }}>
              <button
                className="shared-btn"
                onClick={handleCheckPart3b}
                disabled={showResults3b && getCorrectCount3b() === pairs3b.length}
              >
                {showResults3b ? "Tarkista uudelleen" : "Tarkista vastaukset"}
              </button>
              {showResults3b && (
                <div className="module3-results-summary">
                  <p>
                    Oikein: {getCorrectCount3b()} / {pairs3b.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="module3-verbs-section">
            <Title
              script={moduleData.part3c.title?.script}
              audioBase64={moduleData.part3c.title?.audioBase64}
            />
            <VerbMatchingGame
              questions={pairs3c.questions}
              verbs={pairs3c.verbs}
              showResults={showResults3c}
              results={results3c}
              onStateChange={(state) => {
                pairs3cRef.current = state;
              }}
            />
            <div style={{ textAlign: "center"}}>
              <button
                className="shared-btn"
                onClick={handleCheckPart3c}
                disabled={showResults3c && getCorrectCount3c() === pairs3c.questions.length}
              >
                {showResults3c ? "Tarkista uudelleen" : "Tarkista vastaukset"}
              </button>
              {showResults3c && (
                <div className="module3-results-summary">
                  <p>
                    Oikein: {getCorrectCount3c()} / {pairs3c.questions.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DndProvider>
      </div>
    </LessonLayout>
  );
};

export default Module3;