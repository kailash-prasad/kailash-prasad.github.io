# Candid Photography — independent redesign preview

Live website: https://kailashprasad.com/candid-photoz/

A 14-page, static photography website and planning companion prepared by Kailash Prasad for the photographer behind candidphotoz.com. All project files are contained in this directory; the personal website and wedding invitation pages are separate.

## Visitor experience

- Moving, crossfading portfolio photographs behind the opening text; manual controls, pause and reduced-motion support.
- Dedicated wedding and pre-wedding pages, with different guidance and enquiry routes.
- A gallery of 17 photographs with category filters, a keyboard-accessible photo viewer and an optional shortlist of up to 12 references.
- Five published films play inline after a click, with direct YouTube links available.
- Four location guides: Kolkata, Purulia, Mandarmani and Dubai. Setting/travel filters, portfolio examples and official sources sit beside practical planning questions.
- An answer centre with 40 searchable questions in five categories. Educational guidance is separated from the policies that the studio must confirm in a proposal.
- A three-step planner, family-photo list, 24-item preparation checklist and session-time worksheet, with copy/download/print controls where relevant.
- Published package references and a manual complete-cost worksheet. Unknown expenses remain unresolved; an amount marked included elsewhere is not added twice. The subtotal is not a studio quotation.
- Separate wedding/pre-wedding enquiry fields, flexible dates, optional budget and publishing preferences. Saved planning choices can carry into a message for the visitor to review before opening WhatsApp.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage, wedding-season/editorial copy and planning entry points |
| `weddings.html` | Coverage, family photographs, real films and wedding questions |
| `pre-wedding.html` | Shoot approaches, preparation, costs and location choices |
| `work.html` | Filterable photographs, viewer and reference shortlist |
| `films.html` | Inline films and explanations of film deliverables |
| `locations.html` | Filterable, sourced location guides |
| `answers.html` | Searchable questions and answers |
| `plan.html` | Three-step planning brief and saved looks |
| `checklists.html` | Family list, preparation checks and time worksheet |
| `investment.html` | Published package references and complete-cost worksheet |
| `experience.html` | Approach, preparation and team/gallery discussion |
| `journal.html` | Original planning articles |
| `contact.html` | Contextual enquiry preparation and explicit WhatsApp handoff |
| `proposal.html` | Owner-facing rationale and remaining studio inputs |

## Run and edit

There are no production dependencies or backend. Serve the directory with any static web server, for example `python -m http.server 8000 --directory candid-photoz` from the repository root. Keep relative links intact.

`data/content.json` contains the canonical 40 answers, four location guides, official source links and preparation checklist. After editing it, run:

```sh
python candid-photoz/scripts/build_content.py
```

The builder writes the six planning pages and contact page, refreshes navigation/footer/assets across all 14 pages and writes `assets/data.js`. It also applies guarded additions to the original pages. Do not independently edit the generated pages or `data.js`; edit the builder or canonical data instead. Existing homepage/gallery/editorial sections can still be edited directly. The builder is repeatable without adding duplicate sections.

`assets/style.css` and `assets/app.js` retain the photographic design and media interactions. `assets/planning.css` and `assets/planning.js` implement planning layouts and controls. Pure calculation, filtering and message functions live in `assets/core.js` and are checked separately.

## Data and enquiries

Planning choices, selected photograph identifiers, family notes and cost notes are written to `sessionStorage` only when the visitor explicitly saves or adds them. They are available within the same browser tab and can be cleared using the visible controls. Preparation checkboxes and unsaved form fields are not persisted by this code. Contact details are not written to browser storage or submitted to a server by this website. Do not enter sensitive information in planning notes.

The contact form validates required fields locally and renders the proposed message. Only the visitor's subsequent click on Continue on WhatsApp opens `wa.me` with the message for the published studio number, +91 7980630085. The visitor chooses whether to send it inside WhatsApp. Clipboard access, downloads and printing require explicit clicks. No analytics or automatic enquiry submission is included. YouTube embeds load after a visitor chooses a film; external services have their own data practices.

Static answers remain readable without JavaScript. Interactive tools provide a no-JavaScript notice and direct telephone/email routes. Local session saving and clipboard failures produce fallback guidance.

## Provenance and limits

Portfolio photographs and five film IDs were reviewed against https://candidphotoz.com/ and its published portfolio on 20 November 2026. Retain `assets/sources.json`, `assets/films.json` and `assets/location-sources.json`. Image copyrights remain with their respective owners/Candid Photography; this preview grants no separate media licence. Film covers use the identified upload's thumbnail where supplied; other representative portfolio covers are labelled.

Package references were transcribed from the original site's visible artwork on that date: Silver INR 120,000, Gold INR 160,000 and Premium INR 220,000. They are not current guaranteed quotations or booking contracts. Premium-edited photo counts do not establish the total delivered gallery. Confirm crew assignments, hours, taxes, travel, permissions, delivery, revisions, file formats, albums, publishing consent, payment and change policies directly with the studio.

Official location sources and the checked date are included in the readable guides and `data/content.json`. Venue fees, access and permissions must be reconfirmed for the particular shoot. A destination represented in the existing portfolio does not promise present availability or a standard package there.

No client reviews, named team biographies, complete wedding galleries, awards or service promises have been invented. Named couples are used only for their verified film titles. Editorial collection names do not imply that unrelated portfolio photographs form a real complete wedding story.

## Verification

From the repository root:

```sh
node --check candid-photoz/assets/app.js
node --check candid-photoz/assets/planning.js
node --test candid-photoz/tests/planning.test.cjs
python candid-photoz/tests/check_site.py
```

Optional DOM interaction checks also exercise each page’s JavaScript, search/filter controls, planner validation, saved-context handoff, enquiry drafts, gallery and cost controls without network requests:

```sh
npm install --prefix /tmp/candid-qa --no-audit --no-fund --ignore-scripts jsdom
NODE_PATH=/tmp/candid-qa/node_modules node --test candid-photoz/tests/ui.test.cjs
```

These checks do not replace a visual check in a real mobile and desktop browser.

The checks cover unknown/invalid costs, duplicate charges, impossible schedules, real dates, wedding/pre-wedding state separation, FAQ search, location filtering, enquiry context, local page/asset links, anchors, unique IDs and essential static structures. Any browser testing must stop at the enquiry draft and must not send a test message to the photographer.

## Publishing and official launch

Commit this directory to `kailash-prasad/kailash-prasad.github.io` on `master`. Its existing GitHub Pages workflow publishes `/candid-photoz/`; no root configuration changes are needed.

Before moving the concept to the studio's official domain, obtain approval for branding/media, replace reference packages with approved current terms and add permission-cleared full wedding galleries, actual team portraits/biographies and verified client reviews. Replace preview attribution and noindex/social metadata for the approved domain; supply canonical URLs, sitemap and a privacy notice appropriate to the final data flow. The current independently hosted preview keeps its explanatory banner and noindex metadata.
