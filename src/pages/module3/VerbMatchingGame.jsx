import { useState, useCallback, useEffect } from 'react';
import './module3.css';
import '../../components/loader/loader.css';
import Column from './Column';

const VerbMatchingGame = ({ questions, verbs, onCheckAnswers }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (questions.length > 0 && verbs.length > 0) {
      // Create right items with consistent IDs
      setRightItems(questions.map(q => ({
        id: `right-${q.pairId}`,
        text: q.sentence,
        pairId: q.pairId,
        conjugatedVerb: q.conjugatedVerb,
        audioBase64: q.audioBase64
      })));

      // Create left items with matching pairIds
      setLeftItems(verbs.map(v => ({
        id: `left-${v.id}`,
        text: v.text,
        pairId: v.id.replace('vocabulary', 'question'), // Match question pairIds
        meaning: v.meaning,
        audioBase64: v.audioBase64
      })));

      setLoading(false);
    } else if (questions.length === 0 || verbs.length === 0) {
      setLoading(false);
    }
  }, [questions, verbs]);

  const findCard = useCallback((id, type) => {
    const items = type === 'left' ? leftItems : rightItems;
    const card = items.find(c => c.id === id);
    return { card, index: items.indexOf(card) };
  }, [leftItems, rightItems]);

  const moveCard = useCallback((id, atIndex, type) => {
    const items = type === 'left' ? leftItems : rightItems;
    const { card, index } = findCard(id, type);
    if (!card) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    newItems.splice(atIndex, 0, card);
    if (type === 'left') setLeftItems(newItems);
    else setRightItems(newItems);
  }, [findCard, leftItems, rightItems]);

  const handleInputChange = (pairId, value) => {
    setUserInputs(prev => ({
      ...prev,
      [pairId]: value
    }));
    setStatusMap(prev => {
      const newStatus = {...prev};
      delete newStatus[`left-${pairId}`];
      delete newStatus[`right-${pairId}`];
      return newStatus;
    });
    setShowResults(false);
  };

  const handleMatch = (questionId, verbId) => {
    setMatches(prev => {
      const existing = prev.filter(m => m.questionId !== questionId);
      return [...existing, { questionId, verbId }];
    });
    setStatusMap(prev => {
      const newStatus = {...prev};
      delete newStatus[`right-${verbId}`];
      return newStatus;
    });
  };

  const checkAnswers = () => {
    const results = {};
    const newStatusMap = {};
    
    // Create map of correct answers
    const correctAnswers = {};
    questions.forEach(q => {
      const conjugatedVerb = q.conjugatedVerb.replace(/[\[\]]/g, '');
      correctAnswers[q.pairId] = conjugatedVerb;
    });

    // Check each question
    rightItems.forEach(question => {
      const userInput = userInputs[question.pairId];
      if (userInput) {
        const isCorrect = normalizeText(userInput) === normalizeText(correctAnswers[question.pairId]);
        results[question.pairId] = isCorrect;
        
        // Find matching left card
        const leftCard = leftItems.find(card => card.pairId === question.pairId);
        if (leftCard) {
          newStatusMap[leftCard.id] = isCorrect ? 'correct' : 'incorrect';
        }
        newStatusMap[question.id] = isCorrect ? 'correct' : 'incorrect';
      }
    });

    setStatusMap(newStatusMap);
    setShowResults(true);
    onCheckAnswers(results);
  };

  const normalizeText = (text) => {
    if (!text) return '';
    return text.trim().toLowerCase();
  };

  const allInputsFilled = Object.keys(userInputs).length === rightItems.length && 
    Object.values(userInputs).every(v => v && v.trim());

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (questions.length === 0 || verbs.length === 0) {
    return <div>No verb matching data available</div>;
  }

  return (
    <div>
      <div className="module3-verbs-list">
        <div className="module3-verbs-container">
          {verbs.map(verb => (
            <div key={verb.id} className="module3-verb-tag">
              {verb.text} - {verb.meaning}
            </div>
          ))}
        </div>
      </div>

      <div className="module3-matching-section">
        <Column 
          items={leftItems} 
          type="left" 
          findCard={findCard} 
          moveCard={moveCard} 
          statusMap={statusMap}
          userInputs={userInputs}
          onInputChange={handleInputChange}
          onMatch={handleMatch}
        />
        <Column 
          items={rightItems} 
          type="right" 
          findCard={findCard} 
          moveCard={moveCard} 
          statusMap={statusMap}
          onMatch={handleMatch}
        />
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button
          className="module3-submit-btn"
          onClick={checkAnswers}
          disabled={!allInputsFilled || (showResults && Object.values(statusMap).every(status => status === 'correct'))}
        >
          {showResults ? 'Tarkista uudelleen' : 'Tarkista vastaukset'}
        </button>

        {showResults && (
          <div className="module3-results-summary">
            <p>
              Oikein: {Object.values(statusMap).filter(status => status === 'correct').length / 2} / {questions.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbMatchingGame;