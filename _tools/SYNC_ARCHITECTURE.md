# Companion Study — User Accounts & Cloud Sync Architecture

**Phase 14 — Architecture Document (not shipping code)**

This document defines the architecture for user accounts, authentication, and cloud sync. Implementation requires Craig's decisions on the options presented below.

---

## 1. Recommended Stack

| Component | Recommendation | Why |
|-----------|---------------|-----|
| Auth | Supabase Auth | Open-source, PostgreSQL-native, Apple/Google/email built-in, generous free tier (50K MAU) |
| Backend | Supabase (hosted) | Managed Postgres, realtime subscriptions, row-level security, edge functions, no infra to maintain |
| Client SDK | `@supabase/supabase-js` | First-party React Native support, handles auth tokens, realtime, REST |

### Why not Firebase?

Firebase works but ties you to Google's ecosystem. Supabase gives you standard PostgreSQL (portable), open-source (no vendor lock-in), and a simpler mental model for a SQL-first app. CS already uses SQLite everywhere — PostgreSQL is a natural extension.

### Why not Clerk?

Clerk is auth-only (no database, no sync). You'd need a separate backend for data sync. Supabase bundles both.

---

## 2. Auth Flow

### Sign-up options (in priority order)

1. **Apple Sign-In** — Required by App Store if any social login is offered
2. **Google Sign-In** — Covers Android users who prefer social login
3. **Email + password** — Fallback for users who prefer traditional auth

No phone/SMS auth (adds cost and complexity for minimal value).

### Auth flow (high-level)

```
[App Launch]
  → Check Supabase session token in secure storage
  → Valid? → Proceed (background token refresh)
  → Expired/missing? → Show "Sign In" option (non-blocking)

[Sign In]
  → User taps Apple/Google/Email
  → Supabase Auth handles OAuth flow / email verification
  → On success: JWT stored in expo-secure-store
  → Trigger initial sync (merge local → cloud)

[Sign Out]
  → Clear session token
  → Local data stays intact (offline-first)
  → Stop background sync

[Account Deletion]
  → Supabase Auth deletes account
  → CASCADE deletes all cloud data
  → Local data stays (user can re-create account)
  → Required by App Store / Play Store policies
```

### Where auth surfaces in the UI

- **Settings screen**: "Sign In" / "Account" section
- **Not a gate**: The app is fully functional without an account. Sync is a premium feature, not a requirement.

---

## 3. Data Model — What Syncs

### Tables that sync (all from user.db)

| Table | Direction | Conflict strategy | Priority |
|-------|-----------|-------------------|----------|
| `user_notes` | Bidirectional | Last-write-wins by `updated_at` | P0 (core feature) |
| `study_collections` | Bidirectional | Last-write-wins by `updated_at` | P0 |
| `note_links` | Bidirectional | Last-write-wins by `created_at` | P0 |
| `reading_progress` | Bidirectional | Union merge (keep all completions) | P0 |
| `bookmarks` | Bidirectional | Last-write-wins by `created_at` | P1 |
| `verse_highlights` | Bidirectional | Last-write-wins by `created_at` | P1 |
| `user_preferences` | Bidirectional | Last-write-wins | P1 |
| `study_depth` | Upload only | Additive (no deletes) | P2 |
| `reading_streaks` | Upload only | Additive | P2 |

### Tables that do NOT sync

| Table | Reason |
|-------|--------|
| `reading_plans` | Content data, shipped with app |
| `plan_progress` | Derived from reading_progress |
| `notes_fts` | FTS index, rebuilt from user_notes |

### Cloud schema (Supabase PostgreSQL)

```sql
-- All tables include user_id for row-level security
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id INTEGER,            -- original SQLite rowid for mapping
  verse_ref TEXT NOT NULL,
  note_text TEXT NOT NULL,
  tags_json TEXT DEFAULT '[]',
  collection_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ        -- soft delete for sync
);

CREATE TABLE study_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id INTEGER,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#bfa050',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_note_id UUID NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  to_note_id UUID NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reading_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, book_id, chapter_num)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE verse_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE user_preferences (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

CREATE TABLE study_depth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  panel_type TEXT NOT NULL,
  first_opened_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_id, panel_type)
);
```

---

## 4. Sync Strategy — Offline-First with Background Push

### Core principle

**Local SQLite is always the source of truth for reads.** The cloud is a backup and cross-device sync layer. The app never blocks on network.

### Sync flow

```
[Write locally]
  → Update user.db immediately (UI reflects instantly)
  → Queue change in sync_queue table
  → If online: push to Supabase in background
  → If offline: queue persists, retried on reconnect

[Pull from cloud]
  → On app launch (if signed in): fetch changes since last_sync_at
  → Merge into user.db using conflict rules per table
  → Update last_sync_at

[Realtime (optional, P2)]
  → Supabase Realtime subscription for user's rows
  → Instant sync on second device when both are online
```

### Local sync infrastructure (new migration in user.db)

```sql
-- Migration 5: Sync infrastructure
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  operation TEXT NOT NULL,   -- 'INSERT' | 'UPDATE' | 'DELETE'
  payload_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  synced_at TEXT             -- NULL until pushed
);

CREATE TABLE sync_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Keys: 'last_sync_at', 'user_id', 'sync_enabled'
```

### Conflict resolution

| Strategy | Tables | Logic |
|----------|--------|-------|
| Last-write-wins | notes, collections, bookmarks, highlights, prefs | Compare `updated_at` timestamps; cloud wins ties |
| Union merge | reading_progress | If either side has `completed_at`, keep it. Never un-complete a chapter. |
| Additive only | study_depth, reading_streaks | Cloud accumulates; no deletes. |
| Soft delete | notes, collections, bookmarks, highlights | `deleted_at` timestamp instead of hard delete. Both sides honor soft deletes. |

---

## 5. Migration Path — First Sign-In

When a user signs in for the first time, they may have months of local data. This is the critical migration:

```
[First sign-in detected]
  1. Check cloud for existing data (returning user on new device?)
     → If cloud has data: two-way merge (union for progress, LWW for notes)
     → If cloud is empty: upload all local data

  2. Assign UUIDs to all local rows (add uuid column to user.db tables)

  3. Upload in batches:
     reading_progress → bulk INSERT (largest, most important)
     user_notes → INSERT with conflict handling
     bookmarks, highlights → INSERT
     preferences → INSERT
     study_depth → INSERT

  4. Set last_sync_at = now()
  5. Enable background sync
```

### ID mapping

Local SQLite uses INTEGER autoincrement IDs. Cloud uses UUIDs. The mapping is:
- Add `cloud_id TEXT` column to each synced user.db table (migration 5)
- On upload: generate UUID, store in `cloud_id`
- On download: match by `cloud_id`, or insert with new local rowid

---

## 6. Security Model

### Row-level security (RLS)

Every cloud table has RLS policies that restrict access to the authenticated user's own rows:

```sql
-- Example for user_notes
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own notes"
  ON user_notes
  USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own notes"
  ON user_notes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### Data isolation

- No user can read, write, or delete another user's data
- The app never stores or transmits other users' data
- JWT tokens are short-lived (1 hour) with automatic refresh
- Tokens stored in `expo-secure-store` (Keychain on iOS, Keystore on Android)

### Account deletion

- Supabase Auth delete triggers CASCADE on all user data
- Edge function handles cleanup of any orphaned data
- Compliant with App Store / Play Store deletion requirements
- Local data is NOT deleted (user's device, user's choice)

---

## 7. Cost Projections

### Supabase free tier

| Resource | Free limit | Sufficient for |
|----------|-----------|----------------|
| Monthly active users | 50,000 | Early growth |
| Database size | 500 MB | ~50K users with moderate notes |
| Bandwidth | 5 GB | ~50K users with sync |
| Edge function invocations | 500K/month | Auth + sync |
| Realtime connections | 200 concurrent | Adequate for initial launch |

### Projected costs by user base

| Users | DB size est. | Bandwidth est. | Monthly cost |
|-------|-------------|----------------|-------------|
| 1,000 | ~10 MB | ~200 MB | **$0** (free tier) |
| 10,000 | ~100 MB | ~2 GB | **$0** (free tier) |
| 50,000 | ~500 MB | ~10 GB | **$25/mo** (Pro plan) |
| 100,000 | ~1 GB | ~20 GB | **$25/mo** + usage (~$50 total) |

### Assumptions

- Average user: 10 notes, 100 chapters read, 5 bookmarks, 3 highlights
- Note size: ~200 bytes average
- Sync payload: ~2 KB per session
- Sync frequency: 1-2x per day per active user

### Break-even

At $25/mo Pro plan cost, you need ~25 paying users at $1/mo or ~3 users at $10/year to cover costs. This is easily achievable well before hitting 50K users.

---

## 8. Implementation Roadmap

### Session K-1: Auth setup

1. `npx expo install @supabase/supabase-js expo-secure-store expo-auth-session expo-web-browser`
2. Create Supabase project, configure Apple/Google OAuth
3. Create `app/src/services/supabase.ts` — client singleton
4. Create `app/src/services/auth.ts` — sign in/out/delete flows
5. Create `app/src/stores/authStore.ts` — Zustand store for auth state
6. Add "Account" section to Settings screen
7. Test: sign in with Apple → session persists across app restarts

### Session K-2: Cloud schema + sync engine

1. Run cloud schema SQL in Supabase dashboard
2. Enable RLS policies on all tables
3. user.db migration 5: add `cloud_id`, `sync_queue`, `sync_state` tables
4. Create `app/src/services/syncEngine.ts` — queue, push, pull, merge
5. Wire sync triggers into existing user.db write functions
6. Test: create note → appears in Supabase dashboard → install on second device → note appears

### Session K-3: First-sign-in migration + polish

1. Implement bulk upload for existing local data
2. Handle merge conflicts (returning user on new device)
3. Add sync status indicator (settings screen)
4. Add offline queue indicator
5. Test: user with 6 months of data signs in → all data appears in cloud → signs in on new device → data appears

---

## 9. Decisions Required From Craig

Before implementation can begin, these decisions need to be made:

| # | Decision | Recommendation | Notes |
|---|----------|---------------|-------|
| 1 | **Auth provider** | Supabase Auth | Bundled with backend, simplest path |
| 2 | **Backend** | Supabase (hosted) | Free tier covers early growth |
| 3 | **Social login providers** | Apple + Google + Email | Apple required by App Store |
| 4 | **Sync scope** | All user.db tables (P0 first, then P1/P2) | Start with notes + progress |
| 5 | **Conflict strategy** | Last-write-wins + union merge | Simple, predictable |
| 6 | **Premium gating** | Sync is premium (free users stay local-only) | Justifies subscription |
| 7 | **Pricing** | ~$1/mo or $10/year | Covers Supabase costs with margin |
| 8 | **Realtime sync** | Defer to v2 (use poll-on-launch for v1) | Reduces complexity |

Once these are confirmed, Session K can begin implementation.

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Supabase downtime | App works fully offline; sync retries on reconnect |
| Data loss during sync | Local SQLite is never deleted; cloud is backup |
| Merge conflicts | LWW is deterministic; no user-facing conflict UI needed |
| App Store rejection (missing Apple Sign-In) | Apple Sign-In is first provider implemented |
| Cost overrun | Free tier is generous; Pro plan at $25/mo is low risk |
| User with 10K+ notes (edge case) | Batch upload with progress indicator; paginated sync |
| Token expiration mid-sync | Supabase client auto-refreshes; sync retries on 401 |
