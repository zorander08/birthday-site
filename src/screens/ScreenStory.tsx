import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import { Play, Pause, ChevronLeft, ChevronRight, X, Film, ArrowLeft, Heart, Volume2, VolumeX } from 'lucide-react';

interface ScreenStoryProps {
  onBack: () => void;
}

type TransitionType = 'zoom-in' | 'zoom-out' | 'slide-left' | 'slide-right' | 'blur-dissolve' | 'rotate-pan' | 'float-up';

const TRANSITIONS: TransitionType[] = [
  'zoom-in',
  'zoom-out',
  'slide-left',
  'slide-right',
  'blur-dissolve',
  'rotate-pan',
  'float-up',
];

const TRANSITION_VARIANTS = {
  'zoom-in': {
    initial: { opacity: 0, scale: 1.25 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  'zoom-out': {
    initial: { opacity: 0, scale: 0.88 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.16 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 90, scale: 1.02 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -90, scale: 0.98 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -90, scale: 1.02 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 90, scale: 0.98 },
  },
  'blur-dissolve': {
    initial: { opacity: 0, filter: 'blur(16px)', scale: 1.08 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(12px)', scale: 0.96 },
  },
  'rotate-pan': {
    initial: { opacity: 0, rotate: -3.5, scale: 1.1 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 3, scale: 0.95 },
  },
  'float-up': {
    initial: { opacity: 0, y: 55, scale: 1.04 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -45, scale: 0.96 },
  },
};

export const ScreenStory: React.FC<ScreenStoryProps> = ({ onBack }) => {
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTransition, setCurrentTransition] = useState<TransitionType>('zoom-in');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'together' | 'amelia' | 'timur'>('all');
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const slides = SITE_CONFIG.storySlides;
  const allGallery = SITE_CONFIG.galleryPhotos;

  const filteredGallery =
    activeFilter === 'all'
      ? allGallery
      : allGallery.filter((item) => item.category === activeFilter);

  const pickRandomTransition = () => {
    const nextTransitions = TRANSITIONS.filter((t) => t !== currentTransition);
    const chosen = nextTransitions[Math.floor(Math.random() * nextTransitions.length)];
    setCurrentTransition(chosen);
  };

  // Управление музыкой видео-истории через централизованный soundManager:
  // При запуске видео-эдита та же самая фоновая песня плавно прибавляет громкость
  // При закрытии возвращается к тихому ненавязчивому фону
  React.useEffect(() => {
    if (isVideoMode) {
      if (isMusicMuted) {
        soundManager.pauseBackgroundMusic();
      } else {
        soundManager.setVideoModeAudio(true, isPlaying);
      }
    } else {
      soundManager.setVideoModeAudio(false, true);
    }

    return () => {
      soundManager.setVideoModeAudio(false, true);
    };
  }, [isVideoMode, isPlaying, isMusicMuted]);

  // Слайд-шоу таймер с рандомными переходами
  useEffect(() => {
    if (!isVideoMode || !isPlaying) return;

    const timer = setInterval(() => {
      pickRandomTransition();
      setActiveSlideIdx((prev) => (prev + 1) % slides.length);
    }, SITE_CONFIG.slideDurationMs);

    return () => clearInterval(timer);
  }, [isVideoMode, isPlaying, slides.length, currentTransition]);

  const handleStartStory = () => {
    soundManager.playSuccess();
    pickRandomTransition();
    setActiveSlideIdx(0);
    setIsPlaying(true);
    setIsVideoMode(true);
  };

  const handleNextSlide = () => {
    soundManager.playClick();
    pickRandomTransition();
    setActiveSlideIdx((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    soundManager.playClick();
    pickRandomTransition();
    setActiveSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCloseVideoMode = () => {
    soundManager.playClick();
    setIsVideoMode(false);
  };

  const activeVariant = TRANSITION_VARIANTS[currentTransition] || TRANSITION_VARIANTS['zoom-in'];

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
        padding: '12px 16px 48px',
        maxWidth: '960px',
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
              letterSpacing: '0.2px',
            }}
          >
            Наша история в фотографиях
          </span>
        </h1>
        {/* Разрешенный эмодзи 💕 */}
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
            Все 39 снимков из наших воспоминаний 💕
          </span>
        </p>
      </div>

      {/* Заметный интерактивный баннер запуска видео-истории с большой кнопкой Play */}
      <motion.button
        type="button"
        className="story-hero-banner"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStartStory}
        style={{
          width: '100%',
          maxWidth: '580px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 252, 248, 0.98) 0%, rgba(253, 237, 241, 0.98) 100%)',
          border: '2px solid rgba(224, 168, 178, 0.75)',
          boxShadow: '0 12px 30px rgba(175, 74, 101, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: '26px',
          userSelect: 'none',
          textAlign: 'inherit',
          font: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          {/* Пульсирующая круглая кнопка Play */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #AF4A65 0%, #E65D7B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(175, 74, 101, 0.38)',
              flexShrink: 0,
            }}
          >
            <Play size={22} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
          </motion.div>

          <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(175, 74, 101, 0.1)',
                color: 'var(--accent-crimson)',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '3px',
              }}
            >
              <Film size={12} />
              <span>Видео-история</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.05rem, 3.2vw, 1.24rem)',
                fontWeight: 700,
                color: 'var(--text-dark)',
                lineHeight: 1.25,
              }}
            >
              Смотреть нашу историю 🎬
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              15 главных моментов под нашу музыку
            </div>
          </div>
        </div>

        {/* Кнопка запуска справа (скрывается на узких экранах, освобождая место для текста) */}
        <div
          className="story-hero-action-btn"
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #AF4A65 0%, #C76B80 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(175, 74, 101, 0.28)',
            flexShrink: 0,
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
          }}
        >
          <span>Включить</span>
          <Play size={13} fill="#ffffff" color="#ffffff" />
        </div>
      </motion.button>

      {/* Вкладки фильтра (Все 39, Мы вместе 13, Амелия 15, Тимур 11) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        {[
          { key: 'all', label: `Все фото (${allGallery.length})` },
          { key: 'together', label: `Мы вместе (13)` },
          { key: 'amelia', label: `Амелия (15)` },
          { key: 'timur', label: `Тимур (11)` },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                soundManager.playClick();
                setActiveFilter(tab.key as typeof activeFilter);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '12px', /* Квадратная форма со скруглением */
                backgroundColor: isActive ? 'var(--accent-deep)' : 'rgba(255, 252, 248, 0.92)',
                color: isActive ? '#ffffff' : 'var(--text-dark)',
                border: '1.5px solid var(--border-peach)',
                fontSize: '0.88rem',
                fontWeight: 700,
                boxShadow: isActive
                  ? '0 3px 10px rgba(199, 107, 128, 0.35)'
                  : '0 2px 6px rgba(74, 43, 51, 0.05)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Скрапбук-сетка из ВСЕХ 39 полароидных карточек */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '20px',
          width: '100%',
        }}
      >
        {filteredGallery.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.02, 0.25) }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              soundManager.playPop();
              setSelectedPhoto(item.url);
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px', /* Квадратный полароид со скруглением */
              padding: '12px 12px 16px',
              boxShadow: '0 6px 18px rgba(175, 74, 101, 0.15)',
              border: '1px solid var(--border-peach)',
              transform: `rotate(${item.rotation}deg)`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              contentVisibility: 'auto',
              containIntrinsicSize: '210px 280px',
            }}
          >
            {/* Декоративная мини-метка */}
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                right: '12px',
                width: '22px',
                height: '22px',
                backgroundColor: 'var(--bg-warm-peach)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-peach)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              }}
            >
              <Heart size={12} fill="var(--accent-crimson)" color="var(--accent-crimson)" />
            </div>

            {/* Фото */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                marginBottom: '10px',
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 42%',
                  display: 'block',
                }}
              />
            </div>

            {/* Подпись без эмодзи */}
            <p
              style={{
                fontFamily: 'var(--font-handwritten)',
                fontSize: '1.2rem',
                color: 'var(--text-dark)',
                textAlign: 'center',
                lineHeight: 1.25,
                fontWeight: 700,
              }}
            >
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Портал модальных окон в document.body, чтобы гарантированно перекрывать шапку и фон */}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            <AnimatePresence>
              {selectedPhoto && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPhoto(null)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(50, 25, 35, 0.88)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.88 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.88 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '92vw',
                maxHeight: '85vh',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <img
                src={selectedPhoto}
                alt="Просмотр фото"
                style={{
                  maxWidth: '100%',
                  maxHeight: '82vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Полноэкранный Видео-Эдит режим с рандомными переходами и музыкой */}
      <AnimatePresence>
        {isVideoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#1E1418',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseVideoMode}
              style={{
                position: 'absolute',
                top: 'max(16px, env(safe-area-inset-top))',
                right: '18px',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 120,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            {/* Кнопка переключения звука музыки эдита */}
            <button
              onClick={() => setIsMusicMuted((prev) => !prev)}
              style={{
                position: 'absolute',
                top: 'max(16px, env(safe-area-inset-top))',
                left: '20px',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 120,
                border: 'none',
                cursor: 'pointer',
              }}
              title={isMusicMuted ? 'Включить музыку' : 'Выключить музыку'}
            >
              {isMusicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Прогресс-бар сверху */}
            <div
              style={{
                position: 'absolute',
                top: 'max(24px, env(safe-area-inset-top))',
                left: '74px',
                right: '74px',
                display: 'flex',
                gap: '4px',
                zIndex: 120,
              }}
            >
              {slides.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: i === activeSlideIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Контейнер кадра с динамическими рандомными анимациями переходов */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '9 / 14',
                maxHeight: 'min(72vh, calc(100dvh - 165px))',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeSlideIdx}-${currentTransition}`}
                  initial={activeVariant.initial}
                  animate={activeVariant.animate}
                  exit={activeVariant.exit}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <img
                    src={slides[activeSlideIdx].photoUrl}
                    alt={slides[activeSlideIdx].caption}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(18, 6, 12, 0.88) 100%)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Текст поверх кадра без длинных тире с мягким переносом */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '16px',
                  right: '16px',
                  zIndex: 10,
                  textAlign: 'center',
                }}
              >
                <motion.h3
                  key={`cap-${activeSlideIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.15rem, 4.2vw, 1.65rem)',
                    color: '#ffffff',
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                    marginBottom: '4px',
                    lineHeight: 1.25,
                    textWrap: 'balance',
                    padding: '0 8px',
                  }}
                >
                  {slides[activeSlideIdx].caption}
                </motion.h3>
                {slides[activeSlideIdx].subcaption && (
                  <motion.p
                    key={`sub-${activeSlideIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    style={{
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: 'clamp(0.95rem, 3.2vw, 1.25rem)',
                      color: 'var(--accent-soft)',
                      textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                      lineHeight: 1.25,
                      textWrap: 'balance',
                      padding: '0 8px',
                    }}
                  >
                    {slides[activeSlideIdx].subcaption}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Элементы управления видео-эдитом */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginTop: '18px',
                zIndex: 120,
              }}
            >
              <button
                onClick={handlePrevSlide}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPlaying(!isPlaying);
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--accent-crimson)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(175, 74, 101, 0.5)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
              </button>

              <button
                onClick={handleNextSlide}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )}
    </motion.main>
  );
};
