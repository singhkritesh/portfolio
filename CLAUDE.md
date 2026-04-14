# CLAUDE.md — singhkritesh.github.io

## Scope

Work **only** within this directory (`singhkritesh.github.io/`).

- Do **not** read, write, or modify files in any other folder or project.
- Do not access parent directories (`github.io/`, `Codes/`, `~/Code/`, etc.).
- If a task would require touching anything outside this directory, **stop and ask the user first**.

## Git

- Do **not** create, amend, or revert any git commits unless the user explicitly asks.
- Do not push to any remote unless explicitly instructed.
- Do not stage files unless asked.
- **Never** add `Co-Authored-By: Claude` or any Claude attribution to commit messages.

## Tech Stack

- **Framework:** Astro 4 (static output)
- **Styling:** Tailwind CSS v3 + custom CSS in `src/styles/global.css`
- **Fonts:** Self-hosted Space Grotesk (headlines) + Inter (body) — preloaded in `Layout.astro`
- **Icons:** Material Symbols via `src/components/Icon.astro` (SVG sprite, not Font Awesome)
- **Font Awesome:** Loaded async (print media trick) — used only in Contact section for social icons
- **Local dev:** Docker + nginx via `./start.sh` → `http://localhost:4321`
- **Deploy:** GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` and deploys to GitHub Pages

## Project Structure

```
src/
  components/
    sections/         # One file per page section
      Hero.astro
      Work.astro
      Education.astro
      Projects.astro
      Achievements.astro
      Blog.astro
      Contact.astro
    Footer.astro
    Icon.astro        # Material Symbols SVG icon component
    Nav.astro         # Sticky nav with scrollspy + mobile drawer
  content/
    blog/             # Markdown blog posts (Astro content collections)
    config.ts
  layouts/
    Layout.astro      # HTML shell, font preloads, scroll restoration scripts
  pages/
    index.astro       # Assembles all sections
  styles/
    global.css        # Custom CSS classes (not in Tailwind utilities)
public/
  fonts/              # Self-hosted woff2 files
  images/             # Static images
  Resume/             # PDF resume files
photography/          # Separate static HTML photography sub-site
```

## Design System

- **Background:** `#131313` (`bg-background`) — unified across ALL sections, no alternating stripes
- **Surface cards:** `#1f1f1f` (`bg-surface-mid`), `#1b1b1b` (`bg-surface-low`), `#252525` (`bg-surface-high`)
- **Accent / Primary:** `#8aebff` (`text-primary`, `bg-primary`) — cyan
- **Borders:** `rgba(255,255,255,0.08)` (`border-outline-dim`)
- **Body font:** Inter, `font-body`
- **Headline font:** Space Grotesk, `font-headline`

## Design Decisions (do not revert without asking)

- **No section number labels** (`02 // Experience` etc.) — removed; they were redundant
- **No alternating section backgrounds** — unified `bg-background` everywhere; cards provide the visual separation
- **No hyperlinks on academic cards or project cards** — plain `<div>`, not `<a>`
- **No GPA** on the MNNIT education card
- **`bento-card` hover class** only on genuinely interactive/clickable elements (certification links, etc.) — not on static content cards
- **Section padding:** `pt-20 pb-32` (not `py-32`) — top reduced to remove ghost space left by removed labels
- **Hero stat numbers:** `text-4xl`, class `stat-number` with gradient in `global.css`
- **Hero tagline label:** uses `.hero-label` class (larger than `.section-label`) — currently removed from DOM but class exists in CSS
- **Get in Touch button:** `bg-background` fill to block dot-grid bleed-through

## Scroll Restoration

Critical — do not change without understanding the full mechanism:

1. **Head inline script** (`Layout.astro`): sets `history.scrollRestoration = 'manual'`, adds `.preload` class to `<html>` (suppresses CSS transitions on load), hides page with `visibility: hidden` if a saved section exists in `sessionStorage`
2. **Body-end inline script** (`Layout.astro`): reads `sessionStorage._sk`, calls `scrollIntoView({ behavior: 'instant' })`, restores visibility, removes `.preload` class after 2 rAF frames
3. **Nav.astro script**: writes `sessionStorage._sk` on scroll (150ms debounce) and on nav click
4. **`.preload` CSS rule** (`global.css`): `transition: none !important` on all elements — prevents accordion and other CSS transitions from firing when visibility flushes on page restore

Do **not** add `history.replaceState` URL hash manipulation — it causes race conditions with the IntersectionObserver and breaks restoration.

## Rebuild

After any source file change, run:
```
./start.sh
```
This rebuilds the Docker image and restarts the container. Site available at `http://localhost:4321`.
