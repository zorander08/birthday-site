import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Spark {
  id: number;
  x: number;
  y: number;
  char: string;
  angle: number;
  distance: number;
}

const SPARK_CHARS = ['💖', '🌸', '💕', '🌷', '🤍', '🥰', '🥐'];

export const TapSparkles: React.FC = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    let lastTap = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const now = Date.now();
      // Ограничиваем частоту спавна (не чаще 120мс), чтобы не перегружать телефон при скролле
      if (now - lastTap < 120) return;
      lastTap = now;

      // Не спавним искорки поверх ползунков таймлайна/громкости
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.closest('input, .vp-range'))) return;

      const count = 3 + Math.floor(Math.random() * 2);
      const newSparks: Spark[] = [];

      for (let i = 0; i < count; i++) {
        const char = SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)];
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 22 + Math.random() * 28;

        newSparks.push({
          id: now + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          char,
          angle,
          distance,
        });
      }

      setSparks((prev) => [...prev.slice(-10), ...newSparks]);

      // Единая пакетная очистка через 800мс вместо индивидуальных ререндеров на каждую частицу
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => Date.now() - s.id < 800));
      }, 820);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="fixed-viewport-layer" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {sparks.map((spark) => {
          const targetX = Math.cos(spark.angle) * spark.distance;
          const targetY = Math.sin(spark.angle) * spark.distance;

          return (
            <motion.div
              key={spark.id}
              initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
              animate={{
                opacity: [1, 0.9, 0],
                scale: [0.5, 1.15, 0.4],
                x: targetX,
                y: targetY,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.72, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: spark.x,
                top: spark.y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                userSelect: 'none',
                fontSize: '1rem',
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 5px rgba(175, 74, 101, 0.3))',
                willChange: 'transform, opacity',
              }}
            >
              {spark.char}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
