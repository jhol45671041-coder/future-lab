import { motion } from 'framer-motion';

import FadingVideo from './FadingVideo';
import { ImageIcon, LightbulbIcon, MovieIcon } from './Icons';
import type { SVGProps } from 'react';

const CAPABILITIES_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4';

type Capability = {
  title: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  tags: string[];
  body: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: 'Design',
    Icon: ImageIcon,
    tags: ['Brand Systems', 'Art Direction', 'Visual Identity', 'Motion'],
    body: 'We shape identities and interfaces that feel unmistakably yours — typographic systems, component libraries, and art-directed pages that scale without losing soul.',
  },
  {
    title: 'Engineering',
    Icon: MovieIcon,
    tags: ['React', 'Next.js', 'Headless CMS', 'Edge-Ready'],
    body: 'Production-grade front-ends built on modern stacks. Performant, accessible, and instrumented — with code your team will enjoy extending long after launch.',
  },
  {
    title: 'Growth',
    Icon: LightbulbIcon,
    tags: ['SEO', 'Analytics', 'A/B Testing', 'Retention'],
    body: 'Launch is the starting line. We partner with your team on conversion, content, and iteration loops that turn a beautiful site into a compounding asset.',
  },
];

const reveal = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  whileInView: { filter: 'blur(0px)', opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: 'easeOut' as const, delay },
});

export default function Capabilities() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Background video */}
      <FadingVideo
        src={CAPABILITIES_VIDEO}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        {/* Header */}
        <div className="mb-auto">
          <p className="mb-6 font-body text-sm text-white/80">// Capabilities</p>
          <h2 className="whitespace-pre-line font-heading text-6xl italic leading-[0.9] tracking-[-3px] md:text-7xl lg:text-[6rem]">
            {'Studio craft,\nend to end'}
          </h2>
        </div>

        {/* Cards grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CAPABILITIES.map(({ title, Icon, tags, body }, i) => (
            <motion.article
              key={title}
              {...reveal(0.15 * i)}
              className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem]">
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <div className="flex flex-wrap justify-end gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 font-body text-[11px] text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <div>
                <h3 className="font-heading text-3xl italic leading-none tracking-[-1px] md:text-4xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-[32ch] font-body text-sm font-light leading-snug text-white/90">
                  {body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
