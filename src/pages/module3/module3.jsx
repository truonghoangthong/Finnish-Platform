import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AudioPlayer from '../../components/audioPlayer/audioPlayer';
import './module3.css';
import '../../components/loader/loader.css';

const ItemTypes = { CARD: 'card' };

const Card = memo(({ id, text, type, pairId, findCard, moveCard, isMatched, onDropPair, audioBase64 }) => {
  const originalIndex = findCard(id, type).index;
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, originalIndex, type, pairId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        moveCard(item.id, item.originalIndex, item.type);
      }
    },
  }), [id, originalIndex, moveCard, type, pairId]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: draggedItem => draggedItem.type !== type,
    drop: (draggedItem) => {
      if (draggedItem.pairId === pairId) {
        onDropPair(pairId, draggedItem.id);
      }
    },
  }), [pairId, type, onDropPair]);

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
      className={`module3-card ${type} ${isMatched ? 'matched' : ''}`} 
      style={{ opacity: isDragging ? 0 : 1 }}
      onClick={playAudio}
    >
      {text}
    </div>
  );
});

const Column = memo(({ items, type, findCard, moveCard, isMatched, onDropPair }) => (
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
        onDropPair={onDropPair}
        audioBase64={item.audioBase64}
      />
    ))}
  </div>
));

const MatchingGame = ({ pairs }) => {
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pairs.length > 0) {
      const leftItemsData = pairs.map(p => ({
        id: 'left-' + p.pairId,
        text: p.left,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      }));

      const rightItemsData = pairs.map(p => ({
        id: 'right-' + p.pairId,
        text: p.right,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      }));

      setLeftItems(leftItemsData.sort(() => Math.random() - 0.5));
      setRightItems(rightItemsData.sort(() => Math.random() - 0.5));
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

  const isMatched = (item) => matchedPairs.includes(item.pairId);

  const handleMatch = (pairId, draggedItemId) => {
    if (!matchedPairs.includes(pairId)) {
      setMatchedPairs(prev => [...prev, pairId]);

      const leftIndex = leftItems.findIndex(item => item.pairId === pairId);
      const rightIndex = rightItems.findIndex(item => item.pairId === pairId);

      if (leftIndex !== -1 && rightIndex !== -1) {
        const newLeftItems = [...leftItems];
        const newRightItems = [...rightItems];

        const leftCard = newLeftItems[leftIndex];
        const rightCard = newRightItems[rightIndex];

        const isDraggedLeft = leftCard.id === draggedItemId;
        const targetIndex = isDraggedLeft ? rightIndex : leftIndex;

        if (isDraggedLeft) {
          newLeftItems.splice(leftIndex, 1);
          newLeftItems.splice(targetIndex, 0, leftCard);
        } else {
          newRightItems.splice(rightIndex, 1);
          newRightItems.splice(targetIndex, 0, rightCard);
        }

        setLeftItems(newLeftItems);
        setRightItems(newRightItems);
      }
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="module3-matching-section">
      <Column 
        items={leftItems} 
        type="left" 
        findCard={findCard} 
        moveCard={moveCard} 
        isMatched={isMatched} 
        onDropPair={handleMatch} 
      />
      <Column 
        items={rightItems} 
        type="right" 
        findCard={findCard} 
        moveCard={moveCard} 
        isMatched={isMatched} 
        onDropPair={handleMatch} 
      />
    </div>
  );
};

const Module3 = () => {
  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchPartData = async (part) => {
          const response = await fetch(`http://localhost:3000/api/studying/A1/the_break_room/module3/${part}`);
          const data = await response.json();

          if (!data || !data.result) {
            throw new Error('Invalid API response format');
          }

          const partData = data.result[part];

          return Object.entries(partData)
            .filter(([key]) => key.startsWith('question'))
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

        const [data3a, data3b] = await Promise.all([
          fetchPartData('part3a'),
          fetchPartData('part3b')
        ]);

        setPairs3a(data3a);
        setPairs3b(data3b);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error('API Error:', err);
      }
    };

    fetchData();
  }, []);

  if (error) return <div className="module3-error">{error}</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="module3-container">
        <div className="module3-header-row">
          <AudioPlayer src="/audio/sample.mp3" />
          <h2>Tehtävä 3a</h2>
          <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
        </div>
        {pairs3a.length > 0 ? (
          <MatchingGame pairs={pairs3a} />
        ) : (
          !error && <div className="loader-container"><div className="loader"></div></div>
        )}

        <div className="module3-header-row">
          <AudioPlayer src="/audio/sample.mp3" />
          <h2>Tehtävä 3b</h2>
          <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
        </div>
        {pairs3b.length > 0 ? (
          <MatchingGame pairs={pairs3b} />
        ) : (
          !error && <div className="loader-container"><div className="loader"></div></div>
        )}
      </div>
    </DndProvider>
  );
};

export default Module3;