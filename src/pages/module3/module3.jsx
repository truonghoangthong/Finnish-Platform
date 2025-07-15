import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AudioPlayer from '../../components/audioPlayer/audioPlayer';
import './module3.css';
import '../../components/loader/loader.css';

const ItemTypes = { CARD: 'card' };

const Card = memo(({ id, text, type, pairId, findCard, moveCard, moveMatchedCard, isMatched, isMerged, onDropPair, audioBase64 }) => {
  const originalIndex = findCard(id, type)?.index || 0;
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, originalIndex, type, pairId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    canDrag: () => !isMatched && !isMerged,
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        moveCard(item.id, item.originalIndex, item.type);
      }
    },
  }), [id, originalIndex, moveCard, type, pairId, isMatched, isMerged]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    canDrop: draggedItem => draggedItem.type !== type && !isMatched && !isMerged,
    drop: (draggedItem) => {
      if (draggedItem.pairId === pairId) {
        onDropPair(pairId, draggedItem.id, type);
      }
    },
  }), [pairId, type, onDropPair, isMatched, isMerged]);

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
      className={`module3-card ${type} ${isMatched ? 'matched' : ''} ${isMerged ? 'tight' : ''}`} 
      style={{ opacity: isDragging ? 0 : 1 }}
      onClick={playAudio}
    >
      {text}
    </div>
  );
});

const Column = memo(({ items, type, findCard, moveCard, moveMatchedCard, isMatched, isMerged, onDropPair }) => {
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
          moveMatchedCard={moveMatchedCard}
          isMatched={isMatched(item)}
          isMerged={isMerged(item)}
          onDropPair={onDropPair}
          audioBase64={item.audioBase64}
        />
      ))}
    </div>
  );
});

const MatchingGame = ({ pairs }) => {
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mergedCards, setMergedCards] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pairs.length > 0) {
      const shuffledPairs = [...pairs].sort(() => Math.random() - 0.5);

      const leftItemsData = shuffledPairs.map(p => ({
        id: 'left-' + p.pairId,
        text: p.left,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      }));

      const rightItemsData = shuffledPairs.map(p => ({
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

  const moveMatchedCardToIndex = useCallback((pairId, indexToMove, sourceType) => {
    const targetType = sourceType === 'left' ? 'right' : 'left';
    const targetItems = targetType === 'left' ? [...leftItems] : [...rightItems];
    const currentIndex = targetItems.findIndex(item => item.pairId === pairId);
    if (currentIndex === -1) return;
    const [matchedCard] = targetItems.splice(currentIndex, 1);
    targetItems.splice(indexToMove, 0, matchedCard);
    if (targetType === 'left') setLeftItems(targetItems);
    else setRightItems(targetItems);
  }, [leftItems, rightItems]);

  const isMatched = useCallback((item) => matchedPairs.includes(item.pairId), [matchedPairs]);
  const isMerged = useCallback((item) => mergedCards.includes(item.pairId), [mergedCards]);

  const handleMatch = useCallback((pairId, draggedItemId, dropTargetType) => {
    if (!matchedPairs.includes(pairId)) {
      const { index: dropIndex } = findCard(draggedItemId, dropTargetType);
      const otherType = dropTargetType === 'left' ? 'right' : 'left';
      moveMatchedCardToIndex(pairId, dropIndex, dropTargetType);
      setMatchedPairs(prev => [...prev, pairId]);
      setMergedCards(prev => [...prev, pairId]);
    }
  }, [matchedPairs, moveMatchedCardToIndex, findCard]);

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
        moveMatchedCard={moveMatchedCardToIndex}
        isMatched={isMatched} 
        isMerged={isMerged}
        onDropPair={handleMatch} 
      />
      <Column 
        items={rightItems} 
        type="right" 
        findCard={findCard} 
        moveCard={moveCard} 
        moveMatchedCard={moveMatchedCardToIndex}
        isMatched={isMatched} 
        isMerged={isMerged}
        onDropPair={handleMatch} 
      />
    </div>
  );
};

const Module3 = () => {
  const [pairs3a, setPairs3a] = useState([]);
  const [pairs3b, setPairs3b] = useState([]);
  const [pairs3c, setPairs3c] = useState([]);
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

        const [data3a, data3b, data3c] = await Promise.all([
          fetchPartData('part3a'),
          fetchPartData('part3b'),
          fetchPartData('part3c')
        ]);

        setPairs3a(data3a);
        setPairs3b(data3b);
        setPairs3c(data3c);
        setLoading(false);
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
        {pairs3a.length > 0 && <MatchingGame pairs={pairs3a} />}

        <div className="module3-header-row">
          <AudioPlayer src="/audio/sample.mp3" />
          <h2>Tehtävä 3b</h2>
          <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
        </div>
        {pairs3b.length > 0 && <MatchingGame pairs={pairs3b} />}

        <div className="module3-header-row">
          <AudioPlayer src="/audio/sample.mp3" />
          <h2>Tehtävä 3c</h2>
          <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
        </div>
        {pairs3c.length > 0 && <MatchingGame pairs={pairs3c} />}
      </div>
    </DndProvider>
  );
};

export default Module3;