# Bracket View — Design Spec

**Date:** 2026-05-29  
**Format:** Single Elimination  
**Status:** Approved

---

## Goal

Add a bracket visualization section to the tournament detail page (`/torneos/[id]`) that shows match results grouped by round in a card-based layout.

---

## Architecture

**No new files or routes.** The bracket section is added directly inside `app/torneos/[id]/page.tsx`, between the Participants section and the existing Results section (which will be removed — the bracket replaces it).

All data is already fetched: `match_results` joined with opponent profiles, ordered by `round` and `played_at`. No new DB queries needed.

---

## Data Model

Uses existing `match_results` table:

| Column | Used for |
|---|---|
| `player_id` | The player this result belongs to |
| `opponent_id` | The opponent (joined as `opponent.username`) |
| `round` | Groups matches into bracket rounds |
| `result` | `'win'` or `'loss'` — determines winner styling |
| `score` | Optional score string (e.g. `2-1`) |

**Round naming:** Derived from total number of rounds in the tournament:
- 1 round → "Final"
- 2 rounds → "Semifinal", "Final"
- 3 rounds → "Cuartos de Final", "Semifinal", "Final"
- 4+ rounds → "Ronda 1", "Ronda 2", … "Semifinal", "Final"

Round label mapping is computed at render time from `Math.max(...rounds)`.

---

## UI Spec

### Layout

- **Desktop:** Rounds displayed as horizontal columns (flexbox, `gap-6`, scroll if overflow)
- **Mobile:** Rounds stacked vertically

### Round column

```
┌─────────────────┐
│  SEMIFINAL       │  ← round label (uppercase, gray, small)
├─────────────────┤
│  Match card      │
│  Match card      │
└─────────────────┘
```

### Match card

Each `match_results` row where `result = 'win'` represents one completed match (winner's perspective). From this we know both players and the outcome.

```
┌──────────────────────────────────┐
│  playerA username   ● WIN  2-1   │  ← green text, green dot
│  vs playerB username             │  ← gray text
└──────────────────────────────────┘
```

- Winner row: white text, green `W` badge
- Loser row: gray text, red `L` badge  
- Score shown on the right if `score` is not null
- Clicking a username navigates to `/players/{username}`

### Empty state

When `matchResults.length === 0`:
```
El bracket se publicará cuando inicie el torneo.
```

Shown only when tournament `status` is `upcoming` or `open`. When `in_progress` or `finished` with no results, show:
```
No hay resultados registrados aún.
```

---

## Deduplication

`match_results` stores one row per player per match (both winner and loser get a row). To avoid showing each match twice, only render rows where `result = 'win'`. This gives exactly one card per match.

---

## Section Placement

Replace the existing "Resultados" section at the bottom of `app/torneos/[id]/page.tsx` with the new bracket section. The bracket shows the same data in a better format, so the old section is no longer needed.

---

## Out of Scope

- Future (unplayed) match slots — only completed matches are shown
- Bracket seeding UI — admin registers results manually
- Double elimination, Swiss, Round Robin — future formats
- Drag-and-drop bracket editing
