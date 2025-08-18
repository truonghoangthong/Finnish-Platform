import React, { useState, useEffect, useRef } from "react";
import { stopAllAudio } from "@/utils/audioControl";
import Mascot from "../../components/mascot/Mascot";

const FloatingMascot = ({
  audio,
  script,
  onNext,
  isOutro = false,
  onRetry,
  autoPlay = false,
  externalScript = false,
  isScriptVisible, // optional controlled
  onToggleScript, // optional callback
}) => {
  const [showScript, setShowScript] = useState(false); // local fallback
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
      } catch {}
    }
  }, [autoPlay]);

  useEffect(() => {
    if (isOutro && autoPlay) setIsBubbleOpen(true);
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

  const handleToggleScript = () => {
    if (externalScript && onToggleScript) {
      onToggleScript(); // giao cho parent
    } else {
      setShowScript((v) => !v); // fallback nội bộ
    }
  };

  const scriptVisible = externalScript ? !!isScriptVisible : showScript;

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
          <button className="action-button" onClick={toggleAudio}>
            {isPlaying ? (
              <span className="audio-loading">
                <span className="label">⏸️ Pysäytä</span>
                <div className="audio-wave">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </span>
            ) : (
              <>
                <span className="icon" aria-hidden>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02z" />
                  </svg>
                </span>
                <span className="label">Kuuntele</span>
              </>
            )}
          </button>

          <button className="action-button" onClick={handleToggleScript}>
            <span className="label">
              {scriptVisible ? "📜 Piilota Teksti" : "📜 Näytä Teksti"}
            </span>
          </button>

          {isOutro ? (
            <button className="action-button" onClick={onRetry}>
              <span className="label">🔁 Uudelleen</span>
            </button>
          ) : (
            <button
              className="action-button"
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
              <span className="label">▶️ Aloita</span>
            </button>
          )}
        </div>
      )}

      {!externalScript && scriptVisible && (
        <div className="script-box">
          <p>{script}</p>
        </div>
      )}
    </div>
  );
};

export default FloatingMascot;
