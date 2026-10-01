import confetti from 'canvas-confetti';

export const triggerSuccessConfetti = () => {
  try {
    // Left burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });
    // Right burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });
    // Center stars
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.6 },
        shapes: ['circle'],
        colors: ['#38bdf8', '#34d399', '#fbbf24'],
      });
    }, 200);
  } catch (e) {
    // graceful fallback if canvas is not ready
  }
};

export const triggerStarConfetti = () => {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#fbbf24', '#f59e0b', '#fb923c', '#eab308'],
    });
  } catch (e) {
    // fallback
  }
};
