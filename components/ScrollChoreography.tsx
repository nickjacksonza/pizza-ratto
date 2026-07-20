/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";

type ScrollChoreographyProps = {
  remiSrc: string;
  pullImageSrc: string;
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
  scrollTop: (position?: number) => number;
};

type MotionObserver = { kill: () => void };
type ResponsiveMotion = {
  add: (query: string, setup: () => void | (() => void)) => unknown;
  revert: () => void;
};

export function ScrollChoreography({ remiSrc, pullImageSrc, varaFontSrc }: ScrollChoreographyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const word = wordRef.current;
    const socialWord = document.querySelector<HTMLElement>("[data-social-word-drawing]");
    if (!section || !word) return;

    let disposed = false;
    let gsapContext: { revert: () => void } | undefined;
    let wordContext: { revert: () => void } | undefined;
    let socialWordMotion: ResponsiveMotion | undefined;
    let responsiveMotion: ResponsiveMotion | undefined;
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
      const hotStrokeWidth = window.innerWidth < 600 ? 6.8 : 8.2;
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

      const varaReady = new Promise<void>((resolve) => vara.ready(resolve));
      const socialVara = socialWord ? new Vara(
        "#social-ratto-drawing",
        varaFontSrc,
        [{
          text: "Ratto",
          id: "social-ratto-word",
          duration: 1,
          autoAnimation: false,
          textAlign: "center",
          y: 2,
        }],
        {
          autoAnimation: false,
          color: "#cc2832",
          fontSize: window.innerWidth < 760 ? 150 : window.innerWidth < 1200 ? 220 : 300,
          strokeWidth: window.innerWidth < 760 ? 5.2 : 6.4,
          textAlign: "center",
        },
      ) : undefined;
      const socialVaraReady = new Promise<void>((resolve) => socialVara ? socialVara.ready(resolve) : resolve());
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        await Promise.all([varaReady, socialVaraReady]);
        if (disposed) return;
        const wordPaths = Array.from(word.querySelectorAll<SVGPathElement>("path"));
        gsap.set(wordPaths, { drawSVG: "100%", opacity: 1 });
        const socialWordPaths = Array.from(socialWord?.querySelectorAll<SVGPathElement>("path") ?? []);
        gsap.set(socialWordPaths, { drawSVG: "100%", opacity: 1 });
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

        const navigationTransition = document.querySelector<HTMLElement>("[data-nav-transition]");
        const navigationLabel = document.querySelector<HTMLElement>("[data-nav-transition-label]");
        const navigationCopy = document.querySelector<HTMLElement>(".nav-transition-copy");
        const navigationWheel = document.querySelector<HTMLElement>(".nav-transition-wheel");
        const navigationSpeeds = document.querySelectorAll<HTMLElement>(".nav-transition-speed");
        let navigationActive = false;
        const navigationLabels: Record<string, string> = { top: "Home", story: "About", menu: "Menu", visit: "Visit" };

        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not(.skip-link)').forEach((anchor) => {
          const handleAnchorClick = (event: MouseEvent) => {
            const href = anchor.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector<HTMLElement>(href);
            if (!target || navigationActive) return;
            event.preventDefault();
            const targetY = Math.max(0, (smoothScroller?.offset(target, "top top") ?? target.offsetTop) - ((siteHeader?.offsetHeight ?? 76) + 10));
            const currentY = smoothScroller?.scrollTop() ?? window.scrollY;
            const completeNavigation = () => {
              target.focus({ preventScroll: true });
              window.history.pushState(null, "", href);
            };

            if (navigationTransition && navigationCopy && navigationWheel && Math.abs(targetY - currentY) > window.innerHeight * 1.35) {
              navigationActive = true;
              if (navigationLabel) navigationLabel.textContent = navigationLabels[target.id] ?? "Next";
              gsap.killTweensOf(window);
              gsap.timeline({
                defaults: { overwrite: "auto" },
                onComplete: () => {
                  gsap.set(navigationTransition, { visibility: "hidden", clipPath: "inset(0 100% 0 0)" });
                  navigationActive = false;
                },
              })
                .set(navigationTransition, { visibility: "visible", clipPath: "inset(0 100% 0 0)" })
                .to(navigationTransition, { clipPath: "inset(0 0% 0 0)", duration: .42, ease: "power4.inOut" })
                .fromTo(navigationCopy, { yPercent: 38, rotation: -5, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .28, ease: "back.out(1.35)" }, .18)
                .fromTo(navigationWheel, { xPercent: 80, rotation: -45, opacity: 0 }, { xPercent: 0, rotation: 35, opacity: 1, duration: .36, ease: "power3.out" }, .14)
                .fromTo(navigationSpeeds, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: .24, stagger: .05, ease: "power2.out" }, .18)
                .call(() => {
                  if (smoothScroller) smoothScroller.scrollTop(targetY);
                  else window.scrollTo({ top: targetY, behavior: "auto" });
                  ScrollTrigger.update();
                  completeNavigation();
                }, [], .44)
                .to(navigationCopy, { yPercent: -34, opacity: 0, duration: .22, ease: "power2.in" }, .58)
                .to(navigationTransition, { clipPath: "inset(0 0 0 100%)", duration: .46, ease: "power4.inOut" }, .62);
              return;
            }

            gsap.to(window, {
              scrollTo: {
                y: targetY,
                autoKill: true,
              },
              duration: 1.15,
              ease: "power3.inOut",
              overwrite: "auto",
              onComplete: completeNavigation,
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

        gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((scene) => {
          const transition = scene.dataset.transition ?? "paper-left";
          const curtain = scene.querySelector<HTMLElement>(":scope > .scene-curtain");
          if (!curtain) return;
          const children = Array.from(scene.children).filter((child) =>
            !child.matches(".scene-curtain, .chapter-progress, .portal-pizza, [data-parallax], .smooth-float, .small-menu-grid, .social-collage, .social-heading, .social-drawn-word, .social-mural, .social-filmstrip"),
          );
          const sceneTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: scene,
              start: "top 98%",
              end: "top 26%",
              scrub: 0.86,
              invalidateOnRefresh: true,
            },
          });

          if (transition === "iris") {
            sceneTimeline
              .fromTo(curtain, { clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)", duration: 1, ease: "power2.inOut" }, 0)
              .from(children, { xPercent: (index: number) => index % 2 ? 24 : -24, scale: .92, opacity: 0, stagger: .08, duration: .72, ease: "back.out(1.25)" }, .14);
            return;
          }

          if (transition === "split") {
            const photo = scene.querySelector<HTMLElement>(".ingredient-photo");
            const copy = scene.querySelector<HTMLElement>(".ingredient-copy");
            if (photo && copy) {
              sceneTimeline
                .to(curtain, { scaleX: 0, transformOrigin: "50% 50%", duration: .82, ease: "power3.inOut" }, 0)
                .from(photo, { xPercent: -102, rotation: -2.5, duration: 1, ease: "power3.inOut" }, .02)
                .from(copy, { xPercent: 102, duration: 1, ease: "power3.inOut" }, .02)
                .from(Array.from(copy.children), { xPercent: 24, opacity: 0, stagger: .06, duration: .62, ease: "power3.out" }, .34);
            }
            return;
          }

          if (transition === "columns") {
            const columns = Array.from(scene.children).filter((child) => !child.matches(".scene-curtain, .chapter-progress"));
            sceneTimeline
              .to(curtain, { xPercent: -88, skewX: 5, duration: .76, ease: "power3.inOut" }, 0)
              .to(curtain, { xPercent: -120, skewX: 0, duration: .24, ease: "power2.out" }, .76)
              .from(columns[0], { xPercent: -105, rotation: -2, duration: .92, ease: "power3.inOut" }, .02)
              .from(columns[1], { yPercent: 105, scale: .9, duration: 1, ease: "power3.inOut" }, .05)
              .from(columns[2], { xPercent: 105, rotation: 2, duration: .92, ease: "power3.inOut" }, .08);
            return;
          }

          if (transition === "deck") {
            sceneTimeline
              .to(curtain, { xPercent: 88, skewX: -5, rotation: -1.5, transformOrigin: "100% 50%", duration: .76, ease: "power3.inOut" }, 0)
              .to(curtain, { xPercent: 120, skewX: 0, rotation: 0, duration: .24, ease: "power2.out" }, .76);
            if (children.length) {
              sceneTimeline.from(children, { xPercent: (index: number) => index % 2 ? 38 : -38, rotation: (index: number) => index % 2 ? 1.5 : -1.5, opacity: 0, stagger: .08, duration: .76, ease: "power3.out" }, .16);
            }
            return;
          }

          if (transition === "cards-up") {
            sceneTimeline
              .to(curtain, { xPercent: 88, skewX: -4, duration: .72, ease: "power3.inOut" }, 0)
              .to(curtain, { xPercent: 120, skewX: 0, duration: .2, ease: "power2.out" }, .72)
              .from(children, { xPercent: (index: number) => index % 2 ? 44 : -44, rotation: (index: number) => index % 2 ? 1.8 : -1.8, opacity: 0, stagger: .09, duration: .76, ease: "back.out(1.2)" }, .16);
            return;
          }

          if (transition === "shutter-right") {
            sceneTimeline
              .to(curtain, { xPercent: -88, skewX: 4, transformOrigin: "0% 50%", duration: .76, ease: "power3.inOut" }, 0)
              .to(curtain, { xPercent: -120, skewX: 0, duration: .24, ease: "power2.out" }, .76)
              .from(children, { xPercent: 34, opacity: 0, stagger: .07, duration: .72, ease: "back.out(1.18)" }, .22);
            return;
          }

          if (transition === "shutter-left") {
            sceneTimeline
              .to(curtain, { xPercent: 88, skewX: -4, transformOrigin: "100% 50%", duration: .76, ease: "power3.inOut" }, 0)
              .to(curtain, { xPercent: 120, skewX: 0, duration: .24, ease: "power2.out" }, .76)
              .from(children, { xPercent: -34, opacity: 0, stagger: .07, duration: .72, ease: "back.out(1.18)" }, .2);
            return;
          }

          sceneTimeline
            .to(curtain, { xPercent: 88, skewX: -3, transformOrigin: "100% 50%", duration: .76, ease: "power3.inOut" }, 0)
            .to(curtain, { xPercent: 120, skewX: 0, duration: .24, ease: "power2.out" }, .76)
            .from(children, { xPercent: -32, opacity: 0, stagger: .07, duration: .72, ease: "power3.out" }, .16);
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
        const menuGrid = document.querySelector<HTMLElement>(".pizza-collage");
        const menuCards = menuGrid ? gsap.utils.toArray<HTMLElement>(":scope > li", menuGrid) : [];

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

        responsiveMotion = gsap.matchMedia();
        const setupMenuRows = (columns: number) => {
          menuCards.forEach((card, index) => {
            const row = Math.floor(index / columns);
            const direction = row % 2 === 0 ? -1 : 1;
            gsap.fromTo(card, {
              xPercent: direction * 48,
              rotation: direction * 2.4,
              opacity: .18,
            }, {
              xPercent: 0,
              rotation: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 96%",
                end: "top 61%",
                scrub: .72,
                invalidateOnRefresh: true,
              },
            });
          });
        };
        responsiveMotion.add("(min-width: 761px)", () => setupMenuRows(3));
        responsiveMotion.add("(max-width: 760px)", () => setupMenuRows(2));

        gsap.utils.toArray<HTMLElement>(".menu-category").forEach((category, index) => {
          const categoryHeader = category.querySelector<HTMLElement>("header");
          const categoryRows = gsap.utils.toArray<HTMLElement>("li", category);
          const direction = index % 2 ? 1 : -1;
          const categoryTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: category,
              start: "top 90%",
              end: "top 44%",
              scrub: .82,
              invalidateOnRefresh: true,
            },
          });
          if (categoryHeader) {
            categoryTimeline.from(categoryHeader, { xPercent: direction * 38, rotation: direction * 1.6, opacity: 0, duration: .48, ease: "power3.out" }, 0);
          }
          categoryTimeline.from(categoryRows, {
            xPercent: direction * 24,
            opacity: 0,
            stagger: .035,
            duration: .62,
            ease: "power2.out",
          }, .16);
        });

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
        const social = document.querySelector<HTMLElement>("[data-social-showcase]");
        const portalStarts = [
          { xPercent: -125, yPercent: -45, rotation: -24 },
          { xPercent: 120, yPercent: -70, rotation: 28 },
          { xPercent: -115, yPercent: 95, rotation: 36 },
          { xPercent: 120, yPercent: 75, rotation: -30 },
          { xPercent: 20, yPercent: 145, rotation: 42 },
        ];
        const socialStarts = [
          { xPercent: -140, yPercent: 18, rotation: -22 },
          { xPercent: -20, yPercent: 135, rotation: 17 },
          { xPercent: 135, yPercent: 16, rotation: 24 },
          { xPercent: 32, yPercent: -140, rotation: -18 },
        ];

        responsiveMotion.add("(max-width: 1000px), (max-height: 719px)", () => {
          if (portal) {
            const portalCards = gsap.utils.toArray<HTMLElement>(".portal-pizza", portal);
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
                ...portalStarts[index % portalStarts.length],
                scale: 0.45,
                opacity: 0,
                ease: "back.out(1.2)",
                duration: 1,
              }, index * 0.11);
            });
          }

          if (social) {
            const socialCards = gsap.utils.toArray<HTMLElement>("[data-social-card]", social);
            const badge = social.querySelector<HTMLElement>("[data-social-follow-cursor]");
            const socialTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: social,
                start: "top 84%",
                end: "center 44%",
                scrub: 1.15,
                invalidateOnRefresh: true,
              },
            });
            socialCards.forEach((card, index) => {
              socialTimeline.from(card, {
                ...socialStarts[index % socialStarts.length],
                scale: 0.62,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
              }, index * 0.12);
            });
            if (badge) socialTimeline.from(badge, { scale: 0, rotation: -14, duration: .55, ease: "back.out(1.8)" }, .58);
          }
        });

        responsiveMotion.add("(min-width: 1001px) and (min-height: 720px)", () => {
          const lockedChapters = gsap.utils.toArray<HTMLElement>("[data-lock-chapter]");
          lockedChapters.forEach((chapter) => {
            const duration = Number(chapter.dataset.lockScroll ?? 1.1);
            const progress = chapter.querySelector<HTMLElement>(".chapter-progress i");
            const timeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: chapter,
                start: "top top",
                end: () => `+=${window.innerHeight * duration}`,
                pin: chapter,
                pinSpacing: true,
                scrub: .85,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
            if (progress) timeline.to(progress, { scaleY: 1, duration: 1 }, 0);

            switch (chapter.dataset.lockChapter) {
              case "story": {
                const houseRules = chapter.querySelectorAll<HTMLElement>("aside span");
                const storyCopy = chapter.querySelector<HTMLElement>(":scope > div");
                timeline
                  .from(houseRules, { xPercent: 80, opacity: 0, stagger: .08, duration: .45, ease: "back.out(1.35)" }, .05)
                  .to(storyCopy, { xPercent: -4, rotation: -.35, duration: .55, ease: "power2.inOut" }, .4)
                  .to(chapter.querySelector("aside"), { xPercent: -5, rotation: 1.5, duration: .45, ease: "power2.inOut" }, .52);
                break;
              }
              case "menu-portal": {
                const cards = gsap.utils.toArray<HTMLElement>(".portal-pizza", chapter);
                const portalCopy = chapter.querySelector<HTMLElement>(".menu-portal-copy");
                const portalButton = chapter.querySelector<HTMLElement>(".menu-portal-copy .button");
                cards.forEach((card, index) => {
                  timeline.from(card, {
                    ...portalStarts[index % portalStarts.length],
                    scale: .35,
                    opacity: 0,
                    duration: .48,
                    ease: "back.out(1.55)",
                  }, .04 + index * .07);
                });
                timeline.to(chapter, { "--portal-ring-scale": 1.7, duration: .55, ease: "power2.inOut" }, .38);
                if (portalCopy) timeline.to(portalCopy, { scale: 1.06, yPercent: -3, duration: .34, ease: "power2.out" }, .48);
                if (portalButton) timeline.to(portalButton, { yPercent: -18, rotation: -2, duration: .28, ease: "back.out(1.4)" }, .65);
                break;
              }
              case "ingredients": {
                const photo = chapter.querySelector<HTMLElement>(".ingredient-photo");
                const image = chapter.querySelector<HTMLElement>(".ingredient-photo img");
                const copy = chapter.querySelector<HTMLElement>(".ingredient-copy");
                const scribble = chapter.querySelector<HTMLElement>(".scribble");
                timeline
                  .to(image, { scale: 1.12, xPercent: 4, duration: .8, ease: "power1.inOut" }, .04)
                  .to(photo, { clipPath: "polygon(4% 4%, 100% 0, 96% 96%, 0 100%)", rotation: -.8, duration: .6, ease: "power2.inOut" }, .18)
                  .to(copy, { backgroundColor: "#373737", color: "#fff4df", duration: .42, ease: "power2.inOut" }, .5)
                  .fromTo(scribble, { scale: .45, rotation: -12, opacity: 0 }, { scale: 1, rotation: -2, opacity: 1, duration: .3, ease: "back.out(1.8)" }, .58);
                break;
              }
              case "characters": {
                const art = chapter.querySelector<HTMLElement>(".character-art img");
                const left = chapter.querySelector<HTMLElement>(".character-copy");
                const right = chapter.querySelector<HTMLElement>(".bertha-note");
                timeline
                  .to(art, { xPercent: 5, rotation: 2.5, scale: 1.08, duration: .75, ease: "power1.inOut" }, .06)
                  .to(left, { xPercent: 5, duration: .45, ease: "power2.inOut" }, .28)
                  .to(right, { xPercent: -6, rotation: -.6, duration: .45, ease: "power2.inOut" }, .34)
                  .to(chapter.querySelectorAll(".sticker"), { rotation: (index: number) => index ? 7 : -7, scale: 1.12, stagger: .08, duration: .28, ease: "back.out(1.6)" }, .55);
                break;
              }
              case "social": {
                const cards = gsap.utils.toArray<HTMLElement>("[data-social-card]", chapter);
                const badge = chapter.querySelector<HTMLElement>("[data-social-follow-cursor]");
                const heading = chapter.querySelector<HTMLElement>(".social-heading");
                const mural = chapter.querySelector<HTMLElement>(".social-mural");
                timeline
                  .fromTo(heading, { yPercent: -70, scale: .82, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: .3, ease: "power3.out" }, .02)
                  .fromTo(mural, { yPercent: 62 }, { yPercent: 0, duration: .55, ease: "power3.out" }, .08);
                cards.forEach((card, index) => {
                  timeline.from(card, {
                    ...socialStarts[index % socialStarts.length],
                    scale: .55,
                    opacity: 0,
                    duration: .42,
                    ease: "back.out(1.25)",
                  }, .12 + index * .095);
                });
                if (badge) timeline.from(badge, { scale: 0, rotation: -18, duration: .28, ease: "back.out(2)" }, .5);
                if (cards.length >= 4) {
                  timeline
                    .to(cards[0], { xPercent: 7, yPercent: -5, rotation: -2, duration: .35, ease: "power1.inOut" }, .66)
                    .to(cards[1], { xPercent: -5, yPercent: 4, rotation: 1, duration: .35, ease: "power1.inOut" }, .66)
                    .to(cards[2], { xPercent: 4, yPercent: -3, rotation: 2, duration: .35, ease: "power1.inOut" }, .66)
                    .to(cards[3], { xPercent: -6, yPercent: 5, rotation: -3, duration: .35, ease: "power1.inOut" }, .66);
                }
                break;
              }
              case "visit": {
                const rows = chapter.querySelectorAll<HTMLElement>("dl > div");
                const actions = chapter.querySelectorAll<HTMLElement>(".visit-actions .button");
                timeline
                  .from(rows, { xPercent: 65, opacity: 0, stagger: .12, duration: .38, ease: "power3.out" }, .08)
                  .fromTo(actions, { clipPath: "inset(0 100% 0 0)", opacity: 0 }, { clipPath: "inset(0 0% 0 0)", opacity: 1, stagger: .075, duration: .32, ease: "power2.out" }, .34)
                  .to(chapter.querySelector("h2"), { scale: 1.04, xPercent: 2, duration: .35, ease: "power1.inOut" }, .63);
                break;
              }
            }
          });
        });

        responsiveMotion.add("(min-width: 1001px) and (hover: hover) and (pointer: fine)", () => {
          if (!social) return;
          const follower = social.querySelector<HTMLElement>("[data-social-follow-cursor]");
          const collage = social.querySelector<HTMLElement>("[data-social-collage]");
          if (!follower) return;
          const moveX = gsap.quickTo(follower, "x", { duration: .34, ease: "power3.out" });
          const moveY = gsap.quickTo(follower, "y", { duration: .34, ease: "power3.out" });
          const handlePointerMove = (event: PointerEvent) => {
            const bounds = (collage ?? social).getBoundingClientRect();
            moveX(event.clientX - bounds.left - bounds.width / 2);
            moveY(event.clientY - bounds.top - bounds.height * .57);
          };
          const handlePointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          social.addEventListener("pointermove", handlePointerMove);
          social.addEventListener("pointerleave", handlePointerLeave);
          window.addEventListener("scroll", handlePointerLeave, { passive: true });
          return () => {
            social.removeEventListener("pointermove", handlePointerMove);
            social.removeEventListener("pointerleave", handlePointerLeave);
            window.removeEventListener("scroll", handlePointerLeave);
          };
        });

        const driveTitle = section.querySelector<HTMLElement>(".drive-title");
        const driveHeading = section.querySelector<HTMLElement>(".drive-heading");
        const driveKicker = section.querySelector<HTMLElement>(".drive-kicker");
        const driveNote = section.querySelector<HTMLElement>(".drive-note");
        const remi = section.querySelector<HTMLElement>(".drive-remi");
        const remiBody = section.querySelector<HTMLElement>(".drive-remi-body");
        const remiCrop = section.querySelector<HTMLElement>(".drive-remi-crop");
        const remiShadow = section.querySelector<HTMLElement>(".drive-shadow");
        const speedLines = section.querySelectorAll<HTMLElement>(".speed-line");
        const stage = section.querySelector<HTMLElement>(".drive-stage");
        const pullScene = section.querySelector<HTMLElement>(".drive-pull-scene");
        const pullPhoto = section.querySelector<HTMLElement>(".drive-pull-photo");
        const pullCopy = section.querySelector<HTMLElement>(".drive-pull-copy");
        const pullBadge = section.querySelector<HTMLElement>(".drive-pull-badge");
        const towLine = section.querySelector<HTMLElement>(".drive-tow-line");
        if (!driveTitle || !driveHeading || !driveKicker || !driveNote || !remi || !remiBody || !remiCrop || !remiShadow || !stage || !pullScene || !pullPhoto || !pullCopy || !pullBadge || !towLine) return;

        const titleSplit = SplitText.create(driveTitle, {
          type: "chars",
          charsClass: "drive-title-letter",
          aria: "hidden",
        });
        splitInstances.push(titleSplit);

        gsap.set(remi, { x: () => -remi.offsetWidth * 1.08 });
        gsap.set(pullScene, { xPercent: -100 });
        gsap.set(towLine, { scaleX: 0, transformOrigin: "left center" });
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
            duration: 0.58,
          }, 0.27)
          .to(remiBody, {
            keyframes: [
              { yPercent: -5.2, rotation: -3.2, duration: 0.12, ease: "power2.out" },
              { yPercent: 2.8, rotation: 1.8, duration: 0.09, ease: "power1.inOut" },
              { yPercent: -3.8, rotation: -1.5, duration: 0.09, ease: "power1.inOut" },
              { yPercent: 2.1, rotation: 1.1, duration: 0.08, ease: "power1.inOut" },
              { yPercent: -1.9, rotation: -.8, duration: 0.07, ease: "power1.inOut" },
              { yPercent: 0, rotation: 0, duration: 0.08, ease: "power2.out" },
            ],
            duration: 0.58,
          }, 0.27)
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
            duration: 0.58,
          }, 0.27)
          .to(towLine, {
            scaleX: 1,
            duration: 0.15,
            ease: "power2.out",
          }, 0.29)
          .to(pullScene, {
            xPercent: 0,
            duration: 0.54,
            ease: "power2.inOut",
          }, 0.35)
          .to([driveHeading, driveKicker, driveNote], {
            xPercent: 18,
            opacity: 0,
            duration: 0.23,
            stagger: 0.018,
            ease: "power2.in",
          }, 0.39)
          .from(pullPhoto, {
            xPercent: -48,
            rotation: -10,
            scale: .84,
            opacity: 0,
            duration: 0.34,
            ease: "back.out(1.25)",
          }, 0.49)
          .from(Array.from(pullCopy.children), {
            xPercent: -42,
            opacity: 0,
            duration: 0.28,
            stagger: 0.035,
            ease: "power3.out",
          }, 0.55)
          .from(pullBadge, {
            scale: 0,
            rotation: -28,
            duration: 0.2,
            ease: "back.out(1.8)",
          }, 0.66)
          .to(speedLines, {
            scaleX: 1,
            duration: 0.08,
            stagger: 0.025,
            ease: "power2.out",
          }, 0.31)
          .to(speedLines, {
            backgroundColor: "#ffc0c1",
            duration: 0.08,
          }, 0.51)
          .to(speedLines, {
            scaleX: 0,
            duration: 0.08,
            stagger: 0.02,
          }, 0.78)
          .to(towLine, {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.1,
            ease: "power2.in",
          }, 0.82)
          .to(pullScene, {
            xPercent: 0,
            duration: 0.15,
          }, 0.93);
      });

      ScrollTrigger.refresh();

      await Promise.all([varaReady, socialVaraReady]);
      if (disposed) return;

      const wordSvg = word.querySelector("svg");
      const wordPaths = Array.from(word.querySelectorAll<SVGPathElement>("path"));
      const socialWordSvg = socialWord?.querySelector("svg");
      const socialWordPaths = Array.from(socialWord?.querySelectorAll<SVGPathElement>("path") ?? []);
      if (wordSvg) {
        wordSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        wordSvg.setAttribute("aria-hidden", "true");
      }
      if (socialWordSvg) {
        socialWordSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        socialWordSvg.setAttribute("aria-hidden", "true");
      }

      wordContext = gsap.context(() => {
        gsap.set(wordPaths, { drawSVG: "0%", opacity: 1, strokeWidth: hotStrokeWidth });
        gsap.to(wordPaths, {
          drawSVG: "100%",
          stagger: 0.035,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${section.offsetHeight * 0.24}`,
            scrub: 1.05,
            invalidateOnRefresh: true,
          },
        });
      }, section);

      if (socialWord && socialWordPaths.length) {
        gsap.set(socialWordPaths, { drawSVG: "0%", opacity: 1 });
        const socialStrokeLengths = socialWordPaths.map((path) => Math.max(path.getTotalLength(), 1));
        const totalSocialStrokeLength = socialStrokeLengths.reduce((total, length) => total + length, 0);
        const createSocialDrawTimeline = (trigger: Element, start: string, end: string | (() => string)) => {
          const drawTimeline = gsap.timeline({
            scrollTrigger: {
              trigger,
              start,
              end,
              scrub: .82,
              invalidateOnRefresh: true,
            },
          });
          socialWordPaths.forEach((path, index) => {
            drawTimeline.to(path, {
              drawSVG: "100%",
              duration: Math.max(.16, socialStrokeLengths[index] / totalSocialStrokeLength * 3.4),
              ease: "none",
            });
          });
          return drawTimeline;
        };
        socialWordMotion = gsap.matchMedia();
        socialWordMotion.add("(min-width: 1001px) and (min-height: 720px)", () => {
          const socialScene = socialWord.closest("[data-social-showcase]");
          if (socialScene) createSocialDrawTimeline(socialScene, "top top", () => `+=${window.innerHeight * .72}`);
        });
        socialWordMotion.add("(max-width: 1000px), (max-height: 719px)", () => {
          createSocialDrawTimeline(socialWord, "top 88%", "top 34%");
        });
      }

      ScrollTrigger.refresh();
    };

    setupMotion();

    return () => {
      disposed = true;
      anchorCleanups.forEach((cleanup) => cleanup());
      motionObserver?.kill();
      splitInstances.reverse().forEach((split) => split.revert());
      wordContext?.revert();
      socialWordMotion?.revert();
      responsiveMotion?.revert();
      gsapContext?.revert();
      smoothScroller?.kill();
      document.documentElement.classList.remove("motion-ready");
      word.replaceChildren();
      socialWord?.replaceChildren();
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
        <div className="drive-pull-scene" aria-hidden="true">
          <figure className="drive-pull-photo">
            <img src={pullImageSrc} alt="" width={1027} height={1531} loading="eager" decoding="async" />
          </figure>
          <div className="drive-pull-copy">
            <span>01 / Remi’s next stop</span>
            <strong>Fire.<br /><em>Time.</em><br />Tomatoes.</strong>
            <p>Hand-stretched. Wood-fired. Pulled into view by one deeply unqualified delivery rat.</p>
          </div>
          <span className="drive-pull-badge">Pulling up</span>
          <span className="drive-tow-line" />
          <div className="drive-pull-road" />
        </div>
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
