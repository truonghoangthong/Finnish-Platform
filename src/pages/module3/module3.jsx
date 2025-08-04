import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import MatchingGame from './MatchingGame';
import VerbMatchingGame from './VerbMatchingGame';
import './module3.css';
import '../../components/loader/loader.css';
import { useModuleStore } from '../../stores/module';

const Module3 = () => {
  const location = useLocation();
  const {
    moduleData,
    loading,
    error,
    fetchModuleData
  } = useModuleStore();

  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [pairs3c, setPairs3c] = useState({ questions: [], verbs: [] });
  const [results, setResults] = useState({
    part3a: {},
    part3b: {},
    part3c: {}
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const pathParts = location.pathname.split('/');
      const level = pathParts[pathParts.indexOf('course') + 1] || 'A1';
      const moduleName = location.pathname.includes('lesson-2') ? 'another_module' : 'the_break_room';
      const moduleNumber = 3;
      
      await fetchModuleData(level, moduleName, moduleNumber);
    };

    loadData();
  }, [location.pathname, fetchModuleData]);

  useEffect(() => {
    if (moduleData) {
      const processRegularPart = (partData) => {
        return Object.entries(partData)
          .filter(([key, value]) =>
            key.startsWith('question') &&
            value &&
            value.script &&
            typeof value.script === 'string' &&
            value.script.includes('/')
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
            key.startsWith('question') &&
            value &&
            value.script &&
            typeof value.script === 'string'
          )
          .map(([key, question]) => {
            const verbMatch = question.script.match(/\[(.*?)\]/);
            const conjugatedVerb = verbMatch ? verbMatch[1] : '';
            const sentence = question.script.replace(/\[.*?\]/, '______');
            return {
              pairId: key,
              conjugatedVerb: conjugatedVerb,
              sentence: sentence,
              audioBase64: question.audioBase64
            };
          });
        const verbs = Object.entries(partData)
          .filter(([key, value]) =>
            key.startsWith('vocabulary') &&
            value &&
            value.script &&
            typeof value.script === 'string'
          )
          .map(([key, vocab]) => ({
            id: key,
            text: vocab.script,
            meaning: vocab.meaning,
            audioBase64: vocab.audioBase64
          }));
        return { questions, verbs };
      };

      const processed3a = processRegularPart(moduleData.part3a || {});
      const processed3b = processRegularPart(moduleData.part3b || {});
      const processed3c = processVerbMatchingPart(moduleData.part3c || {});

      setPairs3a(processed3a);
      setPairs3b(processed3b);
      setPairs3c(processed3c);
    }
  }, [moduleData]);

  const checkRegularAnswers = (leftItems, rightItems, correctPairs, part) => {
    const partResults = {};
    leftItems.forEach((leftItem, index) => {
      const rightItem = rightItems[index];
      partResults[leftItem.pairId] = correctPairs.some(p =>
        p.pairId === leftItem.pairId && p.right === rightItem.text
      );
    });
    setResults(prev => ({ ...prev, [part]: partResults }));
    return partResults;
  };

  const handleCheckAllAnswers = () => {
    setShowResults(true);
  };

  const getCorrectCount = (partResults) => {
    return Object.values(partResults).filter(Boolean).length;
  };

  const totalQuestions = pairs3a.length + pairs3b.length + pairs3c.questions.length;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="module3-error">{error}</div>;
  }
  const correctAnswers = showResults ? 
    getCorrectCount(results.part3a) + getCorrectCount(results.part3b) + getCorrectCount(results.part3c) : 
    0;
  return (
    <div className="module3-container">
      <DndProvider backend={HTML5Backend}>
        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3a</h2>
            <p>Harjoittele sanoja lisää. Yhdistä lauseet oikein.</p>
          </div>
          <MatchingGame
            pairs={pairs3a}
            onCheckAnswers={(left, right) => checkRegularAnswers(left, right, pairs3a, 'part3a')}
            showResults={showResults}
          />
        </div>
        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3b</h2>
            <p>Harjoittele sanoja lisää. Yhdistä lauseet oikein.</p>
          </div>
          <MatchingGame
            pairs={pairs3b}
            onCheckAnswers={(left, right) => checkRegularAnswers(left, right, pairs3b, 'part3b')}
            showResults={showResults}
          />
        </div>
        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3c</h2>
            <p>Ota selvää, mitä seuraavat verbit tarkoittavat.</p>
          </div>
          <VerbMatchingGame
            questions={pairs3c.questions}
            verbs={pairs3c.verbs}
            onCheckAnswers={(partResults) => {
              setResults(prev => ({ ...prev, part3c: partResults }));
              return partResults;
            }}
            showResults={showResults}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            className="module3-submit-btn"
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
  );
};

export default Module3;