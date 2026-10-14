import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, RefObject } from "react";
import { TrackArtwork, Turntable } from "./Turntable";
import { useAudioPlayer } from "./useAudioPlayer";
import type { PlaybackStatus } from "./useAudioPlayer";
import type { VinylTrack } from "./tracks";
import "./VinylPlayer.css";

export type { VinylTrack, ArtworkStyle } from "./tracks";

export interface VinylPlayerProps {
  tracks: VinylTrack[];
  playlistTitle?: string;
  initialTrackIndex?: number;
  /** Local files are kept in memory and are never uploaded. */
  allowLocalFiles?: boolean;
  className?: string;
}

type IconName = "play" | "pause" | "previous" | "next" | "heart" | "shuffle" | "repeat" | "volume" | "mute" | "upload" | "record" | "music" | "check";

function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "play" && <path d="m9 5 11 7-11 7V5Z" fill="currentColor" strokeWidth="1" />}
      {name === "pause" && <><rect x="6.5" y="5" width="3.5" height="14" rx=".7" fill="currentColor" stroke="none" /><rect x="14" y="5" width="3.5" height="14" rx=".7" fill="currentColor" stroke="none" /></>}
      {name === "previous" && <><path d="M6 5v14" strokeWidth="2" /><path d="m18 5-10 7 10 7V5Z" fill="currentColor" strokeWidth=".7" /></>}
      {name === "next" && <><path d="M18 5v14" strokeWidth="2" /><path d="m6 5 10 7-10 7V5Z" fill="currentColor" strokeWidth=".7" /></>}
      {name === "heart" && <path d="M12 20s-8-4.6-8-10a4.5 4.5 0 0 1 8-2.9 4.5 4.5 0 0 1 8 2.9c0 5.4-8 10-8 10Z" />}
      {name === "shuffle" && <><path d="M3 6h2.5c5 0 7.5 12 12.5 12h3M3 18h2.5c1.8 0 3.2-1.5 4.5-3.7M14 9.7C15.3 7.5 16.7 6 18 6h3" /><path d="m18 3 3 3-3 3m0 6 3 3-3 3" /></>}
      {name === "repeat" && <><path d="M19 7H7a4 4 0 0 0-4 4v1m2 5h12a4 4 0 0 0 4-4v-1" /><path d="m16 4 3 3-3 3M8 14l-3 3 3 3" /></>}
      {(name === "volume" || name === "mute") && <><path d="m11 5-5 4H3v6h3l5 4V5Z" />{name === "volume" ? <><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 6 6m0-6-6 6" />}</>}
      {name === "upload" && <><path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5" /></>}
      {name === "record" && <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" /><path d="M6 9a6.7 6.7 0 0 1 3-3m6 12a6.7 6.7 0 0 0 3-3" strokeWidth="1" /></>}
      {name === "music" && <><path d="M9 17V5l11-2v12M9 9l11-2" /><ellipse cx="6" cy="17.5" rx="3" ry="2.5" /><ellipse cx="17" cy="15.5" rx="3" ry="2.5" /></>}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
    </svg>
  );
}

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/6yTDTlrFuU7Vqfbr3ltZo3?si=e4cf45cd49484018";

function SpotifyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.217.355-.678.47-1.033.253-2.827-1.728-6.388-2.119-10.58-1.162-.406.094-.814-.162-.907-.568-.093-.406.162-.814.568-.907 4.595-1.05 8.528-.607 11.7 1.35.354.218.47.678.252 1.034zm1.468-3.262c-.273.444-.855.587-1.298.314-3.235-1.988-8.169-2.564-11.996-1.401-.497.151-1.025-.133-1.176-.63-.151-.497.133-1.025.63-1.176 4.375-1.328 9.808-.686 13.526 1.603.444.273.587.854.314 1.294zm.126-3.41c-3.88-2.304-10.28-2.516-13.992-1.389-.594.18-1.222-.158-1.402-.752-.18-.594.158-1.222.752-1.402 4.264-1.295 11.327-1.049 15.794 1.604.535.317.709 1.011.392 1.546-.317.535-1.011.71-1.544.393z" />
    </svg>
  );
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

// Progress is isolated so timeupdate events do not re-render the illustrated deck or playlist.
const PlaybackTimeline = memo(function PlaybackTimeline({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
    const reset = () => { setTime(0); setDuration(0); };
    updateTime();
    updateDuration();
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("seeking", updateTime);
    audio.addEventListener("seeked", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("emptied", reset);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("seeking", updateTime);
      audio.removeEventListener("seeked", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("emptied", reset);
    };
  }, [audioRef]);

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration || !Number.isFinite(value)) return;
    const position = Math.min(duration, Math.max(0, value));
    try {
      audio.currentTime = position;
      setTime(audio.currentTime);
    } catch {
      // The media can temporarily be unseekable before its metadata is available.
    }
  };

  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className={`vp-timeline${duration === 0 ? " is-unavailable" : ""}`}>
      <input
        type="range"
        className="vp-range vp-progress"
        aria-label="Playback position"
        aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
        title={duration ? "Seek. Left and right arrow keys move 5 seconds." : "Add an audio file to enable seeking"}
        min="0"
        max={duration || 1}
        step="0.1"
        value={Math.min(time, duration)}
        disabled={!duration}
        style={{ "--vp-range-fill": `${progress}%` } as CSSProperties}
        onChange={(event) => seek(Number(event.target.value))}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            seek(time + (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 10 : 5));
          }
        }}
      />
      <div className="vp-times" aria-hidden="true"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
    </div>
  );
});

function RibbonSignature() {
  return (
    <div className="vp-signature" aria-hidden="true">
      <svg viewBox="0 0 88 53" fill="none">
        <path d="M42 22C31 4 12 3 12 16c0 11 19 13 30 6Zm4 0C57 4 76 3 76 16c0 11-19 13-30 6Z" />
        <path d="M40 25c-5 13-10 20-15 23l-1-10-10 1c10-4 17-10 25-16m9 2c5 13 10 20 15 23l1-10 10 1c-10-4-17-10-25-16" />
        <path d="M39 20c3-2 7-2 10 0l-1 7h-8l-1-7Z" />
        <path d="M17 13c7-4 15 2 22 9m32-9c-7-4-15 2-22 9" opacity=".5" />
      </svg>
      <span>Каждая песня — как признание в любви 💕</span>
    </div>
  );
}

const statusLabels: Record<PlaybackStatus, string> = {
  unconfigured: "Ожидание музыки",
  ready: "Готово к воспроизведению 🌸",
  loading: "Настраиваем мелодию...",
  playing: "Любимая музыка для двоих 💕",
  paused: "Музыка на паузе ☕",
  buffering: "Секундочку...",
  error: "Слушать в Spotify ♡",
};

interface LocalSource { src: string; name: string }

export default function VinylPlayer({ tracks, playlistTitle = "A little mixtape for you", initialTrackIndex = 0, allowLocalFiles = true, className = "" }: VinylPlayerProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localUrls = useRef(new Map<string, string>());
  const [localSources, setLocalSources] = useState<Record<string, LocalSource>>({});
  const [fileError, setFileError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const effectiveTracks = useMemo(() => tracks.map((track) => localSources[track.id] ? { ...track, src: localSources[track.id].src } : track), [tracks, localSources]);
  const player = useAudioPlayer(effectiveTracks, initialTrackIndex);
  const { currentTrack, currentIndex, status, isPlaying } = player;
  const isBusy = status === "loading" || status === "buffering";
  const isFavorite = currentTrack ? favorites.has(currentTrack.id) : false;
  const localFile = currentTrack ? localSources[currentTrack.id] : undefined;

  useEffect(() => {
    const urls = localUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  useEffect(() => setFileError(""), [currentTrack?.id]);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !currentTrack) return;
    if (file.size === 0 || (!file.type.startsWith("audio/") && !/\.(mp3|wav|ogg|oga|m4a|aac|flac|aiff|webm|opus)$/i.test(file.name))) {
      setFileError("Choose a non-empty audio file, such as an MP3, WAV, or OGG.");
      return;
    }

    player.pause();
    const oldUrl = localUrls.current.get(currentTrack.id);
    const src = URL.createObjectURL(file);
    localUrls.current.set(currentTrack.id, src);
    setLocalSources((previous) => ({ ...previous, [currentTrack.id]: { src, name: file.name } }));
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    setFileError("");
  };

  const toggleFavorite = () => {
    if (!currentTrack) return;
    setFavorites((previous) => {
      const updated = new Set(previous);
      if (updated.has(currentTrack.id)) updated.delete(currentTrack.id);
      else updated.add(currentTrack.id);
      return updated;
    });
  };

  const togglePlayback = () => {
    if (currentTrack && !currentTrack.src && allowLocalFiles) {
      void player.play();
      fileInputRef.current?.click();
      return;
    }
    player.toggle();
  };

  const playLabel = isBusy ? "Cancel loading"
    : isPlaying ? "Pause"
      : currentTrack && !currentTrack.src && allowLocalFiles ? `Add audio to play ${currentTrack.title}`
        : `Play ${currentTrack?.title ?? "music"}`;

  const sourceDescription = fileError || player.notice || (
    !currentTrack ? "Добавьте треки в плейлист."
      : status === "error" ? "Этот трек доступен в оригинальном качестве в нашем Spotify плейлисте 🎧"
      : !currentTrack.src ? "Трек доступен в нашем плейлисте Spotify."
        : localFile ? localFile.name
          : isBusy ? "Готовим мелодию к воспроизведению..."
          : status === "playing" ? "Здесь и сейчас. Только для нас двоих 💖"
            : status === "paused" ? "Песня на паузе, готова к продолжению 🌸"
              : "Пластинка на вертушке. Нажми play, чтобы слушать 💕"
  );

  return (
    <section className={`vp ${className}`} aria-label="Vinyl music player">
      <audio ref={player.audioRef} preload="metadata" className="vp-audio" aria-hidden="true" />

      <div className="vp-layout">
        <div className="vp-player-column">
          <Turntable track={currentTrack} isPlaying={isPlaying} />

          <div className="vp-player-interface">
            <div className="vp-current-track">
              <div className="vp-current-copy" key={currentTrack?.id ?? "empty"} aria-live="polite" aria-atomic="true">
                <h2>{currentTrack?.title ?? "Your next favorite"}</h2>
                <p>{currentTrack?.artist ?? "A little space for your songs"}</p>
              </div>
              <button type="button" className={`vp-icon-button vp-favorite${isFavorite ? " is-loved" : ""}`} onClick={toggleFavorite} aria-label={isFavorite ? `Remove ${currentTrack?.title} from favorites` : `Love ${currentTrack?.title ?? "this song"}`} aria-pressed={isFavorite} title={isFavorite ? "Loved, just like you" : "Save a little love"} disabled={!currentTrack}>
                <Icon name="heart" size={23} />
              </button>
            </div>

            <PlaybackTimeline audioRef={player.audioRef} />

            <div className="vp-controls" role="group" aria-label="Playback controls">
              <div className="vp-secondary-controls">
                <button type="button" className={`vp-icon-button vp-shuffle${player.shuffle ? " is-active" : ""}`} onClick={player.toggleShuffle} aria-label={`Shuffle ${player.shuffle ? "on" : "off"}`} aria-pressed={player.shuffle} title={`Shuffle ${player.shuffle ? "on" : "off"}`} disabled={tracks.length < 2}>
                  <Icon name="shuffle" size={17} />
                </button>
                <button type="button" className={`vp-icon-button vp-repeat${player.repeat !== "off" ? " is-active" : ""}`} onClick={player.cycleRepeat} aria-label={`Repeat ${player.repeat}. ${player.repeat === "off" ? "Enable repeat all" : player.repeat === "all" ? "Repeat this song" : "Turn repeat off"}`} aria-pressed={player.repeat !== "off"} title={`Repeat: ${player.repeat}`} disabled={!currentTrack}>
                  <Icon name="repeat" size={18} />
                  {player.repeat === "one" && <span className="vp-repeat-one" aria-hidden="true">1</span>}
                </button>
              </div>

              <div className="vp-main-controls">
                <button type="button" className="vp-skip-button" onClick={player.previous} aria-label="Previous track" title="Previous track" disabled={tracks.length < 2}><Icon name="previous" size={19} /></button>
                <button type="button" className={`vp-play-button${isPlaying ? " is-playing" : ""}`} onClick={togglePlayback} aria-label={playLabel} title={playLabel} disabled={!currentTrack}>
                  {isBusy ? <span className="vp-loading-indicator" aria-hidden="true" /> : <Icon name={isPlaying ? "pause" : "play"} size={24} />}
                </button>
                <button type="button" className="vp-skip-button" onClick={player.next} aria-label="Next track" title="Next track" disabled={tracks.length < 2}><Icon name="next" size={19} /></button>
              </div>

              <div className="vp-volume-control">
                <button type="button" className="vp-icon-button" onClick={player.toggleMute} aria-label={player.muted || player.volume === 0 ? "Unmute" : "Mute"} aria-pressed={player.muted || player.volume === 0} title={player.muted || player.volume === 0 ? "Unmute" : "Mute"}>
                  <Icon name={player.muted || player.volume === 0 ? "mute" : "volume"} size={18} />
                </button>
                <input type="range" className="vp-range vp-volume" min="0" max="100" step="1" aria-label="Volume" aria-valuetext={`${Math.round(player.muted ? 0 : player.volume * 100)} percent`} value={player.muted ? 0 : Math.round(player.volume * 100)} onChange={(event) => player.setVolume(Number(event.target.value) / 100)} style={{ "--vp-range-fill": `${player.muted ? 0 : player.volume * 100}%` } as CSSProperties} />
              </div>
            </div>

            <p className={`vp-playback-status${isPlaying ? " is-playing" : ""}`} aria-live="polite">
              <span className="vp-status-dot" aria-hidden="true" />
              {status === "playing"
                ? "ЗВУЧИТ НАША ОСОБЕННАЯ ПЕСНЯ 💖"
                : status === "loading" || status === "buffering"
                ? "СТАВИМ ИГЛУ НА ПЛАСТИНКУ..."
                : status === "error"
                ? "ТРЕК ДОСТУПЕН В НАШЕМ SPOTIFY ♡"
                : status === "unconfigured"
                ? "СЛУШАТЬ В SPOTIFY ♡"
                : status === "paused"
                ? "МУЗЫКА НА ПАУЗЕ 🌸"
                : "НАЖМИ PLAY, ЧТОБЫ СЛУШАТЬ 🎵"}
            </p>

            {/* Быстрая кнопка Spotify под вертушкой если трек открыт для Spotify */}
            {status === "error" && (
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                <a
                  href={SPOTIFY_PLAYLIST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vp-spotify-btn"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  <SpotifyIcon size={15} />
                  <span>Слушать в Spotify ♡</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <aside className="vp-playlist-column" aria-labelledby={`${id}-playlist-title`}>
          <div className="vp-playlist-heading">
            <div className="vp-playlist-eyebrow"><span>С ЛЮБОВЬЮ ДЛЯ ТЕБЯ</span><span className="vp-side-label">ВИНИЛ • 33⅓</span></div>
            <h2 id={`${id}-playlist-title`}>{playlistTitle}</h2>
            <p>{tracks.length} {tracks.length === 1 ? "песня" : tracks.length < 5 ? "песни" : "песен"} для нас двоих 💕</p>

            {/* Эстетичная кнопка «Слушать наш плейлист ♡» в Spotify */}
            <div style={{ marginTop: '12px', marginBottom: '8px' }}>
              <a
                href={SPOTIFY_PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="vp-spotify-btn"
                title="Открыть наш плейлист в Spotify"
              >
                <SpotifyIcon size={18} />
                <span>Слушать наш плейлист ♡</span>
              </a>
            </div>
          </div>

          <ol className="vp-playlist">
            {effectiveTracks.map((track, index) => {
              const isCurrent = index === currentIndex;
              return (
                <li key={track.id} className={isCurrent ? "is-current" : ""}>
                  <button type="button" className="vp-track-button" onClick={() => isCurrent ? player.toggle() : player.selectTrack(index)} aria-current={isCurrent ? "true" : undefined} aria-label={`${isCurrent && isPlaying ? "Pause" : "Play"} ${track.title} by ${track.artist}`} title={`${track.title} / ${track.artist}`}>
                    <span className="vp-track-number" aria-hidden="true">{isCurrent && isPlaying ? <span className="vp-equalizer"><i /><i /><i /></span> : String(index + 1).padStart(2, "0")}</span>
                    <span className="vp-track-artwork"><TrackArtwork track={track} /></span>
                    <span className="vp-track-details"><span className="vp-track-title">{track.title}</span><span className="vp-track-artist">{track.artist}</span></span>
                    <span className={`vp-track-indicator${isCurrent ? " is-current" : ""}`} aria-hidden="true"><Icon name={isCurrent ? "record" : "play"} size={isCurrent ? 18 : 13} /></span>
                  </button>
                </li>
              );
            })}
          </ol>

          {tracks.length === 0 && <p className="vp-empty-playlist">Плейлист пока пуст 💕</p>}

          <div className={`vp-source-note${status === "error" || fileError ? " has-error" : ""}`}>
            <div className="vp-source-message" role="status" aria-live="polite" aria-atomic="true">
              <Icon name={currentTrack?.src && status !== "error" ? "music" : "record"} size={19} />
              <div>
                <p className="vp-source-title">{fileError ? "Попробуем другой файл" : statusLabels[status]}</p>
                <p className="vp-source-description" title={sourceDescription}>{sourceDescription}</p>
              </div>
            </div>
            {allowLocalFiles && (
              <div className="vp-file-action">
                <button type="button" className="vp-upload-button" onClick={() => fileInputRef.current?.click()} disabled={!currentTrack} aria-label={`Выбрать аудиофайл для ${currentTrack?.title ?? "трека"}`}>
                  <Icon name="upload" size={14} />
                  <span>{currentTrack?.src ? "Сменить аудиофайл" : "Добавить трек"}</span>
                </button>
                <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.flac,.aiff,.webm,.opus" className="vp-file-input" tabIndex={-1} aria-label="Локальный аудиофайл" onChange={chooseFile} />
                <p className="vp-file-privacy">Только на твоём устройстве.</p>
              </div>
            )}
          </div>

          <RibbonSignature />
        </aside>
      </div>
    </section>
  );
}