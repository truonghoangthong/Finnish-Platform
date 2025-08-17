import { memo } from 'react';
import Card from './Card';

const Column = memo(({ items, type, findCard, moveCard, statusMap, userInputs, onInputChange, onMatch, disableDrag }) => (
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
        disableDrag={disableDrag}
      />
    ))}
  </div>
));

export default Column;