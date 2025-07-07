import { useState } from "react";
import VocabIntro from "./VocabIntro";

const STEPS = {
  INTRO: "intro",
};

export default function Vocabulary() {
  const [step, setStep] = useState(STEPS.INTRO);

  return (
    <>
      {step === STEPS.INTRO && <VocabIntro onNext={() => console.log("➡️ Go to Part1A")} />}
    </>
  );
}
