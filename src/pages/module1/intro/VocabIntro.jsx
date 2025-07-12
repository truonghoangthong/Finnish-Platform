// ✅ VocabIntro.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLessonIntro } from "../../../utils/api";
import Mascot from "../../../components/mascot/Mascot";
import AOS from "aos";
import "aos/dist/aos.css";
import "./vocab-intro.css";
import Loader from "../../../components/loader/loader";
import LessonLayout from "../../../components/layouts/LessonLayout";

const VocabIntro = () => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScript, setShowScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 600 });
    const loadLesson = async () => {
      const data = await fetchLessonIntro("A1", "the_break_room");
      setLesson(data);
      setLoading(false);
    };
    loadLesson();
  }, []);

  const playAudioFromStart = async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio play failed:", error);
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    isPlaying ? pauseAudio() : playAudioFromStart();
  };

  const handleMascotClick = () => {
    setIsBubbleOpen((prev) => {
      const next = !prev;
      if (next) playAudioFromStart();
      else pauseAudio();
      return next;
    });
  };

  const handleToggleScript = () => {
    setShowScript((prev) => {
      const next = !prev;
      if (!prev) {
        setTimeout(() => {
          transcriptRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
      return next;
    });
  };

  const goToNext = () => {
    navigate("/course/a1/lesson-1/vocabulary/1a");
  };

  if (loading) {
    return (
      <div className="vocab-intro loader-wrapper">
        <Loader />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <LessonLayout
      level="A1"
      lessonNumber={1}
      title="The Break Room"
      showImage={true}
      imageSrc={lesson.imageLink}
      imageChildren={(
        <div className="mascot-overlay-in-image">
          <div className="mascot-inner glow" onClick={handleMascotClick}>
            <Mascot />
          </div>

          {isBubbleOpen && (
            <div className="chat-bubble" onClick={(e) => e.stopPropagation()}>
              <button className="action-button" onClick={toggleAudio}>
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
                  "🔊 Kuuntele uudelleen"
                )}
              </button>

              <button className="action-button" onClick={handleToggleScript}>
                {showScript ? "📖 Piilota käsikirjoitus" : "📖 Näytä käsikirjoitus"}
              </button>

              <button className="action-button" onClick={goToNext}>
                ⏭️ Seuraava
              </button>
            </div>
          )}
        </div>
      )}
    >
      {/* ✅ Nội dung dưới ảnh */}
      {showScript && (
        <section className="transcript" data-aos="fade-up" ref={transcriptRef}>
          <p>📜 {lesson.description}</p>
        </section>
      )}

      <audio
        ref={audioRef}
        src={`data:audio/mp3;base64,${lesson.descriptionAudio}`}
        onEnded={() => setIsPlaying(false)}
      />
    </LessonLayout>
  );
};

export default VocabIntro;
