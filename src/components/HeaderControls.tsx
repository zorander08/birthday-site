import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowLeft, Calendar, Maximize, Minimize } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderControlsProps {
  currentScreen: 'hearts' | 'terminal' | 'gifts' | 'music' | 'letter' | 'story';
  onNavigate: (screen: 'hearts' | 'terminal' | 'gifts' | 'music' | 'letter' | 'story') => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({ currentScreen, onNavigate }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showCountdownTip, setShowCountdownTip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsHint, setShowFsHint] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('amelia_fs_hint_dismissed');
  });

  const dismissFsHint = () => {
    setShowFsHint(false);
    try {
      localStorage.setItem('amelia_fs_hint_dismissed', 'true');
    } catch {}
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(isFs);
      if (isFs) {
        dismissFsHint();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    soundManager.playClick();
    dismissFsHint();
    try {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => void;
      };
      const docEl = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => void;
      };

      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
          setIsFullscreen(true);
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
          setIsFullscreen(true);
        } else {
          setIsFullscreen((prev) => !prev);
        }
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playClick();
    }
  };

  // Вычисление текущей даты, возраста Амелии и отсчёта до 16-летия (29 октября 2010 г.р.)
  const getCalendarInfo = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth(); // 0 = Jan, 9 = Oct
    const year = now.getFullYear();

    const monthsRu = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const todayStr = `${day} ${monthsRu[month]}`;

    // До 29 октября — 15 лет, начиная с 29 октября — 16 лет
    let age = year - 2010;
    if (month < 9 || (month === 9 && day < 29)) {
      age -= 1;
    }

    // Дней до дня рождения в этом году (29 октября)
    const bdayThisYear = new Date(year, 9, 29);
    // Сбрасываем время для чистого сравнения дней
    const todayMidnight = new Date(year, month, day);
    const diffDays = Math.round((bdayThisYear.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    let countdownText = '';
    if (diffDays > 0) {
      const dayWord = diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней';
      countdownText = `До 16-летия осталось ${diffDays} ${dayWord}! 🎂 (29 октября)`;
    } else if (diffDays === 0) {
      countdownText = `Сегодня день рождения! Амелии 16 лет! 💖👑`;
    } else {
      countdownText = `Амелии уже 16 лет! Самая любимая 💖`;
    }

    return {
      todayStr,
      age,
      isBirthdayToday: diffDays === 0,
      countdownText,
    };
  };

  const calInfo = getCalendarInfo();

  const handleCalendarClick = () => {
    soundManager.playSparkle();
    launchRomanticConfetti();
    setShowCountdownTip(true);
    setTimeout(() => {
      setShowCountdownTip(false);
    }, 3200);
  };

  const showBackButton = currentScreen === 'music' || currentScreen === 'letter' || currentScreen === 'story';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        background: 'linear-gradient(180deg, rgba(247,231,220,0.88) 0%, rgba(247,231,220,0) 100%)',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        {showBackButton ? (
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('gifts');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 15px',
              borderRadius: '12px', /* Квадратная со скруглением */
              backgroundColor: 'rgba(255, 252, 248, 0.95)',
              border: '1px solid var(--border-peach)',
              color: 'var(--text-dark)',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(175, 74, 101, 0.12)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>К подаркам</span>
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleCalendarClick}
            title="Нажми, чтобы увидеть отсчёт до дня рождения!"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 252, 248, 0.92)',
              border: '1px solid var(--border-peach)',
              fontSize: '0.84rem',
              color: 'var(--accent-crimson)',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(175, 74, 101, 0.1)',
              cursor: 'pointer',
            }}
          >
            <Calendar size={15} color="var(--accent-crimson)" />
            <span>{`${calInfo.todayStr} • ${calInfo.age} лет`}</span>
          </motion.button>
        )}

        {/* Всплывающая подсказка с обратным отсчётом */}
        <AnimatePresence>
          {showCountdownTip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '110%',
                left: '0',
                backgroundColor: 'rgba(255, 252, 248, 0.98)',
                border: '1.5px solid var(--accent-deep)',
                borderRadius: '12px',
                padding: '6px 14px',
                boxShadow: '0 8px 22px rgba(175, 74, 101, 0.25)',
                fontFamily: 'var(--font-handwritten)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent-crimson)',
                whiteSpace: 'nowrap',
                zIndex: 60,
                pointerEvents: 'none',
              }}
            >
              {calInfo.countdownText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Обертка кнопки полноэкранного режима с подсказкой-указателем */}
        <div style={{ position: 'relative' }}>
          <motion.button
            animate={
              showFsHint && !isFullscreen
                ? {
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      '0 2px 8px rgba(175, 74, 101, 0.14)',
                      '0 0 0 4px rgba(228, 184, 166, 0.5), 0 4px 16px rgba(175, 74, 101, 0.35)',
                      '0 2px 8px rgba(175, 74, 101, 0.14)',
                    ],
                  }
                : { scale: 1 }
            }
            transition={
              showFsHint && !isFullscreen
                ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
            aria-label="Полноэкранный режим"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 252, 248, 0.98)',
              border: showFsHint && !isFullscreen ? '1.5px solid var(--accent-deep)' : '1px solid var(--border-peach)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFullscreen || (showFsHint && !isFullscreen) ? 'var(--accent-crimson)' : 'var(--text-muted)',
              boxShadow: '0 2px 8px rgba(175, 74, 101, 0.14)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}

            {/* Маленький мерцающий огонёк на кнопке пока не включен полный экран */}
            {showFsHint && !isFullscreen && (
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-crimson)',
                  border: '2px solid #FFFDF9',
                  boxShadow: '0 0 6px rgba(175, 74, 101, 0.8)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.button>

          {/* Всплывающая плашка-указатель со стрелочкой на кнопку */}
          <AnimatePresence>
            {showFsHint && !isFullscreen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={handleToggleFullscreen}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 14px)',
                  right: '-24px',
                  zIndex: 70,
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 8px 24px rgba(175, 74, 101, 0.22))',
                  pointerEvents: 'auto',
                }}
              >
                {/* Анимированная стрелочка-указатель ▲, направленная на кнопку */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    right: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    style={{
                      color: 'var(--accent-crimson)',
                      fontSize: '18px',
                      fontWeight: 900,
                      lineHeight: 1,
                      textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    ▲
                  </motion.div>
                </div>

                {/* Карточка подсказки */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    backgroundColor: 'rgba(255, 252, 248, 0.98)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid var(--accent-deep)',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    minWidth: '210px',
                    maxWidth: '240px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: 'var(--accent-crimson)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      lineHeight: 1.25,
                      marginBottom: '3px',
                    }}
                  >
                    <span>Включи полный экран</span>
                    <Maximize size={14} strokeWidth={2.5} />
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '1.14rem',
                      fontWeight: 700,
                      color: 'var(--text-dark)',
                      lineHeight: 1.15,
                    }}
                  >
                    для лучшего эффекта 💖
                  </div>

                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      opacity: 0.85,
                    }}
                  >
                    нажми сюда или на кнопку ↗
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Переключатель звука: квадратный со скруглёнными углами */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
          aria-label="Переключить звук"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px', /* Квадратная кнопка со скруглением */
            backgroundColor: 'rgba(255, 252, 248, 0.95)',
            border: '1px solid var(--border-peach)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMuted ? 'var(--text-muted)' : 'var(--accent-crimson)',
            boxShadow: '0 2px 8px rgba(175, 74, 101, 0.14)',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
      </div>
    </header>
  );
};
