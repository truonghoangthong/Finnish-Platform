import React from "react";
import Lottie from "lottie-react";
import mascotData from "../../assets/mascot.json";

const Mascot = () => {
  return (
    <Lottie
      animationData={mascotData}
      loop
      autoplay
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default Mascot;
