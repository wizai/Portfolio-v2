import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

gsap.registerPlugin(ScrollTrigger);

let rafCallback: ((time: number) => void) | null = null;

const initGlobalParallaxes = (): void => {
  const wrappers = document.querySelectorAll(".media-wrapper");
  wrappers.forEach((wrapper) => {
    const target = wrapper.querySelector(".media-target");
    if (!target) return;

    gsap.fromTo(target,
      { transform: "translate3d(0, -8%, 0)" },
      {
        transform: "translate3d(0, 8%, 0)",
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      },
    );
  });
};

const getTextTiming = (speed: string | undefined): { wordStagger: number; duration: number } => {
  if (speed === 'fast') {
    return { wordStagger: 0.015, duration: 0.85 };
  }
  return { wordStagger: 0.03, duration: 1.2 };
};

const splitIntoWords = (element: HTMLElement): HTMLElement[] | null => {
  if (element.classList.contains('splitted')) return null;

  const split = new SplitType(element, { types: 'words' });
  if (!split.words) return null;

  element.classList.add('splitted');

  const targetsToAnimate: HTMLElement[] = [];

  split.words.forEach((word) => {
    const wordHTML = word.innerHTML;
    word.innerHTML = '';

    word.style.display = 'inline-block';
    word.style.overflow = 'hidden';
    word.style.verticalAlign = 'top';
    word.style.margin = '-0.25em -0.3em';

    const textSpan = document.createElement('span');
    textSpan.style.display = 'inline-block';
    textSpan.style.verticalAlign = 'top';
    textSpan.style.padding = '0.25em 0.3em';
    textSpan.innerHTML = wordHTML;

    word.appendChild(textSpan);
    targetsToAnimate.push(textSpan);
  });

  return targetsToAnimate;
};

const isHeroText = (element: HTMLElement): boolean =>
  element.hasAttribute('data-hero') || !!element.closest('section')?.matches(':first-of-type');

const initHeroTextReveal = (element: HTMLElement): void => {
  const targets = splitIntoWords(element);
  if (!targets) return;

  const customDelay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;
  const { wordStagger, duration } = getTextTiming(element.dataset.speed);

  gsap.fromTo(targets,
    { transform: "translate3d(0, 105%, 0)" },
    {
      transform: "translate3d(0, 0%, 0)",
      duration,
      delay: customDelay,
      ease: 'power3.out',
      force3D: true,
      stagger: wordStagger,
    }
  );
};

const initReveals = (): void => {
  const groups = new Map<string, { triggerEl: HTMLElement; items: HTMLElement[] }>();
  let autoKeyCounter = 0;

  document.querySelectorAll<HTMLElement>('.reveal-block, .reveal-text').forEach((el) => {
    if (el.classList.contains('reveal-text') && isHeroText(el)) {
      initHeroTextReveal(el);
      return;
    }

    const triggerSelector = el.dataset.trigger;
    let key: string;
    let triggerEl: HTMLElement;

    if (triggerSelector) {
      key = triggerSelector;
      triggerEl = (document.querySelector(triggerSelector) as HTMLElement) ?? el;
    } else {
      key = `__self-${autoKeyCounter++}`;
      triggerEl = el;
    }

    if (!groups.has(key)) {
      groups.set(key, { triggerEl, items: [] });
    }
    groups.get(key)!.items.push(el);
  });

  const startGroup = (triggerEl: HTMLElement, items: HTMLElement[]): void => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top 98%',
        toggleActions: 'play none none none',
      },
    });

    items.forEach((el) => {
      const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;

      if (el.classList.contains('reveal-text')) {
        const targets = splitIntoWords(el);
        if (!targets) return;
        const { wordStagger, duration } = getTextTiming(el.dataset.speed);

        tl.fromTo(targets,
          { transform: 'translate3d(0, 105%, 0)' },
          {
            transform: 'translate3d(0, 0%, 0)',
            duration,
            delay,
            ease: 'power3.out',
            force3D: true,
            stagger: wordStagger,
          },
          0
        );
      } else {
        tl.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay,
            ease: 'power3.out',
            force3D: true,
            clearProps: 'transform,opacity',
          },
          0
        );
      }
    });
  };

  groups.forEach(({ triggerEl, items }) => {
    const pendingVideos = items
      .flatMap((el) => Array.from(el.querySelectorAll('video')))
      .filter((video) => video.readyState < 2);

    if (pendingVideos.length === 0) {
      startGroup(triggerEl, items);
      return;
    }

    let remaining = pendingVideos.length;
    pendingVideos.forEach((video) => {
      video.addEventListener(
        'loadeddata',
        () => {
          remaining -= 1;
          if (remaining === 0) startGroup(triggerEl, items);
        },
        { once: true },
      );
    });
  });
};

const initHeaderReveal = (): void => {
  const headerItems = document.querySelectorAll('.reveal-header-item');
  if (headerItems.length === 0) return;

  gsap.fromTo(headerItems,
    {
      transform: "translate3d(0, 105%, 0)"
    },
    {
      transform: "translate3d(0, 0%, 0)",
      duration: 1.2,
      delay: 0.15,
      ease: 'power3.out',
      force3D: true,
      stagger: 0.08,
    }
  );
};

export const initSmoothScroll = (): void => {
  if (typeof window === 'undefined') return;

  const typedWindow = window as typeof window & { lenis?: Lenis };

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  if (rafCallback) {
    gsap.ticker.remove(rafCallback);
    rafCallback = null;
  }
  typedWindow.lenis?.destroy();

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  rafCallback = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(rafCallback);
  gsap.ticker.lagSmoothing(0);

  initGlobalParallaxes();
  initReveals();
  initHeaderReveal();

  ScrollTrigger.refresh();

  typedWindow.lenis = lenis;

  document.dispatchEvent(new CustomEvent('page-transition:ready'));
};

document.addEventListener('astro:after-swap', (event: any) => {
  const typedWindow = window as typeof window & { lenis?: Lenis };
  if (event.direction !== 'traverse') {
    typedWindow.lenis?.scrollTo(0, { immediate: true });
  }
});

document.addEventListener('astro:page-load', initSmoothScroll);