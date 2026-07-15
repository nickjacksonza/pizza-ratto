# Content verification and launch checklist

This document separates what is implemented from what has been independently confirmed. Presence in the UI is not proof that a fact is current.

## Implemented in `data/business.ts`

- Phone: `082 525 0380` / `+27 82 525 0380`
- Address: 20 Brickfield Road, Salt River, Cape Town
- Hours: Monday–Saturday, 10:00–18:00
- Service model: collection only
- Instagram: `@pizza_ratto`
- WhatsApp ordering link with a prefilled message
- Pizza Ratto Uber Eats store link

These values were derived from the supplied flyer and owner-provided links. Reconfirm them with the owner before a formal launch, large campaign or printed QR-code update.

## Still requires owner confirmation

- Final canonical domain. GitHub Pages is currently public, while an OpenAI Sites target also exists.
- Official directions/Google Maps destination; no map link is currently published.
- Current hours, holiday exceptions and Sunday closure.
- Whether delivery is available outside Uber Eats and any radius, minimum order or terms.
- Final menu availability, prices and spelling of `Arcobaleno`.
- Correct spelling and description of `Crema Dulce`.
- Whether the R10 decaf listing is an add-on rather than a standalone item.
- Gelato flavour/topping structure and whether it changes.
- What the Limoncello listing represents and whether age-related wording is required.
- Whether only meat toppings are halal and whether any certification exists.
- Whether imported mozzarella from Puglia remains accurate.
- Whether Mubarak Food Emporium should be named publicly.
- Approved story for Remi, Buffy, Big Bertha and Vestoration.
- Image credits and permission to use every supplied/generated image.
- Privacy, analytics, cookie and website-credit requirements.

## Menu imagery still needed

- Sprint currently uses a clearly labelled placeholder.
- Veloce currently uses a clearly labelled placeholder.
- Higher-resolution original photography would improve the menu and reduce reliance on flyer crops.

## Safe claim guidance

Current cautious wording is: “Our meat toppings are halal and sourced from Mubarak Food Emporium.” This describes the ingredients and does **not** claim that the restaurant or kitchen is halal certified. Do not broaden that claim without documentary confirmation.

## Update workflow

When a fact is confirmed:

1. Update the relevant value in `data/business.ts` or `data/menu.ts`.
2. Update this checklist and any affected narrative in `brand-profile.md`.
3. Run the checks in [`testing.md`](testing.md).
4. Verify the visible desktop and mobile presentation before publishing.
