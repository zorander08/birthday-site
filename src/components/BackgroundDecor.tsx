import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/audio';

interface FloatingPetal {
  id: number;
  char: string;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
}

const LILY_QUOTES = [
  'Нежная лилия для самой красивой 🌸',
  'Цветочек для моей Буси 💖',
  'Ты прекраснее всех на свете 💖',
  'С днём рождения, любимая! 👑',
  'Самый нежный бутончик для тебя 🌷',
];

const ROSE_QUOTES = [
  'Ароматный букетик для любимой 🌷',
  'Улыбнись, бусинка! 🥰',
  'Моё самое любимое солнышко ☀️',
  'Обожаю тебя без памяти! 💕',
  'Для самой милой булочки 🥐',
];

const HEARTS_QUOTES = [
  '+100 любви к Бусе 💕',
  'Все эти сердечки — тебе! 💓',
  'Бесконечно люблю! 💖',
  'Моё сердце всегда с тобой 💕',
];

export const BackgroundDecor: React.FC = () => {
  // Верхняя лилия (слева)
  const [topLilyIndex, setTopLilyIndex] = useState(0);
  const [topLilyBubble, setTopLilyBubble] = useState(false);
  const [topLilyWobble, setTopLilyWobble] = useState(false);

  // Верхний цветок (справа)
  const [topRoseIndex, setTopRoseIndex] = useState(0);
  const [topRoseBubble, setTopRoseBubble] = useState(false);
  const [topRoseWobble, setTopRoseWobble] = useState(false);

  // Нижний цветок (слева)
  const [botRoseIndex, setBotRoseIndex] = useState(0);
  const [botRoseBubble, setBotRoseBubble] = useState(false);
  const [botRoseWobble, setBotRoseWobble] = useState(false);

  // Нижняя лилия (справа)
  const [botLilyIndex, setBotLilyIndex] = useState(0);
  const [botLilyBubble, setBotLilyBubble] = useState(false);
  const [botLilyWobble, setBotLilyWobble] = useState(false);

  // Нарисованные сердечки
  const [heartsIndex, setHeartsIndex] = useState(0);
  const [heartsBubble, setHeartsBubble] = useState(false);
  const [heartsWobble, setHeartsWobble] = useState(false);

  // Летящие лепестки
  const [petals, setPetals] = useState<FloatingPetal[]>([]);

  const spawnPetals = (originX: number, originY: number, icons: string[]) => {
    const newPetals: FloatingPetal[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      newPetals.push({
        id: Date.now() + Math.random() + i,
        char: icons[Math.floor(Math.random() * icons.length)],
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 20,
        driftX: (Math.random() - 0.5) * 120,
        driftY: 60 + Math.random() * 120,
      });
    }
    setPetals((prev) => [...prev.slice(-15), ...newPetals]);
  };

  const handleTopLilyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setTopLilyWobble(true);
    setTopLilyBubble(true);
    setTopLilyIndex((prev) => (prev + 1) % LILY_QUOTES.length);
    spawnPetals(e.clientX, e.clientY, ['🌸', '💖', '🌷', '🤍']);
    setTimeout(() => setTopLilyWobble(false), 700);
    setTimeout(() => setTopLilyBubble(false), 2400);
  };

  const handleTopRoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setTopRoseWobble(true);
    setTopRoseBubble(true);
    setTopRoseIndex((prev) => (prev + 1) % ROSE_QUOTES.length);
    spawnPetals(e.clientX, e.clientY, ['🌷', '💕', '💖', '🌸']);
    setTimeout(() => setTopRoseWobble(false), 700);
    setTimeout(() => setTopRoseBubble(false), 2400);
  };

  const handleBotRoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setBotRoseWobble(true);
    setBotRoseBubble(true);
    setBotRoseIndex((prev) => (prev + 1) % ROSE_QUOTES.length);
    spawnPetals(e.clientX, e.clientY, ['🌷', '💕', '💖', '🌸']);
    setTimeout(() => setBotRoseWobble(false), 700);
    setTimeout(() => setBotRoseBubble(false), 2400);
  };

  const handleBotLilyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setBotLilyWobble(true);
    setBotLilyBubble(true);
    setBotLilyIndex((prev) => (prev + 1) % LILY_QUOTES.length);
    spawnPetals(e.clientX, e.clientY, ['🌸', '💖', '🌷', '🤍']);
    setTimeout(() => setBotLilyWobble(false), 700);
    setTimeout(() => setBotLilyBubble(false), 2400);
  };

  const handleHeartsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setHeartsWobble(true);
    setHeartsBubble(true);
    setHeartsIndex((prev) => (prev + 1) % HEARTS_QUOTES.length);
    spawnPetals(e.clientX, e.clientY, ['💖', '💕', '💓', '💗', '🥰']);
    setTimeout(() => setHeartsWobble(false), 600);
    setTimeout(() => setHeartsBubble(false), 2200);
  };

  return (
    <div className="fixed-viewport-layer" style={{ zIndex: 5 }}>
      {/* 1. Верхний левый угол: Лилия (опущена ниже, чтобы не перекрываться панелью) */}
      <div
        onClick={handleTopLilyClick}
        style={{
          position: 'absolute',
          top: 'clamp(60px, 9vw, 95px)',
          left: 'clamp(-32px, -4.5vw, -12px)',
          width: 'clamp(145px, 19vw, 310px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          userSelect: 'none',
          zIndex: 8,
        }}
        title="Цветочек для тебя!"
      >
        <motion.img
          src="/assets/decorations/vecteezy_pink-lily-flower-isolated-on-transparent-background_47241289.png"
          alt="Лилия"
          animate={
            topLilyWobble
              ? {
                  rotate: [-12, -22, -4, -18, -12],
                  scale: [1, 1.14, 0.96, 1.05, 1],
                }
              : { rotate: -12 }
          }
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.88,
            display: 'block',
            filter: 'drop-shadow(0 6px 16px rgba(175, 74, 101, 0.2))',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <AnimatePresence>
          {topLilyBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                top: '75%',
                left: '60%',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '16px',
                padding: '6px 14px',
                boxShadow: '0 6px 18px rgba(175, 74, 101, 0.28)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: 'clamp(1.1rem, 3.2vw, 1.35rem)',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            >
              {LILY_QUOTES[topLilyIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Верхний правый угол: Розовый цветок (опущен ниже, чтобы не перекрываться панелью) */}
      <div
        onClick={handleTopRoseClick}
        style={{
          position: 'absolute',
          top: 'clamp(66px, 10vw, 102px)',
          right: 'clamp(-28px, -4vw, -10px)',
          width: 'clamp(130px, 16vw, 260px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          userSelect: 'none',
          zIndex: 8,
        }}
        title="Цветочек для тебя!"
      >
        <motion.img
          src="/assets/decorations/kakojtorozovijcvetok.png"
          alt="Розовый цветок"
          animate={
            topRoseWobble
              ? {
                  rotate: [18, 28, 8, 24, 18],
                  scale: [1, 1.15, 0.95, 1.06, 1],
                }
              : { rotate: 18 }
          }
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.85,
            display: 'block',
            filter: 'drop-shadow(0 6px 14px rgba(175, 74, 101, 0.18))',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <AnimatePresence>
          {topRoseBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                top: '75%',
                right: '40%',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '16px',
                padding: '6px 14px',
                boxShadow: '0 6px 18px rgba(175, 74, 101, 0.28)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: 'clamp(1.1rem, 3.2vw, 1.35rem)',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            >
              {ROSE_QUOTES[topRoseIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Нижний левый угол: Розовый цветок (вместо Снупи, повернут красиво в другую сторону) */}
      <div
        onClick={handleBotRoseClick}
        style={{
          position: 'absolute',
          bottom: 'clamp(6px, 2vw, 18px)',
          left: 'clamp(-12px, -1.5vw, -4px)',
          width: 'clamp(120px, 15vw, 240px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          userSelect: 'none',
          zIndex: 8,
        }}
        title="Цветочек для тебя!"
      >
        <motion.img
          src="/assets/decorations/kakojtorozovijcvetok.png"
          alt="Цветок"
          animate={
            botRoseWobble
              ? {
                  rotate: [-35, -45, -25, -40, -35],
                  scale: [1, 1.14, 0.96, 1.05, 1],
                }
              : { rotate: -35 }
          }
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.82,
            transform: 'scaleX(-1)', // Отражаем, чтобы не выглядели одинаково
            display: 'block',
            filter: 'drop-shadow(0 6px 14px rgba(175, 74, 101, 0.18))',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <AnimatePresence>
          {botRoseBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                bottom: '85%',
                left: '40%',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '16px',
                padding: '6px 14px',
                boxShadow: '0 6px 18px rgba(175, 74, 101, 0.28)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: 'clamp(1.05rem, 3.2vw, 1.3rem)',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            >
              {ROSE_QUOTES[botRoseIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Нижний правый угол: Нежная лилия (вместо Снупи, повернута в другую сторону) */}
      <div
        onClick={handleBotLilyClick}
        style={{
          position: 'absolute',
          bottom: 'clamp(6px, 2vw, 18px)',
          right: 'clamp(-18px, -2vw, -6px)',
          width: 'clamp(135px, 17vw, 280px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          userSelect: 'none',
          zIndex: 8,
        }}
        title="Цветочек для тебя!"
      >
        <motion.img
          src="/assets/decorations/vecteezy_pink-lily-flower-isolated-on-transparent-background_47241289.png"
          alt="Лилия"
          animate={
            botLilyWobble
              ? {
                  rotate: [32, 42, 22, 38, 32],
                  scale: [1, 1.14, 0.96, 1.05, 1],
                }
              : { rotate: 32 }
          }
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.85,
            transform: 'scaleX(-1)', // Отражаем зеркально
            display: 'block',
            filter: 'drop-shadow(0 6px 16px rgba(175, 74, 101, 0.2))',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <AnimatePresence>
          {botLilyBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                bottom: '85%',
                right: '40%',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '16px',
                padding: '6px 14px',
                boxShadow: '0 6px 18px rgba(175, 74, 101, 0.28)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: 'clamp(1.05rem, 3.2vw, 1.3rem)',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            >
              {LILY_QUOTES[botLilyIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Нарисованные сердечки на заднем плане */}
      <div
        onClick={handleHeartsClick}
        style={{
          position: 'absolute',
          top: '22%',
          right: '8%',
          width: 'clamp(90px, 13vw, 200px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          userSelect: 'none',
          zIndex: 7,
        }}
        title="Нажми на сердечки!"
      >
        <motion.img
          src="/assets/decorations/hand drawn pink hearts.png"
          alt="Сердечки"
          animate={
            heartsWobble
              ? {
                  scale: [1, 1.28, 0.92, 1.12, 1],
                  rotate: [14, 24, 6, 18, 14],
                }
              : { rotate: 14 }
          }
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '100%',
            height: 'auto',
            opacity: 0.45,
            display: 'block',
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        <AnimatePresence>
          {heartsBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ duration: 0.22 }}
              style={{
                position: 'absolute',
                top: '-32px',
                right: '0',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '16px',
                padding: '4px 12px',
                boxShadow: '0 4px 14px rgba(175, 74, 101, 0.25)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            >
              {HEARTS_QUOTES[heartsIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Летящие лепестки от прикосновений к цветам */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ opacity: 1, scale: 0.6, x: petal.x, y: petal.y }}
          animate={{
            opacity: [1, 0.9, 0],
            scale: [0.6, 1.25, 0.8],
            x: petal.x + petal.driftX,
            y: petal.y + petal.driftY,
            rotate: [0, (petal.driftX > 0 ? 1 : -1) * 60],
          }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setPetals((prev) => prev.filter((p) => p.id !== petal.id));
          }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            fontSize: '1.4rem',
            zIndex: 40,
            userSelect: 'none',
          }}
        >
          {petal.char}
        </motion.div>
      ))}
    </div>
  );
};
