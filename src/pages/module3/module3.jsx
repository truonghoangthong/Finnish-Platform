import { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MatchingGame from './MatchingGame';
import VerbMatchingGame from './VerbMatchingGame';
import './module3.css';
import '../../components/loader/loader.css';
import '../../components/variables.css';
import LessonLayout from '../../components/layouts/LessonLayout';
import Title from '../../components/title/Title';
import Loader from '../../components/loader/loader';

const BASE_URL = 'https://finnish-platform-thong-truongs-projects.vercel.app/api';

const Module3 = () => {
  const location = useLocation();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [pairs3c, setPairs3c] = useState({ questions: [], verbs: [] });

  const [results, setResults] = useState({
    part3a: {},
    part3b: {},
    part3c: {}
  });
  const [showResults, setShowResults] = useState(false);

  const pairs3aRef = useRef({ left: [], right: [] });
  const pairs3bRef = useRef({ left: [], right: [] });
  const pairs3cRef = useRef({ userInputs: {}, matches: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pathParts = location.pathname.split('/');
        const level = pathParts[pathParts.indexOf('course') + 1] || 'A1';
        const moduleName = location.pathname.includes('lesson-2') ? 'another_module' : 'the_break_room';
        const moduleNumber = 3;

        const partsToFetch = ['part3a', 'part3b', 'part3c'];
        const responses = await Promise.all(
          partsToFetch.map(part => 
            axios.get(`${BASE_URL}/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/${part}`)
          )
        );

        const data = {};
        partsToFetch.forEach((part, index) => {
          data[part] = responses[index]?.data?.result?.[part] || {};
        });

        setModuleData(data);
      } catch (err) {
        console.error('Error fetching module data:', err);
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
          .filter(([key, value]) =>
            key.startsWith('question') &&
            value?.script?.includes('/')
          )
          .map(([key, question]) => {
            const [left, right] = question.script.split('/').map(s => s.trim());
            return {
              pairId: key,
              left,
              right,
              audioBase64: question.audioBase64
            };
          });
      };

      const processVerbMatchingPart = (partData) => {
        const questions = Object.entries(partData)
          .filter(([key, value]) =>
            key.startsWith('question') && typeof value?.script === 'string'
          )
          .map(([key, question]) => {
            const verbMatch = question.script.match(/\[(.*?)\]/);
            const conjugatedVerb = verbMatch ? verbMatch[1] : '';
            const sentence = question.script.replace(/\[.*?\]/, '______');
            return {
              pairId: key,
              conjugatedVerb,
              sentence,
              audioBase64: question.audioBase64
            };
          });
        const verbs = Object.entries(partData)
          .filter(([key, value]) =>
            key.startsWith('vocabulary') && typeof value?.script === 'string'
          )
          .map(([key, vocab]) => ({
            id: key,
            text: vocab.script,
            meaning: vocab.meaning,
            audioBase64: vocab.audioBase64
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
      partResults[leftItem.pairId] =
        correctPairs.some(
          p => p.pairId === leftItem.pairId && p.right === rightItem.text
        );
    });
    return partResults;
  };

  const checkVerbAnswers = ({ userInputs, matches, leftItems, rightItems, questions }) => {
    const results = {};

    const correctAnswers = Object.fromEntries(
      questions.map(q => [
        q.pairId,
        q.conjugatedVerb.replace(/[\[\]]/g, '')
      ])
    );

    rightItems.forEach((question, idx) => {
      const userInput = (userInputs[question.pairId] || '').trim().toLowerCase();

      const verbId =
        matches.find(m => m.questionId === question.id)?.verbId ||
        leftItems[idx]?.id;

      const verbCard = leftItems.find(v => v.id === verbId);

      const correctVerb = correctAnswers[question.pairId];
      const isVerbCorrect = userInput === correctVerb.toLowerCase();
      const isMatchCorrect = verbCard?.pairId === question.pairId;

      console.log("----- Check Verb Answer -----");
      console.log("Question:", question.text);
      console.log("User input:", userInput);
      console.log("Correct answer:", correctVerb);
      console.log("Matched verb:", verbCard?.text || "None");
      console.log("Matched correct question?:", isMatchCorrect);
      console.log("Verb correct?:", isVerbCorrect);
      console.log("Final result:", isVerbCorrect && isMatchCorrect);
      console.log("-----------------------------");

      results[question.pairId] = isVerbCorrect && isMatchCorrect;
    });

    return results;
  };

  const handleCheckAllAnswers = () => {
    const part3aResults = checkRegularAnswers(
      pairs3aRef.current.left,
      pairs3aRef.current.right,
      pairs3a
    );
    const part3bResults = checkRegularAnswers(
      pairs3bRef.current.left,
      pairs3bRef.current.right,
      pairs3b
    );
    const part3cResults = checkVerbAnswers({
      userInputs: pairs3cRef.current.userInputs,
      matches: pairs3cRef.current.matches,
      leftItems: pairs3c.verbs,
      rightItems: pairs3c.questions,
      questions: pairs3c.questions
    });

    console.log('Part 3a Results:', part3aResults);
    console.log('Part 3b Results:', part3bResults);
    console.log('Part 3c Results:', part3cResults);

    setResults({
      part3a: part3aResults,
      part3b: part3bResults,
      part3c: part3cResults
    });

    setShowResults(true);
  };

  const getCorrectCount = (partResults) =>
    Object.values(partResults).filter(Boolean).length;

  const totalQuestions =
    pairs3a.length + pairs3b.length + pairs3c.questions.length;

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return <div className="module3-error">{error}</div>;
  }

  const correctAnswers = showResults
    ? getCorrectCount(results.part3a) +
      getCorrectCount(results.part3b) +
      getCorrectCount(results.part3c)
    : 0;

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
              showResults={showResults}
              results={results.part3a}   
              onStateChange={(left, right) => {
                pairs3aRef.current = { left, right };
              }}
            />
          </div>
          <div className="module3-verbs-section">
            <Title
              script={moduleData.part3b.title?.script}
              audioBase64={moduleData.part3b.title?.audioBase64}
            />
            <MatchingGame
              pairs={pairs3b}
              showResults={showResults}
              results={results.part3b}  
              onStateChange={(left, right) => {
                pairs3bRef.current = { left, right };
              }}
            />
          </div>
          <div className="module3-verbs-section">
            <Title
              script={moduleData.part3c.title?.script}
              audioBase64={moduleData.part3c.title?.audioBase64}
            />
            <VerbMatchingGame
              questions={pairs3c.questions}
              verbs={pairs3c.verbs}
              showResults={showResults}
              results={results.part3c}   
              onStateChange={(state) => {
                pairs3cRef.current = state;
              }}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              className="shared-btn"
              onClick={handleCheckAllAnswers}
              disabled={showResults && correctAnswers === totalQuestions}
            >
              {showResults ? 'Tarkista uudelleen' : 'Tarkista vastaukset'}
            </button>

            {showResults && (
              <div className="module3-results-summary">
                <p>
                  Oikein: {correctAnswers} / {totalQuestions}
                </p>
              </div>
            )}
          </div>
        </DndProvider>
      </div>
    </LessonLayout>
  );
};

export default Module3;