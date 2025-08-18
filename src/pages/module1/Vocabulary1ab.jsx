import React, { useEffect, useState } from "react";
import LessonLayout from "../../components/layouts/LessonLayout";
import VocabPart1A from "./part1a/VocabPart1A";
import VocabPart1B from "./part1b/VocabPart1B";
import Loader from "@/components/loader/loader";

const Vocabulary1ab = () => {
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://finnish-platform-thong-truongs-projects.vercel.app/api/studying/A1/the_break_room/module1/part1a",
        );
        const json = await res.json();
        setDataA(json.result.part1a);

        const res2 = await fetch(
          "https://finnish-platform-thong-truongs-projects.vercel.app/api/studying/A1/the_break_room/module1/part1b",
        );
        const json2 = await res2.json();
        setDataB(json2.result.part1b);
      } catch (error) {
        console.error("❌ Error fetching part1a/part1b:", error);
      }
    };

    fetchData();
  }, []);

  if (!dataA || !dataB) {
    return <Loader />;
  }

  return (
    <LessonLayout
      level="A1"
      lessonNumber="1"
      title="Workplace Break Room"
      showImage={false}
      showMascot={false}
    >
      <VocabPart1A data={dataA} />
      <div id="part1b">
        <VocabPart1B data={dataB} />
      </div>
    </LessonLayout>
  );
};

export default Vocabulary1ab;
