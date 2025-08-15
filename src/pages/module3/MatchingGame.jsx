import { useState, useEffect, useCallback } from 'react';
import Column from './Column';
import './module3.css';

const MatchingGame = ({ pairs, showResults, onStateChange }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pairs.length > 0) {
      const left = pairs.map(p => ({
        id: `left-${p.pairId}`,
        text: p.left,
        pairId: p.pairId,
        audioBase64: p.audioBase64
      }));
      const right = pairs.map(p => ({
        id: `right-${p.pairId}`,
        text: p.right,
        pairId: p.pairId
      }));
      setLeftItems(left);
      setRightItems(right);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [pairs]);
  
  //return state to module3.jsx
  useEffect(() => {
    onStateChange(leftItems, rightItems);
  }, [leftItems, rightItems, onStateChange]);

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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (pairs.length === 0) {
    return <div>No matching data available</div>;
  }

  return (
    <div className="module3-matching-section">
      <Column
        items={leftItems}
        type="left"
        findCard={findCard}
        moveCard={moveCard}
        statusMap={statusMap}
      />
      <Column
        items={rightItems}
        type="right"
        findCard={findCard}
        moveCard={moveCard}
        statusMap={statusMap}
      />
    </div>
  );
};

export default MatchingGame;
