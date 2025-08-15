import React, { useEffect, useRef, useState } from 'react';
import './audioPlayer.css';

const AudioPlayer = ({ src, size = 'small' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Lắng nghe sự kiện thực từ <audio> để đồng bộ animation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Khi đổi src: dừng audio + tắt animation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play(); // state sẽ được set qua onPlay
      } catch (e) {
        // Có thể bị chặn autoplay; bỏ qua hoặc hiện toast nếu muốn
        // console.error(e);
      }
    } else {
      audio.pause(); // state sẽ được set qua onPause
    }
  };

  return (
    <div className={`cover ${size}`} onClick={togglePlay}>
      <div className={`icon ${size}`}>
        <div className="speaker">
          <div className={`wave wave1 ${isPlaying ? '' : 'paused'}`}></div>
          <div className={`wave wave2 ${isPlaying ? '' : 'paused'}`}></div>
        </div>
        <audio ref={audioRef} src={src} preload="auto"></audio>
      </div>
    </div>
  );
};

export default AudioPlayer;
