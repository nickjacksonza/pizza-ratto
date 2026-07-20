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
            <h1 data-split="load">Pizza with<br /><span className="hero-accent">street-corner attitude.</span></h1>
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
                  <span>Wood-fired<br />by Big Bertha<img className="menu-brand-icon" src={asset("/images/brand/red-pizza-slice.svg")} alt="" aria-hidden="true" /></span>
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
                  <header><div><p>{category.kicker}</p><h3 id={`${category.id}-heading`}>{category.name}</h3></div><span>{category.id === "coffee" ? "HOT / COLD" : "SAVE ROOM"}<img className="category-icon" src={asset(category.id === "coffee" ? "/images/brand/red-cup.svg" : "/images/brand/chef-hat.webp")} alt="" aria-hidden="true" /></span></header>
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

          <section className="counter-tapes section-pad" aria-labelledby="counter-tapes-title">
            <header className="counter-tapes-header">
              <div><p className="section-number">FROM THE COUNTER / 07 SHORTS</p><h2 id="counter-tapes-title">Fresh proof.<br /><em>No filters.</em></h2></div>
              <div className="counter-tapes-note"><img src={asset("/images/brand/wordmark-banner.svg")} alt="" aria-hidden="true" /><p>A few seconds from Big Bertha, the pass and the counter. Swipe sideways for the full roll.</p></div>
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
              <figure className="counter-tape counter-art-card">
                <div className="counter-tape-media"><img src={asset("/images/brand/figma-poster.webp")} alt="Pizza Ratto Figma poster with Remi on a Vespa" loading="lazy" /></div>
                <figcaption><span>08</span>From the Figma drawer</figcaption>
              </figure>
              <figure className="counter-tape counter-event-card">
                <div className="counter-tape-media"><img src={asset("/images/owner-2026/backgammon-tournament.webp")} alt="Pizza Ratto backgammon tournament poster with August rounds and a September final" loading="lazy" /></div>
                <figcaption><span>09</span>Owner archive / dates on artwork</figcaption>
              </figure>
            </div>
          </section>
        </section>

        <section className="ingredients" aria-labelledby="ingredients-title" data-scene="ingredients" data-transition="split" data-lock-chapter="ingredients" data-lock-scroll="1.15">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <div className="ingredient-photo" data-parallax="22"><img src={asset("/images/owner-2026/feast-landscape.webp")} alt="A full Pizza Ratto table spread with pizzas, desserts, hot honey and fresh ingredients" loading="lazy" /></div>
          <div className="ingredient-copy section-pad"><img className="ingredient-chef-hat" src={asset("/images/brand/chef-hat.webp")} alt="" aria-hidden="true" /><p className="section-number">03 / BUILT DIFFERENT</p><h2 id="ingredients-title" className="spaced-heading" data-split="scroll">Proper ingredients.<br /><em>Questionable mascot.</em></h2><p>Our dough is stretched by hand and fired with intent. Italian mozzarella comes from Puglia. Our meat toppings are halal and sourced from Mubarak Food Emporium.</p><p className="scribble">No shortcuts. No sad crusts.</p></div>
        </section>

        <section className="characters section-pad" data-scene="characters" data-transition="columns" data-lock-chapter="characters" data-lock-scroll="1.15">
          <span className="scene-curtain" aria-hidden="true" />
          <span className="chapter-progress" aria-hidden="true"><i /></span>
          <div className="character-copy">
            <span className="sticker">RAT #01</span>
            <h2 data-split="scroll">Meet Remi.</h2>
            <p>Our resident rat and patron saint of good decisions made near a pizza oven. You’ll find him around the room, including a mural painted by local artist Buffy.</p>
          </div>
          <div className="character-art character-art-owner" data-parallax="34"><img src={asset("/images/owner-2026/remi-vespa-mural.webp")} alt="Owner-supplied mural of Remi riding a red Vespa while holding a slice of pizza" width={1400} height={1384} loading="lazy" /></div>
          <div className="bertha-note"><span className="sticker">FIRE #01</span><h3>Big Bertha.</h3><p>The wood-fired heart of the operation. Hot, loud and not remotely interested in your schedule.</p></div>
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
