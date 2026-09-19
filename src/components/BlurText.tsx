import { motion } from 'framer-motion';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '../lib/cn';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  /** Semantic wrapper tag. Defaults to a paragraph. */
  as?: 'p' | 'h1' | 'h2' | 'h3';
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
};

const STAGGER_STEP = 100; // ms between words
const WORD_DURATION = 0.7; // seconds per word

/**
 * Word-by-word blur-in reveal. Starts when the element scrolls into view.
 */
export default function BlurText({
  text = '',
  delay = 200,
  className,
  as = 'p',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
}: BlurTextProps) {
  const elements = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy],
  );

  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Words rise into place: 50 -> 0 by default, -50 -> 0 when direction is "bottom".
  const offset = direction === 'top' ? 50 : -50;

  return createElement(
    as,
    {
      ref,
      className: cn('flex flex-wrap justify-center', className),
      style: { rowGap: '0.1em' },
    },
    elements.map((segment, i) => (
      <motion.span
        key={`${segment}-${i}`}
        initial={{ filter: 'blur(10px)', opacity: 0, y: offset }}
        animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : undefined}
        transition={{
          duration: WORD_DURATION,
          ease: 'easeOut',
          delay: (i * STAGGER_STEP) / 1000 + delay / 1000,
        }}
        onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
        style={{
          display: 'inline-block',
          marginRight: '0.28em',
          willChange: 'transform, filter, opacity',
        }}
      >
        {segment}
      </motion.span>
    )),
  );
}
