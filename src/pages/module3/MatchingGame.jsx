import { useState, useEffect, useCallback } from 'react';
import Column from './Column';
import './module3.css';

const MatchingGame = ({ pairs, showResults, onStateChange }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    if (pairs.length > 0) {
      setLoading(true); // Bắt đầu loading ngay khi nhận pairs mới

      // Delay nhẹ để tránh hiển thị mảng gốc
      setTimeout(() => {
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

        setLeftItems(shuffleArray(left));
        setRightItems(shuffleArray(right));
        setLoading(false); // Chỉ render khi đã shuffle xong
      }, 0);
    } else {
      setLoading(false);
    }
  }, [pairs]);

  // Gửi state về Module3.jsx
  useEffect(() => {
    if (!loading) {
      onStateChange(leftItems, rightItems);
    }
  }, [leftItems, rightItems, loading, onStateChange]);

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
