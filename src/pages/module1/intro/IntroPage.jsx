import React, { useEffect, useState } from "react";
import { fetchLessonIntro } from "@/utils/api";
import Loader from "@/components/loader/loader";
import VocabIntro from "./VocabIntro";
import "./vocab-intro.css";

const IntroPage = () => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchLessonIntro("A1", "the_break_room");
      setLesson(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <Loader />
      </div>
    );
  }
  if (!lesson) return null;

  return <VocabIntro lesson={lesson} />;
};

export default IntroPage;
