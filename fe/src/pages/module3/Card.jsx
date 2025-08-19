import { useState, memo, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = { CARD: "card" };

const Card = memo(
  ({
    id,
    text,
    type,
    pairId,
    findCard,
    moveCard,
    status,
    audioBase64,
    userInput,
    onInputChange,
    onMatch,
    disableDrag,
  }) => {
    const [initialRender, setInitialRender] = useState(true);
    const originalIndex = findCard(id, type)?.index || 0;
    const ref = useRef(null);

    useEffect(() => {
      const timer = setTimeout(() => setInitialRender(false), 50);
      return () => clearTimeout(timer);
    }, []);

    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: ItemTypes.CARD,
        item: { id, originalIndex, type, pairId },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
        canDrag: () => !status && !disableDrag,
        end: (item, monitor) => {
          if (!monitor.didDrop())
            moveCard(item.id, item.originalIndex, item.type);
        },
      }),
      [id, originalIndex, moveCard, type, status, pairId, disableDrag],
    );

    const [, drop] = useDrop(
      () => ({
        accept: ItemTypes.CARD,
        canDrop: () => !status && !disableDrag,
        drop: (draggedItem) => {
          if (draggedItem.id !== id && draggedItem.type !== type) {
            const { index: overIndex } = findCard(id, type);
            moveCard(draggedItem.id, overIndex, type);
            if (onMatch && type === "right") {
              onMatch(draggedItem.pairId, id);
            }
          }
        },
        hover: ({ id: draggedId }) => {
          if (draggedId !== id) {
            const { index: overIndex } = findCard(id, type);
            moveCard(draggedId, overIndex, type);
          }
        },
      }),
      [findCard, moveCard, type, status, onMatch, disableDrag],
    );

    drag(drop(ref));

    const playAudio = () => {
      if (status === "correct" && audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audio.play().catch((e) => console.error("Audio playback failed:", e));
      }
    };

    const handleInputClick = (e) => {
      e.stopPropagation();
    };

    return (
      <div
        ref={ref}
        className={`module3-card ${type} ${status || ""} ${initialRender ? "initial-render" : ""} ${disableDrag ? "drag-disabled" : ""}`}
        style={{ opacity: isDragging ? 0 : 1 }}
        onClick={status ? playAudio : undefined}
      >
        {type === "left" && onInputChange ? (
          <input
            type="text"
            value={userInput || ""}
            onChange={(e) => onInputChange(pairId, e.target.value)}
            onClick={handleInputClick}
            placeholder="Enter verb"
            className={`module3-verb-input ${status || ""}`}
            disabled={status === "correct"}
          />
        ) : (
          text
        )}
      </div>
    );
  },
);

export default Card;
