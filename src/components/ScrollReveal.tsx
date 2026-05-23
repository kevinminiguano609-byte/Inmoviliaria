import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  y?: number;
}

export default function ScrollReveal({ children, className = '', delay = 0, stagger = 0, y = 40 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    gsap.set(targets, { opacity: 0, y });

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          stagger: stagger || undefined,
          ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        });
      },
    });

    return () => { st.kill(); };
  }, [delay, stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
