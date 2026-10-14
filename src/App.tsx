import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { FloatingPhrases } from './components/FloatingPhrases';
import { BackgroundDecor } from './components/BackgroundDecor';
import { TapSparkles } from './components/TapSparkles';
import { HeaderControls } from './components/HeaderControls';
import { soundManager } from './utils/audio';
import { ScreenHearts } from './screens/ScreenHearts';
import { ScreenTerminal } from './screens/ScreenTerminal';
import { ScreenGifts } from './screens/ScreenGifts';
import { ScreenMusic } from './screens/ScreenMusic';
import { ScreenLetter } from './screens/ScreenLetter';
import { ScreenStory } from './screens/ScreenStory';

export type AppScreen = 'hearts' | 'terminal' | 'gifts' | 'music' | 'letter' | 'story';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('hearts');
  // Сохраняем состояние открытого подарка при переходе между разделами
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [revealedGifts, setRevealedGifts] = useState<string[]>([]);

  // Гарантированно очищаем старые сохранённые ключи, чтобы подарки не открывались сами без интриги
  React.useEffect(() => {
    try {
      localStorage.removeItem('amelia_revealed_gifts');
    } catch {}
  }, []);

  // Синхронизация фоновой музыки с активным экраном:
  // На экранах подарков, открытки и истории играет тихая романтическая музыка.
  // На экранах приветствия, терминала и винилового плеера фоновая музыка мягко приостанавливается.
  React.useEffect(() => {
    if (currentScreen === 'gifts' || currentScreen === 'letter' || currentScreen === 'story') {
      soundManager.startBackgroundMusic();
    } else {
      soundManager.pauseBackgroundMusic();
    }
  }, [currentScreen]);

  const handleRevealGift = (giftId: string) => {
    setRevealedGifts((prev) => {
      if (prev.includes(giftId)) return prev;
      return [...prev, giftId];
    });
  };

  const handleResetRevealedGifts = () => {
    setRevealedGifts([]);
  };

  return (
    <div className="scrapbook-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Мягкий фон со скрапбук-градиентом */}
      <div className="scrapbook-background" />

      {/* Фоновые декоративные веточки, цветы и интерактивные Снупи */}
      <BackgroundDecor />

      {/* Всплывающие романтические фразы на фоне */}
      <FloatingPhrases />

      {/* Сказочные искорки и сердечки при нажатии в любую точку экрана */}
      <TapSparkles />

      {/* Верхняя плашка управления (звук, кнопка возврата) */}
      <HeaderControls
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Плавная смена экранов */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {currentScreen === 'hearts' && (
            <ScreenHearts
              key="hearts"
              onNext={() => setCurrentScreen('terminal')}
            />
          )}

          {currentScreen === 'terminal' && (
            <ScreenTerminal
              key="terminal"
              onSuccess={() => setCurrentScreen('gifts')}
              onBack={() => setCurrentScreen('hearts')}
            />
          )}

          {currentScreen === 'gifts' && (
            <ScreenGifts
              key="gifts"
              isGiftOpened={isGiftOpened}
              setIsGiftOpened={setIsGiftOpened}
              revealedGifts={revealedGifts}
              onRevealGift={handleRevealGift}
              onResetRevealedGifts={handleResetRevealedGifts}
              onOpenGift={(gift) => setCurrentScreen(gift)}
              onBackToHearts={() => setCurrentScreen('hearts')}
            />
          )}

          {currentScreen === 'music' && (
            <ScreenMusic
              key="music"
              onBack={() => setCurrentScreen('gifts')}
            />
          )}

          {currentScreen === 'letter' && (
            <ScreenLetter
              key="letter"
              onBack={() => setCurrentScreen('gifts')}
            />
          )}

          {currentScreen === 'story' && (
            <ScreenStory
              key="story"
              onBack={() => setCurrentScreen('gifts')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default App;
