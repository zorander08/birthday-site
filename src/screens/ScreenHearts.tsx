import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartFrame } from '../components/HeartFrame';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { InteractiveSnoopy } from '../components/InteractiveSnoopy';
import { ArrowRight, Heart, X } from 'lucide-react';

interface ScreenHeartsProps {
  onNext: () => void;
}

export const ScreenHearts: React.FC<ScreenHeartsProps> = ({ onNext }) => {
  const [showLoveMessage, setShowLoveMessage] = useState(false);

  const handleNextClick = () => {
    soundManager.playClick();
    onNext();
  };

  const handleEggTrigger = () => {
    soundManager.playPop();
    launchRomanticConfetti();
    setShowLoveMessage(true);
    setTimeout(() => {
      setShowLoveMessage(false);
    }, 6000);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 16px 36px',
        maxWidth: '980px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Заголовок с деликатным прозрачным фоном текста (как маркер в Word) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '14px',
          gap: '6px',
          maxWidth: '100%',
        }}
      >
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            soundManager.playSparkle();
            launchRomanticConfetti();
          }}
          title="Нажми для праздничного салюта! 💖"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 252, 248, 0.85)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid var(--border-peach)',
            fontSize: '0.82rem',
            color: 'var(--accent-crimson)',
            fontWeight: 700,
            marginBottom: '4px',
            boxShadow: '0 2px 8px rgba(175, 74, 101, 0.1)',
            cursor: 'pointer',
          }}
        >
          <Heart size={13} fill="var(--accent-crimson)" color="var(--accent-crimson)" />
          <span>С Днём Рождения, Амелия!</span>
          <Heart size={13} fill="var(--accent-crimson)" color="var(--accent-crimson)" />
        </motion.button>

        <h1
          style={{
            margin: 0,
            lineHeight: 1.25,
            textAlign: 'center',
          }}
        >
          <span
            className="glass-text-highlight"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.4rem, 4.2vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--text-dark)',
              letterSpacing: '0.3px',
            }}
          >
            Для самого особенного человека
          </span>
        </h1>

        <p
          style={{
            margin: 0,
            lineHeight: 1.25,
            textAlign: 'center',
          }}
        >
          <span
            className="glass-text-highlight-subtle"
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: 'clamp(1.05rem, 3.2vw, 1.32rem)',
              color: 'var(--text-muted)',
            }}
          >
            Нажимай на сердечки, чтобы листать наши фото
          </span>
        </p>
      </div>

      {/* Композиция из трех БОЛЬШИХ сердечек */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          margin: '4px 0 20px',
        }}
      >
        {/* Верхний ряд: сердечко Амелии (розовая рамка) и Тимура (синяя рамка) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(8px, 4vw, 40px)',
            width: '100%',
          }}
        >
          <HeartFrame
            id="amelia"
            photos={SITE_CONFIG.heartPhotos.amelia}
            label={SITE_CONFIG.girlName}
            size="side"
            onEggClick={handleEggTrigger}
          />
          <HeartFrame
            id="timur"
            photos={SITE_CONFIG.heartPhotos.timur}
            label={SITE_CONFIG.boyName}
            size="side"
            onEggClick={handleEggTrigger}
          />
        </div>

        {/* Главное центральное БОЛЬШОЕ сердечко: Мы вместе (двойная рамка с пасхалкой на 10 кликов) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '-6px',
          }}
        >
          <HeartFrame
            id="together"
            photos={SITE_CONFIG.heartPhotos.together}
            label={SITE_CONFIG.togetherLabel}
            size="main"
            onEggClick={handleEggTrigger}
          />
        </div>
      </div>

      {/* Кнопка перехода к терминалу и интерактивный сидящий Снупи */}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '4px',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleNextClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 34px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F5D6C3 0%, #E8A8B4 50%, #C76B80 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 'clamp(1.02rem, 3.2vw, 1.18rem)',
            letterSpacing: '0.4px',
            boxShadow: '0 8px 24px rgba(199, 107, 128, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
          }}
        >
          <span>Открыть мой подарок</span>
          <ArrowRight size={18} />
        </motion.button>

        {/* Интерактивный сидящий Снупи */}
        <div
          style={{
            position: 'absolute',
            right: '-58px',
            bottom: '-4px',
            width: 'clamp(46px, 10vw, 56px)',
            height: 'auto',
          }}
        >
          <InteractiveSnoopy
            src="/assets/decorations/snoopy sitting.png"
            alt="Снупи"
            quotes={[
              'сижу и любуюсь бусей',
              'нормалды',
              'ты как бусюн',
              'булка самая красивая',
              'кисс',
            ]}
            bubblePosition="top"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(74, 43, 51, 0.16))',
            }}
          />
        </div>
      </div>

      {/* Нежная романтическая плашка 10-го клика: «Я тебя очень сильно люблю и ценю» */}
      <AnimatePresence>
        {showLoveMessage && (
          <div
            style={{
              position: 'fixed',
              top: '24%',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 16px',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              onClick={() => setShowLoveMessage(false)}
              style={{
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '2px solid var(--accent-deep)',
                borderRadius: '22px',
                padding: '14px 22px',
                boxShadow: '0 18px 45px rgba(175, 74, 101, 0.38)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textAlign: 'center',
                userSelect: 'none',
                maxWidth: '92vw',
                pointerEvents: 'auto',
              }}
            >
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💖</span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.05rem, 4.2vw, 1.45rem)',
                  fontWeight: 700,
                  color: 'var(--accent-crimson)',
                  letterSpacing: '0.3px',
                  lineHeight: 1.3,
                }}
              >
                Люблю тебя очень сильно бусь!
              </span>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💖</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
