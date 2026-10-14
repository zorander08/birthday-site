import { memo, useEffect, useId, useRef, useState } from "react";
import type { RefObject, SVGProps } from "react";
import type { VinylTrack } from "./tracks";

interface ArtworkProps extends SVGProps<SVGSVGElement> {
  track?: VinylTrack;
}

export const TrackArtwork = memo(function TrackArtwork({ track, ...props }: ArtworkProps) {
  const id = useId().replace(/:/g, "");
  const [failedCover, setFailedCover] = useState<string>();
  const [loadedCover, setLoadedCover] = useState<string>();
  const style = track?.artwork ?? "rose";
  const fullTitle = (track?.title || "with love").toLowerCase();
  const title = fullTitle.length > 28 ? `${fullTitle.slice(0, 25)}...` : fullTitle;
  const words = title.split(/\s+/);
  const split = words.length > 1 ? Math.ceil(words.length / 2) : 0;
  const firstLine = words.slice(0, split).join(" ");
  const secondLine = words.slice(split).join(" ");
  const titleSize = (maximum: number, text = title) => Math.min(maximum, 200 / Math.max(1, text.length));

  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`${id}-rose`} x1="10" y1="0" x2="83" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dfadc1" /><stop offset=".52" stopColor="#efcdd8" /><stop offset="1" stopColor="#f4dfd6" />
        </linearGradient>
        <linearGradient id={`${id}-golden`} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e6b890" /><stop offset=".6" stopColor="#f3d7a7" /><stop offset="1" stopColor="#c79079" />
        </linearGradient>
        <linearGradient id={`${id}-garden`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bdc9b9" /><stop offset="1" stopColor="#e7e5cd" />
        </linearGradient>
        <linearGradient id={`${id}-moon`} x1="40" y1="0" x2="55" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#747589" /><stop offset=".6" stopColor="#a49dad" /><stop offset="1" stopColor="#c8b3b4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-${style})`} />

      {style === "rose" && (
        <>
          <path d="M-10 27c14-10 21 3 35-3 19-9 26 8 41 0 18-10 24 3 42-6v15c-17 7-29-3-41 4-21 10-29-6-42 0-13 6-25 0-35 5Z" fill="#fff5ee" opacity=".33" />
          <path d="M-3 79c17-11 29 3 48-4 21-8 27 0 59-8v36H-3Z" fill="#f8e2dc" opacity=".52" />
          <circle cx="76" cy="24" r="11" fill="#f9e4d8" opacity=".65" />
          <g stroke="#997977" strokeWidth=".65" strokeLinecap="round">
            <path d="M51 51c3-7 4-12 3-19M53 43c-7 0-10-3-11-7 7 0 10 3 11 7ZM54 39c7-1 9-5 10-8-7 0-10 4-10 8Z" fill="#adb49a" />
            <path d="M54 34c-7 1-11-3-10-7-3-5 2-10 7-8 4-4 10-1 10 3 5 2 5 8 0 10-1 3-4 4-7 2Z" fill="#cd819c" />
            <path d="M49 27c-1-5 5-6 8-3 4 4-1 9-5 7-4-2-3-7 1-7 3 0 3 4 1 4" stroke="#f4cfda" />
          </g>
          <g fill="#fcf4e9" opacity=".9"><path d="m24 48 1.3 3.7 3.7 1.3-3.7 1.3L24 58l-1.3-3.7L19 53l3.7-1.3Z" /><circle cx="72" cy="48" r="1.1" /><circle cx="31" cy="26" r=".9" /></g>
          <text x="50" y="72" textAnchor="middle" fill="#8c4f69" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize={titleSize(26)}>{title}</text>
          <text x="50" y="83" textAnchor="middle" fill="#a36b7e" fontFamily="Arial, sans-serif" fontSize="3.7" letterSpacing="1.7">A LITTLE LOVE LETTER</text>
        </>
      )}

      {style === "golden" && (
        <>
          <circle cx="52" cy="36" r="20" fill="#fff0c7" opacity=".85" />
          <circle cx="52" cy="36" r="24" stroke="#fff3d2" strokeWidth=".6" opacity=".6" />
          <path d="M0 66 26 42 55 67 76 48 100 69v31H0Z" fill="#b78f7f" />
          <path d="m0 77 28-20 27 15 27-15 18 9v34H0Z" fill="#a67d72" />
          <path d="M0 87c24-13 44-2 68-13 13-6 23-4 32 1v25H0Z" fill="#d4ac8d" />
          <path d="m19 27 3-4m53 0 3 4M50 8v5M30 12l2 5m36-5-2 5" stroke="#f7e4bb" strokeWidth=".8" strokeLinecap="round" />
          <text x="50" y="70" textAnchor="middle" fill="#fff1dc" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize={titleSize(18)}>{title}</text>
          <text x="50" y="82" textAnchor="middle" fill="#f9e4c8" fontFamily="Arial, sans-serif" fontSize="3.8" letterSpacing="1.7">EVERYTHING GLOWS</text>
        </>
      )}

      {style === "garden" && (
        <>
          <circle cx="69" cy="29" r="17" fill="#f1dfc5" opacity=".85" />
          <g stroke="#7f927a" strokeWidth=".7">
            <path d="M14 103C34 76 19 41 38 17M82 103c-6-28 4-47-12-72" />
            <path d="M25 74C9 73 8 63 11 58c12 2 16 8 14 16ZM25 61c16-4 16-12 14-18-12 5-15 10-14 18ZM26 45c-12-4-13-12-10-17 10 3 13 9 10 17ZM31 31c11-2 15-9 12-15-9 2-13 7-12 15ZM78 82c-11-1-18-7-16-14 12 2 17 7 16 14ZM79 65c13-7 14-13 11-19-10 4-14 11-11 19ZM77 52c-10-1-15-7-14-13 11 2 14 7 14 13Z" fill="#a0ae91" />
          </g>
          <g fill="#f7e7d6"><circle cx="35" cy="20" r="4" /><circle cx="31" cy="22" r="3" /><circle cx="35" cy="25" r="3.5" /><circle cx="39" cy="22" r="3" /><circle cx="35" cy="22" r="1.5" fill="#ceae7e" /></g>
          <text x="51" y="53" textAnchor="middle" fill="#586a58" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize={titleSize(14, firstLine)}>{firstLine}</text>
          <text x="51" y="67" textAnchor="middle" fill="#586a58" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize={titleSize(17, secondLine)}>{secondLine}</text>
          <text x="51" y="79" textAnchor="middle" fill="#75816d" fontFamily="Arial, sans-serif" fontSize="3.5" letterSpacing="1.2">RIGHT WHERE I BELONG</text>
        </>
      )}

      {style === "moon" && (
        <>
          <path d="M62 16a17 17 0 1 0 14 25 15 15 0 0 1-14-25Z" fill="#f2e3cd" />
          <g fill="#eee0d9" opacity=".8"><circle cx="25" cy="23" r=".8" /><circle cx="40" cy="12" r=".7" /><circle cx="81" cy="55" r=".8" /><circle cx="32" cy="42" r=".8" /><path d="m18 51 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" /></g>
          <path d="M0 73c22-8 35 7 56 0 23-8 29-2 44 1v26H0Z" fill="#838493" opacity=".6" />
          <path d="M0 85c22-8 35 7 56 0 23-8 29-2 44 1" stroke="#d3bdc4" strokeWidth=".6" />
          <path d="M0 92c22-8 35 7 56 0 23-8 29-2 44 1" stroke="#d3bdc4" strokeWidth=".6" />
          <text x="50" y="69" textAnchor="middle" fill="#fff0e6" fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize={titleSize(21)}>{title}</text>
          <text x="50" y="80" textAnchor="middle" fill="#ead8d7" fontFamily="Arial, sans-serif" fontSize="3.4" letterSpacing="1.4">ALWAYS, SOMEHOW, YOU</text>
        </>
      )}

      <rect x="5" y="5" width="90" height="90" rx="1" stroke="#fff9ed" strokeWidth=".65" opacity=".5" />
      {track?.cover && failedCover !== track.cover && (
        <image
          href={track.cover}
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          className="vp-custom-artwork"
          style={{ opacity: loadedCover === track.cover ? 1 : 0 }}
          onLoad={() => setLoadedCover(track.cover)}
          onError={() => setFailedCover(track.cover)}
        />
      )}
    </svg>
  );
});

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useVinylRotation(ref: RefObject<SVGGElement | null>, playing: boolean, reduced: boolean) {
  const angle = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    if (reduced) {
      velocity.current = 0;
      return;
    }

    let frame = 0;
    let lastTime: number | undefined;
    const target = playing ? 144 : 0;

    // Only the SVG transform changes per frame. Audio progress never drives this clock.
    const tick = (time: number) => {
      const delta = lastTime === undefined ? 0 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      velocity.current += (target - velocity.current) * (1 - Math.exp(-delta * (playing ? 4 : 5.5)));
      angle.current = (angle.current + velocity.current * delta) % 360;
      if (ref.current) ref.current.style.transform = `rotate(${angle.current}deg)`;

      if (playing || velocity.current > 0.15) frame = requestAnimationFrame(tick);
      else velocity.current = 0;
    };

    if (playing || velocity.current > 0) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reduced, ref]);
}

const grooves = Array.from({ length: 94 }, (_, index) => 63.5 + index * 1.205);
const screwPositions = [[43, 41], [616, 41], [43, 387], [616, 387]];

interface TurntableProps {
  track?: VinylTrack;
  isPlaying: boolean;
}

export const Turntable = memo(function Turntable({ track, isPlaying }: TurntableProps) {
  const id = useId().replace(/:/g, "");
  const recordRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();
  useVinylRotation(recordRef, isPlaying, reducedMotion);

  return (
    <div className={`vp-turntable${isPlaying ? " is-playing" : ""}`}>
      <svg className="vp-deck" viewBox="0 0 660 452" role="img" aria-label={`A pearl-blush turntable${track ? ` with the ${track.title} record` : ""}. ${isPlaying ? "The record is playing." : "The tonearm is at rest."}`}>
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#edd8d2" /><stop offset=".85" stopColor="#d9bcb7" /><stop offset="1" stopColor="#c7a2a3" />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2=".7" y2="1">
            <stop stopColor="#fffaf1" /><stop offset=".4" stopColor="#f0dcd5" /><stop offset="1" stopColor="#dec3bd" />
          </linearGradient>
          <linearGradient id={`${id}-surface`} x1=".2" y1="0" x2=".8" y2="1">
            <stop stopColor="#f7eae4" /><stop offset=".55" stopColor="#f0e0d9" /><stop offset="1" stopColor="#e9d5d0" />
          </linearGradient>
          <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2=".25">
            <stop stopColor="#ae9183" /><stop offset=".2" stopColor="#e0c6ae" /><stop offset=".42" stopColor="#fff6e3" /><stop offset=".58" stopColor="#f0dfc7" /><stop offset=".82" stopColor="#b89b88" /><stop offset="1" stopColor="#d2b4a0" />
          </linearGradient>
          <linearGradient id={`${id}-arm`} x1="511" y1="180" x2="551" y2="189" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9b7e71" /><stop offset=".22" stopColor="#d4b7a2" /><stop offset=".48" stopColor="#fff7e4" /><stop offset=".66" stopColor="#e1c7ae" /><stop offset="1" stopColor="#a08679" />
          </linearGradient>
          <radialGradient id={`${id}-platter`} cx=".4" cy=".35" r=".7">
            <stop offset=".85" stopColor="#7e716f" /><stop offset=".925" stopColor="#d8bdb1" /><stop offset=".957" stopColor="#fbebd9" /><stop offset=".975" stopColor="#b69a8c" /><stop offset="1" stopColor="#756764" />
          </radialGradient>
          <radialGradient id={`${id}-vinyl`} cx=".46" cy=".4" r=".64">
            <stop stopColor="#302930" /><stop offset=".45" stopColor="#282329" /><stop offset=".78" stopColor="#252127" /><stop offset="1" stopColor="#17171a" />
          </radialGradient>
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e5d7db" stopOpacity=".16" /><stop offset=".45" stopColor="#d5bdc6" stopOpacity=".02" /><stop offset=".73" stopColor="#fff4f4" stopOpacity=".12" /><stop offset="1" stopColor="#e4c5d2" stopOpacity=".02" />
          </linearGradient>
          <radialGradient id={`${id}-spindle`} cx=".32" cy=".25" r=".75">
            <stop stopColor="#fffdf4" /><stop offset=".25" stopColor="#f5e9d8" /><stop offset=".6" stopColor="#c6ab97" /><stop offset="1" stopColor="#7c6863" />
          </radialGradient>
          <filter id={`${id}-platter-shadow`} x="-15%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="1" dy="5" stdDeviation="4" floodColor="#79585c" floodOpacity=".24" />
          </filter>
          <filter id={`${id}-arm-shadow`} x="-80%" y="-40%" width="280%" height="220%">
            <feDropShadow dx="3" dy="4" stdDeviation="2" floodColor="#705652" floodOpacity=".27" />
          </filter>
          <clipPath id={`${id}-disc-clip`}><circle cx="254" cy="210" r="177" /></clipPath>
          <clipPath id={`${id}-label-clip`}><circle cx="254" cy="210" r="55.5" /></clipPath>
          <pattern id={`${id}-texture`} width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".38" fill="#b28f88" opacity=".12" /><circle cx="3.5" cy="3" r=".32" fill="#fffaf0" opacity=".65" />
          </pattern>
        </defs>

        <ellipse cx="330" cy="432" rx="282" ry="10" fill="#947379" opacity=".07" />
        <rect x="78" y="418" width="67" height="20" rx="7" fill="#8e7473" />
        <rect x="512" y="418" width="67" height="20" rx="7" fill="#8e7473" />
        <path d="M82 428h59m375 0h59" stroke="#b99a94" strokeWidth="3" />
        <rect x="14" y="22" width="632" height="409" rx="30" fill={`url(#${id}-body)`} stroke="#c8a7a4" strokeWidth="1" />
        <rect x="14" y="11" width="632" height="408" rx="29" fill={`url(#${id}-rim)`} stroke="#d9bfba" strokeWidth="1" />
        <rect x="19" y="15" width="622" height="397" rx="26" fill="none" stroke="#fff9ee" strokeWidth="1.5" opacity=".8" />
        <rect x="27" y="24" width="606" height="376" rx="20" fill={`url(#${id}-surface)`} stroke="#d6bcb6" strokeWidth=".8" />
        <rect x="28" y="25" width="604" height="374" rx="19" fill={`url(#${id}-texture)`} />
        <path d="M52 25h555c14 0 25 10 25 24" fill="none" stroke="#fffaf0" strokeWidth="1.4" opacity=".85" />
        <path d="M38 406h581" stroke="#e2c8c1" strokeWidth=".7" />
        <text x="53" y="420" fill="#967472" fontFamily="Arial, sans-serif" fontSize="6.4" letterSpacing="2.9">LOVE, ON REPEAT.</text>
        <text x="606" y="420" textAnchor="end" fill="#a3827e" fontFamily="Arial, sans-serif" fontSize="5.7" letterSpacing="1.8">AN ANALOG LOVE AFFAIR</text>

        {screwPositions.map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y}) rotate(${index * 27 + 24})`}>
            <circle r="4" fill="#ceb4a4" stroke="#b79a91" strokeWidth=".6" />
            <circle r="3" fill={`url(#${id}-metal)`} />
            <path d="M-1.8 0h3.6" stroke="#927c72" strokeWidth=".75" />
            <path d="M-1.6 .8h3.2" stroke="#fff4dd" strokeWidth=".4" opacity=".7" />
          </g>
        ))}

        <circle cx="254" cy="210" r="187" fill={`url(#${id}-platter)`} filter={`url(#${id}-platter-shadow)`} />
        <circle cx="254" cy="210" r="182.5" fill="none" stroke="#ead7c8" strokeWidth=".6" />
        <circle cx="254" cy="210" r="180.5" fill="#151519" stroke="#8c7475" strokeWidth="1" />

        <g ref={recordRef} className="vp-record">
          <circle cx="254" cy="210" r="178" fill={`url(#${id}-vinyl)`} />
          <g clipPath={`url(#${id}-disc-clip)`}>
            <path d="M254 210 158 24 224 16 279 21Z" fill={`url(#${id}-shine)`} />
            <path d="M254 210 355 383 296 405 225 389Z" fill={`url(#${id}-shine)`} opacity=".9" />
            <path d="M254 210 54 157 68 98 106 68Z" fill="#07080a" opacity=".24" />
            <path d="M254 210 449 249 430 308 401 337Z" fill="#08080b" opacity=".22" />
            {grooves.map((radius, index) => (
              <circle
                key={index}
                cx="254"
                cy="210"
                r={radius}
                fill="none"
                stroke={index % 4 === 0 ? "#cbb6c0" : "#9b8793"}
                strokeWidth={index % 7 === 0 ? ".7" : ".4"}
                opacity={index % 3 === 0 ? ".2" : ".1"}
              />
            ))}
            {[82, 112, 143, 166].map((radius) => <circle key={radius} cx="254" cy="210" r={radius} fill="none" stroke="#07090d" strokeWidth="2" opacity=".32" />)}
            <path d="M140 76a176 176 0 0 1 147-39M369 343a176 176 0 0 1-143 40" stroke="#eee1e8" strokeWidth=".65" opacity=".2" />
          </g>
          <circle cx="254" cy="210" r="177" fill="none" stroke="#84717b" strokeWidth=".65" opacity=".6" />
          <circle cx="254" cy="210" r="61.5" fill="#17171b" stroke="#79616b" strokeWidth=".75" />
          <g key={track?.id ?? "empty"} className="vp-record-label">
            <circle cx="254" cy="210" r="59" fill="#f0d5d6" stroke="#efdaca" strokeWidth=".75" />
            <g clipPath={`url(#${id}-label-clip)`}>
              <TrackArtwork track={track} x="198" y="154" width="112" height="112" />
            </g>
            <circle cx="254" cy="210" r="55.6" fill="none" stroke="#fcf3df" strokeWidth=".65" opacity=".75" />
            <circle cx="254" cy="210" r="57.5" fill="none" stroke="#aa7b83" strokeWidth=".35" opacity=".65" />
          </g>
        </g>

        <circle cx="254.5" cy="211" r="7.3" fill="#74565c" opacity=".25" />
        <circle cx="254" cy="210" r="6.2" fill={`url(#${id}-spindle)`} stroke="#ab8d7e" strokeWidth=".5" />
        <circle cx="253.1" cy="208.6" r="2.6" fill="#fff9e9" opacity=".7" />
        <circle cx="254" cy="210" r="1.7" fill="#ad958a" />

        <g className="vp-arm-rest" transform="translate(-15 0)">
          <rect x="517" y="263" width="27" height="33" rx="5" fill="#d4b8ab" stroke="#b99c90" strokeWidth=".8" />
          <rect x="521" y="266" width="19" height="25" rx="4" fill={`url(#${id}-metal)`} />
          <path d="M523 271v11q0 5 6 5t6-5v-11" stroke="#8d756d" strokeWidth="2" fill="none" />
          <circle cx="530" cy="269" r="2.1" fill="#f6e7d2" stroke="#b19b87" strokeWidth=".5" />
        </g>

        <circle cx="548" cy="95" r="31" fill="#d9bfb3" stroke="#c3a496" strokeWidth=".8" />
        <circle cx="548" cy="95" r="27" fill={`url(#${id}-metal)`} stroke="#f9ead9" strokeWidth="1" />
        <circle cx="548" cy="95" r="22.5" fill="#c4a591" stroke="#a58a7d" strokeWidth=".5" />
        <path d="M523 92a25 25 0 0 1 25-22" fill="none" stroke="#fff5df" strokeWidth="1.5" opacity=".8" />
        <circle cx="525.5" cy="109" r="2.2" fill="#a28a7d" stroke="#ead9c4" strokeWidth=".6" />
        <circle cx="571" cy="81" r="2.2" fill="#a28a7d" stroke="#ead9c4" strokeWidth=".6" />

        <g className="vp-tonearm">
          <g key={track?.id ?? "resting"} filter={`url(#${id}-arm-shadow)`} className="vp-tonearm-mechanism">
            <rect x="541" y="40" width="14" height="44" rx="4" fill="#9a8074" />
            <rect x="533" y="42" width="30" height="31" rx="4" fill={`url(#${id}-metal)`} stroke="#a88b79" strokeWidth=".8" />
            {[47, 51, 55, 59, 63, 67].map((y) => <path key={y} d={`M535 ${y}h26`} stroke="#8b7468" strokeWidth=".55" opacity=".45" />)}
            <path d="M548 91v39c0 11-2 15-5 26l-28 122c-3 12-3 15 3 25l5 8" fill="none" stroke="#9e8174" strokeWidth="9" strokeLinecap="round" />
            <path d="M548 91v39c0 11-2 15-5 26l-28 122c-3 12-3 15 3 25l5 8" fill="none" stroke={`url(#${id}-arm)`} strokeWidth="7" strokeLinecap="round" />
            <path d="M546.5 104v27c0 9-2 14-5 26l-28 121c-2 10-2 15 2 22" fill="none" stroke="#fff6e2" strokeWidth="1.35" strokeLinecap="round" opacity=".9" />
            <circle cx="548" cy="95" r="15" fill={`url(#${id}-metal)`} stroke="#b29884" strokeWidth=".7" />
            <circle cx="548" cy="95" r="10.5" fill="#ddc4ab" stroke="#fff1d9" strokeWidth=".8" />
            <circle cx="548" cy="95" r="6" fill={`url(#${id}-spindle)`} />
            <path d="M545 95h6" stroke="#887367" strokeWidth=".8" transform="rotate(-35 548 95)" />
            <g transform="rotate(-15 523 315)" className="vp-cartridge">
              <path d="M513 304h21v25h-21Z" fill={`url(#${id}-metal)`} stroke="#a58774" strokeWidth=".8" />
              <path d="M513 305h21v5h-21Z" fill="#f4e2cc" />
              <path d="M511 327h25v10h-25Z" fill="#775b5c" stroke="#5f4a4c" strokeWidth=".65" />
              <path d="M515 329h17v6h-17Z" fill="#b78185" />
              <path d="M517 337v5h9l2-5" fill="#a69081" stroke="#7f6a5f" strokeWidth=".75" />
              <path d="m522 342-2 5" stroke="#51404b" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="517" cy="315" r="1.4" fill="#a78a75" />
              <circle cx="530" cy="315" r="1.4" fill="#a78a75" />
              <path d="M534 308h9v9" stroke="#baa08a" strokeWidth="2.7" fill="none" strokeLinecap="round" />
              <path d="M534 307h9" stroke="#fff1d9" strokeWidth=".8" fill="none" />
            </g>
          </g>
        </g>

        <g transform="translate(583 326)">
          <circle cy="2" r="20.5" fill="#ac8b83" opacity=".25" />
          <circle r="20" fill={`url(#${id}-metal)`} stroke="#b99b89" strokeWidth=".8" />
          {Array.from({ length: 32 }, (_, index) => <path key={index} d="M0-19v2.5" transform={`rotate(${index * 11.25})`} stroke="#aa8e79" strokeWidth=".65" opacity=".6" />)}
          <circle r="15.5" fill="#ead8c5" stroke="#f9eddc" strokeWidth="1" />
          <path d="M0-11v5" stroke="#a17a77" strokeWidth="1.5" strokeLinecap="round" />
          <circle cy="1" r="4" fill="#ead6c1" stroke="#d2b9a2" strokeWidth=".5" />
        </g>
        <text x="583" y="359" textAnchor="middle" fill="#997975" fontFamily="Arial, sans-serif" fontSize="6" letterSpacing="1.5">33 1/3 RPM</text>
        <rect x="460" y="368" width="143" height="20" rx="2.5" fill="#ecd9cf" stroke="#d1b4a8" strokeWidth=".6" />
        <path d="M474 376c-3-4-7 0-4 3l4 3 4-3c3-3-1-7-4-3Z" fill="none" stroke="#b28187" strokeWidth=".7" />
        <text x="487" y="381" fill="#9d7976" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="1.8">HIGH FIDELITY LOVE</text>
        <circle cx="604" cy="282" r="3.5" fill="#c4a3a0" />
        <circle className="vp-power-light" cx="604" cy="282" r="2.3" fill={isPlaying ? "#b87982" : "#d7b2b3"} />
        <text x="604" y="270" textAnchor="middle" fill="#aa8782" fontFamily="Arial, sans-serif" fontSize="4.5" letterSpacing=".9">ON</text>
      </svg>
    </div>
  );
});