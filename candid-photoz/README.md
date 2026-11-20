# Candid Photography — independent redesign preview

Live path: https://kailashprasad.com/candid-photoz/

An eight-page static website concept prepared by Kailash Prasad for the photographer behind candidphotoz.com. This directory is isolated from the existing personal website and wedding repositories.

## Contents

- `index.html`: editorial homepage.
- `work.html`: 17 photographs, category filters, accessible lightbox and keyboard navigation.
- `films.html`: five films played inline and linked from the photographer's existing portfolio. Cover photographs are representative selections, not asserted film stills.
- `experience.html`: planning and coverage approach.
- `investment.html`: readable summaries of the published Silver, Gold and Premium packages, plus FAQs.
- `journal.html`: three original planning articles.
- `contact.html`: validated enquiry preparation and explicit WhatsApp handoff. Nothing is sent automatically.
- `proposal.html`: rationale, launch plan and missing studio-supplied information.
- `assets/style.css`, `assets/app.js`: shared styling and interaction source.
- `assets/*.webp`: locally bundled, optimised portfolio photographs.
- `assets/sources.json`: exact image source attribution.

## Run and deploy

No dependencies or build are required. Serve this directory with any static server. Example: `python -m http.server 8000 --directory candid-photoz` from the repository root. Keep relative page and asset paths intact. GitHub Pages copies this directory alongside the existing Jekyll site.

## Editing

Edit the HTML directly. Shared navigation and footer markup are repeated across eight pages, so keep them consistent when changing links. Edit CSS for design and JavaScript for filters, dialogs and enquiry behaviour. All image filenames are relative to this directory; retain `assets/sources.json` when replacing media. No secret, account credential or user enquiry is stored here.

## Content and provenance

Portfolio images and five YouTube video IDs come from https://candidphotoz.com/ and https://candidphotoz.com/portfolio as reviewed on 20 November 2026. Original photo copyrights remain with their respective owners/Candid Photography; this project does not grant a separate licence to reuse them. Public film links are embedded using YouTube's privacy-enhanced player after a visitor clicks play.

Package summaries are transcribed from the original website's visible package artwork on that date: Silver INR 120,000; Gold INR 160,000; Premium INR 220,000. They are reference information, not current guaranteed quotations or booking contracts. The complete original event-specific crew matrix is not reproduced. Taxes, travel, duration, permissions, delivery and file formats require direct studio confirmation.

No reviews, awards, couple identities, venue histories, named team members or delivery promises have been invented. The existing site's 1942/three-generation claims are mentioned only in the proposal as claims to document. Editorial collection titles do not identify real couples or assert that mixed photographs belong to one wedding.

## Enquiries

The form validates required details locally and renders a reviewable message. Only the visitor's subsequent click on Continue on WhatsApp opens `wa.me` with the message for the studio's published number, +91 7980630085. The visitor still sends it in WhatsApp. The copy button uses the clipboard only after a click and displays fallback guidance if unavailable. There is no form backend, analytics or local/session storage.

## Before an official studio launch

Obtain approval for the design, media and branding. Add six permission-cleared complete wedding stories, team portraits/biographies and verified client reviews. Verify all packages and business policies. Choose a production enquiry system if desired. On the studio's final domain, replace the preview banner, noindex metadata, social preview URL and attribution as appropriate; add canonical URLs, sitemap and a privacy notice appropriate to the final data flow. Do not remove preview attribution on this separately hosted proposal without replacing its purpose clearly.

## Verification

Check all local page/image links, JavaScript syntax, gallery filtering/viewer and the enquiry draft flow. Browser QA must not send a test enquiry to the photographer. The final host remains the existing GitHub Pages site; no root configuration or existing pages need modification.


## Update: cinematic opening, inline films and shoot locations

The homepage now uses four gently moving, crossfading local photographs behind the text. A pause control and reduced-motion preference are supported. All film cover clicks replace that cover with a YouTube player in the same page; no film popup is used. `playsinline=1` is set for mobile playback. The photograph lightbox remains available for still images.

The location showcase contains Kolkata, Dubai, Purulia and Mandarmani, supported by the existing portfolio images and verified film titles. Film destination covers use thumbnails from those exact YouTube uploads. The mobile footer explicitly overrides an inherited column flex direction that previously allowed wrapped footer links to extend the page width.
