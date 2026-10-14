import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import { launchRomanticConfetti } from '../utils/confetti';
import { InteractiveSnoopy } from '../components/InteractiveSnoopy';
import { ArrowLeft, MessageCircleHeart, Sparkles, Trash2, Plus } from 'lucide-react';

interface ScreenChatBoardProps {
  onBack: () => void;
}

interface ChatSticker {
  id: number;
  phrase: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 5% to 85%
  rotation: number;
  colorScheme: {
    bg: string;
    border: string;
    tape: string;
    textColor: string;
  };
}

const COLOR_SCHEMES = [
  { bg: '#FFF0F3', border: '#F7B7C7', tape: 'rgba(247, 183, 199, 0.65)', textColor: '#9C3353' }, // Розовый
  { bg: '#FFF5EB', border: '#F9CAA7', tape: 'rgba(249, 202, 167, 0.65)', textColor: '#9A5328' }, // Персиковый
  { bg: '#FEFCE8', border: '#FDE047', tape: 'rgba(253, 224, 71, 0.65)', textColor: '#854D0E' },  // Лимонный
  { bg: '#F0FDF4', border: '#86EFAC', tape: 'rgba(134, 239, 172, 0.65)', textColor: '#166534' }, // Мятный
  { bg: '#F5F3FF', border: '#DDD6FE', tape: 'rgba(221, 214, 254, 0.65)', textColor: '#5B21B6' }, // Лавандовый
  { bg: '#F0F9FF', border: '#BAE6FD', tape: 'rgba(186, 230, 253, 0.65)', textColor: '#075985' }, // Небесный
];

export const ScreenChatBoard: React.FC<ScreenChatBoardProps> = ({ onBack }) => {
  const [stickers, setStickers] = useState<ChatSticker[]>(() => {
    // Начальные 4 фразочки для красивого первого впечатления
    const initialPhrases = ['буся', 'нормалды', 'я тебя очень люблю', 'во скок встретимся'];
    return initialPhrases.map((phrase, idx) => {
      const positions = [
        { x: 18, y: 22 },
        { x: 62, y: 18 },
        { x: 26, y: 62 },
        { x: 68, y: 58 },
      ];
      return {
        id: idx + 1,
        phrase,
        x: positions[idx].x,
        y: positions[idx].y,
        rotation: (idx % 2 === 0 ? 1 : -1) * (3 + idx * 1.5),
        colorScheme: COLOR_SCHEMES[idx % COLOR_SCHEMES.length],
      };
    });
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const phrasePool = SITE_CONFIG.chatBoard.phrases;

  const getRandomPhrase = () => {
    const existing = new Set(stickers.map((s) => s.phrase));
    const available = phrasePool.filter((p) => !existing.has(p));
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
    return phrasePool[Math.floor(Math.random() * phrasePool.length)];
  };

  const addStickerAt = (xPercent: number, yPercent: number) => {
    soundManager.playPop();
    const newSticker: ChatSticker = {
      id: Date.now() + Math.random(),
      phrase: getRandomPhrase(),
      x: Math.max(8, Math.min(84, xPercent)),
      y: Math.max(10, Math.min(84, yPercent)),
      rotation: (Math.random() - 0.5) * 14,
      colorScheme: COLOR_SCHEMES[Math.floor(Math.random() * COLOR_SCHEMES.length)],
    };
    setStickers((prev) => [...prev.slice(-24), newSticker]);
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Если кликнули по существующему стикеру, не добавляем новый поверх
    if ((e.target as HTMLElement).closest('.chat-sticker-item')) {
      return;
    }
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    addStickerAt(x, y);
  };

  const handleAddRandomSticker = () => {
    const randomX = 12 + Math.random() * 70;
    const randomY = 14 + Math.random() * 68;
    addStickerAt(randomX, randomY);
  };

  const handleFillBoard = () => {
    soundManager.playSparkle();
    launchRomanticConfetti();
    const presetPositions = [
      { x: 14, y: 16 }, { x: 48, y: 14 }, { x: 78, y: 18 },
      { x: 22, y: 44 }, { x: 54, y: 48 }, { x: 80, y: 46 },
      { x: 16, y: 74 }, { x: 44, y: 78 }, { x: 74, y: 76 },
    ];
    const newStickers: ChatSticker[] = presetPositions.map((pos, idx) => ({
      id: Date.now() + idx,
      phrase: phrasePool[(idx * 7) % phrasePool.length],
      x: pos.x + (Math.random() - 0.5) * 6,
      y: pos.y + (Math.random() - 0.5) * 6,
      rotation: (Math.random() - 0.5) * 14,
      colorScheme: COLOR_SCHEMES[idx % COLOR_SCHEMES.length],
    }));
    setStickers(newStickers);
  };

  const handleClearBoard = () => {
    soundManager.playClick();
    setStickers([]);
  };

  const handleStickerTap = (id: number) => {
    soundManager.playPop();
    launchRomanticConfetti();
    // Легкий толчок при повторном клике
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: s.rotation * -1 } : s))
    );
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
        padding: '12px 18px 48px',
        maxWidth: '920px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Кнопка возврата к подаркам */}
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
            padding: '7px 15px',
            borderRadius: '12px',
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
      </div>

      {/* Заголовок */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '16px',
          gap: '6px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircleHeart size={28} color="var(--accent-crimson)" />
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--text-dark)',
            }}
          >
            {SITE_CONFIG.chatBoard.title}
          </h1>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-handwritten)',
            fontSize: 'clamp(1.05rem, 3.4vw, 1.35rem)',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          {SITE_CONFIG.chatBoard.description}
        </p>
      </div>

      {/* Панель управления доской */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '16px',
          width: '100%',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleAddRandomSticker}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '14px',
            backgroundColor: 'var(--accent-crimson)',
            color: '#ffffff',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(175, 74, 101, 0.28)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Достать фразу</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleFillBoard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 252, 248, 0.95)',
            border: '1.5px solid var(--accent-deep)',
            color: 'var(--accent-crimson)',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(175, 74, 101, 0.12)',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={16} />
          <span>Заполнить доску</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleClearBoard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 252, 248, 0.85)',
            border: '1px solid var(--border-peach)',
            color: 'var(--text-muted)',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={15} />
          <span>Очистить</span>
        </motion.button>

        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--accent-crimson)',
            backgroundColor: 'rgba(247, 219, 226, 0.65)',
            padding: '5px 12px',
            borderRadius: '12px',
          }}
        >
          На доске: {stickers.length}
        </div>
      </div>

      {/* Интерактивное полотно-доска скрапбука */}
      <div
        ref={boardRef}
        onClick={handleBoardClick}
        style={{
          width: '100%',
          minHeight: 'clamp(460px, 64vh, 620px)',
          borderRadius: '26px',
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255, 252, 247, 0.98) 0%, rgba(249, 239, 229, 0.95) 100%)',
          border: '2px dashed rgba(212, 150, 163, 0.75)',
          boxShadow: '0 20px 48px rgba(175, 74, 101, 0.14), inset 0 2px 8px rgba(255, 255, 255, 0.85)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Декоративные скотчи по 4 углам доски */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '12px',
            width: '44px',
            height: '16px',
            backgroundColor: 'rgba(244, 182, 196, 0.55)',
            transform: 'rotate(-35deg)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            width: '44px',
            height: '16px',
            backgroundColor: 'rgba(244, 182, 196, 0.55)',
            transform: 'rotate(35deg)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            width: '44px',
            height: '16px',
            backgroundColor: 'rgba(244, 182, 196, 0.55)',
            transform: 'rotate(35deg)',
            pointerEvents: 'none',
          }}
        />

        {/* Пустая подсказка если всё очищено */}
        {stickers.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <MessageCircleHeart size={44} color="var(--accent-crimson)" style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--accent-crimson)' }}>
              Нажми в любое место доски! 💖
            </p>
            <p style={{ fontSize: '0.88rem', margin: '4px 0 0', opacity: 0.8 }}>
              Каждое нажатие достаёт случайную фразу из ваших 31 821 сообщений
            </p>
          </div>
        )}

        {/* Наклеенные стикеры с фразами */}
        <AnimatePresence>
          {stickers.map((stk) => (
            <motion.div
              key={stk.id}
              className="chat-sticker-item"
              initial={{ scale: 0, rotate: stk.rotation * 2, opacity: 0 }}
              animate={{ scale: 1, rotate: stk.rotation, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              whileHover={{ scale: 1.08, zIndex: 40 }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                handleStickerTap(stk.id);
              }}
              style={{
                position: 'absolute',
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `translate(-50%, -50%) rotate(${stk.rotation}deg)`,
                backgroundColor: stk.colorScheme.bg,
                border: `1.5px solid ${stk.colorScheme.border}`,
                borderRadius: '14px',
                padding: '10px 16px 8px',
                boxShadow: '0 8px 22px rgba(74, 43, 51, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                zIndex: 10,
                maxWidth: '220px',
                minWidth: '100px',
                textAlign: 'center',
              }}
            >
              {/* Скотч сверху стикера */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-2deg)',
                  width: '38px',
                  height: '12px',
                  backgroundColor: stk.colorScheme.tape,
                  borderRadius: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              />

              <span
                style={{
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: 'clamp(1.15rem, 3.2vw, 1.45rem)',
                  fontWeight: 700,
                  color: stk.colorScheme.textColor,
                  lineHeight: 1.25,
                  display: 'block',
                  wordBreak: 'break-word',
                }}
              >
                {stk.phrase}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Снупи в правом нижнем углу доски */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            width: 'clamp(65px, 14vw, 84px)',
            zIndex: 35,
          }}
        >
          <InteractiveSnoopy
            src="/assets/decorations/snoopy with arahis.png"
            alt="Снупи читает чат"
            quotes={[
              'читаю ваш чат 🐾',
              '31 821 сообщение — это любовь 💕',
              'нормалды переписка',
              'буся и босс',
              'кисс',
              'обоюдно',
            ]}
            bubblePosition="top"
            style={{
              filter: 'drop-shadow(0 4px 10px rgba(74, 43, 51, 0.18))',
            }}
          />
        </div>
      </div>
    </motion.main>
  );
};
