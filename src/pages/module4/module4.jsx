import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./module4.css";
import "../../components/loader/loader.css";
import Mascot from "../../components/mascot/Mascot";

const Module4 = () => {
  const location = useLocation();
  const [moduleData, setModuleData] = useState({
    part4a: {
      questions: [],
      imgLink: ""
    },
    part4b: [],
    part4c: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translations, setTranslations] = useState({});
  const [answers, setAnswers] = useState({});
  const [currentAudio, setCurrentAudio] = useState(null);
  const [activeAudio, setActiveAudio] = useState(null);
  const [current4aIndex, setCurrent4aIndex] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [showFinnishInstruction, setShowFinnishInstruction] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const pathParts = location.pathname.split('/');
        const level = pathParts[pathParts.indexOf('course') + 1] || 'a1';
        const moduleName = location.pathname.includes('lesson-2') ? 'another_module' : 'the_break_room';
        const moduleNumber = 4;
        
        const [part4aRes, part4bRes, part4cRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part4a`),
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part4b`),
          axios.get(`http://localhost:3000/api/studying/${level.toUpperCase()}/${moduleName}/module${moduleNumber}/part4c`)
        ]);
        console.log(part4aRes.data.result.part4a);
        console.log(part4bRes.data.result.part4b);
        console.log(part4cRes.data.result.part4c);
        const part4aQuestions = [];
        for (let i = 1; i <= 6; i++) {
          const question = part4aRes.data.result.part4a[`question${i}`];
          if (question) {
            part4aQuestions.push({
              id: `4a-${i}`,
              text: question.script,
              audio: question.audioBase64
            });
          }
        }

        const part4bQuestions = [];
        for (let i = 1; i <= 3; i++) {
          const question = part4bRes.data.result.part4b[`question${i}`];
          if (question) {
            part4bQuestions.push({
              id: `4b-${i}`,
              text: question.script,
              audio: question.audioBase64
            });
          }
        }

        const part4cQuestions = [];
        for (let i = 1; i <= 2; i++) {
          const question = part4cRes.data.result.part4c[`question${i}`];
          if (question) {
            part4cQuestions.push({
              id: `4c-${i}`,
              text: question.script,
              audio: question.audioBase64
            });
          }
        }

        setModuleData({
          part4a: {
            questions: part4aQuestions,
            imgLink: part4aRes.data.result.part4a.imageLink || ""
          },
          part4b: part4bQuestions,
          part4c: part4cQuestions
        });

        setLoading(false);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, [location.pathname]);

  useEffect(() => {
    if (showFinnishInstruction) {
      const timer = setTimeout(() => {
        setShowFinnishInstruction(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showFinnishInstruction]);

  const playAudio = (audioBase64) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.onended = null;
      setIsPlayingSequence(false);
    }
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    setCurrentAudio(audio);
    audio.play();
    return audio;
  };

  const playNext4aAudio = (index) => {
    if (index >= moduleData.part4a.questions.length) {
      setIsPlayingSequence(false);
      return;
    }
    
    const audioToPlay = moduleData.part4a.questions[index]?.audio;
    if (audioToPlay) {
      setActiveAudio({ part: '4a', index });
      setCurrent4aIndex(index);
      
      const audio = new Audio(`data:audio/mp3;base64,${audioToPlay}`);
      audio.play();
      
      audio.onended = () => {
        playNext4aAudio(index + 1);
      };
      
      setCurrentAudio(audio);
    }
  };

  const playPartAudio = (part, index = null) => {
    if (activeAudio?.part === part && activeAudio?.index === index && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setActiveAudio(null);
      setIsPlayingSequence(false);
      return;
    }

    let audioToPlay;
    
    switch (part) {
      case '4a':
        if (index === null) {
          setIsPlayingSequence(true);
          setCurrent4aIndex(0);
          playNext4aAudio(0);
          return;
        }
        audioToPlay = moduleData.part4a.questions[index]?.audio;
        setActiveAudio({ part: '4a', index });
        setIsPlayingSequence(false);
        break;
      case '4b':
        audioToPlay = moduleData.part4b[index]?.audio;
        setActiveAudio({ part: '4b', index });
        setIsPlayingSequence(false);
        break;
      case '4c':
        audioToPlay = moduleData.part4c[index]?.audio;
        setActiveAudio({ part: '4c', index });
        setIsPlayingSequence(false);
        break;
      default:
        return;
    }
    
    if (audioToPlay) {
      playAudio(audioToPlay);
    }
  };

  const handleTranslationChange = (id, value) => {
    setTranslations(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAnswerSelect = (id, isTrue) => {
    setAnswers(prev => ({
      ...prev,
      [id]: isTrue
    }));
  };

  const toggleFinnishInstruction = () => {
    setShowFinnishInstruction(!showFinnishInstruction);
  };

  const checkAnswers = () => {
    console.log("Translations:", translations);
    console.log("Answers:", answers);
    alert("Vastaukset tarkistetaan... Tulokset näytetään konsolissa.");
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="module4-error">{error}</div>;
  }

  return (
    <div className="module4-wrapper">
      <div className="module4-image-section">
        {moduleData.part4a.imgLink && (
          <img
            src={moduleData.part4a.imgLink}
            alt="Module 4 Listening"
            className="module4-fixed-image"
            onError={(e) => {
              e.target.src = '/path-to-default-image/default-image.jpg';
            }}
          />
        )}
        <div className="module4-mascot-container">
          <div 
            className="module4-mascot"
            onClick={toggleFinnishInstruction}
          >
            <Mascot />
          </div>
          {showFinnishInstruction && (
            <div className="module4-instruction-box">
              <div className="module4-instruction-text">
                Klikkaa tekstiä kuunnellaksesi
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="module4-content-section">
        <div className="module4-scroll-container">
          <h2 className="module4-section-title">Tehtävä 4a. Tekstin ymmärtäminen.</h2>
          
          <div className="module4-audio-list">
            {moduleData.part4a.questions.map((item, index) => (
              <div 
                key={item.id} 
                className={`module4-audio-item ${activeAudio?.part === '4a' && activeAudio?.index === index ? 'module4-active-audio' : ''}`}
                onClick={() => {
                  if (activeAudio?.part === '4a' && activeAudio?.index === index && currentAudio) {
                    currentAudio.pause();
                    setCurrentAudio(null);
                    setActiveAudio(null);
                    setIsPlayingSequence(false);
                  } else {
                    playPartAudio('4a', index);
                    setActiveAudio({ part: '4a', index });
                  }
                }}
              >
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <h2 className="module4-section-title">Tehtävä 4b. Lue teksti uudelleen.</h2>
          <p>Kirjoita jokaisen lauseen käännös alla olevaan kenttään:</p>
          
          <div className="module4-translation-exercise">
            {moduleData.part4b.map((item, index) => (
              <div 
                key={item.id} 
                className={`module4-translation-item ${activeAudio?.part === '4b' && activeAudio?.index === index ? 'module4-active-audio' : ''}`}
                onClick={() => {
                  if (activeAudio?.part === '4b' && activeAudio?.index === index && currentAudio) {
                    currentAudio.pause();
                    setCurrentAudio(null);
                    setActiveAudio(null);
                  } else {
                    playPartAudio('4b', index);
                    setActiveAudio({ part: '4b', index });
                  }
                }}
              >
                <p className="module4-clickable-text">{item.text}</p>
                <input
                  type="text"
                  value={translations[item.id] || ''}
                  onChange={(e) => handleTranslationChange(item.id, e.target.value)}
                  placeholder="Kirjoita käännös tähän..."
                  className="module4-translation-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>

          <h2 className="module4-section-title">Tehtävä 4c. Tekstin ymmärtäminen.</h2>
          <p>Valitse onko väite oikein vai väärin:</p>
          
          <div className="module4-quiz-section">
            {moduleData.part4c.map((item, index) => (
              <div 
                key={item.id} 
                className={`module4-question-item ${activeAudio?.part === '4c' && activeAudio?.index === index ? 'module4-active-audio' : ''}`}
                onClick={() => {
                  if (activeAudio?.part === '4c' && activeAudio?.index === index && currentAudio) {
                    currentAudio.pause();
                    setCurrentAudio(null);
                    setActiveAudio(null);
                  } else {
                    playPartAudio('4c', index);
                    setActiveAudio({ part: '4c', index });
                  }
                }}
              >
                <p className="module4-clickable-text">{item.text}</p>
                <div className="module4-answer-buttons" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleAnswerSelect(item.id, true)}
                    className={`module4-answer-button module4-true-button ${answers[item.id] === true ? 'module4-selected-true' : ''}`}
                  >
                    Oikein
                  </button>
                  <button
                    onClick={() => handleAnswerSelect(item.id, false)}
                    className={`module4-answer-button module4-false-button ${answers[item.id] === false ? 'module4-selected-false' : ''}`}
                  >
                    Väärin
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="module4-check-button"
            onClick={checkAnswers}
          >
            Tarkista vastaukset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Module4; 