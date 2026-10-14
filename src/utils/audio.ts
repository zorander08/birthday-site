/**
 * Синтезатор мягких звуковых эффектов через Web Audio API
 * Работает без внешних тяжелых mp3/wav файлов, не блокируется браузером
 * и поддерживает быстрое включение/отключение звука.
 */

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;
let bgAudio: HTMLAudioElement | null = null;
let bgSource: MediaElementAudioSourceNode | null = null;
let bgGainNode: GainNode | null = null;

const QUIET_VOLUME = 0.015;
const FULL_VOLUME = 0.65;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function setupBgWebAudio(audio: HTMLAudioElement) {
  if (bgGainNode || !audio) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    bgSource = ctx.createMediaElementSource(audio);
    bgGainNode = ctx.createGain();
    const currentVol = isMuted ? 0 : QUIET_VOLUME;
    bgGainNode.gain.setValueAtTime(currentVol, ctx.currentTime);
    bgSource.connect(bgGainNode);
    bgGainNode.connect(ctx.destination);
  } catch (err) {
    // If browser doesn't allow media element routing (e.g. cross origin or duplicate), fallback gracefully
    console.warn('Web Audio routing note:', err);
  }
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

function getBgAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bgAudio) {
    bgAudio = new Audio('/assets/music/story-music.mp3');
    bgAudio.loop = true;
    bgAudio.muted = isMuted;
    try {
      bgAudio.volume = QUIET_VOLUME;
    } catch {}
    (window as unknown as { __bgAudio?: HTMLAudioElement }).__bgAudio = bgAudio;
    setupBgWebAudio(bgAudio);
  }
  return bgAudio;
}

export const soundManager = {
  getMuted(): boolean {
    return isMuted;
  },

  setMuted(muted: boolean) {
    isMuted = muted;
    if (bgAudio) {
      bgAudio.muted = isMuted;
    }
    if (bgGainNode && audioCtx) {
      try {
        const now = audioCtx.currentTime;
        bgGainNode.gain.cancelScheduledValues(now);
        bgGainNode.gain.setValueAtTime(isMuted ? 0 : QUIET_VOLUME, now);
      } catch {}
    }
  },

  toggleMuted(): boolean {
    this.setMuted(!isMuted);
    return isMuted;
  },

  getMusicAudio(): HTMLAudioElement | null {
    return bgAudio;
  },

  /**
   * Запуск романтической песни на заднем фоне на очень тихой громкости (0.015)
   * Включается при открытии сюрпризов, играет на экранах подарков, открытки и истории
   */
  startBackgroundMusic() {
    if (isMuted) return;
    try {
      const audio = getBgAudio();
      if (!audio) return;
      setupBgWebAudio(audio);
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      audio.muted = isMuted;
      if (bgGainNode && audioCtx) {
        try {
          bgGainNode.gain.setValueAtTime(QUIET_VOLUME, audioCtx.currentTime);
        } catch {}
      }
      if (audio.paused) {
        try { audio.volume = QUIET_VOLUME; } catch {}
        audio.play().catch(() => {});
      } else {
        this.fadeToVolume(QUIET_VOLUME, 300);
      }
    } catch {}
  },

  /**
   * Управление звуком видео-истории:
   * При запуске видео-эдита та же самая песня плавно прибавляет громкость до 0.65
   * При закрытии возвращается к очень тихому фоновому уровню (0.015)
   */
  setVideoModeAudio(active: boolean, isPlaying: boolean) {
    const audio = getBgAudio();
    if (!audio) return;
    setupBgWebAudio(audio);
    audio.muted = isMuted;

    if (active) {
      if (isPlaying) {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
        this.fadeToVolume(FULL_VOLUME, 300);
      } else {
        audio.pause();
      }
    } else {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      this.fadeToVolume(QUIET_VOLUME, 300);
    }
  },

  /**
   * Пауза фоновой музыки (когда заходим в виниловый плейлист или на стартовые экраны)
   */
  pauseBackgroundMusic() {
    const audio = getBgAudio();
    if (audio && !audio.paused) {
      audio.pause();
    }
  },

  /**
   * Плавное безопасное изменение громкости без микрофризов
   */
  fadeToVolume(targetVol: number, durationMs: number = 300) {
    const audio = getBgAudio();
    if (!audio) return;
    setupBgWebAudio(audio);

    const effectiveVol = isMuted ? 0 : targetVol;

    if (bgGainNode && audioCtx) {
      try {
        const now = audioCtx.currentTime;
        bgGainNode.gain.cancelScheduledValues(now);
        bgGainNode.gain.setValueAtTime(bgGainNode.gain.value, now);
        bgGainNode.gain.linearRampToValueAtTime(effectiveVol, now + Math.max(0.05, durationMs / 1000));
      } catch {}
    }

    try {
      const startVol = audio.volume;
      const diff = effectiveVol - startVol;
      if (Math.abs(diff) < 0.01) {
        audio.volume = effectiveVol;
        return;
      }
      const steps = 6;
      const stepTime = Math.max(25, Math.floor(durationMs / steps));
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        try {
          audio.volume = Math.max(0, Math.min(1, startVol + diff * (currentStep / steps)));
        } catch {}
        if (currentStep >= steps) {
          clearInterval(timer);
          try { audio.volume = effectiveVol; } catch {}
        }
      }, stepTime);
    } catch {
      try { audio.volume = effectiveVol; } catch {}
    }
  },

  startAmbientMusic() {
    this.startBackgroundMusic();
  },

  stopAmbientMusic() {
    this.pauseBackgroundMusic();
  },

  /**
   * Нежный и тихий "pop" звук при переключении фотографии в сердечке
   */
  playPop() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      // Мягкое скольжение частоты: 520Hz -> 340Hz за 0.08 секунды
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Игнорируем любые ограничения браузера
    }
  },

  /**
   * Приятный перезвон при открытии подарка или правильном пароле
   */
  playSuccess() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (мажорный аккорд)
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // Игнорируем ошибки
    }
  },

  /**
   * Мягкий клик по кнопкам
   */
  playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Игнорируем
    }
  },

  /**
   * Игристый звук конфетти и звёздочек
   */
  playSparkle() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const freqs = [880, 1174.66, 1396.91, 1760];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const startTime = now + idx * 0.04;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // Игнорируем
    }
  },



  /**
   * Нежный переливчатый перезвон для цветов и декора
   */
  playChime() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Тройной перезвон (E6, G#6, B6)
      const notes = [1318.51, 1661.22, 1975.53];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.04, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.07 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {
      // Игнорируем ошибки
    }
  },
};
