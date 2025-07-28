// src/components/title/Title.jsx
import React from "react";
import AudioPlayer from "@/components/audioPlayer/AudioPlayer"; // hoặc ../ tùy cấu hình
import "./title.css"; // ✅ import CSS riêng bạn vừa tạo

const Title = ({ audioBase64, taskLabel, script }) => {
  return (
    <div className="title-wrapper">
      <div className="title-audio">
        <AudioPlayer src={`data:audio/mp3;base64,${audioBase64}`} size="small" />
      </div>
      <span className="title-label">{taskLabel}</span>
      <span className="title-description">{script}</span>
    </div>
  );
};

export default Title;
