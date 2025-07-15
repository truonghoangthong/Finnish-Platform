import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import AudioPlayer from '../../components/audioPlayer/audioPlayer';
import { fetchModuleData } from '../../utils/fetchContent';
import './module3.css';
import '../../components/loader/loader.css';

const ItemTypes = { CARD: 'card' };

const Card = memo(({ id, text, type, pairId, findCard, moveCard, isMatched, audioBase64 }) => {
  const [initialRender, setInitialRender] = useState(true);
  const originalIndex = findCard(id, type)?.index || 0;
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialRender(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, originalIndex, type },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    canDrag: () => !isMatched,
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        moveCard(item.id, item.originalIndex, item.type);
      }
    },
  }), [id, originalIndex, moveCard, type, isMatched]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: () => true,
    drop: (draggedItem) => {
      if (draggedItem.id !== id && draggedItem.type === type) {
        const { index: overIndex } = findCard(id, type);
        moveCard(draggedItem.id, overIndex, type);
      }
    },
    hover: ({ id: draggedId }) => {
      if (draggedId !== id) {
        const { index: overIndex } = findCard(id, type);
        moveCard(draggedId, overIndex, type);
      }
    },
  }), [findCard, moveCard, type]);

  drag(drop(ref));

  const playAudio = () => {
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play();
    }
  };

  return (
    <div
      ref={ref}
      className={`module3-card ${type} ${isMatched ? 'matched' : ''} ${initialRender ? 'initial-render' : ''}`}
      style={{ opacity: isDragging ? 0 : 1 }}
      onClick={playAudio}
    >
      {text}
    </div>
  );
});

const Column = memo(({ items, type, findCard, moveCard, isMatched }) => {
  return (
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
          isMatched={isMatched(item)}
          audioBase64={item.audioBase64}
        />
      ))}
    </div>
  );
});

const MatchingGame = ({ pairs, onCheckAnswers }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const isMatched = useCallback(() => false, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="module3-matching-section">
        <Column items={leftItems} type="left" findCard={findCard} moveCard={moveCard} isMatched={isMatched} />
        <Column items={rightItems} type="right" findCard={findCard} moveCard={moveCard} isMatched={isMatched} />
      </div>
      <button
        className="module3-submit-btn"
        onClick={() => onCheckAnswers(leftItems, rightItems)}
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
  const [pairs3c, setPairs3c] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchModuleData(location.pathname, 3);
        setPairs3a(data.part3a);
        setPairs3b(data.part3b);
        setPairs3c(data.part3c);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error('API Error:', err);
        setLoading(false);
      }
    };

    loadData();
  }, [location.pathname]);

  const checkAnswers = (leftItems, rightItems, part) => {
    console.log('Checking answers for', part, leftItems, rightItems);
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
            <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
          </div>
          <MatchingGame 
            pairs={pairs3a} 
            onCheckAnswers={(left, right) => checkAnswers(left, right, 'part3a')} 
          />
        </div>

        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3b</h2>
            <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
          </div>
          <MatchingGame 
            pairs={pairs3b} 
            onCheckAnswers={(left, right) => checkAnswers(left, right, 'part3b')} 
          />
        </div>

        <div className="module3-verbs-section">
          <div className="module3-header-row">
            <h2>Tehtävä 3c</h2>
            <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
          </div>
          <MatchingGame 
            pairs={pairs3c} 
            onCheckAnswers={(left, right) => checkAnswers(left, right, 'part3c')} 
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default Module3;