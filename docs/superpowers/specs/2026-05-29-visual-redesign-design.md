# Visual Redesign — Design Spec

**Date:** 2026-05-29  
**Status:** Approved

---

## Goal

Full visual refresh of ArenaVersus: replace emoji-based game icons with gaming photography, introduce a vibrant gamer color palette (orange/black), add missing home sections, and apply a consistent visual system across all pages.

---

## Design Decisions Summary

| Topic | Decision |
|---|---|
| Scope | All pages: landing + torneos + player profile + clasificacion + tournament detail |
| Visual direction | Gaming photos (Unsplash/Pexels) + vibrant neon overlays |
| Game icons | Photo card with neon color overlay per game — no emojis |
| Hero | Dynamic with game tabs — photo + glow changes per active tab |
| Colors | Orange #FF3D00→#FF6D00, black #0a0a0a base, neon per game |
| Media section | Ticker auto-scroll (GIFs/images) + YouTube grid highlights |

---

## Color System

### Brand colors (replace current red-orange with more vibrant orange)

```css
--av-primary:    #FF3D00   /* main orange — CTAs, borders, accents */
--av-secondary:  #FF6D00   /* warm orange — gradient end */
--av-gradient:   linear-gradient(135deg, #FF3D00 0%, #FF6D00 100%)
--av-black:      #0a0a0a   /* page background */
--av-black2:     #141414   /* card background */
--av-black3:     #1a1a1a   /* elevated card, hover */
```

### Per-game neon color map

| Game key | Color | Hex |
|---|---|---|
| `fc26` | Orange (brand) | `#FF3D00` |
| `valorant` | Cyan | `#00E5FF` |
| `lol` | Purple | `#BF00FF` |
| `fortnite` | Blue-purple | `#00CFFF` |
| `free_fire` | Amber | `#FF8C00` |
| `rocket_league` | Blue | `#00B4FF` |
| `street_fighter` | Red | `#DC2626` |
| `clash_royale` | Violet | `#A855F7` |

This map lives in `utils/constants.ts` as `GAME_COLORS`.

### Unsplash photo map per game

Each game gets a curated Unsplash photo URL used as background in cards and the hero tabs. Stored in `utils/constants.ts` as `GAME_PHOTOS`.

| Game key | Photo theme |
|---|---|
| `fc26` | Soccer / stadium |
| `valorant` | FPS / tactical gaming setup |
| `lol` | MOBA / fantasy gaming |
| `fortnite` | Battle royale / colorful gaming |
| `free_fire` | Mobile gaming / intense action |
| `rocket_league` | Racing / sports arena |
| `street_fighter` | Fighting / arcade |
| `clash_royale` | Mobile / strategy |

---

## File Structure

| File | Action | Purpose |
|---|---|---|
| `app/globals.css` | MODIFY | Update brand colors to new orange system |
| `utils/constants.ts` | MODIFY | Add `GAME_COLORS`, `GAME_PHOTOS` maps |
| `app/page.tsx` | MODIFY | Full landing page redesign |
| `components/ui/TournamentCard.tsx` | MODIFY | Photo header + neon color overlay |
| `components/ui/GameIcon.tsx` | MODIFY | Replace emoji with photo card component |
| `components/ui/MediaTicker.tsx` | CREATE | Auto-scroll ticker of gaming images |
| `app/torneos/page.tsx` | MODIFY | Apply new TournamentCard + game filter tabs |
| `app/clasificacion/page.tsx` | MODIFY | Vibrant styling, avatar display improvements |
| `app/players/[username]/page.tsx` | MODIFY | Vibrant hero, match history styling |

---

## Section 1: Color System Update

**`app/globals.css`** — update CSS variables:

```css
:root {
  --red:      #FF3D00;
  --orange:   #FF6D00;
  --gradient: linear-gradient(135deg, #FF3D00 0%, #FF6D00 100%);
  --black:    #0a0a0a;
  --black2:   #141414;
  --black3:   #1a1a1a;
  --border:   1px solid rgba(255,255,255,0.06);
}
```

**`utils/constants.ts`** — add:

```ts
export const GAME_COLORS: Record<string, string> = {
  fc26:           '#FF3D00',
  valorant:       '#00E5FF',
  lol:            '#BF00FF',
  fortnite:       '#00CFFF',
  free_fire:      '#FF8C00',
  rocket_league:  '#00B4FF',
  street_fighter: '#DC2626',
  clash_royale:   '#A855F7',
}

export const GAME_PHOTOS: Record<string, string> = {
  fc26:           'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
  valorant:       'https://images.unsplash.com/photo-1542751110-97427bbecfd7?w=600&q=80',
  lol:            'https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&q=80',
  fortnite:       'https://images.unsplash.com/photo-1561883088-039e53143d73?w=600&q=80',
  free_fire:      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
  rocket_league:  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
  street_fighter: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
  clash_royale:   'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
}
```

---

## Section 2: Landing Page (`app/page.tsx`)

Complete replacement. Sections in order:

### 2.1 Live Banner (NEW)

Top of page, below navbar. Shows active or next tournament as a thin urgent strip.

```
[🔴 LIVE] Copa LATAM Valorant · Semifinales · Quedan 2h  [Ver ahora →]
```

- If a tournament has `status = 'in_progress'`: shows "🔴 LIVE" with title
- If next upcoming: shows countdown to `start_date`
- If none: section hidden (renders `null`)
- Background: `rgba(255,61,0,0.08)`, left border `3px solid #FF3D00`
- Fetched server-side alongside existing queries

### 2.2 Hero with Game Tabs (REPLACE existing hero)

Full-screen section. Behavior:
- On load: first tab active (FC26 or first game with a tournament)
- Active tab: photo of that game as background (opacity ~25%), glow in game's neon color
- Tab strip pinned to bottom of hero section
- Each tab shows: small game photo thumbnail + game name + "N torneos" count
- Active tab indicator: 2px bottom border in the game's neon color
- Hero text stays fixed; only photo + glow change per tab

Static hero text (always):
```
⚡ PLATAFORMA OFICIAL DE TORNEOS LATAM
Torneos de [Esports gradient] Profesionales
[description]
[CTA buttons]
[stats: jugadores / torneos / $0]
```

Tab data: derived from `tournaments` grouped by game. Games with 0 tournaments still shown but greyed.

**Implementation note:** Hero tabs are client-interactive — extract a `HeroTabs` client component that receives `games` + `photos` + `colors` as props. The parent `page.tsx` stays server component.

### 2.3 Featured Tournaments (UPDATE)

Uses updated `TournamentCard` (see Section 4). Grid 1→2→4 cols.

### 2.4 Top 5 Players — Preview (NEW)

Fetches top 5 from `profiles` joined with `match_results` (same logic as clasificacion). Shows:
- Rank number (#1 in brand orange, rest in gray)
- Avatar circle (photo if set, else initial)
- Username + country flag emoji
- Winrate in neon green (`#39FF14`) for top 3, white for rest
- "Ver clasificación completa →" link

### 2.5 Supported Games Grid (UPDATE)

Replace emoji cards with photo cards. Each card:
- Full photo background (game's Unsplash photo)
- Gradient overlay in game's neon color (bottom-left to transparent)
- Game name in white bold bottom-left
- Format (5vs5, Battle Royale, etc.) in small gray below name
- Hover: scale 1.02 + glow in game color

### 2.6 Media Section (NEW)

Two parts stacked:

**Part A — Ticker auto-scroll:**
- Horizontal strip, infinite scroll animation (CSS `@keyframes` scroll left)
- 8–10 gaming/esports images from Unsplash (different from game photos)
- Each tile: `160px × 90px`, rounded corners, slight neon border on hover
- Label above: "HIGHLIGHTS GAMING" in small orange uppercase

**Part B — YouTube Grid:**
- 1 large embed (16:9) left + 2 small embeds right (stacked)
- Uses YouTube `iframe` embed with `?autoplay=0&rel=0`
- URLs stored as constants (3 YouTube video IDs) — hardcoded initially, can be updated manually
- Label above: "ÚLTIMOS HIGHLIGHTS" in small orange uppercase
- Fallback: if no YouTube IDs configured, section hidden

### 2.7 How It Works (KEEP, update style)

Existing 3-step section. Update:
- Step circles: keep gradient but use `#FF3D00` → `#FF6D00`
- Background: `#0a0a0a` (darker)
- Add subtle neon glow behind each circle number

### 2.8 Discord Community CTA (NEW)

Dark section with vibrant gradient overlay:
- Background: `linear-gradient(135deg, rgba(255,61,0,0.08), rgba(123,47,190,0.08))`
- Big Discord icon + text "Únete a la comunidad"
- Stats: "X miembros · Y partidas jugadas" (static numbers initially)
- CTA button: "Unirse al Discord →" linking to Discord invite URL (placeholder `#` for now)

### 2.9 Nosotros (NEW)

Simple section, no DB queries:
- `id="nosotros"` anchor (fixes broken navbar link)
- Two columns: text left, decorative gaming image right (Unsplash)
- Text: mission statement about Arena Versus + LATAM esports
- No team photos needed — abstract gaming aesthetic image

### 2.10 Final CTA (KEEP, update colors)

Update gradient button to new orange. Add glow: `box-shadow: 0 0 30px rgba(255,61,0,0.4)`.

---

## Section 3: `GameIcon` Component (UPDATE)

`components/ui/GameIcon.tsx` — replace emoji return with a photo card:

```tsx
// Props: game key, optional size ('sm' | 'md' | 'lg')
// Returns: <div> with background photo + color overlay
// Falls back to initials box if game not in GAME_PHOTOS map
```

Sizes:
- `sm`: 32×32px — for navbar, inline mentions
- `md`: 48×48px — for tournament cards
- `lg`: full width, 120px height — for game grid on landing

---

## Section 4: `TournamentCard` Component (UPDATE)

`components/ui/TournamentCard.tsx` — add photo header:

```
┌─────────────────────────────┐
│  [game photo, 80px height]  │  ← bg photo + neon overlay
│  GAME NAME        [STATUS]  │
├─────────────────────────────┤
│  Tournament title           │
│  Date · Players             │
│  [progress bar]             │
│  [Register / Ver torneo]    │
└─────────────────────────────┘
```

- Photo header: game's Unsplash photo, opacity 50%, neon color overlay `rgba(gameColor, 0.45)`
- Progress bar: uses game's neon color instead of brand orange
- Hover: border color = game's neon color (not fixed `#ea3935`)

---

## Section 5: `MediaTicker` Component (CREATE)

`components/ui/MediaTicker.tsx` — client component:

```
Infinite horizontal scroll using CSS animation.
Items: 8 hardcoded Unsplash gaming image URLs.
Animation: translate-x loop, 30s linear infinite.
Pause on hover.
```

Props: none (self-contained with hardcoded images). Can be made configurable later.

---

## Section 6: Internal Pages (UPDATE)

Apply the new visual system consistently.

### `app/torneos/page.tsx`
- Replace game emoji filters with `GameIcon` component
- Apply updated `TournamentCard`

### `app/clasificacion/page.tsx`
- Header row: deeper black background
- Rank #1 in orange glow
- Winrate column: neon green for top 3 players
- Game column: `GameIcon sm` instead of emoji

### `app/players/[username]/page.tsx`
- Hero background: subtle glow in brand orange behind avatar
- Stats cards: update to `#141414` background, orange accent on hover
- Match result badges: keep green/red but more vibrant (neon green / neon red)

---

## Out of Scope

- Custom logo redesign (logo stays as "AV" text in gradient box)
- Animated GIFs (using static Unsplash images in ticker — true GIFs require hosting)
- Video autoplay background (option C not chosen)
- YouTube video management UI (URLs hardcoded as constants)
- Dark/light mode toggle
- Avatar cropping or image CDN optimization
