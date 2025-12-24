/**
 * 사운드 매니저 - 스텁 버전
 */

let isMuted = false;

const soundManager = {
  initialize() {
    console.log('사운드 매니저 초기화');
  },

  playSound(soundName) {
    if (!isMuted) {
      console.log('사운드 재생:', soundName);
    }
  },

  toggleMute() {
    isMuted = !isMuted;
    console.log('음소거:', isMuted);
    return isMuted;
  }
};

export default soundManager;
