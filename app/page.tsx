/* eslint-disable @next/next/no-img-element */
import { MobileNavigation } from "../components/MobileNavigation";
import { business } from "../data/business";
import { menu, zar } from "../data/menu";

export const dynamic = "force-static";

const facts = ["Hand-stretched", "Wood-fired", "Proper ingredients", "Zero fuss"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${basePath}${path}`;

const pizzaPhotos: Record<string, { src: string; alt: string }> = {
  "Bianca & Dip": { src: "/images/pizza-bianca.webp", alt: "Bianca flatbread with rosemary and fresh dip" },
  Primavera: { src: "/images/pizza-primavera.webp", alt: "Primavera pizza with tomato, mozzarella and basil" },
  Arcobaleno: { src: "/images/pizza-arcobaleno.webp", alt: "Arcobaleno pizza with salami, mushrooms, feta and rocket" },
  Rally: { src: "/images/pizza-rally.webp", alt: "Rally pizza with smoked chicken, mushrooms and avocado" },
};

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
      <div className="announcement">Made fresh. Taken seriously by no one. <span>◆</span> Wood-fired in Salt River <span>◆</span> {business.hours}</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Pizza Ratto home">PIZZA <i>RATTO</i></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#menu">Menu</a><a href="#story">Our story</a><a href="#visit">Visit</a>
        </nav>
        <a className="button button-small" href={business.whatsappUrl}>Order pizza</a>
        <MobileNavigation />
      </header>

      <main id="main">
        <section className="hero-poster" id="top">
          <h1 className="sr-only">Pizza Ratto — wood-fired pizza in Salt River, Cape Town</h1>
          <div className="checker-strip" aria-hidden="true" />
          <div className="hero-brand-block">
            <div className="hero-logo-art">
              <img src={asset("/images/hero-logo-mascot.png")} alt="Pizza Ratto hand-painted logo beside the rat mascot riding a Vespa" loading="eager" fetchPriority="high" />
            </div>
            <p className="hero-promise">Made fresh. Taken seriously by no one.</p>
          </div>
          <aside className="hero-details" aria-label="Order and opening information">
            <a className="hero-phone" href={`tel:${business.phoneInternational}`}>{business.phoneDisplay}</a>
            <p>WhatsApp &amp; calls</p>
            <div className="hero-detail-rule" />
            <b>OPEN</b>
            <strong>{business.hours}</strong>
            <span>{business.location}</span>
            <a className="button poster-button" href={business.whatsappUrl}>Order on WhatsApp ↗</a>
          </aside>
          <p className="hero-footnote">Hand-stretched · proper ingredients · fired by Big Bertha</p>
          <div className="checker-strip checker-bottom" aria-hidden="true" />
        </section>

        <div className="ticker" aria-hidden="true"><div>ITALIAN SOUL ★ STREET-CORNER ATTITUDE ★ PIZZA, DONE PROPERLY ★ </div></div>

        <section className="manifesto section-pad" id="story">
          <p className="section-number">01 / WHAT WE’RE ABOUT</p>
          <div>
            <h2>Respect fire,<br />time & tomatoes.</h2>
            <p>We’re not saving the world. We’re making it better one pizza at a time. Dough stretched by hand. Proper ingredients. Big Bertha running hot. No gimmicks.</p>
          </div>
          <aside><b>HOUSE RULES</b>{facts.map((fact, index) => <span key={fact}>{String(index + 1).padStart(2, "0")} — {fact}</span>)}</aside>
        </section>

        <section className="menu-section section-pad" id="menu">
          <div className="menu-heading"><p className="section-number">02 / THE IMPORTANT BIT</p><h2>Pick your ride.</h2><p>Pizza, coffee, dolci. Sorted.</p></div>
          <div className="flyer-menu" aria-labelledby="pizza-heading">
            <header className="flyer-menu-title">
              <div><p>{pizzaMenu.kicker}</p><h3 id="pizza-heading">Pizza</h3></div>
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
                      <div><b>{item.name}</b><strong>{Array.isArray(item.price) ? item.price.map((p) => <span key={p.label}>{p.label} {zar(p.price)}</span>) : zar(item.price)}</strong></div>
                      {item.description && <p>{item.description}</p>}
                      {item.featured && <small>House favourite. No sensible reason required.</small>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="sauce-note">Hot honey &amp; rat sauce · R15 each</p>
          </div>
          <div className="small-menu-grid">
            {sideMenu.map((category) => (
              <section className={`menu-category menu-${category.id}`} key={category.id} aria-labelledby={`${category.id}-heading`}>
                <header><div><p>{category.kicker}</p><h3 id={`${category.id}-heading`}>{category.name}</h3></div><span>{category.id === "coffee" ? "HOT / COLD" : "SAVE ROOM"}</span></header>
                <ul>
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div><b>{item.name}</b>{item.description && <p>{item.description}</p>}{item.note && <small>{item.note}</small>}</div>
                      <strong>{Array.isArray(item.price) ? item.price.map((p) => <span key={p.label}>{p.label} {zar(p.price)}</span>) : zar(item.price)}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="menu-source">
            <img src={asset("/images/menu-pizza.webp")} alt="The original in-store Pizza Ratto menu board" width={378} height={510} loading="lazy" />
            <p className="menu-fineprint">Menu and prices are the current supplied version. Availability can change when Big Bertha says so.</p>
            <span>THE ORIGINAL BOARD</span>
          </div>
        </section>

        <section className="ingredients section-pad">
          <div className="ingredient-photo"><img src={asset("/images/pizza-bianca.webp")} alt="Bianca pizza with rosemary beside a bowl of fresh dip" loading="lazy" /></div>
          <div className="ingredient-copy"><p className="section-number">03 / BUILT DIFFERENT</p><h2>Proper ingredients.<br /><em>Questionable mascot.</em></h2><p>Our dough is stretched by hand and fired with intent. Italian mozzarella comes from Puglia. Our meat toppings are halal and sourced from Mubarak Food Emporium.</p><p className="scribble">No shortcuts. No sad crusts.</p></div>
        </section>

        <section className="characters section-pad">
          <div className="remi-feature">
            <div className="character-card pink"><span className="sticker">RAT #01</span><h2>Meet Remi.</h2><p>Our resident rat and patron saint of good decisions made near a pizza oven. You’ll find him around the room, including a mural painted by local artist Buffy.</p></div>
            <div className="logo-poster red-vespa-poster"><img src={asset("/images/ratto-vespa-red.png")} alt="Hand-drawn rat riding a bright red Vespa while eating pepperoni pizza" width={1096} height={1435} loading="lazy" /></div>
          </div>
          <div className="character-card orange"><span className="sticker">FIRE #01</span><h2>Big Bertha.</h2><p>The wood-fired heart of the operation. Hot, loud and not remotely interested in your schedule.</p></div>
        </section>

        <section className="gallery section-pad" aria-labelledby="gallery-title">
          <div className="gallery-title"><p className="section-number">04 / INSIDE</p><h2 id="gallery-title">The rat hole.</h2><p>Pizza, scooters, old furniture and very good reasons to stay awhile.</p></div>
          <figure className="gallery-interior"><img src={asset("/images/interior.webp")} alt="Pizza Ratto interior with wooden tables, vintage furniture, exposed brick and a Vespa" loading="lazy" /></figure>
          <figure className="gallery-pizza-one"><img src={asset("/images/pizza-arcobaleno.webp")} alt="Arcobaleno pizza with salami, mushrooms, feta and rocket" loading="lazy" /></figure>
          <figure className="gallery-pizza-two"><img src={asset("/images/pizza-rally.webp")} alt="Rally pizza with smoked chicken, mushrooms, avocado" loading="lazy" /></figure>
          <p className="gallery-caption">Come hungry.<br />Leave slightly happier.</p>
        </section>

        <section className="visit section-pad" id="visit">
          <div><p className="section-number">05 / FIND THE FIRE</p><h2>Salt River.<br />Come say ciao.</h2><p className="visit-intro">Fresh from the oven. Straight to your face — collection only.</p></div>
          <dl><div><dt>Where</dt><dd>{business.location}<small>{business.deliveryNote}</small></dd></div><div><dt>When</dt><dd>{business.hours}</dd></div><div><dt>Call / WhatsApp</dt><dd><a href={`tel:${business.phoneInternational}`}>{business.phoneDisplay}</a></dd></div></dl>
          <div className="visit-actions"><a className="button button-dark" href={business.whatsappUrl}>WhatsApp an order ↗</a><a className="button button-outline" href={business.uberEatsUrl} target="_blank" rel="noreferrer">Order on Uber Eats ↗</a><a className="button button-outline" href={`tel:${business.phoneInternational}`}>Call the shop</a><a className="text-link" href={business.instagramUrl} target="_blank" rel="noreferrer">Instagram {business.instagramHandle} ↗</a></div>
        </section>
      </main>

      <footer><div className="footer-mark">PIZZA RATTO</div><p>{business.tagline}</p><p>{business.location} · {business.hours}</p><p>© {new Date().getFullYear()} Pizza Ratto · Built with fire, not focus groups.</p></footer>
      <nav className="mobile-order-bar" aria-label="Quick order actions"><a href={business.whatsappUrl}>WhatsApp</a><a href={`tel:${business.phoneInternational}`}>Call</a><a href="#menu">Menu</a></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
