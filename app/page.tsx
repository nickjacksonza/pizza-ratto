/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { BrandIcon } from "../components/BrandIcon";
import { MobileNavigation } from "../components/MobileNavigation";
import { ScrollChoreography } from "../components/ScrollChoreography";
import { business } from "../data/business";
import { menu, zar } from "../data/menu";

export const dynamic = "force-static";

const facts = ["Hand-stretched", "Wood-fired", "Proper ingredients", "Zero fuss"];
const tickerCopy = "ITALIAN SOUL ★ STREET-CORNER ATTITUDE ★ PIZZA, DONE PROPERLY ★ ".repeat(4);
const announcementCopy = <>Made fresh. Taken seriously by no one. <span className="announcement-diamond">◆</span> Wood-fired in Salt River <span className="announcement-diamond">◆</span> Monday–Saturday, 10:00–18:00</>;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${basePath}${path}`;

const pizzaPhotos: Record<string, { src: string; alt: string }> = {
  "Bianca & Dip": { src: "/images/owner-2026/pizza-bianca.webp", alt: "Rosemary flatbread with bowls of fresh dip and olive oil" },
  Primavera: { src: "/images/owner-2026/pizza-primavera.webp", alt: "Tomato and mozzarella pizza finished with fresh basil" },
  Veloce: { src: "/images/owner-2026/pizza-veloce.webp", alt: "Pizza with roasted butternut, feta, onions and sunflower seeds" },
  Sprint: { src: "/images/owner-2026/pizza-sprint.webp", alt: "Pizza with salami, caramelised onions, mozzarella and hot honey" },
  Arcobaleno: { src: "/images/owner-2026/pizza-arcobaleno.webp", alt: "Pizza with salami, mushrooms, feta and fresh rocket" },
  "Bianca Pollo": { src: "/images/owner-2026/pizza-bianca-pollo.webp", alt: "White-base pizza with smoked chicken, mushrooms and chives" },
  Sole: { src: "/images/owner-2026/pizza-sole.webp", alt: "White-base pizza with yellow peppers, cherry tomatoes and mint" },
  Rally: { src: "/images/owner-2026/pizza-rally.webp", alt: "Pizza with smoked chicken, mushrooms and avocado" },
  Bosco: { src: "/images/owner-2026/pizza-bosco.webp", alt: "Wood-fired pizza with mushrooms, garlic, rosemary and rocket" },
  Bandito: { src: "/images/owner-2026/pizza-bandito.webp", alt: "Wood-fired pizza with spicy salami, red onion, roasted peppers and chilli" },
  Verde: { src: "/images/owner-2026/pizza-verde.webp", alt: "Pesto pizza with courgette, artichokes, feta and rocket" },
  Tramonto: { src: "/images/owner-2026/pizza-tramonto.webp", alt: "Wood-fired pizza with roasted peppers, onions, feta, cherry tomatoes and basil" },
};

const portalPizzas = ["Primavera", "Sprint", "Arcobaleno", "Rally", "Verde"];
const counterTapes = [
  { src: "/videos/owner-2026/oven-close.mp4", poster: "/images/owner-2026/video-stills/oven-close.webp", label: "Big Bertha, up close" },
  { src: "/videos/owner-2026/oven-flames.mp4", poster: "/images/owner-2026/video-stills/oven-flames.webp", label: "The fire stays ready" },
  { src: "/videos/owner-2026/pizza-pass.mp4", poster: "/images/owner-2026/video-stills/pizza-pass.webp", label: "From oven to pass" },
  { src: "/videos/owner-2026/espresso-pull.mp4", poster: "/images/owner-2026/video-stills/espresso-pull.webp", label: "Espresso pulling" },
  { src: "/videos/owner-2026/sugar-doughnuts.mp4", poster: "/images/owner-2026/video-stills/sugar-doughnuts.webp", label: "Sugar doughnuts" },
  { src: "/videos/owner-2026/box-lettering.mp4", poster: "/images/owner-2026/video-stills/box-lettering.webp", label: "Boxes, signed by hand" },
  { src: "/videos/owner-2026/counter-sweep.mp4", poster: "/images/owner-2026/video-stills/counter-sweep.webp", label: "Counter chaos" },
];

function MorphBrandMark({ name, className }: { name: "pizza" | "coffee" | "dolci"; className: string }) {
  if (name === "pizza") {
    return (
      <svg className={`${className} morph-brand-icon`} viewBox="0 0 394 437" fill="none" aria-hidden="true" data-morph-icon="pizza" data-brand-source={asset("/images/brand/red-pizza-slice.svg")}>
        <path data-morph-start d="M275 218.5C275 261.578 240.078 296.5 197 296.5C153.922 296.5 119 261.578 119 218.5C119 175.422 153.922 140.5 197 140.5C240.078 140.5 275 175.422 275 218.5Z" />
        <path data-morph-main d="M346.846 250.21L38.8834 422.856C23.3305 432.189 3.11074 439.966 0 435.3C0 435.3 3.11074 419.746 4.6661 410.414L57.5486 54.2344C53.9192 51.642 45.1049 44.9018 38.8834 38.6807C31.1066 30.9042 26.4405 13.7944 52.8817 4.46219C79.323 -4.87002 158.647 -3.31465 253.524 46.4571C348.402 96.2289 377.954 173.997 390.397 209.771C402.84 245.544 379.509 250.21 367.066 250.21H346.846Z" fill="#CC2832" />
        <g data-morph-details>
          <circle cx="113.542" cy="163.104" r="46.6611" fill="white" />
          <circle cx="157.094" cy="262.655" r="31.1074" fill="white" />
          <circle cx="250.399" cy="234.658" r="40.4396" fill="white" />
          <circle cx="60.6359" cy="352.866" r="24.8859" fill="white" />
          <path d="M150.434 316.506L110.892 327.017M85.6118 235.512L76.5511 275.411M203.246 137.127L213.706 176.683" stroke="white" strokeWidth="12.8908" strokeLinecap="round" />
          <path d="M28.0068 55.7924C47.1897 49.5709 88.3551 38.9944 99.5538 46.4601C113.552 55.7924 88.6662 74.4559 113.552 74.4559C138.438 74.4559 166.435 49.57 177.322 65.1237C188.21 80.6774 167.99 94.6757 186.654 96.2311C205.319 97.7865 219.317 88.4543 230.205 102.453C241.092 116.451 241.092 124.228 253.535 142.892C265.978 161.557 290.864 149.114 297.086 164.667C303.307 180.221 278.421 194.219 306.418 203.552C334.414 212.884 346.857 215.994 346.857 220.661" stroke="white" strokeWidth="12.8908" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (name === "coffee") {
    return (
      <svg className={`${className} morph-brand-icon`} viewBox="0 0 294 341" fill="none" aria-hidden="true" data-morph-icon="coffee" data-brand-source={asset("/images/brand/red-cup.svg")}>
        <path data-morph-start d="M219 201C219 240.765 186.765 273 147 273C107.235 273 75 240.765 75 201C75 161.235 107.235 129 147 129C186.765 129 219 161.235 219 201Z" />
        <path data-morph-main d="M214.834 298.648C188.932 330.766 164.067 340.089 120.554 340.089C61.4987 340.089 30.4185 309.009 11.7698 272.748C-6.87895 236.486 -0.662707 189.864 11.7698 167.072C24.2023 144.279 72.8961 140.134 112.266 138.062C151.635 135.99 195.149 143.243 214.834 152.567C230.581 160.026 236.59 176.395 237.627 183.647C266.636 175.359 302.897 202.296 291.501 246.846C282.383 282.486 236.59 296.23 214.834 298.648Z" fill="#CC2832" />
        <g data-morph-details>
          <path d="M119.531 33.4213C119.531 36.7366 115.041 36.8749 113.314 35.4935C105.026 28.8636 103.99 25.1331 95.7012 25.1331C82.5954 25.1331 76.0174 33.4213 73.9453 49.998C71.7569 67.5048 92.5954 70.7187 110.207 83.1512C127.819 95.5837 118.496 126.665 117.459 121.485C115.386 111.125 102.932 92.4755 81.1863 86.2593C65.5943 81.8022 48.0434 68.6468 55.2956 40.6737C62.5479 12.7006 79.3295 7.25209 92.5931 9.59252C110.207 12.7005 119.531 29.2772 119.531 33.4213Z" fill="#CC2832" />
          <path d="M232.442 264.456C238.244 257.825 239.694 227.158 239.694 212.654C254.199 204.366 271.811 218.87 266.631 237.519C261.451 256.168 225.19 272.744 232.442 264.456Z" fill="white" />
          <path d="M30.4209 171.216C35.3939 160.441 92.5833 156.366 120.556 155.675C141.278 154.762 215.872 160.855 211.728 174.324C207.583 187.792 136.097 189.864 120.556 189.864C105.016 189.864 24.2046 184.684 30.4209 171.216Z" fill="white" />
          <path d="M138.259 104.696L138.174 104.907C129.887 97.6544 131.957 75.8974 152.678 63.4649C173.399 51.0324 172.95 38.9348 169.255 30.3117C163.039 15.807 152.678 12.6992 142.318 15.807C129.379 19.6883 126.772 25.1317 123.67 22.0233C117.769 16.1114 135.058 2.33918 149.571 0.266489C161.265 -1.40359 187.904 4.41088 192.048 28.2398C196.192 52.0687 181.687 68.6451 167.183 74.8613C146.671 83.6523 141.05 97.7131 138.259 104.696Z" fill="#CC2832" />
        </g>
      </svg>
    );
  }

  return (
    <svg className={`${className} morph-brand-icon`} viewBox="0 0 213 356" fill="none" aria-hidden="true" data-morph-icon="dolci" data-brand-source={asset("/images/brand/red-ice-cream.svg")}>
      <path data-morph-start d="M166.5 150C166.5 183.137 139.637 210 106.5 210C73.363 210 46.5 183.137 46.5 150C46.5 116.863 73.363 90 106.5 90C139.637 90 166.5 116.863 166.5 150Z" />
      <path data-morph-main d="M120.607 4.76264C100.321 -7.58536 70.9946 6.96763 58.8671 15.7876C62.1743 13.5821 76.5074 25.7106 83.1224 45.5556C89.7374 65.4006 55.5599 68.7081 36.8171 84.1431C21.8229 96.4911 26.1595 119.423 30.2021 129.346C38.1398 122.29 68.7897 119.791 83.1224 119.423C61.0724 122.069 39.7574 128.611 32.4074 135.961C25.7923 133.021 9.49163 131.11 1.55363 151.396C-6.38436 171.682 18.0746 185.941 30.2021 185.573C31.6721 193.291 35.0531 211.151 36.8171 220.853C38.5811 230.555 46.3721 231.51 50.0471 230.775H158.092C166.03 230.775 170.955 224.16 172.425 220.853L176.835 194.393L190.065 185.573C193.74 182.633 202.854 172.784 209.91 156.908C218.73 137.063 204.397 110.603 174.63 108.398C150.816 106.634 117.667 126.038 104.07 135.961C120.828 114.793 158.092 102.886 174.63 99.5781C174.997 91.1256 172.204 72.6771 158.092 66.5031C143.98 60.3291 106.642 72.0156 89.7371 78.6306C98.5571 68.0466 132.367 60.2556 148.17 57.6831C158.092 46.6581 145.965 20.1976 120.607 4.76264Z" fill="#CC2832" />
      <path data-morph-details d="M55.585 236.284H155.912L136.067 347.637C133.862 349.842 124.601 354.472 105.197 355.354C85.7934 356.236 77.2674 350.577 75.4299 347.637L55.585 236.284Z" fill="#CC2832" />
    </svg>
  );
}

export default function Home() {
  const pizzaMenu = menu.find((category) => category.id === "pizza")!;
  const sideMenu = menu.filter((category) => category.id !== "pizza");
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    telephone: business.phoneInternational,
    servesCuisine: ["Pizza", "Italian-inspired"],
    address: { "@type": "PostalAddress", streetAddress: "20 Brickfield Road", addressLocality: "Salt River", addressRegion: "Cape Town", addressCountry: "ZA" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "18:00" }],
    sameAs: [business.instagramUrl],
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="top-chrome" data-top-chrome>
        <div className="announcement" role="note" aria-label="Made fresh. Taken seriously by no one. Wood-fired in Salt River. Monday to Saturday, 10:00 to 18:00.">
          <div className="announcement-track" aria-hidden="true">
            <span className="announcement-run">{announcementCopy}</span>
            <span className="announcement-run">{announcementCopy}</span>
          </div>
        </div>

        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Pizza Ratto home"><img src={asset("/images/brand/pizza-ratto-wordmark.svg")} alt="" width={862} height={712} /></a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#story">About</a><a href="#menu">Menu</a><a href="#visit">Visit</a>
          </nav>
          <a className="button button-small brand-action" href={business.whatsappUrl}><BrandIcon name="whatsapp" />Order now</a>
          <MobileNavigation />
        </header>
      </div>

      <div className="nav-transition" data-nav-transition aria-hidden="true">
        <span className="nav-transition-checker" />
        <div className="nav-transition-copy">
          <small>Next stop</small>
          <strong data-nav-transition-label>Menu</strong>
        </div>
        <span className="nav-transition-wheel" />
        <span className="nav-transition-speed nav-transition-speed-one" />
        <span className="nav-transition-speed nav-transition-speed-two" />
      </div>

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main" tabIndex={-1}>
        <section
          className="hero-shell"
          id="top"
          tabIndex={-1}
          style={{ "--hero-paper-image": `url("${asset("/images/hero-paper-texture.png")}")` } as CSSProperties}
        >
          <div className="checker-strip" aria-hidden="true" />
          <div className="hero-art" data-hero-art data-parallax="24">
            <img src={asset("/images/hero-logo-mascot.png")} alt="Pizza Ratto hand-painted logo beside Remi the rat riding a Vespa" loading="eager" fetchPriority="high" />
          </div>
          <div className="hero-copy" data-hero-copy>
            <p className="hero-eyebrow">Wood-fired · Salt River · Cape Town</p>
            <h1 data-split="load">Pizza with<br /><span className="hero-accent">street‑corner attitude.</span></h1>
            <p>Hand-stretched, fired hot and ready for collection.</p>
            <div className="hero-actions">
              <a className="button brand-action" href={business.whatsappUrl}><BrandIcon name="whatsapp" />Order on WhatsApp</a>
              <a className="hero-phone" href={`tel:${business.phoneInternational}`}>{business.phoneDisplay}</a>
            </div>
          </div>
          <aside className="hero-stamp smooth-float" aria-label="Opening hours">
            <span>Open</span><strong>MON—SAT</strong><b>10—18</b>
          </aside>
          <p className="hero-footnote">Proper ingredients · questionable mascot · zero fuss</p>
          <div className="checker-strip checker-bottom" aria-hidden="true" />
        </section>

        <ScrollChoreography
          remiSrc={asset("/images/ratto-vespa-red.png")}
          pullImageSrc={asset("/images/owner-2026/venue-table.webp")}
          varaFontSrc={asset("/fonts/vara/satisfy.json")}
        />

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            <span className="ticker-copy">{tickerCopy}</span>
            <span className="ticker-copy">{tickerCopy}</span>
          </div>
        </div>

        <section className="manifesto section-pad" id="story" tabIndex={-1} data-scene="story" data-transition="paper-left" data-lock-chapter="story" data-lock-scroll="1.1">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <p className="section-number">01 / WHAT WE’RE ABOUT</p>
          <div>
            <p className="manifesto-kicker">A little about Pizza Ratto</p>
            <h2 className="spaced-heading" data-split="scroll">Respect fire,<br />time &amp; tomatoes.</h2>
            <p>We’re not saving the world. We’re making it better one pizza at a time. Dough stretched by hand. Proper ingredients. Big Bertha running hot. No gimmicks.</p>
          </div>
          <aside className="smooth-float"><b>HOUSE RULES</b>{facts.map((fact, index) => <span key={fact}>{String(index + 1).padStart(2, "0")} — {fact}</span>)}</aside>
        </section>

        <section className="menu-portal section-pad" aria-labelledby="menu-portal-title" data-scene="menu-portal" data-transition="iris" data-lock-chapter="menu-portal" data-lock-scroll="1.35">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <p className="section-number">02 / THE IMPORTANT BIT</p>
          <div className="menu-portal-copy">
            <p>Twelve rides. One very hot oven.</p>
            <h2 id="menu-portal-title" aria-label="Pick your ride" data-split="scroll">Pick your<br /><span className="portal-accent" aria-hidden="true">ride.</span></h2>
            <a className="button button-dark" href="#menu">Explore the menu ↓</a>
          </div>
          {portalPizzas.map((name, index) => {
            const photo = pizzaPhotos[name];
            return <figure className={`portal-pizza portal-pizza-${index + 1}`} data-parallax={18 + index * 8} key={name}><img src={asset(photo.src)} alt={photo.alt} loading="lazy" /></figure>;
          })}
        </section>

        <section className="menu-section" id="menu" tabIndex={-1} aria-labelledby="pizza-heading" data-scene-root="menu">
          <div className="menu-pizza-sequence">
            <div className="menu-pizza-stage" data-scene="pizza-menu" data-transition="shutter-left">
              <span className="scene-curtain" aria-hidden="true" />
              <div className="menu-marquee-title" data-scroll-marquee aria-hidden="true"><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span></div>
              <div className="menu-inner section-pad">
                <header className="flyer-menu-title">
                  <div><p>{pizzaMenu.kicker}</p><h2 id="pizza-heading" data-split="scroll">Pizza</h2></div>
                  <div className="menu-fire-mark"><MorphBrandMark name="pizza" className="menu-brand-icon" /><span>Wood-fired<br />by Big Bertha</span></div>
                </header>
                <div className="menu-rail-window">
                  <ul className="pizza-collage">
                    {pizzaMenu.items.map((item) => {
                      const photo = pizzaPhotos[item.name];
                      return (
                        <li className={photo ? "has-pizza-photo" : "has-placeholder-photo"} key={item.name}>
                          {photo
                            ? <div className="pizza-cutout"><img src={asset(photo.src)} alt={photo.alt} loading="lazy" decoding="async" /></div>
                            : <div className="pizza-cutout pizza-placeholder" role="img" aria-label={`${item.name} pizza photo placeholder`}><span>Pizza photo<br />coming hot</span></div>}
                          <div className="pizza-label">
                            <div><b>{item.name}</b><strong>{Array.isArray(item.price) ? item.price.map((price) => <span key={price.label}>{price.label} {zar(price.price)}</span>) : zar(item.price)}</strong></div>
                            {item.description && <p>{item.description}</p>}
                            {item.note && <small className="menu-note">{item.note}</small>}
                            {item.featured && <small>House favourite. No sensible reason required.</small>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="menu-stage-footer">
                  <p className="sauce-note smooth-float">Hot honey &amp; rat sauce · R15 each</p>
                </div>
              </div>
            </div>
          </div>

          <div className="small-menu-view section-pad" data-scene="small-menu" data-transition="cards-up">
            <span className="scene-curtain" aria-hidden="true" />
            <p className="section-number">02 / COFFEE &amp; DOLCI</p>
            <div className="small-menu-grid">
              {sideMenu.map((category) => (
                <section className={`menu-category menu-${category.id}`} key={category.id} aria-labelledby={`${category.id}-heading`}>
                  <header><div><p>{category.kicker}</p><h3 id={`${category.id}-heading`}>{category.name}</h3></div><span className="category-mark"><MorphBrandMark name={category.id === "coffee" ? "coffee" : "dolci"} className="category-icon" /><small>{category.id === "coffee" ? "HOT / COLD" : "SAVE ROOM"}</small></span></header>
                  <ul>
                    {category.items.map((item) => (
                      <li key={item.name}>
                        <div><b>{item.name}</b>{item.description && <p>{item.description}</p>}{item.note && <small>{item.note}</small>}</div>
                        <strong>{Array.isArray(item.price) ? item.price.map((price) => <span key={price.label}>{price.label} {zar(price.price)}</span>) : zar(item.price)}</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="counter-tapes section-pad" aria-labelledby="counter-tapes-title" data-scene="counter-tapes" data-transition="counter-static" data-lock-chapter="counter-tapes" data-lock-scroll="1.8">
            <span className="scene-curtain" aria-hidden="true" />
            <span className="chapter-progress" aria-hidden="true"><i /></span>
            <header className="counter-tapes-header">
              <div><p className="section-number">FROM THE COUNTER / 07 SHORTS</p><h2 id="counter-tapes-title" data-split="scroll">Fresh proof.<br /><em>No filters.</em></h2></div>
              <div className="counter-tapes-note"><img className="counter-brand-banner" src={asset("/images/brand/wordmark-banner.svg")} alt="" aria-hidden="true" /><p>A few seconds from Big Bertha, the pass and the counter. Swipe sideways for the full roll.</p></div>
            </header>
            <div className="counter-reel" aria-label="Short owner videos from Pizza Ratto">
              {counterTapes.map((tape, index) => (
                <figure className="counter-tape" key={tape.src}>
                  <div className="counter-tape-media">
                    <video autoPlay loop muted playsInline preload="metadata" poster={asset(tape.poster)} aria-hidden="true" disablePictureInPicture><source src={asset(tape.src)} type="video/mp4" /></video>
                    <img className="counter-still" src={asset(tape.poster)} alt="" aria-hidden="true" loading="lazy" />
                  </div>
                  <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{tape.label}</figcaption>
                </figure>
              ))}
            </div>
            <div className="counter-gooey-transition" aria-hidden="true">
              <svg className="counter-gooey-defs" width="0" height="0" focusable="false">
                <defs>
                  <filter id="counter-gooey-filter" x="-20%" y="-20%" width="140%" height="170%" colorInterpolationFilters="sRGB">
                    <feTurbulence className="counter-gooey-noise" type="fractalNoise" baseFrequency="0.006 0.014" numOctaves="2" seed="8" result="noise" />
                    <feDisplacementMap className="counter-gooey-displacement" in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                    <feGaussianBlur in="displaced" stdDeviation="21" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 32 -14" result="goo" />
                  </filter>
                </defs>
              </svg>
              <div className="counter-gooey-surface">
                <span className="counter-gooey-sheet" />
                <span className="counter-gooey-drop counter-gooey-drop-1" />
                <span className="counter-gooey-drop counter-gooey-drop-2" />
                <span className="counter-gooey-drop counter-gooey-drop-3" />
                <span className="counter-gooey-drop counter-gooey-drop-4" />
                <span className="counter-gooey-drop counter-gooey-drop-5" />
                <span className="counter-gooey-drop counter-gooey-drop-6" />
                <span className="counter-gooey-drop counter-gooey-drop-7" />
              </div>
              <div className="counter-gooey-copy">
                <canvas className="counter-morph-canvas" width="394" height="437" aria-hidden="true" />
                <strong>NEXT / BUILT DIFFERENT</strong>
                <svg className="counter-morph-svg" viewBox="0 0 394 437" fill="none" aria-hidden="true">
                  <path data-counter-morph-path d="M197 76C272.111 76 333 136.889 333 212C333 287.111 272.111 348 197 348C121.889 348 61 287.111 61 212C61 136.889 121.889 76 197 76Z" fill="currentColor" />
                  <path data-counter-morph-target d="M346.846 250.21L38.8834 422.856C23.3305 432.189 3.11074 439.966 0 435.3C0 435.3 3.11074 419.746 4.6661 410.414L57.5486 54.2344C53.9192 51.642 45.1049 44.9018 38.8834 38.6807C31.1066 30.9042 26.4405 13.7944 52.8817 4.46219C79.323 -4.87002 158.647 -3.31465 253.524 46.4571C348.402 96.2289 377.954 173.997 390.397 209.771C402.84 245.544 379.509 250.21 367.066 250.21H346.846Z" />
                  <g data-counter-morph-details>
                    <circle cx="113.542" cy="163.104" r="46.6611" />
                    <circle cx="157.094" cy="262.655" r="31.1074" />
                    <circle cx="250.399" cy="234.658" r="40.4396" />
                    <circle cx="60.6359" cy="352.866" r="24.8859" />
                    <path d="M150.434 316.506L110.892 327.017" />
                    <path d="M85.6118 235.512L76.5511 275.411" />
                  </g>
                </svg>
              </div>
            </div>
        </section>

        <section className="ingredients" aria-labelledby="ingredients-title" data-scene="ingredients" data-transition="split" data-lock-chapter="ingredients" data-lock-scroll="1.15">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <div className="ingredient-photo" data-parallax="22"><img src={asset("/images/owner-2026/feast-landscape.webp")} alt="A full Pizza Ratto table spread with pizzas, desserts, hot honey and fresh ingredients" loading="lazy" /></div>
          <div className="ingredient-copy section-pad"><img className="ingredient-chef-hat" src={asset("/images/brand/chef-hat.webp")} alt="" aria-hidden="true" /><p className="section-number">03 / BUILT DIFFERENT</p><h2 id="ingredients-title" className="spaced-heading" data-split="scroll">Proper ingredients.<br /><em>Questionable mascot.</em></h2><p>Our dough is stretched by hand and fired with intent. Italian mozzarella comes from Puglia. Our meat toppings are halal and sourced from Mubarak Food Emporium.</p><p className="scribble">No shortcuts. No sad crusts.</p></div>
        </section>

        <section className="remi-story section-pad" aria-labelledby="remi-title" data-scene="characters" data-transition="remi-poster" data-lock-chapter="characters" data-lock-scroll="1.8">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <span className="remi-backdrop-word" aria-hidden="true">RATTO</span>
          <header className="remi-story-heading">
            <p className="section-number">MEET THE MASCOT / RAT #01</p>
            <h2 id="remi-title" data-split="scroll">Meet<br /><em>Remi.</em></h2>
            <p>Resident rat. Patron saint of good decisions made near a pizza oven. Around the room, his mural was painted by local artist Buffy.</p>
          </header>
          <figure className="remi-bertha-feature">
            <div className="remi-bertha-images">
              <img src={asset("/images/owner-2026/video-stills/oven-close.webp")} alt="A pizza baking beside the flames inside Pizza Ratto's wood-fired oven, Big Bertha" loading="lazy" />
              <img src={asset("/images/owner-2026/video-stills/oven-flames.webp")} alt="" aria-hidden="true" loading="lazy" />
            </div>
            <figcaption className="remi-bertha-card">
              <span>FIRE #01 / HEART OF THE HOUSE</span>
              <strong>Big Bertha.</strong>
              <p>The wood-fired heart of the operation. Every pizza meets the flame here.</p>
            </figcaption>
          </figure>
          <figure className="remi-disintegration" data-remi-disintegration>
            <span className="remi-checker" aria-hidden="true" />
            <div className="remi-disintegration-media">
              <img className="remi-disintegration-source" src={asset("/images/ratto-vespa-cutout.png")} alt="Hand-drawn Remi riding a bright red Vespa while eating pepperoni pizza" width={1096} height={1436} loading="eager" decoding="async" />
              <div className="remi-fragments" data-remi-fragments aria-hidden="true" />
            </div>
            <figcaption>Approach with pizza. He startles easily.</figcaption>
          </figure>
          <div className="remi-vanish-copy" aria-hidden="true"><span>POOF.</span><strong>Gone for pizza.</strong></div>
        </section>

        <section className="social-showcase section-pad" aria-labelledby="social-title" data-social-showcase data-scene="social" data-transition="deck" data-lock-chapter="social" data-lock-scroll="1.75">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <div className="social-drawn-word" id="social-ratto-drawing" data-social-word-drawing aria-hidden="true" />
          <div className="social-mural" aria-hidden="true">
            <span className="social-mural-wheel" />
            <span className="social-mural-slice" />
            <span className="social-mural-tail" />
          </div>
          <header className="social-heading">
            <div><p className="section-number">04 / RATTO SOCIAL CLUB</p><p className="social-kicker">Inside the rat hole. Out in the wild.</p></div>
            <h2 id="social-title" data-split="scroll">Never pizza solo.</h2>
            <p>Follow the daily damage, fresh pies and questionable decisions.</p>
          </header>
          <div className="social-collage" data-social-collage>
            <figure className="social-card social-card-room" data-social-card="room"><img src={asset("/images/interior.webp")} alt="Pizza Ratto dining room with brick walls, vintage furniture and a Vespa" loading="lazy" /></figure>
            <figure className="social-card social-card-table" data-social-card="table"><img src={asset("/images/owner-2026/venue-table.webp")} alt="Overhead Pizza Ratto table spread beside a blue Vespa inside the restaurant" loading="lazy" /></figure>
            <figure className="social-card social-card-feast" data-social-card="feast"><img src={asset("/images/owner-2026/feast-collage.webp")} alt="A colourful Pizza Ratto feast of wood-fired pizzas, dips and desserts" loading="lazy" /></figure>
            <figure className="social-card social-card-sweet" data-social-card="sweet"><img src={asset("/images/owner-2026/dessert-limone.webp")} alt="Two lemon-shaped creamy desserts with mint and fresh lemon leaves" loading="lazy" /></figure>
            <a className="social-follow-link" href={business.instagramUrl} target="_blank" rel="noreferrer" aria-label={`Follow Pizza Ratto on Instagram ${business.instagramHandle}`}>
              <span className="social-follow-badge" data-social-follow-cursor><BrandIcon name="instagram" />Follow {business.instagramHandle}</span>
            </a>
          </div>
          <div className="social-filmstrip" aria-hidden="true"><span>ROOM FOR ONE MORE</span><span>FOLLOW THE RAT</span><span>CAFFE · PIZZA · CHAOS</span><span>FOLLOW THE RAT</span></div>
        </section>

        <section className="visit section-pad" id="visit" tabIndex={-1} data-scene="visit" data-transition="shutter-right" data-lock-chapter="visit" data-lock-scroll="1.05">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <div><p className="section-number">05 / FIND THE FIRE</p><h2 className="spaced-heading" data-split="scroll">Salt River.<br />Come say ciao.</h2><p className="visit-intro">Fresh from the oven. Straight to your face — collection only.</p></div>
          <dl><div><dt>Where</dt><dd>{business.location}<small>{business.deliveryNote}</small></dd></div><div><dt>When</dt><dd>{business.hours}</dd></div><div><dt>Call / WhatsApp</dt><dd><a href={`tel:${business.phoneInternational}`}>{business.phoneDisplay}</a></dd></div></dl>
          <div className="visit-actions"><a className="button brand-action" href={business.whatsappUrl}><BrandIcon name="whatsapp" />WhatsApp an order ↗</a><a className="button button-outline" href={business.uberEatsUrl} target="_blank" rel="noreferrer">Order on Uber Eats ↗</a><a className="button button-outline" href={`tel:${business.phoneInternational}`}>Call the shop</a></div>
        </section>
          </main>

          <footer>
            <div className="footer-checker" aria-hidden="true" />
            <div className="footer-mark">PIZZA<br />RATTO</div>
            <p>{business.tagline}</p>
            <p>{business.location} · {business.hours}</p>
            <div className="footer-end"><p>© {new Date().getFullYear()} Pizza Ratto · Built with fire, not focus groups.</p><a className="footer-social" href={business.instagramUrl} target="_blank" rel="noreferrer" aria-label={`Pizza Ratto on Instagram ${business.instagramHandle}`}><BrandIcon name="instagram" /></a></div>
          </footer>
        </div>
      </div>
      <nav className="mobile-order-bar" aria-label="Quick order actions"><a href={business.whatsappUrl}><BrandIcon name="whatsapp" />WhatsApp</a><a href={`tel:${business.phoneInternational}`}>Call</a><a href="#menu">Menu</a></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
