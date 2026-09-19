import { motion } from 'framer-motion';

import BlurText from './BlurText';
import FadingVideo from './FadingVideo';
import { ArrowUpRightIcon, ClockIcon, GlobeIcon, PlayIcon } from './Icons';

const NAV_LINKS = ['Work', 'Studio', 'Services', 'Journal', 'Contact'];
const LOGOS = ['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno'];

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

/** Shared entrance: blur + rise, staggered per element. */
const reveal = (delay: number) => ({
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' as const, delay },
});

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background video */}
      <FadingVideo
        src={HERO_VIDEO}
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: '120%', height: '120%' }}
      />

      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-4 z-50 flex items-center justify-between px-8 lg:px-16">
        <a
          href="#top"
          aria-label="Future Lab home"
          className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full"
        >
          <span className="font-heading text-2xl italic leading-none">a</span>
        </a>

        <div className="liquid-glass hidden items-center gap-1 rounded-full px-1.5 py-1.5 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="px-3 py-2 font-body text-sm font-medium text-white/90 transition-colors duration-200 hover:text-white"
            >
              {link}
            </a>
          ))}
          <button
            type="button"
            className="ml-1 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-body text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.03]"
          >
            Start a Project
            <ArrowUpRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="h-12 w-12" aria-hidden="true" />
      </nav>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          {/* Badge */}
          <motion.div
            {...reveal(0.4)}
            className="liquid-glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4"
          >
            <span className="rounded-full bg-white px-2.5 py-1 font-body text-[11px] font-medium leading-none text-black">
              New
            </span>
            <span className="font-body text-xs font-light text-white/90 md:text-sm">
              Booking Q3 2026 engagements — limited capacity
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mt-6 max-w-3xl">
            <BlurText
              text="Crafted Digital Experiences Built to Outlast Trends"
              delay={300}
              className="font-heading text-6xl italic leading-[0.8] tracking-[-4px] text-white md:text-7xl lg:text-[5.5rem]"
            />
          </div>

          {/* Subtext */}
          <motion.p
            {...reveal(0.8)}
            className="mt-4 max-w-2xl font-body text-sm font-light leading-tight text-white md:text-base"
          >
            We are a small studio of designers and engineers shaping brand-defining websites for
            ambitious companies. Precise typography, cinematic motion, and code you can be proud
            of.
          </motion.p>

          {/* CTA buttons */}
          <motion.div {...reveal(1.1)} className="mt-6 flex items-center gap-6">
            <button
              type="button"
              className="liquid-glass-strong flex items-center gap-1.5 rounded-full px-5 py-2.5 font-body text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              Start a Project
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 font-body text-sm font-light text-white/90 transition-colors duration-200 hover:text-white"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Watch Showreel
            </button>
          </motion.div>

          {/* Stats cards */}
          <motion.div {...reveal(1.3)} className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <ClockIcon className="h-5 w-5 text-white/90" />
              <p className="mt-4 font-heading text-4xl italic leading-none tracking-[-1px]">
                6 Weeks
              </p>
              <p className="mt-2 font-body text-xs font-light leading-snug text-white/80">
                Average End-to-End Launch Time
              </p>
            </div>

            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <GlobeIcon className="h-5 w-5 text-white/90" />
              <p className="mt-4 font-heading text-4xl italic leading-none tracking-[-1px]">
                140+
              </p>
              <p className="mt-2 font-body text-xs font-light leading-snug text-white/80">
                Brands Shipped Across Four Continents
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom trust bar */}
        <motion.div
          {...reveal(1.4)}
          className="flex flex-col items-center gap-4 pb-8"
        >
          <div className="liquid-glass rounded-full px-4 py-2">
            <p className="font-body text-[11px] font-light text-white/80 md:text-xs">
              Trusted by founders, operators, and creative directors worldwide
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12 px-6 md:gap-16">
            {LOGOS.map((logo) => (
              <span
                key={logo}
                className="font-heading text-2xl italic tracking-tight text-white md:text-3xl"
              >
                {logo}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
