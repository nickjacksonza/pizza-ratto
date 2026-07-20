/* eslint-disable @next/next/no-img-element */
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
      <div className="announcement" role="note" aria-label="Made fresh. Taken seriously by no one. Wood-fired in Salt River. Monday to Saturday, 10:00 to 18:00.">
        <div className="announcement-track" aria-hidden="true">
          <span className="announcement-run">{announcementCopy}</span>
          <span className="announcement-run">{announcementCopy}</span>
        </div>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Pizza Ratto home">PIZZA <i>RATTO</i></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story">About</a><a href="#menu">Menu</a><a href="#visit">Visit</a>
        </nav>
        <a className="button button-small brand-action" href={business.whatsappUrl}><BrandIcon name="whatsapp" />Order now</a>
        <MobileNavigation />
      </header>

      <main id="main">
        <section className="hero-shell" id="top">
          <div className="checker-strip" aria-hidden="true" />
          <div className="hero-art" data-hero-art data-parallax="24">
            <img src={asset("/images/hero-logo-mascot.png")} alt="Pizza Ratto hand-painted logo beside Remi the rat riding a Vespa" loading="eager" fetchPriority="high" />
          </div>
          <div className="hero-copy">
            <p className="hero-eyebrow">Wood-fired · Salt River · Cape Town</p>
            <h1 data-split="load">Pizza with<br /><span className="hero-accent">street-corner attitude.</span></h1>
            <p>Hand-stretched, fired hot and ready for collection.</p>
            <div className="hero-actions">
              <a className="button brand-action" href={business.whatsappUrl}><BrandIcon name="whatsapp" />Order on WhatsApp</a>
              <a className="hero-phone" href={`tel:${business.phoneInternational}`}>{business.phoneDisplay}</a>
            </div>
          </div>
          <aside className="hero-stamp" aria-label="Opening hours">
            <span>Open</span><strong>MON—SAT</strong><b>10—18</b>
          </aside>
          <p className="hero-footnote">Proper ingredients · questionable mascot · zero fuss</p>
          <div className="checker-strip checker-bottom" aria-hidden="true" />
        </section>

        <ScrollChoreography
          remiSrc={asset("/images/ratto-vespa-red.png")}
          varaFontSrc={asset("/fonts/vara/satisfy.json")}
        />

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            <span className="ticker-copy">{tickerCopy}</span>
            <span className="ticker-copy">{tickerCopy}</span>
          </div>
        </div>

        <section className="manifesto section-pad" id="story" data-panel="left">
          <p className="section-number">01 / WHAT WE’RE ABOUT</p>
          <div>
            <p className="manifesto-kicker">A little about Pizza Ratto</p>
            <h2 className="spaced-heading" data-split="scroll">Respect fire,<br />time &amp; tomatoes.</h2>
            <p>We’re not saving the world. We’re making it better one pizza at a time. Dough stretched by hand. Proper ingredients. Big Bertha running hot. No gimmicks.</p>
          </div>
          <aside><b>HOUSE RULES</b>{facts.map((fact, index) => <span key={fact}>{String(index + 1).padStart(2, "0")} — {fact}</span>)}</aside>
        </section>

        <section className="menu-portal section-pad" aria-labelledby="menu-portal-title" data-panel="iris">
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

        <section className="menu-section" id="menu" aria-labelledby="pizza-heading">
          <div className="menu-marquee-title" aria-hidden="true"><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span><span>PIZZA</span></div>
          <div className="menu-inner section-pad">
            <header className="flyer-menu-title">
              <div><p>{pizzaMenu.kicker}</p><h2 id="pizza-heading" data-split="scroll">Pizza</h2></div>
              <span>Wood-fired<br />by Big Bertha</span>
            </header>
            <ul className="pizza-collage">
              {pizzaMenu.items.map((item) => {
                const photo = pizzaPhotos[item.name];
                return (
                  <li className={photo ? "has-pizza-photo" : "has-placeholder-photo"} key={item.name}>
                    {photo
                      ? <div className="pizza-cutout"><img src={asset(photo.src)} alt={photo.alt} loading="lazy" /></div>
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
            <p className="sauce-note">Hot honey &amp; rat sauce · R15 each</p>

            <div className="small-menu-grid">
              {sideMenu.map((category) => (
                <section className={`menu-category menu-${category.id}`} key={category.id} aria-labelledby={`${category.id}-heading`}>
                  <header><div><p>{category.kicker}</p><h3 id={`${category.id}-heading`}>{category.name}</h3></div><span>{category.id === "coffee" ? "HOT / COLD" : "SAVE ROOM"}</span></header>
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

        <section className="ingredients" aria-labelledby="ingredients-title" data-panel="right">
          <div className="ingredient-photo" data-parallax="22"><img src={asset("/images/owner-2026/feast-landscape.webp")} alt="A full Pizza Ratto table spread with pizzas, desserts, hot honey and fresh ingredients" loading="lazy" /></div>
          <div className="ingredient-copy section-pad"><p className="section-number">03 / BUILT DIFFERENT</p><h2 id="ingredients-title" className="spaced-heading" data-split="scroll">Proper ingredients.<br /><em>Questionable mascot.</em></h2><p>Our dough is stretched by hand and fired with intent. Italian mozzarella comes from Puglia. Our meat toppings are halal and sourced from Mubarak Food Emporium.</p><p className="scribble">No shortcuts. No sad crusts.</p></div>
        </section>

        <section className="characters section-pad" data-panel="left">
          <div className="character-copy">
            <span className="sticker">RAT #01</span>
            <h2 data-split="scroll">Meet Remi.</h2>
            <p>Our resident rat and patron saint of good decisions made near a pizza oven. You’ll find him around the room, including a mural painted by local artist Buffy.</p>
          </div>
          <div className="character-art" data-parallax="34"><img src={asset("/images/ratto-vespa-red.png")} alt="Hand-drawn Remi riding a bright red Vespa while eating pepperoni pizza" width={1096} height={1435} loading="lazy" /></div>
          <div className="bertha-note"><span className="sticker">FIRE #01</span><h3>Big Bertha.</h3><p>The wood-fired heart of the operation. Hot, loud and not remotely interested in your schedule.</p></div>
        </section>

        <section className="gallery section-pad" aria-labelledby="gallery-title" data-gallery data-panel="up">
          <div className="gallery-intro">
            <div><p className="section-number">04 / INSIDE</p><h2 id="gallery-title" data-split="scroll">The rat hole.</h2></div>
            <p>Pizza, scooters, old furniture and very good reasons to stay awhile.</p>
          </div>
          <div className="gallery-stack">
            <figure className="gallery-card gallery-card-room" data-stack-card="room"><img src={asset("/images/interior.webp")} alt="Pizza Ratto dining room with brick walls, vintage furniture and a Vespa" loading="lazy" /></figure>
            <figure className="gallery-card gallery-card-table" data-stack-card="table"><img src={asset("/images/owner-2026/venue-table.webp")} alt="Overhead Pizza Ratto table spread beside a blue Vespa inside the restaurant" loading="lazy" /></figure>
            <figure className="gallery-card gallery-card-feast" data-stack-card="feast"><img src={asset("/images/owner-2026/feast-collage.webp")} alt="A colourful Pizza Ratto feast of wood-fired pizzas, dips and desserts" loading="lazy" /></figure>
            <figure className="gallery-card gallery-card-sweet" data-stack-card="sweet"><img src={asset("/images/owner-2026/dessert-limone.webp")} alt="Two lemon-shaped creamy desserts with mint and fresh lemon leaves" loading="lazy" /></figure>
            <p className="gallery-caption">Come hungry.<br />Leave slightly happier.</p>
          </div>
          <div className="gallery-filmstrip" aria-hidden="true"><span>ROOM FOR ONE MORE</span><span>CAFFE · PIZZA · CHAOS</span><span>ROOM FOR ONE MORE</span></div>
        </section>

        <section className="visit section-pad" id="visit" data-panel="right">
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
      <nav className="mobile-order-bar" aria-label="Quick order actions"><a href={business.whatsappUrl}><BrandIcon name="whatsapp" />WhatsApp</a><a href={`tel:${business.phoneInternational}`}>Call</a><a href="#menu">Menu</a></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
