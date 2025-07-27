import React, { useState, useEffect, useRef } from "react";
import useAudioPlayer from "@/utils/useAudioPlayer";
import Mascot from "../../components/mascot/Mascot";
import { stopAllAudio } from "@/utils/audioControl";

const FloatingMascot = ({
  audio,
  script,
  onNext,
  isOutro = false,
  onRetry,
  autoPlay = false,
}) => {
  const [showScript, setShowScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audio) {
      audioRef.current = new Audio(`data:audio/mp3;base64,${audio}`);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audio]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      stopAllAudio();
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        window.currentGlobalAudio = audioRef.current;
        setIsPlaying(true);
      } catch (err) {
        console.warn("⚠️ Autoplay failed:", err);
      }
    }
  }, [autoPlay]);

  useEffect(() => {
    if (isOutro && autoPlay) {
      setIsBubbleOpen(true);
    }
  }, [isOutro, autoPlay]);

  const handleMascotClick = () => {
    if (!audioRef.current) return;

    setIsBubbleOpen((prev) => {
      const next = !prev;
      if (next) {
        stopAllAudio();
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        window.currentGlobalAudio = audioRef.current;
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return next;
    });
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      stopAllAudio();
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      window.currentGlobalAudio = audioRef.current;
      setIsPlaying(true);
    }
  };

  return (
    <div className="mascot-section">
      <div
        className="mascot-img"
        onClick={handleMascotClick}
        style={{ cursor: "pointer" }}
      >
        <Mascot />
      </div>

      {isBubbleOpen && (
        <div className="bubble" onClick={(e) => e.stopPropagation()}>
          <button onClick={toggleAudio}>
            {isPlaying ? (
              <span className="audio-loading">
                ⏸️ Pysäytä
                <div className="audio-wave">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </span>
            ) : (
              "🔁 Kuuntele uudelleen"
            )}
          </button>

          <button onClick={() => setShowScript(!showScript)}>
            {showScript ? "📜 Piilota Teksti" : "📜 Näytä Teksti"}
          </button>

          {isOutro ? (
            <button onClick={onRetry}>🔁 Uudelleen</button>
          ) : (
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                stopAllAudio();
                setIsPlaying(false);
                onNext();
              }}
            >
              ▶️ Aloita
            </button>
          )}
        </div>
      )}

      {showScript && (
        <div className="script-box">
          <p>{script}</p>
        </div>
      )}
    </div>
  );
};

export default FloatingMascot;
