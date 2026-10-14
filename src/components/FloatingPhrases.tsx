import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../content';

type FloatingItemType = 'text' | 'snoopy';

interface FloatingItem {
  id: number;
  type: FloatingItemType;
  text?: string;
  imageSrc?: string;
  x: number;
  y: number;
  rotation: number;
  zoneIdx: number;
}

const ZONES = [
  { xRange: [6, 26], yRange: [10, 24] },   // Верх-лево
  { xRange: [74, 94], yRange: [10, 24] },  // Верх-право
  { xRange: [34, 66], yRange: [6, 15] },   // Верх-центр
  { xRange: [4, 22], yRange: [28, 46] },   // Центр-лево верх
  { xRange: [78, 96], yRange: [28, 46] },  // Центр-право верх
  { xRange: [5, 24], yRange: [50, 68] },   // Центр-лево низ
  { xRange: [76, 95], yRange: [50, 68] },  // Центр-право низ
  { xRange: [8, 28], yRange: [72, 88] },   // Низ-лево
  { xRange: [72, 92], yRange: [72, 88] },  // Низ-право
  { xRange: [32, 68], yRange: [84, 94] },  // Низ-центр
  { xRange: [12, 32], yRange: [20, 36] },  // Доп лево
  { xRange: [68, 88], yRange: [20, 36] },  // Доп право
];

const SNOOPY_STICKERS = [
  '/assets/decorations/snoopy dog with heart.png',
  '/assets/decorations/snoopy with arahis.png',
  '/assets/decorations/snoopy sitting.png',
  '/assets/decorations/snoopy with heart-i love you.png',
  '/assets/decorations/snoopy caughing.png',
];

export const FloatingPhrases: React.FC = () => {
  const [activeItems, setActiveItems] = useState<FloatingItem[]>([]);
  const idCounterRef = useRef(0);

  const spawnItem = useCallback(() => {
    setActiveItems((prev) => {
      // До 9 элементов одновременно на фоне (живой и активный фон)
      if (prev.length >= 9) {
        return prev;
      }

      const activeTexts = new Set(prev.filter((p) => p.type === 'text').map((p) => p.text));
      const activeZones = new Set(prev.map((p) => p.zoneIdx));

      // 50% шанс для Снупи, 50% для романтических фраз
      const spawnSnoopy = Math.random() < 0.5;

      // Ищем свободную зону на экране
      const availableZones = Array.from({ length: ZONES.length }, (_, i) => i).filter(
        (z) => !activeZones.has(z)
      );
      const zoneIdx =
        availableZones.length > 0
          ? availableZones[Math.floor(Math.random() * availableZones.length)]
          : Math.floor(Math.random() * ZONES.length);

      const zone = ZONES[zoneIdx];
      const x = zone.xRange[0] + Math.random() * (zone.xRange[1] - zone.xRange[0]);
      const y = zone.yRange[0] + Math.random() * (zone.yRange[1] - zone.yRange[0]);
      const rotation = (Math.random() - 0.5) * 16;

      idCounterRef.current += 1;

      if (spawnSnoopy) {
        const randomImg = SNOOPY_STICKERS[Math.floor(Math.random() * SNOOPY_STICKERS.length)];
        return [
          ...prev,
          {
            id: idCounterRef.current,
            type: 'snoopy',
            imageSrc: randomImg,
            x,
            y,
            rotation,
            zoneIdx,
          },
        ];
      }

      // Текстовая фраза (приоритет фразам пары)
      const choosePriority = Math.random() < 0.7;
      const priority = SITE_CONFIG.priorityPhrases;
      const secondary = SITE_CONFIG.secondaryPhrases;
      const pool = choosePriority ? priority : secondary;
      const availableInPool = pool.filter((txt) => !activeTexts.has(txt));

      let chosenText = '';
      if (availableInPool.length > 0) {
        chosenText = availableInPool[Math.floor(Math.random() * availableInPool.length)];
      } else {
        const backupPool = choosePriority ? secondary : priority;
        const backupAvailable = backupPool.filter((txt) => !activeTexts.has(txt));
        if (backupAvailable.length > 0) {
          chosenText = backupAvailable[Math.floor(Math.random() * backupAvailable.length)];
        } else {
          return prev;
        }
      }

      return [
        ...prev,
        {
          id: idCounterRef.current,
          type: 'text',
          text: chosenText,
          x,
          y,
          rotation,
          zoneIdx,
        },
      ];
    });
  }, []);

  useEffect(() => {
    const t1 = setTimeout(spawnItem, 200);
    const t2 = setTimeout(spawnItem, 600);
    const t3 = setTimeout(spawnItem, 1100);
    const interval = setInterval(spawnItem, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [spawnItem]);

  const handleAnimationComplete = (id: number) => {
    setActiveItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed-viewport-layer" style={{ zIndex: 1 }}>
      <AnimatePresence>
        {activeItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.85, y: 14 }}
            animate={{
              opacity: [0, 0.75, 0.75, 0],
              scale: [0.85, 1, 1, 0.94],
              y: [14, 0, -8, -24],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 5.6,
              times: [0, 0.2, 0.8, 1],
              ease: 'easeInOut',
            }}
            onAnimationComplete={() => handleAnimationComplete(item.id)}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              userSelect: 'none',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          >
            {item.type === 'text' ? (
              <span
                style={{
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)',
                  color: 'var(--accent-crimson)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 8px rgba(255, 252, 248, 0.95)',
                  display: 'inline-block',
                }}
              >
                {item.text}
              </span>
            ) : (
              <img
                src={item.imageSrc}
                alt=""
                style={{
                  width: 'clamp(54px, 13vw, 76px)',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 4px 10px rgba(175, 74, 101, 0.15))',
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
