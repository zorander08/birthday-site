import React from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '../content';
import { soundManager } from '../utils/audio';
import VinylPlayer from '../components/vinyl/VinylPlayer';
import type { VinylTrack } from '../components/vinyl/tracks';

interface ScreenMusicProps {
  onBack: () => void;
}

export const ScreenMusic: React.FC<ScreenMusicProps> = () => {
  const music = SITE_CONFIG.music;

  // На экране плейлиста фоновая музыка выключается, чтобы не мешать винилу
  React.useEffect(() => {
    soundManager.pauseBackgroundMusic();
    return () => {
      soundManager.startBackgroundMusic();
    };
  }, []);

  // Формируем стабильный мемоизированный трек-лист для винилового проигрывателя
  const vinylTracks: VinylTrack[] = React.useMemo(() => {
    return music.favoriteTracks.map((t, idx) => ({
      id: `track-${idx}`,
      title: t.name,
      artist: t.artist,
      src: encodeURI(t.audioUrl),
      note: t.note,
      artwork: (['rose', 'golden', 'garden', 'moon'] as const)[idx % 4],
    }));
  }, [music.favoriteTracks]);

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
        maxWidth: '1060px',
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
          marginBottom: '20px',
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
            Наши песни 🎵
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
            {music.subtitle}
          </span>
        </p>
      </div>

      {/* Контейнер премиального винилового проигрывателя в стиле жидкого стекла */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '26px',
          border: '1.5px solid rgba(255, 255, 255, 0.5)',
          padding: 'clamp(14px, 3.5vw, 28px)',
          boxShadow: '0 12px 40px rgba(74, 43, 51, 0.09)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <VinylPlayer
          tracks={vinylTracks}
          playlistTitle="Плейлист для двоих"
          initialTrackIndex={0}
          allowLocalFiles={false}
        />
      </div>
    </motion.main>
  );
};
