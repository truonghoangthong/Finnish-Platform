import React, { useEffect, useState } from "react";
import LessonLayout from "@/components/layouts/LessonLayout";
import Listening2A from "./Listening2A";
import Listening2B from "./Listening2B";
import Loader from "@/components/loader/loader";
import "@/pages/module2/module2.css";

const Listening2AB = () => {
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePart, setActivePart] = useState("2a");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, resB, resLesson] = await Promise.all([
          fetch(
            "http://localhost:3000/api/studying/A1/the_break_room/module2/part2a",
          ),
          fetch(
            "http://localhost:3000/api/studying/A1/the_break_room/module2/part2b",
          ),
          fetch("http://localhost:3000/api/learning/A1"),
        ]);

        const jsonA = await resA.json();
        const jsonB = await resB.json();
        const lessonJson = await resLesson.json();

        const currentLesson = lessonJson.result.find(
          (item) => item.lessonName === "the_break_room",
        );

        setLessonInfo(currentLesson);
        setDataA(jsonA.result.part2a);
        setDataB(jsonB.result.part2b);
      } catch (err) {
        console.error("❌ Error loading Module 2 data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToPart2B = () => {
    setActivePart("2b");
    document
      .getElementById("part2b-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading || !dataA || !dataB || !lessonInfo) {
    return (
      <div className="loader-wrapper">
        <Loader />
      </div>
    );
  }

  return (
    <LessonLayout
      level="A1"
      lessonNumber={lessonInfo.lessonNumber}
      title={lessonInfo.lessonName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())}
      showImage={false}
      imageSrc={dataA.imageLink}
    >
      <div className="lesson-content" style={{ position: "relative" }}>
        <Listening2A
          data={dataA}
          onScrollToPartB={scrollToPart2B}
          active={activePart === "2a"}
        />
      </div>

      <div
        id="part2b-section"
        className="lesson-content part2b-wrapper"
        style={{ position: "relative" }}
      >
        <Listening2B data={dataB} active={activePart === "2b"} />
      </div>
    </LessonLayout>
  );
};

export default Listening2AB;
