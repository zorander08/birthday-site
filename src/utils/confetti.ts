import confetti from 'canvas-confetti';

/**
 * Запуск праздничных конфетти в пастельно-розовой и золотистой гамме
 */
export function launchRomanticConfetti() {
  const colors = ['#F8E5EC', '#EAB8C8', '#C77F99', '#FFF7F8', '#E8B974', '#FF9EAA'];

  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: colors,
    ticks: 200,
    gravity: 0.8,
    scalar: 1.1,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });

  // Вторая легкая волна
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      disableForReducedMotion: true,
    });
  }, 250);
}
