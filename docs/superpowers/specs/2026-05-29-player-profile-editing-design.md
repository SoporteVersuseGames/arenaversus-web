# Player Profile Editing — Design Spec

**Date:** 2026-05-29  
**Status:** Approved

---

## Goal

Improve the player profile editing experience with three additions:
1. "Editar perfil" button on the public profile page (visible only to the profile owner)
2. Username uniqueness validation with inline error messages in the dashboard form
3. Avatar image upload via Supabase Storage, displayed on profile and dashboard

---

## Architecture

Three files modified, one DB column added, one Supabase Storage bucket created.

No new pages or routes. Avatar upload happens during form submit alongside other profile fields.

---

## Prerequisites (Manual Setup Before Implementation)

1. **Supabase Storage bucket:** Create bucket named `avatars`, set to **public**. Enable RLS policy: `INSERT` and `UPDATE` allowed for `auth.uid() = (storage path prefix)::uuid`.
2. **DB column:** Add `avatar_url TEXT` (nullable, no default) to the `profiles` table via Supabase dashboard SQL editor:
   ```sql
   ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
   ```

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `lib/types.ts` | MODIFY | Add `avatar_url: string \| null` to Profile interface |
| `app/players/[username]/page.tsx` | MODIFY | Call `getUser()`, show edit button to owner, show avatar image |
| `app/dashboard/page.tsx` | MODIFY | Add avatar file input, username uniqueness check, error display |

---

## Section 1: Edit Button on Public Profile Page

**File:** `app/players/[username]/page.tsx`

- Call `supabase.auth.getUser()` to get the logged-in user (already a server component, `createClient()` is already imported)
- Compare `user?.id === profile.id` to determine ownership
- If owner: render a small `"✏️ Editar perfil"` button in the hero section (top-right corner), linking to `/dashboard`
- If not owner (or not logged in): render nothing

**Avatar display:** In the hero avatar circle, check `profile.avatar_url`:
- If set: `<img src={profile.avatar_url} alt={profile.username} className="w-20 h-20 rounded-full object-cover" />`
- If null: existing initial circle (unchanged)

---

## Section 2: Username Uniqueness Validation

**File:** `app/dashboard/page.tsx`

**State added:** `profileError: string | null` (initialized to `null`), set via `setProfileError`.

**Logic in `handleSaveProfile`:**

```
1. Get new username from form data
2. If username !== profile.username (user changed it):
   a. Query: SELECT id FROM profiles WHERE username = newUsername AND id != userId LIMIT 1
   b. If row found → setProfileError("Este username ya está en uso") → return early (no save)
3. Proceed with update
4. If update returns error → setProfileError(error.message)
5. On success → setProfileError(null), setSaveOk(true)
```

**UI:** Below the username input, render `{profileError && <p className="text-red-400 text-sm mt-1">{profileError}</p>}`.

---

## Section 3: Avatar Upload

**File:** `app/dashboard/page.tsx`

**File input:** Added above the nombre/apellido fields in the "Editar Perfil" form:
```
[ Avatar actual (img o inicial) ]  [ Botón "Cambiar foto" (file input) ]
```
- `<input type="file" name="avatar" accept="image/*" />`
- Shows current avatar (`profile.avatar_url` or initial circle) next to the input

**Upload logic in `handleSaveProfile`:**

```
1. Get file from form data: fd.get('avatar') as File
2. If file exists AND file.size > 0:
   a. Upload to Supabase Storage: supabase.storage.from('avatars').upload(`{userId}/avatar.{ext}`, file, { upsert: true })
   b. Get public URL: supabase.storage.from('avatars').getPublicUrl(`{userId}/avatar.{ext}`)
   c. Include avatar_url in profile update object
3. If no file: omit avatar_url from update (keep existing)
```

**File extension:** Derived from `file.name.split('.').pop()` — defaults to `jpg` if missing.

**Error handling:** If storage upload fails, `setProfileError` with the storage error message and return early (don't save profile).

**Avatar display in dashboard:** In sidebar and overview panel, check `profile?.avatar_url`:
- If set: `<img>` with `object-cover rounded-full`
- If null: existing initial circle

---

## Data Flow

```
User selects file + edits fields → clicks "Guardar"
  → check username uniqueness (if changed)
  → if file present: upload to storage → get URL
  → update profiles row (including avatar_url if uploaded)
  → setProfile() optimistic update
  → show success or error
```

---

## Out of Scope

- Avatar cropping or resizing
- File size validation (browser handles basic limits)
- Removing / clearing an existing avatar
- Avatar display in the leaderboard (clasificacion) or tournament pages
