import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './module3.css';
import '../../components/loader/loader.css';

const ItemTypes = { CARD: 'card' };

const Card = memo(({ id, text, type, pairId, findCard, moveCard, status, audioBase64, userInput, onInputChange, onMatch }) => {
  const [initialRender, setInitialRender] = useState(true);
  const originalIndex = findCard(id, type)?.index || 0;
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setInitialRender(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, originalIndex, type, pairId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    canDrag: () => !status,
    end: (item, monitor) => {
      if (!monitor.didDrop()) moveCard(item.id, item.originalIndex, item.type);
    },
  }), [id, originalIndex, moveCard, type, status, pairId]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => !status,
    drop: (draggedItem) => {
      if (draggedItem.id !== id && draggedItem.type !== type) {
        const { index: overIndex } = findCard(id, type);
        moveCard(draggedItem.id, overIndex, type);
        if (onMatch && type === 'right') {
          onMatch(draggedItem.pairId, id);
        }
      }
    },
    hover: ({ id: draggedId }) => {
      if (draggedId !== id) {
        const { index: overIndex } = findCard(id, type);
        moveCard(draggedId, overIndex, type);
      }
    },
  }), [findCard, moveCard, type, status, onMatch]);

  drag(drop(ref));

  const playAudio = () => {
    if (status === 'correct' && audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className={`module3-card ${type} ${status || ''} ${initialRender ? 'initial-render' : ''}`}
      style={{ opacity: isDragging ? 0 : 1 }}
      onClick={status ? playAudio : undefined}
    >
      {type === 'left' && onInputChange ? (
        <input
          type="text"
          value={userInput || ''}
          onChange={(e) => onInputChange(pairId, e.target.value)}
          onClick={handleInputClick}
          placeholder="Enter verb"
          className="module3-verb-input"
          disabled={status === 'correct'}
        />
      ) : (
        text
      )}
    </div>
  );
});

const Column = memo(({ items, type, findCard, moveCard, statusMap, userInputs, onInputChange, onMatch }) => (
  <div className={`module3-column ${type}`}>
    {items.map(item => (
      <Card
        key={item.id}
        id={item.id}
        text={item.text}
        type={type}
        pairId={item.pairId}
        findCard={findCard}
        moveCard={moveCard}
        status={statusMap[item.id]}
        audioBase64={item.audioBase64}
        userInput={userInputs?.[item.pairId]}
        onInputChange={onInputChange}
        onMatch={onMatch}
      />
    ))}
  </div>
));

const MatchingGame = ({ pairs, onCheckAnswers }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});
  const shuffledPairs = useRef(null);

  useEffect(() => {
    if (pairs.length > 0 && !shuffledPairs.current) {
      shuffledPairs.current = [...pairs].sort(() => Math.random() - 0.5);
      const leftItemsData = shuffledPairs.current.map(p => ({
        id: 'left-' + p.pairId,
        text: p.left,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      })).sort(() => Math.random() - 0.5);

      const rightItemsData = shuffledPairs.current.map(p => ({
        id: 'right-' + p.pairId,
        text: p.right,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      })).sort(() => Math.random() - 0.5);

      setLeftItems(leftItemsData);
      setRightItems(rightItemsData);
      setLoading(false);
    } else if (pairs.length === 0) {
      setLoading(false);
    }
  }, [pairs]);

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

  const checkAnswers = () => {
    const results = onCheckAnswers(leftItems, rightItems);
    const newStatusMap = {};
    leftItems.forEach(item => {
      newStatusMap[item.id] = results[item.pairId] ? 'correct' : 'incorrect';
    });
    rightItems.forEach(item => {
      newStatusMap[item.id] = results[item.pairId] ? 'correct' : 'incorrect';
    });
    setStatusMap(newStatusMap);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (pairs.length === 0) {
    return <div>No matching pairs available</div>;
  }

  return (
    <div>
      <div className="module3-matching-section">
        <Column items={leftItems} type="left" findCard={findCard} moveCard={moveCard} statusMap={statusMap} />
        <Column items={rightItems} type="right" findCard={findCard} moveCard={moveCard} statusMap={statusMap} />
      </div>
      <button
        className="module3-submit-btn"
        onClick={checkAnswers}
        disabled={Object.keys(statusMap).length > 0}
      >
        Tarkista vastaukset
      </button>
    </div>
  );
};

const VerbMatchingGame = ({ questions, verbs, onCheckAnswers }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questions.length > 0 && verbs.length > 0) {
      setRightItems(questions.map(q => ({
        id: 'right-' + q.pairId,
        text: q.sentence,
        pairId: q.pairId,
        conjugatedVerb: q.conjugatedVerb,
        audioBase64: q.audioBase64
      })));

      setLeftItems(verbs.map(v => ({
        id: 'left-' + v.id,
        text: v.text,
        pairId: v.id,
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
      return newStatus;
    });
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
    
    // Check matched pairs
    matches.forEach(match => {
      const question = rightItems.find(q => q.pairId === match.questionId);
      const selectedVerb = leftItems.find(v => v.id === match.verbId);
      const userInput = userInputs[match.questionId];
      
      if (question && selectedVerb && userInput) {
        // 1. Check if input matches the conjugated verb
        const isInputCorrect = normalizeText(userInput) === normalizeText(question.conjugatedVerb);
        
        // 2. Check if the selected verb makes sense in the sentence
        const isVerbSuitable = checkVerbSuitability(selectedVerb.text, question.sentence);
        
        const isCorrect = isInputCorrect && isVerbSuitable;
        
        results[match.questionId] = isCorrect;
        newStatusMap[`left-${match.questionId}`] = isCorrect ? 'correct' : 'incorrect';
        newStatusMap[match.verbId] = isCorrect ? 'correct' : 'incorrect';
      }
    });
    
    // Check unmatched questions with input
    rightItems.forEach(question => {
      if (!matches.some(m => m.questionId === question.pairId) && userInputs[question.pairId]) {
        // Only check input correctness
        const isInputCorrect = normalizeText(userInputs[question.pairId]) === normalizeText(question.conjugatedVerb);
        newStatusMap[`left-${question.pairId}`] = isInputCorrect ? 'correct' : 'incorrect';
        results[question.pairId] = isInputCorrect;
      }
    });
    
    setStatusMap(newStatusMap);
    onCheckAnswers(results);
  };

  const checkVerbSuitability = (verb, sentence) => {
    // Implement your logic to check if verb fits the sentence
    // This is a simple example - you may need more sophisticated checks
    return sentence.toLowerCase().includes(verb.toLowerCase());
  };

  const normalizeText = (text) => {
    if (!text) return '';
    return text.replace(/[^a-zåäö]/gi, '').toLowerCase();
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
      
      <button
        className="module3-submit-btn"
        onClick={checkAnswers}
        disabled={!allInputsFilled || Object.keys(statusMap).length > 0}
      >
        Tarkista vastaukset
      </button>
    </div>
  );
};

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
        const processRegularPart = (partData) => {
          if (!partData || typeof partData !== 'object') return [];
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
          if (!partData || typeof partData !== 'object') return { questions: [], verbs: [] };
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