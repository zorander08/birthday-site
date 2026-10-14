import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/audio';
import { HeartPhotoConfig } from '../content';

interface HeartFrameProps {
  id: string; // 'amelia' | 'timur' | 'together'
  photos: HeartPhotoConfig[];
  label: string;
  size?: 'main' | 'side';
  subtitle?: string;
  onEggClick?: (count: number) => void;
}

export const HeartFrame: React.FC<HeartFrameProps> = ({
  id,
  photos,
  label,
  size = 'side',
  subtitle,
  onEggClick,
}) => {
  const isMain = size === 'main';

  // Для одиночных сердечек
  const [currentIndex, setCurrentIndex] = useState(0);

  // Для двойного сердечка: раздельные случайные индексы для двух половинок
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(Math.min(1, photos.length - 1));

  const clickCountRef = useRef(0);
  const [pulse, setPulse] = useState(false);
  const [clickHearts, setClickHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Предзагрузка всех фото для моментального переключения
  useEffect(() => {
    photos.forEach((p) => {
      const img = new Image();
      img.src = p.url;
    });
  }, [photos]);

  const addClickHeart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickHearts((prev) => [
      ...prev.slice(-6),
      { id: Date.now() + Math.random(), x, y },
    ]);
  };

  // Клик по одиночному сердечку: последовательное листание
  const handleSingleClick = (e: React.MouseEvent) => {
    soundManager.playPop();
    setPulse(true);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setTimeout(() => setPulse(false), 280);

    clickCountRef.current += 1;
    if (onEggClick && (clickCountRef.current % 10 === 0 || clickCountRef.current === 13)) {
      onEggClick(clickCountRef.current);
    }
    addClickHeart(e);
  };

  // Клик по двойному сердечку: ОБЕ фотки меняются ОДНОВРЕМЕННО на РЕАЛЬНЫЙ РАНДОМ без повторов подряд
  const handleTogetherClick = (e: React.MouseEvent) => {
    soundManager.playPop();
    setPulse(true);
    setTimeout(() => setPulse(false), 280);

    const count = photos.length;
    if (count > 1) {
      // Исключаем текущие фотографии из выбора, чтобы новая пара была гарантированно другой и не повторялась подряд
      const poolLeft = Array.from({ length: count }, (_, i) => i).filter(
        (i) => i !== leftIndex && i !== rightIndex
      );
      const chosenLeft =
        poolLeft.length > 0
          ? poolLeft[Math.floor(Math.random() * poolLeft.length)]
          : (leftIndex + 1) % count;

      const poolRight = Array.from({ length: count }, (_, i) => i).filter(
        (i) => i !== chosenLeft && i !== rightIndex && i !== leftIndex
      );
      const chosenRight =
        poolRight.length > 0
          ? poolRight[Math.floor(Math.random() * poolRight.length)]
          : Array.from({ length: count }, (_, i) => i).filter((i) => i !== chosenLeft)[0] ?? 0;

      setLeftIndex(chosenLeft);
      setRightIndex(chosenRight);
    }

    clickCountRef.current += 1;
    if (onEggClick && (clickCountRef.current % 10 === 0 || clickCountRef.current === 13)) {
      onEggClick(clickCountRef.current);
    }
    addClickHeart(e);
  };

  // Выбираем соответствующую рамку
  let frameSrc = '/assets/decorations/frame-heart-together.png';
  if (id === 'amelia') {
    frameSrc = '/assets/decorations/frame-heart-pink.png';
  } else if (id === 'timur') {
    frameSrc = '/assets/decorations/frame-heart-blue.png';
  }

  // Размеры с сохранением пропорций рамки 1.2:1 (547 x 456)
  const widthSize = isMain
    ? 'clamp(285px, 86vw, 430px)'
    : 'clamp(165px, 46vw, 260px)';

  const currentPhoto = photos[currentIndex];
  const leftPhoto = photos[leftIndex];
  const rightPhoto = photos[rightIndex];
  const objectPos = currentPhoto?.position || (isMain ? 'center 40%' : 'center 42%');

  // Масштаб фото внутри рамок (возвращен к исходному значению 0.88)
  const photoScale = currentPhoto?.scale || 0.88;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '4px 6px',
        userSelect: 'none',
      }}
    >
      <motion.div
        animate={pulse ? { scale: [1, 1.07, 0.95, 1.02, 1] } : { scale: 1 }}
        whileTap={{ scale: 0.91 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 500, damping: 16 }}
        onClick={isMain ? handleTogetherClick : handleSingleClick}
        style={{
          position: 'relative',
          width: widthSize,
          aspectRatio: '1.2 / 1', // Точная пропорция PNG рамок
          cursor: 'pointer',
          willChange: 'transform',
        }}
      >
        {/* SVG clipPath для одиночных сердечек и МАТЕМАТИЧЕСКИ ТОЧНЫЙ контур для двойного сердечка */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            {/* Контур одиночных сердечек */}
            <clipPath id={`heart-clip-${id}`} clipPathUnits="objectBoundingBox">
              <path d="M 0.5, 0.95 C 0.5, 0.95, 0.04, 0.65, 0.04, 0.32 C 0.04, 0.12, 0.18, 0.02, 0.34, 0.02 C 0.44, 0.02, 0.50, 0.14, 0.50, 0.14 C 0.50, 0.14, 0.56, 0.02, 0.66, 0.02 C 0.82, 0.02, 0.96, 0.12, 0.96, 0.32 C 0.96, 0.65, 0.5, 0.95, 0.5, 0.95 Z" />
            </clipPath>

            {/* Точный внутренний контур прозрачной области двойного сердечка (ноль выпирания пикселей) */}
            <clipPath id="together-heart-clip" clipPathUnits="objectBoundingBox">
              <polygon points="0.2102,0.4539 0.2176,0.4167 0.2249,0.3947 0.2322,0.3772 0.2395,0.3640 0.2468,0.3531 0.2541,0.3443 0.2614,0.3355 0.2687,0.3268 0.2761,0.3202 0.2834,0.3136 0.2907,0.3092 0.2980,0.3048 0.3053,0.3004 0.3126,0.2961 0.3199,0.2939 0.3272,0.2895 0.3346,0.2873 0.3419,0.2851 0.3492,0.2851 0.3565,0.2829 0.3638,0.2829 0.3711,0.2829 0.3784,0.2851 0.3857,0.2851 0.3931,0.2873 0.4004,0.2895 0.4077,0.2939 0.4150,0.2961 0.4223,0.3004 0.4296,0.3026 0.4369,0.3070 0.4442,0.3136 0.4516,0.3180 0.4589,0.3246 0.4662,0.3311 0.4735,0.3377 0.4808,0.3443 0.4881,0.3531 0.4954,0.3596 0.5027,0.3553 0.5101,0.3465 0.5174,0.3377 0.5247,0.3311 0.5320,0.3246 0.5393,0.3202 0.5466,0.3136 0.5539,0.3092 0.5612,0.3048 0.5686,0.3004 0.5759,0.2982 0.5832,0.2961 0.5905,0.2939 0.5978,0.2895 0.6051,0.2873 0.6124,0.2873 0.6197,0.2851 0.6271,0.2851 0.6344,0.2829 0.6417,0.2851 0.6490,0.2851 0.6563,0.2873 0.6636,0.2873 0.6709,0.2895 0.6782,0.2939 0.6856,0.2961 0.6929,0.3004 0.7002,0.3048 0.7075,0.3114 0.7148,0.3180 0.7221,0.3246 0.7294,0.3311 0.7367,0.3399 0.7441,0.3487 0.7514,0.3596 0.7587,0.3706 0.7660,0.3860 0.7733,0.4035 0.7806,0.4276 0.7861,0.4671 0.7861,0.4956 0.7806,0.5329 0.7733,0.5592 0.7660,0.5768 0.7587,0.5921 0.7514,0.6031 0.7441,0.6162 0.7367,0.6272 0.7294,0.6360 0.7221,0.6469 0.7148,0.6557 0.7075,0.6645 0.7002,0.6732 0.6929,0.6820 0.6856,0.6908 0.6782,0.6974 0.6709,0.7039 0.6636,0.7127 0.6563,0.7193 0.6490,0.7259 0.6417,0.7325 0.6344,0.7390 0.6271,0.7434 0.6197,0.7500 0.6124,0.7566 0.6051,0.7610 0.5978,0.7675 0.5905,0.7719 0.5832,0.7763 0.5759,0.7807 0.5686,0.7851 0.5612,0.7917 0.5539,0.7961 0.5466,0.8004 0.5393,0.8048 0.5320,0.8092 0.5247,0.8114 0.5174,0.8158 0.5101,0.8202 0.5027,0.8224 0.4954,0.8246 0.4881,0.8224 0.4808,0.8180 0.4735,0.8136 0.4662,0.8114 0.4589,0.8070 0.4516,0.8026 0.4442,0.7982 0.4369,0.7939 0.4296,0.7873 0.4223,0.7829 0.4150,0.7785 0.4077,0.7741 0.4004,0.7675 0.3931,0.7632 0.3857,0.7588 0.3784,0.7522 0.3711,0.7478 0.3638,0.7412 0.3565,0.7368 0.3492,0.7303 0.3419,0.7237 0.3346,0.7171 0.3272,0.7105 0.3199,0.7039 0.3126,0.6974 0.3053,0.6886 0.2980,0.6798 0.2907,0.6732 0.2834,0.6645 0.2761,0.6557 0.2687,0.6447 0.2614,0.6360 0.2541,0.6272 0.2468,0.6140 0.2395,0.6009 0.2322,0.5877 0.2249,0.5702 0.2176,0.5482 0.2102,0.5088" />
            </clipPath>
          </defs>
        </svg>

        {/* Фоновая подложка формы сердца */}
        <div
          style={{
            position: 'absolute',
            left: isMain ? '0' : '18%',
            top: isMain ? '0' : '25%',
            width: isMain ? '100%' : '64%',
            height: isMain ? '100%' : '65%',
            backgroundColor: '#ffffff',
            clipPath: isMain ? 'url(#together-heart-clip)' : `url(#heart-clip-${id})`,
            zIndex: 1,
            boxShadow: 'inset 0 2px 8px rgba(74, 43, 51, 0.12)',
          }}
        />

        {/* Контейнер фотографий: обрезан точно по внутреннему отверстию */}
        <div
          style={{
            position: 'absolute',
            left: isMain ? '0' : '18%',
            top: isMain ? '0' : '25%',
            width: isMain ? '100%' : '64%',
            height: isMain ? '100%' : '65%',
            clipPath: isMain ? 'url(#together-heart-clip)' : `url(#heart-clip-${id})`,
            zIndex: 2,
            backgroundColor: '#f8ebe4',
            overflow: 'hidden',
          }}
        >
          {isMain ? (
            /* В двойном общем сердечке: две половинки, меняющиеся одновременно на рандом */
            <div
              style={{
                position: 'absolute',
                left: '20.5%',
                top: '28%',
                width: '59%',
                height: '55%',
                display: 'flex',
                gap: 0,
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              {/* Левая половинка */}
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  borderRight: '1px solid rgba(255, 255, 255, 0.35)',
                }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={`left-${leftIndex}`}
                    src={leftPhoto?.url}
                    alt="Мы вместе"
                    initial={{ opacity: 0.35, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: leftPhoto?.position || 'center 35%',
                      display: 'block',
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* Правая половинка */}
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={`right-${rightIndex}`}
                    src={rightPhoto?.url}
                    alt="Мы вместе"
                    initial={{ opacity: 0.35, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: rightPhoto?.position || 'center 35%',
                      display: 'block',
                    }}
                  />
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Одиночные сердечки: чистое фото без тяжелого фонового размытия для мгновенного 60 FPS переключения */
            <AnimatePresence mode="popLayout">
              <motion.img
                key={`main-${currentIndex}`}
                src={currentPhoto?.url}
                alt={label}
                initial={{ opacity: 0.2, scale: photoScale * 1.04 }}
                animate={{ opacity: 1, scale: photoScale }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: objectPos,
                  borderRadius: '16px',
                  display: 'block',
                  zIndex: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  willChange: 'opacity, transform',
                }}
              />
            </AnimatePresence>
          )}
        </div>

        {/* Настоящая высококачественная PNG рамка */}
        <img
          src={frameSrc}
          alt=""
          loading="eager"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 6,
            filter: isMain
              ? 'drop-shadow(0 12px 24px rgba(175, 74, 101, 0.32))'
              : 'drop-shadow(0 8px 18px rgba(175, 74, 101, 0.22))',
          }}
          onError={(e) => {
            console.warn('Frame image load failed', frameSrc);
          }}
        />

        {/* Счётчик фото ТОЛЬКО для одиночных сердечек (на большом сердечке убран по просьбе) */}
        {!isMain && (
          <div
            style={{
              position: 'absolute',
              bottom: '4%',
              right: '14%',
              zIndex: 8,
              padding: '2px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 252, 248, 0.94)',
              border: '1px solid var(--border-peach)',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--accent-crimson)',
              boxShadow: '0 2px 6px rgba(74, 43, 51, 0.12)',
              pointerEvents: 'none',
            }}
          >
            {currentIndex + 1}/{photos.length}
          </div>
        )}

        {/* Всплывающие сердечки при переключении фото */}
        {clickHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0.7, y: 0 }}
            animate={{ opacity: 0, scale: 1.4, y: -45 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setClickHearts((prev) => prev.filter((item) => item.id !== h.id));
            }}
            style={{
              position: 'absolute',
              left: h.x,
              top: h.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 20,
              fontSize: '1.25rem',
            }}
          >
            💖
          </motion.div>
        ))}
      </motion.div>

      {/* Подпись под сердечком */}
      <div
        style={{
          marginTop: '6px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          className="glass-text-highlight"
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontSize: isMain ? 'clamp(1.4rem, 4.6vw, 1.95rem)' : 'clamp(1.15rem, 3.8vw, 1.48rem)',
            fontWeight: 700,
            color: isMain ? 'var(--accent-crimson)' : 'var(--text-dark)',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </span>
        {subtitle && (
          <p
            style={{
              marginTop: '4px',
            }}
          >
            <span
              className="glass-text-highlight-subtle"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              {subtitle}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
