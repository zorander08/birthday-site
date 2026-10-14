import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/audio';

interface InteractiveSnoopyProps {
  src: string;
  alt: string;
  reactionText?: string;
  quotes?: string[];
  style?: React.CSSProperties;
  className?: string;
  width?: string | number;
  height?: string | number;
  bubblePosition?: 'top' | 'bottom' | 'left' | 'right';
  bubbleAlign?: 'center' | 'left' | 'right';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const InteractiveSnoopy: React.FC<InteractiveSnoopyProps> = ({
  src,
  alt,
  reactionText,
  quotes,
  style,
  className,
  width,
  height,
  bubblePosition = 'top',
  bubbleAlign = 'center',
  onError,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(bubblePosition);

  const pool = quotes && quotes.length > 0 ? quotes : reactionText ? [reactionText] : ['Гав! 🐾'];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setIsShaking(true);
    setShowBubble(true);

    // Сменяем фразу
    setQuoteIndex((prev) => (prev + 1) % pool.length);

    // Если выравнивание по краю не задано, слегка меняем сторону для динамики
    if (bubbleAlign === 'center' && bubblePosition === 'top') {
      const positions: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'top', 'bottom'];
      setCurrentPosition(positions[Math.floor(Math.random() * positions.length)]);
    } else {
      setCurrentPosition(bubblePosition);
    }

    setTimeout(() => {
      setIsShaking(false);
    }, 650);

    setTimeout(() => {
      setShowBubble(false);
    }, 2000);
  };

  const currentQuote = pool[quoteIndex];

  // Расположение облачка в зависимости от currentPosition и bubbleAlign
  const getBubbleStyle = (): React.CSSProperties => {
    if (bubbleAlign === 'right') {
      if (currentPosition === 'bottom') {
        return {
          top: '100%',
          marginTop: '6px',
          right: 0,
        };
      }
      return {
        bottom: '100%',
        marginBottom: '6px',
        right: 0,
      };
    }

    if (bubbleAlign === 'left') {
      if (currentPosition === 'bottom') {
        return {
          top: '100%',
          marginTop: '6px',
          left: 0,
        };
      }
      return {
        bottom: '100%',
        marginBottom: '6px',
        left: 0,
      };
    }

    switch (currentPosition) {
      case 'bottom':
        return {
          top: '100%',
          marginTop: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: '100%',
          marginRight: '6px',
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          left: '100%',
          marginLeft: '6px',
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'top':
      default:
        return {
          bottom: '100%',
          marginBottom: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        ...style,
      }}
      className={className}
      onClick={handleClick}
      title="Нажми на меня!"
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        animate={
          isShaking
            ? {
                rotate: [-8, 10, -9, 8, -4, 3, 0],
                x: [-3, 4, -4, 3, -2, 0],
                scale: [1, 1.14, 0.94, 1.06, 1],
              }
            : {}
        }
        transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 600, damping: 15 } }}
        onError={onError}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
        }}
      />

      {/* Всплывающее облачко со звуком/реакцией Снупи */}
      <AnimatePresence>
        {showBubble && currentQuote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: currentPosition === 'bottom' ? -4 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: currentPosition === 'bottom' ? 4 : -6 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'absolute',
              ...getBubbleStyle(),
              backgroundColor: 'rgba(255, 252, 248, 0.98)',
              border: '1.5px solid var(--border-peach)',
              color: 'var(--accent-crimson)',
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(175, 74, 101, 0.25)',
              maxWidth: 'min(220px, 68vw)',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
              lineHeight: 1.25,
              zIndex: 35,
              pointerEvents: 'none',
            }}
          >
            {currentQuote}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
