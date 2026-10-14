import { useCallback, useEffect, useRef, useState } from "react";
import type { VinylTrack } from "./tracks";

export type PlaybackStatus = "unconfigured" | "ready" | "loading" | "playing" | "paused" | "buffering" | "error";
export type RepeatMode = "off" | "all" | "one";

function initialIndex(value: number, length: number) {
  if (!Number.isFinite(value) || length === 0) return 0;
  return Math.max(0, Math.min(Math.trunc(value), length - 1));
}

export function useAudioPlayer(tracks: VinylTrack[], startingIndex = 0) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedId, setSelectedId] = useState(() => tracks[initialIndex(startingIndex, tracks.length)]?.id);
  const currentIndex = Math.max(0, tracks.findIndex((track) => track.id === selectedId));
  const currentTrack = tracks[currentIndex];
  const collectionKey = JSON.stringify(tracks.map((track) => track.id));
  const [status, setStatus] = useState<PlaybackStatus>(currentTrack?.src ? "ready" : "unconfigured");
  const [notice, setNotice] = useState("");
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const playOnLoad = useRef(false);
  const requestId = useRef(0);
  const history = useRef<string[]>([]);
  const shuffleQueue = useRef<string[]>([]);
  const trackRef = useRef(currentTrack);
  trackRef.current = currentTrack;

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;

    if (!trackRef.current.src) {
      setStatus("unconfigured");
      setNotice(`Add a local audio file for "${trackRef.current.title}" to start listening.`);
      return;
    }

    if (!audio.paused && !audio.ended && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;
    const request = ++requestId.current;
    setNotice("");
    setStatus("loading");

    try {
      if (audio.error) audio.load();
      await audio.play();
      // Only the native "playing" event confirms playback and starts the illustration.
    } catch (error) {
      if (request !== requestId.current) return;
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus(audio.paused ? "paused" : "ready");
        return;
      }
      setStatus("error");
      setNotice(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Браузер ожидает взаимодействия. Нажмите Play, чтобы включить музыку."
          : "Этот трек доступен в нашем плейлисте Spotify ♡"
      );
    }
  }, []);

  const pause = useCallback(() => {
    requestId.current += 1;
    audioRef.current?.pause();
    setStatus((previous) =>
      previous === "playing" || previous === "loading" || previous === "buffering" ? "paused" : previous,
    );
  }, []);

  const selectTrack = useCallback((index: number, autoPlay = true, remember = true) => {
    if (tracks.length === 0) return;
    const nextIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const nextTrack = tracks[nextIndex];
    if (nextTrack.id === currentTrack?.id) {
      if (autoPlay) void play();
      return;
    }

    if (remember && currentTrack) history.current = [...history.current.slice(-49), currentTrack.id];
    shuffleQueue.current = shuffleQueue.current.filter((id) => id !== nextTrack.id);
    pause();
    playOnLoad.current = autoPlay;
    setNotice("");
    setSelectedId(nextTrack.id);
  }, [tracks, currentTrack, pause, play]);

  const next = useCallback((fromEnded = false) => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    if (fromEnded && repeat === "one") {
      audio.currentTime = 0;
      void play();
      return;
    }

    if (fromEnded && repeat === "off" && ((!shuffle && currentIndex === tracks.length - 1) || tracks.length === 1)) {
      setStatus("paused");
      return;
    }

    if (tracks.length === 1) {
      audio.currentTime = 0;
      void play();
      return;
    }

    if (shuffle) {
      if (shuffleQueue.current.length === 0) {
        if (fromEnded && repeat === "off") {
          setStatus("paused");
          return;
        }
        shuffleQueue.current = tracks.map((track) => track.id);
      }
      const candidates = shuffleQueue.current.filter((id) => id !== currentTrack?.id);
      const nextId = candidates[Math.floor(Math.random() * candidates.length)];
      const nextIndex = tracks.findIndex((track) => track.id === nextId);
      if (nextIndex >= 0) selectTrack(nextIndex);
    } else {
      selectTrack(currentIndex + 1);
    }
  }, [tracks, currentTrack?.id, currentIndex, repeat, shuffle, play, selectTrack]);

  const previous = useCallback(() => {
    if (shuffle && history.current.length > 0) {
      const previousId = history.current.pop();
      const previousIndex = tracks.findIndex((track) => track.id === previousId);
      if (previousIndex >= 0) {
        selectTrack(previousIndex, true, false);
        return;
      }
    }
    selectTrack(currentIndex - 1, true, false);
  }, [shuffle, tracks, currentIndex, selectTrack]);

  // Stable native listeners read the latest navigation behavior without resubscribing.
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    const ids = JSON.parse(collectionKey) as string[];
    const available = new Set(ids);
    history.current = history.current.filter((id) => available.has(id));
    shuffleQueue.current = ids.filter((id) => id !== trackRef.current?.id);
  }, [collectionKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      if (!audio.paused) setStatus("loading");
    };
    const onPlaying = () => {
      if (!audio.paused && !audio.ended && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setStatus("playing");
        setNotice("");
      }
    };
    const onPause = () => {
      if (!audio.paused) return;
      setStatus((previousStatus) =>
        previousStatus === "playing" || previousStatus === "loading" || previousStatus === "buffering"
          ? "paused"
          : previousStatus,
      );
    };
    const onWaiting = () => {
      if (!audio.paused && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) setStatus("buffering");
    };
    const onEnded = () => {
      if (!audio.ended || !trackRef.current?.src) return;
      setStatus("paused");
      nextRef.current(true);
    };
    const onError = () => {
      if (!audio.getAttribute("src") || !audio.error || audio.error.code === 1) return;
      setStatus("error");
      setNotice(
        audio.error.code === 3
          ? "This audio file couldn't be read. Try an MP3, WAV, or OGG file."
          : audio.error.code === 4
            ? "This audio file is missing or unsupported. Check its path, or choose another file."
          : "We couldn't find this song. Check its local file path, or add an audio file below.",
      );
    };
    const onVolumeChange = () => {
      setVolumeState(audio.volume);
      setMuted(audio.muted);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("volumechange", onVolumeChange);
    audio.volume = 0.7;
    onVolumeChange();

    return () => {
      requestId.current += 1;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("volumechange", onVolumeChange);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const shouldPlay = playOnLoad.current;
    playOnLoad.current = false;

    if (!currentTrack?.src) {
      requestId.current += 1;
      audio.pause();
      setNotice("");
      audio.removeAttribute("src");
      audio.load();
      setStatus("unconfigured");
      return;
    }

    // Перезагружаем аудио только если действительно сменился путь к файлу,
    // чтобы исключить микрофриз и прерывание воспроизведения на мобильных устройствах
    const currentSrcAttr = audio.getAttribute("src");
    if (currentSrcAttr !== currentTrack.src) {
      requestId.current += 1;
      audio.pause();
      setNotice("");
      audio.src = currentTrack.src;
      audio.load();
      setStatus("ready");
    }

    if (shouldPlay) void play();
  }, [currentTrack?.id, currentTrack?.src, play]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused || status === "loading" || status === "buffering") pause();
    else void play();
  }, [status, pause, play]);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    audio.volume = Math.max(0, Math.min(1, value));
    if (value > 0) audio.muted = false;
    setVolumeState(audio.volume);
    setMuted(audio.muted);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) audio.volume = 0.7;
    } else audio.muted = true;
    setMuted(audio.muted);
    setVolumeState(audio.volume);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((value) => value === "off" ? "all" : value === "all" ? "one" : "off");
  }, []);

  const toggleShuffle = useCallback(() => {
    shuffleQueue.current = tracks.filter((track) => track.id !== currentTrack?.id).map((track) => track.id);
    history.current = [];
    setShuffle(!shuffle);
  }, [tracks, currentTrack?.id, shuffle]);

  return {
    audioRef,
    currentTrack,
    currentIndex,
    status,
    notice,
    isPlaying: status === "playing",
    volume,
    muted,
    shuffle,
    repeat,
    play,
    pause,
    toggle,
    next: () => next(false),
    previous,
    selectTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  };
}