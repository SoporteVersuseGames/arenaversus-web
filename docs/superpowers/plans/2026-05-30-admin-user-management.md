# Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Gestión de Usuarios" section to `/admin` where admins can view all users and toggle their admin status, with a protected super admin that can never be modified.

**Architecture:** Two SQL changes extend `profiles` with `is_admin` and `is_super_admin` booleans. The existing admin guard migrates from the `admins` email table to `profiles.is_admin`. A new section renders a user list with role badges and toggle buttons, protected by client-side guards (super admin locked, self locked) and a Supabase RLS policy.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Supabase browser client (`@/lib/supabase/client`)

---

## Codebase Context

```
lib/types.ts                 — Profile, Tournament, MatchResult interfaces
app/admin/page.tsx           — client component, admin panel (tournaments + match results)
lib/supabase/client.ts       — createClient() for browser components
```

**Current admin guard (app/admin/page.tsx:23-24):**
```ts
const { data: adminData } = await supabase.from('admins').select('id').eq('email', session.user.email ?? '').single()
if (!adminData) { router.push('/'); return }
```
This gets replaced with a `profiles.is_admin` check.

**Current Profile type (lib/types.ts:1-10) — missing is_admin and is_super_admin.**

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| Supabase SQL Editor | SQL only | Add columns, set super admin, add RLS policy |
| `lib/types.ts` | Modify | Add `is_admin`, `is_super_admin` to `Profile` |
| `app/admin/page.tsx` | Modify | Migrate guard, add users state/fetch, toggle handler, render section |

---

### Task 1: DB schema and RLS policy

**Files:** Supabase SQL Editor only — no local files change.

- [ ] **Step 1: Run schema migration in Supabase SQL Editor**

Open: `https://supabase.com/dashboard/project/ambmqayzxqylztbylnkq/sql`

Run this SQL:

```sql
-- Add role columns to profiles
ALTER TABLE profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark the permanent super admin
UPDATE profiles
  SET is_admin = TRUE, is_super_admin = TRUE
  WHERE id = (
    SELECT id FROM auth.users WHERE email = 'soportearenaversus@gmail.com'
  );

-- RLS: allow admins to update is_admin on any profile
-- (is_super_admin is never sent from the UI so it stays unchanged)
CREATE POLICY "profiles_admin_toggle_admin" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );
```

- [ ] **Step 2: Verify**

Run in SQL Editor:

```sql
SELECT id, username, is_admin, is_super_admin
FROM profiles
ORDER BY is_super_admin DESC, is_admin DESC
LIMIT 5;
```

Expected: the super admin row shows `is_admin = true` and `is_super_admin = true`.

---

### Task 2: Update Profile type

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add is_admin and is_super_admin to the Profile interface**

Replace the current `Profile` interface (lines 1–10) with:

```ts
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  discord_tag: string | null
  country: string | null
  updated_at: string | null
  avatar_url: string | null
  is_admin?: boolean
  is_super_admin?: boolean
}
```

- [ ] **Step 2: Type check**

```powershell
cd "C:\Users\milo_\OneDrive\Escritorio\ArenaVersus_V2"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add lib/types.ts
git commit -m "feat: add is_admin and is_super_admin to Profile type"
```

---

### Task 3: Migrate admin guard and add user state + fetch

**Files:**
- Modify: `app/admin/page.tsx`

This task changes the `init()` function and adds state. The UI section comes in Task 4.

- [ ] **Step 1: Add AdminUser interface and new state variables**

After the existing `import` statements and before `export default function AdminPage()`, or inside the component after the existing `useState` declarations, make these additions:

At the top of the file after the imports, add the interface:

```ts
interface AdminUser {
  id: string
  username: string | null
  avatar_url: string | null
  is_admin: boolean
  is_super_admin: boolean
}
```

Inside `AdminPage()`, after the existing `useState` declarations (after line with `const [createError, setCreateError] = useState...`), add:

```ts
const [users, setUsers] = useState<AdminUser[]>([])
const [togglingId, setTogglingId] = useState<string | null>(null)
const [currentUserId, setCurrentUserId] = useState<string | null>(null)
```

- [ ] **Step 2: Replace the init() function**

Find the entire `init` function inside `useEffect` (currently lines 19–30) and replace it with:

```ts
async function init() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }
  setCurrentUserId(user.id)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profileData?.is_admin) { router.push('/'); return }
  loadTournaments()
  const [{ data: playersData }, { data: usersData }] = await Promise.all([
    supabase.from('profiles').select('*').order('username'),
    supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin, is_super_admin')
      .order('is_super_admin', { ascending: false })
      .order('is_admin', { ascending: false })
      .order('username'),
  ])
  setPlayers(playersData ?? [])
  setUsers((usersData ?? []) as AdminUser[])
}
```

- [ ] **Step 3: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add app/admin/page.tsx
git commit -m "feat: migrate admin guard to profiles.is_admin, add users state and fetch"
```

---

### Task 4: Toggle handler and Gestión de Usuarios section

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add handleToggleAdmin function**

After the existing `handleRegisterResult` function (around line 87), add:

```ts
async function handleToggleAdmin(targetId: string, currentIsAdmin: boolean) {
  setTogglingId(targetId)
  const supabase = createClient()
  await supabase
    .from('profiles')
    .update({ is_admin: !currentIsAdmin })
    .eq('id', targetId)
  setUsers(prev =>
    prev.map(u => u.id === targetId ? { ...u, is_admin: !currentIsAdmin } : u)
  )
  setTogglingId(null)
}
```

- [ ] **Step 2: Add Gestión de Usuarios section to the JSX**

Inside the `return (...)`, after the closing `</div>` of the tournaments list section (the last `</div>` before the outer closing `</div>`), add:

```tsx
{/* Gestión de Usuarios */}
<div className="bg-[#141414] border border-white/[0.07] rounded-xl overflow-hidden mt-8">
  <div className="px-6 py-4 border-b border-white/[0.07]">
    <h2 className="font-bold text-white">Gestión de Usuarios ({users.length})</h2>
  </div>
  <div className="divide-y divide-white/5">
    {users.map(u => {
      const isSelf = u.id === currentUserId
      const locked = u.is_super_admin || isSelf
      return (
        <div key={u.id} className="px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-av-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">
            {(u.username || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white text-sm font-medium">{u.username ?? 'Sin username'}</span>
            {isSelf && <span className="ml-2 text-gray-500 text-xs">(tú)</span>}
          </div>
          {u.is_super_admin ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
              👑 Super Admin
            </span>
          ) : u.is_admin ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF3D00]/20 text-[#FF3D00] font-semibold">
              🛡 Admin
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-500">
              — Jugador
            </span>
          )}
          <button
            disabled={locked || togglingId === u.id}
            onClick={() => !locked && handleToggleAdmin(u.id, u.is_admin)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              locked
                ? 'border border-white/10 text-gray-600'
                : u.is_admin
                ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                : 'bg-av-gradient text-white hover:opacity-90'
            }`}
          >
            {togglingId === u.id
              ? '...'
              : u.is_super_admin
              ? 'Protegido'
              : isSelf
              ? u.is_admin ? '🛡 Admin' : '— Jugador'
              : u.is_admin
              ? 'Quitar admin'
              : 'Dar admin'}
          </button>
        </div>
      )
    })}
    {users.length === 0 && (
      <div className="text-center py-12 text-gray-500">No hay usuarios registrados</div>
    )}
  </div>
</div>
```

- [ ] **Step 3: Type check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit and deploy**

```powershell
git add app/admin/page.tsx
git commit -m "feat: add Gestión de Usuarios section with admin toggle to admin panel"
git push origin master
npx vercel --prod
```

Expected: build succeeds, `/admin` route shows in output as `○ (Static)` or `ƒ (Dynamic)`.

- [ ] **Step 5: Verify in browser**

1. Open `https://arenaversus.com/admin` logged in as super admin
2. Scroll to bottom — "Gestión de Usuarios" section shows all registered users
3. Super admin row: button shows "Protegido", disabled
4. Your own row: button disabled, shows your current role label
5. Another user: "Dar admin" button → click → badge changes to "🛡 Admin", button changes to "Quitar admin"
6. Click "Quitar admin" → reverts back to "— Jugador"

---

## Self-Review

**Spec coverage:**
- ✅ Section within existing `/admin` — Task 4 appends after tournaments list
- ✅ Shows all users with role — users table with Super Admin / Admin / Jugador badges
- ✅ Grant/revoke admin — handleToggleAdmin + optimistic state update
- ✅ Super admin protected — `is_super_admin` check disables the button
- ✅ Can't remove yourself — `isSelf` check disables the button
- ✅ Guard migrated from `admins` table to `profiles.is_admin` — Task 3 init()
- ✅ RLS policy for admin updates — Task 1 SQL

**Placeholder scan:** None — all steps have complete code.

**Type consistency:**
- `AdminUser` interface defined in Task 3 Step 1, used in Task 3 (state) and Task 4 (map + toggle)
- `handleToggleAdmin(targetId: string, currentIsAdmin: boolean)` defined in Task 4 Step 1, called in Task 4 Step 2 JSX with `u.id` and `u.is_admin` — types match
- `users`, `togglingId`, `currentUserId` all defined in Task 3 Step 1, consumed in Task 4 Step 2 JSX — consistent
