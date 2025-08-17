import { useState, useCallback, useEffect } from 'react';
import './module3.css';
import '../../components/loader/loader.css';
import Column from './Column';

const VerbMatchingGame = ({ questions, verbs, showResults, onStateChange }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [matches, setMatches] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questions.length > 0 && verbs.length > 0) {
      setRightItems(
        questions.map(q => ({
          id: `right-${q.pairId}`,
          text: q.sentence,
          pairId: q.pairId,
          conjugatedVerb: q.conjugatedVerb,
          audioBase64: q.audioBase64
        }))
      );

      setLeftItems(
        verbs.map(v => ({
          id: `left-${v.id}`,
          text: '',
          pairId: v.id.replace('vocabulary', 'question'),
          meaning: v.meaning,
          audioBase64: v.audioBase64
        }))
      );

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [questions, verbs]);

  useEffect(() => {
    onStateChange({
      userInputs,
      matches,
      leftItems,
      rightItems,
      questions,
      verbs
    });
  }, [userInputs, matches, leftItems, rightItems, questions, verbs, onStateChange]);

  const playAudio = (audioBase64) => {
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  const findCard = useCallback((id, type) => {
    const items = type === 'left' ? leftItems : rightItems;
    const card = items.find(c => c.id === id);
    return { card, index: items.indexOf(card) };
  }, [leftItems, rightItems]);

  const moveCard = useCallback(() => {
    return; // Vô hiệu hóa chức năng di chuyển
  }, []);

  const handleInputChange = (pairId, value) => {
    setUserInputs(prev => ({
      ...prev,
      [pairId]: value
    }));
    setStatusMap(prev => {
      const newStatus = { ...prev };
      delete newStatus[`left-${pairId}`];
      delete newStatus[`right-${pairId}`];
      return newStatus;
    });
  };

  const handleMatch = (questionId, verbId) => {
    setMatches(prev => {
      const existing = prev.filter(m => m.questionId !== questionId);
      return [...existing, { questionId, verbId }];
    });
    setStatusMap(prev => {
      const newStatus = { ...prev };
      delete newStatus[`right-${verbId}`];
      return newStatus;
    });
  };

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
            <div
              key={verb.id}
              className="module3-verb-tag"
              onClick={() => playAudio(verb.audioBase64)}
              style={{ cursor: verb.audioBase64 ? 'pointer' : 'default' }}
            >
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
          disableDrag={true}
        />
        <Column
          items={rightItems}
          type="right"
          findCard={findCard}
          moveCard={moveCard}
          statusMap={statusMap}
          onMatch={handleMatch}
          disableDrag={true}
        />
      </div>
    </div>
  );
};

export default VerbMatchingGame;