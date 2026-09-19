import { useEffect, useRef, useState, type CSSProperties } from 'react';

type FadingVideoProps = {
  /** A single src, or a list of srcs that cycle endlessly. */
  src: string | string[];
  className?: string;
  style?: CSSProperties;
};

const FADE_IN_MS = 500;
const FADE_OUT_MS = 550;
/** Start fading out this many seconds before the clip ends. */
const FADE_OUT_LEAD = 0.55;

/**
 * A <video> that fades in once it has data and fades out just before the clip
 * ends, so loops never hard-cut. Single sources restart, arrays advance.
 */
export default function FadingVideo({ src, className, style }: FadingVideoProps) {
  const sources = Array.isArray(src) ? src : [src];
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0);

  const cancelFade = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  /** Animate opacity from its current value to `to` over `duration` ms. */
  const fade = (to: number, duration: number) => {
    const video = videoRef.current;
    if (!video) return;

    cancelFade();

    const from = Number.parseFloat(video.style.opacity || '0') || 0;
    if (from === to) {
      setOpacity(to);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;

      setOpacity(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(step);
  };

  // Reset to invisible whenever the source changes, and force a reload so the
  // next clip starts fetching immediately instead of sitting idle.
  const hasMounted = useRef(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setOpacity(0);
    if (video) {
      video.style.opacity = '0';
      video.load();
    }
  }, [index]);

  useEffect(() => cancelFade, []);

  const handleLoadedData = () => fade(1, FADE_IN_MS);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const remaining = video.duration - video.currentTime;
    if (remaining <= FADE_OUT_LEAD) {
      fade(0, FADE_OUT_MS);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    if (sources.length > 1) {
      setIndex((current) => (current + 1) % sources.length);
      return;
    }

    video.currentTime = 0;
    void video.play();
    fade(1, FADE_IN_MS);
  };

  return (
    <video
      ref={videoRef}
      key={sources[index]}
      src={sources[index]}
      className={className}
      style={{ ...style, opacity }}
      autoPlay
      muted
      playsInline
      preload="auto"
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}
