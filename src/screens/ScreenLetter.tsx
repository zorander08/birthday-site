import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { LottieAnimation } from '../components/LottieAnimation';
import { ArrowLeft, Mail, Heart } from 'lucide-react';

interface ScreenLetterProps {
  onBack: () => void;
}

interface Stamp {
  id: number;
  x: number;
  y: number;
  rotation: number;
  type: 'kiss' | 'heart';
}

export const ScreenLetter: React.FC<ScreenLetterProps> = ({ onBack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [kissesCount, setKissesCount] = useState(0);
  const [heartsCount, setHeartsCount] = useState(0);
  const [showSigBubble, setShowSigBubble] = useState(false);
  const [catWobble, setCatWobble] = useState(false);
  const [catBubble, setCatBubble] = useState<string | null>(null);

  const catQuotes = [
    'Буся лучшая! 🐾',
    'Мур-мур, нормалды! 🥰',
    'Давид обоюдно мяукнул! 🤝',
    'Ты как, бусюн? 💖',
    'Люблю Буську! 🌸',
  ];

  const handleCatClick = () => {
    soundManager.playPop();
    setCatWobble(true);
    const randomQuote = catQuotes[Math.floor(Math.random() * catQuotes.length)];
    setCatBubble(randomQuote);
    setTimeout(() => setCatWobble(false), 450);
    setTimeout(() => setCatBubble(null), 2000);
  };

  const letter = SITE_CONFIG.letter;

  const handleOpenCard = () => {
    if (!isOpen) {
      soundManager.playSuccess();
      launchRomanticConfetti();
      setIsOpen(true);
    }
  };

  const handleAddStamp = (type: 'kiss' | 'heart') => {
    soundManager.playPop();
    const newStamp: Stamp = {
      id: Date.now() + Math.random(),
      x: 18 + Math.random() * 64, // внутри пергамента
      y: 20 + Math.random() * 60,
      rotation: (Math.random() - 0.5) * 36,
      type,
    };
    setStamps((prev) => [...prev.slice(-18), newStamp]);
    if (type === 'kiss') {
      setKissesCount((prev) => prev + 1);
    } else {
      setHeartsCount((prev) => prev + 1);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 18px 44px',
        maxWidth: '740px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Закрытая открытка-конверт */
          <motion.div
            key="closed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.04, opacity: 0 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCard}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'rgba(255, 252, 248, 0.98)',
              borderRadius: '24px',
              border: '2px solid rgba(224, 168, 178, 0.65)',
              padding: 'clamp(32px, 6vw, 44px) clamp(20px, 5vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(175, 74, 101, 0.22), 0 4px 14px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              marginTop: '16px',
              position: 'relative',
              userSelect: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Декоративная марка в правом верхнем углу */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                width: '42px',
                height: '48px',
                border: '2px dashed var(--accent-deep)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(253, 244, 231, 0.7)',
                opacity: 0.85,
              }}
            >
              <Heart size={16} fill="var(--accent-crimson)" color="var(--accent-crimson)" />
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent-crimson)', marginTop: '2px' }}>
                16 ЛЕТ
              </span>
            </div>

            {/* Иконка письма с нежным свечением */}
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-crimson)',
                marginBottom: '18px',
                boxShadow: '0 6px 18px rgba(175, 74, 101, 0.18)',
                border: '1.5px solid var(--border-peach)',
              }}
            >
              <Mail size={38} />
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.6rem, 5.2vw, 2.15rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
                marginBottom: '8px',
                lineHeight: 1.25,
              }}
            >
              {letter.cardCoverTitle}
            </h2>

            <p
              style={{
                fontSize: '0.96rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginBottom: '20px',
                maxWidth: '340px',
                lineHeight: 1.45,
              }}
            >
              Личное праздничное послание от Тимура в твой особенный день
            </p>

            {/* Заметная, чёткая кнопка-печать для открытия */}
            <motion.div
              animate={{ scale: [1, 1.035, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
              onClick={handleOpenCard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '13px 26px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #AF4A65 0%, #C76B80 100%)',
                color: '#ffffff',
                fontSize: '1.02rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(175, 74, 101, 0.35)',
                border: '1.5px solid rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                letterSpacing: '0.2px',
              }}
            >
              <Mail size={19} />
              <span>Нажми, чтобы открыть открытку</span>
              <Heart size={16} fill="#ffffff" color="#ffffff" />
            </motion.div>
          </motion.div>
        ) : (
          /* Раскрытое письмо на разлинованной бумаге */
          <motion.article
            key="open"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              width: '100%',
              backgroundColor: '#FBF5EC', /* Тёплый пергамент */
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #EBDCCB 28px)',
              borderRadius: '20px',
              border: '2px solid var(--border-peach)',
              padding: 'clamp(24px, 5vw, 42px) clamp(20px, 4.5vw, 36px)',
              boxShadow: '0 18px 44px rgba(199, 107, 128, 0.22)',
              position: 'relative',
              marginTop: '10px',
            }}
          >
            {/* Заголовок письма */}
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--accent-crimson)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                A Letter From My Heart
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.7rem, 5.2vw, 2.4rem)',
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                  lineHeight: 1.2,
                  marginTop: '4px',
                }}
              >
                {letter.letterTitle}
              </h2>
            </div>

            {/* Текст письма от Тимура */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                fontSize: 'clamp(0.98rem, 3.2vw, 1.12rem)',
                lineHeight: 1.8,
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {letter.paragraphs.map((paragraph, idx) => (
                <p key={idx} style={{ textIndent: '18px' }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Интерактивная плашка: Оставить поцелуйчик на открытке */}
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.88, transition: { type: 'spring', stiffness: 600, damping: 15 } }}
                onClick={() => handleAddStamp('kiss')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border-peach)',
                  color: 'var(--accent-crimson)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  boxShadow: '0 3px 10px rgba(175, 74, 101, 0.12)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span>Целую 💋</span>
                {kissesCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--bg-warm-peach)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                    }}
                  >
                    ×{kissesCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.88, transition: { type: 'spring', stiffness: 600, damping: 15 } }}
                onClick={() => handleAddStamp('heart')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border-peach)',
                  color: 'var(--accent-crimson)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  boxShadow: '0 3px 10px rgba(175, 74, 101, 0.12)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span>Люблю 💖</span>
                {heartsCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--bg-warm-peach)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                    }}
                  >
                    ×{heartsCount}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Штампики поцелуев и настоящего розового сердечка из папки элементы */}
            {stamps.map((stamp) => (
              <motion.div
                key={stamp.id}
                initial={{ scale: 2.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                style={{
                  position: 'absolute',
                  left: `${stamp.x}%`,
                  top: `${stamp.y}%`,
                  transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg)`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  zIndex: 10,
                  filter: 'drop-shadow(0 2px 5px rgba(175, 74, 101, 0.22))',
                }}
              >
                {stamp.type === 'kiss' ? (
                  <span style={{ fontSize: '2.1rem' }}>💋</span>
                ) : (
                  <img
                    src="/assets/decorations/odno rozovoe serdce.png"
                    alt="Сердечко"
                    style={{
                      width: 'clamp(34px, 7.5vw, 46px)',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                )}
              </motion.div>
            ))}

            {/* Подпись, котик и интерактивный Снупи */}
            <div
              style={{
                marginTop: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderTop: '1px dashed var(--border-peach)',
                paddingTop: '22px',
                position: 'relative',
              }}
            >
              {/* Интерактивный котик: мурлычет, мяукает и реагирует на клики */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <motion.div
                  animate={
                    catWobble
                      ? { scale: [1, 1.18, 0.92, 1.08, 1], rotate: [0, -9, 9, -5, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 500, damping: 14 } }}
                  onClick={handleCatClick}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  title="Погладь котика!"
                >
                  <LottieAnimation
                    src="/assets/animations/cat.json"
                    width={76}
                    height={76}
                    fallbackText=""
                  />
                  {/* Облачко с фразой котика при клике */}
                  <AnimatePresence>
                    {catBubble && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: '4px',
                          backgroundColor: 'rgba(255, 252, 248, 0.98)',
                          border: '1.5px solid var(--accent-deep)',
                          borderRadius: '14px',
                          padding: '4px 10px',
                          boxShadow: '0 4px 12px rgba(175, 74, 101, 0.22)',
                          fontFamily: 'var(--font-handwritten)',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--accent-crimson)',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 30,
                        }}
                      >
                        {catBubble}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span
                  style={{
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  Always, forever
                </span>
              </div>

              {/* Интерактивная подпись от руки */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 500, damping: 14 } }}
                onClick={() => {
                  soundManager.playPop();
                  setShowSigBubble(true);
                  setTimeout(() => setShowSigBubble(false), 2200);
                }}
                style={{ textAlign: 'right', marginLeft: 'auto', cursor: 'pointer', position: 'relative' }}
                title="Нажми на подпись!"
              >
                <div
                  style={{
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: 'clamp(1.5rem, 4.8vw, 2rem)',
                    color: 'var(--accent-crimson)',
                    fontWeight: 700,
                  }}
                >
                  {letter.signature}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {letter.footerNote}
                </div>

                {/* Всплывающее признание при клике на подпись */}
                <AnimatePresence>
                  {showSigBubble && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -8 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: '0',
                        marginBottom: '8px',
                        backgroundColor: 'rgba(255, 252, 248, 0.98)',
                        border: '1.5px solid var(--accent-deep)',
                        borderRadius: '16px',
                        padding: '6px 14px',
                        boxShadow: '0 6px 16px rgba(175, 74, 101, 0.25)',
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--accent-crimson)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 30,
                      }}
                    >
                      Люблю тебя больше всего на свете! 💖
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
