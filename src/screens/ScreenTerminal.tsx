import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { InteractiveSnoopy } from '../components/InteractiveSnoopy';
import { Heart, Delete, Check, ArrowLeft } from 'lucide-react';

interface ScreenTerminalProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const ScreenTerminal: React.FC<ScreenTerminalProps> = ({ onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [missMessage, setMissMessage] = useState<string | null>(null);
  const [ameliaBubble, setAmeliaBubble] = useState(false);
  const [timurBubble, setTimurBubble] = useState(false);
  const [ameliaBubbleText, setAmeliaBubbleText] = useState('Буся! 💖');
  const [timurBubbleText, setTimurBubbleText] = useState('Босс 👑');

  const ameliaQuotes = ['Буся! 💖', 'Бусюн 🌸', 'Булка 🥐', 'Бусечка ✨', 'Буська 💕', 'Любимая бусь! 🌸'];
  const timurQuotes = ['Босс 👑', 'Нормалды 👍', 'Давид обоюдно 🤝', 'Твой Тимур 💙', 'Во скок? ⏰'];

  const validateCode = (input: string) => {
    const clean = input.replace(/[\s.-]/g, '');
    if (clean === SITE_CONFIG.secretCode || clean === SITE_CONFIG.secretCodeShort) {
      return { valid: true };
    }
    if (clean === SITE_CONFIG.specialDate2026 || clean === SITE_CONFIG.specialDate2026Short) {
      return { valid: true };
    }
    // Четыре раза 67 (67676767) - без вывода
    if (clean === SITE_CONFIG.easterEggCode) {
      return { valid: true };
    }
    return { valid: false };
  };

  const handleKeyPress = (num: string) => {
    if (isSuccess) return;
    soundManager.playClick();
    setCode((prev) => {
      if (prev.length >= 8) return prev;
      const nextCode = prev + num;
      if (
        nextCode.length === 8 ||
        nextCode === SITE_CONFIG.secretCodeShort ||
        nextCode === SITE_CONFIG.specialDate2026Short ||
        nextCode === '200426'
      ) {
        setTimeout(() => checkCode(nextCode), 60);
      }
      return nextCode;
    });
  };

  const handleDelete = () => {
    if (isSuccess || code.length === 0) return;
    soundManager.playClick();
    setCode((prev) => prev.slice(0, -1));
  };

  const checkCode = (candidate: string) => {
    const clean = candidate.replace(/[\s.-]/g, '');

    // Пасхалка на 20 апреля: «Чуть-чуть промах»
    if (clean === '20042026' || clean === '200426' || clean === '2004') {
      soundManager.playPop();
      setErrorShake(true);
      setMissMessage('Чуть-чуть промах 😉');
      setTimeout(() => {
        setErrorShake(false);
      }, 500);
      setTimeout(() => {
        setMissMessage(null);
        setCode('');
      }, 2200);
      return;
    }

    // Пасхалка 67676767: «Давид обоюдно! 🤝 Бонус!»
    if (clean === '67676767' || clean === '6767') {
      soundManager.playSparkle();
      launchRomanticConfetti();
      setMissMessage('Давид обоюдно! 🤝 Бонус!');
      setTimeout(() => {
        setMissMessage(null);
        setCode('');
      }, 2400);
      return;
    }

    const result = validateCode(candidate);
    if (result.valid) {
      setIsSuccess(true);
      soundManager.playSuccess();
      soundManager.startBackgroundMusic();
      launchRomanticConfetti();
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setErrorShake(true);
      setTimeout(() => {
        setErrorShake(false);
        setCode('');
      }, 600);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (code.length > 0) checkCode(code);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, isSuccess]);

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 18px 36px',
        maxWidth: '880px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Кнопка назад к сердечкам */}
      <div style={{ width: '100%', display: 'flex', marginBottom: '10px' }}>
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '12px', /* Квадратная со скруглением */
            backgroundColor: 'rgba(255, 252, 248, 0.92)',
            border: '1px solid var(--border-peach)',
            color: 'var(--text-dark)',
            fontSize: '0.88rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(175, 74, 101, 0.12)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Назад к фото</span>
        </button>
      </div>

      {/* Контейнер терминала */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(255, 252, 248, 0.95)',
          borderRadius: '24px',
          border: '1.5px solid var(--border-peach)',
          padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3.5vw, 32px)',
          boxShadow: 'var(--shadow-peach)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(20px, 4.5vw, 40px)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
        }}
      >
        {/* Левая часть: Соединённые сердечки в рамках и интерактивный Снупи */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Соединённые медальоны */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Сердечко Амелии в розовой рамке */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playPop();
                const nextQ = ameliaQuotes[Math.floor(Math.random() * ameliaQuotes.length)];
                setAmeliaBubbleText(nextQ);
                setAmeliaBubble(true);
                setTimeout(() => setAmeliaBubble(false), 2200);
              }}
              style={{
                width: 'clamp(120px, 26vw, 165px)',
                aspectRatio: '1.2 / 1',
                position: 'relative',
                cursor: 'pointer',
              }}
              title="Нажми на сердечко Амелии!"
            >
              <div
                style={{
                  position: 'absolute',
                  left: '18%',
                  top: '25%',
                  width: '64%',
                  height: '65%',
                  clipPath: 'url(#heart-clip-term-amelia)',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  zIndex: 2,
                }}
              >
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <clipPath id="heart-clip-term-amelia" clipPathUnits="objectBoundingBox">
                      <path d="M 0.5, 0.95 C 0.5, 0.95, 0.04, 0.65, 0.04, 0.32 C 0.04, 0.12, 0.18, 0.02, 0.34, 0.02 C 0.44, 0.02, 0.50, 0.14, 0.50, 0.14 C 0.50, 0.14, 0.56, 0.02, 0.66, 0.02 C 0.82, 0.02, 0.96, 0.12, 0.96, 0.32 C 0.96, 0.65, 0.5, 0.95, 0.5, 0.95 Z" />
                    </clipPath>
                  </defs>
                </svg>
                <img
                  src="/assets/photos/amelia/amelia_07.jpg"
                  alt="Амелия"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
                />
              </div>
              <img
                src="/assets/decorations/frame-heart-pink.png"
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 5,
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 6px 14px rgba(175, 74, 101, 0.25))',
                }}
              />

              {/* Всплывающая плашка Амелии */}
              <AnimatePresence>
                {ameliaBubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '6px',
                      backgroundColor: 'rgba(255, 252, 248, 0.98)',
                      border: '1.5px solid var(--accent-deep)',
                      borderRadius: '12px',
                      padding: '4px 12px',
                      boxShadow: '0 4px 14px rgba(175, 74, 101, 0.25)',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--accent-crimson)',
                      whiteSpace: 'nowrap',
                      zIndex: 25,
                      pointerEvents: 'none',
                    }}
                  >
                    {ameliaBubbleText}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Сердечко Тимура в синей рамке */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playPop();
                const nextQ = timurQuotes[Math.floor(Math.random() * timurQuotes.length)];
                setTimurBubbleText(nextQ);
                setTimurBubble(true);
                setTimeout(() => setTimurBubble(false), 2200);
              }}
              style={{
                width: 'clamp(120px, 26vw, 165px)',
                aspectRatio: '1.2 / 1',
                marginLeft: '-22px',
                position: 'relative',
                cursor: 'pointer',
              }}
              title="Нажми на сердечко Тимура!"
            >
              <div
                style={{
                  position: 'absolute',
                  left: '18%',
                  top: '25%',
                  width: '64%',
                  height: '65%',
                  clipPath: 'url(#heart-clip-term-timur)',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  zIndex: 2,
                }}
              >
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <clipPath id="heart-clip-term-timur" clipPathUnits="objectBoundingBox">
                      <path d="M 0.5, 0.95 C 0.5, 0.95, 0.04, 0.65, 0.04, 0.32 C 0.04, 0.12, 0.18, 0.02, 0.34, 0.02 C 0.44, 0.02, 0.50, 0.14, 0.50, 0.14 C 0.50, 0.14, 0.56, 0.02, 0.66, 0.02 C 0.82, 0.02, 0.96, 0.12, 0.96, 0.32 C 0.96, 0.65, 0.5, 0.95, 0.5, 0.95 Z" />
                    </clipPath>
                  </defs>
                </svg>
                <img
                  src="/assets/photos/timur/timur_main.png"
                  alt="Тимур"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
                />
              </div>
              <img
                src="/assets/decorations/frame-heart-blue.png"
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 5,
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 6px 14px rgba(74, 110, 175, 0.25))',
                }}
              />

              {/* Всплывающая плашка Тимура */}
              <AnimatePresence>
                {timurBubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '6px',
                      backgroundColor: 'rgba(255, 252, 248, 0.98)',
                      border: '1.5px solid #4A6EAF',
                      borderRadius: '12px',
                      padding: '4px 12px',
                      boxShadow: '0 4px 14px rgba(74, 110, 175, 0.25)',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: '#34558B',
                      whiteSpace: 'nowrap',
                      zIndex: 25,
                      pointerEvents: 'none',
                    }}
                  >
                    {timurBubbleText}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <p
            style={{
              marginTop: '6px',
            }}
          >
            <span
              className="glass-text-highlight"
              style={{
                fontFamily: 'var(--font-handwritten)',
                fontSize: '1.25rem',
                color: 'var(--accent-crimson)',
                fontWeight: 700,
              }}
            >
              Амелия & Тимур
            </span>
          </p>

          {/* Интерактивный Снупи с сердечком I LOVE YOU */}
          <div style={{ marginTop: '8px', width: 'clamp(70px, 16vw, 95px)' }}>
            <InteractiveSnoopy
              src="/assets/decorations/snoopy with heart-i love you.png"
              alt="Снупи I love you"
              quotes={[
                'Люблю тебя очень сильно бусь! 💖',
                'Босс, вводи пин-код! 👑',
                'Давид обоюдно одобряет! 🤝',
                'Нормалды! 🐾',
                'Ты как, бусюн? 🌸',
                'Буська самая любимая! 💕',
              ]}
              bubblePosition="top"
              style={{
                filter: 'drop-shadow(0 6px 12px rgba(74, 43, 51, 0.15))',
              }}
            />
          </div>
        </div>

        {/* Правая часть: Ввод полной даты рождения (29.10.2010 — 8 цифр) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '380px',
            width: '100%',
          }}
        >
          {/* 8 ячеек пин-кода с точками-разделителями */}
          <motion.div
            animate={errorShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '18px',
              flexWrap: 'nowrap',
            }}
          >
            {/* День: 2 слота */}
            {[0, 1].map((slotIdx) => {
              const hasValue = code.length > slotIdx;
              return (
                <div
                  key={slotIdx}
                  style={{
                    width: 'clamp(32px, 7vw, 38px)',
                    height: 'clamp(40px, 8.5vw, 46px)',
                    borderRadius: '10px',
                    backgroundColor: hasValue ? 'var(--bg-warm-peach)' : '#ffffff',
                    border: hasValue
                      ? '2px solid var(--accent-deep)'
                      : '1.5px solid var(--border-peach)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: hasValue
                      ? '0 3px 10px rgba(199, 107, 128, 0.25)'
                      : 'inset 0 1px 3px rgba(74, 43, 51, 0.04)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--accent-crimson)',
                  }}
                >
                  {hasValue ? code[slotIdx] : ''}
                </div>
              );
            })}

            <span style={{ color: 'var(--accent-crimson)', fontWeight: 700, fontSize: '1.2rem' }}>•</span>

            {/* Месяц: 2 слота */}
            {[2, 3].map((slotIdx) => {
              const hasValue = code.length > slotIdx;
              return (
                <div
                  key={slotIdx}
                  style={{
                    width: 'clamp(32px, 7vw, 38px)',
                    height: 'clamp(40px, 8.5vw, 46px)',
                    borderRadius: '10px',
                    backgroundColor: hasValue ? 'var(--bg-warm-peach)' : '#ffffff',
                    border: hasValue
                      ? '2px solid var(--accent-deep)'
                      : '1.5px solid var(--border-peach)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: hasValue
                      ? '0 3px 10px rgba(199, 107, 128, 0.25)'
                      : 'inset 0 1px 3px rgba(74, 43, 51, 0.04)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--accent-crimson)',
                  }}
                >
                  {hasValue ? code[slotIdx] : ''}
                </div>
              );
            })}

            <span style={{ color: 'var(--accent-crimson)', fontWeight: 700, fontSize: '1.2rem' }}>•</span>

            {/* Год: 4 слота */}
            {[4, 5, 6, 7].map((slotIdx) => {
              const hasValue = code.length > slotIdx;
              return (
                <div
                  key={slotIdx}
                  style={{
                    width: 'clamp(32px, 7vw, 38px)',
                    height: 'clamp(40px, 8.5vw, 46px)',
                    borderRadius: '10px',
                    backgroundColor: hasValue ? 'var(--bg-warm-peach)' : '#ffffff',
                    border: hasValue
                      ? '2px solid var(--accent-deep)'
                      : '1.5px solid var(--border-peach)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: hasValue
                      ? '0 3px 10px rgba(199, 107, 128, 0.25)'
                      : 'inset 0 1px 3px rgba(74, 43, 51, 0.04)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--accent-crimson)',
                  }}
                >
                  {hasValue ? code[slotIdx] : ''}
                </div>
              );
            })}
          </motion.div>

          {/* Плашка пасхалки «Чуть-чуть промах» */}
          <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <AnimatePresence>
              {missMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor: 'rgba(255, 252, 248, 0.98)',
                    border: '1.5px solid var(--accent-deep)',
                    borderRadius: '12px',
                    padding: '3px 14px',
                    boxShadow: '0 4px 14px rgba(175, 74, 101, 0.22)',
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--accent-crimson)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {missMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Квадратная цифровая клавиатура */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              width: '100%',
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <motion.button
                key={digit}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                onClick={() => handleKeyPress(digit)}
                style={{
                  height: '48px',
                  borderRadius: '12px', /* Квадратные со скруглением */
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-peach)',
                  color: 'var(--text-dark)',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(175, 74, 101, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {digit}
              </motion.button>
            ))}

            {/* Удаление */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}
              onClick={handleDelete}
              style={{
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-peach)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(175, 74, 101, 0.08)',
                cursor: 'pointer',
              }}
            >
              <Delete size={20} />
            </motion.button>

            {/* 0 */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}
              onClick={() => handleKeyPress('0')}
              style={{
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-peach)',
                color: 'var(--text-dark)',
                fontSize: '1.3rem',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(175, 74, 101, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              0
            </motion.button>

            {/* Подтверждение */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}
              onClick={() => checkCode(code)}
              style={{
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-deep)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(199, 107, 128, 0.35)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Check size={22} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.main>
  );
};
