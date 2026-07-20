/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";

type ScrollChoreographyProps = {
  remiSrc: string;
  varaFontSrc: string;
};

type SplitInstance = {
  chars: Element[];
  revert: () => void;
};

type SmoothScroller = {
  effects: (targets: Element[] | string, config: { speed: number; lag: number }) => unknown;
  kill: () => void;
  offset: (target: Element | string, position?: string) => number;
  scrollTop: () => number;
};

type MotionObserver = { kill: () => void };

export function ScrollChoreography({ remiSrc, varaFontSrc }: ScrollChoreographyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const word = wordRef.current;
    if (!section || !word) return;

    let disposed = false;
    let gsapContext: { revert: () => void } | undefined;
    let smoothScroller: SmoothScroller | undefined;
    let motionObserver: MotionObserver | undefined;
    const splitInstances: SplitInstance[] = [];
    const anchorCleanups: Array<() => void> = [];

    const setupMotion = async () => {
      const [gsapModule, scrollTriggerModule, scrollSmootherModule, scrollToModule, observerModule, splitTextModule, drawSvgModule, varaModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/ScrollSmoother"),
        import("gsap/ScrollToPlugin"),
        import("gsap/Observer"),
        import("gsap/SplitText"),
        import("gsap/DrawSVGPlugin"),
        import("vara"),
      ]);
      if (disposed) return;

      const gsap = gsapModule.gsap;
      const { ScrollTrigger } = scrollTriggerModule;
      const { ScrollSmoother } = scrollSmootherModule;
      const { ScrollToPlugin } = scrollToModule;
      const { Observer } = observerModule;
      const { SplitText } = splitTextModule;
      const { DrawSVGPlugin } = drawSvgModule;
      const Vara = varaModule.default;

      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, Observer, SplitText, DrawSVGPlugin);

      const hotFontSize = window.innerWidth < 600 ? 110 : 180;
      const hotStrokeWidth = window.innerWidth < 600 ? 4.1 : 4.8;
      const vara = new Vara(
        "#hot-word-drawing",
        varaFontSrc,
        [{
          text: "Hot",
          id: "hot-word",
          duration: 1,
          autoAnimation: false,
          textAlign: "center",
          y: 2,
        }],
        {
          autoAnimation: false,
          color: "#373737",
          fontSize: hotFontSize,
          strokeWidth: hotStrokeWidth,
          textAlign: "center",
        },
      );

      await new Promise<void>((resolve) => vara.ready(resolve));
      if (disposed) return;

      const wordSvg = word.querySelector("svg");
      const wordPaths = Array.from(word.querySelectorAll<SVGPathElement>("path"));
      if (wordSvg) {
        wordSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        wordSvg.setAttribute("aria-hidden", "true");
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        gsap.set(wordPaths, { drawSVG: "100%", opacity: 1 });
        return;
      }

      document.documentElement.classList.add("motion-ready");

      ScrollTrigger.config({ ignoreMobileResize: true });
      smoothScroller = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.15,
        effects: true,
        smoothTouch: 0.08,
        normalizeScroll: true,
        ignoreMobileResize: true,
      }) as SmoothScroller;

      const floaters = gsap.utils.toArray<Element>(".smooth-float");
      if (floaters.length) smoothScroller.effects(floaters, { speed: 0.92, lag: 0.12 });

      gsapContext = gsap.context(() => {
        const topChrome = document.querySelector<HTMLElement>("[data-top-chrome]");
        const announcement = document.querySelector<HTMLElement>(".announcement");
        const siteHeader = document.querySelector<HTMLElement>(".site-header");

        if (topChrome && announcement && siteHeader) {
          gsap.timeline({
            scrollTrigger: {
              trigger: "#smooth-content",
              start: "top top",
              end: () => `+=${announcement.offsetHeight}`,
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          })
            .to(announcement, { yPercent: -100, ease: "none" }, 0)
            .to(siteHeader, { y: () => -announcement.offsetHeight, ease: "none" }, 0);

          let chromeVisible = true;
          const showChrome = (visible: boolean) => {
            if (chromeVisible === visible) return;
            chromeVisible = visible;
            gsap.to(topChrome, {
              y: visible ? 0 : -siteHeader.offsetHeight - 8,
              duration: visible ? 0.48 : 0.36,
              ease: visible ? "back.out(1.35)" : "power3.in",
              overwrite: "auto",
            });
          };

          motionObserver = Observer.create({
            target: window,
            type: "wheel,touch,scroll",
            tolerance: 12,
            lockAxis: true,
            onDown: () => {
              if ((smoothScroller?.scrollTop() ?? 0) > window.innerHeight * 0.55) showChrome(false);
            },
            onUp: () => showChrome(true),
            onStop: () => {
              if ((smoothScroller?.scrollTop() ?? 0) < window.innerHeight * 0.55) showChrome(true);
            },
          }) as MotionObserver;
        }

        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not(.skip-link)').forEach((anchor) => {
          const handleAnchorClick = (event: MouseEvent) => {
            const href = anchor.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector<HTMLElement>(href);
            if (!target) return;
            event.preventDefault();
            gsap.to(window, {
              scrollTo: {
                y: target,
                offsetY: (siteHeader?.offsetHeight ?? 76) + 10,
                autoKill: true,
              },
              duration: 1.15,
              ease: "power3.inOut",
              overwrite: "auto",
            });
          };
          anchor.addEventListener("click", handleAnchorClick);
          anchorCleanups.push(() => anchor.removeEventListener("click", handleAnchorClick));
        });

        const loadHeadings = gsap.utils.toArray<HTMLElement>("[data-split='load']");
        loadHeadings.forEach((heading) => {
          const split = SplitText.create(heading, {
            type: "lines,words,chars",
            mask: "lines",
            charsClass: "motion-char",
            linesClass: "motion-line",
          });
          splitInstances.push(split);
          gsap.from(split.chars, {
            yPercent: 135,
            rotation: (index: number) => (index % 2 ? 7 : -7),
            opacity: 0,
            duration: 0.78,
            stagger: 0.018,
            delay: 0.16,
            ease: "back.out(1.45)",
          });
        });

        const scrollHeadings = gsap.utils.toArray<HTMLElement>("[data-split='scroll']");
        scrollHeadings.forEach((heading) => {
          const split = SplitText.create(heading, {
            type: "lines,words,chars",
            mask: "lines",
            charsClass: "motion-char",
            linesClass: "motion-line",
          });
          splitInstances.push(split);
          gsap.from(split.chars, {
            yPercent: 128,
            rotation: (index: number) => (index % 3 === 0 ? -5 : 4),
            opacity: 0,
            duration: 0.72,
            stagger: 0.014,
            ease: "back.out(1.35)",
            scrollTrigger: {
              trigger: heading,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
          });
        });

        const panelStarts: Record<string, { clipPath: string }> = {
          left: { clipPath: "inset(0 100% 0 0)" },
          right: { clipPath: "inset(0 0 0 100%)" },
          up: { clipPath: "inset(100% 0 0 0)" },
          iris: { clipPath: "circle(0% at 50% 50%)" },
        };

        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
          const direction = panel.dataset.panel ?? "left";
          const horizontalStart = direction === "left" ? -18 : direction === "right" ? 18 : 0;
          const verticalStart = direction === "up" ? 18 : direction === "iris" ? 12 : 0;
          const panelChildren = Array.from(panel.children).filter((child) =>
            !child.matches(".portal-pizza, [data-parallax], .smooth-float"),
          );
          const panelTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: "top 96%",
              end: "top 22%",
              scrub: 1.12,
              invalidateOnRefresh: true,
            },
          });
          panelTimeline
            .fromTo(panel, panelStarts[direction] ?? panelStarts.left, {
              clipPath: "inset(0 0 0 0)",
              duration: 1,
              ease: "power3.inOut",
            }, 0)
            .from(panelChildren, {
              xPercent: horizontalStart,
              yPercent: verticalStart,
              opacity: 0.25,
              stagger: 0.06,
              duration: 0.82,
              ease: "power3.out",
            }, 0.08);
        });

        const heroArt = document.querySelector<HTMLElement>("[data-hero-art]");
        if (heroArt) {
          gsap.from(heroArt, {
            xPercent: -32,
            rotation: -3,
            clipPath: "inset(0 100% 0 0)",
            duration: 1.15,
            delay: 0.04,
            ease: "power3.out",
          });
        }

        const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
        if (heroCopy) {
          gsap.from(heroCopy, {
            xPercent: 28,
            clipPath: "inset(0 0 0 100%)",
            duration: 1.18,
            delay: 0.02,
            ease: "power3.out",
          });
        }

        const menuMarquee = document.querySelector<HTMLElement>("[data-scroll-marquee]");
        if (menuMarquee) {
          gsap.fromTo(menuMarquee, { xPercent: 0 }, {
            xPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: menuMarquee,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          });
        }

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          const image = element.querySelector("img");
          if (!image) return;
          const strength = Number(element.dataset.parallax ?? 24) / 4;
          gsap.fromTo(
            image,
            { yPercent: -strength },
            {
              yPercent: strength,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        const portal = document.querySelector<HTMLElement>(".menu-portal");
        if (portal) {
          const portalCards = gsap.utils.toArray<HTMLElement>(".portal-pizza", portal);
          const starts = [
            { xPercent: -125, yPercent: -45, rotation: -24 },
            { xPercent: 120, yPercent: -70, rotation: 28 },
            { xPercent: -115, yPercent: 95, rotation: 36 },
            { xPercent: 120, yPercent: 75, rotation: -30 },
            { xPercent: 20, yPercent: 145, rotation: 42 },
          ];
          const portalTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: portal,
              start: "top 78%",
              end: "center 38%",
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          });
          portalCards.forEach((card, index) => {
            portalTimeline.from(card, {
              ...starts[index % starts.length],
              scale: 0.45,
              opacity: 0,
              ease: "back.out(1.2)",
              duration: 1,
            }, index * 0.11);
          });
        }

        const gallery = document.querySelector<HTMLElement>("[data-gallery]");
        if (gallery) {
          const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", gallery);
          const stackStarts = [
            { xPercent: -125, yPercent: 10, rotation: -22 },
            { xPercent: 8, yPercent: 120, rotation: 18 },
            { xPercent: 128, yPercent: 15, rotation: 24 },
            { xPercent: -35, yPercent: -125, rotation: -17 },
          ];
          const galleryTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: gallery,
              start: "top 82%",
              end: "center 44%",
              scrub: 1.15,
              invalidateOnRefresh: true,
            },
          });
          cards.forEach((card, index) => {
            galleryTimeline.from(card, {
              ...stackStarts[index % stackStarts.length],
              scale: 0.62,
              opacity: 0,
              duration: 1,
              ease: "power2.out",
            }, index * 0.12);
          });
          galleryTimeline.from(".gallery-caption", {
            yPercent: 70,
            rotation: 8,
            opacity: 0,
            duration: 0.65,
            ease: "back.out(1.6)",
          }, 0.65);
        }

        const driveTitle = section.querySelector<HTMLElement>(".drive-title");
        const remi = section.querySelector<HTMLElement>(".drive-remi");
        const remiBody = section.querySelector<HTMLElement>(".drive-remi-body");
        const remiCrop = section.querySelector<HTMLElement>(".drive-remi-crop");
        const remiShadow = section.querySelector<HTMLElement>(".drive-shadow");
        const speedLines = section.querySelectorAll<HTMLElement>(".speed-line");
        const stage = section.querySelector<HTMLElement>(".drive-stage");
        if (!driveTitle || !remi || !remiBody || !remiCrop || !remiShadow || !stage) return;

        const titleSplit = SplitText.create(driveTitle, {
          type: "chars",
          charsClass: "drive-title-letter",
          aria: "hidden",
        });
        splitInstances.push(titleSplit);

        gsap.set(wordPaths, { drawSVG: "0%", opacity: 1, strokeWidth: hotStrokeWidth });
        gsap.set(remi, { x: () => -remi.offsetWidth * 1.08 });
        gsap.set(speedLines, { scaleX: 0, transformOrigin: "right center" });

        const velocityTilt = gsap.quickTo(remiCrop, "rotation", { duration: 0.32, ease: "elastic.out(1, .42)" });
        const velocityLift = gsap.quickTo(remiCrop, "yPercent", { duration: 0.26, ease: "power3.out" });
        const settleVelocity = gsap.delayedCall(0.12, () => {
          velocityTilt(0);
          velocityLift(0);
        }).pause();

        const driveTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            pin: stage,
            pinSpacing: false,
            anticipatePin: 1,
            scrub: 1.15,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const velocity = gsap.utils.clamp(-4.5, 4.5, self.getVelocity() / 950);
              velocityTilt(velocity);
              velocityLift(-Math.abs(velocity) * 0.7);
              settleVelocity.restart(true);
            },
          },
        });

        driveTimeline
          .to(wordPaths, {
            drawSVG: "100%",
            duration: 0.22,
            stagger: 0.035,
            ease: "power1.inOut",
          }, 0)
          .from(titleSplit.chars, {
            yPercent: 145,
            rotation: (index: number) => [-9, 5, -4, 8, -6][index] ?? 0,
            scale: 0.72,
            opacity: 0,
            duration: 0.25,
            stagger: 0.025,
            ease: "back.out(1.7)",
          }, 0.09)
          .to(remi, {
            x: () => window.innerWidth + remi.offsetWidth * 0.16,
            duration: 0.48,
          }, 0.34)
          .to(remiBody, {
            keyframes: [
              { yPercent: -5.2, rotation: -3.2, duration: 0.12, ease: "power2.out" },
              { yPercent: 2.8, rotation: 1.8, duration: 0.09, ease: "power1.inOut" },
              { yPercent: -3.8, rotation: -1.5, duration: 0.09, ease: "power1.inOut" },
              { yPercent: 2.1, rotation: 1.1, duration: 0.08, ease: "power1.inOut" },
              { yPercent: -1.9, rotation: -.8, duration: 0.07, ease: "power1.inOut" },
              { yPercent: 0, rotation: 0, duration: 0.08, ease: "power2.out" },
            ],
            duration: 0.48,
          }, 0.34)
          .fromTo(remiShadow, {
            scaleX: 0.72,
            opacity: 0.16,
          }, {
            keyframes: [
              { scaleX: 1.08, opacity: 0.34, duration: 0.16 },
              { scaleX: 0.88, opacity: 0.22, duration: 0.14 },
              { scaleX: 1.02, opacity: 0.3, duration: 0.18 },
            ],
            transformOrigin: "center",
            duration: 0.48,
          }, 0.34)
          .to(speedLines, {
            scaleX: 1,
            duration: 0.08,
            stagger: 0.025,
            ease: "power2.out",
          }, 0.38)
          .to(speedLines, {
            scaleX: 0,
            duration: 0.08,
            stagger: 0.02,
          }, 0.73)
          .to(stage, {
            yPercent: -16,
            clipPath: "inset(0 0 16% 0)",
            duration: 0.12,
          }, 0.88);
      });

      ScrollTrigger.refresh();
    };

    setupMotion();

    return () => {
      disposed = true;
      anchorCleanups.forEach((cleanup) => cleanup());
      motionObserver?.kill();
      splitInstances.reverse().forEach((split) => split.revert());
      gsapContext?.revert();
      smoothScroller?.kill();
      document.documentElement.classList.remove("motion-ready");
      word.replaceChildren();
    };
  }, [varaFontSrc]);

  return (
    <section className="drive-sequence" ref={sectionRef} aria-labelledby="drive-title">
      <div className="drive-stage">
        <p className="drive-kicker">Next stop · Big Bertha</p>
        <h2 id="drive-title" className="drive-heading" aria-label="Hot pizza">
          <span className="drive-script" id="hot-word-drawing" aria-hidden="true" ref={wordRef} />
          <span className="drive-title" aria-hidden="true">PIZZA</span>
        </h2>
        <div className="drive-remi" aria-hidden="true">
          <div className="drive-remi-body">
            <div className="drive-remi-crop">
              <img src={remiSrc} alt="" width={1096} height={1435} />
            </div>
            <span className="speed-line speed-line-one" />
            <span className="speed-line speed-line-two" />
            <span className="speed-line speed-line-three" />
          </div>
          <span className="drive-shadow" />
        </div>
        <p className="drive-note">Scroll to send Remi</p>
        <div className="drive-road" aria-hidden="true" />
      </div>
    </section>
  );
}
