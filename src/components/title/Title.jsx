import React, { useMemo } from "react";
import AudioPlayer from "@/components/audioPlayer/AudioPlayer";
import "./title.css";

const Title = ({ audioBase64, script }) => {
  const { taskLabel, description } = useMemo(() => {
    if (!script) return { taskLabel: "", description: "" };
    const match = script.match(/^([^.]*)\.\s*(.*)$/);
    if (match) {
      return { taskLabel: match[1], description: match[2] };
    }
    return { taskLabel: script, description: "" };
  }, [script]);

  return (
    <div className="title-wrapper" role="group" aria-label="Task title">
      <div className="title-audio">
        <AudioPlayer
          src={`data:audio/mp3;base64,${audioBase64}`}
          size="small"
        />
      </div>

      {taskLabel && <span className="title-label">{taskLabel}</span>}
      {description && <span className="title-description">{description}</span>}
    </div>
  );
};

export default Title;
