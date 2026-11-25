# Housekeep Service Finder — Unofficial Demo

This is a standalone, responsive service-selection agent built from Housekeep's public website information.

## Open it

Double-click index.html to run the app in a browser. No installation or API key is required.

## What it does

- Distinguishes regular, one-off, deep, end-of-tenancy, after-builders, carpet/upholstery, and trades services.
- Accepts a plain-language job description and uses it when the customer is unsure.
- Adapts the intake for cleaning versus repair and maintenance work.
- Collects property, timing, frequency, extras, trade, and urgency details.
- Produces a booking-ready summary, explanation, preparation checklist, and official Housekeep quote link.
- Avoids payment details and does not claim live prices, availability, affiliation, or completed bookings.
- Shows the practical signals behind each recommendation and close alternatives where relevant.
- Detects possible gas, electrical, and active-flooding emergencies and surfaces immediate UK guidance before the booking route.

## Agent Mode

To deploy as a ChatGPT Agent with GPT-6 Luna:

1. Use the AGENT_SPEC.json and AGENT_INSTRUCTIONS.md files
2. Configure the agent on ChatGPT Sites with:
   - Model: GPT-6 Luna
   - Visibility: Public
   - Authentication: None
   - Duplication: Disabled

See AGENT_DEPLOYMENT.md for detailed deployment instructions.

## Privacy and security

- All intake data stays in browser memory and is cleared on refresh. There is no analytics, storage, tracking, or background network request.
- A restrictive Content Security Policy allows only the local HTML, CSS and JavaScript files and blocks connections, frames, forms and plugins.
- Official destinations are allowlisted HTTPS links on housekeep.com.
- User text is rendered with safe text nodes rather than interpreted as HTML.
- Payment-card and security-code patterns are blocked from the intake.
- External links use isolated browser tabs with 
oopener and 
oreferrer protection.
- Clipboard fallback uses a visible manual-copy dialog rather than a legacy browser command.

## Verification completed

The decision logic was checked against ten scenarios:

1. Weekly cleaning with ironing.
2. Intensive cleaning for heavy grime and limescale.
3. An empty property before moving out.
4. Cleaning after renovation.
5. A leaking tap requiring a plumber.
6. Carpet and rug stains.
7. Upholstery stains on a sofa and armchair.
8. A mistaken "regular cleaning" selection overridden by an empty moving-property description.
9. A mistaken one-off selection overridden by renovation dust.
10. An explicitly selected electrician.

Browser testing also verifies:

- The complete end-of-tenancy journey and correct official quote link.
- Adaptive repair fields for a gas-related description.
- Emergency guidance containing the National Gas Emergency Service number.
- Rejection of payment-card details.
- Resistance to an HTML/script-injection attempt.
- Zero outbound requests while using the finder.
- Desktop and mobile rendering.

## Visual approach

The interface is deliberately utilitarian rather than promotional: a compact service-selector header, numbered choices, plain form controls, restrained colour, visible source and privacy notes, and no gradients, decorative blobs, testimonial-style claims, or invented live-booking signals.

## Files

- index.html — page structure and content
- styles.css — responsive visual design
- logic.js — recommendation and routing logic
- pp.js — interactive form and result generation
- AGENT_INSTRUCTIONS.md — agent system instructions for GPT-6 Luna
- AGENT_SPEC.json — agent configuration for ChatGPT Sites

This is an unofficial educational prototype and is not commissioned, operated, or endorsed by Housekeep.
