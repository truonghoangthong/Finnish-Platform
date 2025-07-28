export const stopAllAudio = () => {
  if (window.currentGlobalAudio) {
    window.currentGlobalAudio.pause();
    window.currentGlobalAudio.currentTime = 0;
    window.currentGlobalAudio = null;
  }
};
