/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";

type ScrollChoreographyProps = {
  remiSrc: string;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ScrollChoreography({ remiSrc }: ScrollChoreographyProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - viewportHeight, 1);
      const progress = clamp(-rect.top / travel);
      const word = clamp(progress / 0.18);
      const title = clamp((progress - 0.08) / 0.24);
      const ride = clamp((progress - 0.27) / 0.55);
      const exit = clamp((progress - 0.88) / 0.12);

      section.style.setProperty("--word-clip", `${(1 - word) * 100}%`);
      section.style.setProperty("--title-opacity", `${title}`);
      section.style.setProperty("--title-lift", `${(1 - title) * 12}vh`);
      section.style.setProperty("--ride-x", `${-39 + ride * 142}vw`);
      section.style.setProperty("--ride-bounce", `${Math.sin(ride * Math.PI * 8) * 5}px`);
      section.style.setProperty("--ride-tilt", `${-2 + Math.sin(ride * Math.PI * 4) * 1.6}deg`);
      section.style.setProperty("--scene-exit", `${exit * -18}vh`);

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        const distance = (elementRect.top + elementRect.height / 2 - viewportHeight / 2) / viewportHeight;
        const strength = Number(element.dataset.parallax ?? 28);
        const offset = Math.max(-1.35, Math.min(1.35, distance)) * strength * -1;
        element.style.setProperty("--parallax-y", `${offset}px`);
      });
    };

    const requestPaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    if (reducedMotion.matches) {
      section.style.setProperty("--word-clip", "0%");
      section.style.setProperty("--title-opacity", "1");
      section.style.setProperty("--title-lift", "0px");
      section.style.setProperty("--ride-x", "42vw");
      return;
    }

    paint();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint);
    return () => {
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="drive-sequence" ref={sectionRef} aria-labelledby="drive-title">
      <div className="drive-stage">
        <p className="drive-kicker">Next stop · Big Bertha</p>
        <h2 id="drive-title" className="drive-heading" aria-label="Hot pizza">
          <span className="drive-script" aria-hidden="true">Hot</span>
          <span className="drive-title" aria-hidden="true">PIZZA</span>
        </h2>
        <div className="drive-remi" aria-hidden="true">
          <div className="drive-remi-crop">
            <img src={remiSrc} alt="" width={1096} height={1435} />
          </div>
          <span className="speed-line speed-line-one" />
          <span className="speed-line speed-line-two" />
        </div>
        <p className="drive-note">Scroll to send Remi</p>
        <div className="drive-road" aria-hidden="true" />
      </div>
    </section>
  );
}
