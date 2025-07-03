import React, { useState, useCallback, memo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './module3.css';

const ItemTypes = {
  CARD: 'card',
};

const matches3a = [
  { id: '1a', left: 'Joutko', right: 'kahvia vai teetä' },
  { id: '2a', left: 'Käytätkö', right: 'maitoa tai sokeria' },
  { id: '3a', left: 'Laita maito', right: 'jääkaappiin' },
];

const matches3b = [
  { id: '1b', left: 'Laita likaiset kupit', right: 'tiskikoneeseen' },
  { id: '2b', left: 'Lusikka on', right: 'laatikossa' },
  { id: '3b', left: 'Tiskiaine on', right: 'loppu. Täytyy ostaa sitä lisää' },
];

const verbs = ['tyhjentää', 'pestä', 'ostaa', 'keittää', 'ottaa', 'laittaa'];
const variations = [
  ['tyhjennä', 'tyhjensi', 'on tyhjentänyt'],
  ['pese', 'pesi', 'on pessyt'],
  ['osta', 'osti', 'on ostanut'],
  ['keitä', 'keittoi', 'on keittänyt'],
  ['ota', 'otti', 'on ottanut'],
  ['laita', 'laittoi', 'on laittanut'],
];

const Card = memo(function Card({ id, text, type, findCard, moveCard, isMatched }) {
  const originalIndex = findCard(id, type).index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: { id, originalIndex, type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex, type: itemType } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveCard(droppedId, originalIndex, itemType);
        }
      },
    }),
    [id, originalIndex, moveCard, type]
  );

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      hover({ id: draggedId, type: draggedType }) {
        if (draggedId !== id && draggedType === type) {
          const { index: overIndex } = findCard(id, type);
          moveCard(draggedId, overIndex, type);
        }
      },
    }),
    [findCard, moveCard, type]
  );

  const opacity = isDragging ? 0.4 : 1;
  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`card ${isMatched ? 'matched' : ''}`}
      style={{ opacity }}
    >
      {text}
    </div>
  );
});

const Column = memo(function Column({ items, type, findCard, moveCard, isMatched }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: () => ({ type }),
  }));

  return (
    <div ref={drop} className="column">
      {items.map((item) =>
        !isMatched(item, type) ? (
          <Card
            key={`${type}-${item.id}`}
            id={item.id}
            text={type === 'left' ? item.left : item.right}
            type={type}
            findCard={findCard}
            moveCard={moveCard}
            isMatched={isMatched(item, type)}
          />
        ) : (
          <div key={`matched-${type}-${item.id}`} className="card matched">
            {type === 'left' ? item.left : item.right}
          </div>
        )
      )}
    </div>
  );
});

const MatchingGame = ({ pairs }) => {
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [leftItems, setLeftItems] = useState([...pairs]);
  const [rightItems, setRightItems] = useState([...pairs]);

  const findCard = useCallback(
    (id, type) => {
      const items = type === 'left' ? leftItems : rightItems;
      const card = items.find((c) => c.id === id);
      return {
        card,
        index: items.indexOf(card),
      };
    },
    [leftItems, rightItems]
  );

  const moveCard = useCallback(
    (id, atIndex, type) => {
      if (type === 'left') {
        setLeftItems((prevItems) => {
          const { card, index } = findCard(id, 'left');
          return update(prevItems, {
            $splice: [
              [index, 1],
              [atIndex, 0, card],
            ],
          });
        });
      } else {
        setRightItems((prevItems) => {
          const { card, index } = findCard(id, 'right');
          return update(prevItems, {
            $splice: [
              [index, 1],
              [atIndex, 0, card],
            ],
          });
        });
      }
    },
    [findCard]
  );

  const isMatched = (item, type) => {
    return matchedPairs.some((pair) => pair.id === item.id);
  };

  const handleDrop = (draggedItem, dropResult) => {
    if (!dropResult || draggedItem.type === dropResult.type) return;

    const correctPair = pairs.find(
      (p) => p.id === draggedItem.id && p.id === dropResult.id
    );
    if (correctPair && !matchedPairs.some((p) => p.id === correctPair.id)) {
      setMatchedPairs([...matchedPairs, correctPair]);
    }
  };

  return (
    <div className="matching-section">
      <Column
        items={leftItems}
        type="left"
        findCard={findCard}
        moveCard={moveCard}
        isMatched={isMatched}
        onDrop={handleDrop}
      />
      <Column
        items={rightItems}
        type="right"
        findCard={findCard}
        moveCard={moveCard}
        isMatched={isMatched}
        onDrop={handleDrop}
      />
    </div>
  );
};

const VerbsExercise = () => {
  return (
    <div className="verbs-section">
      <div className="verbs">
        {verbs.map((v) => (
          <span key={v} className="verb-root">
            {v}
          </span>
        ))}
      </div>
      <div>
        {variations.map((forms, i) => (
          <div key={i} className="variation-row">
            {forms.map((form, j) => (
              <input
                key={j}
                className="input-box"
                placeholder={`Muoto ${j + 1}`}
                defaultValue={form}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Module3 = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="module3-container">
        <h2>Tehtävä 3a</h2>
        <MatchingGame pairs={matches3a} />

        <h2>Tehtävä 3b</h2>
        <MatchingGame pairs={matches3b} />

        <h2>Tehtävä 3c</h2>
        <VerbsExercise />
      </div>
    </DndProvider>
  );
};

export default Module3;