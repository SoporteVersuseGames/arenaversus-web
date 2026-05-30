# Admin User Management Design

## Goal

Add a "Gestión de Usuarios" section to the existing `/admin` panel that lets admin users see all registered players, their roles, and grant or revoke admin permissions — with a protected super admin that can never be modified.

## Architecture

Two SQL changes extend the `profiles` table with role flags. The existing admin guard migrates from the `admins` email table to `profiles.is_admin`. A new section at the bottom of `app/admin/page.tsx` renders the user table and handles toggle actions.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Supabase browser client (`@/lib/supabase/client`)

---

## Data Model

Two new columns on `profiles`:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `is_admin` | `BOOLEAN NOT NULL` | `FALSE` | Toggleable via UI |
| `is_super_admin` | `BOOLEAN NOT NULL` | `FALSE` | Set only via SQL, never via UI |

SQL to apply:

```sql
ALTER TABLE profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE profiles
  SET is_admin = TRUE, is_super_admin = TRUE
  WHERE id = (SELECT id FROM auth.users WHERE email = 'soportearenaversus@gmail.com');
```

The existing `admins` table is left untouched but stops being used by the code.

---

## Admin Guard Migration

The guard at the top of the `init()` function in `app/admin/page.tsx` changes from:

```ts
const { data: adminData } = await supabase.from('admins').select('id').eq('email', session.user.email ?? '').single()
if (!adminData) { router.push('/'); return }
```

to:

```ts
const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()
if (!profileData?.is_admin) { router.push('/'); return }
```

---

## UI — "Gestión de Usuarios" Section

New section appended after the tournaments list in `app/admin/page.tsx`.

**Data fetch** (inside `init()`):
```ts
const { data: usersData } = await supabase
  .from('profiles')
  .select('id, username, avatar_url, is_admin, is_super_admin')
  .order('username')
setUsers(usersData ?? [])
```

**State type** added to the component:
```ts
const [users, setUsers] = useState<AdminUser[]>([])

interface AdminUser {
  id: string
  username: string | null
  avatar_url: string | null
  is_admin: boolean
  is_super_admin: boolean
}
```

**Toggle handler:**
```ts
async function handleToggleAdmin(targetId: string, currentIsAdmin: boolean) {
  const supabase = createClient()
  await supabase.from('profiles').update({ is_admin: !currentIsAdmin }).eq('id', targetId)
  setUsers(prev => prev.map(u => u.id === targetId ? { ...u, is_admin: !currentIsAdmin } : u))
}
```

**Button rules** (evaluated per row):

| Condition | Button state |
|---|---|
| `is_super_admin === true` | Disabled, label "Super Admin", gold badge |
| `user.id === currentUserId` | Disabled, label based on is_admin (can't self-modify) |
| `is_admin === true` | Enabled, label "Quitar admin", red hover |
| `is_admin === false` | Enabled, label "Dar admin", orange gradient |

**Role badges:**
- Super Admin: gold/amber, `👑 Super Admin`
- Admin: orange, `🛡 Admin`
- Jugador: gray, `— Jugador`

---

## Constraints & Protection

- `is_super_admin` is only settable via SQL — the UI never sends an update to this field.
- A user cannot toggle their own `is_admin` (button is disabled if `target.id === session.user.id`).
- The super admin (`is_super_admin = TRUE`) row always shows a disabled, locked button.
- Because the super admin can never be removed, there is always at least one admin in the system.
- RLS note: admins need UPDATE permission on `profiles`. If RLS blocks this, add a policy: `FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE))`.

---

## Files Changed

| File | Change |
|---|---|
| `app/admin/page.tsx` | Migrate guard, add `users` state + fetch, add Gestión de Usuarios section |
| `lib/types.ts` | Add `is_admin` and `is_super_admin` to `Profile` interface |
