# Modular processor implementation plan

**Goal:** Replace the CSS server rack with a detailed, original modular processor integrated with existing navigation.
**Architecture:** Keep this static site's CSS 3D renderer. Separate procedural hardware, animation state, and scene styling from the portfolio content. No build step or runtime dependencies.
**Spec:** User-provided “Substituir o Rack 3D por um Processador Modular Interativo” and reference image, 2026-11-05.

## Decisions and constraints

- The user explicitly requested direct implementation. Execute in the supplied checkout; do not require another design approval or publish changes.
- Existing tokens remain authoritative: background #07090C, metal #30363D, cyan #38BDF8, foreground #E6EDF3, Geist/Geist Mono/Silkscreen.
- Five modules: About uses the existing hero; Stack #u1; Experience #u4; Projects #u2 and its GitHub evidence #u3; Contact #u5. Preserve the existing menu, anchors, copy, translations, CV and project dialog.
- CSS 3D and original inline SVG surfaces reuse the existing renderer without adding WebGL/download dependencies. Lighting/reflections are authored materials, not physical ray tracing.
- Model: beveled motherboard, metallic socket/pins, branded central die, five mechanically aligned daughterboards with different electronic layouts and movements.
- Closed on entry; scroll opens layers, highlights and shifts the relevant module; continuous damping handles interruption and reverse navigation.
- Native links provide keyboard/touch navigation. Reduced motion keeps geometry assembled and changes highlighting only. Unsupported 3D gets a flat hardware view and the same links.
- Mobile places the scene after the hero text in normal flow, with smaller travel and no cursor tilt. It never overlays section content.

## Tasks

- [x] Test animation math, mapping, bounds, reverse/rapid jumps and reduced motion with Node's built-in test runner.
- [x] Implement `processor.js`: section config, pure `sample` state calculation, procedural hardware and controller. Keep DOM nodes through language changes.
- [x] Implement `processor.css`: model surfaces, metallic edges, traces, pins, restrained lighting, perspective, labels, responsive framing and flat fallback.
- [x] Replace rack markup/CSS/functions in `index.html`; connect the existing `sync`, locale updates and project-dialog origin to the scene.
- [x] Verify syntax, tests and diff. Inspect browser desktop/mobile, anchors/menu, rapid/reverse scroll, locale, reduced motion, keyboard and existing projects.

## Review focus

- Different section order versus module order: test all existing anchors, including GitHub.
- Fast jumps/reversals: state must converge without queued timelines.
- Language change: preserve model nodes and geometry state.
- Small/short viewports: maximum expansion fits, no overlap or horizontal overflow.
- Reduced motion and missing CSS 3D: navigation remains available without movement.

## Progress

Inspection complete: single index.html; no package manifest, installed frontend dependency, build, or test suite. Existing scene is CSS preserve-3d, updated by one scroll requestAnimationFrame. Desktop sticky column; original mobile scene hidden. Project dialog obtains its animation origin from rack module U02.

Implementation complete in the working tree. No deployment or changes to existing content.

## Validation

- `node --test tests/processor.test.cjs`: 5 tests passed. Initially failed because Processor did not exist; then passed against the implementation.
- `node --check processor.js` and parsing the inline app script with Node's VM: passed.
- `git diff --check`: passed.
- `tests/processor.browser.cjs`, with the installed Playwright package selected through `PLAYWRIGHT_PATH`: passed in local Chrome. The test starts and stops its own static server; no app dependency is added. Set `PROCESSOR_SHOTS` to an output directory for screenshots.
- Browser coverage: assembled hero; all five modules and all six existing section/hero destinations; menu, direct anchor entry, reverse and interrupted scroll; click on a moving 3D label; keyboard navigation; PT/EN without recreating model nodes; existing project dialog opening, five cards and Escape close; reduced motion toggled at runtime; 390/320/768 px mobile; 1024×650 desktop; no JavaScript runtime errors.
- The test reproduced a legacy MediaQueryList listener failure; the compatibility fallback now passes.
- A byte-for-byte comparison (normalizing line endings) confirms the entire original content/configuration object is unchanged.
- Premium static audit: 11 findings on both baseline HEAD and final implementation, with identical rule IDs. Nine are existing delegated buttons that the static auditor cannot recognize; the other two concern the existing native select ownership and textarea-resize policy. No out-of-scope form changes were made.
- Independent read-only review completed. Fixed invisible closed-state click regions, legacy media-query listeners, test-server cleanup after launch failure, and unused rack state. Browser assertions also caught and verified the short-desktop framing fix.

## Performance and limits

- No runtime dependencies, model fetches, canvas or WebGL context. The two scene assets total approximately 8 KB gzipped.
- One retained DOM model; bounded requestAnimationFrame damping stops after settling. Floating animation pauses offscreen/when the document is hidden. Touch devices disable cursor tilt and expensive decorative filters.
- Reduced motion keeps layers assembled and highlights the current destination. A CSS feature-query fallback keeps the base and section links available without preserve-3d.
- Lighting, bevels and reflections are authored CSS/SVG materials, not physically based rendering. No GPU resource or pixel-ratio management is necessary for this renderer.
- Physical devices, Safari and Firefox rendering were not exercised. The legacy listener path was simulated in Chrome; this is not a Safari rendering test.
- The form backend and live GitHub services were not modified or submitted to. Existing references to “rack/server” in portfolio copy and the original project gallery remain because the user explicitly prohibited content changes.

## Requested module order update

The user subsequently requested the exact page-section order: Stack (#u1), Projects (#u2), GitHub (#u3), Journey (#u4), Contact (#u5). This supersedes the original About/hero and combined Projects/GitHub mapping above. About has been removed. The branded upper lid is retained on Stack; GitHub has its own circuit board and branch icon. Navigation, module numbers and PT/EN labels follow the new order.
