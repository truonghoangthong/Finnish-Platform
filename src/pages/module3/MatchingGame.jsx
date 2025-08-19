import { useState, useEffect, useCallback } from "react";
import Column from "./Column";
import "./module3.css";

const MatchingGame = ({ pairs, showResults, results, onStateChange }) => {
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
      setLoading(true);
      setTimeout(() => {
        const left = pairs.map((p) => ({
          id: `left-${p.pairId}`,
          text: p.left,
          pairId: p.pairId,
          audioBase64: p.audioBase64,
        }));

        const right = pairs.map((p) => ({
          id: `right-${p.pairId}`,
          text: p.right,
          pairId: p.pairId,
        }));

        setLeftItems(shuffleArray(left));
        setRightItems(shuffleArray(right));
        setLoading(false);
      }, 0);
    } else {
      setLoading(false);
    }
  }, [pairs]);

  useEffect(() => {
    if (showResults && results) {
      const newStatusMap = {};
      Object.keys(results).forEach((pairId) => {
        const isCorrect = results[pairId];
        newStatusMap[`left-${pairId}`] = isCorrect ? "correct" : "incorrect";
        newStatusMap[`right-${pairId}`] = isCorrect ? "correct" : "incorrect";
      });
      setStatusMap(newStatusMap);
    } else {
      setStatusMap({});
    }
  }, [showResults, results]);

  useEffect(() => {
    if (!loading) {
      onStateChange(leftItems, rightItems);
    }
  }, [leftItems, rightItems, loading, onStateChange]);

  const findCard = useCallback(
    (id, type) => {
      const items = type === "left" ? leftItems : rightItems;
      const card = items.find((c) => c.id === id);
      return { card, index: items.indexOf(card) };
    },
    [leftItems, rightItems],
  );

  const moveCard = useCallback(
    (id, atIndex, type) => {
      const items = type === "left" ? leftItems : rightItems;
      const { card, index } = findCard(id, type);
      if (!card) return;
      const newItems = [...items];
      newItems.splice(index, 1);
      newItems.splice(atIndex, 0, card);
      if (type === "left") setLeftItems(newItems);
      else setRightItems(newItems);
    },
    [findCard, leftItems, rightItems],
  );

  const equalizeRowHeights = useCallback(() => {
    const section = document.querySelector(".module3-matching-section");
    if (!section) return;

    const leftCards = section.querySelectorAll(".module3-column.left .module3-card");
    const rightCards = section.querySelectorAll(".module3-column.right .module3-card");

    [...leftCards, ...rightCards].forEach((el) => (el.style.height = ""));

    const len = Math.max(leftCards.length, rightCards.length);
    for (let i = 0; i < len; i++) {
      const lh = leftCards[i]?.getBoundingClientRect().height || 0;
      const rh = rightCards[i]?.getBoundingClientRect().height || 0;
      const h = Math.max(lh, rh);
      if (leftCards[i]) leftCards[i].style.height = `${h}px`;
      if (rightCards[i]) rightCards[i].style.height = `${h}px`;
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(equalizeRowHeights, 0);
    return () => clearTimeout(t);
  }, [leftItems, rightItems, showResults, equalizeRowHeights]);

  useEffect(() => {
    const onResize = () => equalizeRowHeights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [equalizeRowHeights]);

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
