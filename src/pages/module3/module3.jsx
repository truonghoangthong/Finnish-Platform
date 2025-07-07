import { useState, useCallback, memo, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AudioPlayer from '../../components/audioPlayer/audioPlayer';
import './module3.css';

const ItemTypes = { CARD: 'card' };

const pairs3a = [
  { pairId: '1a', left: 'Joutko', right: 'kahvia vai teetä' },
  { pairId: '2a', left: 'Käytätkö', right: 'maitoa tai sokeria' },
  { pairId: '3a', left: 'Laita maito', right: 'jääkaappiin' },
];

const pairs3b = [
  { pairId: '1b', left: 'Laita likaiset kupit', right: 'tiskikoneeseen' },
  { pairId: '2b', left: 'Lusikka on', right: 'laatikossa' },
  { pairId: '3b', left: 'Tiskiaine on', right: 'loppu. Täytyy ostaa sitä lisää' },
];

const Card = memo(({ id, text, type, pairId, findCard, moveCard, isMatched, onDropPair }) => {
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
    canDrop: draggedItem => draggedItem.type !== type, // chỉ cho drop từ cột khác
    drop: (draggedItem) => {
      if (draggedItem.pairId === pairId) {
        onDropPair(pairId); // báo matched
      } else {
        console.log('Sai cặp');
      }
    },
  }), [pairId, type, onDropPair]);

  drag(drop(ref));

  return (
    <div ref={ref} className={`module3-card ${isMatched ? 'matched' : ''}`} style={{ opacity: isDragging ? 0 : 1 }}>
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
      />
    ))}
  </div>
));

const MatchingGame = ({ pairs }) => {
  const [matchedPairs, setMatchedPairs] = useState([]); // array of pairId
  const [leftItems, setLeftItems] = useState(pairs.map(p => ({ id: 'left-' + p.pairId, text: p.left, pairId: p.pairId })));
  const [rightItems, setRightItems] = useState(pairs.map(p => ({ id: 'right-' + p.pairId, text: p.right, pairId: p.pairId })));

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

  const handleMatch = (pairId) => {
    if (!matchedPairs.includes(pairId)) {
      setMatchedPairs(prev => [...prev, pairId]);
    }
  };

  return (
    <div className="module3-matching-section">
      <Column items={leftItems} type="left" findCard={findCard} moveCard={moveCard} isMatched={isMatched} onDropPair={handleMatch} />
      <Column items={rightItems} type="right" findCard={findCard} moveCard={moveCard} isMatched={isMatched} onDropPair={handleMatch} />
    </div>
  );
};

const Module3 = () => (
  <DndProvider backend={HTML5Backend}>
    <div className="module3-container">
      <div className="module3-header-row">
        <AudioPlayer src="/audio/sample.mp3" />
        <h2>Tehtävä 3a</h2>
        <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
      </div>
      <MatchingGame pairs={pairs3a} />
      <div className="module3-header-row">
        <AudioPlayer src="/audio/sample.mp3" />
        <h2>Tehtävä 3b</h2>
        <p>Yhdistä vasemman ja oikean sarakkeen kortit oikeisiin pareja vetämällä.</p>
      </div>
      <MatchingGame pairs={pairs3b} />
    </div>
  </DndProvider>
);

export default Module3;
