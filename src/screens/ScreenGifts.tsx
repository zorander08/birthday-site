import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LottieRefCurrentProps } from 'lottie-react';
import { LottieAnimation } from '../components/LottieAnimation';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { InteractiveSnoopy } from '../components/InteractiveSnoopy';
import { Music, Mail, Image as ImageIcon, ArrowRight, ArrowLeft, RotateCcw, Heart } from 'lucide-react';

interface ScreenGiftsProps {
  isGiftOpened: boolean;
  setIsGiftOpened: (opened: boolean) => void;
  revealedGifts: string[];
  onRevealGift: (gift: string) => void;
  onResetRevealedGifts?: () => void;
  onOpenGift: (gift: 'music' | 'letter' | 'story') => void;
  onBackToHearts: () => void;
}

export const ScreenGifts: React.FC<ScreenGiftsProps> = ({
  isGiftOpened,
  setIsGiftOpened,
  revealedGifts,
  onRevealGift,
  onResetRevealedGifts,
  onOpenGift,
  onBackToHearts,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const giftLottieRef = useRef<LottieRefCurrentProps | null>(null);

  const handleOpenGiftBox = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    soundManager.playSuccess();
    launchRomanticConfetti();

    if (giftLottieRef.current) {
      giftLottieRef.current.goToAndPlay(0);
    }

    // Через 750 мс плавно показываем карточки с сюрпризами
    setTimeout(() => {
      setIsGiftOpened(true);
      setIsAnimating(false);
    }, 750);
  };

  const handleRewindGiftBox = () => {
    soundManager.playClick();
    setIsGiftOpened(false);
    setIsAnimating(false);
    if (onResetRevealedGifts) {
      onResetRevealedGifts();
    }
    if (giftLottieRef.current) {
      giftLottieRef.current.goToAndStop(0);
    }
  };

  const handleSelectGift = (gift: 'music' | 'letter' | 'story') => {
    soundManager.playClick();
    onOpenGift(gift);
  };

  const handleCardClick = (gift: 'music' | 'letter' | 'story') => {
    if (!revealedGifts.includes(gift)) {
      soundManager.playSparkle();
      launchRomanticConfetti();
      onRevealGift(gift);
    } else {
      handleSelectGift(gift);
    }
  };

  const gifts = [
    {
      id: 'music' as const,
      title: 'Наши песни',
      subtitle: 'Винил и плейлист',
      icon: Music,
      iconColor: '#D07B88',
      desc: 'Музыка, которая напоминает мне о нас',
      btnText: 'Слушать наши песни',
    },
    {
      id: 'letter' as const,
      title: 'Для тебя',
      subtitle: 'Письмо-открытка',
      icon: Mail,
      iconColor: '#AF4A65',
      desc: 'Искренние слова и признание от всего сердца',
      btnText: 'Прочитать открытку',
    },
    {
      id: 'story' as const,
      title: 'Наша история',
      subtitle: 'Коллаж и эдит',
      icon: ImageIcon,
      iconColor: '#E5AC67',
      desc: 'Все наши 39 тёплых воспоминаний в фото и видео',
      btnText: 'Воспоминания',
    },
  ];

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.45 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 16px 100px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Верхняя навигация: возврат к главным сердечкам */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToHearts();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px', /* Квадратная форма со скруглением */
            backgroundColor: 'rgba(255, 255, 255, 0.28)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            color: 'var(--text-dark)',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(74, 43, 51, 0.08)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Назад к сердечкам</span>
        </button>

        {isGiftOpened && (
          <button
            onClick={handleRewindGiftBox}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              color: 'var(--accent-crimson)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            <span>Упаковать обратно</span>
          </button>
        )}
      </div>

      {/* Заголовок с деликатным прозрачным фоном текста (как маркер в Word) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '16px',
          gap: '6px',
          maxWidth: '100%',
        }}
      >
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
              fontSize: 'clamp(1.45rem, 4.4vw, 2.3rem)',
              fontWeight: 700,
              color: 'var(--text-dark)',
              letterSpacing: '0.3px',
            }}
          >
            Твои праздничные сюрпризы 🎁
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
              fontSize: 'clamp(1.05rem, 3.2vw, 1.35rem)',
              color: 'var(--text-muted)',
            }}
          >
            {isGiftOpened
              ? 'Нажимай на карточки, чтобы раскрыть секреты и открыть сюрпризы'
              : 'Нажми на коробочку с подарком, чтобы распаковать сюрпризы'}
          </span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isGiftOpened ? (
          /* ЭТАП 1: Закрытый интерактивный подарок с Lottie Groovy gift */
          <motion.div
            key="closed-gift-box"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.08, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '10px',
              width: '100%',
              maxWidth: '520px',
              position: 'relative',
            }}
          >
            {/* Кашляющий Снупи (интерактивный, трясётся при нажатии и делает "кхе-кхе!") */}
            <div
              style={{
                position: 'absolute',
                top: '-32px',
                right: '-16px',
                width: 'clamp(70px, 16vw, 95px)',
                height: 'auto',
                zIndex: 15,
              }}
            >
              <InteractiveSnoopy
                src="/assets/decorations/snoopy caughing.png"
                alt="Кашляющий Снупи"
                quotes={[
                  '*кхе-кхе*',
                  'нормалды',
                  'буся лучшая',
                  'блядб подарки',
                  'кисс',
                  'бонус',
                ]}
                bubblePosition="top"
                style={{
                  filter: 'drop-shadow(0 6px 12px rgba(74, 43, 51, 0.18))',
                }}
              />
            </div>

            <motion.div
              id="gift-box-main"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              onClick={handleOpenGiftBox}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.45)',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(74, 43, 51, 0.08)',
                cursor: 'pointer',
                position: 'relative',
                width: '100%',
                userSelect: 'none',
              }}
            >
              {/* Анимация подарка Lottie (Groovy gift.json) */}
              <div
                style={{
                  width: 'clamp(200px, 45vw, 260px)',
                  height: 'clamp(200px, 45vw, 260px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <LottieAnimation
                  src="/assets/animations/gift.json"
                  lottieRef={giftLottieRef}
                  loop={false}
                  autoplay={false}
                  width="100%"
                  height="100%"
                  fallbackText="🎁"
                />
              </div>

              {/* Кнопка-призыв к действию */}
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{
                  marginTop: '12px',
                  padding: '14px 34px',
                  borderRadius: '14px', /* Квадратная форма со скруглением */
                  background: 'linear-gradient(135deg, #F5D6C3 0%, #E8A8B4 50%, #C76B80 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 3.4vw, 1.2rem)',
                  boxShadow: '0 8px 24px rgba(199, 107, 128, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Heart size={16} fill="#ffffff" color="#ffffff" />
                <span>Нажми на подарок, чтобы открыть</span>
                <Heart size={16} fill="#ffffff" color="#ffffff" />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          /* ЭТАП 2: Раскрытая плашка за подарком с 3 сюрпризами БЕЗ "Подарок номер..." */
          <motion.div
            key="opened-surprises"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 3 интерактивные карточки сюрпризов */}
            <div
              className="gifts-cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {gifts.map((item, idx) => {
                const IconComp = item.icon;
                const isRevealed = revealedGifts.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.12, duration: 0.4 }}
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.94, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                    onClick={() => handleCardClick(item.id)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: '18px', /* Квадратная форма со скруглением */
                      border: isRevealed
                        ? '1.5px solid rgba(255, 255, 255, 0.55)'
                        : '1.5px dashed rgba(228, 184, 166, 0.85)',
                      padding: '24px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxShadow: '0 8px 32px rgba(74, 43, 51, 0.08)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      userSelect: 'none',
                      touchAction: 'pan-y',
                    }}
                  >
                    {/* Контент карточки (размывается пока не открыта: видно силуэт, но непонятно что внутри) */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        filter: isRevealed ? 'none' : 'blur(7.5px)',
                        WebkitFilter: isRevealed ? 'none' : 'blur(7.5px)',
                        opacity: isRevealed ? 1 : 0.88,
                        transition: 'filter 0.4s ease, -webkit-filter 0.4s ease, opacity 0.4s ease',
                        pointerEvents: isRevealed ? 'auto' : 'none',
                      }}
                    >
                      {/* Иконка подарка */}
                      <div
                        style={{
                          width: '88px',
                          height: '88px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.35)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '14px',
                          boxShadow: '0 4px 14px rgba(175, 74, 101, 0.1)',
                        }}
                      >
                        <IconComp size={42} color={item.iconColor} strokeWidth={1.8} />
                      </div>

                      {/* Заголовки */}
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.55rem',
                          fontWeight: 700,
                          color: 'var(--text-dark)',
                          marginBottom: '2px',
                        }}
                      >
                        {item.title}
                      </h3>

                      <span
                        style={{
                          fontFamily: 'var(--font-handwritten)',
                          fontSize: '1.25rem',
                          color: 'var(--accent-crimson)',
                          fontWeight: 700,
                          marginBottom: '8px',
                        }}
                      >
                        {item.subtitle}
                      </span>

                      <p
                        style={{
                          fontSize: '0.86rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          minHeight: '38px',
                        }}
                      >
                        {item.desc}
                      </p>

                      {/* Кнопка действия */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isRevealed) {
                            handleSelectGift(item.id);
                          } else {
                            handleCardClick(item.id);
                          }
                        }}
                        style={{
                          marginTop: '16px',
                          padding: '10px 22px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.35)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          color: 'var(--accent-crimson)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          boxShadow: '0 2px 8px rgba(175, 74, 101, 0.08)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{item.btnText}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>

                    {/* Накладная полупрозрачная плашка для закрытой неразгаданной карточки */}
                    {!isRevealed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          backdropFilter: 'blur(3px)',
                          WebkitBackdropFilter: 'blur(3px)',
                          borderRadius: '18px',
                          zIndex: 10,
                          padding: '16px',
                          cursor: 'pointer',
                        }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.45)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.65)',
                            color: 'var(--accent-crimson)',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            boxShadow: '0 4px 16px rgba(175, 74, 101, 0.16)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Heart size={15} fill="var(--accent-crimson)" />
                          <span>Нажми, чтобы раскрыть</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
