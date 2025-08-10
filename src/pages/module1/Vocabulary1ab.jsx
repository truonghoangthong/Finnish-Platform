import React, { useEffect, useState } from 'react';
import LessonLayout from "../../components/layouts/LessonLayout";
import VocabPart1A from './part1a/VocabPart1A';
import VocabPart1B from './part1b/VocabPart1B';
import Loader from "@/components/loader/loader";

const Vocabulary1ab = () => {
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/studying/A1/the_break_room/module1/part1a');
        const json = await res.json();
        setDataA(json.result.part1a);

        const res2 = await fetch('http://localhost:3000/api/studying/A1/the_break_room/module1/part1b');
        const json2 = await res2.json();
        setDataB(json2.result.part1b);
      } catch (error) {
        console.error("❌ Error fetching part1a/part1b:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Loader căn giữa màn hình
  if (!dataA || !dataB) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <Loader />
      </div>
    );
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
