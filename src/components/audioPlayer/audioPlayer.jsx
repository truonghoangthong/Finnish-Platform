import React, { useRef, useState } from 'react';
import './audioPlayer.css';

const AudioPlayer = ({ src, size = 'small' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`cover ${size}`} onClick={togglePlay}>
      <div className={`icon ${size}`}>
        <div className="speaker">
          <div className={`wave wave1 ${isPlaying ? '' : 'paused'}`}></div>
          <div className={`wave wave2 ${isPlaying ? '' : 'paused'}`}></div>
        </div>
        <audio ref={audioRef} src={src}></audio>
      </div>
    </div>
  );
};

export default AudioPlayer;
