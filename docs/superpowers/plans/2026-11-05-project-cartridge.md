# Project cartridge implementation

User supplied a complete implementation brief and four visual references. Execute directly in the existing checkout, preserving the main processor, project records, other sections and backend.

## Design

Reuse CSS 3D, native dialog, browser history and Web Animations. No dependency or build step. A beveled metallic cartridge with the first three real project previews and a computed remaining count sits in a circuit-board socket. Match the main processor's cyan, dark metal, pins and pixel V mark.

Move the same cartridge DOM node into the dialog flight layer. Activation, ejection, expansion, a 1.2-second scenic loading sequence and staggered gallery reveal share one cancelable controller. Restore the node on exit. The existing project data/rendering remains authoritative. Localize only affected UI text. Keep the gallery layout with restrained cyan framing and a visible title.

Use #projects-u02 for direct entry, refresh and browser back/forward; no new route. Reduced motion skips scenic delays. Escape/return remains available during entry. Failures of individual animation APIs fall through to the functional gallery.

## Work

- [x] Browser regression cases first: real previews, hover, same-node transition, duplicate clicks, interrupt every phase, history/reload/direct hash, locale, reduced motion, mobile, failed animation API and unchanged project links.
- [x] Add cartridge.js controller and cartridge.css mechanical surfaces, responsive sizing and gallery details.
- [x] Replace pixel-door markup/styles/controller in index.html and update only affected PT/EN labels.
- [x] Verify browser screenshots and existing processor tests; independent review and fixes.

## Review focus

History entry ownership, cancellation while an animation is awaiting completion, focus trapping/restoration during loading, reduced-motion changes mid-transition, mobile expansion and viewport resize. Do not send the contact form or visit external project links during tests.

## Validation and delivery

- Browser test initially failed on the missing cartridge. Final `tests/cartridge.browser.cjs` passed in installed Chrome, using PLAYWRIGHT_PATH and an ephemeral local server. Screenshots cover idle, hover, scenic loading, gallery and mobile.
- Covered real previews and unchanged links, movement of the same face node, duplicate clicks, Escape during each entry phase, Back/Forward including Forward during closing, focus preservation on resize, direct #projects-u02 entry, reload, direct-entry return, reduced motion including activation during reverse exit, simulated Web Animations API failure, 390/320 px layouts, keyboard and Contact focus/visibility.
- `tests/processor.browser.cjs` passed: existing main processor/navigation remains functional. Five Node unit tests passed. Syntax and git diff whitespace checks passed. No JavaScript page errors in either browser suite.
- Comparison against original data confirms all project records, image paths, links, CV and other content/translations unchanged; only affected project UI text keys were changed or added.
- Independent read-only review found history ownership/re-entry and focus edge cases; all were corrected and added to browser checks.
- Premium static audit reports 12 findings: 11 previous findings plus the new cancel button falsely flagged as actionless because the auditor does not recognize the existing delegated data-leave handler. Cancellation is covered in the browser suite. The original form select/textarea policy findings remain out of scope.

## Limits

Original CSS/SVG materials simulate hardware and lighting; no external model or new dependency. Only installed Chrome and emulated viewport sizes were exercised, not physical mobile devices, Safari or Firefox. No backend submissions or external project navigation occurred. Transition transforms are accelerated where possible; the single flight container also animates dimensions to preserve readable previews. Main processor assets were not modified by this task. Changes are local and not deployed.
