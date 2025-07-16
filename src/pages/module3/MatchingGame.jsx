import { useState, useCallback, useRef, useEffect } from 'react';
import Column from './Column';

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

export default MatchingGame;