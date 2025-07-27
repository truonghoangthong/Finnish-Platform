import React, { useEffect, useState } from "react";
import useAudioPlayer from "@/utils/useAudioPlayer";

const QuestionBox = ({ data, allBoxes, index, onAnswer, isAnswered }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { play } = useAudioPlayer();

  useEffect(() => {
    setSelectedOption(null);
    setHoveredIndex(null);
  }, [data]);

  const isSameBox = (a, b) =>
    Number(a.x) === Number(b.x) &&
    Number(a.y) === Number(b.y) &&
    Number(a.width) === Number(b.width) &&
    Number(a.height) === Number(b.height);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handleClick = (box, boxIndex) => {
    if (isAnswered) return;
    const correct = isSameBox(box, data);
    setSelectedOption(boxIndex);
    onAnswer(
      correct,
      data.correctAudioBase64,
      data.incorrectAudioBase64,
      data.correctScript,
      data.incorrectScript
    );
  };

  return (
    <>
      {allBoxes.map((box, i) => {
        const isSelected = selectedOption === i;
        const isCorrect = isSameBox(box, data);
        const x = clamp(Number(box.x), 0, 100);
        const y = clamp(Number(box.y), 0, 100);
        const width = clamp(Number(box.width), 0, 100);
        const height = clamp(Number(box.height), 0, 100 - y);

        const shouldShow =
          hoveredIndex === i || (isSelected && isAnswered);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}%`,
              height: `${height}%`,
              zIndex: 2,
              cursor: isAnswered ? "default" : "pointer",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleClick(box, i)}
          >
            <div
              className={`star-marker ${shouldShow ? "visible" : ""} ${
                isSelected
                  ? isCorrect
                    ? "correct"
                    : "incorrect"
                  : ""
              }`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              ⭐
            </div>
          </div>
        );
      })}
    </>
  );
};

export default QuestionBox;
