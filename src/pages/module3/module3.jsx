import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MatchingGame from './MatchingGame';
import VerbMatchingGame from './VerbMatchingGame';
import './module3.css';
import '../../components/loader/loader.css';

const Module3 = () => {
  const location = useLocation();
  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [pairs3c, setPairs3c] = useState({ questions: [], verbs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const pathParts = location.pathname.split('/');
        const level = pathParts[pathParts.indexOf('course') + 1] || 'a1';
        const moduleName = location.pathname.includes('lesson-2') ? 'another_module' : 'the_break_room';
        const moduleNumber = 3;
        const [part3aRes, part3bRes, part3cRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part3a`),
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part3b`),
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part3c`)
        ]);
        console.log('3c response:', part3cRes.data);
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
        const processed3a = processRegularPart(part3aRes.data.result.part3a || []);
        const processed3b = processRegularPart(part3bRes.data.result.part3b || []);
        const processed3c = processVerbMatchingPart(part3cRes.data.result.part3c || {});
        if (processed3a.length === 0 && processed3b.length === 0 &&
          processed3c.questions.length === 0 && processed3c.verbs.length === 0) {
          setError('No data available for this module');
        }
        setPairs3a(processed3a);
        setPairs3b(processed3b);
        setPairs3c(processed3c);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };
    loadData();
  }, [location.pathname]);

  const checkRegularAnswers = (leftItems, rightItems, correctPairs) => {
    const results = {};
    leftItems.forEach((leftItem, index) => {
      const rightItem = rightItems[index];
      results[leftItem.pairId] = correctPairs.some(p =>
        p.pairId === leftItem.pairId && p.right === rightItem.text
      );
    });
    return results;
  };

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
            onCheckAnswers={(left, right) => checkRegularAnswers(left, right, pairs3a)}
          />
        </div>
        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3b</h2>
            <p>Harjoittele sanoja lisää. Yhdistä lauseet oikein.</p>
          </div>
          <MatchingGame
            pairs={pairs3b}
            onCheckAnswers={(left, right) => checkRegularAnswers(left, right, pairs3b)}
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
            onCheckAnswers={(results) => {
              const correctCount = Object.values(results).filter(Boolean).length;
              const total = Object.keys(results).length;
              console.log(`Correct: ${correctCount}/${total}`);
              return results;
            }}
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default Module3;